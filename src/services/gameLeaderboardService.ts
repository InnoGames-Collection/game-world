/**
 * GameON Tele - Game-Specific Leaderboard Engine
 * Provides independent, game-specific rankings, scores, and masked MSISDN top players.
 */

import { UserProfile } from '../types';
import { GameCatalog, CatalogGame } from './gameCatalog';

export interface GameLeaderboardEntry {
  rank: number;
  playerMasked: string;
  playerName: string;
  score: number;
  rewardText?: string;
  isCurrentUser?: boolean;
}

export interface GameLeaderboardResult {
  game: CatalogGame;
  entries: GameLeaderboardEntry[];
  userRank: number;
  userScore: number;
  totalParticipants: number;
}

// Seed mock players for deterministic realism per game
const SEED_PLAYERS = [
  { phone: '0911234567', name: 'Solomon T.' },
  { phone: '0922889900', name: 'Selamawit G.' },
  { phone: '0915667788', name: 'Dawit M.' },
  { phone: '0933112233', name: 'Bethlehem K.' },
  { phone: '0918990011', name: 'Yared A.' },
  { phone: '0920445566', name: 'Hiwot T.' },
  { phone: '0912778899', name: 'Kibrom Z.' },
  { phone: '0944332211', name: 'Tsion W.' },
  { phone: '0910556677', name: 'Ephrem B.' },
  { phone: '0927889922', name: 'Rahel D.' },
];

export const maskPhone = (phone?: string): string => {
  const digits = (phone || '0911428890').replace(/\D/g, '');
  if (digits.length >= 9) {
    const start = digits.slice(0, 3);
    const end = digits.slice(-3);
    return `${start}*****${end}`;
  }
  return '091*****890';
};

export interface UserGameStats {
  matchesPlayed: number;
  bestScore: number;
  bestLevel: number;
  totalPlaytimeSeconds: number;
  lastPlayedTimestamp: number;
}

export const GameLeaderboardService = {
  getGamesWithLeaderboards(): CatalogGame[] {
    return GameCatalog.getAll().filter((g) => g.leaderboardEnabled);
  },

  getUserStats(gameId: string, profile?: UserProfile): UserGameStats {
    let localSaved: Partial<UserGameStats> = {};
    try {
      const raw = localStorage.getItem(`teleplay_stats_${gameId}`);
      if (raw) localSaved = JSON.parse(raw);
    } catch {}

    const profileScore = profile?.highScores?.[gameId] || 0;
    const bestScore = Math.max(localSaved.bestScore || 0, profileScore);
    const matchesPlayed = Math.max(localSaved.matchesPlayed || (bestScore > 0 ? 1 : 0), 0);
    const bestLevel = Math.max(localSaved.bestLevel || 1, 1);
    const totalPlaytimeSeconds = localSaved.totalPlaytimeSeconds || (matchesPlayed * 90);
    const lastPlayedTimestamp = localSaved.lastPlayedTimestamp || Date.now();

    return {
      matchesPlayed,
      bestScore,
      bestLevel,
      totalPlaytimeSeconds,
      lastPlayedTimestamp,
    };
  },

  recordScore(gameId: string, score: number, playerName?: string, level?: number): { isNewBest: boolean; bestScore: number } {
    if (typeof window === 'undefined') return { isNewBest: false, bestScore: score };
    try {
      const currentStats = this.getUserStats(gameId);
      const isNewBest = score > currentStats.bestScore;
      const updatedBest = Math.max(currentStats.bestScore, score);
      const updatedLevel = Math.max(currentStats.bestLevel, level || 1);
      
      const newStats: UserGameStats = {
        matchesPlayed: currentStats.matchesPlayed + 1,
        bestScore: updatedBest,
        bestLevel: updatedLevel,
        totalPlaytimeSeconds: currentStats.totalPlaytimeSeconds + 60,
        lastPlayedTimestamp: Date.now(),
      };
      localStorage.setItem(`teleplay_stats_${gameId}`, JSON.stringify(newStats));
      localStorage.setItem(`teleplay_lb_${gameId}`, updatedBest.toString());

      return { isNewBest, bestScore: updatedBest };
    } catch {
      return { isNewBest: false, bestScore: score };
    }
  },

  getLeaderboardForGame(gameId: string, profile?: UserProfile): GameLeaderboardResult | null {
    const game = GameCatalog.getById(gameId);
    if (!game || !game.leaderboardEnabled) {
      return null;
    }

    const stats = this.getUserStats(gameId, profile);
    const userScore = stats.bestScore;

    // Generate base high score range based on game characteristics
    let topBaseScore = 400;
    if (gameId === 'helix-jump') topBaseScore = 480;
    else if (gameId === 'candy-blast') topBaseScore = 420;
    else if (gameId === 'world-legends') topBaseScore = 390;
    else if (gameId === 'moto-race') topBaseScore = 450;
    else if (gameId === 'fruit-slice') topBaseScore = 440;
    else if (gameId === 'puzzle-block') topBaseScore = 2450;
    else if (gameId === 'solitaire') topBaseScore = 780;
    else if (gameId === 'hill-rider') topBaseScore = 860;

    const entries: GameLeaderboardEntry[] = SEED_PLAYERS.map((player, idx) => {
      // Descending realistic scores
      const score = Math.max(150, topBaseScore - idx * 25 - (idx % 3) * 7);
      let rewardText: string | undefined;
      if (idx === 0) rewardText = '500 Coins';
      else if (idx === 1) rewardText = '300 Coins';
      else if (idx === 2) rewardText = '200 Coins';
      else if (idx < 5) rewardText = '100 Coins';

      return {
        rank: idx + 1,
        playerMasked: maskPhone(player.phone),
        playerName: player.name,
        score,
        rewardText,
        isCurrentUser: false,
      };
    });

    // Check where current user ranks
    let userRank = 14;
    for (let i = 0; i < entries.length; i++) {
      if (userScore >= entries[i].score) {
        userRank = i + 1;
        break;
      }
    }

    // If user is in top 10, splice into list
    if (userRank <= 10 && userScore > 0) {
      entries.splice(userRank - 1, 0, {
        rank: userRank,
        playerMasked: maskPhone(profile?.phoneNumber),
        playerName: profile?.displayName || 'You',
        score: userScore,
        rewardText: userRank <= 3 ? `${500 - (userRank - 1) * 150} Coins` : '100 Coins',
        isCurrentUser: true,
      });
      // Re-rank
      entries.pop(); // keep top 10
      entries.forEach((e, i) => {
        e.rank = i + 1;
      });
    }

    return {
      game,
      entries: entries.slice(0, 10),
      userRank: userScore > 0 ? userRank : 84,
      userScore,
      totalParticipants: 1850 + (game.playsCount % 500),
    };
  },
};
