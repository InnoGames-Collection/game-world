/**
 * Bubble Shooter - Types & Game State Interfaces
 */

export type BubbleColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'PURPLE' | 'WHITE';

export interface BubbleColorDef {
  id: BubbleColor;
  name: string;
  baseColor: string;
  lightColor: string;
  shadowColor: string;
  glowColor: string;
}

export interface GridBubble {
  id: string;
  color: BubbleColor;
  row: number;
  col: number;
  x: number;
  y: number;
  radius: number;
  popAnimationProgress?: number; // 0 to 1
  isPopping?: boolean;
}

export interface ProjectileBubble {
  color: BubbleColor;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface FallingBubble {
  id: string;
  color: BubbleColor;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  alpha: number;
}

export interface PopParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface FloatingScore {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  durationMs: number;
  createdAt: number;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
}

export interface TrajectorySegment {
  points: TrajectoryPoint[];
  reflectionPoint?: TrajectoryPoint;
  targetCell?: { row: number; col: number; x: number; y: number };
}

export interface BubbleShooterLevel {
  levelNumber: number;
  name: string;
  rows: (BubbleColor | null)[][]; // Hex rows (even: 8 cols, odd: 7 cols)
  maxFouls: number; // Missed shots allowed before board descends
  targetScore: number;
  availableColors: BubbleColor[];
  difficultyTier: 'Hard' | 'Hard+' | 'Advanced' | 'Very Hard' | 'Expert' | 'Expert+' | 'Extreme' | 'Master' | 'Championship';
  parShots?: number;
  targetTimeSeconds?: number;
}

export interface LevelSaveData {
  stars: number;
  highScore: number;
  bestShots: number;
  bestTimeSeconds: number;
  performanceRating?: 'PERFECT' | 'EXCELLENT' | 'GREAT' | 'GOOD';
  completedAt?: number;
}

export interface BubbleShooterStats {
  gamesPlayed: number;
  levelsCompleted: number;
  totalShotsFired: number;
  totalEffectiveShots: number;
  totalMissedShots: number;
  totalBubblesPopped: number;
  totalBubblesDropped: number;
  bestCombo: number;
  bestTimeSeconds: number;
  perfectLevelsCount: number;
}

export interface LevelScoreBreakdown {
  levelNumber: number;
  levelName: string;
  difficultyTier: string;
  basePopScore: number;
  groupBonus: number;
  comboBonus: number;
  cascadeBonus: number;
  dropBonus: number;
  efficiencyBonus: number;
  timeBonus: number;
  precisionBonus: number;
  difficultyBonus: number;
  completionBonus: number;
  missPenalty: number;
  invalidPenalty: number;
  finalLevelScore: number;
  shotsUsed: number;
  parShots: number;
  effectiveShots: number;
  missedShots: number;
  timeTakenSeconds: number;
  targetTimeSeconds: number;
  avgShotTime: number;
  stars: number;
  performanceRating: 'PERFECT' | 'EXCELLENT' | 'GREAT' | 'GOOD';
  isNewBest: boolean;
  previousBest: number;
  newCumulativeTotal: number;
}

export interface LevelProgress {
  highestUnlockedLevel: number; // 1 to 40
  completedLevels: Record<number, LevelSaveData>;
  totalScore: number; // Cumulative sum of best scores of completed levels
  stats?: BubbleShooterStats;
}

export type GameState =
  | 'MAIN_MENU'
  | 'LEVEL_SELECT'
  | 'HOW_TO_PLAY'
  | 'LEADERBOARD'
  | 'ACHIEVEMENTS'
  | 'STATISTICS'
  | 'SETTINGS'
  | 'ABOUT'
  | 'READY'
  | 'AIMING'
  | 'SHOOTING'
  | 'RESOLVING_MATCH'
  | 'DROPPING_CLUSTERS'
  | 'PAUSED'
  | 'LEVEL_COMPLETE'
  | 'LEVEL_FAILED'
  | 'CHAMPIONSHIP_COMPLETE';
