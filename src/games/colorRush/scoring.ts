/**
 * Color Rush - Competitive Scoring Engine
 * 
 * Strict Tournament Scoring Model:
 * 1. Base Point: Exactly +1 point per correct color (MANDATORY).
 * 2. Speed Bonus: +3 (Very Fast), +2 (Fast), +1 (Normal), +0 (Slow).
 * 3. Streak Bonus: +1 (3-4 in a row), +2 (5-9), +5 (10-14), +8 (15+).
 * 4. Difficulty Bonus: Proportional to level tier.
 * 5. Level Bonus: level * 5.
 * 6. Perfect Bonus: Awarded only when accuracy is 100% without a single miss.
 * 7. Anti-Farming Model: Cumulative Career Score = sum of best scores per completed level.
 */

import { LevelConfig, LevelScoreBreakdown } from './types';

export interface RoundScoreEvaluation {
  basePoints: number;    // Always 1 if correct, 0 if wrong
  speedBonus: number;    // 0, 1, 2, or 3
  streakBonus: number;   // 0, 1, 2, 5, or 8
  totalRoundPoints: number;
  speedTier: 'very_fast' | 'fast' | 'normal' | 'slow' | 'miss';
  streakTierText?: string;
}

/**
 * Evaluates points for a single round answer
 */
export function evaluateRoundScore(
  isCorrect: boolean,
  reactionTimeMs: number,
  timeLimitMs: number,
  currentStreak: number
): RoundScoreEvaluation {
  if (!isCorrect) {
    return {
      basePoints: 0,
      speedBonus: 0,
      streakBonus: 0,
      totalRoundPoints: 0,
      speedTier: 'miss',
    };
  }

  // 1. Mandatory Base Point
  const basePoints = 1;

  // 2. Speed Bonus Calculation
  // ratio = remaining time percentage
  const remainingMs = Math.max(0, timeLimitMs - reactionTimeMs);
  const ratio = remainingMs / timeLimitMs;

  let speedBonus = 0;
  let speedTier: RoundScoreEvaluation['speedTier'] = 'slow';

  if (ratio >= 0.70 || reactionTimeMs < 450) {
    // Very fast: took < 30% of allowed time or < 450ms
    speedBonus = 3;
    speedTier = 'very_fast';
  } else if (ratio >= 0.40 || reactionTimeMs < 900) {
    // Fast: took 30-60% of allowed time
    speedBonus = 2;
    speedTier = 'fast';
  } else if (ratio >= 0.10) {
    // Normal: took 60-90% of allowed time
    speedBonus = 1;
    speedTier = 'normal';
  } else {
    // Slow: answered in the last 10%
    speedBonus = 0;
    speedTier = 'slow';
  }

  // 3. Streak Bonus Calculation
  // Current streak includes this new correct answer
  const nextStreak = currentStreak + 1;
  let streakBonus = 0;
  let streakTierText: string | undefined;

  if (nextStreak >= 15) {
    streakBonus = 8;
    streakTierText = `x${nextStreak} LEGENDARY`;
  } else if (nextStreak >= 10) {
    streakBonus = 5;
    streakTierText = `x${nextStreak} ON FIRE`;
  } else if (nextStreak >= 5) {
    streakBonus = 2;
    streakTierText = `x${nextStreak} STREAK`;
  } else if (nextStreak >= 3) {
    streakBonus = 1;
    streakTierText = `x${nextStreak} COMBO`;
  }

  const totalRoundPoints = basePoints + speedBonus + streakBonus;

  return {
    basePoints,
    speedBonus,
    streakBonus,
    totalRoundPoints,
    speedTier,
    streakTierText,
  };
}

/**
 * Computes full Level Score breakdown upon level completion
 */
export function calculateLevelScoreBreakdown(params: {
  levelConfig: LevelConfig;
  correctCount: number;
  totalRounds: number;
  accumulatedSpeedBonus: number;
  accumulatedStreakBonus: number;
  maxStreak: number;
  avgReactionMs: number;
  previousBest: number;
  existingLevelBests: Record<number, number>;
}): LevelScoreBreakdown {
  const {
    levelConfig,
    correctCount,
    totalRounds,
    accumulatedSpeedBonus,
    accumulatedStreakBonus,
    maxStreak,
    avgReactionMs,
    previousBest,
    existingLevelBests,
  } = params;

  // 1. Base Score = +1 per correct color
  const baseScore = correctCount;

  // 2. Speed and Streak bonuses accumulated during gameplay
  const speedBonus = accumulatedSpeedBonus;
  const streakBonus = accumulatedStreakBonus;

  // 3. Accuracy check
  const accuracy = Math.round((correctCount / totalRounds) * 100);
  const isPassed = accuracy >= levelConfig.minAccuracyToPass;
  const isPerfect = correctCount === totalRounds && totalRounds > 0;

  // 4. Difficulty Bonus (Awarded proportionally to accuracy if passed)
  const difficultyBonus = isPassed 
    ? Math.round(levelConfig.difficultyBonus * (accuracy / 100))
    : 0;

  // 5. Level Bonus (level * 5 if passed)
  const levelBonus = isPassed ? levelConfig.level * 5 : 0;

  // 6. Perfect Performance Bonus
  const perfectBonus = isPerfect ? levelConfig.perfectBonus : 0;

  // 7. Total Level Score
  const totalLevelScore = isPassed
    ? baseScore + speedBonus + streakBonus + difficultyBonus + levelBonus + perfectBonus
    : baseScore + speedBonus + streakBonus;

  // 8. Personal Best & Anti-Farming Cumulative calculation
  const isNewBest = totalLevelScore > previousBest;
  const recordedBestForLevel = Math.max(previousBest, totalLevelScore);

  // Recalculate competitive career score: Sum of best scores of all completed levels
  const updatedBests = { ...existingLevelBests, [levelConfig.level]: recordedBestForLevel };
  const newCumulativeScore = Object.values(updatedBests).reduce((sum, s) => sum + s, 0);

  return {
    level: levelConfig.level,
    baseScore,
    speedBonus,
    streakBonus,
    difficultyBonus,
    levelBonus,
    perfectBonus,
    totalLevelScore,
    isPerfect,
    isPassed,
    isNewBest,
    previousBest,
    newCumulativeScore,
    isNextLevelUnlocked: isPassed,
    accuracy,
    correctCount,
    totalRounds,
    maxStreak,
    avgReactionMs,
  };
}

/**
 * Recomputes the competitive cumulative total score across all level bests
 */
export function computeCumulativeScore(levelBestScores: Record<number, number>): number {
  return Object.values(levelBestScores).reduce((acc, val) => acc + (val || 0), 0);
}
