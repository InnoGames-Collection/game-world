/**
 * Helix Jump Master Coordinator Component
 * Complete 40-level championship, full pre-game menu, achievements,
 * statistics, settings, leaderboard, and in-game navigation.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GameState, HelixJumpSaveData } from './types';
import { STORAGE_KEY } from './constants';
import { HELIX_LEVELS } from './levels';
import { helixAudio } from './audioEngine';
import { TopHud } from './components/TopHud';
import { HelixJump3DCanvas } from './components/HelixJump3DCanvas';
import { MenuModal } from './components/MenuModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { FinalCompleteModal } from './components/FinalCompleteModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { AchievementsModal } from './components/AchievementsModal';
import { StatisticsModal } from './components/StatisticsModal';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { LeaderboardModal } from './components/LeaderboardModal';

interface HelixJumpGameProps {
  onExit: () => void;
  onGameOver?: (score: number, durationSeconds: number) => void;
  onRequestSessionStart?: () => boolean;
}

const DEFAULT_SAVE_DATA: HelixJumpSaveData = {
  highestUnlockedLevel: 1, // Only Level 1 unlocked initially
  stars: {},
  bestScores: {},
  bestScore: 0,
  totalScore: 0,
  totalGames: 0,
  totalFailures: 0,
  levelsCompleted: 0,
  currentStreak: 0,
  bestStreak: 0,
  soundEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,
  achievements: [],
  leaderboard: [],
};

function evaluateAchievements(data: HelixJumpSaveData): HelixJumpSaveData {
  const currentSet = new Set(data.achievements || []);
  const totalStars = Object.values(data.stars || {}).reduce<number>((a, b) => a + (Number(b) || 0), 0);

  if ((data.totalGames || 0) >= 1) currentSet.add('first_drop');
  if ((data.levelsCompleted || 0) >= 1) currentSet.add('first_clear');
  if (Object.values(data.stars || {}).some((s) => s === 3)) currentSet.add('perfect_run');
  if ((data.bestStreak || 0) >= 5) currentSet.add('streak_master');
  if ((data.highestUnlockedLevel || 1) >= 20) currentSet.add('halfway');
  if ((data.highestUnlockedLevel || 1) >= 40 && (data.levelsCompleted || 0) >= 40) currentSet.add('tower_master');
  if (totalStars >= 30) currentSet.add('star_collector');
  if (totalStars >= 100) currentSet.add('grandmaster_stars');
  if ((data.bestScore || 0) >= 5000) currentSet.add('scorer_5k');
  if ((data.bestScore || 0) >= 20000) currentSet.add('scorer_20k');
  if ((data.totalFailures || 0) >= 10) currentSet.add('persistent');

  return {
    ...data,
    achievements: Array.from(currentSet),
  };
}

export const HelixJumpGame: React.FC<HelixJumpGameProps> = ({ 
  onExit,
  onGameOver,
  onRequestSessionStart,
}) => {
  // Load saved progress from localStorage
  const [saveData, setSaveData] = useState<HelixJumpSaveData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const initial = {
            ...DEFAULT_SAVE_DATA,
            ...parsed,
            highestUnlockedLevel: Math.max(1, Math.min(40, parsed.highestUnlockedLevel || 1)),
          };
          return evaluateAchievements(initial);
        }
      } catch {
        // Storage fallback
      }
    }
    return DEFAULT_SAVE_DATA;
  });

  // Game begins strictly in MENU state!
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [starsEarnedThisRound, setStarsEarnedThisRound] = useState<number>(1);
  const [renderKey, setRenderKey] = useState<number>(0); // force canvas re-mount on restart

  const isInitialSession = useRef<boolean>(true);
  const sessionStartTime = useRef<number>(Date.now());

  // Sync sound settings with audio engine
  useEffect(() => {
    helixAudio.setSoundEnabled(saveData.soundEnabled);
  }, [saveData.soundEnabled]);

  // Persist save data on updates
  const updateAndPersistSaveData = useCallback((updater: (prev: HelixJumpSaveData) => HelixJumpSaveData) => {
    setSaveData((prev) => {
      const updated = updater(prev);
      const evaluated = evaluateAchievements(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluated));
      } catch {
        // Storage fail
      }
      return evaluated;
    });
  }, []);

  const toggleSound = useCallback(() => {
    const nextSound = helixAudio.toggleSound();
    updateAndPersistSaveData((prev) => ({
      ...prev,
      soundEnabled: nextSound,
    }));
  }, [updateAndPersistSaveData]);

  const currentLevelDef = useMemo(() => {
    return HELIX_LEVELS.find((lvl) => lvl.id === currentLevelId) || HELIX_LEVELS[0];
  }, [currentLevelId]);

  // Start specific level (deducts 2 tournament coins on replay/retry/new session)
  const handleStartLevel = useCallback((levelId: number) => {
    if (isInitialSession.current) {
      isInitialSession.current = false;
    } else if (onRequestSessionStart) {
      if (!onRequestSessionStart()) {
        return;
      }
    }

    sessionStartTime.current = Date.now();
    setCurrentLevelId(levelId);
    setScore(0);
    setProgressPercent(0);
    setRenderKey((k) => k + 1);
    updateAndPersistSaveData((prev) => ({
      ...prev,
      totalGames: (prev.totalGames || 0) + 1,
    }));
    setGameState('PLAYING');
  }, [onRequestSessionStart, updateAndPersistSaveData]);

  // Handle Game Over
  const handleGameOver = useCallback(
    (finalScore: number) => {
      setScore(finalScore);
      const duration = Math.max(1, Math.round((Date.now() - sessionStartTime.current) / 1000));
      onGameOver?.(finalScore, duration);

      updateAndPersistSaveData((prev) => {
        const prevBestLevel = prev.bestScores[currentLevelId] || 0;
        const newOverallBest = Math.max(prev.bestScore || 0, finalScore);
        return {
          ...prev,
          bestScores: {
            ...prev.bestScores,
            [currentLevelId]: Math.max(prevBestLevel, finalScore),
          },
          bestScore: newOverallBest,
          totalFailures: (prev.totalFailures || 0) + 1,
          currentStreak: 0,
        };
      });
      setGameState('GAME_OVER');
    },
    [currentLevelId, onGameOver, updateAndPersistSaveData]
  );

  // Handle Level Complete
  const handleLevelComplete = useCallback(
    (finalScore: number) => {
      setScore(finalScore);
      const duration = Math.max(1, Math.round((Date.now() - sessionStartTime.current) / 1000));
      onGameOver?.(finalScore, duration);

      // Calculate 1-3 stars
      const thresholds = currentLevelDef.starThresholds;
      let stars = 1;
      if (finalScore >= thresholds[2]) stars = 3;
      else if (finalScore >= thresholds[1]) stars = 2;
      setStarsEarnedThisRound(stars);

      updateAndPersistSaveData((prev) => {
        const nextUnlocked = Math.min(40, Math.max(prev.highestUnlockedLevel, currentLevelId + 1));
        const prevStars = prev.stars[currentLevelId] || 0;
        const prevBestLevel = prev.bestScores[currentLevelId] || 0;
        const nextStreak = (prev.currentStreak || 0) + 1;
        const nextBestStreak = Math.max(prev.bestStreak || 0, nextStreak);

        return {
          ...prev,
          highestUnlockedLevel: nextUnlocked,
          stars: {
            ...prev.stars,
            [currentLevelId]: Math.max(prevStars, stars),
          },
          bestScores: {
            ...prev.bestScores,
            [currentLevelId]: Math.max(prevBestLevel, finalScore),
          },
          bestScore: Math.max(prev.bestScore || 0, finalScore),
          totalScore: (prev.totalScore || 0) + finalScore,
          levelsCompleted: (prev.levelsCompleted || 0) + 1,
          currentStreak: nextStreak,
          bestStreak: nextBestStreak,
        };
      });

      if (currentLevelId === 40) {
        setGameState('FINAL_COMPLETE');
      } else {
        setGameState('LEVEL_COMPLETE');
      }
    },
    [currentLevelDef, currentLevelId, updateAndPersistSaveData]
  );

  // Reset Progress
  const handleResetProgress = useCallback(() => {
    updateAndPersistSaveData(() => ({
      ...DEFAULT_SAVE_DATA,
      soundEnabled: saveData.soundEnabled,
      musicEnabled: saveData.musicEnabled,
      hapticsEnabled: saveData.hapticsEnabled,
    }));
  }, [saveData.soundEnabled, saveData.musicEnabled, saveData.hapticsEnabled, updateAndPersistSaveData]);

  return (
    <div
      id="helix-jump-game-root"
      className="relative w-full h-full bg-[#0284c7] flex flex-col items-center justify-between overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif] touch-none overscroll-none"
    >
      {/* 1. Mandatory In-Game Top HUD with working BACK button */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <TopHud
          score={score}
          levelId={currentLevelId}
          soundEnabled={saveData.soundEnabled}
          progressPercent={progressPercent}
          onBack={() => setGameState('MENU')}
          onPause={() => setGameState('PAUSED')}
          onToggleSound={toggleSound}
        />
      )}

      {/* 2. 3D WebGL Gameplay Canvas - Only mounted when gameplay or paused/results */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        <HelixJump3DCanvas
          key={`${currentLevelId}-${renderKey}`}
          level={currentLevelDef}
          onScoreChange={setScore}
          onProgressChange={setProgressPercent}
          onGameOver={handleGameOver}
          onLevelComplete={handleLevelComplete}
          isPaused={gameState !== 'PLAYING'}
        />
      </div>

      {/* 3. Mandatory Pre-Game Main Menu */}
      {gameState === 'MENU' && (
        <MenuModal
          saveData={saveData}
          onPlay={() => handleStartLevel(saveData.highestUnlockedLevel || 1)}
          onOpenLevels={() => setGameState('LEVEL_SELECT')}
          onOpenLeaderboard={() => setGameState('LEADERBOARD')}
          onOpenHowToPlay={() => setGameState('HOW_TO_PLAY')}
          onOpenAchievements={() => setGameState('ACHIEVEMENTS')}
          onOpenStatistics={() => setGameState('STATISTICS')}
          onOpenSettings={() => setGameState('SETTINGS')}
          onOpenAbout={() => setGameState('ABOUT')}
          onToggleSound={toggleSound}
          onExit={onExit}
        />
      )}

      {/* 4. Leaderboard Modal */}
      {gameState === 'LEADERBOARD' && (
        <LeaderboardModal
          saveData={saveData}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* 5. 40-Level Selection Modal */}
      {gameState === 'LEVEL_SELECT' && (
        <LevelSelectModal
          saveData={saveData}
          onSelectLevel={handleStartLevel}
          onBack={() => setGameState('MENU')}
        />
      )}

      {/* 6. How To Play Modal (8 Core Rules) */}
      {gameState === 'HOW_TO_PLAY' && (
        <HowToPlayModal onClose={() => setGameState('MENU')} />
      )}

      {/* 7. Achievements Modal */}
      {gameState === 'ACHIEVEMENTS' && (
        <AchievementsModal
          saveData={saveData}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* 8. Statistics Modal */}
      {gameState === 'STATISTICS' && (
        <StatisticsModal
          saveData={saveData}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* 9. Settings Modal */}
      {gameState === 'SETTINGS' && (
        <SettingsModal
          saveData={saveData}
          onUpdateSettings={(updates) =>
            updateAndPersistSaveData((prev) => ({ ...prev, ...updates }))
          }
          onResetProgress={handleResetProgress}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* 10. About Modal */}
      {gameState === 'ABOUT' && (
        <AboutModal onClose={() => setGameState('MENU')} />
      )}

      {/* 11. Pause Modal */}
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

      {/* 12. Game Over Modal */}
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

      {/* 13. Level Complete Modal */}
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
              setGameState('FINAL_COMPLETE');
            }
          }}
          onReplay={() => handleStartLevel(currentLevelId)}
          onOpenLevels={() => setGameState('LEVEL_SELECT')}
        />
      )}

      {/* 14. Final Championship Completion Screen (Level 40) */}
      {gameState === 'FINAL_COMPLETE' && (
        <FinalCompleteModal
          score={score}
          bestScore={saveData.bestScores[currentLevelId] || score}
          totalStars={Object.values(saveData.stars).reduce<number>(
            (acc, val) => acc + (Number(val) || 0),
            0
          )}
          onReplayLevel40={() => handleStartLevel(40)}
          onOpenLevels={() => setGameState('LEVEL_SELECT')}
          onHome={() => setGameState('MENU')}
        />
      )}
    </div>
  );
};
