/**
 * Color Rush - Persistent Storage & State Hydration
 */

import { ColorRushProgression } from './types';
import { computeCumulativeScore } from './scoring';
import { getTodayDateString } from './dailyChallenge';

const STORAGE_KEY = 'teleplay_color_rush_progression_v2';

export const DEFAULT_COLOR_RUSH_PROGRESSION: ColorRushProgression = {
  currentUnlockedLevel: 1,
  levelBestScores: {},
  levelStars: {},
  totalCumulativeScore: 0,
  highestStreak: 0,
  totalCorrectColors: 0,
  totalGamesPlayed: 0,
  perfectLevelsCount: 0,
  totalReactionTimeMs: 0,
  reactionCount: 0,
  unlockedAchievements: [],
  dailyChallenge: {
    date: getTodayDateString(),
    completed: false,
    score: 0,
    bestStreak: 0,
    rank: 0,
  },
  soundEnabled: true,
  hapticsEnabled: true,
};

export function loadProgression(): ColorRushProgression {
  if (typeof window === 'undefined') return DEFAULT_COLOR_RUSH_PROGRESSION;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COLOR_RUSH_PROGRESSION;

    const parsed = JSON.parse(raw);
    const cumulative = computeCumulativeScore(parsed.levelBestScores || {});

    // Check if daily challenge needs reset for new date
    const today = getTodayDateString();
    let dailyChallenge = parsed.dailyChallenge;
    if (!dailyChallenge || dailyChallenge.date !== today) {
      dailyChallenge = {
        date: today,
        completed: false,
        score: 0,
        bestStreak: 0,
        rank: 0,
      };
    }

    return {
      ...DEFAULT_COLOR_RUSH_PROGRESSION,
      ...parsed,
      currentUnlockedLevel: Math.max(1, Math.min(40, parsed.currentUnlockedLevel || 1)),
      totalCumulativeScore: cumulative,
      dailyChallenge,
    };
  } catch {
    return DEFAULT_COLOR_RUSH_PROGRESSION;
  }
}

export function saveProgression(progression: ColorRushProgression): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progression));
  } catch {}
}

export function resetProgression(): ColorRushProgression {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
  return { ...DEFAULT_COLOR_RUSH_PROGRESSION };
}
