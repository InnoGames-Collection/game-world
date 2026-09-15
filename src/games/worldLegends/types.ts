/**
 * World Legends - Word-Connect Tournament Types
 */

export interface TargetWord {
  word: string;
  points: number;
  hint?: string;
  isBonus?: boolean;
}

export interface LevelData {
  levelNumber: number;
  theme: string;
  category?: string;
  letters: string[]; // e.g. ['S', 'T', 'A', 'R']
  targetWords: TargetWord[];
  bonusWords?: string[]; // Extra dictionary words that can be swiped for bonus points
  puzzleId?: string;
  seed?: number;
  difficulty?: string;
  distractors?: string[];
  createdAt?: number;
}

export interface WordRecord {
  level: number;
  word: string;
  isSolved: boolean;
  points: number;
}

export interface SessionResultData {
  score: number; // Max 400
  timeUsedSec: number;
  levelReached: number;
  wordsSolved: number;
  wordsTotal: number;
  records: WordRecord[];
  attemptsCount?: number;
  mistakesCount?: number;
  accuracyRate?: number;
  hintsUsedCount?: number;
  shufflesUsedCount?: number;
}

export interface LetterPoint {
  id: number;
  letter: string;
  x: number; // Percentage or px offset on wheel
  y: number;
}
