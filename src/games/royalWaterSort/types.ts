export type LiquidColorId =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink';

export interface LiquidColorDef {
  id: LiquidColorId;
  name: string;
  primary: string;
  light: string;
  dark: string;
  glow: string;
  stream: string;
}

export interface BottleState {
  id: number;
  layers: LiquidColorId[]; // bottom to top: index 0 is bottom, layers.length - 1 is top
  capacity: number; // usually 4
  isCompleted?: boolean;
}

export interface MoveRecord {
  sourceBottleId: number;
  destBottleId: number;
  color: LiquidColorId;
  count: number;
  previousSourceLayers: LiquidColorId[];
  previousDestLayers: LiquidColorId[];
}

export interface LevelConfig {
  levelNum: number;
  title: string;
  difficultyLabel: string;
  capacity: number;
  bottles: LiquidColorId[][]; // initial state of each bottle
  parMoves: number;
  timeLimitSec?: number;
  rewardCoins: number;
  baseScore?: number;
}

export interface LevelSaveData {
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0-3
  bestMoves: number;
  highScore: number;
}

export type GameScreen =
  | 'LOADING'
  | 'MENU'
  | 'LEVEL_SELECT'
  | 'HOW_TO_PLAY'
  | 'LEADERBOARD'
  | 'BOOSTERS'
  | 'SETTINGS'
  | 'ABOUT'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_CLEAR'
  | 'CHAMPIONSHIP_COMPLETE'
  | 'NO_MOVES';

export type PourStep =
  | 'IDLE'
  | 'MOVING_SOURCE'
  | 'TILTING_SOURCE'
  | 'POURING'
  | 'SETTLING';

export interface PourAnimationState {
  isPouring: boolean;
  step: PourStep;
  sourceBottleId: number | null;
  destBottleId: number | null;
  color: LiquidColorId | null;
  count: number;
  progress: number; // 0 to 1
  sourceOffset: { x: number; y: number };
  tiltAngle: number;
  sourceTransferProgress: number; // 0 to 1: fraction of transferred units removed
  destTransferProgress: number; // 0 to 1: fraction of transferred units added
  streamOrigin: { x: number; y: number } | null;
  streamTarget: { x: number; y: number } | null;
}

export interface HintAction {
  sourceBottleId: number;
  destBottleId: number;
  color: LiquidColorId;
}

export interface LevelScoreBreakdown {
  levelNum: number;
  baseScore: number;
  timeBonus: number;
  moveBonus: number;
  hintPenalty: number;
  extraTubePenalty: number;
  invalidPenalty: number;
  finalScore: number;
  isNewBest: boolean;
  cumulativeTotalScore: number;
  moves: number;
  parMoves: number;
  timeSeconds: number;
  stars: number;
}

export interface CareerSummary {
  totalCumulativeScore: number;
  levelsCompleted: number;
  totalStars: number;
  bestLevelScore: { levelNum: number; score: number };
  totalMoves: number;
  totalPlaytimeSeconds: number;
}

