/**
 * KNIFE MADNESS - Deterministic Tournament Scoring Engine
 * Anti-farming, skill-differentiated, compact scoring architecture.
 *
 * Total Score = SUM OF BEST HIGH SCORE FOR EACH COMPLETED LEVEL.
 * Never increases from repeated farming attempts with lower scores.
 */

import {
  LevelConfig,
  FruitType,
  KnifeMadnessScoreBreakdown,
  KnifeMadnessLevelRecord,
  KnifeMadnessCareerProgress,
} from './types';

/**
 * Precision score based on angular gap to closest embedded knife (degrees).
 * Closer safe placement awards higher precision bonus.
 */
export function calculatePrecisionScore(gapDegrees: number): { points: number; label: string } {
  if (gapDegrees <= 8.5) {
    return { points: 3, label: 'EXTREME PRECISION +3' };
  } else if (gapDegrees <= 16.0) {
    return { points: 2, label: 'HIGH PRECISION +2' };
  } else if (gapDegrees <= 25.0) {
    return { points: 1, label: 'GOOD PRECISION +1' };
  }
  return { points: 0, label: 'SAFE GAP' };
}

/**
 * Combo bonus for consecutive successful throws
 */
export function calculateComboBonus(consecutiveHits: number): { points: number; label?: string } {
  if (consecutiveHits >= 8) {
    return { points: 3, label: `MAX COMBO x${consecutiveHits} (+3)` };
  } else if (consecutiveHits >= 5) {
    return { points: 2, label: `STRONG COMBO x${consecutiveHits} (+2)` };
  } else if (consecutiveHits >= 3) {
    return { points: 1, label: `COMBO x${consecutiveHits} (+1)` };
  }
  return { points: 0 };
}

/**
 * Fruit bonus score
 */
export function calculateFruitBonus(type?: FruitType): number {
  if (!type) return 2;
  switch (type) {
    case 'watermelon':
    case 'kiwi':
    case 'coconut':
    case 'strawberry':
    case 'peach':
    case 'plum':
      return 3; // Rare / advanced fruit
    case 'apple':
    case 'orange':
    case 'lemon':
    case 'cherry':
    default:
      return 2; // Standard fruit
  }
}

/**
 * Calculate throw efficiency based on required knives vs throws made
 */
export function calculateThrowEfficiency(requiredKnives: number, throwsCount: number): number {
  if (throwsCount <= requiredKnives) {
    return 3; // Flawless par execution
  } else if (throwsCount <= requiredKnives + 2) {
    return 2;
  } else if (throwsCount <= requiredKnives + 4) {
    return 1;
  }
  return 0;
}

/**
 * Active time bonus score
 */
export function calculateTimeBonus(activeSeconds: number, requiredKnives: number): number {
  const parTimeSeconds = requiredKnives * 1.6; // expected par duration
  if (activeSeconds <= parTimeSeconds * 0.75) {
    return 3; // Lightning quick
  } else if (activeSeconds <= parTimeSeconds * 1.1) {
    return 2; // Fast
  } else if (activeSeconds <= parTimeSeconds * 1.5) {
    return 1; // Standard
  }
  return 0;
}

/**
 * Difficulty tier bonus points
 */
export function calculateDifficultyBonus(levelNumber: number): number {
  if (levelNumber <= 5) return 1;
  if (levelNumber <= 10) return 2;
  if (levelNumber <= 20) return 3;
  if (levelNumber <= 30) return 4;
  return 5; // Levels 31-40
}

export interface ComputeLevelScoreParams {
  level: LevelConfig;
  knivesPlaced: number;
  fruitsSlicedCount: number;
  accumulatedFruitScore: number;
  accumulatedPrecisionScore: number;
  accumulatedComboScore: number;
  activeSeconds: number;
  throwsCount: number;
  maxCombo: number;
  bestPrecisionDeg: number;
  previousBestScore: number;
  currentCompletedLevels: Record<number, KnifeMadnessLevelRecord>;
}

/**
 * Deterministic breakdown calculation for level completion
 */
