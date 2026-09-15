/**
 * TelePlay Shared Game Engine Hook
 * Provides reusable, leak-free orchestration for:
 * - Session lifecycle (ready, playing, paused, level-complete, game-over)
 * - Move limits & optional countdown timers
 * - Score accumulation, combo tracking, and combo shoutouts
 * - Level progression and star rating calculations
 * - Duplicate submission & double-energy deduction guards
 * - Sound control and local high score synchronization
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngineConfig, GameEngineState, ComboEvent, GameSessionStatus } from './types';
import { SoundFX } from './soundEffects';
import { StorageService } from '../services/storageService';

const COMBO_TITLES: { min: number; title: string; pointsBonus: number }[] = [
  { min: 2, title: 'SWEET!', pointsBonus: 100 },
  { min: 3, title: 'TASTY!', pointsBonus: 250 },
  { min: 4, title: 'DELICIOUS!', pointsBonus: 500 },
  { min: 5, title: 'DIVINE!', pointsBonus: 1000 },
  { min: 6, title: 'SUGAR CRUSH!', pointsBonus: 2000 },
];

export function useGameEngine(config: GameEngineConfig) {
  const {
    gameId,
    gameTitle,
    initialMoves = 25,
    initialTimeSeconds = 60,
    isTimed = false,
    baseTargetScore = 3000,
    targetScoreStep = 2500,
    autoStart = true,
    isAudioEnabled = true,
    onGameOver,
  } = config;

  // Initialize high score from local persistence
  const getStoredHighScore = (): number => {
    try {
      const profile = StorageService.getProfile();
      return profile.highScores[gameId] || 0;
    } catch {
      return 0;
    }
  };

  const [state, setState] = useState<GameEngineState>(() => ({
    status: autoStart ? 'playing' : 'ready',
    score: 0,
    highScore: getStoredHighScore(),
    level: 1,
    targetScore: baseTargetScore,
    movesRemaining: initialMoves,
    timeRemaining: initialTimeSeconds,
    timeElapsed: 0,
    combo: 0,
    maxCombo: 0,
    multiplier: 1,
    stars: 0,
    isAudioMuted: !isAudioEnabled,
    activeComboEvent: null,
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    hasSubmittedLeaderboard: false,
    energyDeducted: true, // Energy deduction happened on session bridge launch
  }));

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Sync sound engine mute state
  useEffect(() => {
    SoundFX.setMuted(state.isAudioMuted);
  }, [state.isAudioMuted]);

  // Main game timer loop for time elapsed or countdown
  useEffect(() => {
    if (state.status === 'playing') {
      timerRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.status !== 'playing') return prev;

          const newTimeElapsed = prev.timeElapsed + 1;
          let newTimeRemaining = prev.timeRemaining;

          if (isTimed) {
            newTimeRemaining = Math.max(0, prev.timeRemaining - 1);
            if (newTimeRemaining === 0) {
              // Time's up -> Game Over
              setTimeout(() => {
                triggerGameOver(prev.score, newTimeElapsed);
              }, 100);
            }
          }

          return {
            ...prev,
            timeElapsed: newTimeElapsed,
            timeRemaining: newTimeRemaining,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.status, isTimed]);

  // Clean up on component unmount / visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && stateRef.current.status === 'playing') {
        pauseGame();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerRef.current) clearInterval(timerRef.current);
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    };
  }, []);

  /**
   * Calculates star count (0 to 3) based on target score
   */
  const calculateStars = (score: number, target: number): number => {
    if (score >= target * 2.0) return 3;
    if (score >= target * 1.4) return 2;
    if (score >= target) return 1;
    return 0;
  };

  /**
   * Start or Resume game
   */
  const startGame = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'playing',
    }));
  }, []);

  /**
   * Pause game
   */
  const pauseGame = useCallback(() => {
    setState((prev) => {
      if (prev.status === 'playing') {
        return { ...prev, status: 'paused' };
      }
      return prev;
    });
  }, []);

  /**
   * Resume game
   */
  const resumeGame = useCallback(() => {
    setState((prev) => {
      if (prev.status === 'paused') {
        return { ...prev, status: 'playing' };
      }
      return prev;
    });
  }, []);

  /**
   * Toggle Audio Mute
   */
  const toggleMute = useCallback(() => {
    setState((prev) => {
      const nextMuted = !prev.isAudioMuted;
      SoundFX.setMuted(nextMuted);
      return { ...prev, isAudioMuted: nextMuted };
    });
  }, []);

  /**
   * Trigger Combo Event & Banner
   */
  const registerCombo = useCallback((comboCount: number, basePoints: number) => {
    if (comboCount < 2) return;

    let comboTitle = 'SWEET!';
    let bonus = 100;
    for (const c of COMBO_TITLES) {
      if (comboCount >= c.min) {
        comboTitle = c.title;
        bonus = c.pointsBonus;
      }
    }

    const event: ComboEvent = {
      count: comboCount,
      multiplier: comboCount,
      message: comboTitle,
      points: bonus,
      timestamp: Date.now(),
    };

    SoundFX.playComboFanfare(comboCount);

    setState((prev) => ({
      ...prev,
      combo: comboCount,
      maxCombo: Math.max(prev.maxCombo, comboCount),
      multiplier: Math.min(6, comboCount),
      activeComboEvent: event,
    }));

    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        activeComboEvent: null,
      }));
    }, 1600);
  }, []);

  /**
   * Add Points to Score
   */
  const addScore = useCallback((points: number, comboCount: number = 1) => {
    setState((prev) => {
      const comboMult = Math.max(1, comboCount);
      const earned = points * comboMult;
      const newScore = prev.score + earned;
      const newHighScore = Math.max(prev.highScore, newScore);
      const stars = calculateStars(newScore, prev.targetScore);

      return {
        ...prev,
        score: newScore,
        highScore: newHighScore,
        stars,
      };
    });

    if (comboCount >= 2) {
      registerCombo(comboCount, points);
    }
  }, [registerCombo]);

  /**
   * Decrement Moves and Check for Win / Loss conditions
   */
  const recordMoveMade = useCallback(() => {
    setState((prev) => {
      const newMoves = Math.max(0, prev.movesRemaining - 1);
      
      // If target score reached:
      if (prev.score >= prev.targetScore) {
        // Level complete!
        SoundFX.playLevelComplete();
        return {
          ...prev,
          movesRemaining: newMoves,
          status: 'level-complete',
        };
      }

      // If out of moves:
      if (newMoves === 0) {
        // Game over
        setTimeout(() => {
          triggerGameOver(prev.score, prev.timeElapsed);
        }, 300);
        return {
          ...prev,
          movesRemaining: 0,
          status: 'game-over',
        };
      }

      return {
        ...prev,
        movesRemaining: newMoves,
      };
    });
  }, []);

  /**
   * Progress to Next Level (Retains score, gives fresh moves, increases target)
   */
  const nextLevel = useCallback(() => {
    setState((prev) => {
      const nextLvl = prev.level + 1;
      const newTarget = prev.targetScore + targetScoreStep * nextLvl;
      const bonusMoves = initialMoves + Math.floor(prev.movesRemaining * 0.5);

      return {
        ...prev,
        level: nextLvl,
        targetScore: newTarget,
        movesRemaining: bonusMoves,
        status: 'playing',
        stars: 0,
      };
    });
  }, [initialMoves, targetScoreStep]);

  /**
   * Trigger Game Over and submit once to prevent duplicate leaderboard submissions
   */
  const triggerGameOver = useCallback((finalScore?: number, duration?: number) => {
    const curr = stateRef.current;
    if (curr.hasSubmittedLeaderboard && curr.status === 'game-over') {
      return; // Deduplication guard
    }

    const s = finalScore !== undefined ? finalScore : curr.score;
    const dur = duration !== undefined ? duration : curr.timeElapsed;

    SoundFX.playGameOver();

    setState((prev) => ({
      ...prev,
      status: 'game-over',
      hasSubmittedLeaderboard: true,
    }));

    // Dispatch callback to portal state
    onGameOver(s, dur);
  }, [onGameOver]);

  /**
   * Restart Current Game
   */
  const restartGame = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'playing',
      score: 0,
      level: 1,
      targetScore: baseTargetScore,
      movesRemaining: initialMoves,
      timeRemaining: initialTimeSeconds,
      timeElapsed: 0,
      combo: 0,
      maxCombo: 0,
      multiplier: 1,
      stars: 0,
      activeComboEvent: null,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      hasSubmittedLeaderboard: false,
    }));
  }, [baseTargetScore, initialMoves, initialTimeSeconds]);

  return {
    state,
    startGame,
    pauseGame,
    resumeGame,
    toggleMute,
    addScore,
    registerCombo,
    recordMoveMade,
    nextLevel,
    triggerGameOver,
    restartGame,
  };
}
