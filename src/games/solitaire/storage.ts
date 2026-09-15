/**
 * Solitaire Persistence Storage Manager
 * Handles local storage for unlocked levels, 3-star ratings,
 * high scores, audio settings, hand preference, and daily challenges.
 */

import { SolitaireSaveData } from './types';

const STORAGE_KEY = 'teleplus_solitaire_v1';

export const SolitaireStorage = {
  load(): SolitaireSaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          highestUnlockedLevel: Math.max(1, Math.min(40, parsed.highestUnlockedLevel || 1)),
          stars: parsed.stars || {},
          bestScores: parsed.bestScores || {},
          bestTimes: parsed.bestTimes || {},
          soundEnabled: parsed.soundEnabled !== undefined ? parsed.soundEnabled : true,
          musicEnabled: parsed.musicEnabled !== undefined ? parsed.musicEnabled : true,
          handMode: parsed.handMode === 'left' ? 'left' : 'right',
          completedDailyChallenges: parsed.completedDailyChallenges || [],
          lastDailyChallengeDate: parsed.lastDailyChallengeDate,
          dailyStreak: parsed.dailyStreak || 0,
        };
      }
    } catch (e) {
      console.warn('Failed to parse Solitaire storage, initializing defaults', e);
    }

    return {
      highestUnlockedLevel: 1, // Level 1 unlocked, 2..40 locked
      stars: {},
      bestScores: {},
      bestTimes: {},
      soundEnabled: true,
      musicEnabled: true,
      handMode: 'right',
      completedDailyChallenges: [],
      dailyStreak: 0,
    };
  },

  save(data: SolitaireSaveData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to write Solitaire storage', e);
    }
  },

  completeLevel(level: number, score: number, timeSeconds: number, starsEarned: number): { nextUnlocked: boolean } {
    const data = this.load();
    let nextUnlocked = false;

    // Record stars (keep best)
    const prevStars = data.stars[level] || 0;
    if (starsEarned > prevStars) {
      data.stars[level] = starsEarned;
    }

    // Record high score
    const prevScore = data.bestScores[level] || 0;
    if (score > prevScore) {
      data.bestScores[level] = score;
    }

    // Record best time
    const prevTime = data.bestTimes[level] || 999999;
    if (timeSeconds < prevTime) {
      data.bestTimes[level] = timeSeconds;
    }

    // Unlock next level sequentially (only up to 40)
    if (level === data.highestUnlockedLevel && data.highestUnlockedLevel < 40) {
      data.highestUnlockedLevel = level + 1;
      nextUnlocked = true;
    }

    this.save(data);
    return { nextUnlocked };
  },

  completeDailyChallenge(dateKey: string, score: number) {
    const data = this.load();
    if (!data.completedDailyChallenges.includes(dateKey)) {
      data.completedDailyChallenges.push(dateKey);
      data.lastDailyChallengeDate = dateKey;
      data.dailyStreak = (data.dailyStreak || 0) + 1;
      this.save(data);
    }
  },
};
