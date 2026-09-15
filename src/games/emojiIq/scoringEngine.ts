/**
 * EMOJI IQ — Tournament Scoring Engine
 * 
 * Strict deterministic tournament rules:
 * - Controlled base points (Easy: 40-80, Medium: 70-130, Hard: 100-180, Expert: 150-250)
 * - Speed bonus (+30%, +20%, +10%, +5%, +0%)
 * - Combo multiplier (x1.1, x1.2, x1.4, x1.6, x1.8, x2.0)
 * - Hint penalty (0 hints: 100%, 1 hint: 80%, 2 hints: 60%)
 * - Perfect answer bonus (controlled small bonus for fast answer with 0 hints)
 */

import { TournamentScoreCalculation, QuestionDifficulty } from './types';

export function getIqComboMultiplier(combo: number): number {
  if (combo < 2) return 1.0;
  if (combo === 2) return 1.1;
  if (combo >= 3 && combo < 5) return 1.2;
  if (combo >= 5 && combo < 7) return 1.4;
  if (combo >= 7 && combo < 10) return 1.6;
  if (combo >= 10 && combo < 15) return 1.8;
  return 2.0; // 15+ correct answers
}

export function calculateIqTournamentScore(params: {
  isCorrect: boolean;
  basePoints: number;
  timeRemainingSeconds: number;
  totalTimeSeconds: number;
  currentCombo: number; // combo count before this question
  hintsUsedOnQuestion: number;
  difficulty: QuestionDifficulty;
}): TournamentScoreCalculation {
  const {
    isCorrect,
    basePoints,
    timeRemainingSeconds,
    totalTimeSeconds,
    currentCombo,
    hintsUsedOnQuestion,
    difficulty,
  } = params;

  if (!isCorrect) {
    return {
      basePoints,
      responseSeconds: Math.max(0, totalTimeSeconds - timeRemainingSeconds),
      timeLimitSeconds: totalTimeSeconds,
      speedTier: 'TIMEOUT',
      speedBonusPercent: 0,
      comboCount: 0,
      comboMultiplier: 1.0,
      hintsUsedOnQuestion,
      hintPenaltyMultiplier: 0,
      isPerfect: false,
      perfectBonusPoints: 0,
      totalPointsAwarded: 0,
    };
  }

  // Calculate elapsed time fraction
  const elapsed = Math.max(0.1, totalTimeSeconds - timeRemainingSeconds);
  const fractionUsed = Math.min(1.0, elapsed / Math.max(1, totalTimeSeconds));

  let speedTier: 'VERY_FAST' | 'FAST' | 'NORMAL' | 'SLOW' | 'TIMEOUT' = 'NORMAL';
  let speedBonusPercent = 10;

  if (fractionUsed <= 0.25) {
    speedTier = 'VERY_FAST';
    speedBonusPercent = 30;
  } else if (fractionUsed <= 0.50) {
    speedTier = 'FAST';
    speedBonusPercent = 20;
  } else if (fractionUsed <= 0.75) {
    speedTier = 'NORMAL';
    speedBonusPercent = 10;
  } else if (fractionUsed <= 0.95) {
    speedTier = 'SLOW';
    speedBonusPercent = 5;
  } else {
    speedTier = 'TIMEOUT';
    speedBonusPercent = 0;
  }

  // Combo multiplier (new combo = currentCombo + 1)
  const newCombo = currentCombo + 1;
  const comboMultiplier = getIqComboMultiplier(newCombo);

  // Hint penalty multiplier:
  // 0 hints: 100% (1.0)
  // 1 hint: 80% (0.8)
  // 2 hints: 60% (0.6)
  let hintPenaltyMultiplier = 1.0;
  if (hintsUsedOnQuestion === 1) {
    hintPenaltyMultiplier = 0.8;
  } else if (hintsUsedOnQuestion >= 2) {
    hintPenaltyMultiplier = 0.6;
  }

  // Perfect answer check: answered within 25% of time limit with zero hints used
  const isPerfect = fractionUsed <= 0.25 && hintsUsedOnQuestion === 0;
  let perfectBonusPoints = 0;
  if (isPerfect) {
    if (difficulty === 'EASY') perfectBonusPoints = 15;
    else if (difficulty === 'MEDIUM') perfectBonusPoints = 25;
    else if (difficulty === 'HARD') perfectBonusPoints = 35;
    else perfectBonusPoints = 50;
  }

  // Controlled point formula:
  // (Base Points + Speed Bonus) * Combo Multiplier * Hint Penalty + Perfect Bonus
  const speedBonusAmount = Math.round(basePoints * (speedBonusPercent / 100));
  const subtotal = (basePoints + speedBonusAmount) * comboMultiplier * hintPenaltyMultiplier;
  const totalPointsAwarded = Math.round(subtotal + perfectBonusPoints);

  return {
    basePoints,
    responseSeconds: Math.round(elapsed * 10) / 10,
    timeLimitSeconds: totalTimeSeconds,
    speedTier,
    speedBonusPercent,
    comboCount: newCombo,
    comboMultiplier,
    hintsUsedOnQuestion,
    hintPenaltyMultiplier,
    isPerfect,
    perfectBonusPoints,
    totalPointsAwarded,
  };
}