export function computeLevelScoreBreakdown(params: ComputeLevelScoreParams): KnifeMadnessScoreBreakdown {
  const {
    level,
    knivesPlaced,
    fruitsSlicedCount,
    accumulatedFruitScore,
    accumulatedPrecisionScore,
    accumulatedComboScore,
    activeSeconds,
    throwsCount,
    maxCombo,
    bestPrecisionDeg,
    previousBestScore,
    currentCompletedLevels,
  } = params;

  // 1. Base knives placed (1 point each)
  const baseKnivesScore = knivesPlaced * 1;

  // 2. Fruit bonus
  const fruitBonusScore = accumulatedFruitScore;

  // 3. Precision score
  const precisionBonusScore = accumulatedPrecisionScore;

  // 4. Combo bonus
  const comboBonusScore = accumulatedComboScore;

  // 5. Throw efficiency bonus (+0 to +3)
  const efficiencyBonusScore = calculateThrowEfficiency(level.requiredKnives, throwsCount);

  // 6. Time bonus (+0 to +3)
  const timeBonusScore = calculateTimeBonus(activeSeconds, level.requiredKnives);

  // 7. Difficulty tier bonus (+1 to +5)
  const difficultyBonusScore = calculateDifficultyBonus(level.levelNumber);

  // 8. Boss level bonus (+5)
  const isBoss = Boolean(level.isBossLevel || level.levelNumber % 5 === 0);
  const bossBonusScore = isBoss ? 5 : 0;

  // 9. Total Level Score (Compact, e.g. 15 to 45 pts)
  const levelTotalScore =
    baseKnivesScore +
    fruitBonusScore +
    precisionBonusScore +
    comboBonusScore +
    efficiencyBonusScore +
    timeBonusScore +
    difficultyBonusScore +
    bossBonusScore;

  // 10. Check if this is a new best for this specific level
  const isNewBest = levelTotalScore > previousBestScore;
  const bestForThisLevel = Math.max(previousBestScore, levelTotalScore);

  // 11. Recalculate true cumulative total = sum of best score for every completed level
  let sum = 0;
  Object.entries(currentCompletedLevels).forEach(([lvlStr, record]) => {
    const lvlNum = Number(lvlStr);
    if (lvlNum === level.levelNumber) {
      sum += bestForThisLevel;
    } else {
      sum += record.highScore || 0;
    }
  });

  // If this level was not in completed levels yet, add it
  if (!currentCompletedLevels[level.levelNumber]) {
    sum += bestForThisLevel;
  }

  const averageThrowInterval = throwsCount > 0 ? Number((activeSeconds / throwsCount).toFixed(2)) : 0;

  return {
    levelNumber: level.levelNumber,
    isBossLevel: isBoss,
    knivesPlaced,
    baseKnivesScore,
    fruitsSlicedCount,
    fruitBonusScore,
    precisionBonusScore,
    comboBonusScore,
    efficiencyBonusScore,
    timeBonusScore,
    difficultyBonusScore,
    bossBonusScore,
    levelTotalScore,
    activeSeconds: Math.round(activeSeconds),
    averageThrowInterval,
    throwsCount,
    maxCombo,
    bestPrecisionDeg: Number(bestPrecisionDeg.toFixed(1)),
    isNewBest,
    previousBestScore,
    newCumulativeTotalScore: sum,
  };
}

/**
 * Recompute clean cumulative score from all completed levels (anti-farming protection)
 */
export function recomputeCumulativeScore(completedLevels: Record<number, KnifeMadnessLevelRecord>): number {
  return Object.values(completedLevels).reduce((acc, lvl) => acc + (lvl?.highScore || 0), 0);
}

const STORAGE_KEY = 'knife_madness_career_v2';

export function createInitialCareer(): KnifeMadnessCareerProgress {
  return {
    currentLevel: 1,
    unlockedLevel: 1,
    totalScore: 0,
    levelsCompleted: 0,
    totalApplesSliced: 0,
    totalFruitsSliced: 0,
    totalThrows: 0,
    totalSuccessfulThrows: 0,
    totalHits: 0,
    bestCombo: 0,
    bestPrecisionDeg: 99,
    bestLevelTimeSeconds: 0,
    failedAttempts: 0,
    totalFails: 0,
    completedLevels: {},
    levelRecords: {},
    achievements: [],
  };
}

export function loadCareerProgress(): KnifeMadnessCareerProgress {
  if (typeof window === 'undefined') {
    return createInitialCareer();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialCareer();
    const parsed = JSON.parse(raw);
    const completedLevels = parsed.completedLevels || parsed.levelRecords || {};
    const totalScore = recomputeCumulativeScore(completedLevels);

    const career: KnifeMadnessCareerProgress = {
      currentLevel: parsed.currentLevel || 1,
      unlockedLevel: Math.max(1, parsed.unlockedLevel || 1),
      totalScore,
      levelsCompleted: Object.keys(completedLevels).length,
      totalApplesSliced: parsed.totalApplesSliced || parsed.totalFruitsSliced || 0,
      totalFruitsSliced: parsed.totalApplesSliced || parsed.totalFruitsSliced || 0,
      totalThrows: parsed.totalThrows || 0,
      totalSuccessfulThrows: parsed.totalSuccessfulThrows || parsed.totalHits || 0,
      totalHits: parsed.totalSuccessfulThrows || parsed.totalHits || 0,
      bestCombo: parsed.bestCombo || 0,
      bestPrecisionDeg: parsed.bestPrecisionDeg || 99,
      bestLevelTimeSeconds: parsed.bestLevelTimeSeconds || 0,
      failedAttempts: parsed.failedAttempts || parsed.totalFails || 0,
      totalFails: parsed.failedAttempts || parsed.totalFails || 0,
      completedLevels,
      levelRecords: completedLevels,
      achievements: parsed.achievements || [],
    };
    return career;
  } catch {
    return createInitialCareer();
  }
}

export function saveCareerProgress(career: KnifeMadnessCareerProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(career));
  } catch {
    // LocalStorage quota or private mode fallback
  }
}

export function resetCareerProgress(): KnifeMadnessCareerProgress {
  const initial = createInitialCareer();
  saveCareerProgress(initial);
  return initial;
}

