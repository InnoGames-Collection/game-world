/**
 * Color Rush - Competitive Tiered Leaderboard Engine
 * 
 * Provides realistic, highly differentiated player data across
 * GLOBAL, WEEKLY, MONTHLY, and MY RANK tabs.
 * Dynamically inserts and ranks the current player based on their real cumulative score.
 */

import { LeaderboardEntry } from './types';

// Diverse set of competitive players with natural score distribution
const BASE_COMPETITORS: Omit<LeaderboardEntry, 'rank' | 'movement'>[] = [
  { id: 'cr_bot_1', name: 'Yared M. (Apex)', avatar: '⚡', totalScore: 8450, highestLevel: 40, bestScore: 385, streak: 28 },
  { id: 'cr_bot_2', name: 'Selamawit B.', avatar: '🎯', totalScore: 7890, highestLevel: 39, bestScore: 370, streak: 24 },
  { id: 'cr_bot_3', name: 'Dawit Chroma', avatar: '🔥', totalScore: 7320, highestLevel: 37, bestScore: 355, streak: 19 },
  { id: 'cr_bot_4', name: 'Meron_Fast', avatar: '💎', totalScore: 6810, highestLevel: 36, bestScore: 340, streak: 22 },
  { id: 'cr_bot_5', name: 'Kidus Tsegaye', avatar: '🌟', totalScore: 6340, highestLevel: 34, bestScore: 332, streak: 16 },
  { id: 'cr_bot_6', name: 'Helen G.', avatar: '🚀', totalScore: 5920, highestLevel: 32, bestScore: 315, streak: 14 },
  { id: 'cr_bot_7', name: 'Natnael Reflex', avatar: '👑', totalScore: 5490, highestLevel: 30, bestScore: 305, streak: 18 },
  { id: 'cr_bot_8', name: 'Bethlehem K.', avatar: '⚡', totalScore: 5040, highestLevel: 28, bestScore: 290, streak: 12 },
  { id: 'cr_bot_9', name: 'Abel Spectrum', avatar: '🎨', totalScore: 4620, highestLevel: 26, bestScore: 282, streak: 15 },
  { id: 'cr_bot_10', name: 'Tigist A.', avatar: '🌈', totalScore: 4210, highestLevel: 24, bestScore: 270, streak: 11 },
  { id: 'cr_bot_11', name: 'Ephrem Tesfaye', avatar: '🦁', totalScore: 3820, highestLevel: 22, bestScore: 255, streak: 13 },
  { id: 'cr_bot_12', name: 'Samrawit M.', avatar: '🔮', totalScore: 3460, highestLevel: 20, bestScore: 245, streak: 9 },
  { id: 'cr_bot_13', name: 'Robel Speed', avatar: '⚡', totalScore: 3110, highestLevel: 18, bestScore: 232, streak: 10 },
  { id: 'cr_bot_14', name: 'Liya Desta', avatar: '🌸', totalScore: 2790, highestLevel: 16, bestScore: 220, streak: 8 },
  { id: 'cr_bot_15', name: 'Biniyam Z.', avatar: '🪐', totalScore: 2450, highestLevel: 14, bestScore: 208, streak: 7 },
  { id: 'cr_bot_16', name: 'Rahel W.', avatar: '✨', totalScore: 2120, highestLevel: 12, bestScore: 195, streak: 9 },
  { id: 'cr_bot_17', name: 'Yohannes K.', avatar: '🔷', totalScore: 1830, highestLevel: 10, bestScore: 180, streak: 6 },
  { id: 'cr_bot_18', name: 'Mahlet F.', avatar: '🌺', totalScore: 1540, highestLevel: 9, bestScore: 165, streak: 5 },
  { id: 'cr_bot_19', name: 'Daniel B.', avatar: '🌀', totalScore: 1280, highestLevel: 7, bestScore: 150, streak: 7 },
  { id: 'cr_bot_20', name: 'Hana Assefa', avatar: '💫', totalScore: 980, highestLevel: 5, bestScore: 135, streak: 4 },
  { id: 'cr_bot_21', name: 'Aman Speed', avatar: '🦊', totalScore: 740, highestLevel: 4, bestScore: 120, streak: 4 },
  { id: 'cr_bot_22', name: 'Feven T.', avatar: '🦋', totalScore: 510, highestLevel: 3, bestScore: 105, streak: 3 },
  { id: 'cr_bot_23', name: 'Biruk G.', avatar: '🦅', totalScore: 330, highestLevel: 2, bestScore: 90, streak: 3 },
  { id: 'cr_bot_24', name: 'Aster M.', avatar: '🍀', totalScore: 180, highestLevel: 1, bestScore: 75, streak: 2 },
];

