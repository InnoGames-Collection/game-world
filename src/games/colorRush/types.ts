/**
 * Color Rush - Competitive Mobile Logic & Reaction Matcher Types
 */

export type DifficultyTier = 
  | 'Beginner' 
  | 'Novice' 
  | 'Intermediate' 
  | 'Advanced' 
  | 'Expert' 
  | 'Master' 
  | 'Grandmaster' 
  | 'Legend';

export interface ColorItem {
  id: string;
  hex: string;
  name?: string;
  hsl: [number, number, number]; // [hue 0-360, sat 0-100, light 0-100]
  isCorrect: boolean;
}

export interface FloatingPoint {
  id: string;
  points: number;
  comboText?: string;
  isBonus?: boolean;
  label?: string;
}

export interface LevelConfig {
  level: number;
  title: string;
  difficulty: DifficultyTier;
  rounds: number;
  optionCount: 4 | 6 | 8 | 9;
  timeLimitMs: number;
  hueDeltaRange: [number, number];
  lightDeltaRange: [number, number];
  difficultyBonus: number;
  perfectBonus: number;
  minAccuracyToPass: number; // percentage, e.g. 60
}

export interface LevelScoreBreakdown {
  level: number;
  baseScore: number;         // +1 point per correct answer
  speedBonus: number;        // +3 very fast, +2 fast, +1 normal, +0 slow
  streakBonus: number;       // +1 for 3, +2 for 5, +5 for 10, +8 for 15+
  difficultyBonus: number;   // Scaled with level difficulty
  levelBonus: number;        // Completion bonus (level * 5)
  perfectBonus: number;      // Awarded if accuracy = 100%
  totalLevelScore: number;
  isPerfect: boolean;
  isPassed: boolean;
  isNewBest: boolean;
  previousBest: number;
  newCumulativeScore: number;
  isNextLevelUnlocked: boolean;
  accuracy: number;
  correctCount: number;
  totalRounds: number;
  maxStreak: number;
  avgReactionMs: number;
}

export interface DailyChallengeConfig {
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  rounds: number;
  optionCount: 6 | 8 | 9;
  timeLimitMs: number;
  hueDeltaRange: [number, number];
  multiplier: number;
}

export interface ColorRushProgression {
  currentUnlockedLevel: number;
  levelBestScores: Record<number, number>;
  levelStars: Record<number, number>;
  totalCumulativeScore: number; // Anti-farming: Sum of best scores of completed levels
  highestStreak: number;
  totalCorrectColors: number;
  totalGamesPlayed: number;
  perfectLevelsCount: number;
  totalReactionTimeMs: number;
  reactionCount: number;
  unlockedAchievements: string[];
  dailyChallenge: {
    date: string;
    completed: boolean;
    score: number;
    bestStreak: number;
    rank: number;
  };
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  totalScore: number;
  highestLevel: number;
  bestScore: number;
  streak: number;
  movement: 'up' | 'down' | 'same';
  movementAmount?: number;
  isPlayer?: boolean;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'Progression' | 'Skill' | 'Speed' | 'Mastery';
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
  rewardPoints: number;
}

export type ColorRushScreenState =
  | 'MENU'
  | 'PLAYING'
  | 'LEVEL_SELECT'
  | 'LEADERBOARD'
  | 'STATS'
  | 'ACHIEVEMENTS'
  | 'DAILY_CHALLENGE'
  | 'SETTINGS'
  | 'LEVEL_COMPLETE';
