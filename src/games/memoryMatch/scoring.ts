/**
 * Memory Match - Authoritative Competitive Scoring Engine
 * TelePlus Ethiopia Gaming Suite
 * 
 * Deterministic mathematical model:
 * - Base points per match
 * - Time performance bonus (faster completion = higher score)
 * - Move efficiency bonus (accuracy = pairs / moves)
 * - Streak/Combo reward
 * - Level completion bonus
 * - Mistake penalty (wrong pairs reduce score, clamped)
 * - Level difficulty multiplier (higher levels have greater scoring potential)
 */

import { CalculatedScore, LevelConfig } from './types';

export interface ScoreInput {
  levelConfig: LevelConfig;
  moves: number;
  timeUsedSeconds: number;
  incorrectAttempts: number;
  maxStreak: number;
}

/**
 * Calculates deterministic, balanced competitive score for level completion.
 */
export function calculateAuthoritativeScore(input: ScoreInput): CalculatedScore {
  const { levelConfig, moves, timeUsedSeconds, incorrectAttempts, maxStreak } = input;
  const { pairsCount, timeLimit, difficultyMultiplier } = levelConfig;

  // 1. Base Match Score (10 points per pair)
  const baseMatchPoints = pairsCount * 10;

  // 2. Time Performance Bonus
  // Target: faster completion yields higher bonus.
  // If completed within time limit, player gets points proportional to remaining time.
  const timeRemaining = Math.max(0, timeLimit - timeUsedSeconds);
  const timeRatio = Math.min(1, timeRemaining / Math.max(1, timeLimit));
  // Bonus scales up to 45 points based on speed
  const timeBonus = Math.round(timeRatio * 45);

  // 3. Move Efficiency Bonus
  // Perfect recall = pairsCount moves (ratio 1.0)
  const totalMoves = Math.max(pairsCount, moves);
  const efficiencyRatio = pairsCount / totalMoves; // 1.0 for perfect, ~0.5 for 2x moves
  // Bonus up to 35 points
  const efficiencyBonus = Math.round(Math.pow(efficiencyRatio, 0.9) * 35);

  // 4. Streak / Combo Multiplier Bonus
  // Consecutive pairs without error
  const streakBonus = Math.round(Math.min(maxStreak, 8) * 4);

  // 5. Completion Bonus (flat reward for conquering the board)
  const completionBonus = 20 + pairsCount;

  // 6. Mistake Penalty (each error deducts 3 points)
  const mistakePenalty = incorrectAttempts * 3;

  // Raw level score before difficulty multiplier
  // Floor raw score at a minimum of 20 points so completion always yields a reward
  const rawScore = Math.max(20, (
    baseMatchPoints +
    timeBonus +
    efficiencyBonus +
    streakBonus +
    completionBonus -
    mistakePenalty
  ));

  // Weighted by level difficulty multiplier (e.g. 1.00x at L1 to 1.78x at L40)
  const finalLevelScore = Math.round(rawScore * difficultyMultiplier);

  // 7. Star Rating (1 to 3 stars based on combined efficiency and time)
  let stars = 1;
  const targetMoves = levelConfig.targetMoves;
  if (moves <= targetMoves + 1 && timeUsedSeconds <= timeLimit * 0.75) {
    stars = 3;
  } else if (moves <= Math.round(targetMoves * 1.5) && timeUsedSeconds <= timeLimit * 0.95) {
    stars = 2;
  } else {
    stars = 1;
  }

  return {
    baseMatchPoints,
    timeBonus,
    efficiencyBonus,
    streakBonus,
    completionBonus,
    mistakePenalty,
    rawScore,
    difficultyMultiplier,
    finalLevelScore,
    stars,
  };
}

/**
 * Calculates in-game estimated progressive score during active gameplay.
 */
export function calculateInGameProgressiveScore(
  levelConfig: LevelConfig,
  pairsFound: number,
  moves: number,
  streak: number
): number {
  if (pairsFound <= 0) return 0;
  const progressRatio = pairsFound / levelConfig.pairsCount;
  const accuracy = moves > 0 ? pairsFound / moves : 1;
  const streakFactor = 1 + Math.min(streak, 5) * 0.05;
  const basePoints = pairsFound * 10;
  const estimatedBonus = Math.round(40 * progressRatio * accuracy * streakFactor);
  return Math.round((basePoints + estimatedBonus) * levelConfig.difficultyMultiplier);
}
