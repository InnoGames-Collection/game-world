export type MotoRaceStatus =
  | 'menu'
  | 'leaderboard'
  | 'level_select'
  | 'playing';

export interface MotoLevelRecord {
  level: number;
  unlocked: boolean;
  completed: boolean;
  highScore: number;
  bestTimeSec?: number;
}

export interface MotoLeaderboardEntry {
  rank: number;
  rawMsisdn: string;
  score: number;
  level: number;
  isCurrentUser?: boolean;
}
