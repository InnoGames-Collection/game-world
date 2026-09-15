/**
 * SOCCER PING PONG - Deterministic Skill-Based Scoring Engine
 * Strictly Non-Random (No Math.random() in score calculations)
 * Factors:
 * 1. Return quality (PERFECT, GOOD, DEFENSIVE_SAVE, BAD)
 * 2. Ball speed at contact
 * 3. Rally length progressive curve
 * 4. Placement accuracy (contact sweet spot offset)
 * 5. Wing defense difficulty (defending acute angles)
 * 6. Consecutive hit multiplier (capped at 2.5x)
 * 7. Level scaling factor
 * 8. Anti-camping / Anti-farming diminishing returns for static positioning
 */

import { HitQuality } from './types';

export interface ScoreBreakdown {
  total: number;
  quality: HitQuality;
  multiplier: number;
  isPower: boolean;
  isDefensiveSave: boolean;
}

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
  let base = 100;

  // 2. Return quality points
  if (quality === 'PERFECT') {
    base += 150;
  } else if (quality === 'DEFENSIVE_SAVE') {
    base += 120; // High reward for difficult wing defense
  } else if (quality === 'GOOD') {
    base += 70;
  } else {
    base += 30; // Bad / Weak
  }

  // 3. Rally length progressive bonus (controlled curve)
  const rallyBonus = Math.min(360, rally * 25);

  // 4. Ball speed bonus (faster incoming ball = more skill required)
  const speedBonus = Math.round(ballSpeed * 0.22);

  // 5. Accuracy bonus (closer to paddle center = higher bonus, except for wing saves)
  const accuracyBonus =
    quality === 'DEFENSIVE_SAVE'
      ? 50
      : Math.round((1 - Math.min(1, Math.abs(offset))) * 60);

  // 6. Power kick timing boost
  const powerBonus = isPower ? 100 : 0;

  const rawScore = base + rallyBonus + speedBonus + accuracyBonus + powerBonus;

  // 7. Multiplier based on consecutive rally count (strictly capped at 2.5x)
  let multiplier = 1.0;
  if (rally >= 16) multiplier = 2.0;
  else if (rally >= 11) multiplier = 1.75;
  else if (rally >= 7) multiplier = 1.5;
  else if (rally >= 4) multiplier = 1.25;

  if (isPower && quality === 'PERFECT') {
    multiplier = Math.min(2.5, multiplier + 0.25);
  }

  // 8. Level difficulty factor
  const levelFactor = 1.0 + (level - 1) * 0.04;

  // 9. Anti-Farming: diminishing returns if player stands in identical spot
  let campingPenalty = 1.0;
  if (consecutiveStaticHits >= 3) {
    campingPenalty = Math.max(0.4, 1.0 - (consecutiveStaticHits - 2) * 0.2);
  }

  const calculated = Math.round(rawScore * multiplier * levelFactor * campingPenalty);

  return {
    total: Math.max(40, calculated),
    quality,
    multiplier,
    isPower,
    isDefensiveSave: quality === 'DEFENSIVE_SAVE',
  };
}

export function calculateGoalBonus(level: number, rally: number): number {
  // Bonus when computer fails to defend and player scores a goal
  const baseGoal = 600;
  const rallyBonus = Math.min(800, rally * 50);
  const levelBonus = (level - 1) * 45;
  return baseGoal + rallyBonus + levelBonus;
}
