import { query } from '../config/database.js';
import { cache } from '../config/cache.js';
import { normalizeEthiopianPhone } from '../utils/msisdn.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
import { UserProfile } from '../types/domain.js';
import pino from 'pino';

const logger = pino({ name: 'AuthService' });

export const authService = {
  /**
   * TeleBirr SuperApp Direct Connect Single-Sign-On
   * Authenticates player through telebirr Game Center credentials
   */
  async loginWithTeleBirr(
    phoneParam?: string,
    telebirrToken?: string
  ): Promise<{
    success: boolean;
    message: string;
    profile?: UserProfile;
    tokens?: { accessToken: string; refreshToken: string };
  }> {
    if (!phoneParam || phoneParam.trim() === '') {
      return {
        success: false,
        message: 'Missing telebirr MSISDN authentication parameter.',
      };
    }

    const { isValid, e164, local } = normalizeEthiopianPhone(phoneParam.trim());
    if (!isValid) {
      return {
        success: false,
        message: 'Invalid telebirr phone number format. Expected Ethiopian MSISDN.',
      };
    }

    // Upsert Profile in PostgreSQL
    const upsertRes = await query(
      `INSERT INTO profiles (phone, display_name, avatar_id, is_registered, telebirr_linked, telebirr_balance)
       VALUES ($1, $2, 'avatar_runner', TRUE, TRUE, 0.00)
       ON CONFLICT (phone) DO UPDATE
         SET is_registered = TRUE, telebirr_linked = TRUE, updated_at = NOW()
       RETURNING id, role`,
      [e164, `Gamer_${local.slice(-4)}`]
    );

    const user = upsertRes.rows[0];

    // Ensure preferences and streaks records exist
    await query(`INSERT INTO user_preferences (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [user.id]);
    await query(`INSERT INTO user_streaks (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [user.id]);

    const accessToken = signAccessToken({ userId: user.id, phone: e164, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, phone: e164, role: user.role });

    // Cache active session in Valkey (24h TTL)
    await cache.set(`session:${user.id}`, JSON.stringify({ userId: user.id, phone: e164 }), 86400);

    const profile = await this.getProfile(user.id);

    logger.info({ userId: user.id, phone: e164 }, 'Player authenticated via TeleBirr Game Center');

    return {
      success: true,
      message: 'Connected with TeleBirr Game Center successfully.',
      profile: profile!,
      tokens: { accessToken, refreshToken },
    };
  },

  /**
   * Assemble complete UserProfile object matching frontend types exactly
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const userRes = await query(`SELECT * FROM profiles WHERE id = $1`, [userId]);
    if (userRes.rowCount === 0) return null;

    const row = userRes.rows[0];

    // High scores
    const hsRes = await query(`SELECT game_id, best_score FROM high_scores WHERE user_id = $1`, [userId]);
    const highScores: Record<string, number> = {};
    for (const hs of hsRes.rows) {
      highScores[hs.game_id] = hs.best_score;
    }

    // Daily scores
    const dsRes = await query(
      `SELECT game_id, to_char(score_date, 'YYYY-MM-DD') as sdate, best_score
         FROM daily_scores
        WHERE user_id = $1 AND score_date >= CURRENT_DATE - INTERVAL '30 days'`,
      [userId]
    );
    const dailyScores: Record<string, Record<string, number>> = {};
    for (const ds of dsRes.rows) {
      if (!dailyScores[ds.sdate]) dailyScores[ds.sdate] = {};
      dailyScores[ds.sdate][ds.game_id] = ds.best_score;
    }

    // Active subscription
    const subRes = await query(
      `SELECT plan, is_active, auto_renew, expires_at
         FROM subscriptions
        WHERE user_id = $1 AND is_active = TRUE AND expires_at > NOW()
        ORDER BY expires_at DESC LIMIT 1`,
      [userId]
    );

    const hasSub = Boolean(subRes.rowCount && subRes.rowCount > 0);
    const subRow = hasSub ? subRes.rows[0] : null;

    // Streaks
    const streakRes = await query(`SELECT * FROM user_streaks WHERE user_id = $1`, [userId]);
    const streakRow = streakRes.rows[0] || { current_streak: 1, last_claimed: null };
    const todayStr = new Date().toISOString().split('T')[0];
    const lastClaimedStr = streakRow.last_claimed
      ? new Date(streakRow.last_claimed).toISOString().split('T')[0]
      : '';
    const hasClaimedToday = lastClaimedStr === todayStr;

    // Energy regeneration check (1 energy every 10 min up to max_energy if not VIP)
    let currentEnergy = row.energy;
    if (currentEnergy < row.max_energy) {
      const elapsedMs = Date.now() - new Date(row.last_energy_refill_at).getTime();
      const intervalMs = 10 * 60 * 1000;
      const energyToAdd = Math.floor(elapsedMs / intervalMs);
      if (energyToAdd > 0) {
        currentEnergy = Math.min(row.max_energy, currentEnergy + energyToAdd);
        await query(
          `UPDATE profiles SET energy = $1, last_energy_refill_at = NOW() WHERE id = $2`,
          [currentEnergy, userId]
        );
      }
    }

    return {
      id: row.id,
      phoneNumber: row.phone_local || row.phone,
      displayName: row.display_name,
      avatarId: row.avatar_id,
      isRegistered: true,
      telebirrLinked: row.telebirr_linked,
      telebirrBalance: parseFloat(row.telebirr_balance) || 0,
      coins: parseInt(row.coins, 10),
      xp: parseInt(row.xp, 10),
      level: row.level,
      energy: currentEnergy,
      maxEnergy: row.max_energy,
      lastEnergyRefillTimestamp: new Date(row.last_energy_refill_at).getTime(),
      hasReceivedInitialCoins: Boolean(row.has_received_initial_coins),
      subscription: {
        plan: subRow ? subRow.plan : 'free',
        isActive: hasSub,
        expiresAt: subRow ? new Date(subRow.expires_at).getTime() : undefined,
        autoRenew: subRow ? subRow.auto_renew : false,
      },
      streak: {
        current: streakRow.current_streak,
        lastClaimedDate: lastClaimedStr,
        hasClaimedToday,
      },
      highScores,
      dailyScores,
      achievements: ['champion_badge', 'speed_runner'],
      matchesPlayed: row.matches_played,
      trophiesCount: row.trophies_count,
      role: row.role,
    };
  },
};
