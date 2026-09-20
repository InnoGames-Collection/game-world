/**
 * Bubble Shooter - Authoritative Deterministic Scoring Engine
 * Normalized, controlled competitive tournament scoring model.
 * 
 * Guarantees:
 * 1. Small controlled numbers (anti-inflation).
 * 2. Deterministic: identical gameplay produces identical scores.
 * 3. Anti-farming: Total Score = sum of best score for each completed level.
 */

import { BubbleShooterLevel, LevelScoreBreakdown } from './types';

/**
 * Base pop triangular score:
 * 1: 1, 2: 3, 3: 6, 4: 10, 5: 15, 6: 21, 7: 28...
 */
export function calculateBubblePopScore(groupSize: number): number {
  if (groupSize <= 0) return 0;
  return Math.floor((groupSize * (groupSize + 1)) / 2);
}

/**
 * Large group bonus for exceeding the minimum match size of 3
 */
export function calculateGroupBonus(groupSize: number): number {
  if (groupSize <= 3) return 0;
  return (groupSize - 3) * 2;
}

/**
 * Combo streak bonus: consecutive successful pops
 */
export function calculateComboBonus(combo: number): number {
  if (combo <= 1) return 0;
  return combo * 2;
}

/**
 * Cascade bonus awarded when a single shot causes both a match pop and dropped clusters
 */
export function calculateCascadeBonus(hasMatch: boolean, hasDrop: boolean): number {
  return hasMatch && hasDrop ? 5 : 0;
}

/**
 * Unsupported bubbles dropped score
 */
export function calculateDropScore(droppedCount: number): number {
  if (droppedCount <= 0) return 0;
  // 2 points per bubble + triangular cluster bonus
  const clusterBonus = Math.floor((droppedCount * (droppedCount + 1)) / 2);
  return droppedCount * 2 + clusterBonus;
}

/**
 * Difficulty bonus mapped directly to the level's tier
 */
export function getDifficultyBonus(tier: string, levelNumber: number): number {
  const t = tier.toLowerCase();
  if (levelNumber === 40 || t.includes('master')) return 100;
  if (t.includes('extreme')) return 70;
  if (t.includes('expert+')) return 50;
  if (t.includes('expert')) return 35;
  if (t.includes('very hard')) return 20;
  return 10; // Hard (Levels 1-5)
}

/**
 * Derive par shots for a level if not explicitly provided
 */
export function getParShots(level: BubbleShooterLevel): number {
  if (level.parShots && level.parShots > 0) return level.parShots;
  return Math.max(12, 10 + Math.floor(level.levelNumber * 0.4));
}

/**
 * Derive target time in seconds for a level if not explicitly provided
 */
export function getTargetTimeSeconds(level: BubbleShooterLevel): number {
  if (level.targetTimeSeconds && level.targetTimeSeconds > 0) return level.targetTimeSeconds;
  return Math.max(30, 25 + Math.floor(level.levelNumber * 1.2));
}

export interface ScoreInputParams {
  level: BubbleShooterLevel;
  accumulatedPopScore: number;
  accumulatedGroupBonus: number;
  accumulatedComboBonus: number;
  accumulatedCascadeBonus: number;
  accumulatedDropScore: number;
  shotsUsed: number;
  effectiveShots: number;
  missedShots: number;
  invalidShots?: number;
  activeElapsedSeconds: number;
  previousBestScore: number;
  currentCompletedLevelsBestScores: Record<number, number>;
}

/**
 * Compute the complete, authoritative, deterministic level breakdown
 */
