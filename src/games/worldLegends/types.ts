/**
 * World Legends - Word-Connect Tournament Types
 */

export interface TargetWord {
  word: string;
  points: number;
  hint?: string;
  isBonus?: boolean;
}

export interface WordQuestion {
  id: string;
  wordNumber: number; // 1-based (e.g. 1..5)
  totalWords: number; // Total words in this level (e.g. 5, 6, 7...)
  word: string; // The target word, e.g. "BREAD"
  letters: string[]; // Letters on the wheel (shuffled, with proper duplicate counts)
  revealedIndices: number[]; // Indices of boxes pre-revealed on the board
  preRevealedIndices?: number[]; // Alias for pre-revealed indices
  theme: string;
  category: string;
  difficulty: 'moderate' | 'moderate-hard' | 'hard' | 'harder' | 'hardest';
  bonusWords?: string[];
  points?: number;
  clue?: string;
  targetSeconds?: number;
  difficultyWeight?: number;
}

export interface MultiWordLevelData {
  levelNumber: number;
  theme: string;
  category: string;
  totalWords: number;
  questions: WordQuestion[];
  scoreMultiplier: number;
  difficultyLabel: string;
  bonusWords?: string[];
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
  // Multi-word progression integration
  totalWords?: number;
  questions?: WordQuestion[];
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
