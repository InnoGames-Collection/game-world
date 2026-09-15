/**
 * SORTING BALLS - Types & Domain Models
 * 40-Level Professional 3D Color-Sorting Puzzle Game
 */

export type BallColorKey =
  | 'yellow'
  | 'red'
  | 'cyan'
  | 'blue'
  | 'green'
  | 'white'
  | 'orange'
  | 'purple'
  | 'magenta'
  | 'brown'
  | 'gray';

export interface BallColorDefinition {
  key: BallColorKey;
  name: string;
  hex: string;
  threeColor: number;
  highlightHex: string;
  shadowHex: string;
}

export interface SortingLevelConfig {
  level: number;
  tubes: BallColorKey[][]; // Each inner array represents balls from bottom to top
  capacity: number; // Standard 4
  optimalMoves: number;
}

export type GameState =
  | 'MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_COMPLETE'
  | 'LEVEL_SELECT'
  | 'LEADERBOARD'
  | 'HOW_TO_PLAY'
  | 'ACHIEVEMENTS'
  | 'STATISTICS'
  | 'SETTINGS'
  | 'ABOUT';

export interface MoveRecord {
  fromIndex: number;
  toIndex: number;
  color: BallColorKey;
  count: number; // Number of balls transferred together in this group move
}

export interface SortingPlayerProgress {
  unlockedLevel: number; // 1 to 40
  completedLevels: number[];
  bestMoves: Record<number, number>;
  levelScores: Record<number, number>;
  levelBestScores?: Record<number, number>;
  levelBestTimes: Record<number, number>;
  stars: Record<number, number>;
  levelStars?: Record<number, number>;
  totalCompleted?: number;
  highScore: number; // Highest single-level score
  totalCumulativeScore: number; // Cumulative sum of best scores on completed levels
  totalGamesPlayed?: number;
  totalMovesMade?: number;
  totalUndosUsed?: number;
  totalHintsUsed?: number;
  totalExtraTubesUsed?: number;
  totalInvalidMoves?: number;
  soundEnabled?: boolean;
  unlockedAchievements?: string[];
  stats?: {
    gamesPlayed: number;
    totalUndosUsed: number;
    totalHintsUsed: number;
    totalExtraTubesUsed: number;
  };
}

export interface SortingLeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  totalScore: number;
  level: number;
  winRate: string;
  isPlayer?: boolean;
}

export interface SortingAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  unlocked: boolean;
}

export interface LevelScoreBreakdown {
  levelNumber?: number;
  basePoints: number;
  completionBonus?: number;
  moveScore?: number;
  moveBonus?: number;
  moveEfficiencyDiff?: number;
  timeBonus: number;
  timeTakenSeconds: number;
  undoPenalty: number;
  hintPenalty: number;
  extraTubePenalty: number;
  invalidMovePenalty?: number;
  difficultyMultiplier?: number;
  finalLevelScore?: number;
  totalScore?: number;
  isNewBest?: boolean;
  previousBestLevelScore?: number;
  newCumulativeTotalScore?: number;
  stars?: number;
  moves?: number;
  optimalParMoves?: number;
}
