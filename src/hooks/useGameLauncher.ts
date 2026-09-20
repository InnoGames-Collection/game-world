/**
 * Hook for managing Game Launching, Entitlements, and Session Score submission
 */

import { useState, useCallback } from "react";
import { GameDefinition, GameSessionResult, UserProfile, ToastMessage, EnergyTransaction } from "../types";
import { GameBridgeService } from "../services/gameBridge";
import { StorageService } from "../services/storageService";
import { apiService } from "../services/apiService";

interface UseGameLauncherParams {
  profile: UserProfile;
  setProfile: (updater: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  showToast: (type: ToastMessage["type"], title: string, description?: string) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsEnergyModalOpen: (open: boolean) => void;
  setIsSubscriptionModalOpen: (open: boolean) => void;
  refreshEnergyTransactions: () => void;
}

export function useGameLauncher({
  profile,
  setProfile,
  showToast,
  setIsAuthModalOpen,
  setIsEnergyModalOpen,
  setIsSubscriptionModalOpen,
  refreshEnergyTransactions,
}: UseGameLauncherParams) {
  const [activeGameToLaunch, setActiveGameToLaunch] = useState<GameDefinition | null>(null);
  const [activeTournamentId, setActiveTournamentId] = useState<string | undefined>(undefined);
  const [lastGameSessionResult, setLastGameSessionResult] = useState<GameSessionResult | null>(null);

  const launchGame = useCallback(
    (game: GameDefinition, tournamentId?: string) => {
      const check = GameBridgeService.canLaunchGame(game, profile);
      if (!check.allowed) {
        if (check.requiresAuth) {
          setIsAuthModalOpen(true);
        } else if (check.requiresCoins) {
          setIsEnergyModalOpen(true);
        } else if (check.requiresSubscription) {
          setIsSubscriptionModalOpen(true);
        }
        showToast("warning", "Action Needed", check.reason);
        return;
      }

      const { updatedProfile } = GameBridgeService.deductCoinsForLaunch(game, profile);
      setProfile(updatedProfile);

      const tx: EnergyTransaction = {
        transactionId: "CTX_PLAY_" + Date.now().toString(36).toUpperCase(),
        type: "GAME_CONSUMPTION",
        amount: -(game.entryCostCoins || 10),
        timestamp: new Date().toISOString(),
        status: "COMPLETED",
        details: `Match Entry: ${game.title}`,
      };
      StorageService.recordEnergyTransaction(tx);
      refreshEnergyTransactions();

      setActiveGameToLaunch(game);
      setActiveTournamentId(tournamentId);
      setLastGameSessionResult(null);
    },
    [profile, setProfile, showToast, setIsAuthModalOpen, setIsEnergyModalOpen, setIsSubscriptionModalOpen, refreshEnergyTransactions]
  );

  const handleGameFinished = useCallback(
    (finalScore: number, durationSeconds: number) => {
      if (!activeGameToLaunch) return;

      const { result, updatedProfile, transaction } = GameBridgeService.submitScore(
        activeGameToLaunch.id,
        finalScore,
        durationSeconds,
        profile,
        activeTournamentId
      );

      setProfile(updatedProfile);
      setLastGameSessionResult(result);

      // Synchronize score authoritative verification with live PostgreSQL database
      apiService.submitScore(
        activeGameToLaunch.id,
        finalScore,
        durationSeconds,
        activeTournamentId
      ).catch(() => null);

      if (transaction) {
        showToast(
          "success",
          "🏆 Tournament Score Confirmed!",
          `Rank #${transaction.rank} verified! Prize: ${transaction.reward}`
        );
      } else if (result.isNewHighScore) {
        showToast(
          "success",
          "New High Score!",
          `You set a new personal record of ${result.score.toLocaleString()} in ${activeGameToLaunch.title}!`
        );
      } else {
        showToast("info", "Match Completed", `Earned +${result.coinsEarned} Coins and +${result.xpEarned} XP!`);
      }
    },
    [activeGameToLaunch, activeTournamentId, profile, setProfile, showToast]
  );

  const closeGameLauncher = useCallback(() => {
    setActiveGameToLaunch(null);
    setActiveTournamentId(undefined);
    setLastGameSessionResult(null);
  }, []);

  return {
    activeGameToLaunch,
    activeTournamentId,
    lastGameSessionResult,
    launchGame,
    handleGameFinished,
    closeGameLauncher,
  };
}
