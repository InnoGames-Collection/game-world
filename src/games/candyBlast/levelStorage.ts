/**
 * Candy Blast - Level Progression Storage Manager
 * Tracks unlocked levels (1 to 40), star ratings (1-3 stars), and best scores per level.
 */

import { PlayerProgress, LevelRecord } from './types';

const STORAGE_KEY = 'teleplay_candy_blast_campaign_v2';

const DEFAULT_PROGRESS: PlayerProgress = {
  unlockedLevel: 1,
  records: {},
};

export function loadPlayerProgress(): PlayerProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as PlayerProgress;
    if (!parsed || typeof parsed.unlockedLevel !== 'number') {
      return DEFAULT_PROGRESS;
    }
    return {
      unlockedLevel: Math.max(1, Math.min(40, parsed.unlockedLevel)),
      records: parsed.records || {},
    };
  } catch (err) {
    console.warn('[CandyBlast] Failed to load level progression:', err);
    return DEFAULT_PROGRESS;
  }
}

export function savePlayerProgress(progress: PlayerProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('[CandyBlast] Failed to save level progression:', err);
  }
}

export function recordLevelCompletion(
  levelNum: number,
  score: number,
  stars: number
): { progress: PlayerProgress; isNewUnlock: boolean; isNewBest: boolean } {
  const current = loadPlayerProgress();
  const prevRecord = current.records[levelNum];
  
  const isNewBest = !prevRecord || score > prevRecord.highScore;
  const bestStars = Math.max(stars, prevRecord?.stars || 0);
  const bestScore = Math.max(score, prevRecord?.highScore || 0);

  const updatedRecord: LevelRecord = {
    stars: bestStars,
    highScore: bestScore,
    completed: true,
  };

  const nextLevel = Math.min(40, Math.max(current.unlockedLevel, levelNum + 1));
  const isNewUnlock = nextLevel > current.unlockedLevel;

  const newProgress: PlayerProgress = {
    unlockedLevel: nextLevel,
    records: {
      ...current.records,
      [levelNum]: updatedRecord,
    },
  };

  savePlayerProgress(newProgress);
  return { progress: newProgress, isNewUnlock, isNewBest };
}

export function getTotalStarsEarned(progress: PlayerProgress): number {
  return Object.values(progress.records).reduce((sum, r) => sum + (r.stars || 0), 0);
}
