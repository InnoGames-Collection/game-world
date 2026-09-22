/**
 * Game Bridge Service for telebirr Game Center
 * Orchestrates game launching, tournament coin validation (2 coins per tournament play),
 * score submission with server anti-cheat tokens, and leaderboard synchronization.
 */

import { GameDefinition, GameSessionResult, UserProfile, RewardTransaction } from '../types';
import { StorageService } from './storageService';
import { apiService } from './apiService';
import { GameLeaderboardService } from './gameLeaderboardService';

// The 4 official tournament games
export const TOURNAMENT_GAME_IDS = ['crazy-colors', 'fruit-slice', 'helix-jump', 'pop-piano'];
export const TOURNAMENT_PLAY_COIN_COST = 2; // 2 coins per play (10 ETB pack = 10 coins = 5 plays)

export const GameBridgeService = {
  /**
   * Check if user can launch the game.
   * All games are 100% FREE except the 4 tournament games when entered in tournament mode.
   */
  canLaunchGame(
    game: GameDefinition, 
    profile: UserProfile,
    isTournamentMode: boolean = false
  ): { 
    allowed: boolean; 
    reason?: string; 
    requiresCoins?: boolean;
    requiresAuth?: boolean; 
  } {
    const isTournament = isTournamentMode || TOURNAMENT_GAME_IDS.includes(game.id);

    // All non-tournament games are 100% FREE!
    if (!isTournament) {
      return { allowed: true };
    }

    // Tournament game check: 2 coins per play
    if (profile.coins >= TOURNAMENT_PLAY_COIN_COST) {
      return { allowed: true };
    }

    return {
      allowed: false,
      requiresCoins: true,
      reason: `Tournament play requires ${TOURNAMENT_PLAY_COIN_COST} Coins. Current balance: ${profile.coins} Coins. Purchase 10 coins for 10 ETB to play 5 matches!`,
    };
  },

  /**
   * Deduction of required entry coins with unique session ID.
   * Only tournament games deduct 2 coins per play.
   */
  deductCoinsForLaunch(
    game: GameDefinition, 
    profile: UserProfile,
    isTournamentMode: boolean = false
  ): { updatedProfile: UserProfile; sessionId: string } {
    const sessionId = `GSESS_${game.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const isTournament = isTournamentMode || TOURNAMENT_GAME_IDS.includes(game.id);

    if (!isTournament) {
      const updated: UserProfile = {
        ...profile,
        matchesPlayed: (profile.matchesPlayed || 0) + 1,
      };
      StorageService.saveProfile(updated);
      return { updatedProfile: updated, sessionId };
    }

    // Deduct 2 coins for tournament play
    const newCoins = Math.max(0, profile.coins - TOURNAMENT_PLAY_COIN_COST);
    const updated: UserProfile = {
      ...profile,
      coins: newCoins,
      matchesPlayed: (profile.matchesPlayed || 0) + 1,
    };

    StorageService.saveProfile(updated);
    return { updatedProfile: updated, sessionId };
  },

  /**
   * Processes game session completion and submits authoritative score to backend
   */
  async submitScore(
    gameId: string,
    rawScore: number,
    durationSeconds: number,
    profile: UserProfile,
    tournamentId?: string
  ): Promise<{ result: GameSessionResult; updatedProfile: UserProfile; transaction?: RewardTransaction }> {
    const validScore = Math.max(0, Math.round(rawScore));

    // Record score into local client leaderboard service
    GameLeaderboardService.recordScore(gameId, validScore, profile.displayName);

    // Submit authoritative score to backend Fastify server (which enforces anti-cheat tokens)
    let backendProfile: UserProfile | undefined;
    let tournamentTx: RewardTransaction | undefined;

    try {
      const serverRes = await apiService.submitScore(gameId, validScore, durationSeconds, tournamentId);
      if (serverRes?.updatedProfile) {
        backendProfile = serverRes.updatedProfile;
      }
    } catch (e) {
      console.warn('[GameBridge] Server score submission fallback to client cache:', e);
    }

    const currentHighScore = profile.highScores?.[gameId] || 0;
    const isNewHighScore = validScore > currentHighScore;

    const updatedHighScores = {
      ...(profile.highScores || {}),
      [gameId]: Math.max(currentHighScore, validScore),
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const existingDailyScores = profile.dailyScores || {};
    const todayGameScores = existingDailyScores[todayStr] || {};
    const updatedDailyScores = {
      ...existingDailyScores,
      [todayStr]: {
        ...todayGameScores,
        [gameId]: Math.max(todayGameScores[gameId] || 0, validScore),
      },
    };

    // Note: Coins are ONLY purchased via TeleBirr. Gameplay yields in-game Gold (points) and XP.
    const goldEarned = Math.max(10, Math.floor(validScore / 2));
    const xpEarned = Math.max(10, Math.floor(validScore / 10));

    const updatedProfile: UserProfile = backendProfile || {
      ...profile,
      highScores: updatedHighScores,
      dailyScores: updatedDailyScores,
      // Coins remain unchanged - only purchased via TeleBirr
      coins: profile.coins || 0,
      xp: (profile.xp || 0) + xpEarned,
      level: 1 + Math.floor(((profile.xp || 0) + xpEarned) / 1000),
      trophiesCount: isNewHighScore ? (profile.trophiesCount || 0) + 1 : (profile.trophiesCount || 0),
    };

    StorageService.saveProfile(updatedProfile);

    const result: GameSessionResult = {
      gameId,
      score: validScore,
      coinsEarned: 0,
      goldEarned,
      xpEarned,
      isNewHighScore,
      durationSeconds,
    };

    return { result, updatedProfile, transaction: tournamentTx };
  },
};
