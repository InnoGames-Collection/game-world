import { query } from '../config/database.js';
import { telebirrService } from './telebirrService.js';
import { authService } from './authService.js';
import { RewardTransaction, UserProfile } from '../types/domain.js';
import pino from 'pino';

const logger = pino({ name: 'RewardService' });

export const rewardService = {
  async getClaimableRewards(userId: string): Promise<RewardTransaction[]> {
    const res = await query(
      `SELECT * FROM reward_transactions
        WHERE user_id = $1
        ORDER BY created_at DESC`,
      [userId]
    );

    return res.rows.map((r: any) => ({
      id: r.id,
      idempotencyKey: r.idempotency_key,
      userId: r.user_id,
      msisdnMasked: r.msisdn_masked,
      gameId: r.game_id,
      gameTitle: r.game_title,
      tournamentId: r.tournament_id,
      score: r.score,
      rank: r.rank,
      reward: r.reward,
      rewardETB: parseFloat(r.reward_etb) || 0,
      rewardCoins: parseInt(r.reward_coins, 10) || 0,
      timestamp: r.created_at,
      status: r.status,
      verificationSource: r.verification_source,
      auditHash: r.audit_hash,
    }));
  },

  async claimReward(
    userId: string,
    rewardId: string
  ): Promise<{ success: boolean; message: string; updatedProfile?: UserProfile; telebirrRef?: string }> {
    const rRes = await query('SELECT * FROM reward_transactions WHERE id = $1 AND user_id = $2', [rewardId, userId]);
    if (rRes.rowCount === 0) {
      return { success: false, message: 'Reward record not found' };
    }

    const reward = rRes.rows[0];
    if (reward.status === 'DISBURSED') {
      const profile = (await authService.getProfile(userId))!;
      return {
        success: true,
        message: 'Reward has already been disbursed to your TeleBirr wallet (idempotent).',
        updatedProfile: profile,
        telebirrRef: reward.telebirr_ref,
      };
    }

    const pRes = await query('SELECT phone, telebirr_balance FROM profiles WHERE id = $1', [userId]);
    const phone = pRes.rows[0]?.phone || '';

    // Disburse via TeleBirr B2C
    const amountETB = parseFloat(reward.reward_etb) || 0;
    const disburseRes = await telebirrService.disburseReward(phone, amountETB, rewardId);

    // Update reward record
    await query(
      `UPDATE reward_transactions
          SET status = 'DISBURSED', disbursed_at = NOW(), telebirr_ref = $1
        WHERE id = $2`,
      [disburseRes.ref || 'TB-DISB', rewardId]
    );

    // Update TeleBirr cached balance on profile
    if (amountETB > 0) {
      await query(
        `UPDATE profiles SET telebirr_balance = telebirr_balance + $1 WHERE id = $2`,
        [amountETB, userId]
      );
    }

    // Credit coins if any
    const rewardCoins = parseInt(reward.reward_coins, 10) || 0;
    if (rewardCoins > 0) {
      await query('SELECT apply_coins($1, $2, $3, $4)', [
        userId,
        rewardCoins,
        `Tournament Prize: ${reward.game_title}`,
        rewardId,
      ]);
    }

    const updatedProfile = (await authService.getProfile(userId))!;

    return {
      success: true,
      message: `Reward of ${amountETB} ETB disbursed directly to your TeleBirr wallet!`,
      updatedProfile,
      telebirrRef: disburseRes.ref,
    };
  },
};
