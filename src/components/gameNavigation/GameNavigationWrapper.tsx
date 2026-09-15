import React, { useState, useEffect, useCallback } from 'react';
import { GameConfig } from './types';
import { GameMenu } from './GameMenu';
import { GameBackButton } from './GameBackButton';
import { GamePauseMenu } from './GamePauseMenu';
import { GameLeaderboardModal } from './GameLeaderboardModal';
import { GameHowToPlayModal } from './GameHowToPlayModal';
import { GameStatisticsModal } from './GameStatisticsModal';
import { GameAchievementsModal } from './GameAchievementsModal';
import { GameSettingsModal } from './GameSettingsModal';
import { GameAboutModal } from './GameAboutModal';
import { GameLeaderboardService } from '../../services/gameLeaderboardService';
import { UserProfile } from '../../types';

interface GameNavigationWrapperProps {
  gameConfig: GameConfig;
  profile?: UserProfile;
  onExitPortal: () => void;
  renderGame: (props: {
    onGameOver: (score: number, duration?: number) => void;
    onExitGame: () => void;
    onRequestPause?: () => void;
  }) => React.ReactNode;
  /** Whether the underlying game already provides its own in-game back button */
  hideFloatingBackButton?: boolean;
}

type NavModal = 'NONE' | 'LEADERBOARD' | 'HOW_TO_PLAY' | 'STATISTICS' | 'ACHIEVEMENTS' | 'SETTINGS' | 'ABOUT';

export const GameNavigationWrapper: React.FC<GameNavigationWrapperProps> = ({
  gameConfig,
  profile,
  onExitPortal,
  renderGame,
  hideFloatingBackButton = false,
}) => {
  const [viewState, setViewState] = useState<'MENU' | 'PLAYING'>('MENU');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<NavModal>('NONE');
  const [gameScore, setGameScore] = useState<number | undefined>(undefined);
  const [gamePlaySessionKey, setGamePlaySessionKey] = useState<number>(0);

  // Android System Back & Escape Key Coordinator
  useEffect(() => {
    // Push history state to intercept Android back button
    const historyState = { gameNav: gameConfig.gameId, viewState, isPaused, activeModal };
    window.history.pushState(historyState, '');

    const handlePopState = () => {
      if (activeModal !== 'NONE') {
        setActiveModal('NONE');
      } else if (isPaused) {
        setIsPaused(false);
      } else if (viewState === 'PLAYING') {
        setIsPaused(true);
      } else {
        onExitPortal();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal !== 'NONE') {
          setActiveModal('NONE');
        } else if (isPaused) {
          setIsPaused(false);
        } else if (viewState === 'PLAYING') {
          setIsPaused(true);
        } else {
          onExitPortal();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModal, isPaused, viewState, onExitPortal, gameConfig.gameId]);

  // Handle score submission from the wrapped game
  const handleGameOver = useCallback(
    (score: number, _duration?: number) => {
      setGameScore(score);
      GameLeaderboardService.recordScore(gameConfig.gameId, score, profile?.displayName);
    },
    [gameConfig.gameId, profile?.displayName]
  );

  // When game triggers exit or when user taps exit in pause menu
  const handleExitToMenu = useCallback(() => {
    setIsPaused(false);
    setActiveModal('NONE');
    setViewState('MENU');
  }, []);

  // When user restarts level from pause menu
  const handleRestart = useCallback(() => {
    setIsPaused(false);
    setGameScore(undefined);
    setGamePlaySessionKey((k) => k + 1);
  }, []);

  // When player clicks Play from pre-game menu
  const handlePlay = useCallback(() => {
    setViewState('PLAYING');
    setIsPaused(false);
    setGameScore(undefined);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden bg-slate-950 select-none">
      {/* 1. PRE-GAME MENU VIEW */}
      {viewState === 'MENU' && (
        <GameMenu
          gameConfig={gameConfig}
          profile={profile}
          onPlay={handlePlay}
          onLeaderboard={() => setActiveModal('LEADERBOARD')}
          onHowToPlay={() => setActiveModal('HOW_TO_PLAY')}
          onAchievements={() => setActiveModal('ACHIEVEMENTS')}
          onStatistics={() => setActiveModal('STATISTICS')}
          onSettings={() => setActiveModal('SETTINGS')}
          onAbout={() => setActiveModal('ABOUT')}
          onExit={onExitPortal}
        />
      )}

      {/* 2. ACTIVE GAMEPLAY VIEW */}
      {viewState === 'PLAYING' && (
        <div key={gamePlaySessionKey} className="relative w-full h-full">
          {/* Top-Left In-Game Back Button (if not already handled inside the game) */}
          {!hideFloatingBackButton && (
            <div className="absolute top-3 left-3 z-40">
              <GameBackButton
                onClick={() => setIsPaused(true)}
                themeAccent={gameConfig.theme.accentColor}
                ariaLabel={`Pause and back to ${gameConfig.title} menu`}
              />
            </div>
          )}

          {/* Render the inner game */}
          {renderGame({
            onGameOver: handleGameOver,
            onExitGame: handleExitToMenu,
            onRequestPause: () => setIsPaused(true),
          })}
        </div>
      )}

      {/* 3. PAUSE MENU OVERLAY (when in PLAYING and paused) */}
      {viewState === 'PLAYING' && isPaused && (
        <GamePauseMenu
          gameConfig={gameConfig}
          score={gameScore}
          onResume={() => setIsPaused(false)}
          onLeaderboard={() => setActiveModal('LEADERBOARD')}
          onRestart={handleRestart}
          onHowToPlay={() => setActiveModal('HOW_TO_PLAY')}
          onSettings={() => setActiveModal('SETTINGS')}
          onExitToMenu={handleExitToMenu}
        />
      )}

      {/* 4. MODALS (Accessible from either Menu or Pause) */}
      {activeModal === 'LEADERBOARD' && (
        <GameLeaderboardModal
          gameConfig={gameConfig}
          profile={profile}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'HOW_TO_PLAY' && (
        <GameHowToPlayModal
          gameConfig={gameConfig}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'STATISTICS' && (
        <GameStatisticsModal
          gameConfig={gameConfig}
          profile={profile}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'ACHIEVEMENTS' && (
        <GameAchievementsModal
          gameConfig={gameConfig}
          profile={profile}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'SETTINGS' && (
        <GameSettingsModal
          gameConfig={gameConfig}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'ABOUT' && (
        <GameAboutModal
          gameConfig={gameConfig}
          onClose={() => setActiveModal('NONE')}
        />
      )}
    </div>
  );
};
