/**
 * POP PIANO - 40-Level Tournament Progression & Acoustic Piano Tiles
 * 
 * Strict Directives:
 * 1. Pre-Game Main Menu before Level 1 (Play, Levels, Leaderboard, How To Play, Achievements, Statistics, Settings, About).
 * 2. Exactly 40 levels (1 to 40, never 41).
 * 3. Strict Sequential Unlocking: Level 1 is unlocked initially, Levels 2-40 locked.
 *    Level N+1 unlocks ONLY after Level N is successfully completed.
 * 4. Level 1 Tournament Mandate: player must press at least 100 BLACK TILES to complete.
 * 5. Deterministic multi-factor scoring:
 *    - Base Score = successful black tiles * 1
 *    - Speed Bonus (average reaction time ms)
 *    - Accuracy Bonus
 *    - Combo & Streak Bonus
 *    - Precision Bonus (% PERFECT)
 *    - Efficiency Bonus (clean run)
 *    - Difficulty Bonus (Level 1..40 tier weight)
 *    - Completion Bonus (+15 pts on clear)
 *    - Penalties (-5 per miss/wrong)
 *    - NO RANDOM BONUSES
 * 6. Cumulative Tournament Score = sum of personal BEST score of each completed level.
 * 7. Anti-score farming: replaying only replaces best score if new score is higher.
 * 8. Real player data, real statistics, 14 real achievements, clean leaderboard.
 * 9. Decoupled 60 FPS RequestAnimationFrame canvas renderer.
 * 10. Polyphonic acoustic piano synthesizer with Web Audio API.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameStatus,
  JudgementType,
  PianoTileModel,
  HitEffectParticle,
  PopPianoProgress,
  ScoreBreakdown,
} from './types';
import { PianoSynth } from './audioEngine';
import { MelodicNote } from './melodyTracks';
import { getPopPianoLevel, PopPianoLevelConfig, generatePatternForLevel } from './pianoLevelBank';
import { PianoCanvasRenderer } from './pianoCanvasRenderer';
import {
  loadPopPianoProgress,
  savePopPianoProgress,
  calculateLevelScore,
  recordCompletedLevel,
  resetPopPianoProgress,
  INITIAL_PROGRESS,
} from './scoring';
import { PopPianoMenu } from './components/PopPianoMenu';
import { PopPianoLevelSelect } from './components/PopPianoLevelSelect';
import { PopPianoLeaderboard } from './components/PopPianoLeaderboard';
import { PopPianoHowToPlay } from './components/PopPianoHowToPlay';
import { PopPianoAchievements } from './components/PopPianoAchievements';
import { PopPianoStatistics } from './components/PopPianoStatistics';
import { PopPianoSettings } from './components/PopPianoSettings';
import { PopPianoAbout } from './components/PopPianoAbout';
import { PopPianoResultModal } from './components/PopPianoResultModal';
import { GameDefinition, UserProfile } from '../../types';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  ArrowLeft,
  Target,
  Flame,
  Clock,
  Music,
  Grid3X3,
  Menu,
} from 'lucide-react';

interface PopPianoGameProps {
  game: GameDefinition;
  profile?: UserProfile;
  onGameOver: (score: number, durationSeconds: number) => void;
  onExit: () => void;
  onRequestSessionStart?: () => boolean;
  isAudioEnabled?: boolean;
}

export const PopPianoGame: React.FC<PopPianoGameProps> = ({
  profile,
  onGameOver,
  onExit,
  onRequestSessionStart,
  isAudioEnabled = true,
}) => {
  // 1. Authoritative Tournament Progression State
  const [progress, setProgress] = useState<PopPianoProgress>(() => loadPopPianoProgress());
  const progressRef = useRef<PopPianoProgress>(progress);
  progressRef.current = progress;

  // 2. Primary Game State: Starts on 'MAIN_MENU'
  const [gameState, setGameState] = useState<GameStatus>('MAIN_MENU');
  const [currentLevelNum, setCurrentLevelNum] = useState<number>(1);
  const [countdown, setCountdown] = useState<number | 'GO' | 'READY'>('READY');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(!isAudioEnabled);
  const [failReason, setFailReason] = useState<string>('Missed Black Tile');

  // 3. Completed Run Result State
  const [completedBreakdown, setCompletedBreakdown] = useState<ScoreBreakdown | null>(null);

  // 4. Live In-Game HUD States
  const [hudTilesHit, setHudTilesHit] = useState<number>(0);
  const [hudScore, setHudScore] = useState<number>(0);
  const [hudCombo, setHudCombo] = useState<number>(0);
  const [hudAccuracy, setHudAccuracy] = useState<number>(100);

  // 5. Real-time Physics & Simulation Refs (Decoupled from React render cycles)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<PianoCanvasRenderer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const tilesRef = useRef<PianoTileModel[]>([]);
  const currentLevelNotesRef = useRef<MelodicNote[]>([]);
  const nextNoteIndexRef = useRef<number>(0);
  const particlesRef = useRef<HitEffectParticle[]>([]);
  const pressedLanesRef = useRef<Record<number, boolean>>({ 0: false, 1: false, 2: false, 3: false });
  const laneFlashesRef = useRef<Record<number, 'hit' | 'miss' | null>>({ 0: null, 1: null, 2: null, 3: null });

  // Telemetry refs for deterministic scoring calculation
  const currentLevelRef = useRef<number>(1);
  const levelHitsRef = useRef<number>(0);
  const perfectCountRef = useRef<number>(0);
  const greatCountRef = useRef<number>(0);
  const missCountRef = useRef<number>(0);
  const wrongLaneCountRef = useRef<number>(0);
  const comboRef = useRef<number>(0);
  const maxComboRef = useRef<number>(0);
  const reactionTimesRef = useRef<number[]>([]);
  const levelStartTimeRef = useRef<number>(0);
  const attemptSeedRef = useRef<number>(1);

  const isPlayingRef = useRef<boolean>(false);
  const isTerminatedRef = useRef<boolean>(false);
  const lastFrameTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const isInitialSession = useRef<boolean>(true);

  const canvasDimensionsRef = useRef<{ width: number; height: number }>({ width: 360, height: 640 });
  const hitLineYRef = useRef<number>(530);

  // Audio mute synchronization
  useEffect(() => {
    PianoSynth.setMuted(isAudioMuted);
  }, [isAudioMuted]);

  const handleToggleAudio = () => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      PianoSynth.setMuted(next);
      const updated = {
        ...progressRef.current,
        settings: { isAudioMuted: next },
      };
      savePopPianoProgress(updated);
      setProgress(updated);
      return next;
    });
  };

  /**
   * Resize & Orientation Observer for Canvas
   */
  const updateCanvasDimensions = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    if (w <= 0 || h <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    canvasDimensionsRef.current = { width: w, height: h };
    hitLineYRef.current = Math.floor(h * 0.82);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rendererRef.current = new PianoCanvasRenderer(ctx);
      rendererRef.current.setDimensions(w, h);
    }
  }, []);

  useEffect(() => {
    updateCanvasDimensions();
    const handleResize = () => updateCanvasDimensions();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [updateCanvasDimensions, gameState]);

  /**
   * Spawns the next descending black tile
   */
  const spawnNextTile = useCallback(() => {
    const notes = currentLevelNotesRef.current;
    const index = nextNoteIndexRef.current;
    if (index >= notes.length) return;

    const note = notes[index];
    const { width, height } = canvasDimensionsRef.current;
    const laneWidth = width / 4;
    const levelCfg = getPopPianoLevel(currentLevelRef.current);

    // Height of black tile
    const tileHeight = Math.max(120, Math.floor(height * 0.22));

    // Dynamic spacing ratio to prevent collision
    const spacing = tileHeight * levelCfg.spacingRatio;

    // Calculate Y position above canvas
    let targetY = -tileHeight - 15;
    const activeTiles = tilesRef.current;
    if (activeTiles.length > 0) {
      const highestTile = activeTiles.reduce((highest, t) => (t.y < highest.y ? t : highest), activeTiles[0]);
      if (highestTile.y < 0) {
        targetY = highestTile.y - spacing;
      }
    }

    const newTile: PianoTileModel = {
      id: `tile_${currentLevelRef.current}_${index}_${Date.now()}`,
      noteIndex: index,
      lane: note.lane,
      y: targetY,
      height: tileHeight,
      width: laneWidth,
      pitch: note.pitch,
      frequency: note.frequency,
      isHit: false,
      isMissed: false,
      hitAnimTime: 0,
      spawnTimestamp: performance.now(),
    };

    tilesRef.current.push(newTile);
    nextNoteIndexRef.current += 1;
  }, []);

  /**
   * Starts level countdown & prepares notes (deducts 2 tournament coins on replay/retry/new session)
   */
  const startCountdownForLevel = useCallback((lvl: number) => {
    if (isInitialSession.current) {
      isInitialSession.current = false;
    } else if (onRequestSessionStart) {
      if (!onRequestSessionStart()) {
        return;
      }
    }

    const targetLvl = Math.max(1, Math.min(40, lvl));
    currentLevelRef.current = targetLvl;
    setCurrentLevelNum(targetLvl);

    // Reset runtime telemetry
    levelHitsRef.current = 0;
    perfectCountRef.current = 0;
    greatCountRef.current = 0;
    missCountRef.current = 0;
    wrongLaneCountRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    reactionTimesRef.current = [];
    tilesRef.current = [];
    particlesRef.current = [];
    nextNoteIndexRef.current = 0;
    attemptSeedRef.current += 1;

    setHudTilesHit(0);
    setHudScore(0);
    setHudCombo(0);
    setHudAccuracy(100);

    const levelCfg = getPopPianoLevel(targetLvl);
    currentLevelNotesRef.current = generatePatternForLevel(levelCfg, attemptSeedRef.current);

    setGameState('READY');
    setCountdown(3);

    // Pre-spawn initial tiles
    setTimeout(() => {
      for (let i = 0; i < 4; i++) {
        spawnNextTile();
      }
    }, 50);

    const t1 = setTimeout(() => setCountdown(2), 700);
    const t2 = setTimeout(() => setCountdown(1), 1400);
    const t3 = setTimeout(() => {
      setCountdown('GO');
      PianoSynth.init();
    }, 2100);
    const t4 = setTimeout(() => {
      isPlayingRef.current = true;
      isTerminatedRef.current = false;
      levelStartTimeRef.current = Date.now();
      lastFrameTimeRef.current = performance.now();
      setGameState('PLAYING');
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onRequestSessionStart, spawnNextTile]);

  /**
   * Handles Level Failure
   */
  const handleFailLevel = useCallback((reason: string) => {
    isPlayingRef.current = false;
    PianoSynth.playMissThud();
    setFailReason(reason);
    setGameState('GAME_OVER');
    const timeTaken = Math.max(1, Math.round((Date.now() - levelStartTimeRef.current) / 1000));
    onGameOver(hudScore, timeTaken);
  }, [hudScore, onGameOver]);

  /**
   * Handles Level Completion
   */
  const handleCompleteLevel = useCallback(() => {
    isPlayingRef.current = false;
    PianoSynth.playLevelCompleteChord();

    const timeTaken = Math.max(1, Math.round((Date.now() - levelStartTimeRef.current) / 1000));
    const levelCfg = getPopPianoLevel(currentLevelRef.current);

    // Compute reaction times
    const reactions = reactionTimesRef.current;
    const avgReact = reactions.length > 0
      ? reactions.reduce((acc, r) => acc + r, 0) / reactions.length
      : 230;
    const bestReact = reactions.length > 0
      ? Math.min(...reactions)
      : 190;

    // Calculate deterministic score breakdown
    const breakdown = calculateLevelScore({
      levelConfig: levelCfg,
      tilesHit: levelHitsRef.current,
      perfectHits: perfectCountRef.current,
      greatHits: greatCountRef.current,
      missCount: missCountRef.current,
      wrongLaneCount: wrongLaneCountRef.current,
      avgReactionMs: avgReact,
      bestReactionMs: bestReact,
      maxCombo: maxComboRef.current,
      isCompleted: true,
      timeTakenSeconds: timeTaken,
      currentProgress: progressRef.current,
    });

    // Record completed level, unlocking next level & updating cumulative total
    const { updatedProgress } = recordCompletedLevel(progressRef.current, breakdown, timeTaken);
    setProgress(updatedProgress);
    setCompletedBreakdown(breakdown);
    setGameState('LEVEL_COMPLETE');

    // Notify app shell if desired
    onGameOver(breakdown.finalScore, timeTaken);
  }, [onGameOver]);

  /**
   * RequestAnimationFrame Game Loop (60 FPS)
   */
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const levelCfg = getPopPianoLevel(currentLevelRef.current);
    const speed = levelCfg.speed;
    let isLoopRunning = true;
    lastFrameTimeRef.current = performance.now();

    const gameLoop = (currentTime: number) => {
      if (!isLoopRunning || !isPlayingRef.current || isTerminatedRef.current) return;

      const dt = Math.min(0.045, (currentTime - lastFrameTimeRef.current) / 1000);
      lastFrameTimeRef.current = currentTime;

      const hitLineY = hitLineYRef.current;
      const canvasHeight = canvasDimensionsRef.current.height;
      const tiles = tilesRef.current;
      let missedTileFound = false;

      // 1. Update Tile Positions
      for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];

        if (tile.isHit) {
          tile.hitAnimTime += dt * 1000;
          continue;
        }

        if (tile.isMissed) continue;

        // Move tile downward at level-defined speed
        tile.y += speed * dt;

        // Miss check: Tile has completely scrolled past hit zone without being pressed
        if (tile.y > hitLineY + 65 || tile.y > canvasHeight - 20) {
          tile.isMissed = true;
          tile.judgement = 'MISS';
          missedTileFound = true;

          laneFlashesRef.current[tile.lane] = 'miss';
          PianoSynth.playMissThud();

          missCountRef.current += 1;
          comboRef.current = 0;
          setHudCombo(0);

          setTimeout(() => {
            handleFailLevel('Missed Black Tile');
          }, 260);
          break;
        }
      }

      // 2. Ensure Continuous Stream: Spawn next tiles
      const unhitTiles = tiles.filter((t) => !t.isHit && !t.isMissed);
      if (unhitTiles.length < 6 && nextNoteIndexRef.current < currentLevelNotesRef.current.length) {
        spawnNextTile();
      }

      // 3. Update Floating Particles
      const now = Date.now();
      particlesRef.current = particlesRef.current.filter((p) => {
        const age = now - p.createdAt;
        if (age > 450) return false;
        p.y -= 35 * dt;
        p.alpha = Math.max(0, 1 - age / 450);
        return true;
      });

      // 4. Render Canvas Pass
      if (rendererRef.current) {
        rendererRef.current.render(
          tiles,
          particlesRef.current,
          pressedLanesRef.current,
          laneFlashesRef.current,
          hitLineY
        );
      }

      // Check if target notes completed
      if (levelHitsRef.current >= levelCfg.targetNotes && !missedTileFound) {
        setTimeout(() => {
          handleCompleteLevel();
        }, 280);
        return;
      }

      if (!missedTileFound) {
        rafIdRef.current = requestAnimationFrame(gameLoop);
      }
    };

    rafIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isLoopRunning = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [gameState, spawnNextTile, handleFailLevel, handleCompleteLevel]);

  /**
   * Unified Lane Tap Controller (Mouse, Touch, and Keyboard)
   */
  const handleLaneTap = useCallback((laneIndex: 0 | 1 | 2 | 3, tapY?: number) => {
    if (gameState !== 'PLAYING' || !isPlayingRef.current || isTerminatedRef.current) return;

    // Visual Pressed Lane indicator
    pressedLanesRef.current[laneIndex] = true;
    setTimeout(() => {
      pressedLanesRef.current[laneIndex] = false;
    }, 100);

    const hitLineY = hitLineYRef.current;
    const tiles = tilesRef.current;
    const levelCfg = getPopPianoLevel(currentLevelRef.current);

    // Find candidate unhit tiles in this lane
    const activeUnhitInLane = tiles.filter((t) => t.lane === laneIndex && !t.isHit && !t.isMissed);

    let targetTile: PianoTileModel | null = null;
    let minDistance = Infinity;

    for (let i = 0; i < activeUnhitInLane.length; i++) {
      const t = activeUnhitInLane[i];
      const tileTop = t.y;
      const tileBottom = t.y + t.height;
      const tileCenter = t.y + t.height / 2;

      // Generous Hit Detection Window:
      // 1. Direct Touch on Tile: User finger tapped within or near the tile bounds vertically
      const isDirectTouchOnTile = tapY !== undefined && tapY >= tileTop - 40 && tapY <= tileBottom + 40;

      // 2. Hit-Line Reach: Tile is descending near the hit line
      const isNearHitLine = tileBottom >= hitLineY - 260 && tileTop <= hitLineY + 65;

      if (isDirectTouchOnTile || isNearHitLine) {
        const dist = Math.abs(tileCenter - hitLineY);
        if (dist < minDistance) {
          minDistance = dist;
          targetTile = t;
        }
      }
    }

    if (targetTile) {
      // SUCCESSFUL TILE HIT!
      targetTile.isHit = true;
      targetTile.hitAnimTime = 0;

      // Calculate reaction time offset in ms
      const speed = levelCfg.speed;
      const reactionOffsetMs = Math.round((minDistance / speed) * 1000);
      const measuredReactionMs = Math.max(90, Math.min(480, 180 + reactionOffsetMs));
      reactionTimesRef.current.push(measuredReactionMs);

      // Accuracy Judgement: within 40px for PERFECT
      const isPerfect = minDistance < 40;
      const judgement: JudgementType = isPerfect ? 'PERFECT' : 'GREAT';
      targetTile.judgement = judgement;

      // Update counters
      levelHitsRef.current += 1;
      comboRef.current += 1;
      maxComboRef.current = Math.max(maxComboRef.current, comboRef.current);

      if (isPerfect) {
        perfectCountRef.current += 1;
        PianoSynth.playHitChime();
      } else {
        greatCountRef.current += 1;
      }

      // Live HUD Score: Base tile score (1 pt each) + combo bonus
      const liveScore = levelHitsRef.current * 1 + Math.min(25, Math.floor(comboRef.current / 4));
      const totalAttempts = levelHitsRef.current + missCountRef.current + wrongLaneCountRef.current;
      const liveAccuracy = totalAttempts > 0
        ? Math.round(((perfectCountRef.current + greatCountRef.current * 0.8) / totalAttempts) * 100)
        : 100;

      setHudTilesHit(levelHitsRef.current);
      setHudScore(liveScore);
      setHudCombo(comboRef.current);
      setHudAccuracy(liveAccuracy);

      // Play authentic acoustic piano note immediately
      PianoSynth.playPianoNote(targetTile.frequency, 1.2, isPerfect ? 1.0 : 0.85);

      // Flash lane & trigger particle
      laneFlashesRef.current[laneIndex] = 'hit';
      setTimeout(() => {
        laneFlashesRef.current[laneIndex] = null;
      }, 120);

      const laneWidth = canvasDimensionsRef.current.width / 4;
      particlesRef.current.push({
        id: `p_${Date.now()}_${Math.random()}`,
        lane: laneIndex,
        x: laneIndex * laneWidth + laneWidth / 2,
        y: hitLineY - 10,
        text: judgement,
        type: judgement,
        points: isPerfect ? 2 : 1,
        alpha: 1.0,
        scale: 1.05,
        createdAt: Date.now(),
      });

      // Check if target notes completed
      if (levelHitsRef.current >= levelCfg.targetNotes) {
        setTimeout(() => {
          handleCompleteLevel();
        }, 280);
      }
    } else {
      // User tapped an empty lane when no tile was near the hit line
      wrongLaneCountRef.current += 1;
      comboRef.current = 0;
      setHudCombo(0);
      laneFlashesRef.current[laneIndex] = 'miss';
      PianoSynth.playMissThud();
      setTimeout(() => {
        laneFlashesRef.current[laneIndex] = null;
      }, 120);
    }
  }, [gameState, handleCompleteLevel]);

  /**
   * Pointer down on canvas
   */
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const laneWidth = canvasDimensionsRef.current.width / 4;
    const laneIndex = Math.floor(clientX / laneWidth) as 0 | 1 | 2 | 3;
    if (laneIndex >= 0 && laneIndex <= 3) {
      handleLaneTap(laneIndex, clientY);
    }
  };

  /**
   * Keyboard controls listener: D-F-J-K or 1-2-3-4
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;

      let lane: 0 | 1 | 2 | 3 | null = null;
      if (e.code === 'KeyD' || e.code === 'Digit1') lane = 0;
      else if (e.code === 'KeyF' || e.code === 'Digit2') lane = 1;
      else if (e.code === 'KeyJ' || e.code === 'Digit3') lane = 2;
      else if (e.code === 'KeyK' || e.code === 'Digit4') lane = 3;

      if (lane !== null) {
        e.preventDefault();
        handleLaneTap(lane);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleLaneTap]);

  /**
   * Pause & Resume Controls
   */
  const handlePause = () => {
    if (gameState === 'PLAYING') {
      isPlayingRef.current = false;
      PianoSynth.stopAll();
      setGameState('PAUSED');
    }
  };

  const handleResume = () => {
    if (gameState === 'PAUSED') {
      isPlayingRef.current = true;
      lastFrameTimeRef.current = performance.now();
      setGameState('PLAYING');
    }
  };

  /**
   * Back button during gameplay returns to Level Selection
   */
  const handleBackFromGame = () => {
    isPlayingRef.current = false;
    PianoSynth.stopAll();
    setGameState('LEVEL_SELECT');
  };

  // --------------------------------------------------------------------------
  // SUB-SCREEN RENDERING BASED ON GAME STATE
  // --------------------------------------------------------------------------

  // 1. MAIN MENU
  if (gameState === 'MAIN_MENU') {
    return (
      <PopPianoMenu
        progress={progress}
        profile={profile}
        currentLevelNumber={currentLevelNum}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        onPlay={() => {
          const target = Math.min(40, progress.highestUnlockedLevel || 1);
          startCountdownForLevel(target);
        }}
        onOpenLevels={() => setGameState('LEVEL_SELECT')}
        onOpenLeaderboard={() => setGameState('LEADERBOARD')}
        onOpenHowToPlay={() => setGameState('HOW_TO_PLAY')}
        onOpenAchievements={() => setGameState('ACHIEVEMENTS')}
        onOpenStatistics={() => setGameState('STATISTICS')}
        onOpenSettings={() => setGameState('SETTINGS')}
        onOpenAbout={() => setGameState('ABOUT')}
        onExit={onExit}
      />
    );
  }

  // 2. LEVEL SELECTION
  if (gameState === 'LEVEL_SELECT') {
    return (
      <PopPianoLevelSelect
        progress={progress}
        onSelectLevel={(lvl) => startCountdownForLevel(lvl)}
        onBack={() => setGameState('MAIN_MENU')}
      />
    );
  }

  // 3. LEADERBOARD
  if (gameState === 'LEADERBOARD') {
    return (
      <PopPianoLeaderboard
        progress={progress}
        profile={profile}
        onBack={() => setGameState('MAIN_MENU')}
      />
    );
  }

  // 4. HOW TO PLAY
  if (gameState === 'HOW_TO_PLAY') {
    return (
      <PopPianoHowToPlay onBack={() => setGameState('MAIN_MENU')} />
    );
  }

  // 5. ACHIEVEMENTS
  if (gameState === 'ACHIEVEMENTS') {
    return (
      <PopPianoAchievements
        progress={progress}
        onBack={() => setGameState('MAIN_MENU')}
      />
    );
  }

  // 6. STATISTICS
  if (gameState === 'STATISTICS') {
    return (
      <PopPianoStatistics
        progress={progress}
        onBack={() => setGameState('MAIN_MENU')}
      />
    );
  }

  // 7. SETTINGS
  if (gameState === 'SETTINGS') {
    return (
      <PopPianoSettings
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        onResetProgress={() => {
          const fresh = resetPopPianoProgress();
          setProgress(fresh);
          setCurrentLevelNum(1);
        }}
        onBack={() => setGameState('MAIN_MENU')}
      />
    );
  }

  // 8. ABOUT
  if (gameState === 'ABOUT') {
    return (
      <PopPianoAbout onBack={() => setGameState('MAIN_MENU')} />
    );
  }

  const currentLevelCfg = getPopPianoLevel(currentLevelNum);
  const bestLevelScore = progress.completedLevels[currentLevelNum]?.highScore || 0;

  return (
    <div
      ref={containerRef}
      id="pop-piano-gameplay-arena"
      className="relative w-full h-full min-h-[620px] flex flex-col justify-between select-none font-['Plus_Jakarta_Sans',sans-serif] bg-[#0A1128] overflow-hidden"
    >
      {/* TOP TOURNAMENT HUD */}
      <header className="relative z-20 flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 bg-[#0B132B]/90 backdrop-blur-md border-b border-white/10 text-white">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBackFromGame}
          aria-label="Back to Levels"
          className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white flex items-center justify-center cursor-pointer transition-all border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Center Level Title & Live Base Score */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-cyan-300 uppercase tracking-widest">
            <span>Level {currentLevelNum}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-semibold">{currentLevelCfg.name}</span>
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-white tracking-tight">
            {hudScore} <span className="text-[10px] text-slate-400 font-sans font-bold">PTS</span>
          </div>
        </div>

        {/* Pause & Audio Mute Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePause}
            aria-label="Pause Game"
            className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white flex items-center justify-center cursor-pointer transition-all border border-white/10"
          >
            <Pause className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToggleAudio}
            aria-label="Toggle Sound"
            className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white flex items-center justify-center cursor-pointer transition-all border border-white/10"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* SUB-HUD: BLACK TILES TARGET, COMBO, ACCURACY, BEST */}
      <div className="relative z-20 px-3 py-1.5 bg-[#0B132B]/80 backdrop-blur-sm border-b border-white/5 flex items-center justify-around text-center text-white text-xs font-mono">
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 font-sans block">Black Tiles</span>
          <span className="font-extrabold text-cyan-300">
            {hudTilesHit} / {currentLevelCfg.targetNotes}
          </span>
        </div>

        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 font-sans block">Combo</span>
          <span className="font-extrabold text-amber-300">
            {hudCombo}x
          </span>
        </div>

        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 font-sans block">Accuracy</span>
          <span className="font-extrabold text-emerald-300">
            {hudAccuracy}%
          </span>
        </div>

        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 font-sans block">Best</span>
          <span className="font-extrabold text-purple-300">
            {bestLevelScore > 0 ? `${bestLevelScore}` : '--'}
          </span>
        </div>
      </div>

      {/* CANVAS ARENA */}
      <div className="relative flex-1 w-full h-full overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none select-none"
        />

        {/* READY / 3-2-1 COUNTDOWN OVERLAY */}
        {gameState === 'READY' && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none animate-in fade-in">
            <div className="text-xs text-cyan-300 font-bold uppercase tracking-widest mb-2">
              Level {currentLevelNum} • {currentLevelCfg.name}
            </div>
            <div className="text-6xl sm:text-7xl font-black font-mono text-white animate-bounce drop-shadow-2xl">
              {countdown}
            </div>
            <div className="text-xs text-slate-300 font-semibold mt-3">
              Press {currentLevelCfg.targetNotes} Black Tiles
            </div>
          </div>
        )}

        {/* PAUSE MODAL */}
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in">
            <div className="w-full max-w-xs bg-slate-900 border border-white/15 rounded-3xl p-5 text-center text-white shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3 text-cyan-400">
                <Pause className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-black uppercase tracking-wider mb-1">Paused</h3>
              <p className="text-xs text-slate-400 mb-4">
                Level {currentLevelNum}: {hudTilesHit} / {currentLevelCfg.targetNotes} Black Tiles
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleResume}
                  className="min-h-[46px] w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume</span>
                </button>

                <button
                  type="button"
                  onClick={() => startCountdownForLevel(currentLevelNum)}
                  className="min-h-[46px] w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider border border-white/15 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Level</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGameState('LEVEL_SELECT')}
                  className="min-h-[46px] w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider border border-white/15 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span>40 Levels</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGameState('MAIN_MENU')}
                  className="min-h-[46px] w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GAME OVER (FAIL) MODAL */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in">
            <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-rose-500/40 rounded-3xl p-6 text-center text-white shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-3 text-rose-400">
                <Target className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-rose-400 uppercase tracking-wide mb-1">
                Level Incomplete
              </h3>
              <p className="text-xs text-slate-300 font-semibold mb-3">
                {failReason}
              </p>

              {/* STATS RUN SUMMARY */}
              <div className="bg-black/40 rounded-2xl p-3 border border-white/10 grid grid-cols-3 gap-2 text-center font-mono my-3">
                <div>
                  <div className="text-[9px] uppercase font-sans text-slate-400">Black Tiles</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {hudTilesHit} / {currentLevelCfg.targetNotes}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-sans text-slate-400">Max Combo</div>
                  <div className="text-sm font-bold text-amber-300 mt-0.5">
                    {maxComboRef.current}x
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-sans text-slate-400">Accuracy</div>
                  <div className="text-sm font-bold text-emerald-300 mt-0.5">
                    {hudAccuracy}%
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mb-4">
                Level {currentLevelNum + 1} remains locked until Level {currentLevelNum} is successfully completed.
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => startCountdownForLevel(currentLevelNum)}
                  id="pop-piano-btn-retry"
                  className="min-h-[48px] w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Level {currentLevelNum}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGameState('LEVEL_SELECT')}
                    className="min-h-[44px] py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider border border-white/15 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                    <span>Levels</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGameState('MAIN_MENU')}
                    className="min-h-[44px] py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider border border-white/15 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Menu className="w-3.5 h-3.5" />
                    <span>Menu</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LEVEL COMPLETE VICTORY MODAL */}
        {gameState === 'LEVEL_COMPLETE' && completedBreakdown && (
          <PopPianoResultModal
            breakdown={completedBreakdown}
            starsEarned={progress.completedLevels[currentLevelNum]?.stars || 1}
            hasNextLevel={currentLevelNum < 40}
            onNextLevel={() => startCountdownForLevel(currentLevelNum + 1)}
            onReplay={() => startCountdownForLevel(currentLevelNum)}
            onOpenLevels={() => setGameState('LEVEL_SELECT')}
            onReturnToMenu={() => setGameState('MAIN_MENU')}
          />
        )}
      </div>
    </div>
  );
};
