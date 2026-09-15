/**
 * Central State Orchestrator Hook for GAMEON TELE (TelePlay Ethiopia)
 * Composes specialized modular hooks into a cohesive enterprise architecture:
 * - Profile & Energy Lifecycle (useProfileState)
 * - Preferences & Localization (useUserSettings)
 * - Modals & Sheets (useModalState)
 * - Toasts & Notifications (useToastNotification)
 * - AdMob Ads Lifecycle (useAdState)
 * - Game Launcher & Entitlements (useGameLauncher)
 * - Economy & Subscriptions (useEconomyState)
 */

import { useState } from "react";
import { NavigationTab } from "../types";
import { useProfileState } from "./useProfileState";
import { useUserSettings } from "./useUserSettings";
import { useModalState } from "./useModalState";
import { useToastNotification } from "./useToastNotification";
import { useAdState } from "./useAdState";
import { useGameLauncher } from "./useGameLauncher";
import { useEconomyState } from "./useEconomyState";

export function usePortalState() {
  const [activeTab, setActiveTab] = useState<NavigationTab>("home");

  // 1. Core Profile & Energy
  const { profile, setProfile } = useProfileState();

  // 2. Settings & Localization
  const {
    language,
    changeLanguage,
    t,
    audioEnabled,
    toggleAudio,
    hapticsEnabled,
    toggleHaptics,
    notifsEnabled,
    toggleNotifs,
    lowDataMode,
    toggleLowDataMode,
  } = useUserSettings();

  // 3. Toasts
  const { toasts, showToast, dismissToast } = useToastNotification();

  // 4. Modals
  const {
    isEnergyModalOpen,
    setIsEnergyModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    isDailyRewardModalOpen,
    setIsDailyRewardModalOpen,
    selectedTournament,
    setSelectedTournament,
    isLegalModalOpen,
    setIsLegalModalOpen,
    legalModalTab,
    openLegalModal,
  } = useModalState();

  // 5. Economy & Transactions
  const {
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
  } = useEconomyState({
    profile,
    setProfile,
    showToast,
    setIsAuthModalOpen,
    setIsSubscriptionModalOpen,
    setIsEnergyModalOpen,
  });

  // 6. AdMob Ads Lifecycle
  const {
    rewardedAdState,
    setRewardedAdState,
    interstitialAdState,
    setInterstitialAdState,
    triggerRewardedAd,
  } = useAdState({
    setProfile,
    showToast,
    refreshEnergyTransactions,
  });

  // 7. Game Launching & Entitlements
  const {
    activeGameToLaunch,
    activeTournamentId,
    lastGameSessionResult,
    launchGame,
    handleGameFinished,
    closeGameLauncher,
  } = useGameLauncher({
    profile,
    setProfile,
    showToast,
    setIsAuthModalOpen,
    setIsEnergyModalOpen,
    setIsSubscriptionModalOpen,
    refreshEnergyTransactions,
  });

  return {
    // Navigation & View
    activeTab,
    setActiveTab,

    // User Profile
    profile,
    setProfile,

    // Localization & Dictionary
    language,
    changeLanguage,
    t,

    // Game Launcher State & Actions
    activeGameToLaunch,
    activeTournamentId,
    lastGameSessionResult,
    launchGame,
    closeGameLauncher,
    handleGameFinished,

    // Modals
    isEnergyModalOpen,
    setIsEnergyModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    isDailyRewardModalOpen,
    setIsDailyRewardModalOpen,
    selectedTournament,
    setSelectedTournament,
    isLegalModalOpen,
    setIsLegalModalOpen,
    legalModalTab,
    openLegalModal,

    // AdMob State
    rewardedAdState,
    setRewardedAdState,
    interstitialAdState,
    setInterstitialAdState,
    triggerRewardedAd,

    // Economy & Ledgers
    energyTransactions,
    claimableRewards,
    handleClaimReward,
    purchaseEnergyPackage,
    refillEnergyViaTelebirr,
    claimDailyStreak,
    handleSubscribe,
    resetDemoState,
    wipeAccountData,
    signOut,

    // Preferences & Settings
    audioEnabled,
    toggleAudio,
    hapticsEnabled,
    toggleHaptics,
    notifsEnabled,
    toggleNotifs,
    lowDataMode,
    toggleLowDataMode,

    // Toasts
    toasts,
    showToast,
    dismissToast,
  };
}
