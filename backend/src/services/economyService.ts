import { query } from '../config/database.js';
import { authService } from './authService.js';
import { UserProfile } from '../types/domain.js';

export const economyService = {
  async getWalletTransactions(userId: string, limit: number = 50, offset: number = 0) {
    const res = await query(
      `SELECT id, delta, reason, ref, balance_after, created_at
         FROM wallet_ledger
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return res.rows.map((r: any) => ({
      transactionId: `tx_w_${r.id}`,
      type: r.delta > 0 ? 'EARNED' : 'SPENT',
      amount: parseInt(r.delta, 10),
      description: r.reason,
      balanceAfter: parseInt(r.balance_after, 10),
      timestamp: r.created_at,
    }));
  },

  async getEnergyTransactions(userId: string, limit: number = 50) {
    const res = await query(
      `SELECT id, type, amount, status, details, created_at
         FROM energy_transactions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2`,
      [userId, limit]
    );

    return res.rows.map((r: any) => ({
      transactionId: `tx_e_${r.id}`,
      type: r.type,
      amount: r.amount,
      status: r.status,
      details: r.details,
      timestamp: r.created_at,
    }));
  },

  async claimDailyStreak(userId: string): Promise<{ success: boolean; message: string; profile: UserProfile }> {
    const streakRes = await query('SELECT * FROM user_streaks WHERE user_id = $1', [userId]);
    const streak = streakRes.rows[0] || { current_streak: 0, last_claimed: null };

    const todayStr = new Date().toISOString().split('T')[0];
    const lastClaimedStr = streak.last_claimed
      ? new Date(streak.last_claimed).toISOString().split('T')[0]
      : '';

    if (lastClaimedStr === todayStr) {
      const profile = (await authService.getProfile(userId))!;
      return {
        success: false,
        message: 'Daily streak reward already claimed for today! Come back tomorrow.',
        profile,
      };
    }

    // Streak progression
    let newStreak = (streak.current_streak || 0) + 1;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (lastClaimedStr && lastClaimedStr !== yesterday) {
      newStreak = 1; // reset streak if day was skipped
    }

    // Award coins (+50) and energy (+2)
    const coinAward = 50 + Math.min(newStreak * 10, 100);
    await query('SELECT apply_coins($1, $2, $3, $4)', [
      userId,
      coinAward,
      `Daily Streak Day ${newStreak}`,
      `Streak Claim ${todayStr}`,
    ]);

    await query('SELECT apply_energy($1, $2, $3, $4)', [
      userId,
      2,
      'DAILY_REWARD',
      `Streak Day ${newStreak}`,
    ]);

    await query(
      `UPDATE user_streaks
          SET current_streak = $1, last_claimed = CURRENT_DATE,
              longest_streak = GREATEST(longest_streak, $1)
        WHERE user_id = $2`,
      [newStreak, userId]
    );

    const profile = (await authService.getProfile(userId))!;

    return {
      success: true,
      message: `Day ${newStreak} streak claimed! +${coinAward} Coins and +2 Energy awarded.`,
      profile,
    };
  },
};
