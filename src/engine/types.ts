/**
 * TelePlay Shared Game Engine - Type Definitions
 * Reusable contract for session management, scoring, combos, levels,
 * energy consumption safeguards, sound, pause/resume, and leaderboard submission.
 */

export type GameSessionStatus = 
  | 'idle'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'level-complete'
  | 'game-over';

export interface GameEngineConfig {
  gameId: string;
  gameTitle: string;
  energyCost?: number;
  initialMoves?: number;
  initialTimeSeconds?: number;
  isTimed?: boolean;
  baseTargetScore?: number;
  targetScoreStep?: number;
  autoStart?: boolean;
  isAudioEnabled?: boolean;
  onGameOver: (finalScore: number, durationSeconds: number) => void;
  onScoreSubmitted?: (score: number) => void;
}

export interface ComboEvent {
  count: number;
  multiplier: number;
  message: string;
  points: number;
  timestamp: number;
}

export interface LevelGoal {
  level: number;
  targetScore: number;
  moves: number;
  starsThresholds: [number, number, number]; // 1-star, 2-star, 3-star
}

export interface GameEngineState {
  status: GameSessionStatus;
  score: number;
  highScore: number;
  level: number;
  targetScore: number;
  movesRemaining: number;
  timeRemaining: number;
  timeElapsed: number;
  combo: number;
  maxCombo: number;
  multiplier: number;
  stars: number;
  isAudioMuted: boolean;
  activeComboEvent: ComboEvent | null;
  sessionId: string;
  hasSubmittedLeaderboard: boolean;
  energyDeducted: boolean;
}
