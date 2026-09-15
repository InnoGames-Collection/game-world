/**
 * Crazy Colors Game Coordinator
 * 40 Progressive Levels, authentic Web Audio, state machine, and persistent local storage.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, CrazyColorsSaveData } from './types';
import { STORAGE_KEY } from './constants';
import { CRAZY_COLORS_LEVELS } from './levels';
import { crazyColorsAudio } from './audioEngine';
import { TopHud } from './components/TopHud';
import { CrazyColorsCanvas } from './components/CrazyColorsCanvas';
import { MenuModal } from './components/MenuModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { GameLeaderboardModal } from '../../components/gameNavigation/GameLeaderboardModal';
import { getGameConfig } from '../../components/gameNavigation/gameConfigs';

interface CrazyColorsGameProps {
  onExit: () => void;
}

const DEFAULT_SAVE_DATA: CrazyColorsSaveData = {
  highestUnlockedLevel: 1, // Only Level 1 unlocked initially
  stars: {},
  bestScores: {},
  soundEnabled: true,
  musicEnabled: true,
};

export const CrazyColorsGame: React.FC<CrazyColorsGameProps> = ({ onExit }) => {
  // Load saved progress from localStorage
  const [saveData, setSaveData] = useState<CrazyColorsSaveData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            ...DEFAULT_SAVE_DATA,
            ...parsed,
            highestUnlockedLevel: Math.max(1, Math.min(40, parsed.highestUnlockedLevel || 1)),
          };
        }
      } catch {
        // Ignore JSON error
      }
    }
    return DEFAULT_SAVE_DATA;
  });

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [starsEarnedThisRound, setStarsEarnedThisRound] = useState<number>(1);
  const [keyCounter, setKeyCounter] = useState<number>(0); // force canvas re-mount on restart

  // Sync sound settings with audio engine
  useEffect(() => {
    crazyColorsAudio.setSoundEnabled(saveData.soundEnabled);
  }, [saveData.soundEnabled]);

  // Persist save data on updates
  const updateAndPersistSaveData = useCallback((updater: (prev: CrazyColorsSaveData) => CrazyColorsSaveData) => {
    setSaveData((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage fail
      }
      return next;
    });
  }, []);

  const toggleSound = useCallback(() => {
    const nextSound = crazyColorsAudio.toggleSound();
    updateAndPersistSaveData((prev) => ({
      ...prev,
      soundEnabled: nextSound,
    }));
  }, [updateAndPersistSaveData]);

  const currentLevelDef = useMemo(() => {
    return (
      CRAZY_COLORS_LEVELS.find((lvl) => lvl.id === currentLevelId) ||
      CRAZY_COLORS_LEVELS[0]
    );
  }, [currentLevelId]);

  // Start specific level
  const handleStartLevel = useCallback((levelId: number) => {
    setCurrentLevelId(levelId);
    setScore(0);
    setKeyCounter((k) => k + 1);
    setGameState('PLAYING');
  }, []);

  // Handle Game Over
  const handleGameOver = useCallback(
    (finalScore: number) => {
      setScore(finalScore);
      updateAndPersistSaveData((prev) => {
        const prevBest = prev.bestScores[currentLevelId] || 0;
        return {
          ...prev,
          bestScores: {
            ...prev.bestScores,
            [currentLevelId]: Math.max(prevBest, finalScore),
          },
        };
      });
      setGameState('GAME_OVER');
    },
    [currentLevelId, updateAndPersistSaveData]
  );

  // Handle Level Complete
  const handleLevelComplete = useCallback(
    (finalScore: number) => {
      setScore(finalScore);

      // Calculate 1-5 stars from level thresholds
      const thresholds = currentLevelDef.starThresholds;
      let stars = 1;
      if (finalScore >= thresholds[4]) stars = 5;
      else if (finalScore >= thresholds[3]) stars = 4;
      else if (finalScore >= thresholds[2]) stars = 3;
      else if (finalScore >= thresholds[1]) stars = 2;
      setStarsEarnedThisRound(stars);

      updateAndPersistSaveData((prev) => {
        const nextUnlocked = Math.min(40, Math.max(prev.highestUnlockedLevel, currentLevelId + 1));
        const prevStars = prev.stars[currentLevelId] || 0;
        const prevBest = prev.bestScores[currentLevelId] || 0;

        return {
          ...prev,
          highestUnlockedLevel: nextUnlocked,
          stars: {
            ...prev.stars,
            [currentLevelId]: Math.max(prevStars, stars),
          },
          bestScores: {
            ...prev.bestScores,
            [currentLevelId]: Math.max(prevBest, finalScore),
          },
        };
      });

      setGameState('LEVEL_COMPLETE');
    },
    [currentLevelDef, currentLevelId, updateAndPersistSaveData]
  );

  return (
    <div
      id="crazy-colors-game-root"
      className="relative w-full h-full bg-[#2B2B2B] flex flex-col items-center justify-between overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none"
    >
      {/* 1. Mandatory Top HUD: [ BACK ] [ SCORE ] [ PAUSE ] [ SOUND ] */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <TopHud
          score={score}
          levelId={currentLevelId}
          soundEnabled={saveData.soundEnabled}
          onBack={() => setGameState('MENU')}
          onPause={() => setGameState('PAUSED')}
          onToggleSound={toggleSound}
        />
      )}

      {/* 2. Gameplay Canvas View */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        <CrazyColorsCanvas
          key={`${currentLevelId}-${keyCounter}`}
          level={currentLevelDef}
          onScoreChange={setScore}
          onGameOver={handleGameOver}
          onLevelComplete={handleLevelComplete}
          isPaused={gameState !== 'PLAYING'}
        />
      </div>

      {/* 3. Main Menu Modal */}
      {gameState === 'MENU' && (
        <MenuModal
          saveData={saveData}
          onPlay={() => handleStartLevel(saveData.highestUnlockedLevel)}
          onOpenLeaderboard={() => setGameState('LEADERBOARD')}
          onOpenLevels={() => setGameState('LEVEL_SELECT')}
          onOpenHowToPlay={() => setGameState('HOW_TO_PLAY')}
          onToggleSound={toggleSound}
          onExit={onExit}
        />
      )}

      {/* Leaderboard Modal */}
      {gameState === 'LEADERBOARD' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <GameLeaderboardModal
            gameConfig={getGameConfig('crazy-colors')}
            onClose={() => setGameState('MENU')}
          />
        </div>
      )}

      {/* 4. Level Selection Modal */}
      {gameState === 'LEVEL_SELECT' && (
        <LevelSelectModal
          saveData={saveData}
          onSelectLevel={handleStartLevel}
          onBack={() => setGameState('MENU')}
        />
      )}

      {/* 5. How To Play Modal */}
      {gameState === 'HOW_TO_PLAY' && (
        <HowToPlayModal onClose={() => setGameState('MENU')} />
      )}

      {/* 6. Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          levelId={currentLevelId}
          score={score}
          onResume={() => setGameState('PLAYING')}
          onRestart={() => handleStartLevel(currentLevelId)}
          onOpenLevels={() => setGameState('LEVEL_SELECT')}
          onHome={() => setGameState('MENU')}
        />
      )}

      {/* 7. Game Over Modal */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          levelId={currentLevelId}
          score={score}
          bestScore={saveData.bestScores[currentLevelId] || score}
          onRetry={() => handleStartLevel(currentLevelId)}
          onOpenLevels={() => setGameState('LEVEL_SELECT')}
          onHome={() => setGameState('MENU')}
        />
      )}

      {/* 8. Level Complete Modal */}
      {gameState === 'LEVEL_COMPLETE' && (
        <LevelCompleteModal
          levelId={currentLevelId}
          score={score}
          bestScore={saveData.bestScores[currentLevelId] || score}
          starsEarned={starsEarnedThisRound}
          onNextLevel={() => {
            if (currentLevelId < 40) {
              handleStartLevel(currentLevelId + 1);
            } else {
              setGameState('LEVEL_SELECT');
            }
          }}
          onReplay={() => handleStartLevel(currentLevelId)}
          onOpenLevels={() => setGameState('LEVEL_SELECT')}
        />
      )}
    </div>
  );
};
