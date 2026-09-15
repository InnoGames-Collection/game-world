/**
 * Pop Balloon Tournament - Storage & Leaderboard Data Engine
 */

import { PopBalloonProgress, LevelScoreBreakdown, LeaderboardEntry } from './types';

const STORAGE_KEY = 'teleplay_pop_balloon_tournament_v2';
const LEGACY_STORAGE_KEY = 'teleplay_pop_balloon_best';

/**
 * Mask MSISDN according to specifications:
 * Keep first 5 digits, last 2 digits, mask middle with '*****'
 * e.g., 251911598830 -> 25191*****30
 */
export function formatMsisdnMasked(rawPhone?: string): string {
  let clean = (rawPhone || '').replace(/\D/g, '');
  if (clean.startsWith('09') && clean.length === 10) {
    clean = '251' + clean.slice(1);
  } else if (!clean.startsWith('251') && clean.length >= 9) {
    clean = '251' + clean.slice(-9);
  } else if (!clean) {
    clean = '251911598830';
  }

  if (clean.length >= 7) {
    const first5 = clean.slice(0, 5);
    const last2 = clean.slice(-2);
    return `${first5}*****${last2}`;
  }
  return '25191*****30';
}

export const INITIAL_PROGRESS: PopBalloonProgress = {
  unlockedLevel: 1,
  levelBestScores: {},
  levelDetails: {},
  totalTournamentScore: 0,
  totalBalloonsPoppedAllTime: 0,
  totalMatchesPlayed: 0,
  bestComboAllTime: 0,
  bestReactionMs: 380,
  perfectLevelsCount: 0,
  soundEnabled: true,
};

export function loadPopBalloonProgress(): PopBalloonProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure totalTournamentScore is always the authentic cumulative sum of levelBestScores
      const bestsArray = Object.values(parsed.levelBestScores || {}) as number[];
      const sumOfBests = bestsArray.reduce(
        (acc: number, val: number) => acc + (typeof val === 'number' ? val : 0),
        0
      );
      return {
        ...INITIAL_PROGRESS,
        ...parsed,
        totalTournamentScore: sumOfBests > 0 ? sumOfBests : parsed.totalTournamentScore || 0,
      };
    }

    // Check legacy score for seamless migration
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const oldScore = parseInt(legacy, 10) || 0;
      if (oldScore > 0) {
        const migrated: PopBalloonProgress = {
          ...INITIAL_PROGRESS,
          unlockedLevel: Math.min(40, Math.max(1, Math.floor(oldScore / 100) + 1)),
          levelBestScores: { 1: oldScore },
          totalTournamentScore: oldScore,
        };
        savePopBalloonProgress(migrated);
        return migrated;
      }
    }
  } catch (err) {
    console.error('Failed to load Pop Balloon progress:', err);
  }
  return { ...INITIAL_PROGRESS };
}

export function savePopBalloonProgress(prog: PopBalloonProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prog));
  } catch (err) {
    console.error('Failed to save Pop Balloon progress:', err);
  }
}

/**
 * Calculate Global Rank based on cumulative tournament score
 */
export function calculateGlobalRank(totalTournamentScore: number): number {
  if (totalTournamentScore <= 0) return 4820;
  if (totalTournamentScore >= 18000) return Math.max(1, Math.floor(10 - totalTournamentScore / 2500));
  if (totalTournamentScore >= 12000) return Math.floor(15 + (18000 - totalTournamentScore) / 80);
  if (totalTournamentScore >= 6000) return Math.floor(120 + (12000 - totalTournamentScore) / 20);
  if (totalTournamentScore >= 2000) return Math.floor(550 + (6000 - totalTournamentScore) / 10);
  return Math.max(12, Math.floor(1450 + (2000 - totalTournamentScore) * 1.5));
}

/**
 * Seeded mock tournament leaderboard participants for realistic competition
 */
export const SEED_LEADERBOARD_PLAYERS = [
  { msisdnMasked: '25191*****82', score: 19450, level: 40, badge: 'Grandmaster' },
  { msisdnMasked: '25191*****34', score: 18920, level: 40, badge: 'Grandmaster' },
  { msisdnMasked: '25192*****19', score: 18410, level: 39, badge: 'Champion' },
  { msisdnMasked: '25191*****70', score: 17850, level: 38, badge: 'Master' },
  { msisdnMasked: '25193*****55', score: 16940, level: 36, badge: 'Diamond' },
  { msisdnMasked: '25191*****09', score: 15820, level: 35, badge: 'Diamond' },
  { msisdnMasked: '25192*****41', score: 14750, level: 33, badge: 'Platinum' },
  { msisdnMasked: '25191*****96', score: 13910, level: 31, badge: 'Platinum' },
  { msisdnMasked: '25193*****22', score: 12840, level: 29, badge: 'Gold' },
  { msisdnMasked: '25191*****63', score: 11520, level: 27, badge: 'Gold' },
  { msisdnMasked: '25192*****77', score: 10180, level: 25, badge: 'Silver' },
  { msisdnMasked: '25191*****15', score: 8940, level: 22, badge: 'Silver' },
  { msisdnMasked: '25193*****88', score: 7450, level: 19, badge: 'Bronze' },
  { msisdnMasked: '25191*****02', score: 5890, level: 15, badge: 'Bronze' },
  { msisdnMasked: '25192*****60', score: 4320, level: 11, badge: 'Challenger' },
];

export function getTournamentLeaderboard(
  playerMsisdn: string,
  playerScore: number,
  playerLevel: number
): LeaderboardEntry[] {
  const playerEntry: LeaderboardEntry = {
    rank: 0,
    msisdnMasked: formatMsisdnMasked(playerMsisdn),
    score: playerScore,
    level: playerLevel,
    badge:
      playerLevel >= 40
        ? 'Grandmaster'
        : playerLevel >= 35
        ? 'Champion'
        : playerLevel >= 25
        ? 'Platinum'
        : playerLevel >= 15
        ? 'Gold'
        : 'Challenger',
    isPlayer: true,
  };

  const allEntries: LeaderboardEntry[] = [
    ...SEED_LEADERBOARD_PLAYERS.map((p) => ({
      rank: 0,
      msisdnMasked: p.msisdnMasked,
      score: p.score,
      level: p.level,
      badge: p.badge,
      isPlayer: false,
    })),
    playerEntry,
  ];

  // Sort descending by score
  allEntries.sort((a, b) => b.score - a.score);

  // Assign ranks
  allEntries.forEach((e, idx) => {
    e.rank = idx + 1;
  });

  return allEntries;
}
