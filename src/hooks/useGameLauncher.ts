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

      const isTournament = ['crazy-colors', 'fruit-slice', 'helix-jump', 'pop-piano'].includes(game.id);
      const tx: EnergyTransaction = {
        transactionId: "CTX_PLAY_" + Date.now().toString(36).toUpperCase(),
        type: "GAME_CONSUMPTION",
        amount: isTournament ? -2 : 0,
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

  /**
   * Request a new play session / try-again / restart inside an active game.
   * Free games return true immediately. Tournament games require and deduct 2 coins.
   */
  const requestSessionStart = useCallback(
    (game: GameDefinition): boolean => {
      const isTournament = ['crazy-colors', 'fruit-slice', 'helix-jump', 'pop-piano'].includes(game.id);
      if (!isTournament) {
        return true;
      }

      if ((profile.coins || 0) < 2) {
        setIsEnergyModalOpen(true);
        showToast(
          "warning",
          "Coins Required",
          `Tournament play / retry requires 2 Coins. Current balance: ${profile.coins || 0} Coins.`
        );
        return false;
      }

      const updated: UserProfile = {
        ...profile,
        coins: Math.max(0, (profile.coins || 0) - 2),
        matchesPlayed: (profile.matchesPlayed || 0) + 1,
      };
      StorageService.saveProfile(updated);
      setProfile(updated);

      const tx: EnergyTransaction = {
        transactionId: "CTX_REPLAY_" + Date.now().toString(36).toUpperCase(),
        type: "GAME_CONSUMPTION",
        amount: -2,
        timestamp: new Date().toISOString(),
        status: "COMPLETED",
        details: `Tournament Replay: ${game.title}`,
      };
      StorageService.recordEnergyTransaction(tx);
      refreshEnergyTransactions();
      return true;
    },
    [profile, setProfile, showToast, setIsEnergyModalOpen, refreshEnergyTransactions]
  );

  const handleGameFinished = useCallback(
    async (finalScore: number, durationSeconds: number) => {
      if (!activeGameToLaunch) return;

      const { result, updatedProfile, transaction } = await GameBridgeService.submitScore(
        activeGameToLaunch.id,
        finalScore,
        durationSeconds,
        profile,
        activeTournamentId
      );

      setProfile(updatedProfile);
      setLastGameSessionResult(result);

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
        const gold = result.goldEarned ?? Math.floor(result.score / 2);
        showToast("info", "Match Completed", `Earned +${gold} Gold and +${result.xpEarned} XP!`);
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
    requestSessionStart,
    handleGameFinished,
    closeGameLauncher,
  };
}
