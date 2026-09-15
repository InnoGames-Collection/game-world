/**
 * KNIFE MADNESS - Core Type Definitions
 * Professional 3D Knife Throwing Game for Gameworld
 */

export type GameState = 
  | 'idle'
  | 'playing'
  | 'paused'
  | 'level_complete'
  | 'failed'
  | 'game_over';

export type TargetTheme = 
  | 'wood_log'
  | 'apple'
  | 'orange'
  | 'watermelon'
  | 'golden_boss'
  | 'green_apple'
  | 'coconut'
  | 'pumpkin'
  | 'kiwi'
  | 'metal_gear'
  | 'tire'
  | 'cheese'
  | 'waffle'
  | 'eight_ball'
  | 'lifebuoy'
  | 'basketball'
  | 'stone_disc'
  | 'golden_shield'
  | 'peach'
  | 'plum'
  | 'dragon_fruit';

export type FruitType =
  | 'apple'
  | 'orange'
  | 'lemon'
  | 'watermelon'
  | 'kiwi'
  | 'strawberry'
  | 'peach'
  | 'coconut'
  | 'cherry'
  | 'plum';

export interface EmbeddedKnife {
  id: string;
  angle: number; // in radians relative to target rotation
  isObstacle?: boolean; // Pre-embedded knife or obstacle from level setup
  type?: 'standard' | 'bone' | 'dagger' | 'pin';
}

export interface TargetApple {
  id: string;
  angle: number; // in radians relative to target rotation
  sliced: boolean;
  sliceProgress?: number;
  type?: FruitType;
}

export interface FlyingKnife {
  id: string;
  y: number;
  vy: number;
  scale: number;
  rotation: number;
  wobble: number;
}

export interface DeflectedKnife {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  opacity: number;
}

export interface FloatingFeedback {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  opacity: number;
  scale: number;
  vy: number;
  life: number;
}

export interface ImpactParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'spark' | 'wood' | 'apple_juice' | 'smoke';
}

export interface ShatterFragment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  startAngle: number;
  endAngle: number;
  radius: number;
  theme: TargetTheme;
  opacity: number;
}

export interface SlicedApplePart {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  side: 'left' | 'right';
  opacity: number;
  type?: FruitType;
}

export interface LevelConfig {
  levelNumber: number;
  stageNumber: number;
  stageName: string;
  theme: TargetTheme;
  isBossLevel?: boolean;
  isBoss?: boolean;
  bossTitle?: string;
  requiredKnives: number;
  preEmbeddedKnives: { angle: number; type?: 'standard' | 'bone' | 'dagger' | 'pin' }[];
  apples: { angle: number; type?: FruitType }[];
  baseSpeed: number; // radians per second
  speedPattern: 'constant' | 'variable' | 'reverse' | 'pulsing' | 'jerky' | 'extreme_oscillation';
  patternParams?: {
    speedMin?: number;
    speedMax?: number;
    period?: number; // seconds for cycle
    pauseChance?: number;
    reverseChance?: number;
    jerkFrequency?: number;
  };
  hitToleranceDegrees: number; // angular threshold for collision (e.g. 14 degrees)
  themeVariations?: TargetTheme[]; // Alternative visual variations for same level
}

export interface KnifeMadnessScoreBreakdown {
  levelNumber: number;
  isBossLevel: boolean;
  knivesPlaced: number;
  baseKnivesScore: number;
  baseKnifeScore?: number;
  fruitsSlicedCount: number;
  fruitBonusScore: number;
  precisionBonusScore: number;
  comboBonusScore: number;
  efficiencyBonusScore: number;
  parEfficiencyBonusScore?: number;
  timeBonusScore: number;
  parTimeBonusScore?: number;
  difficultyBonusScore: number;
  bossBonusScore: number;
  levelTotalScore: number;
  finalTotalScore?: number;
  stars?: number;
  activeSeconds: number;
  averageThrowInterval: number;
  throwsCount: number;
  maxCombo: number;
  bestPrecisionDeg: number;
  isNewBest: boolean;
  previousBestScore: number;
  newCumulativeTotalScore: number;
}

export interface KnifeMadnessLevelRecord {
  levelNumber: number;
  completed: boolean;
  highScore: number;
  bestScore?: number;
  stars: number; // 1, 2, or 3
  bestTimeSeconds: number;
  bestPrecisionDeg: number;
  bestCombo: number;
  applesCollected: number;
  attemptsCount: number;
  completedTimestamp?: number;
}

export interface KnifeMadnessCareerProgress {
  currentLevel: number;
  unlockedLevel: number;
  totalScore: number; // SUM OF BEST HIGH SCORE FOR EACH COMPLETED LEVEL (Anti-farming)
  levelsCompleted: number;
  totalApplesSliced: number;
  totalFruitsSliced: number;
  totalThrows: number;
  totalSuccessfulThrows: number;
  totalHits: number;
  bestCombo: number;
  bestPrecisionDeg: number;
  bestLevelTimeSeconds: number;
  failedAttempts: number;
  totalFails: number;
  completedLevels: Record<number, KnifeMadnessLevelRecord>;
  levelRecords: Record<number, KnifeMadnessLevelRecord>;
  achievements: string[];
}
