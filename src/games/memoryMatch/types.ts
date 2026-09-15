/**
 * Memory Match - Type Definitions
 * TelePlus Ethiopia Premium HTML5 Mobile Gaming Suite
 */

export type MemoryCardCategory = 
  | 'fruit'
  | 'landmarks'
  | 'people'
  | 'football'
  | 'musicians'
  | 'flags'
  | 'nature'
  | 'vehicles'
  | 'technology'
  | 'sports'
  | 'ethiopia'
  | 'wildlife'
  | 'treasure'
  | 'adventure';

export type MemoryGameState = 
  | 'PLAYING'
  | 'CHECKING'
  | 'LEVEL_WON'
  | 'LEVEL_LOST'
  | 'ALL_LEVELS_WON'
  | 'PAUSED';

export interface CardSymbolDefinition {
  id: string;
  name: string;
  category: MemoryCardCategory;
  categoryLabel: string;
  accentColor: string;
  glowColor: string;
  imageUrl: string;
  objectPosition?: string;
  fallbackGradient?: string;
  iconName?: string;
}

export interface MemoryCard {
  id: string;             // Unique card instance ID (e.g. "mc-1-0-xyz")
  pairId: string;         // Shared pair identifier (e.g. "sym-eth-wolf")
  symbolId: string;
  imageUrl?: string;
  name?: string;
  index: number;
  row: number;
  col: number;
  isFlipped: boolean;
  isMatched: boolean;
  isError: boolean;
  isJustMatched: boolean;
}

export type DifficultyTier =
  | 'HARD'
  | 'HARD+'
  | 'VERY HARD'
  | 'VERY HARD+'
  | 'EXPERT'
  | 'EXPERT+'
  | 'EXTREME'
  | 'MASTER'
  | 'FINAL CHALLENGE';

export type MemoryMenuView = 
  | 'MENU'
  | 'PLAY'
  | 'LEVELS'
  | 'DAILY'
  | 'HOW_TO_PLAY'
  | 'ACHIEVEMENTS'
  | 'STATS'
  | 'SETTINGS'
  | 'ABOUT'
  | 'LEADERBOARD';

export interface LevelConfig {
  levelNumber: number;
  pairsCount: number;
  totalCards: number;
  cols: number;
  rows: number;
  targetMoves: number;    // Reference for move efficiency bonus & 3-star rating
  timeLimit: number;      // Level time limit in seconds
  title: string;
  themeCategory: string;
  difficultyTier: DifficultyTier;
  difficultyMultiplier: number;
  coinReward: number;
  visualSimilarityTier: 1 | 2 | 3 | 4; // 1 = distinct, 4 = extreme similarity
}

export interface CalculatedScore {
  baseMatchPoints: number;
  timeBonus: number;
  efficiencyBonus: number;
  streakBonus: number;
  completionBonus: number;
  mistakePenalty: number;
  rawScore: number;
  difficultyMultiplier: number;
  finalLevelScore: number;
  stars: number;
}

export interface MemoryMatchStorageData {
  currentLevel: number;
  unlockedLevel: number;
  totalCumulativeScore: number;
  levelScores: Record<number, number>;
  bestTimes: Record<number, number>;
  bestMoves: Record<number, number>;
  stars: Record<number, number>;
  totalPairsMatched: number;
  totalMoves: number;
  totalMistakes: number;
  bestCombo: number;
  levelsCompleted: number;
  achievements: string[];
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  dailyLastCompletedDate?: string;
  dailyBestScore?: number;
}

export interface LevelResult {
  levelNumber: number;
  pairs: number;
  moves: number;
  accuracy: number;
  score: number;
  coinsEarned: number;
}
