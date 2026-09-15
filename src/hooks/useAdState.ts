/**
 * Hook for managing AdMob ads lifecycle in GAMEON TELE
 */

import { useState, useCallback } from "react";
import { RewardedAdState, InterstitialAdState, UserProfile, ToastMessage, EnergyTransaction } from "../types";
import { AdMobService } from "../services/adMobService";
import { StorageService } from "../services/storageService";

interface UseAdStateParams {
  setProfile: (updater: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  showToast: (type: ToastMessage["type"], title: string, description?: string) => void;
  refreshEnergyTransactions: () => void;
}

export function useAdState({ setProfile, showToast, refreshEnergyTransactions }: UseAdStateParams) {
  const [rewardedAdState, setRewardedAdState] = useState<RewardedAdState>({
    isOpen: false,
    adId: "",
    brand: "",
    durationSeconds: 5,
    rewardType: "energy",
    rewardAmount: 2,
    onRewardClaimed: () => {},
  });

  const [interstitialAdState, setInterstitialAdState] = useState<InterstitialAdState>({
    isOpen: false,
    adId: "",
    brand: "",
    durationSeconds: 3,
    onAdClosed: () => {},
  });

  const triggerRewardedAd = useCallback(
    (
      rewardType: "energy" | "coins" = "energy",
      rewardAmount: number = 2,
      onSuccess: () => void = () => {}
    ) => {
      const offer = AdMobService.getRandomRewardedOffer(rewardType);
      setRewardedAdState({
        isOpen: true,
        adId: offer.id,
        brand: offer.brand,
        durationSeconds: 5,
        rewardType,
        rewardAmount,
        onRewardClaimed: () => {
          onSuccess();
          setRewardedAdState((s) => ({ ...s, isOpen: false }));
          if (rewardType === "energy") {
            setProfile((curr) => {
              const nextEnergy = Math.min(curr.maxEnergy, curr.energy + rewardAmount);
              return { ...curr, energy: nextEnergy };
            });
            const tx: EnergyTransaction = {
              transactionId: "ETX_AD_" + Date.now().toString(36).toUpperCase(),
              type: "REWARDED_AD_BONUS",
              amount: rewardAmount,
              timestamp: new Date().toISOString(),
              status: "COMPLETED",
              details: "Rewarded Ad Sponsor Bonus",
            };
            StorageService.recordEnergyTransaction(tx);
            refreshEnergyTransactions();
            showToast("energy", `+${rewardAmount} Energy Restored`, "EthioTelecom sponsored boost granted!");
          } else if (rewardType === "coins") {
            setProfile((curr) => ({ ...curr, coins: curr.coins + rewardAmount }));
            showToast("success", `+${rewardAmount} Coins Claimed!`, "Reward successfully deposited.");
          }
        },
      });
    },
    [setProfile, showToast, refreshEnergyTransactions]
  );

  return {
    rewardedAdState,
    setRewardedAdState,
    interstitialAdState,
    setInterstitialAdState,
    triggerRewardedAd,
  };
}
