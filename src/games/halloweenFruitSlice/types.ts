export type GameState = 
  | 'MENU' 
  | 'LEVEL_SELECT' 
  | 'TUTORIAL' 
  | 'COUNTDOWN' 
  | 'PLAYING' 
  | 'PAUSED' 
  | 'GAME_OVER' 
  | 'LEVEL_COMPLETE'
  | 'LEADERBOARD';

export type FruitKind = 
  | 'pumpkin' 
  | 'monster_apple' 
  | 'slime_melon' 
  | 'spooky_lemon' 
  | 'ghost_berry' 
  | 'candy_corn';

export interface FruitConfig {
  kind: FruitKind;
  name: string;
  radius: number;
  scoreValue: number;
  outerColor: string;
  innerColor: string;
  splatterColor: string;
  accentColor: string;
  eyeType: 'angry' | 'cyclops' | 'smiling' | 'spooky' | 'fangs';
}

export interface FlyingObject {
  id: number;
  isBomb: boolean;
  kind: FruitKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  radius: number;
  rotation: number;
  vRot: number;
  sliced: boolean;
  missed: boolean;
  config?: FruitConfig;
  fuseSparkTimer?: number;
}

export interface SlicedHalf {
  id: number;
  kind: FruitKind;
  isLeft: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  radius: number;
  rotation: number;
  vRot: number;
  sliceAngle: number;
  alpha: number;
  config: FruitConfig;
}

export interface SplatterDecal {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  drops: { dx: number; dy: number; r: number }[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  alpha: number;
  scale: number;
  life: number;
  maxLife: number;
}

export interface SlashPoint {
  x: number;
  y: number;
  time: number;
}

export type ObjectiveType = 
  | 'SCORE' 
  | 'SLICES' 
  | 'COMBO' 
  | 'SURVIVE' 
  | 'NO_MISS';

export interface LevelConfig {
  levelNum: number;
  title: string;
  tier: string;
  objectiveType: ObjectiveType;
  objectiveTarget: number;
  objectiveDescription: string;
  timeLimitSec?: number;
  maxMisses: number;
  spawnIntervalMs: number;
  maxSimultaneous: number;
  minSpeedY: number;
  maxSpeedY: number;
  bombChance: number;
  star1: number;
  star2: number;
  star3: number;
}

export interface LevelSaveData {
  unlocked: boolean;
  completed: boolean;
  stars: number;
  highScore: number;
}