export type LeaderboardTab = 'GLOBAL' | 'WEEKLY' | 'MONTHLY' | 'MY_RANK';

/**
 * Computes deterministic movement indicators (▲, ▼, ━) based on player ID and time seed
 */
function getMovement(id: string, tab: LeaderboardTab): { movement: 'up' | 'down' | 'same'; amount?: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  const mod = abs % 10;

  if (mod < 4) {
    return { movement: 'up', amount: (abs % 4) + 1 };
  } else if (mod < 7) {
    return { movement: 'down', amount: (abs % 3) + 1 };
  } else {
    return { movement: 'same' };
  }
}

/**
 * Generates leaderboard with the active user dynamically inserted at their exact competitive rank
 */
export function getLeaderboardData(params: {
  tab: LeaderboardTab;
  playerName: string;
  playerAvatar: string;
  playerScore: number;
  playerHighestLevel: number;
  playerBestScore: number;
  playerStreak: number;
}): {
  entries: LeaderboardEntry[];
  playerEntry: LeaderboardEntry;
  playerRank: number;
  totalCompetitors: number;
} {
  const {
    tab,
    playerName,
    playerAvatar,
    playerScore,
    playerHighestLevel,
    playerBestScore,
    playerStreak,
  } = params;

  // Scale scores slightly per tab for realistic tournament differentiation
  const tabMultiplier = tab === 'WEEKLY' ? 0.65 : tab === 'MONTHLY' ? 0.85 : 1.0;

  // Clone and scale competitors
  const list: Omit<LeaderboardEntry, 'rank' | 'movement'>[] = BASE_COMPETITORS.map((c) => ({
    ...c,
    totalScore: Math.max(120, Math.round(c.totalScore * tabMultiplier)),
    bestScore: Math.round(c.bestScore * (tab === 'GLOBAL' ? 1 : 0.95)),
  }));

  // Create current player entry
  const playerItem: Omit<LeaderboardEntry, 'rank' | 'movement'> = {
    id: 'active_player',
    name: playerName || 'You',
    avatar: playerAvatar || '⚡',
    totalScore: Math.round(playerScore * (tab === 'GLOBAL' ? 1.0 : tabMultiplier)),
    highestLevel: playerHighestLevel,
    bestScore: playerBestScore,
    streak: playerStreak,
    isPlayer: true,
  };

  list.push(playerItem);

  // Sort descending by total cumulative score, then bestScore
  list.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return b.bestScore - a.bestScore;
  });

  // Assign ranks & movements
  const rankedEntries: LeaderboardEntry[] = list.map((entry, index) => {
    const { movement, amount } = getMovement(entry.id, tab);
    return {
      ...entry,
      rank: index + 1,
      movement: entry.isPlayer ? 'up' : movement,
      movementAmount: entry.isPlayer ? 2 : amount,
    };
  });

  const playerRankIndex = rankedEntries.findIndex((e) => e.isPlayer);
  const playerEntry = rankedEntries[playerRankIndex];
  const playerRank = playerRankIndex + 1;

  // For MY_RANK tab, center the view around the player's rank
  let displayedEntries = rankedEntries;
  if (tab === 'MY_RANK') {
    const start = Math.max(0, playerRankIndex - 4);
    const end = Math.min(rankedEntries.length, playerRankIndex + 6);
    displayedEntries = rankedEntries.slice(start, end);
  }

  return {
    entries: displayedEntries,
    playerEntry,
    playerRank,
    totalCompetitors: 14850 + rankedEntries.length,
  };
}