export interface LevelCompletionResult {
  updatedCareer: KnifeMadnessCareerProgress;
  breakdown: KnifeMadnessScoreBreakdown;
  isNewBest: boolean;
}

export function recordLevelCompletion(
  career: KnifeMadnessCareerProgress,
  successData: {
    level: LevelConfig;
    knivesPlaced: number;
    fruitsSlicedCount: number;
    accumulatedFruitScore: number;
    accumulatedPrecisionScore: number;
    accumulatedComboScore: number;
    activeSeconds: number;
    throwsCount: number;
    maxCombo: number;
    bestPrecisionDeg: number;
  }
): LevelCompletionResult {
  const lvlNum = successData.level.levelNumber;
  const existingRecord = career.completedLevels[lvlNum];
  const prevBest = existingRecord?.highScore || 0;

  const breakdown = computeLevelScoreBreakdown({
    level: successData.level,
    knivesPlaced: successData.knivesPlaced,
    fruitsSlicedCount: successData.fruitsSlicedCount,
    accumulatedFruitScore: successData.accumulatedFruitScore,
    accumulatedPrecisionScore: successData.accumulatedPrecisionScore,
    accumulatedComboScore: successData.accumulatedComboScore,
    activeSeconds: successData.activeSeconds,
    throwsCount: successData.throwsCount,
    maxCombo: successData.maxCombo,
    bestPrecisionDeg: successData.bestPrecisionDeg,
    previousBestScore: prevBest,
    currentCompletedLevels: career.completedLevels,
  });

  const isNewBest = breakdown.isNewBest;
  const newBestScore = Math.max(prevBest, breakdown.levelTotalScore);

  // Stars: 3 stars for flawless throws, 2 stars for <= +2 throws, 1 star for clear
  const stars =
    successData.throwsCount <= successData.level.requiredKnives
      ? 3
      : successData.throwsCount <= successData.level.requiredKnives + 2
      ? 2
      : 1;

  const updatedRecord: KnifeMadnessLevelRecord = {
    levelNumber: lvlNum,
    completed: true,
    highScore: newBestScore,
    stars: Math.max(existingRecord?.stars || 1, stars),
    bestTimeSeconds: existingRecord?.bestTimeSeconds
      ? Math.min(existingRecord.bestTimeSeconds, Math.round(successData.activeSeconds))
      : Math.round(successData.activeSeconds),
    bestPrecisionDeg: existingRecord?.bestPrecisionDeg
      ? Math.min(existingRecord.bestPrecisionDeg, successData.bestPrecisionDeg)
      : successData.bestPrecisionDeg,
    bestCombo: Math.max(existingRecord?.bestCombo || 0, successData.maxCombo),
    applesCollected: (existingRecord?.applesCollected || 0) + successData.fruitsSlicedCount,
    attemptsCount: (existingRecord?.attemptsCount || 0) + 1,
    completedTimestamp: Date.now(),
  };

  const updatedCompletedLevels = {
    ...career.completedLevels,
    [lvlNum]: updatedRecord,
  };

  const totalScore = recomputeCumulativeScore(updatedCompletedLevels);
  const nextUnlocked = Math.max(career.unlockedLevel, Math.min(40, lvlNum + 1));

  const totalApples = career.totalApplesSliced + successData.fruitsSlicedCount;
  const totalThrows = career.totalThrows + successData.throwsCount;
  const totalHits = career.totalSuccessfulThrows + successData.knivesPlaced;

  const bestPrecision =
    career.bestPrecisionDeg === 99
      ? successData.bestPrecisionDeg
      : Math.min(career.bestPrecisionDeg, successData.bestPrecisionDeg);

  const bestLevelTime =
    career.bestLevelTimeSeconds === 0
      ? Math.round(successData.activeSeconds)
      : Math.min(career.bestLevelTimeSeconds, Math.round(successData.activeSeconds));

  const updatedCareer: KnifeMadnessCareerProgress = {
    ...career,
    currentLevel: Math.min(40, lvlNum + 1),
    unlockedLevel: nextUnlocked,
    totalScore,
    levelsCompleted: Object.keys(updatedCompletedLevels).length,
    totalApplesSliced: totalApples,
    totalFruitsSliced: totalApples,
    totalThrows,
    totalSuccessfulThrows: totalHits,
    totalHits,
    bestCombo: Math.max(career.bestCombo, successData.maxCombo),
    bestPrecisionDeg: bestPrecision,
    bestLevelTimeSeconds: bestLevelTime,
    completedLevels: updatedCompletedLevels,
    levelRecords: updatedCompletedLevels,
  };

  saveCareerProgress(updatedCareer);

  return {
    updatedCareer,
    breakdown,
    isNewBest,
  };
}

export function recordLevelFailure(career: KnifeMadnessCareerProgress): KnifeMadnessCareerProgress {
  const updated: KnifeMadnessCareerProgress = {
    ...career,
    failedAttempts: career.failedAttempts + 1,
    totalFails: (career.totalFails || career.failedAttempts) + 1,
  };
  saveCareerProgress(updated);
  return updated;
}
