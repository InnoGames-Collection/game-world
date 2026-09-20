/**
 * SOCCER PING PONG - Deterministic Skill-Based Scoring Engine
 * Strictly Non-Random (No Math.random() in score calculations)
 * Compliant with Parts 29–39:
 * 
 * Goal Score Formula:
 * goalPoints = BASE_GOAL_POINTS × LEVEL_MULTIPLIER × DIFFICULTY_MULTIPLIER 
 *            × RALLY_MULTIPLIER × PERFORMANCE_MULTIPLIER × STREAK_MULTIPLIER
 * 
 * Factors:
 * 1. Base Goal value (500 pts)
 * 2. Level multiplier: 1.0 + (level - 1) * 0.08 (1.0x at Lvl 1 up to 4.12x at Lvl 40)
 * 3. Difficulty tier multiplier (Foundation 1.0x up to Elite 3.1x)
 * 4. Rally multiplier: 1-2 (1.0x), 3-4 (1.2x), 5-7 (1.45x), 8-12 (1.75x), 13+ (2.1x, capped at 2.5x)
 * 5. Return quality / performance multiplier (PERFECT = 1.5x, DEFENSIVE_SAVE = 1.35x, GOOD = 1.1x)
 * 6. Streak multiplier: consecutive goals / wins (capped at 2.0x)
 * 7. Speed & sweet-spot timing bonuses
 * 8. Anti-camping / Anti-farming diminishing returns for static positioning
 */

import { HitQuality, DifficultyTier } from './types';

export interface ScoreBreakdown {
  total: number;
  quality: HitQuality;
  multiplier: number;
  isPower: boolean;
  isDefensiveSave: boolean;
}

export interface GoalScoreBreakdown {
  total: number;
  baseGoalPoints: number;
  levelMultiplier: number;
  difficultyMultiplier: number;
  rallyMultiplier: number;
  performanceMultiplier: number;
  streakMultiplier: number;
}

export const BASE_GOAL_POINTS = 500;

export function getDifficultyMultiplier(tier?: DifficultyTier | string): number {
  switch (tier) {
    case 'Foundation':
      return 1.0;
    case 'Moderate':
      return 1.2;
    case 'Challenging':
      return 1.45;
    case 'Advanced':
      return 1.7;
    case 'Pressure':
      return 2.0;
    case 'Expert':
      return 2.35;
    case 'Master':
      return 2.7;
    case 'Elite':
      return 3.1;
    default:
      return 1.25;
  }
}

export function getRallyMultiplier(rally: number): number {
  if (rally <= 2) return 1.0;
  if (rally <= 4) return 1.2;
  if (rally <= 7) return 1.45;
  if (rally <= 12) return 1.75;
  return Math.min(2.5, 1.9 + (rally - 12) * 0.05);
}

/**
 * Deterministic Goal Scoring Model (Parts 30-35)
 */
export function calculateGoalScore(
  level: number,
  difficultyTier: DifficultyTier | string,
  rally: number,
  streak: number,
  quality: HitQuality = 'PERFECT'
): GoalScoreBreakdown {
  const baseGoalPoints = BASE_GOAL_POINTS;

  // 1. Level Multiplier: 1.0 at Lvl 1, smoothly climbing to 4.12 at Lvl 40
  const levelMultiplier = 1.0 + (level - 1) * 0.08;

  // 2. Difficulty Multiplier: 1.0x to 3.1x
  const difficultyMultiplier = getDifficultyMultiplier(difficultyTier);

  // 3. Rally Multiplier: 1.0x to 2.5x
  const rallyMultiplier = getRallyMultiplier(rally);

  // 4. Performance / Quality Multiplier
  let performanceMultiplier = 1.0;
  if (quality === 'PERFECT') {
    performanceMultiplier = 1.5;
  } else if (quality === 'DEFENSIVE_SAVE') {
    performanceMultiplier = 1.35;
  } else if (quality === 'GOOD') {
    performanceMultiplier = 1.15;
  }

  // 5. Streak Multiplier (consecutive goals/rallies, strictly capped at 2.0x)
  const streakMultiplier = Math.min(2.0, 1.0 + Math.max(0, streak) * 0.15);

  const rawGoalScore =
    baseGoalPoints *
    levelMultiplier *
    difficultyMultiplier *
    rallyMultiplier *
    performanceMultiplier *
    streakMultiplier;

  const total = Math.round(rawGoalScore);

  return {
    total,
    baseGoalPoints,
    levelMultiplier,
    difficultyMultiplier,
    rallyMultiplier,
    performanceMultiplier,
    streakMultiplier,
  };
}

/**
 * Deterministic Return Skill Score (during live volleys)
 */
export function calculateSkillScore(
  level: number,
  quality: HitQuality,
  rally: number,
  ballSpeed: number,
  offset: number,
  consecutiveStaticHits: number,
  isPower: boolean
): ScoreBreakdown {
  // 1. Base points for successful return
  let base = 80;

  // 2. Return quality points
  if (quality === 'PERFECT') {
    base += 120;
  } else if (quality === 'DEFENSIVE_SAVE') {
    base += 100;
  } else if (quality === 'GOOD') {
    base += 60;
  } else {
    base += 25;
  }

  // 3. Rally length progressive curve
  const rallyBonus = Math.min(400, rally * 20);

  // 4. Ball speed bonus (faster incoming ball = more skill required)
  const speedBonus = Math.round(ballSpeed * 0.18);

  // 5. Sweet-spot accuracy bonus
  const accuracyBonus =
    quality === 'DEFENSIVE_SAVE'
      ? 45
      : Math.round((1 - Math.min(1, Math.abs(offset))) * 50);

  // 6. Power kick timing boost
  const powerBonus = isPower ? 80 : 0;

  const rawScore = base + rallyBonus + speedBonus + accuracyBonus + powerBonus;

  // 7. Multiplier based on consecutive rally count
  const multiplier = getRallyMultiplier(rally);

  // 8. Level scaling factor
  const levelFactor = 1.0 + (level - 1) * 0.04;

  // 9. Anti-Farming: diminishing returns if player stands in identical spot
  let campingPenalty = 1.0;
  if (consecutiveStaticHits >= 3) {
    campingPenalty = Math.max(0.4, 1.0 - (consecutiveStaticHits - 2) * 0.2);
  }

  const calculated = Math.round(rawScore * multiplier * levelFactor * campingPenalty);

  return {
    total: Math.max(30, calculated),
    quality,
    multiplier,
    isPower,
    isDefensiveSave: quality === 'DEFENSIVE_SAVE',
  };
}

/**
 * Backward compatibility alias for goal bonus
 */
export function calculateGoalBonus(level: number, rally: number, difficultyTier: string = 'Moderate', streak: number = 0): number {
  return calculateGoalScore(level, difficultyTier, rally, streak, 'PERFECT').total;
}
