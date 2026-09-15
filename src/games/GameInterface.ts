/**
 * Standard Interface contracts for independent games in TelePlay Ethiopia.
 * Allows plug-and-play modular integration for external or bundled game engines.
 */

import { GameDefinition, GameSessionResult } from '../types';

export type GameLifecycleState = 'idle' | 'loading' | 'playing' | 'paused' | 'game_over';

export interface GameLaunchConfig {
  game: GameDefinition;
  user: {
    id: string;
    displayName: string;
    isVip: boolean;
    highScore: number;
  };
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  tournamentId?: string;
}

export interface GameBridgeEvent {
  type: 'GAME_STARTED' | 'SCORE_UPDATED' | 'LIVES_CHANGED' | 'GAME_OVER' | 'REQUEST_REVIVE';
  payload: Record<string, unknown>;
}

export interface GameModuleInterface {
  id: string;
  init: (config: GameLaunchConfig) => Promise<void>;
  start: () => void;
  pause?: () => void;
  resume?: () => void;
  restart: () => void;
  destroy: () => void;
  onEvent: (listener: (event: GameBridgeEvent) => void) => void;
}

export interface GameScoreSubmission {
  gameId: string;
  userId: string;
  score: number;
  durationSeconds: number;
  checksum: string;
  tournamentId?: string;
}
