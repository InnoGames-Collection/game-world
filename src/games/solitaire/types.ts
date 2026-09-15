/**
 * Solitaire Game Types & Data Models
 * Klondike Solitaire with 52-card standard deck, Draw 1 / Draw 3 modes,
 * 40-level progressive campaign, and persistent state.
 */

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type SuitColor = 'red' | 'black';

export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  isFaceUp: boolean;
}

export type GameMode = 'draw1' | 'draw3';

export type PileLocation = 
  | { type: 'tableau'; colIndex: number; cardIndex: number }
  | { type: 'waste'; cardIndex: number }
  | { type: 'foundation'; suitIndex: number; cardIndex: number }
  | { type: 'stock' };

export interface MoveRecord {
  source: 'tableau' | 'waste' | 'foundation';
  sourceIndex: number;
  dest: 'tableau' | 'foundation';
  destIndex: number;
  cards: Card[];
  flippedPreviousCard: boolean;
  pointsChange: number;
  bonusChange: number;
}

export interface LevelConfig {
  level: number;
  title: string;
  mode: GameMode;
  difficulty: 'Hard' | 'Hard+' | 'Very Hard' | 'Expert' | 'Expert+' | 'Extreme' | 'Master' | 'Master+';
  seed: number;
  targetScore: number;
  moveTarget: number;
  timeLimitSeconds?: number;
  starThresholds: [number, number, number];
  description: string;
}

export interface MoveHistoryItem {
  tableau: Card[][];
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  score: number;
  moves: number;
  description: string;
}

export interface SolitaireSaveData {
  highestUnlockedLevel: number;
  stars: Record<number, number>;
  bestScores: Record<number, number>;
  bestTimes: Record<number, number>;
  soundEnabled: boolean;
  musicEnabled: boolean;
  handMode: 'left' | 'right';
  completedDailyChallenges: string[];
  lastDailyChallengeDate?: string;
  dailyStreak: number;
}
