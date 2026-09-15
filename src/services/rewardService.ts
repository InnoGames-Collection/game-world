/**
 * TelePlay Ethiopia Reward & Prize Disbursement Service
 * 
 * Handles:
 * 1. Claiming tournament and weekly prize winnings
 * 2. Direct TeleBirr wallet credit transfers
 * 3. Idempotent payout ledger tracking
 */

import { ClaimableReward, UserProfile } from '../types';
import { StorageService } from './storageService';
import { CompetitiveService } from './competitiveService';

const STORAGE_KEYS = {
  CLAIMABLE_REWARDS: 'teleplay_ethio_claimable_rewards_v1',
};

const DEFAULT_CLAIMABLE_REWARDS: ClaimableReward[] = [
  {
    id: 'rew_walia_01',
    tournamentId: 'tourney_weekly_candy_cup',
    gameTitle: 'Candy Blast Walia Cup',
    rank: 1,
    rewardText: '7,500 ETB TeleBirr Direct Transfer',
    amountETB: 7500,
    claimed: false,
    status: 'READY',
  },
  {
    id: 'rew_archery_02',
    tournamentId: 'tourney_weekly_archery_masters',
    gameTitle: 'Archery Strike National',
    rank: 3,
    rewardText: '3,000 ETB TeleBirr Cash',
    amountETB: 3000,
    claimed: true,
    claimedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    telebirrRef: 'TB_REF_8832941',
    status: 'DISBURSED',
  },
];

export const RewardService = {
  getClaimableRewards(): ClaimableReward[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CLAIMABLE_REWARDS);
      if (!stored) {
        this.saveClaimableRewards(DEFAULT_CLAIMABLE_REWARDS);
        return DEFAULT_CLAIMABLE_REWARDS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_CLAIMABLE_REWARDS;
    }
  },

  saveClaimableRewards(rewards: ClaimableReward[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLAIMABLE_REWARDS, JSON.stringify(rewards));
    } catch (e) {
      console.warn('[RewardService] Failed to save claimable rewards:', e);
    }
  },

  async claimReward(
    rewardId: string,
    profile: UserProfile
  ): Promise<{ success: boolean; message: string; updatedReward?: ClaimableReward; updatedProfile?: UserProfile }> {
    const all = this.getClaimableRewards();
    const target = all.find((r) => r.id === rewardId);

    if (!target) {
      return { success: false, message: 'Reward record not found.' };
    }

    if (target.claimed || target.status === 'DISBURSED') {
      return { success: false, message: 'This prize has already been disbursed to your TeleBirr account.' };
    }

    // Simulate TeleBirr payout gateway authorization
    await new Promise((r) => setTimeout(r, 800));

    const telebirrRef = 'TB_PAYOUT_' + Date.now().toString(36).toUpperCase();
    target.claimed = true;
    target.claimedAt = new Date().toISOString();
    target.telebirrRef = telebirrRef;
    target.status = 'DISBURSED';

    this.saveClaimableRewards(all);

    // Credit user's TeleBirr wallet
    const updatedProfile: UserProfile = {
      ...profile,
      telebirrBalance: Number((profile.telebirrBalance + target.amountETB).toFixed(2)),
      coins: profile.coins + 500,
    };
    StorageService.saveProfile(updatedProfile);

    // Also record in competitive service audit logs
    CompetitiveService.createRewardTransaction({
      userId: profile.id,
      msisdnMasked: profile.phoneNumber ? profile.phoneNumber.slice(0, 7) + '***' : '+251 91 **** 000',
      gameId: target.tournamentId || 'championship',
      gameTitle: target.gameTitle,
      tournamentId: target.tournamentId,
      score: 25000,
      rank: target.rank,
      reward: target.rewardText,
      rewardETB: target.amountETB,
      rewardCoins: 500,
      verificationSource: 'SERVER_AUTHORITATIVE',
      status: 'DISBURSED',
    });

    return {
      success: true,
      message: `Disbursed ${target.amountETB.toLocaleString()} ETB to your TeleBirr wallet! Reference: ${telebirrRef}`,
      updatedReward: target,
      updatedProfile,
    };
  },
};
