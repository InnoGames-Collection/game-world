/**
 * Pop Balloon Tournament - Data Models & Types
 */

export interface PopBalloonProgress {
  unlockedLevel: number; // 1 to 40
  levelBestScores: Record<number, number>; // levelNum -> highest score achieved
  levelDetails: Record<
    number,
    {
      bestScore: number;
      balloonsPopped: number;
      comboBonus: number;
      performanceBonus: number;
      difficultyBonus: number;
      maxCombo: number;
      stars: number;
      completedAt: string;
    }
  >;
  totalTournamentScore: number; // Cumulative sum of best valid scores across all levels
  totalBalloonsPoppedAllTime: number;
  totalMatchesPlayed: number;
  bestComboAllTime: number;
  bestReactionMs: number;
  perfectLevelsCount: number;
  soundEnabled: boolean;
}

export type PopBalloonScreenState =
  | 'MENU'
  | 'LEVEL_SELECT'
  | 'LEADERBOARD'
  | 'STATS'
  | 'TOURNAMENT'
  | 'ACHIEVEMENTS'
  | 'HOW_TO_PLAY'
  | 'SETTINGS'
  | 'PLAYING'
  | 'COUNTDOWN'
  | 'PAUSED'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER'
  | 'ALL_CLEARED';

export interface LeaderboardEntry {
  rank: number;
  msisdnMasked: string;
  score: number;
  level: number;
  badge?: string;
  isPlayer?: boolean;
}

export interface LevelScoreBreakdown {
  level: number;
  balloonsPopped: number;
  baseScore: number;
  comboBonus: number;
  performanceBonus: number;
  difficultyBonus: number;
  levelScore: number;
  previousBest: number;
  totalTournamentScore: number;
  isNewBest: boolean;
  globalRank: number;
  nextLevelUnlocked: boolean;
  maxCombo: number;
}
