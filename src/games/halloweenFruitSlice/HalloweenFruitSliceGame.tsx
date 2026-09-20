import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition, UserProfile } from '../../types';
import { HALLOWEEN_LEVELS } from './levels';
import { HalloweenFruitSliceEngine } from './HalloweenFruitSliceEngine';
import { HalloweenRenderer } from './HalloweenRenderer';
import { GameState, LevelConfig, LevelSaveData } from './types';
import { halloweenAudio } from './audio';
import { 
  ArrowLeft, 
  Pause, 
  Play, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Lock, 
  Star, 
  Trophy, 
  Award, 
  Home, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { GameLeaderboardModal } from '../../components/gameNavigation/GameLeaderboardModal';
import { getGameConfig } from '../../components/gameNavigation/gameConfigs';

interface HalloweenFruitSliceGameProps {
  game: GameDefinition;
  profile?: UserProfile;
  onGameOver: (finalScore: number, durationSeconds: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

const STORAGE_KEY_LEVELS = 'halloween_fruit_slice_levels_v1';
const STORAGE_KEY_BEST = 'halloween_fruit_slice_best_score_v1';
const STORAGE_KEY_TUTORIAL = 'halloween_fruit_slice_tutorial_seen';

export const HalloweenFruitSliceGame: React.FC<HalloweenFruitSliceGameProps> = ({
  game,
  profile,
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<HalloweenFruitSliceEngine | null>(null);
  const rendererRef = useRef<HalloweenRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Game state
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentLevelNum, setCurrentLevelNum] = useState<number>(1);
  const [countdownText, setCountdownText] = useState<string>('READY');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [objectiveProgress, setObjectiveProgress] = useState<{ current: number; target: number }>({ current: 0, target: 400 });
  const [isMuted, setIsMuted] = useState<boolean>(!halloweenAudio.isEnabled());
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  // Persistence: Best Score
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BEST);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Persistence: Level Progress (1 to 40)
  const [levelProgress, setLevelProgress] = useState<Record<number, LevelSaveData>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEVELS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    // Default: Level 1 is unlocked, levels 2-40 are locked
    const initial: Record<number, LevelSaveData> = {};
    for (let i = 1; i <= 40; i++) {
      initial[i] = {
        unlocked: i === 1,
        completed: false,
        stars: 0,
        highScore: 0,
      };
    }
    return initial;
  });

  const saveProgress = (newProg: Record<number, LevelSaveData>, newBest: number) => {
    setLevelProgress(newProg);
    setBestScore(newBest);
    try {
      localStorage.setItem(STORAGE_KEY_LEVELS, JSON.stringify(newProg));
      localStorage.setItem(STORAGE_KEY_BEST, String(newBest));
    } catch {}
  };

  // Sync initial sound state
  useEffect(() => {
    halloweenAudio.setEnabled(isAudioEnabled);
    setIsMuted(!isAudioEnabled);
    halloweenAudio.stopBgm();
  }, [isAudioEnabled]);

  // Ensure BGM is never playing in menu or selection screens
  useEffect(() => {
    if (gameState === 'MENU' || gameState === 'LEVEL_SELECT' || gameState === 'TUTORIAL') {
      halloweenAudio.stopBgm();
    }
  }, [gameState]);

  // Clean up RAF and sounds on unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (engineRef.current) {
        engineRef.current.stop();
      }
      halloweenAudio.stopBgm();
    };
  }, []);

  const currentLevelConfig = HALLOWEEN_LEVELS.find((l) => l.levelNum === currentLevelNum) || HALLOWEEN_LEVELS[0];

  // ---------------------------------------------------------------------------
  // Launch Level Flow (Menu/LevelSelect -> Tutorial -> Countdown -> Playing)
  // ---------------------------------------------------------------------------
  const startLevel = (lvlNum: number) => {
    setCurrentLevelNum(lvlNum);
    const seenTutorial = localStorage.getItem(STORAGE_KEY_TUTORIAL);
    if (!seenTutorial) {
      setGameState('TUTORIAL');
    } else {
      beginCountdown(lvlNum);
    }
  };

  const onDismissTutorial = () => {
    try {
      localStorage.setItem(STORAGE_KEY_TUTORIAL, 'true');
    } catch {}
    beginCountdown(currentLevelNum);
  };

  const beginCountdown = (lvlNum: number) => {
    setGameState('COUNTDOWN');
    setCountdownText('READY');
    halloweenAudio.playReady();

    setTimeout(() => {
      setCountdownText('GO');
      halloweenAudio.playGo();

      setTimeout(() => {
        initAndStartGameplay(lvlNum);
      }, 700);
    }, 900);
  };

  const initAndStartGameplay = (lvlNum: number) => {
    const lvl = HALLOWEEN_LEVELS.find((l) => l.levelNum === lvlNum) || HALLOWEEN_LEVELS[0];
    setScore(0);
    setLives(lvl.maxMisses);
    setObjectiveProgress({ current: 0, target: lvl.objectiveTarget });
    setSessionStartTime(Date.now());
    setGameState('PLAYING');

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const renderer = new HalloweenRenderer(ctx);
    renderer.setSize(rect.width, rect.height);
    rendererRef.current = renderer;

    const engine = new HalloweenFruitSliceEngine(lvl, {
      onScoreUpdate: (newScore) => {
        setScore(newScore);
        if (newScore > bestScore) {
          setBestScore(newScore);
        }
      },
      onLivesUpdate: (newLives) => {
        setLives(newLives);
      },
      onObjectiveProgress: (current, target) => {
        setObjectiveProgress({ current, target });
      },
      onLevelComplete: (finalScore, stars) => {
        handleLevelComplete(lvlNum, finalScore, stars);
      },
      onGameOver: (finalScore) => {
        handleGameOver(finalScore);
      },
    });

    engine.setDimensions(rect.width, rect.height);
    engineRef.current = engine;
    engine.start();

    // Start Spooky Background Music
    halloweenAudio.startBgm();

    // Main Canvas Render & Physics Loop
    let lastTime = performance.now();
    const loop = (time: number) => {
      if (engineRef.current) {
        engineRef.current.update();

        // Render Canvas
        ctx.save();
        if (engineRef.current.screenShake > 0) {
          const shakeX = (Math.random() - 0.5) * engineRef.current.screenShake;
          const shakeY = (Math.random() - 0.5) * engineRef.current.screenShake;
          ctx.translate(shakeX, shakeY);
        }

        renderer.renderBackground(time);
        renderer.renderSplatters(engineRef.current.splatters);
        renderer.renderFlyingObjects(engineRef.current.objects, time);
        renderer.renderSlicedHalves(engineRef.current.halves);
        renderer.renderSlashTrail(engineRef.current.slashPoints, time);
        renderer.renderParticles(engineRef.current.particles);
        renderer.renderFloatingTexts(engineRef.current.floatingTexts);

        ctx.restore();
      }
      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }
    animFrameIdRef.current = requestAnimationFrame(loop);
  };

  // ---------------------------------------------------------------------------
  // Victory & Game Over Handlers
  // ---------------------------------------------------------------------------
  const handleLevelComplete = (lvlNum: number, finalScore: number, stars: number) => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    halloweenAudio.stopBgm();

    const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
    onGameOver(finalScore, duration);

    // Unlock next level (up to exactly 40)
    const updated = { ...levelProgress };
    const currentRecord = updated[lvlNum] || { unlocked: true, completed: false, stars: 0, highScore: 0 };
    updated[lvlNum] = {
      unlocked: true,
      completed: true,
      stars: Math.max(currentRecord.stars, stars),
      highScore: Math.max(currentRecord.highScore, finalScore),
    };

    if (lvlNum < 40) {
      updated[lvlNum + 1] = {
        ...updated[lvlNum + 1],
        unlocked: true,
      };
    }

    const newBest = Math.max(bestScore, finalScore);
    saveProgress(updated, newBest);
    setGameState('LEVEL_COMPLETE');
  };

  const handleGameOver = (finalScore: number) => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    halloweenAudio.stopBgm();

    const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
    onGameOver(finalScore, duration);

    const newBest = Math.max(bestScore, finalScore);
    setBestScore(newBest);
    try {
      localStorage.setItem(STORAGE_KEY_BEST, String(newBest));
    } catch {}

    setGameState('GAME_OVER');
  };

  // ---------------------------------------------------------------------------
  // Touch / Pointer Input Events on Canvas
  // ---------------------------------------------------------------------------
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    engineRef.current?.onPointerDown(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    engineRef.current?.onPointerMove(x, y);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    engineRef.current?.onPointerUp();
  };

  // ---------------------------------------------------------------------------
  // Top HUD Action Handlers
  // ---------------------------------------------------------------------------
  const handlePause = () => {
    halloweenAudio.playClick();
    engineRef.current?.pause();
    halloweenAudio.stopBgm();
    setGameState('PAUSED');
  };

  const handleResume = () => {
    halloweenAudio.playClick();
    engineRef.current?.resume();
    halloweenAudio.startBgm();
    setGameState('PLAYING');
  };

  const handleRestart = () => {
    halloweenAudio.playClick();
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    engineRef.current?.stop();
    beginCountdown(currentLevelNum);
  };

  const handleBackToSelect = () => {
    halloweenAudio.playClick();
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    engineRef.current?.stop();
    halloweenAudio.stopBgm();
    setGameState('LEVEL_SELECT');
  };

  const handleToggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    halloweenAudio.setEnabled(!nextState);
  };

  // ===========================================================================
  // RENDER VIEWPORT
  // ===========================================================================
  return (
    <div
      id="halloween-fruit-slice-container"
      ref={containerRef}
      className="relative w-full h-full max-w-lg md:max-w-xl lg:max-w-2xl mx-auto flex flex-col justify-between overflow-hidden bg-[#020C14] text-white select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* =====================================================================
          1. MENU / TITLE SCREEN
         ===================================================================== */}
      {gameState === 'MENU' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#041724] via-[#072436] to-[#020C14] text-center select-none animate-in fade-in duration-300">
          {/* Top Bar with Sound & Close */}
          <div className="w-full flex items-center justify-between pt-2">
            <button
              onClick={() => {
                halloweenAudio.playClick();
                onExit();
              }}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer border border-white/15"
              aria-label="Back to portal"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={handleToggleSound}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer border border-white/15"
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-[#8BCB3D]" />}
            </button>
          </div>

          {/* Central Logo & Spooky Graphic */}
          <div className="flex flex-col items-center justify-center my-auto space-y-4">
            {/* Glowing Moon & Monster Fruit Cluster */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#00E5FF]/20 blur-2xl animate-pulse" />
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-amber-100 to-amber-300 shadow-2xl border-4 border-amber-200/50 flex items-center justify-center relative overflow-hidden">
                {/* Moon craters */}
                <div className="absolute top-4 left-6 w-7 h-7 rounded-full bg-amber-400/25" />
                <div className="absolute bottom-6 right-8 w-10 h-10 rounded-full bg-amber-400/25" />
                <div className="absolute top-12 right-6 w-5 h-5 rounded-full bg-amber-400/20" />
                
                {/* Pumpkin Silhouette */}
                <span className="text-6xl drop-shadow-lg transform -rotate-6">🎃</span>
              </div>
            </div>

            {/* Title Treatment */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF9800] via-[#FFEB3B] to-[#76FF03] drop-shadow-lg uppercase leading-none">
                HALLOWEEN
              </h1>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-widest text-white drop-shadow-md flex items-center justify-center gap-2">
                <span>FRUIT</span>
                <span className="text-[#00E5FF]">SLICE</span>
              </h2>
            </div>

            <p className="text-xs text-slate-300 max-w-xs font-medium">
              Slice flying monster fruits with blade swipes. Avoid bombs and never miss!
            </p>
          </div>

          {/* Big Glowing Round PLAY Button */}
          <div className="w-full space-y-3 pb-4 flex flex-col items-center">
            <button
              onClick={() => {
                halloweenAudio.playClick();
                setGameState('LEVEL_SELECT');
              }}
              className="w-full max-w-xs h-14 rounded-2xl bg-gradient-to-r from-[#8BCB3D] to-[#689F38] hover:brightness-110 active:scale-95 text-white font-black text-lg tracking-wider shadow-lg shadow-[#8BCB3D]/30 flex items-center justify-center gap-3 transition-all cursor-pointer border border-lime-300/40"
            >
              <Play className="w-6 h-6 fill-current text-white" />
              <span>PLAY NOW</span>
            </button>

            <button
              onClick={() => {
                halloweenAudio.playClick();
                setGameState('LEADERBOARD');
              }}
              className="w-full max-w-xs h-12 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 font-bold text-sm tracking-wide flex items-center justify-center gap-2 border border-amber-400/40 cursor-pointer transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>LEADERBOARD</span>
            </button>

            <button
              onClick={() => {
                halloweenAudio.playClick();
                setGameState('LEVEL_SELECT');
              }}
              className="w-full max-w-xs h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 border border-white/15 cursor-pointer transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>LEVEL SELECT (1 - 40)</span>
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {gameState === 'LEADERBOARD' && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <GameLeaderboardModal
            gameConfig={getGameConfig('halloween-fruit-slice')}
            profile={profile}
            onClose={() => setGameState('MENU')}
          />
        </div>
      )}

      {/* =====================================================================
          2. LEVEL SELECT SCREEN (40 Levels, Level 1 Unlocked & Very Difficult)
         ===================================================================== */}
      {gameState === 'LEVEL_SELECT' && (
        <div className="absolute inset-0 z-30 flex flex-col bg-[#041724] text-white p-4 overflow-hidden select-none animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <button
              onClick={() => {
                halloweenAudio.playClick();
                setGameState('MENU');
              }}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-black tracking-tight uppercase text-white">Select Level</h2>
              <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                Level 1 is Very Difficult
              </p>
            </div>

            <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full border border-white/15 text-xs font-bold text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
              <span>{bestScore}</span>
            </div>
          </div>

          {/* 40 Levels Grid */}
          <div className="flex-1 overflow-y-auto py-4 pr-1 scrollbar-thin scrollbar-thumb-white/20">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {HALLOWEEN_LEVELS.map((lvl) => {
                const rec = levelProgress[lvl.levelNum] || { unlocked: lvl.levelNum === 1, completed: false, stars: 0, highScore: 0 };
                const isUnlocked = rec.unlocked;
                const isCurrent = lvl.levelNum === currentLevelNum;

                return (
                  <button
                    key={lvl.levelNum}
                    disabled={!isUnlocked}
                    onClick={() => {
                      halloweenAudio.playClick();
                      startLevel(lvl.levelNum);
                    }}
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-1.5 transition-all border ${
                      !isUnlocked
                        ? 'bg-slate-900/60 border-white/5 opacity-50 cursor-not-allowed'
                        : isCurrent
                        ? 'bg-gradient-to-b from-[#8BCB3D] to-[#689F38] border-lime-300 text-white shadow-md shadow-[#8BCB3D]/30 cursor-pointer active:scale-95'
                        : rec.completed
                        ? 'bg-gradient-to-b from-[#1688C9]/40 to-[#0F5A85]/60 border-[#1688C9]/60 text-white cursor-pointer active:scale-95'
                        : 'bg-white/10 hover:bg-white/20 border-white/20 text-white cursor-pointer active:scale-95'
                    }`}
                  >
                    {!isUnlocked ? (
                      <Lock className="w-5 h-5 text-slate-400" />
                    ) : (
                      <>
                        <span className="text-lg font-black leading-none">{lvl.levelNum}</span>
                        {/* Stars */}
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-2.5 h-2.5 ${
                                s <= rec.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. TUTORIAL POPUP (Inspired by Reference Video)
         ===================================================================== */}
      {gameState === 'TUTORIAL' && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#072436] border-2 border-[#00E5FF]/40 p-6 shadow-2xl space-y-6">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFEB3B] to-[#FF9800] uppercase tracking-wide">
              HOW TO PLAY
            </h2>

            {/* Graphic from reference */}
            <div className="flex items-center justify-center gap-4 py-2">
              <span className="text-4xl animate-bounce">🎃</span>
              <span className="text-3xl">⚔️</span>
              <span className="text-4xl">💣</span>
            </div>

            <div className="space-y-2">
              <p className="text-base font-extrabold text-white">
                DON'T SLICE BOMBS OR MISS FRUIT!
              </p>
              <p className="text-xs text-slate-300">
                Swipe your finger or mouse across flying monster fruits. Multi-slice triggers massive Combos!
              </p>
            </div>

            {/* 3 Lives illustration */}
            <div className="flex items-center justify-center gap-3 py-1">
              <span className="text-2xl">🟢</span>
              <span className="text-2xl">🟢</span>
              <span className="text-2xl">🟢</span>
            </div>

            <button
              onClick={() => {
                halloweenAudio.playClick();
                onDismissTutorial();
              }}
              className="w-full h-12 rounded-2xl bg-[#8BCB3D] hover:bg-[#7db737] active:scale-95 text-white font-black text-sm tracking-wider uppercase shadow-md shadow-[#8BCB3D]/30 transition-all cursor-pointer"
            >
              TAP TO CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. COUNTDOWN OVERLAY (READY -> GO)
         ===================================================================== */}
      {gameState === 'COUNTDOWN' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none select-none">
          <div className="text-center animate-in zoom-in-75 duration-300">
            <span className="text-6xl sm:text-7xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#76FF03] drop-shadow-[0_0_25px_rgba(0,229,255,0.7)] uppercase">
              {countdownText}
            </span>
          </div>
        </div>
      )}

      {/* =====================================================================
          5. TOP GAMEPLAY HUD ([BACK]  [SCORE]  [PAUSE]  [SOUND])
         ===================================================================== */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'COUNTDOWN') && (
        <header className="relative z-20 w-full px-3.5 pt-3 pb-1 flex flex-col gap-2 bg-gradient-to-b from-[#020C14]/90 via-[#020C14]/60 to-transparent">
          <div className="flex items-center justify-between gap-2">
            {/* [ BACK ] Button */}
            <button
              onClick={handleBackToSelect}
              className="min-w-[44px] h-[44px] px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
              aria-label="Back to level select"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span className="hidden xs:inline">BACK</span>
            </button>

            {/* [ SCORE ] & BEST Display */}
            <div className="flex-1 flex items-center justify-center gap-3 bg-white/10 px-4 h-[44px] rounded-xl border border-white/15">
              <span className="text-lg">🍉</span>
              <div className="flex flex-col text-left leading-none">
                <span className="text-sm font-black text-white tracking-wider">
                  {String(score).padStart(3, '0')}
                </span>
                <span className="text-[10px] text-slate-300 font-medium">
                  BEST: {bestScore}
                </span>
              </div>
            </div>

            {/* [ PAUSE ] Button */}
            <button
              onClick={handlePause}
              className="min-w-[44px] h-[44px] px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1 border border-white/15 transition-all cursor-pointer"
              aria-label="Pause game"
            >
              <Pause className="w-4 h-4 text-white" />
            </button>

            {/* [ SOUND ] Button */}
            <button
              onClick={handleToggleSound}
              className="min-w-[44px] h-[44px] px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs flex items-center justify-center border border-white/15 transition-all cursor-pointer"
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#8BCB3D]" />}
            </button>
          </div>

          {/* Sub-bar: Level Objective & 3 Lives Indicator */}
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-extrabold text-[#00E5FF] tracking-wide">
              LVL {currentLevelNum}: {currentLevelConfig.objectiveDescription}
            </span>

            {/* 3 Lives Monster Faces */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((heart) => (
                <span
                  key={heart}
                  className={`text-base transition-transform duration-300 ${
                    heart <= lives ? 'scale-100 opacity-100' : 'scale-90 opacity-30 grayscale'
                  }`}
                >
                  🎃
                </span>
              ))}
            </div>
          </div>
        </header>
      )}

      {/* =====================================================================
          6. MAIN INTERACTIVE CANVAS (SWIPE INTERSECTION ENGINE)
         ===================================================================== */}
      <div className="relative flex-1 w-full h-full overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full block cursor-crosshair touch-none select-none"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* =====================================================================
          7. PAUSE MODAL
         ===================================================================== */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-xs rounded-3xl bg-[#072436] border-2 border-white/20 p-6 text-center space-y-5 shadow-2xl">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">
              GAME PAUSED
            </h2>

            <div className="space-y-3">
              <button
                onClick={handleResume}
                className="w-full h-12 rounded-2xl bg-[#8BCB3D] hover:bg-[#7db737] active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>RESUME</span>
              </button>

              <button
                onClick={handleRestart}
                className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESTART LEVEL</span>
              </button>

              <button
                onClick={handleBackToSelect}
                className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>LEVEL SELECT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          8. GAME OVER TOMBSTONE PANEL (Reference Video Inspired)
         ===================================================================== */}
      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none animate-in zoom-in-90 duration-300">
          {/* Engraved Stone Tombstone Monument */}
          <div className="relative w-full max-w-xs rounded-t-[48px] rounded-b-2xl bg-gradient-to-b from-[#263238] via-[#1C242B] to-[#0E151A] border-4 border-[#37474F] shadow-2xl p-6 text-center space-y-6">
            {/* Tombstone Arch Header */}
            <div className="pt-2">
              <div className="w-12 h-1.5 bg-slate-500/50 rounded-full mx-auto mb-2" />
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-red-400 uppercase tracking-wider drop-shadow-md">
                GAME OVER
              </h2>
            </div>

            {/* Score & Best Display Card */}
            <div className="bg-black/40 rounded-2xl p-4 border border-white/10 space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Score</p>
                <p className="text-3xl font-black text-white">{score}</p>
              </div>

              <div className="border-t border-white/10 pt-2 flex items-center justify-between px-2">
                <span className="text-xs text-amber-400 font-bold uppercase">High Score</span>
                <span className="text-base font-black text-amber-300">{bestScore}</span>
              </div>
            </div>

            {/* Tombstone Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              {/* Home / Level Select */}
              <button
                onClick={handleBackToSelect}
                className="flex-1 h-12 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4 text-white" />
                <span>SELECT</span>
              </button>

              {/* Restart */}
              <button
                onClick={handleRestart}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#8BCB3D] to-[#689F38] hover:brightness-110 active:scale-95 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-[#8BCB3D]/30 transition-all cursor-pointer border border-lime-300/30"
              >
                <RotateCcw className="w-4 h-4 text-white" />
                <span>RETRY</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          9. LEVEL COMPLETE CELEBRATION PANEL
         ===================================================================== */}
      {gameState === 'LEVEL_COMPLETE' && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none animate-in zoom-in-90 duration-300">
          <div className="w-full max-w-xs rounded-3xl bg-gradient-to-b from-[#072436] to-[#020C14] border-2 border-[#00E5FF]/40 shadow-2xl p-6 text-center space-y-6">
            <div>
              <span className="text-4xl">🎉</span>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#76FF03] to-[#00E5FF] uppercase tracking-wide mt-1">
                LEVEL COMPLETE!
              </h2>
              <p className="text-xs text-slate-300 font-semibold">
                {currentLevelConfig.title}
              </p>
            </div>

            {/* 3 Stars Award */}
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-9 h-9 drop-shadow-lg ${
                    s <= (levelProgress[currentLevelNum]?.stars || 1)
                      ? 'fill-amber-400 text-amber-400 animate-bounce'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>

            {/* Score info */}
            <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
              <p className="text-xs text-slate-400 uppercase font-bold">Final Score</p>
              <p className="text-3xl font-black text-white">{score}</p>
            </div>

            {/* Buttons */}
            <div className="space-y-2.5">
              {currentLevelNum < 40 ? (
                <button
                  onClick={() => {
                    halloweenAudio.playClick();
                    startLevel(currentLevelNum + 1);
                  }}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#8BCB3D] to-[#689F38] hover:brightness-110 active:scale-95 text-white font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#8BCB3D]/30 transition-all cursor-pointer border border-lime-300/40"
                >
                  <span>NEXT LEVEL</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="p-3 bg-amber-400/15 rounded-xl border border-amber-400/30 text-amber-300 text-xs font-bold">
                  🏆 CONGRATULATIONS! YOU CONQUERED ALL 40 HALLOWEEN LEVELS!
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestart}
                  className="flex-1 h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>REPLAY</span>
                </button>

                <button
                  onClick={handleBackToSelect}
                  className="flex-1 h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>SELECT</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
