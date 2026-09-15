/**
 * Emoji Fun — Core Types & Interface Definitions
 * Tournament-grade Emoji Knowledge & Puzzle Game
 */

export type EmojiGameScreen =
  | 'HOME'
  | 'LEVEL_INFO'
  | 'PLAYING'
  | 'QUESTION_FEEDBACK'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER'
  | 'LEADERBOARD'
  | 'STORE'
  | 'SETTINGS'
  | 'HOW_TO_PLAY';

export type GameState = 'HOME' | 'LEVEL_INFO' | 'PLAYING' | 'FEEDBACK';

export type EmojiQuestionType =
  | 'EMOJI_MEANING'
  | 'EMOJI_COMBINATION'
  | 'GUESS_PHRASE'
  | 'GUESS_MOVIE'
  | 'GUESS_ANIMAL'
  | 'GUESS_FOOD'
  | 'ODD_EMOJI'
  | 'EMOJI_MEMORY'
  | 'EMOJI_SEQUENCE'
  | 'EMOJI_CATEGORY'
  | 'EMOJI_COUNTRY'
  | 'EMOJI_SPORTS'
  | 'EMOJI_SPEED_ROUND';

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export interface EmojiQuestion {
  id: string;
  level: number;
  questionIndex: number;
  type: EmojiQuestionType;
  prompt: string;
  emojiDisplay: string;
  memoryEmojis?: string[]; // for memory questions: shown for 2.5s before hiding
  options: string[]; // exactly 4 choices
  correctIndex: number; // 0, 1, 2, 3
  explanation?: string;
  difficulty: QuestionDifficulty;
  basePoints: number; // 50 to 340
  timeLimitSeconds: number; // 15s to 7s
}

export interface EmojiLevelConfig {
  level: number;
  title: string;
  difficultyStars: number; // 1 to 5
  timeLimitSeconds: number;
  targetScore: number;
  questionCount: number; // 10 to 12 questions
  theme: string;
  scoreMultiplier?: number;
  rewardCoins?: number;
}

export interface TournamentScoreCalculation {
  basePoints: number;
  responseSeconds: number;
  timeLimitSeconds: number;
  speedTier: 'INSTANT' | 'FAST' | 'NORMAL' | 'SLOW' | 'TIMEOUT';
  speedBonusPercent: number;
  comboCount: number;
  comboMultiplier: number;
  hintsUsedOnQuestion: number;
  hintPenaltyMultiplier: number;
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
  accuracy: number; // percentage e.g. 96
  isCurrentUser?: boolean;
}

export interface PlayerStats {
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
