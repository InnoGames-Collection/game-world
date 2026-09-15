import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GameDefinition, UserProfile } from '../../types';
import { FRUIT_LEVELS } from './levels';
import { FruitSliceEngine } from './FruitSliceEngine';
import { ComboBanner, GameStatus, LevelRecord } from './types';
import { fruitAudio } from './fruitSliceAudio';
import { FruitNinjaMainMenu } from './components/FruitNinjaMainMenu';
import { FruitNinjaLeaderboard } from './components/FruitNinjaLeaderboard';
import { normalizeToMsisdn, maskMsisdn } from './utils/msisdn';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  ArrowLeft,
  Trophy,
  Flame,
  Award,
  Star,
  Shield,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface FruitSliceGameProps {
  game: GameDefinition;
  profile?: UserProfile;
  onGameOver: (finalScore: number, durationSeconds: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

const STORAGE_KEY_LEVELS = 'fruit_slice_levels_v1';
const STORAGE_KEY_BEST = 'fruit_slice_best_score_v1';

export const FruitSliceGame: React.FC<FruitSliceGameProps> = ({
  game,
  profile,
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<FruitSliceEngine | null>(null);

  const [currentLevelNum, setCurrentLevelNum] = useState<number>(1);
  const [gameStatus, setGameStatus] = useState<GameStatus>('menu');
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BEST);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [levelProgress, setLevelProgress] = useState<Record<number, LevelRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEVELS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    const initial: Record<number, LevelRecord> = {};
    for (let i = 1; i <= 40; i++) {
      initial[i] = {
        levelNumber: i,
        stars: 0,
        highScore: 0,
        unlocked: i === 1,
      };
    }
    return initial;
  });

  const [fruitsSliced, setFruitsSliced] = useState<number>(0);
  const [misses, setMisses] = useState<number>(0);
  const [bombDeflects, setBombDeflects] = useState<number>(1);
  const [showQuitConfirm, setShowQuitConfirm] = useState<boolean>(false);
  const [comboBanners, setComboBanners] = useState<ComboBanner[]>([]);
  const [soundMuted, setSoundMuted] = useState<boolean>(!isAudioEnabled);
  const [levelStartTime, setLevelStartTime] = useState<number>(0);
  const [finalDuration, setFinalDuration] = useState<number>(0);
  const [isBombFail, setIsBombFail] = useState<boolean>(false);

  // Sync Audio Mute
  useEffect(() => {
    fruitAudio.setMuted(soundMuted);
  }, [soundMuted]);

  const activeLevelConfig = FRUIT_LEVELS[currentLevelNum - 1] || FRUIT_LEVELS[0];

  // Save Progress
  const saveProgress = useCallback(
    (lvlNum: number, achievedScore: number, starsEarned: number) => {
      setLevelProgress((prev) => {
        const current = prev[lvlNum] || {
          levelNumber: lvlNum,
          stars: 0,
          highScore: 0,
          unlocked: true,
        };
        const updated: Record<number, LevelRecord> = {
          ...prev,
          [lvlNum]: {
            ...current,
            stars: Math.max(current.stars, starsEarned),
            highScore: Math.max(current.highScore, achievedScore),
          },
        };

        // Unlock next level
        if (lvlNum < 40 && updated[lvlNum + 1]) {
          updated[lvlNum + 1] = {
            ...updated[lvlNum + 1],
            unlocked: true,
          };
        }

        try {
          localStorage.setItem(STORAGE_KEY_LEVELS, JSON.stringify(updated));
        } catch {
          // LocalStorage full
        }
        return updated;
      });

      setBestScore((prev) => {
        const nextBest = Math.max(prev, achievedScore);
        try {
          localStorage.setItem(STORAGE_KEY_BEST, nextBest.toString());
        } catch {
          // Fallback
        }
        return nextBest;
      });
    },
    []
  );

  // Start Level Engine
  const startLevel = useCallback(
    (levelNum: number) => {
      setCurrentLevelNum(levelNum);
      setGameStatus('playing');
      setScore(0);
      setFruitsSliced(0);
      setMisses(0);
      const initialDeflects = levelNum <= 10 ? 1 : levelNum <= 25 ? 1 : 0;
      setBombDeflects(initialDeflects);
      setShowQuitConfirm(false);
      setComboBanners([]);
      setIsBombFail(false);
      setLevelStartTime(Date.now());

      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }

      if (!containerRef.current) return;

      const lvlCfg = FRUIT_LEVELS[levelNum - 1] || FRUIT_LEVELS[0];

      const engine = new FruitSliceEngine(
        containerRef.current,
        lvlCfg,
        {
          onScoreUpdate: (newScore, slicedCount) => {
            setScore(newScore);
            setFruitsSliced(slicedCount);
          },
          onCombo: (banner) => {
            setComboBanners((prev) => [...prev.slice(-3), banner]);
            setTimeout(() => {
              setComboBanners((prev) => prev.filter((b) => b.id !== banner.id));
            }, 1200);
          },
          onFruitMissed: (missCount) => {
            setMisses(missCount);
          },
          onDeflectChange: (newDeflects) => {
            setBombDeflects(newDeflects);
          },
          onBombDetonated: () => {
            setIsBombFail(true);
            setGameStatus('game_over');
            const duration = Math.round((Date.now() - levelStartTime) / 1000);
            setFinalDuration(duration);
          },
          onLevelComplete: (finalSc) => {
            setScore(finalSc);
            const duration = Math.round((Date.now() - levelStartTime) / 1000);
            setFinalDuration(duration);
            setGameStatus('level_complete');

            // Calculate stars (1-3 stars)
            const quota = lvlCfg.quota;
            const stars = finalSc >= quota * 2.2 ? 3 : finalSc >= quota * 1.5 ? 2 : 1;
            saveProgress(levelNum, finalSc, stars);
          },
          onGameOver: (finalSc) => {
            setScore(finalSc);
            const duration = Math.round((Date.now() - levelStartTime) / 1000);
            setFinalDuration(duration);
            setGameStatus('game_over');
          },
        },
        initialDeflects
      );

      engineRef.current = engine;
      engine.start();
    },
    [levelStartTime, saveProgress]
  );

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      engineRef.current?.handleResize();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      engineRef.current?.destroy();
    };
  }, []);

  // Pause toggle
  const togglePause = () => {
    fruitAudio.playButtonClick();
    if (gameStatus === 'playing') {
      engineRef.current?.pause();
      setGameStatus('paused');
    } else if (gameStatus === 'paused') {
      engineRef.current?.resume();
      setGameStatus('playing');
    }
  };

  // Back button handler
  const handleBackClick = () => {
    fruitAudio.playButtonClick();
    if (gameStatus === 'playing') {
      engineRef.current?.pause();
      setGameStatus('paused');
      setShowQuitConfirm(true);
    } else if (gameStatus === 'paused') {
      setShowQuitConfirm(true);
    } else {
      engineRef.current?.destroy();
      onExit();
    }
  };

  const currentLevelRecord = levelProgress[currentLevelNum] || {
    levelNumber: currentLevelNum,
    stars: 0,
    highScore: 0,
    unlocked: true,
  };

  // User phone & masked MSISDN (Strict Section 7: First 5, last 2, mask middle 5)
  const userRawMsisdn = useMemo(
    () => normalizeToMsisdn(profile?.phoneNumber),
    [profile?.phoneNumber]
  );
  const userMaskedMsisdn = useMemo(
    () => maskMsisdn(userRawMsisdn),
    [userRawMsisdn]
  );

  // Legitimate tournament game score: cumulative score across levels or highest score achieved
  const cumulativeScore = useMemo(() => {
    const totalLevelScore = (Object.values(levelProgress) as LevelRecord[]).reduce(
      (sum: number, lvl: LevelRecord) => sum + (lvl.highScore || 0),
      0
    );
    let best = Math.max(totalLevelScore, bestScore);
    try {
      const savedLb = localStorage.getItem('teleplay_lb_fruit-slice');
      if (savedLb) {
        best = Math.max(best, parseInt(savedLb, 10));
      }
    } catch {
      // fallback
    }
    return best;
  }, [levelProgress, bestScore]);

  // Player Rank string calculation
  const userRankString = useMemo(() => {
    if (cumulativeScore <= 0) {
      return '#2,481';
    }
    if (cumulativeScore >= 12850) return '#1';
    if (cumulativeScore >= 12620) return '#2';
    if (cumulativeScore >= 12410) return '#3';
    if (cumulativeScore >= 12105) return '#4';
    if (cumulativeScore >= 11980) return '#5';
    if (cumulativeScore >= 11720) return '#6';
    if (cumulativeScore >= 11490) return '#7';
    if (cumulativeScore >= 11210) return '#8';
    if (cumulativeScore >= 10950) return '#9';
    if (cumulativeScore >= 10680) return '#10';

    const deficit = 10680 - cumulativeScore;
    const rankNum = Math.min(2481, Math.max(11, Math.round(11 + (deficit / 10680) * 2470)));
    return `#${rankNum.toLocaleString()}`;
  }, [cumulativeScore]);

  // Navigation handlers (Strict Section 12)
  const goToLevelSelect = useCallback(() => {
    try {
      window.history.pushState({ fruitNinja: 'level_select' }, '');
    } catch {
      // ignore
    }
    setGameStatus('level_select');
  }, []);

  const goToLeaderboard = useCallback(() => {
    try {
      window.history.pushState({ fruitNinja: 'leaderboard' }, '');
    } catch {
      // ignore
    }
    setGameStatus('leaderboard');
  }, []);

  const goToMenu = useCallback(() => {
    setGameStatus('menu');
  }, []);

  // Android back button / popstate handling (Strict Section 12)
  useEffect(() => {
    const handlePopState = () => {
      if (gameStatus === 'leaderboard' || gameStatus === 'level_select') {
        setGameStatus('menu');
      } else if (gameStatus === 'menu') {
        onExit();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [gameStatus, onExit]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start select-none touch-none overscroll-none bg-[#1a0f07] overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 3D WebGL Canvas & Katana Trail Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-crosshair overflow-hidden touch-none"
      />

      {/* TOP HUD (Mobile-First Safe-Area Layout: [BACK] [SCORE] [LEVEL] [X X X] [SOUND] [PAUSE]) */}
      <div
        style={{
          paddingTop: 'max(0.6rem, env(safe-area-inset-top, 0.6rem))',
        }}
        className="relative z-20 w-full max-w-5xl px-2 sm:px-4 flex items-center justify-between pointer-events-none gap-1 sm:gap-2"
      >
        {/* Left Group: Back Button + Score */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto flex-shrink-0">
          {/* Back Button */}
          <button
            onClick={handleBackClick}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-stone-800/90 to-stone-900/90 hover:from-stone-700 hover:to-stone-800 active:scale-95 transition-all flex items-center justify-center border border-amber-500/40 shadow-lg shadow-black/50 text-amber-300 cursor-pointer flex-shrink-0"
            title="Leave Game"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 stroke-[2.5]" />
          </button>

          {/* Score Pill */}
          <div className="h-9 sm:h-10 px-2 sm:px-3 rounded-xl bg-gradient-to-b from-stone-900/90 to-black/90 border border-amber-500/40 shadow-lg shadow-black/50 flex items-center gap-1.5 text-white flex-shrink-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shadow flex-shrink-0">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black fill-current" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="hidden sm:inline text-[9px] font-bold text-amber-400/90 uppercase leading-none tracking-wider">
                Score
              </span>
              <span className="text-sm sm:text-base font-black font-mono tracking-tight leading-none">
                {score}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Stage Scroll Objective Banner */}
        <div className="flex items-center justify-center min-w-0 flex-shrink pointer-events-auto">
          <div className="h-9 sm:h-10 px-2.5 sm:px-4 rounded-full bg-gradient-to-r from-[#b45309] via-[#f59e0b] to-[#b45309] text-stone-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-xl border border-[#fef3c7]/80 flex items-center justify-center gap-1.5 sm:gap-2 truncate">
            {fruitsSliced >= activeLevelConfig.quota ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-950 fill-emerald-400 flex-shrink-0" />
                <span className="font-black text-emerald-950 truncate">STAGE CLEARED!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-950 flex-shrink-0" />
                <span className="truncate">
                  {fruitsSliced}/{activeLevelConfig.quota}
                </span>
                <span className="text-amber-950/60 font-bold">•</span>
                <span className="font-black text-amber-950 flex-shrink-0">
                  LVL {currentLevelNum}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Group: Misses [X X X] + Sound + Pause */}
        <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto flex-shrink-0">
          {/* 3 Stylized Equal X Indicators */}
          <div
            className="h-9 sm:h-10 px-1.5 sm:px-2 rounded-xl bg-gradient-to-b from-stone-900/90 to-black/90 border border-amber-500/30 shadow-lg shadow-black/50 flex items-center justify-center gap-1 flex-shrink-0"
            title="Misses (Max 3 Allowed)"
          >
            {[0, 1, 2].map((idx) => {
              const isMissed = idx < misses;
              return (
                <div
                  key={idx}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center font-black text-[11px] sm:text-xs transition-all duration-300 ${
                    isMissed
                      ? 'bg-gradient-to-tr from-rose-700 to-red-500 text-white shadow-md shadow-rose-600/50 border border-rose-400/80'
                      : 'bg-sky-500/20 border border-sky-400/40 text-sky-300'
                  }`}
                >
                  ✕
                </div>
              );
            })}
          </div>

          {/* Bomb Deflects (if enabled) */}
          {bombDeflects > 0 && (
            <div className="hidden lg:flex items-center gap-1 px-2 h-9 sm:h-10 rounded-xl bg-gradient-to-b from-stone-900/90 to-black/90 border border-amber-400/30 text-[11px] font-black text-amber-300">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{bombDeflects}</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => {
              fruitAudio.playButtonClick();
              setSoundMuted(!soundMuted);
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-stone-800/90 to-stone-900/90 hover:from-stone-700 hover:to-stone-800 active:scale-95 transition-all flex items-center justify-center border border-amber-500/30 shadow-lg shadow-black/50 text-white cursor-pointer flex-shrink-0"
            title="Toggle Sound"
            aria-label="Sound"
          >
            {soundMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          {/* Pause Button */}
          <button
            onClick={togglePause}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-stone-800/90 to-stone-900/90 hover:from-stone-700 hover:to-stone-800 active:scale-95 transition-all flex items-center justify-center border border-amber-500/40 shadow-lg shadow-black/50 text-amber-300 cursor-pointer flex-shrink-0"
            title="Pause Game"
            aria-label="Pause"
          >
            <Pause className="w-4 h-4 text-amber-300 fill-current" />
          </button>
        </div>
      </div>

      {/* FLOATING COMBO & CRITICAL BANNERS */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {comboBanners.map((banner) => (
          <div
            key={banner.id}
            style={{
              left: `${Math.max(40, Math.min(window.innerWidth - 180, banner.x - 70))}px`,
              top: `${Math.max(80, banner.y - 40)}px`,
            }}
            className={`absolute animate-out fade-out zoom-out duration-1000 px-4 py-2 rounded-2xl shadow-2xl font-black tracking-wider uppercase flex items-center gap-2 border-2 ${
              banner.isCritical
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-white text-white text-base sm:text-lg shadow-cyan-500/50'
                : 'bg-gradient-to-r from-amber-400 to-orange-500 border-yellow-200 text-black text-sm sm:text-base shadow-orange-500/50'
            }`}
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>{banner.label}</span>
          </div>
        ))}
      </div>

      {/* 1. PROFESSIONAL MINIMAL MAIN MENU */}
      {gameStatus === 'menu' && (
        <FruitNinjaMainMenu
          userRank={userRankString}
          userScore={cumulativeScore}
          playerMsisdnMasked={userMaskedMsisdn}
          onPlay={goToLevelSelect}
          onLeaderboard={goToLeaderboard}
          onExit={onExit}
          soundMuted={soundMuted}
          onToggleSound={() => setSoundMuted(!soundMuted)}
        />
      )}

      {/* 2. PROFESSIONAL LEADERBOARD SCREEN */}
      {gameStatus === 'leaderboard' && (
        <FruitNinjaLeaderboard
          userScore={cumulativeScore}
          userRawMsisdn={userRawMsisdn}
          userRankString={userRankString}
          onBack={goToMenu}
        />
      )}

      {/* LEVEL SELECT SCREEN (1 to 40 Stages) */}
      {gameStatus === 'level_select' && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl flex items-center justify-between mb-4">
            <button
              onClick={() => {
                fruitAudio.playButtonClick();
                setGameStatus('menu');
              }}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h2 className="text-xl sm:text-2xl font-black text-amber-400 uppercase tracking-tight">
              Select Stage (1 - 40)
            </h2>
            <div className="w-16" />
          </div>

          {/* Level Grid */}
          <div className="w-full max-w-2xl grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-2.5 pb-8">
            {FRUIT_LEVELS.map((lvl) => {
              const rec = levelProgress[lvl.levelNumber];
              const isUnlocked = rec?.unlocked ?? (lvl.levelNumber === 1);
              const stars = rec?.stars ?? 0;

              return (
                <button
                  key={lvl.levelNumber}
                  disabled={!isUnlocked}
                  onClick={() => {
                    fruitAudio.playButtonClick();
                    startLevel(lvl.levelNumber);
                  }}
                  className={`aspect-square rounded-2xl p-2 flex flex-col items-center justify-between transition-all cursor-pointer border ${
                    isUnlocked
                      ? 'bg-gradient-to-b from-[#2e180c] to-[#1a0f07] border-amber-500/50 hover:border-amber-400 hover:scale-105 shadow-lg'
                      : 'bg-black/40 border-white/5 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <span className="text-sm font-black text-white">{lvl.levelNumber}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-2.5 h-2.5 ${
                          s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-amber-300/80 font-bold">
                    {lvl.quota} 🍉
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PAUSE MODAL */}
      {gameStatus === 'paused' && !showQuitConfirm && (
        <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#221207] border-2 border-amber-600/50 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
              Game Paused
            </h3>
            <p className="text-xs text-amber-300/80 font-bold mb-6">
              Level {currentLevelNum} • Progress: {fruitsSliced}/{activeLevelConfig.quota}
            </p>

            <div className="w-full space-y-2.5">
              <button
                onClick={togglePause}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm uppercase tracking-wide shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Game</span>
              </button>

              <button
                onClick={() => {
                  fruitAudio.playButtonClick();
                  startLevel(currentLevelNum);
                }}
                className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Level</span>
              </button>

              <button
                onClick={() => {
                  fruitAudio.playButtonClick();
                  engineRef.current?.stop();
                  setGameStatus('level_select');
                }}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Level Select</span>
              </button>

              <button
                onClick={() => {
                  fruitAudio.playButtonClick();
                  setShowQuitConfirm(true);
                }}
                className="w-full py-2.5 text-slate-400 hover:text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quit Game</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUIT GAME CONFIRMATION MODAL */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#2a170d] to-[#170c06] border-2 border-amber-600/60 rounded-3xl p-6 text-center shadow-2xl shadow-black/90 flex flex-col items-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center shadow-lg mb-3">
              <ArrowLeft className="w-7 h-7 text-black stroke-[2.5]" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
              QUIT GAME?
            </h3>
            <p className="text-xs text-amber-200/80 font-bold mb-6 leading-relaxed">
              Are you sure you want to leave? Your progress in Stage {currentLevelNum} will be lost.
            </p>

            <div className="w-full space-y-2.5">
              <button
                onClick={() => {
                  fruitAudio.playButtonClick();
                  setShowQuitConfirm(false);
                  engineRef.current?.resume();
                  setGameStatus('playing');
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-sm uppercase tracking-wide shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Continue Playing</span>
              </button>

              <button
                onClick={() => {
                  fruitAudio.playButtonClick();
                  setShowQuitConfirm(false);
                  engineRef.current?.destroy();
                  onExit();
                }}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-rose-300 font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Quit to Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL COMPLETE SCREEN */}
      {gameStatus === 'level_complete' && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#221207] border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl flex flex-col items-center animate-in zoom-in-95">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 text-xs font-black uppercase tracking-wider mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>STAGE CLEARED!</span>
            </div>

            <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
              Level {currentLevelNum} Complete!
            </h3>

            {/* Stars */}
            <div className="flex items-center gap-2 my-3">
              {[1, 2, 3].map((s) => {
                const earned = currentLevelRecord.stars >= s;
                return (
                  <div
                    key={s}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${
                      earned
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-400/30'
                        : 'bg-black/30 border-white/10 text-slate-600'
                    }`}
                  >
                    <Star className={`w-7 h-7 ${earned ? 'fill-current' : ''}`} />
                  </div>
                );
              })}
            </div>

            {/* Stats Breakdown */}
            <div className="w-full grid grid-cols-2 gap-2 my-4">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Final Score
                </span>
                <span className="text-2xl font-black text-white font-mono">{score}</span>
              </div>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Fruits Sliced
                </span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {fruitsSliced}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2.5">
              {currentLevelNum < 40 ? (
                <button
                  onClick={() => {
                    fruitAudio.playButtonClick();
                    startLevel(currentLevelNum + 1);
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-base uppercase tracking-wide shadow-xl shadow-green-600/40 border-t border-white/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <span>Next Stage (Level {currentLevelNum + 1})</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="text-amber-300 font-black text-sm uppercase py-2">
                  🏆 YOU HAVE CONQUERED ALL 40 LEVELS!
                </div>
              )}

              <button
                onClick={() => {
                  fruitAudio.playButtonClick();
                  startLevel(currentLevelNum);
                }}
                className="w-full py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Stage</span>
              </button>

              <button
                onClick={() => {
                  fruitAudio.playButtonClick();
                  setGameStatus('level_select');
                }}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Select Level</span>
              </button>

              <button
                onClick={() => {
                  fruitAudio.playButtonClick();
                  onGameOver(score, finalDuration);
                  onExit();
                }}
                className="w-full py-2 text-slate-400 hover:text-white font-bold text-xs uppercase flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit to Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameStatus === 'game_over' && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#221207] border-2 border-rose-600/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl flex flex-col items-center animate-in zoom-in-95">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-400 text-xs font-black uppercase tracking-wider mb-3">
              <XCircle className="w-4 h-4" />
              <span>STAGE FAILED</span>
            </div>

            <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
              {isBombFail ? '💣 Bomb Detonated!' : '3 Fruits Missed!'}
            </h3>
            <p className="text-xs text-rose-300 font-bold mb-4">
              {isBombFail
                ? 'Avoid slicing black bombs or use deflections!'
                : 'Do not let whole fruits drop past the screen!'}
            </p>

            <div className="w-full grid grid-cols-2 gap-2 my-3">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Stage Score
                </span>
                <span className="text-2xl font-black text-white font-mono">{score}</span>
              </div>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Fruits Sliced
                </span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {fruitsSliced}/{activeLevelConfig.quota}
                </span>
              </div>
            </div>

            <div className="w-full space-y-2.5 mt-2">
              <button
                onClick={() => {
                  fruitAudio.playButtonClick();
                  startLevel(currentLevelNum);
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-black text-base uppercase tracking-wide shadow-xl shadow-rose-600/40 border-t border-white/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Try Again</span>
              </button>

              <button
                onClick={() => {
                  fruitAudio.playButtonClick();
                  setGameStatus('level_select');
                }}
                className="w-full py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Select Another Level</span>
              </button>

              <button
                onClick={() => {
                  fruitAudio.playButtonClick();
                  onGameOver(score, finalDuration);
                  onExit();
                }}
                className="w-full py-2 text-slate-400 hover:text-white font-bold text-xs uppercase flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit to Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
