/**
 * EMOJI SORTING BALL - Types & Domain Models
 * 40-Level Professional 3D Emoji-Sorting Puzzle Game
 */

export type EmojiKey = string;
export type EmojiSortingGameState = EmojiGameState;
export type EmojiSortingMoveRecord = EmojiMoveRecord;

export interface EmojiDefinition {
  key: string;
  char: string;
  name: string;
  category: 'faces_happy' | 'faces_expressive' | 'faces_wild' | 'creatures' | 'symbols' | 'food' | 'nature';
  sphereBaseColor: string;
  threeColor: number;
  highlightColor: string;
  shadowColor: string;
}

export interface EmojiSortingLevelConfig {
  level: number;
  tubes: string[][]; // Each inner array represents emoji keys from bottom to top
  capacity: number; // Standard 4
  optimalMoves: number;
  themeTitle?: string;
}

export type EmojiGameState =
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

export interface EmojiMoveRecord {
  fromIndex: number;
  toIndex: number;
  emojiKey: string;
  emoji?: string;
  count: number; // Number of emoji balls transferred together in this group move
}

export interface EmojiSortingPlayerProgress {
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

export interface EmojiSortingLeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  totalScore: number;
  level: number;
  winRate: string;
  isPlayer?: boolean;
}

export interface EmojiSortingAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  unlocked: boolean;
}

export interface EmojiLevelScoreBreakdown {
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