export function computeLevelScoreBreakdown(params: ScoreInputParams): LevelScoreBreakdown {
  const {
    level,
    accumulatedPopScore,
    accumulatedGroupBonus,
    accumulatedComboBonus,
    accumulatedCascadeBonus,
    accumulatedDropScore,
    shotsUsed,
    effectiveShots,
    missedShots,
    invalidShots = 0,
    activeElapsedSeconds,
    previousBestScore,
    currentCompletedLevelsBestScores,
  } = params;

  const parShots = getParShots(level);
  const targetTimeSeconds = getTargetTimeSeconds(level);

  // 1. Efficiency bonus: reward beating par shots, mild penalty for going over
  let efficiencyBonus = 0;
  if (shotsUsed <= parShots) {
    efficiencyBonus = (parShots - shotsUsed) * 3;
  } else {
    // Mild over-par reduction
    efficiencyBonus = -Math.min(15, (shotsUsed - parShots) * 1);
  }

  // 2. Active time bonus: reward faster completion
  const roundedTime = Math.max(1, Math.round(activeElapsedSeconds));
  let timeBonus = 0;
  if (roundedTime < targetTimeSeconds) {
    timeBonus = Math.floor((targetTimeSeconds - roundedTime) * 0.5);
  }

  // 3. Average time per effective shot precision bonus
  const safeEffective = Math.max(1, effectiveShots);
  const avgShotTime = Number((roundedTime / safeEffective).toFixed(1));
  let precisionBonus = 0;
  if (avgShotTime < 3.0) {
    precisionBonus = 8;
  } else if (avgShotTime < 5.0) {
    precisionBonus = 4;
  }

  // 4. Difficulty tier bonus & completion bonus
  const difficultyBonus = getDifficultyBonus(level.difficultyTier, level.levelNumber);
  const completionBonus = 25;

  // 5. Deductions
  const missPenalty = missedShots * 2;
  const invalidPenalty = invalidShots * 1;

  // 6. Subtotal & Final Level Score calculation
  const calculatedTotal =
    accumulatedPopScore +
    accumulatedGroupBonus +
    accumulatedComboBonus +
    accumulatedCascadeBonus +
    accumulatedDropScore +
    efficiencyBonus +
    timeBonus +
    precisionBonus +
    difficultyBonus +
    completionBonus -
    missPenalty -
    invalidPenalty;

  const finalLevelScore = Math.max(10, calculatedTotal);

  // 7. Performance classification
  let performanceRating: 'PERFECT' | 'EXCELLENT' | 'GREAT' | 'GOOD' = 'GOOD';
  if (missedShots === 0 && shotsUsed <= parShots) {
    performanceRating = 'PERFECT';
  } else if (missedShots <= 1 && roundedTime <= targetTimeSeconds) {
    performanceRating = 'EXCELLENT';
  } else if (missedShots <= 3) {
    performanceRating = 'GREAT';
  } else {
    performanceRating = 'GOOD';
  }

  // 8. Star rating
  let stars = 1;
  if (performanceRating === 'PERFECT' || performanceRating === 'EXCELLENT') {
    stars = 3;
  } else if (performanceRating === 'GREAT') {
    stars = 2;
  } else {
    stars = 1;
  }

  const isNewBest = finalLevelScore > previousBestScore;

  // 9. New cumulative total: sum of best score for each completed level
  const updatedBestScores = { ...currentCompletedLevelsBestScores };
  if (isNewBest) {
    updatedBestScores[level.levelNumber] = finalLevelScore;
  }
  const newCumulativeTotal = Object.values(updatedBestScores).reduce((sum, s) => sum + s, 0);

  return {
    levelNumber: level.levelNumber,
    levelName: level.name,
    difficultyTier: level.difficultyTier,
    basePopScore: accumulatedPopScore,
    groupBonus: accumulatedGroupBonus,
    comboBonus: accumulatedComboBonus,
    cascadeBonus: accumulatedCascadeBonus,
    dropBonus: accumulatedDropScore,
    efficiencyBonus,
    timeBonus,
    precisionBonus,
    difficultyBonus,
    completionBonus,
    missPenalty,
    invalidPenalty,
    finalLevelScore,
    shotsUsed,
    parShots,
    effectiveShots,
    missedShots,
    timeTakenSeconds: roundedTime,
    targetTimeSeconds,
    avgShotTime,
    stars,
    performanceRating,
    isNewBest,
    previousBest: previousBestScore,
    newCumulativeTotal,
  };
}
