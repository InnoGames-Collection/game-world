/**
 * EMOJI IQ — Core Types & Data Models
 * 40-Level Professional Tournament Emoji + Number Math Puzzle Game
 */

export type EmojiIqScreen =
  | 'HOME'
  | 'LEVEL_SELECT'
  | 'LEVEL_INFO'
  | 'PLAYING'
  | 'FEEDBACK'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER'
  | 'LEADERBOARD'
  | 'STORE'
  | 'SETTINGS'
  | 'HOW_TO_PLAY';

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export type PuzzleType =
  | 'TYPE_A_SIMPLE_ADDITION'
  | 'TYPE_B_SUBTRACTION'
  | 'TYPE_C_MULTIPLICATION'
  | 'TYPE_D_DIVISION'
  | 'TYPE_E_MIXED_OPERATIONS'
  | 'TYPE_F_ORDER_OF_OPERATIONS'
  | 'TYPE_G_CHANGED_QUANTITY'
  | 'TYPE_H_CHANGED_COMBINATION'
  | 'TYPE_I_VISUAL_DIFFERENCE'
  | 'TYPE_J_MULTIPLE_UNKNOWNS'
  | 'TYPE_K_FAST_CALCULATION'
  | 'TYPE_L_EXPERT_MULTI_STEP';

/**
 * A single equation row in the puzzle.
 * e.g. [ { emoji: '🍎', count: 1 } ] + [ { emoji: '🍎', count: 1 } ] = 10
 */
export interface EquationItem {
  emoji: string;
  count?: number; // visual quantity multiplier e.g. 2 for 🍎🍎 or 👟👟
  label?: string; // e.g. 'pair of sneakers' vs 'single sneaker'
  variant?: string; // visual note e.g. 'with 3 zzz' vs 'with 1 z'
}

export interface EquationRow {
  items: (EquationItem | string)[]; // alternating item and operator e.g. [item1, '+', item2]
  result: number | '?'; // number for clues, '?' for the final puzzle row
}

export interface EmojiIqQuestion {
  id: string;
  level: number;
  questionIndex: number;
  type: PuzzleType;
  title?: string;
  difficulty: QuestionDifficulty;
  equations: EquationRow[];
  options: number[]; // exactly 4 plausible choices
  correctAnswer: number;
  correctIndex: number; // 0, 1, 2, 3
  basePoints: number; // 40-80 (Easy), 70-130 (Med), 100-180 (Hard), 150-250 (Expert)
  timeLimitSeconds: number; // 15s to 7s
  hintText: string;
  explanation: string;
  emojiValues: Record<string, number>;
}

export interface EmojiIqLevelConfig {
  level: number;
  title: string;
  difficultyStars: number; // 1 to 5
  timeLimitSeconds: number;
  targetScore: number;
  questionCount: number; // 10 to 12
  theme: string;
  rewardCoins: number;
}

export interface TournamentScoreCalculation {
  basePoints: number;
  responseSeconds: number;
  timeLimitSeconds: number;
  speedTier: 'VERY_FAST' | 'FAST' | 'NORMAL' | 'SLOW' | 'TIMEOUT';
  speedBonusPercent: number; // +30%, +20%, +10%, +5%, +0%
  comboCount: number;
  comboMultiplier: number; // x1.1, x1.2, x1.4, x1.6, x1.8, x2.0
  hintsUsedOnQuestion: number;
  hintPenaltyMultiplier: number; // 1.0 (0 hints), 0.8 (1 hint), 0.6 (2 hints)
  isPerfect: boolean;
  perfectBonusPoints: number;
  totalPointsAwarded: number;
}

export interface TournamentLeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatarEmoji: string;
  score: number;
  level: number;
  bestCombo: number;
  accuracy: number;
  isCurrentUser?: boolean;
}

export interface EmojiIqPlayerStats {
  totalTournamentScore: number;
  currentLevel: number;
  unlockedLevel: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  perfectCount: number;
  bestCombo: number;
  hintsUsed: number;
  coins: number;
  availableHints: number;
  lives: number;
  starsByLevel: Record<number, number>;
  highScoreByLevel: Record<number, number>;
}
