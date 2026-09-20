/**
 * Puzzle Block Core Types & Data Definitions
 */

export type BlockColor = 'cyan' | 'green' | 'magenta' | 'yellow' | 'orange' | 'purple';

export type SpecialBlockType = 'none' | 'bomb' | 'line_h' | 'line_v';

export type BlockerType = 'none' | 'wood' | 'ice' | 'stone' | 'locked';

export interface GridCell {
  occupied: boolean;
  color?: BlockColor;
  blocker?: BlockerType;
  iceHits?: number; // 2 hits needed to break ice
  special?: SpecialBlockType;
  isClearing?: boolean;
  clearingAnimKey?: number;
}

export interface PolyominoShape {
  id: string;
  name: string;
  matrix: number[][]; // 1 = occupied, 0 = empty
  color: BlockColor;
  special?: SpecialBlockType;
  difficultyWeight?: number; // 1 (common) to 5 (rare/hard)
}

export interface TrayPiece {
  instanceId: string;
  shape: PolyominoShape;
  placed: boolean;
}

export type LevelDifficulty = 
  | 'starter'
  | 'easy'
  | 'medium'
  | 'hard' 
  | 'hard+' 
  | 'very_hard' 
  | 'expert' 
  | 'expert+' 
  | 'extreme' 
  | 'master' 
  | 'master+';

export interface LevelDefinition {
  id: number;
  title: string;
  difficulty: LevelDifficulty;
  targetScore: number;
  targetLines?: number;
  targetBlockers?: number;
  description: string;
  reshuffleLimit: number;
  initialBoard?: {
    row: number;
    col: number;
    color?: BlockColor;
    blocker?: BlockerType;
    special?: SpecialBlockType;
  }[];
  starThresholds: [number, number, number]; // [1 star, 2 stars, 3 stars]
  allowedShapes?: string[]; // specific shapes subset if curated
}

export interface PuzzleBlockSaveData {
  highestUnlockedLevel: number;
  stars: Record<number, number>;
  bestScores: Record<number, number>;
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticEnabled?: boolean;
  dailyChallengeCompleted: boolean;
  dailyChallengeDate: string;
  // Real Statistics
  totalScore: number;
  highestScore: number;
  totalLinesCleared: number;
  totalBlocksPlaced: number;
  totalGamesPlayed: number;
  levelsCompletedCount: number;
}

export type PuzzleBlockView = 
  | 'MENU'
  | 'INTRO'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_SELECT'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER'
  | 'LEADERBOARD'
  | 'HELP'
  | 'DAILY_CHALLENGE'
  | 'ACHIEVEMENTS'
  | 'STATISTICS'
  | 'SETTINGS'
  | 'ABOUT';

export interface ClearParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
  rotation: number;
  vRot: number;
}
