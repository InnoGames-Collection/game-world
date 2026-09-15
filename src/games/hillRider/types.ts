/**
 * Hill Climb 3D - Types & Interfaces for Mobile Off-Road Driving
 */

export interface Collectible3D {
  id: string;
  type: 'coin' | 'fuel';
  x: number;
  y: number;
  z: number;
  collected: boolean;
  value: number;
}

export type GameState = 
  | 'start_screen' 
  | 'countdown' 
  | 'playing' 
  | 'airborne' 
  | 'grounded' 
  | 'off_road' 
  | 'flipped' 
  | 'paused' 
  | 'game_over';

export type CrashReason = 'flipped' | 'out_of_fuel' | 'off_road' | 'time_up';

export interface VehiclePhysics3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  pitch: number; // Pitch angle in radians
  roll: number;  // Roll angle in radians
  yaw: number;   // Yaw angle in radians
  angularVelPitch: number;
  angularVelRoll: number;
  angularVelYaw: number;
  wheelRotation: number;
  // 4-Wheel Independent Suspension & Contact States
  frontLeftGrounded: boolean;
  frontRightGrounded: boolean;
  rearLeftGrounded: boolean;
  rearRightGrounded: boolean;
  frontLeftComp: number;
  frontRightComp: number;
  rearLeftComp: number;
  rearRightComp: number;
  rearSuspensionComp: number;
  frontSuspensionComp: number;
  isGrounded: boolean;
  rearGrounded: boolean;
  frontGrounded: boolean;
  isAirborne: boolean;
  isOffRoad: boolean;
  fuel: number; // 0 to 100%
  distance: number; // meters traveled along road
  coinsCollected: number;
  airTimeMs: number;
  consecutiveAirTime: number;
  isFlipped: boolean;
  flipTimer: number;
  isCrashed: boolean;
  crashReason: CrashReason | null;
  
  // Deterministic Tournament Scoring Metrics
  driveTimeSeconds: number;
  cleanTimeSeconds: number;
  stableDistanceMeters: number;
  smoothSpeedSeconds: number;
  excessiveBrakeEvents: number;
  successfulLandings: number;
  cleanHillCrests: number;
  hardLandingPenalties: number;
  finalScore: number;
  scoreBreakdown: {
    distanceScore: number;
    speedControlScore: number;
    stabilityScore: number;
    landingScore: number;
    survivalScore: number;
  };
}

export interface HillRiderStorage {
  coins: number;
  bestDistance: number;
  bestScore: number;
  totalRuns: number;
}
