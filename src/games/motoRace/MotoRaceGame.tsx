/**
 * MOTO RACE — 3D First-Person Motorcycle Traffic Racing Game Component
 * 
 * Flow:
 * OPEN MOTO RACE -> MAIN MENU -> PLAY -> 40-LEVEL SELECTION -> EXISTING 3D GAMEPLAY
 * 
 * Features:
 * - Professional Pre-Game Main Menu (Player ID masked, Current Level, Total Score, Global Rank)
 * - Professional Tournament Leaderboard (Top 10 + Fixed User Rank, Masked MSISDN)
 * - 40 Progressive Levels with Sequential Locking (Level 1 unlocked, N+1 unlocks on completion of N)
 * - Realistic Road Asphalt Material (Natural medium-dark gray, fine aggregate grain, subtle wear, balanced lighting)
 * - Authentic 3D First-Person Cockpit & Tactile High-Octane Controls
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Trophy, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  RotateCcw, 
  ArrowLeft, 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Clock, 
  AlertTriangle,
  Flag,
  Disc,
  ListOrdered
} from 'lucide-react';
import { GameDefinition, UserProfile } from '../../types';
import { MotoRaceEngine } from './MotoRaceEngine';
import { MotoRaceAudio } from './MotoRaceAudio';
import { getMotoRaceLevel } from './motoRaceLevels';
import { MotoRaceStatus, MotoLevelRecord } from './types';
import { MotoRaceMainMenu } from './components/MotoRaceMainMenu';
import { MotoRaceLeaderboard } from './components/MotoRaceLeaderboard';
import { MotoRaceLevelSelect } from './components/MotoRaceLevelSelect';
import { maskMsisdn, normalizeToMsisdn } from './utils/msisdn';

interface MotoRaceGameProps {
  game: GameDefinition;
  profile: UserProfile;
  onGameOver: (score: number, durationSeconds: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

export const MotoRaceGame: React.FC<MotoRaceGameProps> = ({
  game,
  profile,
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<MotoRaceEngine | null>(null);
  const audioRef = useRef<MotoRaceAudio | null>(null);

  // Application Flow State: 'menu' | 'leaderboard' | 'level_select' | 'playing'
  const [gameStatus, setGameStatus] = useState<MotoRaceStatus>('menu');

  // Level Progression Storage (Levels 1 to 40)
  const [levelProgress, setLevelProgress] = useState<Record<number, MotoLevelRecord>>(() => {
    try {
      const saved = localStorage.getItem('teleplay_motorace_levels_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }

    // Initial state: Level 1 Unlocked, Levels 2-40 Locked
    const initial: Record<number, MotoLevelRecord> = {};
    for (let i = 1; i <= 40; i++) {
      initial[i] = {
        level: i,
        unlocked: i === 1,
        completed: false,
        highScore: 0,
      };
    }
    return initial;
  });

  // Cumulative Total Tournament Score
  const [totalScore, setTotalScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('teleplay_motorace_total_score');
      if (saved) {
        const n = parseInt(saved, 10);
        if (!isNaN(n)) return n;
      }
    } catch (e) {
      // ignore
    }
    return 0;
  });

  // Active Selected Level (1 to 40)
  const [currentLevelNum, setCurrentLevelNum] = useState<number>(1);
  const currentLevelConfig = getMotoRaceLevel(currentLevelNum);

  // Player MSISDN normalization & masking
  const rawMsisdn = useMemo(() => normalizeToMsisdn(profile.phoneNumber || '251911598830'), [profile.phoneNumber]);
  const playerMsisdnMasked = useMemo(() => maskMsisdn(rawMsisdn), [rawMsisdn]);

  // Highest Reached Stage
  const highestLevelReached = useMemo(() => {
    let highest = 1;
    for (let i = 1; i <= 40; i++) {
      if (levelProgress[i]?.unlocked) {
        highest = i;
      }
    }
    return highest;
  }, [levelProgress]);

  // Dynamic Global Rank String based on score
  const globalRankString = useMemo(() => {
    if (totalScore <= 0) return '#2,481';
    if (totalScore >= 18920) return '#1';
    if (totalScore >= 18745) return '#2';
    if (totalScore >= 18520) return '#3';
    if (totalScore >= 18150) return '#4';
    if (totalScore >= 17890) return '#5';
    if (totalScore >= 17420) return '#6';
    if (totalScore >= 16980) return '#7';
    if (totalScore >= 16450) return '#8';
    if (totalScore >= 15890) return '#9';
    if (totalScore >= 15200) return '#10';
    const deficit = 15200 - totalScore;
    const computed = Math.min(2481, Math.max(11, Math.round(11 + (deficit / 15200) * 2470)));
    return `#${computed.toLocaleString()}`;
  }, [totalScore]);

  // Real-time in-game HUD telemetry
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(currentLevelConfig.timeLimitSeconds);
  const [score, setScore] = useState<number>(0);
  const [nearMissToast, setNearMissToast] = useState<{ combo: number; points: number; timeSec: number } | null>(null);
  const [highSpeedStreak, setHighSpeedStreak] = useState<{ active: boolean; seconds: number }>({ active: false, seconds: 0 });

  // Game Lifecycle States
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(!isAudioEnabled);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [isCrashed, setIsCrashed] = useState<boolean>(false);
  const [isLevelComplete, setIsLevelComplete] = useState<boolean>(false);
  const [completionStats, setCompletionStats] = useState<{ score: number; timeTakenSec: number; overtakes: number } | null>(null);
  const [crashStats, setCrashStats] = useState<{ score: number; distanceMeters: number; overtakes: number } | null>(null);

  // Button Pressed Visual States
  const [gasActive, setGasActive] = useState<boolean>(false);
  const [brakeActive, setBrakeActive] = useState<boolean>(false);
  const [steerLeftActive, setSteerLeftActive] = useState<boolean>(false);
  const [steerRightActive, setSteerRightActive] = useState<boolean>(false);

  // Raw Input Tracking Refs
  const inputRef = useRef({
    gas: false,
    brake: false,
    steer: 0,
  });

  const sessionStartTime = useRef<number>(Date.now());

  // Helper to sync inputs immediately to the running engine
  const syncInputsToEngine = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.setGasPressed(inputRef.current.gas);
    engineRef.current.setBrakePressed(inputRef.current.brake);
    engineRef.current.setSteerInput(inputRef.current.steer);
  }, []);

  // Initialize Game Engine when playing
  const startEngine = useCallback((levelNum: number) => {
    if (!containerRef.current) return;

    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }

    const config = getMotoRaceLevel(levelNum);
    const audio = new MotoRaceAudio(isAudioMuted);
    audio.init();
    audioRef.current = audio;

    const engine = new MotoRaceEngine(containerRef.current, config, audio, {
      onSpeedChange: (s) => setSpeedKmh(s),
      onDistanceChange: (dist) => setDistanceMeters(dist),
      onTimeChange: (time) => setRemainingSeconds(time),
      onScoreChange: (sc) => setScore(sc),
      onNearMiss: (combo, points, timeBonus) => {
        setNearMissToast({ combo, points, timeSec: timeBonus });
        setTimeout(() => setNearMissToast(null), 1800);
      },
      onHighSpeedStreak: (active, secs) => {
        setHighSpeedStreak({ active, seconds: secs });
      },
      onCrash: (stats) => {
        setIsCrashed(true);
        setCrashStats(stats);
      },
      onLevelComplete: (stats) => {
        setIsLevelComplete(true);
        setCompletionStats(stats);

        // Update Level Progression & Unlock Next Level
        setLevelProgress((prev) => {
          const currentRec = prev[levelNum] || {
            level: levelNum,
            unlocked: true,
            completed: false,
            highScore: 0,
          };
          const newHighScore = Math.max(currentRec.highScore, stats.score);
          const updated: Record<number, MotoLevelRecord> = {
            ...prev,
            [levelNum]: {
              ...currentRec,
              completed: true,
              highScore: newHighScore,
              bestTimeSec: currentRec.bestTimeSec
                ? Math.min(currentRec.bestTimeSec, stats.timeTakenSec)
                : stats.timeTakenSec,
            },
          };

          // Unlock Level N+1 in sequence
          if (levelNum < 40) {
            const nextLvl = levelNum + 1;
            const nextRec = updated[nextLvl] || {
              level: nextLvl,
              unlocked: false,
              completed: false,
              highScore: 0,
            };
            updated[nextLvl] = {
              ...nextRec,
              unlocked: true,
            };
          }

          try {
            localStorage.setItem('teleplay_motorace_levels_v1', JSON.stringify(updated));
          } catch (e) {
            // ignore
          }

          return updated;
        });

        // Add to Cumulative Tournament Score
        setTotalScore((prev) => {
          const nextTotal = prev + stats.score;
          try {
            localStorage.setItem('teleplay_motorace_total_score', String(nextTotal));
          } catch (e) {
            // ignore
          }
          return nextTotal;
        });

        // Trigger onGameOver callback to record score
        onGameOver(stats.score, stats.timeTakenSec);
      },
    });

    engineRef.current = engine;
    syncInputsToEngine();
    engine.animate();
  }, [isAudioMuted, onGameOver, syncInputsToEngine]);

  // Mount/Dismount Engine based on gameStatus
  useEffect(() => {
    if (gameStatus === 'playing') {
      startEngine(currentLevelNum);
    } else {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [gameStatus, currentLevelNum, startEngine]);

  // Countdown timer: 3, 2, 1, GO!
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
      }, 700);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      const timer = setTimeout(() => {
        setCountdown(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [countdown, gameStatus]);

  // Keyboard Listeners (W/A/S/D & Arrows & Space)
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const keysPressed: { [key: string]: boolean } = {};

    const recalculateKeyboardInputs = () => {
      const gas = !!(keysPressed['w'] || keysPressed['arrowup']);
      const brake = !!(keysPressed['s'] || keysPressed['arrowdown'] || keysPressed[' ']);
      let steer = 0;
      if (keysPressed['a'] || keysPressed['arrowleft']) steer -= 1;
      if (keysPressed['d'] || keysPressed['arrowright']) steer += 1;

      setGasActive(gas || inputRef.current.gas);
      setBrakeActive(brake || inputRef.current.brake);
      setSteerLeftActive(steer < 0 || inputRef.current.steer < 0);
      setSteerRightActive(steer > 0 || inputRef.current.steer > 0);

      inputRef.current.gas = gas;
      inputRef.current.brake = brake;
      inputRef.current.steer = steer;
      syncInputsToEngine();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      keysPressed[e.key.toLowerCase()] = true;
      recalculateKeyboardInputs();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = false;
      recalculateKeyboardInputs();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStatus, syncInputsToEngine]);

  // Touch & Pointer Controls for Ergonomic Tactile Buttons
  const handleGasDown = (e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    inputRef.current.gas = true;
    setGasActive(true);
    syncInputsToEngine();
  };

  const handleGasUp = (e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    inputRef.current.gas = false;
    setGasActive(false);
    syncInputsToEngine();
  };

  const handleBrakeDown = (e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    inputRef.current.brake = true;
    setBrakeActive(true);
    syncInputsToEngine();
  };

  const handleBrakeUp = (e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    inputRef.current.brake = false;
    setBrakeActive(false);
    syncInputsToEngine();
  };

  const handleSteerLeftDown = (e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    inputRef.current.steer = -1;
    setSteerLeftActive(true);
    syncInputsToEngine();
  };

  const handleSteerLeftUp = (e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    if (inputRef.current.steer === -1) {
      inputRef.current.steer = 0;
    }
    setSteerLeftActive(false);
    syncInputsToEngine();
  };

  const handleSteerRightDown = (e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    inputRef.current.steer = 1;
    setSteerRightActive(true);
    syncInputsToEngine();
  };

  const handleSteerRightUp = (e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    if (inputRef.current.steer === 1) {
      inputRef.current.steer = 0;
    }
    setSteerRightActive(false);
    syncInputsToEngine();
  };

  // Window-level safety release
  useEffect(() => {
    const handleGlobalRelease = () => {
      inputRef.current.gas = false;
      inputRef.current.brake = false;
      inputRef.current.steer = 0;
      setGasActive(false);
      setBrakeActive(false);
      setSteerLeftActive(false);
      setSteerRightActive(false);
      syncInputsToEngine();
    };

    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('pointercancel', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    window.addEventListener('touchcancel', handleGlobalRelease);

    return () => {
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('pointercancel', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
      window.removeEventListener('touchcancel', handleGlobalRelease);
    };
  }, [syncInputsToEngine]);

  // Pause & Resume
  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      engineRef.current?.resume();
    } else {
      setIsPaused(true);
      engineRef.current?.pause();
    }
  };

  // Sound Toggle
  const toggleAudio = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    if (audioRef.current) {
      if (nextMuted) {
        audioRef.current.mute();
      } else {
        audioRef.current.unmute();
      }
    }
  };

  // Retry Level
  const handleRestartLevel = () => {
    setIsCrashed(false);
    setIsLevelComplete(false);
    setIsPaused(false);
    setCrashStats(null);
    setCompletionStats(null);
    setDistanceMeters(0);
    setSpeedKmh(0);
    setCountdown(3);
    startEngine(currentLevelNum);
  };

  // Next Level
  const handleNextLevel = () => {
    if (currentLevelNum < 40) {
      const nextLevel = currentLevelNum + 1;
      setCurrentLevelNum(nextLevel);
      setIsLevelComplete(false);
      setIsCrashed(false);
      setIsPaused(false);
      setCompletionStats(null);
      setDistanceMeters(0);
      setSpeedKmh(0);
      setCountdown(3);
      startEngine(nextLevel);
    } else {
      // Completed all 40 levels
      setGameStatus('level_select');
    }
  };

  // Exit Game
  const handleExitGame = () => {
    const elapsedSec = Math.round((Date.now() - sessionStartTime.current) / 1000);
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
    onGameOver(score, elapsedSec);
    onExit();
  };

  // Handle Level Selection
  const handleSelectLevel = (lvl: number) => {
    setCurrentLevelNum(lvl);
    setDistanceMeters(0);
    setSpeedKmh(0);
    setScore(0);
    setCountdown(3);
    setIsCrashed(false);
    setIsLevelComplete(false);
    setIsPaused(false);
    setCrashStats(null);
    setCompletionStats(null);
    setGameStatus('playing');
  };

  // Mobile/Browser back button navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (gameStatus === 'leaderboard') {
        setGameStatus('menu');
      } else if (gameStatus === 'level_select') {
        setGameStatus('menu');
      } else if (gameStatus === 'playing') {
        setGameStatus('level_select');
      } else if (gameStatus === 'menu') {
        onExit();
      }
    };

    window.history.pushState({ motoScreen: gameStatus }, '');
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [gameStatus, onExit]);

  // =========================================================================
  // VIEW 1: PRE-GAME MAIN MENU (FLOW STEP 1)
  // =========================================================================
  if (gameStatus === 'menu') {
    return (
      <MotoRaceMainMenu
        playerMsisdnMasked={playerMsisdnMasked}
        currentLevel={highestLevelReached}
        totalScore={totalScore}
        globalRank={globalRankString}
        onPlay={() => setGameStatus('level_select')}
        onLeaderboard={() => setGameStatus('leaderboard')}
        onExit={onExit}
        isAudioMuted={isAudioMuted}
        onToggleAudio={toggleAudio}
      />
    );
  }

  // =========================================================================
  // VIEW 2: TOURNAMENT LEADERBOARD
  // =========================================================================
  if (gameStatus === 'leaderboard') {
    return (
      <MotoRaceLeaderboard
        userScore={totalScore}
        userLevel={highestLevelReached}
        userRawMsisdn={rawMsisdn}
        userRankString={globalRankString}
        onBack={() => setGameStatus('menu')}
      />
    );
  }

  // =========================================================================
  // VIEW 3: 40-LEVEL SELECTION (FLOW STEP 2)
  // =========================================================================
  if (gameStatus === 'level_select') {
    return (
      <MotoRaceLevelSelect
        levelProgress={levelProgress}
        currentLevelNum={currentLevelNum}
        onSelectLevel={handleSelectLevel}
        onBack={() => setGameStatus('menu')}
      />
    );
  }

  // =========================================================================
  // VIEW 4: EXISTING 3D MOTO RACE GAMEPLAY (FLOW STEP 3)
  // =========================================================================
  const progressPercent = Math.min(
    100,
    Math.round((distanceMeters / currentLevelConfig.targetDistanceMeters) * 100)
  );

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#070c14] font-['Plus_Jakarta_Sans',sans-serif] touch-none">
      {/* 3D WebGL Canvas Viewport */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* =========================================================================
          PROFESSIONAL 3D BUTTON-BASED TOP HUD
         ========================================================================= */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-6 z-20 pointer-events-none flex items-start justify-between">
        
        {/* Top-Left: Back Button to Level Select & Score Container */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            id="moto-btn-back-to-select"
            type="button"
            onClick={() => setGameStatus('level_select')}
            aria-label="Back to Stage Select"
            title="Stage Select"
            className="w-10 h-10 min-w-[40px] rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 active:translate-y-1 border-2 border-slate-700/80 active:border-slate-500 shadow-[0_4px_0_#0f172a,0_8px_16px_rgba(0,0,0,0.5)] active:shadow-[0_1px_0_#0f172a] text-slate-200 active:text-white flex items-center justify-center cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700/80 shadow-[0_4px_0_#0f172a,0_8px_16px_rgba(0,0,0,0.6)] backdrop-blur-md">
            <Trophy className="w-4 h-4 text-amber-400 fill-current drop-shadow" />
            <div className="flex flex-col leading-none">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">SCORE</span>
              <span className="text-base sm:text-lg font-black font-mono text-white tracking-tight">
                {score.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Top-Center: 3D Level & Distance Progress */}
        <div className="pointer-events-auto flex flex-col items-center">
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700/80 shadow-[0_4px_0_#0f172a,0_8px_16px_rgba(0,0,0,0.6)] backdrop-blur-md">
            {/* Level Title */}
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs sm:text-sm font-black tracking-widest text-emerald-400 uppercase">
                LEVEL {currentLevelNum}
              </span>
            </div>

            <div className="w-px h-5 bg-slate-700" />

            {/* Mission Timer */}
            <div className="flex items-center gap-1 text-slate-200">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span className={`text-xs sm:text-sm font-mono font-black ${remainingSeconds < 10 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
                {remainingSeconds.toFixed(1)}s
              </span>
            </div>
          </div>

          {/* Mini Distance Progress Bar */}
          <div className="w-36 sm:w-48 h-1.5 mt-1.5 rounded-full bg-slate-950/80 border border-slate-700/50 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Top-Right: Sound & Pause Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            id="moto-btn-audio"
            type="button"
            onClick={toggleAudio}
            aria-label={isAudioMuted ? "Unmute Engine" : "Mute Engine"}
            className="w-10 h-10 min-w-[40px] rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 active:translate-y-1 border-2 border-slate-700/80 active:border-slate-500 shadow-[0_4px_0_#0f172a,0_8px_16px_rgba(0,0,0,0.5)] active:shadow-[0_1px_0_#0f172a] text-slate-200 active:text-white flex items-center justify-center cursor-pointer transition-all"
          >
            {isAudioMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          <button
            id="moto-btn-pause"
            type="button"
            onClick={togglePause}
            aria-label="Pause Game"
            className="w-10 h-10 min-w-[40px] rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 active:translate-y-1 border-2 border-slate-700/80 active:border-slate-500 shadow-[0_4px_0_#0f172a,0_8px_16px_rgba(0,0,0,0.5)] active:shadow-[0_1px_0_#0f172a] text-slate-200 active:text-white flex items-center justify-center cursor-pointer transition-all"
          >
            <Pause className="w-4 h-4 text-sky-400 fill-current" />
          </button>
        </div>

      </div>

      {/* =========================================================================
          DYNAMIC HUD POPUPS (Near Misses & High Speed Combos)
         ========================================================================= */}
      {nearMissToast && (
        <div className="absolute top-20 inset-x-0 z-30 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-4 duration-150">
          <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white font-black text-sm sm:text-base tracking-wider uppercase shadow-2xl flex items-center gap-2 border-2 border-amber-300">
            <Zap className="w-4 h-4 fill-current animate-bounce" />
            <span>CLOSE OVERTAKE +{nearMissToast.points} PTS (+{nearMissToast.timeSec}s)</span>
          </div>
        </div>
      )}

      {highSpeedStreak.active && highSpeedStreak.seconds >= 2 && (
        <div className="absolute top-28 inset-x-0 z-30 flex justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3.5 py-1 rounded-xl bg-sky-950/80 border border-sky-400 text-sky-300 font-mono font-black text-xs uppercase tracking-widest backdrop-blur-xs flex items-center gap-1.5 shadow-lg">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-current" />
            <span>HIGH SPEED STREAK {highSpeedStreak.seconds}s (+50/s)</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          AUTHENTIC 3D FIRST-PERSON TACTILE ON-SCREEN CONTROLS
         ========================================================================= */}
      <div 
        className="absolute inset-x-0 bottom-3 z-30 px-3 sm:px-8 flex items-end justify-between pointer-events-none"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}
      >
        
        {/* LEFT THUMB: 3D STEERING D-PAD CONTROLLER */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Steer Left */}
          <button
            id="moto-btn-steer-left"
            onPointerDown={handleSteerLeftDown}
            onPointerUp={handleSteerLeftUp}
            onPointerCancel={handleSteerLeftUp}
            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-500/80 text-white flex flex-col items-center justify-center cursor-pointer transition-all duration-75 select-none overflow-hidden ${
              steerLeftActive 
                ? 'translate-y-2 shadow-[0_1px_0_#0f172a] bg-slate-700 border-sky-400' 
                : 'shadow-[0_8px_0_#0f172a,0_16px_24px_rgba(0,0,0,0.6)] hover:brightness-110'
            }`}
            aria-label="Steer Motorcycle Left"
          >
            <div className="absolute inset-x-2 top-1 h-3 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 text-sky-400 stroke-[3] drop-shadow" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-300">LEFT</span>
          </button>

          {/* Steer Right */}
          <button
            id="moto-btn-steer-right"
            onPointerDown={handleSteerRightDown}
            onPointerUp={handleSteerRightUp}
            onPointerCancel={handleSteerRightUp}
            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-500/80 text-white flex flex-col items-center justify-center cursor-pointer transition-all duration-75 select-none overflow-hidden ${
              steerRightActive 
                ? 'translate-y-2 shadow-[0_1px_0_#0f172a] bg-slate-700 border-sky-400' 
                : 'shadow-[0_8px_0_#0f172a,0_16px_24px_rgba(0,0,0,0.6)] hover:brightness-110'
            }`}
            aria-label="Steer Motorcycle Right"
          >
            <div className="absolute inset-x-2 top-1 h-3 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 text-sky-400 stroke-[3] drop-shadow" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-300">RIGHT</span>
          </button>
        </div>

        {/* RIGHT THUMB: 3D GAS THROTTLE & BRAKE SYSTEM */}
        <div className="pointer-events-auto flex items-center gap-3 sm:gap-4">
          {/* 3D BRAKE BUTTON */}
          <button
            id="moto-btn-brake"
            onPointerDown={handleBrakeDown}
            onPointerUp={handleBrakeUp}
            onPointerCancel={handleBrakeUp}
            className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-rose-600 via-rose-700 to-rose-900 border-2 border-rose-400/80 text-white flex flex-col items-center justify-center cursor-pointer transition-all duration-75 select-none overflow-hidden ${
              brakeActive
                ? 'translate-y-1.5 shadow-[0_1px_0_#4c0519] bg-rose-500 border-white'
                : 'shadow-[0_6px_0_#4c0519,0_12px_20px_rgba(225,29,72,0.4)] hover:brightness-110'
            }`}
            aria-label="Disc Brake"
          >
            <div className="absolute inset-x-2 top-1 h-3 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
            <Disc className="w-5 h-5 sm:w-6 sm:h-6 fill-current drop-shadow" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider mt-0.5 drop-shadow">BRAKE</span>
          </button>

          {/* 3D GAS BUTTON */}
          <button
            id="moto-btn-gas"
            onPointerDown={handleGasDown}
            onPointerUp={handleGasUp}
            onPointerCancel={handleGasUp}
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-b from-emerald-500 via-emerald-700 to-emerald-900 border-3 border-emerald-300 text-white flex flex-col items-center justify-center cursor-pointer transition-all duration-75 select-none ring-4 ring-emerald-400/25 overflow-hidden ${
              gasActive
                ? 'translate-y-2.5 shadow-[0_2px_0_#022c22] bg-emerald-400 border-white scale-95'
                : 'shadow-[0_9px_0_#022c22,0_18px_32px_rgba(16,185,129,0.5)] hover:brightness-110'
            }`}
            aria-label="Gas Throttle Accelerator"
          >
            <div className="absolute inset-x-2.5 top-1.5 h-3.5 rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
            <Flame className="w-8 h-8 sm:w-9 sm:h-9 fill-current text-yellow-300 drop-shadow animate-pulse" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest mt-0.5 drop-shadow">GAS</span>
          </button>
        </div>

      </div>

      {/* =========================================================================
          COUNTDOWN 3... 2... 1... GO! OVERLAY
         ========================================================================= */}
      {countdown !== null && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150">
          <div className="text-center space-y-2">
            <div className="text-xs font-black text-sky-400 uppercase tracking-widest">
              {currentLevelConfig.title}
            </div>
            <div className="text-7xl sm:text-9xl font-black italic tracking-tighter text-white drop-shadow-[0_0_35px_rgba(56,189,248,0.9)] animate-pulse">
              {countdown === 0 ? 'GO!' : countdown}
            </div>
            <div className="text-xs font-bold text-slate-300">
              Target: {currentLevelConfig.targetDistanceMeters}m in {currentLevelConfig.timeLimitSeconds}s
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAUSE MODAL OVERLAY
         ========================================================================= */}
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-[#0f172a] border-2 border-slate-700 shadow-2xl p-6 text-center space-y-5">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-sky-950 text-sky-400 text-[10px] font-black uppercase tracking-wider border border-sky-800/60">
                LEVEL {currentLevelNum} PAUSED
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight mt-2">
                RACE PAUSED
              </h3>
              <p className="text-xs text-slate-400">
                Distance: {distanceMeters}m / {currentLevelConfig.targetDistanceMeters}m
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={togglePause}
                className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Resume Driving
              </button>

              <button
                onClick={handleRestartLevel}
                className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 shadow transition-transform active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Restart Level
              </button>

              <button
                onClick={() => {
                  togglePause();
                  setGameStatus('level_select');
                }}
                className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 shadow transition-transform active:scale-95 cursor-pointer"
              >
                <ListOrdered className="w-4 h-4 text-sky-400" />
                Select Stage
              </button>

              <button
                onClick={handleExitGame}
                className="w-full py-3.5 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 border border-rose-800/40 transition-transform active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Exit to Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CRASH / GAME OVER OVERLAY
         ========================================================================= */}
      {isCrashed && crashStats && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#0f172a] border-2 border-rose-600/80 shadow-[0_0_50px_rgba(225,29,72,0.4)] p-6 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-950/80 border-2 border-rose-500 text-rose-400 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black text-rose-400 uppercase tracking-widest">COLLISION</span>
              <h3 className="text-3xl font-black text-white tracking-tight">MOTORCYCLE CRASH</h3>
              <p className="text-xs text-slate-400">High speed collision! Watch out for traffic ahead.</p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Distance</span>
                <span className="text-sm font-black font-mono text-white">{crashStats.distanceMeters}m</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Overtakes</span>
                <span className="text-sm font-black font-mono text-sky-400">{crashStats.overtakes}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Score</span>
                <span className="text-sm font-black font-mono text-amber-400">{crashStats.score}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleRestartLevel}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Level {currentLevelNum}
              </button>

              <button
                onClick={() => setGameStatus('level_select')}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <ListOrdered className="w-3.5 h-3.5 text-sky-400" />
                Select Stage
              </button>

              <button
                onClick={handleExitGame}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Exit to Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          LEVEL COMPLETE CELEBRATION MODAL
         ========================================================================= */}
      {isLevelComplete && completionStats && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#0f172a] border-2 border-emerald-500/80 shadow-[0_0_50px_rgba(16,185,129,0.4)] p-6 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-950/80 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-lg">
              <Flag className="w-8 h-8 fill-current" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">MISSION ACCOMPLISHED</span>
              <h3 className="text-3xl font-black text-white tracking-tight">LEVEL {currentLevelNum} PASSED!</h3>
              <p className="text-xs text-slate-400">Finish line crossed with exceptional precision.</p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Time</span>
                <span className="text-sm font-black font-mono text-white">{completionStats.timeTakenSec}s</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Overtakes</span>
                <span className="text-sm font-black font-mono text-sky-400">{completionStats.overtakes}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Score</span>
                <span className="text-sm font-black font-mono text-emerald-400">{completionStats.score}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {currentLevelNum < 40 ? (
                <button
                  onClick={handleNextLevel}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Next Level ({currentLevelNum + 1})
                </button>
              ) : (
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-xs uppercase">
                  🏆 Championship Complete! All 40 Stages Conquered!
                </div>
              )}

              <button
                onClick={() => setGameStatus('level_select')}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <ListOrdered className="w-3.5 h-3.5 text-sky-400" />
                Select Stage
              </button>

              <button
                onClick={() => setGameStatus('menu')}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Main Menu
              </button>

              <button
                onClick={handleExitGame}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Exit to Portal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
