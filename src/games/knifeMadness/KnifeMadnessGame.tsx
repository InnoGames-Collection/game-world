/**
 * KNIFE MADNESS - Complete 3D Knife Game Implementation
 * Mobile-first portrait layout, Menu-first flow, 40 progressive stages,
 * 60 FPS deterministic canvas physics, anti-farming tournament scoring,
 * and comprehensive game screens.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition, UserProfile } from '../../types';
import { KNIFE_MADNESS_LEVELS } from './levels';
import {
  KnifeMadnessEngine,
  LevelSuccessData,
  LevelFailedData,
} from './KnifeMadnessEngine';
import { KnifeRenderer3D } from './render3D';
import { knifeAudio } from './audio';
import {
  GameState,
  KnifeMadnessCareerProgress,
  KnifeMadnessScoreBreakdown,
} from './types';
import {
  loadCareerProgress,
  saveCareerProgress,
  recordLevelCompletion,
  recordLevelFailure,
  resetCareerProgress,
} from './scoring';
import { GameLeaderboardService } from '../../services/gameLeaderboardService';

// Sub-components
import { KnifeMadnessMenu } from './components/KnifeMadnessMenu';
import { KnifeMadnessLevelSelect } from './components/KnifeMadnessLevelSelect';
import { KnifeMadnessLeaderboard } from './components/KnifeMadnessLeaderboard';
import { KnifeMadnessHowToPlay } from './components/KnifeMadnessHowToPlay';
import { KnifeMadnessAchievements } from './components/KnifeMadnessAchievements';
import { KnifeMadnessStatistics } from './components/KnifeMadnessStatistics';
import { KnifeMadnessSettings } from './components/KnifeMadnessSettings';
import { KnifeMadnessAbout } from './components/KnifeMadnessAbout';
import { KnifeMadnessVictoryModal } from './components/KnifeMadnessVictoryModal';
import { KnifeMadnessFailureModal } from './components/KnifeMadnessFailureModal';

import {
  ArrowLeft,
  Pause,
  Play,
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  ShieldAlert,
} from 'lucide-react';

export type ActiveScreen =
  | 'menu'
  | 'gameplay'
  | 'levels'
  | 'leaderboard'
  | 'how_to_play'
  | 'achievements'
  | 'statistics'
  | 'settings'
  | 'about';

interface KnifeMadnessGameProps {
  game: GameDefinition;
  profile?: UserProfile;
  onGameOver: (score: number, durationSeconds: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

export const KnifeMadnessGame: React.FC<KnifeMadnessGameProps> = ({
  game,
  profile,
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  // Navigation State: starts at 'menu' (User Flow Mandate)
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('menu');

  // Career Progress
  const [career, setCareer] = useState<KnifeMadnessCareerProgress>(() => loadCareerProgress());

  // Current Level
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(() => {
    const saved = loadCareerProgress();
    return Math.min(40, Math.max(1, saved.currentLevel));
  });

  const [attemptSeed, setAttemptSeed] = useState<number>(0);

  // Gameplay Live State
  const [score, setScore] = useState<number>(0);
  const [apples, setApples] = useState<number>(0);
  const [remainingKnives, setRemainingKnives] = useState<number>(8);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [audioOn, setAudioOn] = useState<boolean>(isAudioEnabled);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState<boolean>(false);

  // Victory & Failure Result Overlays
  const [victoryData, setVictoryData] = useState<{
    breakdown: KnifeMadnessScoreBreakdown;
    isNewBest: boolean;
    levelNumber: number;
    isBoss: boolean;
  } | null>(null);

  const [failureData, setFailureData] = useState<LevelFailedData | null>(null);

  // DOM Refs & Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<KnifeMadnessEngine | null>(null);
  const animFrameIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Keep Audio in sync
  useEffect(() => {
    knifeAudio.setEnabled(audioOn);
  }, [audioOn]);

  const toggleAudio = useCallback(() => {
    setAudioOn((prev) => {
      const next = !prev;
      knifeAudio.setEnabled(next);
      knifeAudio.playButtonClick();
      return next;
    });
  }, []);

  // Initialize or reload level in engine
  const startLevel = useCallback(
    (lvlNum: number, seed: number = attemptSeed) => {
      const levelConfig =
        KNIFE_MADNESS_LEVELS.find((l) => l.levelNumber === lvlNum) ||
        KNIFE_MADNESS_LEVELS[0];

      setCurrentLevelNumber(lvlNum);
      setRemainingKnives(levelConfig.requiredKnives);
      setScore(0);
      setApples(0);
      setIsPaused(false);
      setShowQuitConfirm(false);
      setVictoryData(null);
      setFailureData(null);

      if (engineRef.current) {
        engineRef.current.loadLevel(levelConfig, seed);
      } else {
        const engine = new KnifeMadnessEngine(
          levelConfig,
          {
            onScoreUpdate: (newScore, newApples) => {
              setScore(newScore);
              setApples(newApples);
            },
            onKnivesUpdate: (rem) => {
              setRemainingKnives(rem);
            },
            onLevelComplete: (successData: LevelSuccessData) => {
              const currentCareer = loadCareerProgress();
              const { updatedCareer, breakdown, isNewBest } = recordLevelCompletion(
                currentCareer,
                successData
              );
              setCareer(updatedCareer);

              // Sync to Teleplay Leaderboard Service
              GameLeaderboardService.recordScore(
                'knife_madness',
                updatedCareer.totalScore,
                profile?.displayName || 'Player',
                successData.level.levelNumber
              );

              setVictoryData({
                breakdown,
                isNewBest,
                levelNumber: successData.level.levelNumber,
                isBoss: successData.level.isBoss,
              });
            },
            onLevelFailed: (failedData: LevelFailedData) => {
              const currentCareer = loadCareerProgress();
              const updatedCareer = recordLevelFailure(currentCareer);
              setCareer(updatedCareer);
              setFailureData(failedData);
            },
            onStateChange: (newState) => {
              setGameState(newState);
            },
          },
          seed
        );
        engineRef.current = engine;
      }

      // Resize
      if (containerRef.current && canvasRef.current && engineRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        engineRef.current.setDimensions(rect.width, rect.height);
      }
    },
    [attemptSeed, profile]
  );

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      if (engineRef.current) {
        engineRef.current.setDimensions(rect.width, rect.height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeScreen]);

  // 60 FPS Game Loop (runs during active gameplay)
  useEffect(() => {
    if (activeScreen !== 'gameplay') {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      return;
    }

    const renderLoop = (now: number) => {
      const dt = Math.min(0.06, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const canvas = canvasRef.current;
      const container = containerRef.current;
      const engine = engineRef.current;

      if (canvas && container && engine) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const rect = container.getBoundingClientRect();
          const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

          if (!isPaused && gameState !== 'paused') {
            engine.update(dt);
          }

          ctx.save();
          ctx.scale(dpr, dpr);
          ctx.clearRect(0, 0, rect.width, rect.height);

          // 1. Dark Navy Planks Background with Target Spotlight
          KnifeRenderer3D.drawDarkWoodBackground(
            ctx,
            rect.width,
            rect.height,
            engine.targetCenter.x,
            engine.targetCenter.y
          );

          // Screen Shake
          if (engine.screenShake > 0) {
            const sx = (Math.random() - 0.5) * engine.screenShake;
            const sy = (Math.random() - 0.5) * engine.screenShake;
            ctx.translate(sx, sy);
          }

          // 2. Target (or Shatter Fragments on completion)
          if (engine.state !== 'level_complete' || engine.shatterFragments.length === 0) {
            KnifeRenderer3D.drawTarget(
              ctx,
              engine.targetCenter.x,
              engine.targetCenter.y,
              engine.targetRadius,
              engine.targetRotation,
              engine.activeTheme
            );

            // Embedded Knives
            KnifeRenderer3D.drawEmbeddedKnives(
              ctx,
              engine.targetCenter.x,
              engine.targetCenter.y,
              engine.targetRadius,
              engine.targetRotation,
              engine.embeddedKnives
            );

            // Target Fruits
            KnifeRenderer3D.drawTargetApples(
              ctx,
              engine.targetCenter.x,
              engine.targetCenter.y,
              engine.targetRadius,
              engine.targetRotation,
              engine.apples
            );
          } else {
            KnifeRenderer3D.drawShatterFragments(ctx, engine.shatterFragments);
          }

          // 3. Sliced Fruit Parts
          if (engine.slicedApples.length > 0) {
            KnifeRenderer3D.drawSlicedApples(ctx, engine.slicedApples);
          }

          // 4. Flying Knives
          engine.flyingKnives.forEach((fk) => {
            KnifeRenderer3D.drawKnife(
              ctx,
              engine.targetCenter.x,
              fk.y,
              fk.scale,
              fk.rotation
            );
          });

          // 5. Deflected Knives
          engine.deflectedKnives.forEach((dk) => {
            KnifeRenderer3D.drawKnife(
              ctx,
              dk.x,
              dk.y,
              1,
              dk.rotation
            );
          });

          // 6. Ready Knife at Bottom
          if (
            engine.remainingKnives > 0 &&
            (engine.state === 'playing' || engine.state === 'idle')
          ) {
            KnifeRenderer3D.drawKnife(
              ctx,
              engine.targetCenter.x,
              engine.readyKnifeY,
              1,
              0
            );
          }

          // 7. Impact Particles
          if (engine.particles.length > 0) {
            KnifeRenderer3D.drawParticles(ctx, engine.particles);
          }

          // 8. Floating Telemetry Feedback (Combos, Precision, Fruit Bonus)
          if (engine.floatingFeedbacks.length > 0) {
            KnifeRenderer3D.drawFloatingFeedback(ctx, engine.floatingFeedbacks);
          }

          ctx.restore();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [activeScreen, isPaused, gameState]);

  // Handle throw
  const handleThrow = useCallback(() => {
    if (
      isPaused ||
      showQuitConfirm ||
      gameState !== 'playing' ||
      victoryData !== null ||
      failureData !== null
    ) {
      return;
    }
    if (engineRef.current) {
      engineRef.current.throwKnife();
    }
  }, [isPaused, showQuitConfirm, gameState, victoryData, failureData]);

  // Pause
  const togglePause = useCallback(() => {
    knifeAudio.playButtonClick();
    setIsPaused((prev) => {
      const next = !prev;
      if (engineRef.current) {
        engineRef.current.state = next ? 'paused' : 'playing';
      }
      return next;
    });
  }, []);

  // Reset Progress
  const handleResetProgress = useCallback(() => {
    const emptyCareer = resetCareerProgress();
    setCareer(emptyCareer);
    setCurrentLevelNumber(1);
  }, []);

  // Navigation handlers
  const handlePlayFromMenu = () => {
    knifeAudio.playButtonClick();
    setActiveScreen('gameplay');
    startLevel(career.currentLevel <= 40 ? career.currentLevel : 1);
  };

  const handleSelectLevelAndPlay = (lvlNum: number) => {
    knifeAudio.playButtonClick();
    setActiveScreen('gameplay');
    startLevel(lvlNum);
  };

  const currentLevelConfig =
    KNIFE_MADNESS_LEVELS.find((l) => l.levelNumber === currentLevelNumber) ||
    KNIFE_MADNESS_LEVELS[0];

  // =========================================================================
  // RENDER CURRENT ACTIVE SCREEN
  // =========================================================================

  if (activeScreen === 'menu') {
    return (
      <KnifeMadnessMenu
        career={career}
        onPlay={handlePlayFromMenu}
        onOpenLevels={() => setActiveScreen('levels')}
        onOpenLeaderboard={() => setActiveScreen('leaderboard')}
        onOpenHowToPlay={() => setActiveScreen('how_to_play')}
        onOpenAchievements={() => setActiveScreen('achievements')}
        onOpenStatistics={() => setActiveScreen('statistics')}
        onOpenSettings={() => setActiveScreen('settings')}
        onOpenAbout={() => setActiveScreen('about')}
        onExit={onExit}
        isAudioEnabled={audioOn}
        onToggleAudio={toggleAudio}
      />
    );
  }

  if (activeScreen === 'levels') {
    return (
      <KnifeMadnessLevelSelect
        career={career}
        onSelectLevel={handleSelectLevelAndPlay}
        onBack={() => setActiveScreen('menu')}
      />
    );
  }

  if (activeScreen === 'leaderboard') {
    return (
      <KnifeMadnessLeaderboard
        career={career}
        onBack={() => setActiveScreen('menu')}
      />
    );
  }

  if (activeScreen === 'how_to_play') {
    return <KnifeMadnessHowToPlay onBack={() => setActiveScreen('menu')} />;
  }

  if (activeScreen === 'achievements') {
    return (
      <KnifeMadnessAchievements
        career={career}
        onBack={() => setActiveScreen('menu')}
      />
    );
  }

  if (activeScreen === 'statistics') {
    return (
      <KnifeMadnessStatistics
        career={career}
        onBack={() => setActiveScreen('menu')}
      />
    );
  }

  if (activeScreen === 'settings') {
    return (
      <KnifeMadnessSettings
        isAudioEnabled={audioOn}
        onToggleAudio={toggleAudio}
        onResetProgress={handleResetProgress}
        onBack={() => setActiveScreen('menu')}
      />
    );
  }

  if (activeScreen === 'about') {
    return <KnifeMadnessAbout onBack={() => setActiveScreen('menu')} />;
  }

  // =========================================================================
  // ACTIVE GAMEPLAY VIEWPORT
  // =========================================================================
  return (
    <div
      ref={containerRef}
      id="knife-madness-gameplay-root"
      className="relative w-full h-full max-w-md mx-auto flex flex-col justify-between overflow-hidden select-none touch-none font-['Plus_Jakarta_Sans',sans-serif]"
      style={{
        background: '#061224',
      }}
      onClick={handleThrow}
    >
      {/* 1. TOP GAMEPLAY BAR: [ MENU ] [ SCORE ] [ STAGE ] [ AUDIO ] [ PAUSE ] */}
      <div
        className="relative z-30 pt-safe px-3 sm:px-4 pt-3 pb-2 flex items-center justify-between gap-1.5 w-full shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* [ MENU BUTTON ] */}
        <button
          onClick={() => {
            knifeAudio.playButtonClick();
            setIsPaused(true);
            setActiveScreen('menu');
          }}
          aria-label="Back to Menu"
          className="h-10 px-3 rounded-xl flex items-center justify-center gap-1.5 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-lg border border-sky-400/30 bg-gradient-to-b from-[#1e3a5f] to-[#0f2038]"
        >
          <ArrowLeft className="w-4 h-4 text-sky-300 stroke-[2.5]" />
          <span className="text-[11px] text-sky-100">MENU</span>
        </button>

        {/* [ SCORE DISPLAY ] */}
        <div className="h-10 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-sky-500/30 shadow-md bg-gradient-to-b from-[#0f294a] to-[#071526]">
          <span className="text-[10px] text-sky-300 uppercase font-black tracking-wider">
            SCORE
          </span>
          <span className="font-mono text-base font-black text-amber-300">
            {score}
          </span>
        </div>

        {/* [ LEVEL / STAGE DISPLAY ] */}
        <div className="h-10 px-3 rounded-xl flex flex-col items-center justify-center border border-amber-500/30 shadow-md bg-gradient-to-b from-[#1e293b] to-[#0f172a]">
          <span className="text-[9px] text-amber-400 uppercase font-black tracking-widest leading-none mb-0.5">
            STAGE {currentLevelConfig.levelNumber}
          </span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((dot) => {
              const active = ((currentLevelConfig.levelNumber - 1) % 4) >= dot;
              return (
                <div
                  key={dot}
                  className={`w-1.5 h-1.5 rounded-full ${
                    active ? 'bg-amber-300 shadow-[0_0_5px_#fde047]' : 'bg-slate-600'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* [ AUDIO TOGGLE ] */}
        <button
          onClick={toggleAudio}
          className={`h-10 w-10 rounded-xl flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer shadow-lg border border-sky-400/30 ${
            audioOn
              ? 'bg-gradient-to-b from-[#166534] to-[#0f3e21]'
              : 'bg-gradient-to-b from-[#334155] to-[#1e293b]'
          }`}
        >
          {audioOn ? (
            <Volume2 className="w-4 h-4 text-emerald-300" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* [ PAUSE BUTTON ] */}
        <button
          onClick={togglePause}
          className="h-10 w-10 rounded-xl flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer shadow-lg border border-amber-400/30 bg-gradient-to-b from-[#1e3a5f] to-[#0f2038]"
        >
          {isPaused ? (
            <Play className="w-4 h-4 text-amber-300 fill-current" />
          ) : (
            <Pause className="w-4 h-4 text-amber-300 fill-current" />
          )}
        </button>
      </div>

      {/* Sliced Apples Counter (Top Right) */}
      <div className="relative z-20 px-4 flex items-center justify-end pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-red-500/30 shadow-md bg-slate-900/80 backdrop-blur-sm">
          <span className="text-sm">🍎</span>
          <span className="font-mono font-black text-xs text-red-300">{apples}</span>
        </div>
      </div>

      {/* 2. 3D CANVAS VIEWPORT */}
      <div className="relative flex-1 w-full h-full">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-pointer"
        />

        {/* Vertical Tactile Knife Rack (Left side) */}
        <div className="absolute left-3 bottom-16 z-20 flex flex-col-reverse gap-1.5 pointer-events-none">
          {Array.from({ length: currentLevelConfig.requiredKnives }).map((_, idx) => {
            const isAvailable = idx < remainingKnives;
            return (
              <div
                key={idx}
                className={`w-3.5 h-6 rounded-sm transition-all duration-200 flex items-center justify-center ${
                  isAvailable
                    ? 'bg-gradient-to-t from-slate-200 to-white shadow-[0_0_8px_rgba(255,255,255,0.8)] scale-100 opacity-100'
                    : 'bg-slate-800/60 border border-slate-700/40 scale-90 opacity-30'
                }`}
                style={{
                  clipPath: 'polygon(50% 0%, 100% 30%, 80% 100%, 20% 100%, 0% 30%)',
                }}
              />
            );
          })}
        </div>

        {/* Tap Prompt on Start */}
        {score === 0 && remainingKnives === currentLevelConfig.requiredKnives && (
          <div className="absolute bottom-6 inset-x-0 text-center pointer-events-none animate-pulse">
            <span className="text-[11px] font-black uppercase tracking-widest text-sky-300/80 bg-slate-900/60 px-3 py-1 rounded-full border border-sky-500/30">
              TAP SCREEN TO THROW KNIFE
            </span>
          </div>
        )}
      </div>

      {/* 3. STAGE VICTORY MODAL */}
      {victoryData && (
        <KnifeMadnessVictoryModal
          levelNumber={victoryData.levelNumber}
          isBoss={victoryData.isBoss}
          breakdown={victoryData.breakdown}
          isNewBest={victoryData.isNewBest}
          cumulativeTotalScore={career.totalScore}
          hasNextLevel={victoryData.levelNumber < 40}
          onNextLevel={() => {
            const nextLvl = victoryData.levelNumber + 1;
            setAttemptSeed((prev) => prev + 1);
            startLevel(nextLvl, attemptSeed + 1);
          }}
          onReplay={() => {
            setAttemptSeed((prev) => prev + 1);
            startLevel(victoryData.levelNumber, attemptSeed + 1);
          }}
          onMenu={() => setActiveScreen('menu')}
        />
      )}

      {/* 4. BLADE COLLISION FAILURE MODAL */}
      {failureData && (
        <KnifeMadnessFailureModal
          failData={failureData}
          bestLevelScore={career.levelRecords[currentLevelNumber]?.bestScore || 0}
          cumulativeTotalScore={career.totalScore}
          onRetry={() => {
            setAttemptSeed((prev) => prev + 1);
            startLevel(currentLevelNumber, attemptSeed + 1);
          }}
          onOpenLevels={() => setActiveScreen('levels')}
          onMenu={() => setActiveScreen('menu')}
        />
      )}

      {/* 5. PAUSE MODAL */}
      {isPaused && !showQuitConfirm && !victoryData && !failureData && (
        <div
          className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-xs p-6 rounded-3xl border-2 border-sky-500/40 shadow-2xl flex flex-col items-center text-white bg-gradient-to-b from-[#112238] to-[#081220]">
            <div className="w-14 h-14 rounded-2xl bg-sky-600/30 border border-sky-400/50 flex items-center justify-center mb-3 shadow-md">
              <Pause className="w-7 h-7 text-sky-300 fill-current" />
            </div>

            <h3 className="text-xl font-black text-sky-200 tracking-wide mb-1">
              GAME PAUSED
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Stage {currentLevelConfig.levelNumber} - {currentLevelConfig.theme.replace('_', ' ').toUpperCase()}
            </p>

            <div className="w-full rounded-2xl p-3.5 mb-4 bg-slate-900/80 border border-sky-500/20 flex flex-col gap-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  CURRENT SCORE
                </span>
                <span className="text-base font-mono font-black text-amber-300">
                  {score}
                </span>
              </div>
              <div className="h-px bg-slate-700/40" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  APPLES SLICED
                </span>
                <span className="text-sm font-mono font-black text-red-400">
                  {apples} 🍎
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={togglePause}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-700 hover:brightness-110 active:translate-y-0.5 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border border-emerald-400/50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>RESUME GAME</span>
              </button>

              <button
                onClick={() => {
                  setAttemptSeed((prev) => prev + 1);
                  startLevel(currentLevelNumber, attemptSeed + 1);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:translate-y-0.5 text-sky-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-sky-500/30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESTART STAGE</span>
              </button>

              <button
                onClick={() => setActiveScreen('menu')}
                className="w-full py-2 text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
              >
                RETURN TO MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
