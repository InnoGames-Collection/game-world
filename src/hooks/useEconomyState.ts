/**
 * Hook for managing economic transactions, streak rewards, and TeleBirr subscriptions
 */

import { useState, useCallback } from "react";
import {
  UserProfile,
  EnergyTransaction,
  ClaimableReward,
  SubscriptionPlan,
  ToastMessage,
} from "../types";
import { StorageService } from "../services/storageService";
import { RewardService } from "../services/rewardService";
import { PaymentService } from "../services/paymentService";
import { SubscriptionService } from "../services/subscriptionService";
import { AuthService } from "../services/authService";
import { DAILY_REWARD_LADDER } from "../services/demoData";

interface UseEconomyStateParams {
  profile: UserProfile;
  setProfile: (updater: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  showToast: (type: ToastMessage["type"], title: string, description?: string) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsSubscriptionModalOpen: (open: boolean) => void;
  setIsEnergyModalOpen: (open: boolean) => void;
}

export function useEconomyState({
  profile,
  setProfile,
  showToast,
  setIsAuthModalOpen,
  setIsSubscriptionModalOpen,
  setIsEnergyModalOpen,
}: UseEconomyStateParams) {
  const [energyTransactions, setEnergyTransactions] = useState<EnergyTransaction[]>(() =>
    StorageService.getEnergyTransactions()
  );
  const [claimableRewards, setClaimableRewards] = useState<ClaimableReward[]>(() =>
    RewardService.getClaimableRewards()
  );

  const refreshEnergyTransactions = useCallback(() => {
    setEnergyTransactions(StorageService.getEnergyTransactions());
  }, []);

  const purchaseEnergyPackage = useCallback(
    async (energyAmount: number, costETB: number): Promise<{ success: boolean; message: string }> => {
      if (!profile.isRegistered || !profile.telebirrLinked) {
        setIsAuthModalOpen(true);
        return { success: false, message: "Please sign in with your EthioTelecom phone number to pay via TeleBirr." };
      }

      const payResult = await PaymentService.processPayment(profile, {
        method: "TELEBIRR",
        amountETB: costETB,
        itemType: "ENERGY_PACK",
        itemTitle: `${energyAmount} Energy Points Pack`,
      });

      if (payResult.status === "SUCCESS") {
        const updated: UserProfile = {
          ...profile,
          telebirrBalance: Number((profile.telebirrBalance - costETB).toFixed(2)),
          energy: profile.energy + energyAmount,
          maxEnergy: Math.max(profile.maxEnergy, profile.energy + energyAmount),
          lastEnergyRefillTimestamp: Date.now(),
        };

        setProfile(updated);

        const energyTx: EnergyTransaction = {
          transactionId: payResult.transaction.transactionId,
          type: "PURCHASE_TELEBIRR",
          amount: energyAmount,
          timestamp: new Date().toISOString(),
          status: "COMPLETED",
          details: `TeleBirr Purchase (${costETB} ETB)`,
        };
        StorageService.recordEnergyTransaction(energyTx);
        refreshEnergyTransactions();

        showToast("success", `+${energyAmount} Energy Added!`, `Charged ${costETB} ETB via TeleBirr.`);
        return { success: true, message: `Successfully purchased ${energyAmount} Energy for ${costETB} ETB.` };
      } else {
        showToast("error", "Payment Failed", payResult.message);
        return { success: false, message: payResult.message };
      }
    },
    [profile, setProfile, showToast, setIsAuthModalOpen, refreshEnergyTransactions]
  );

  const refillEnergyViaTelebirr = useCallback(() => {
    purchaseEnergyPackage(10, 3.0);
    setIsEnergyModalOpen(false);
  }, [purchaseEnergyPackage, setIsEnergyModalOpen]);

  const claimDailyStreak = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (profile.streak.hasClaimedToday && profile.streak.lastClaimedDate === today) {
      showToast("info", "Already Claimed", "Come back tomorrow for the next streak bonus!");
      return;
    }

    const streakIndex = (profile.streak.current - 1) % DAILY_REWARD_LADDER.length;
    const reward = DAILY_REWARD_LADDER[streakIndex];

    const newCoins = profile.coins + reward.coins;
    const newEnergy = Math.min(profile.maxEnergy, profile.energy + reward.energy);
    const nextStreak = profile.streak.current + 1;

    const updated: UserProfile = {
      ...profile,
      coins: newCoins,
      energy: newEnergy,
      streak: {
        current: nextStreak,
        lastClaimedDate: today,
        hasClaimedToday: true,
      },
    };

    setProfile(updated);

    if (reward.energy > 0) {
      const tx: EnergyTransaction = {
        transactionId: "ETX_STREAK_" + Date.now().toString(36).toUpperCase(),
        type: "DAILY_REWARD",
        amount: reward.energy,
        timestamp: new Date().toISOString(),
        status: "COMPLETED",
        details: `Day ${reward.day} Streak Bonus`,
      };
      StorageService.recordEnergyTransaction(tx);
      refreshEnergyTransactions();
    }

    showToast("success", `Day ${reward.day} Streak Claimed!`, `+${reward.coins} Coins & +${reward.energy} Energy added.`);
  }, [profile, setProfile, showToast, refreshEnergyTransactions]);

  const handleClaimReward = useCallback(
    async (rewardId: string) => {
      const res = await RewardService.claimReward(rewardId, profile);
      if (res.success && res.updatedProfile) {
        setProfile(res.updatedProfile);
        setClaimableRewards(RewardService.getClaimableRewards());
        showToast("success", "🏆 TeleBirr Prize Disbursed!", res.message);
      } else {
        showToast("error", "Claim Failed", res.message);
      }
    },
    [profile, setProfile, showToast]
  );

  const handleSubscribe = useCallback(
    async (plan: SubscriptionPlan) => {
      const res = await SubscriptionService.subscribe(plan);
      if (res.success && res.profile) {
        setProfile(res.profile);
        setIsSubscriptionModalOpen(false);
        showToast("success", "VIP Activated", res.message);
      } else {
        showToast("error", "Subscription Failed", res.message);
      }
    },
    [setProfile, setIsSubscriptionModalOpen, showToast]
  );

  const resetDemoState = useCallback(() => {
    const reset = StorageService.resetDemoState();
    setProfile(reset);
    refreshEnergyTransactions();
    setClaimableRewards(RewardService.getClaimableRewards());
    showToast("info", "Demo Data Reset", "Restored initial sample EthioTelecom user and high scores.");
  }, [setProfile, refreshEnergyTransactions, showToast]);

  const wipeAccountData = useCallback(() => {
    const freshGuest = StorageService.wipeAllData();
    setProfile(freshGuest);
    setEnergyTransactions([]);
    setClaimableRewards([]);
    showToast("info", "Account Erased", "All local credentials, ledgers and match histories wiped.");
  }, [setProfile, showToast]);

  const signOut = useCallback(() => {
    const guest = AuthService.signOut();
    setProfile(guest);
    showToast("info", "Signed Out", "You are now playing in Guest mode.");
  }, [setProfile, showToast]);

  return {
    energyTransactions,
    claimableRewards,
    refreshEnergyTransactions,
    purchaseEnergyPackage,
    refillEnergyViaTelebirr,
    claimDailyStreak,
    handleClaimReward,
    handleSubscribe,
    resetDemoState,
    wipeAccountData,
    signOut,
  };
}
