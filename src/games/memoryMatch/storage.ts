/**
 * Memory Match - Persistence & Statistics Storage Manager
 * TelePlus Ethiopia Gaming Suite
 * 
 * Manages 40-level progression, cumulative tournament score,
 * best performance records, achievements, and player statistics in LocalStorage.
 */

import { MemoryMatchStorageData } from './types';

const STORAGE_KEY = 'teleplus_memory_match_state_v2';

const DEFAULT_STORAGE_STATE: MemoryMatchStorageData = {
  currentLevel: 1,
  unlockedLevel: 1,
  totalCumulativeScore: 0,
  levelScores: {},
  bestTimes: {},
  bestMoves: {},
  stars: {},
  totalPairsMatched: 0,
  totalMoves: 0,
  totalMistakes: 0,
  bestCombo: 0,
  levelsCompleted: 0,
  achievements: [],
  soundEnabled: true,
  hapticsEnabled: true,
};

export function loadMemoryMatchState(): MemoryMatchStorageData {
  if (typeof window === 'undefined') return { ...DEFAULT_STORAGE_STATE };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STORAGE_STATE };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STORAGE_STATE,
      ...parsed,
      levelScores: parsed.levelScores || {},
      bestTimes: parsed.bestTimes || {},
      bestMoves: parsed.bestMoves || {},
      stars: parsed.stars || {},
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
    };
  } catch (err) {
    console.error('Failed to load memory match state:', err);
    return { ...DEFAULT_STORAGE_STATE };
  }
}

export function saveMemoryMatchState(state: MemoryMatchStorageData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save memory match state:', err);
  }
}

export function resetMemoryMatchState(): MemoryMatchStorageData {
  const freshState = { ...DEFAULT_STORAGE_STATE };
  saveMemoryMatchState(freshState);
  return freshState;
}

export interface LevelCompletionUpdate {
  levelNumber: number;
  levelScore: number;
  stars: number;
  timeUsedSeconds: number;
  moves: number;
  incorrectAttempts: number;
  maxStreak: number;
  pairsCount: number;
}

/**
 * Record a completed level and update cumulative statistics.
 * The cumulative tournament score carries forward across all completed levels!
 */
export function recordLevelCompletion(
  current: MemoryMatchStorageData,
  update: LevelCompletionUpdate
): MemoryMatchStorageData {
  const {
    levelNumber,
    levelScore,
    stars,
    timeUsedSeconds,
    moves,
    incorrectAttempts,
    maxStreak,
    pairsCount,
  } = update;

  const previousBestScore = current.levelScores[levelNumber] || 0;
  const isFirstTimeLevelComplete = !current.levelScores[levelNumber];

  // If first time completed, add full levelScore to cumulative tournament score!
  // If replaying and achieved a higher score, add the incremental delta!
  let scoreDelta = 0;
  if (isFirstTimeLevelComplete) {
    scoreDelta = levelScore;
  } else if (levelScore > previousBestScore) {
    scoreDelta = levelScore - previousBestScore;
  }

  const updatedCumulativeScore = Math.max(0, current.totalCumulativeScore + scoreDelta);

  const updatedLevelScores = {
    ...current.levelScores,
    [levelNumber]: Math.max(previousBestScore, levelScore),
  };

  const updatedBestTimes = {
    ...current.bestTimes,
    [levelNumber]: current.bestTimes[levelNumber]
      ? Math.min(current.bestTimes[levelNumber], timeUsedSeconds)
      : timeUsedSeconds,
  };

  const updatedBestMoves = {
    ...current.bestMoves,
    [levelNumber]: current.bestMoves[levelNumber]
      ? Math.min(current.bestMoves[levelNumber], moves)
      : moves,
  };

  const updatedStars = {
    ...current.stars,
    [levelNumber]: Math.max(current.stars[levelNumber] || 0, stars),
  };

  // Unlock next level (up to 40)
  const nextLevel = Math.min(40, levelNumber + 1);
  const updatedUnlockedLevel = Math.max(current.unlockedLevel, nextLevel);

  // Completed levels count
  const updatedLevelsCompleted = Object.keys(updatedLevelScores).length;

  // Track achievements
  const newAchievements = new Set(current.achievements);
  newAchievements.add('first_match');
  if (incorrectAttempts === 0) newAchievements.add('perfect_recall');
  if (timeUsedSeconds <= 20) newAchievements.add('speed_demon');
  if (maxStreak >= 4) newAchievements.add('combo_master');
  if (levelNumber >= 20) newAchievements.add('halfway_champion');
  if (updatedLevelsCompleted >= 40) newAchievements.add('cognitive_titan');
  if (levelScore >= 180) newAchievements.add('century_scorer');
  if (updatedCumulativeScore >= 2000) newAchievements.add('grand_master');

  const nextState: MemoryMatchStorageData = {
    ...current,
    currentLevel: nextLevel,
    unlockedLevel: updatedUnlockedLevel,
    totalCumulativeScore: updatedCumulativeScore,
    levelScores: updatedLevelScores,
    bestTimes: updatedBestTimes,
    bestMoves: updatedBestMoves,
    stars: updatedStars,
    totalPairsMatched: current.totalPairsMatched + pairsCount,
    totalMoves: current.totalMoves + moves,
    totalMistakes: current.totalMistakes + incorrectAttempts,
    bestCombo: Math.max(current.bestCombo, maxStreak),
    levelsCompleted: updatedLevelsCompleted,
    achievements: Array.from(newAchievements),
  };

  saveMemoryMatchState(nextState);
  return nextState;
}
