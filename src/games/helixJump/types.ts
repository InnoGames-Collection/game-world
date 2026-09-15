/**
 * Helix Jump Type Definitions
 * 40-Level Progressive Championship with 3D Sector Geometry and Physics.
 */

export type GameState =
  | 'MENU'
  | 'LEVEL_SELECT'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER'
  | 'FINAL_COMPLETE'
  | 'HOW_TO_PLAY'
  | 'LEADERBOARD'
  | 'ACHIEVEMENTS'
  | 'STATISTICS'
  | 'SETTINGS'
  | 'ABOUT';

export type SectorType = 'safe' | 'danger' | 'gap';

export interface RingSector {
  startAngle: number; // in radians [0, 2*PI)
  endAngle: number;   // in radians [0, 2*PI)
  type: SectorType;
}

export interface PlatformRingDefinition {
  y: number; // vertical height along the tower
  sectors: RingSector[];
  isFinish?: boolean; // Bottom checkered finish platform
}

export interface LevelTheme {
  name: string;
  towerColor: string;
  safeColor: string;
  safeColors: string[]; // multi-color platform variety down the rings
  dangerColor: string;
  ballColor: string;
  bgGradientTop: string;
  bgGradientBottom: string;
  fogColor: string;
}

export interface LevelDefinition {
  id: number; // 1 to 40
  title: string;
  difficulty: 'hard' | 'hard+' | 'very_hard' | 'expert' | 'extreme' | 'master' | 'final_challenge';
  description: string;
  ringCount: number; // Number of vertical rings to navigate
  themeIndex: number; // maps to level themes (0 to 39)
  rings: PlatformRingDefinition[];
  starThresholds: [number, number, number]; // 1, 2, 3 stars
}

export interface HelixLeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  level: number;
  date: string;
  isPlayer?: boolean;
}

export interface HelixAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface HelixJumpSaveData {
  highestUnlockedLevel: number; // 1 to 40
  stars: Record<number, number>; // levelId -> 1 to 3
  bestScores: Record<number, number>; // levelId -> score
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  totalGames: number;
  levelsCompleted: number;
  totalScore: number;
  bestScore: number;
  bestStreak: number;
  currentStreak: number;
  totalFailures: number;
  achievements: string[]; // IDs of unlocked achievements
  leaderboard: HelixLeaderboardEntry[];
}

export interface FloatingScoreText {
  id: string;
  text: string;
  x: number; // screen coordinate
  y: number;
  alpha: number;
  color: string;
  scale: number;
}

