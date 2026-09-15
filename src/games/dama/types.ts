/**
 * DAMA - Premium 3D Draughts / Checkers
 * Tournament Progression & Type Definitions
 */

export type PieceColor = 'white' | 'black'; // white = Player (Light Ivory), black = Computer (Dark Walnut)

export interface Piece {
  id: string;
  color: PieceColor;
  isKing: boolean;
  row: number; // 0 to 7
  col: number; // 0 to 7
}

export type BoardState = (Piece | null)[][]; // 8x8 matrix

export interface MoveStep {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  capturedRow?: number;
  capturedCol?: number;
}

export interface DamaMove {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  isCapture: boolean;
  path: MoveStep[]; // Sequence of steps for chain captures
  capturedPieces: { row: number; col: number; pieceId: string }[];
  promotesToKing: boolean;
}

export type GameTurn = 'player' | 'computer';

export type GameStatus =
  | 'start'
  | 'playing'
  | 'animating'
  | 'computer_thinking'
  | 'paused'
  | 'player_won'
  | 'computer_won'
  | 'draw'
  | 'all_cleared';

export type DamaTournamentView =
  | 'MAIN_MENU'
  | 'LEVEL_SELECT'
  | 'LEADERBOARD'
  | 'HOW_TO_PLAY'
  | 'ACHIEVEMENTS'
  | 'STATISTICS'
  | 'SETTINGS'
  | 'ABOUT'
  | 'GAMEPLAY';

export type DamaDifficultyTier =
  | 'Hard'         // Level 1–5
  | 'Very Hard'    // Level 6–10
  | 'Expert'       // Level 11–20
  | 'Expert+'      // Level 21–30
  | 'Extreme'      // Level 31–39
  | 'Master';      // Level 40

export interface LevelDifficultyConfig {
  level: number;
  name: string;
  tier: DamaDifficultyTier;
  searchDepth: number;
  quiescenceDepth: number;
  positionalWeight: number;
  centerWeight: number;
  kingWeight: number;
  defenseWeight: number;
  randomnessFactor: number; // Controlled entropy (0.05 on L1 down to 0 on L40)
  description: string;
}

export interface MatchStats {
  playerPiecesCaptured: number;
  computerPiecesCaptured: number;
  playerKingsCreated: number;
  computerKingsCreated: number;
  movesPlayed: number;
  matchDurationSeconds: number;
  invalidMoveAttempts: number;
  tacticalCapturesSequence: number;
  avgMoveTimeSeconds: number;
  bestMoveTimeSeconds: number;
}

export interface DamaScoreBreakdown {
  levelNumber: number;
  levelName: string;
  tier: DamaDifficultyTier;
  isWin: boolean;
  baseScore: number;
  winBonus: number;
  difficultyBonus: number;
  captureEfficiencyBonus: number;
  pieceSurvivalBonus: number;
  kingBonus: number;
  moveEfficiencyBonus: number;
  timeBonus: number;
  tacticalStreakBonus: number;
  cleanPlayBonus: number;
  completionBonus: number;
  penalties: number;
  finalScore: number;
  newCumulativeTotal: number;
  isNewBest: boolean;
  starsEarned: number;
  moves: number;
  captures: number;
  piecesRemaining: number;
  kings: number;
  matchDurationSeconds: number;
  avgMoveTimeSeconds: number;
  bestMoveTimeSeconds: number;
  efficiencyPercent: number;
}

export interface DamaLevelSaveData {
  highScore: number;
  stars: number;
  wins: number;
  losses: number;
  bestMoves: number;
  bestCaptures: number;
  bestPiecesRemaining: number;
  bestKings: number;
  bestTimeSeconds: number;
  bestEfficiencyPercent: number;
  lastPlayedTimestamp: number;
}

export interface DamaStats {
  wins: number;
  losses: number;
  draws: number;
  totalMoves: number;
  totalCaptures: number;
  totalKings: number;
  totalInvalidAttempts: number;
  bestWinStreak: number;
  currentWinStreak: number;
  totalPlayTimeSeconds: number;
  bestLevelScore: number;
  bestSingleMatchDuration: number;
}

export interface DamaProgress {
  version: number;
  highestUnlockedLevel: number;
  totalScore: number; // Cumulative sum of best score for each level
  completedLevels: Record<number, DamaLevelSaveData>;
  achievements: Record<string, number>; // achievementId -> timestamp
  stats: DamaStats;
  settings: {
    isAudioMuted: boolean;
  };
}

export interface DamaAchievementDef {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  progressText: string;
  iconName?: string;
}
