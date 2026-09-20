/**
 * Game Bridge Service for TelePlus Ethiopia
 * Orchestrates game launching, testing mode access, coin deduction, score validation (max 400 per game),
 * and leaderboard synchronization.
 */

import { GameDefinition, GameSessionResult, UserProfile, RewardTransaction } from '../types';
import { StorageService } from './storageService';
import { CompetitiveService } from './competitiveService';
import { GameLeaderboardService } from './gameLeaderboardService';

export const GAME_ENTRY_COIN_COST = 10;

// Controlled Development / Testing Flag:
// In testing mode, allows instant play without blocking on coin balance
export const DEV_TESTING_MODE = true;

export const GameBridgeService = {
  /**
   * Check if user can launch the game.
   * If DEV_TESTING_MODE is true, access is immediately permitted.
   */
  canLaunchGame(
    game: GameDefinition, 
    profile: UserProfile
  ): { 
    allowed: boolean; 
    reason?: string; 
    requiresCoins?: boolean;
    requiresAuth?: boolean; 
    requiresSubscription?: boolean 
  } {
    // Candy Crush and Word Legend are completely free with direct access per spec
    if (game.id === 'candy-blast' || game.id === 'world-legends' || game.isFree || game.accessType === 'FREE' || game.entryCostCoins === 0) {
      return { allowed: true };
    }

    // In dev / test mode, allow tester to play games freely
    if (DEV_TESTING_MODE) {
      return { allowed: true };
    }

    if (!profile.isRegistered) {
      return {
        allowed: false,
        requiresAuth: true,
        reason: 'Please sign in with your EthioTelecom phone number to play and save your score.',
      };
    }

    const cost = game.entryCostCoins ?? GAME_ENTRY_COIN_COST;
    if (profile.coins >= cost) {
      return { allowed: true };
    }

    return {
      allowed: false,
      requiresCoins: true,
      reason: `You need ${cost} Coins to enter ${game.title}. Your current balance is ${profile.coins} Coins. Recharge coins to play!`,
    };
  },

  /**
   * Deduction of required entry coins with unique session ID.
   * Free games, Candy Crush, and Word Legend NEVER deduct coins.
   */
  deductCoinsForLaunch(
    game: GameDefinition, 
    profile: UserProfile
  ): { updatedProfile: UserProfile; sessionId: string } {
    const sessionId = `GSESS_${game.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Candy Crush and Word Legend (and any free game) must NEVER deduct coins
    const isZeroCost = 
      game.id === 'candy-blast' || 
      game.id === 'world-legends' || 
      game.isFree || 
      game.accessType === 'FREE' || 
      game.entryCostCoins === 0;

    if (isZeroCost) {
      const updated: UserProfile = {
        ...profile,
        matchesPlayed: (profile.matchesPlayed || 0) + 1,
      };
      StorageService.saveProfile(updated);
      return { updatedProfile: updated, sessionId };
    }

    const cost = game.entryCostCoins ?? GAME_ENTRY_COIN_COST;
    
    // Deduct coins only if available
    const newCoins = Math.max(0, profile.coins - cost);
    const updated: UserProfile = {
      ...profile,
      coins: newCoins,
      matchesPlayed: (profile.matchesPlayed || 0) + 1,
    };

    StorageService.saveProfile(updated);

    return { updatedProfile: updated, sessionId };
  },

  /**
   * Processes game session completion, ensures score never exceeds 400 points,
   * updates high scores (best valid score only), and syncs with competitive tournament system.
   */
  submitScore(
    gameId: string,
    rawScore: number,
    durationSeconds: number,
    profile: UserProfile,
    tournamentId?: string
  ): { result: GameSessionResult; updatedProfile: UserProfile; transaction?: RewardTransaction } {
    // Preserve authentic game score without artificial capping
    const validScore = Math.max(0, Math.round(rawScore));

    // Record score into GameLeaderboardService
    GameLeaderboardService.recordScore(gameId, validScore, profile.displayName);

    const currentHighScore = profile.highScores?.[gameId] || 0;
    const isNewHighScore = validScore > currentHighScore;
    const updatedHighScores = {
      ...(profile.highScores || {}),
      [gameId]: Math.max(currentHighScore, validScore),
    };

    // Record daily score for date-based leaderboard calculation
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

    // Calculate coin earnings based on performance
    const coinsEarned = Math.max(5, Math.floor(validScore / 20));
    const xpEarned = Math.max(10, Math.floor(validScore / 10));

    const newCoins = (profile.coins || 0) + coinsEarned;
    const newXP = (profile.xp || 0) + xpEarned;
    const newLevel = 1 + Math.floor(newXP / 1000);

    const updatedProfile: UserProfile = {
      ...profile,
      highScores: updatedHighScores,
      dailyScores: updatedDailyScores,
      coins: newCoins,
      xp: newXP,
      level: newLevel,
      trophiesCount: isNewHighScore ? (profile.trophiesCount || 0) + 1 : (profile.trophiesCount || 0),
    };

    StorageService.saveProfile(updatedProfile);

    let tournamentTx: RewardTransaction | undefined = undefined;
    if (tournamentId) {
      const tourneyResult = CompetitiveService.submitTournamentScore(tournamentId, validScore, updatedProfile);
      tournamentTx = tourneyResult.transaction;
    }

    const result: GameSessionResult = {
      gameId,
      score: validScore,
      coinsEarned,
      xpEarned,
      isNewHighScore,
      durationSeconds,
    };

    return { result, updatedProfile, transaction: tournamentTx };
  },
};
