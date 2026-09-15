/**
 * Archery Strike 3D - Types & Game Interfaces
 */

export type RingType = 'BULLSEYE' | 'GOLD' | 'RED' | 'BLUE' | 'BLACK' | 'WHITE' | 'MISS';

export interface WindCondition {
  speed: number; // m/s (e.g. 0.8 to 8.5)
  directionDegrees: number; // 0 to 360 (0 = headwind, 90 = right, 180 = tailwind, 270 = left)
  label: string;
}

export interface TargetConfig {
  id: string;
  x: number; // world coordinates
  y: number; // height from ground
  z: number; // distance in meters (30 to 80)
  radius: number; // physical radius in meters (typically 0.6m to 1.1m)
  isMoving?: boolean;
  moveSpeed?: number;
  moveRange?: number;
  moveAxis?: 'x' | 'y';
  initialPhase?: number;
  label?: string;
}

export interface StageDefinition {
  stageNumber: number;
  title: string;
  subtitle: string;
  description: string;
  targets: TargetConfig[];
  targetDistance: number;
  wind: WindCondition;
  maxArrows: number;
  requiredScore?: number;
  targetScale: number;
  isMovingTarget?: boolean;
}

export interface ShotResult {
  arrowNumber: number; // 1 to 10
  stageNumber: number;
  distanceMeters: number;
  windSpeed: number;
  windAngle: number;
  ring: RingType;
  baseScore: number;
  distanceBonus: number;
  streakMultiplier: number;
  totalShotScore: number;
  hitX: number; // normalized target offset (-1 to 1)
  hitY: number;
  impactDistance: number; // distance from bullseye center in meters
  timestamp: number;
  targetId: string;
}

export interface BallisticTrajectoryPoint {
  x: number;
  y: number;
  z: number;
  time: number;
}
