/**
 * Emoji Fun — Tournament Scoring Engine
 * Deterministic, skill-based, variable tournament scoring
 */

import { TournamentScoreCalculation, QuestionDifficulty } from './types';

export function getComboMultiplier(combo: number): number {
  if (combo <= 1) return 1.0;
  if (combo === 2) return 1.1;
  if (combo === 3) return 1.2;
  if (combo === 4) return 1.3;
  if (combo >= 5 && combo < 7) return 1.5;
  if (combo >= 7 && combo < 10) return 1.8;
  if (combo >= 10 && combo < 15) return 2.0;
  if (combo >= 15 && combo < 20) return 2.5;
  return 3.0; // 20+ combo
}

export function calculateTournamentScore(params: {
  isCorrect: boolean;
  basePoints: number;
  timeRemainingSeconds: number;
  totalTimeSeconds: number;
  currentCombo: number; // consecutive correct answers before this question
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

  // Response time calculation
  const elapsed = Math.max(0.1, totalTimeSeconds - timeRemainingSeconds);
  const fractionUsed = Math.min(1.0, elapsed / Math.max(1, totalTimeSeconds));

  let speedTier: 'INSTANT' | 'FAST' | 'NORMAL' | 'SLOW' | 'TIMEOUT' = 'NORMAL';
  let speedBonusPercent = 40;

  if (fractionUsed <= 0.20) {
    speedTier = 'INSTANT';
    speedBonusPercent = 100;
  } else if (fractionUsed <= 0.40) {
    speedTier = 'FAST';
    speedBonusPercent = 70;
  } else if (fractionUsed <= 0.65) {
    speedTier = 'NORMAL';
    speedBonusPercent = 40;
  } else if (fractionUsed <= 0.85) {
    speedTier = 'SLOW';
    speedBonusPercent = 15;
  } else {
    speedTier = 'TIMEOUT';
    speedBonusPercent = 5;
  }

  // Combo multiplier (currentCombo + 1 for this new correct answer)
  const newCombo = currentCombo + 1;
  const comboMultiplier = getComboMultiplier(newCombo);

  // Hint penalty multiplier:
  // No hint = 100% score potential
  // 1 hint = 70%
  // 2 hints = 45%
  let hintPenaltyMultiplier = 1.0;
  if (hintsUsedOnQuestion === 1) {
    hintPenaltyMultiplier = 0.70;
  } else if (hintsUsedOnQuestion >= 2) {
    hintPenaltyMultiplier = 0.45;
  }

  // Perfect answer check:
  // Fast response (within 35% time limit) AND no hints used
  const isPerfect = fractionUsed <= 0.35 && hintsUsedOnQuestion === 0;

  // Perfect bonus points based on difficulty
  let perfectBonusPoints = 0;
  if (isPerfect) {
    switch (difficulty) {
      case 'EASY':
        perfectBonusPoints = 40;
        break;
      case 'MEDIUM':
        perfectBonusPoints = 70;
        break;
      case 'HARD':
        perfectBonusPoints = 110;
        break;
      case 'EXPERT':
        perfectBonusPoints = 160;
        break;
    }
  }

  // Main score formula:
  // (Base * (1 + SpeedBonus/100) * ComboMultiplier * HintMultiplier) + PerfectBonus
  const speedFactor = 1 + speedBonusPercent / 100;
  const coreScore = basePoints * speedFactor * comboMultiplier * hintPenaltyMultiplier;
  const totalPointsAwarded = Math.round(coreScore + perfectBonusPoints);

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

export function calculateQuestionTournamentScore(params: {
  question: { basePoints: number; timeLimitSeconds: number; difficulty: QuestionDifficulty };
  timeRemainingSeconds: number;
  comboCount: number;
  hintsUsedOnThisQuestion: number;
  levelMultiplier?: number;
}): TournamentScoreCalculation {
  const result = calculateTournamentScore({
    isCorrect: true,
    basePoints: params.question.basePoints,
    timeRemainingSeconds: params.timeRemainingSeconds,
    totalTimeSeconds: params.question.timeLimitSeconds,
    currentCombo: Math.max(0, params.comboCount - 1),
    hintsUsedOnQuestion: params.hintsUsedOnThisQuestion,
    difficulty: params.question.difficulty,
  });

  if (params.levelMultiplier && params.levelMultiplier !== 1.0) {
    result.totalPointsAwarded = Math.round(result.totalPointsAwarded * params.levelMultiplier);
  }

  return result;
}

