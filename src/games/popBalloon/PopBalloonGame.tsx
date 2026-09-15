/**
 * Pop Balloon - Fast Reflex Skill-Based Arcade Game & 40-Level Championship Tournament
 * 
 * Strict Directives:
 * - Pre-Game Tournament Menu first with High Contrast Dark Theme
 * - Preserved 100% authentic core Pop Balloon gameplay:
 *   - Pure White Play Arena Background (#FFFFFF)
 *   - 7 distinct vibrant colors from second 1
 *   - Circular balloons with glossy highlights & burst particles
 *   - TAP BALLOON -> POP + SCORE + COMBO + PROGRESS
 *   - TAP EMPTY SPACE / WHITE BACKGROUND -> IMMEDIATE GAME OVER
 *   - MISSED BALLOON REACHES BOTTOM -> IMMEDIATE GAME OVER
 * - 40 Progressive Tournament Levels (Level 1 requires 100 minimum pops)
 * - Multi-factor competitive scoring: Base (+1/balloon) + Combo + Performance + Stage Multiplier
 * - No 400-point cap; cumulative tournament score across best level runs
 * - MSISDN masking (keep first 5, last 2, mask middle 5: e.g. 25191*****30)
 * - Tournament Leaderboard, Level Progression Map, Stats, Achievements, Tournament Status
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition, UserProfile } from '../../types';
import { 
  RotateCcw, 
  Home, 
  Play, 
  Zap, 
  Volume2, 
  VolumeX, 
  Pause, 
  Trophy, 
  ArrowLeft,
  Target,
  ArrowRight,
  Sparkles 
} from 'lucide-react';
import { PopBalloonAudio } from './popBalloonAudio';
import { getPopBalloonLevel, PopBalloonLevelConfig } from './levelBank';
import { PopBalloonProgress, PopBalloonScreenState, LevelScoreBreakdown } from './types';
import { 
  loadPopBalloonProgress, 
  savePopBalloonProgress, 
  calculateGlobalRank, 
  formatMsisdnMasked 
} from './storage';
import { PopBalloonMenu } from './components/PopBalloonMenu';
import { PopBalloonLevelSelect } from './components/PopBalloonLevelSelect';
import { PopBalloonLeaderboard } from './components/PopBalloonLeaderboard';
import { PopBalloonStats } from './components/PopBalloonStats';
import { PopBalloonTournament } from './components/PopBalloonTournament';
import { PopBalloonAchievements } from './components/PopBalloonAchievements';
import { PopBalloonHowToPlay } from './components/PopBalloonHowToPlay';
import { PopBalloonSettings } from './components/PopBalloonSettings';
import { PopBalloonLevelCompleteModal } from './components/PopBalloonLevelCompleteModal';

interface PopBalloonGameProps {
  game: GameDefinition;
  profile?: UserProfile;
  onGameOver: (score: number, durationSeconds: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

interface Balloon {
  id: number;
  x: number;            // center X
  y: number;            // center Y
  radius: number;       // radius px
  speed: number;        // px/s
  color: string;        // hex color
  spawnTime: number;    // performance.now() timestamp
  isPopping: boolean;
  popProgress: number;  // 0 to 1
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface ScorePopup {
  id: number;
  x: number;
  y: number;
  points: number;
  life: number;
  maxLife: number;
}

// 7 exact mandatory vibrant colors
const BALLOON_COLORS = [
  '#FF3B30', // RED
  '#007AFF', // BLUE
  '#34C759', // GREEN
  '#FFD60A', // YELLOW
  '#AF52DE', // PURPLE
  '#FF9500', // ORANGE
  '#FF2D55', // PINK
];

export const PopBalloonGame: React.FC<PopBalloonGameProps> = ({
  profile,
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Tournament Progression State
  const [progress, setProgress] = useState<PopBalloonProgress>(() => loadPopBalloonProgress());
  const [screenState, setScreenState] = useState<PopBalloonScreenState>('MENU');
  const [lastLevelResult, setLastLevelResult] = useState<LevelScoreBreakdown | null>(null);

  // 2. Audio State
  const [isSoundOn, setIsSoundOn] = useState<boolean>(() => isAudioEnabled && progress.soundEnabled);

  // 3. Active Match States
  const [currentLevel, setCurrentLevel] = useState<number>(() => progress.unlockedLevel || 1);
  const [countdownNum, setCountdownNum] = useState<string>('3');
  const [gameOverReason, setGameOverReason] = useState<string>('');

  // Live HUD States
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [levelPops, setLevelPops] = useState<number>(0);
  const [levelTargetColorPops, setLevelTargetColorPops] = useState<number>(0);
  const [levelTargetColor2Pops, setLevelTargetColor2Pops] = useState<number>(0);
  const [levelMaxCombo, setLevelMaxCombo] = useState<number>(0);

  // Visual Entities
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);

  // Simulation Refs for 60fps loop
  const balloonsRef = useRef<Balloon[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const scorePopupsRef = useRef<ScorePopup[]>([]);
  const scoreRef = useRef<number>(0);
  const comboRef = useRef<number>(0);
  const screenStateRef = useRef<PopBalloonScreenState>('MENU');
  const gameStartTimeRef = useRef<number>(0);
  const totalGameStartTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);
  const nextBalloonId = useRef<number>(1);
  const nextParticleId = useRef<number>(1);
  const nextPopupId = useRef<number>(1);
  const lastSpawnTime = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);

  // Level Tracking Refs
  const currentLevelRef = useRef<number>(1);
  const levelPopsRef = useRef<number>(0);
  const levelTargetColorPopsRef = useRef<number>(0);
  const levelTargetColor2PopsRef = useRef<number>(0);
  const levelMaxComboRef = useRef<number>(0);
  const spawnedInLevelRef = useRef<number>(0);
  const basePopsScoreRef = useRef<number>(0);
  const reactionBonusRef = useRef<number>(0);
  const precisionBonusRef = useRef<number>(0);
  const comboBonusRef = useRef<number>(0);
  const reactionTimesListRef = useRef<number[]>([]);

  // Audio sync
  useEffect(() => {
    PopBalloonAudio.setMuted(!isSoundOn);
  }, [isSoundOn]);

  const toggleSound = () => {
    setIsSoundOn((prev) => {
      const next = !prev;
      PopBalloonAudio.setMuted(!next);
      const updated = { ...progress, soundEnabled: next };
      setProgress(updated);
      savePopBalloonProgress(updated);
      return next;
    });
  };

  // Sync refs with state
  screenStateRef.current = screenState;
  scoreRef.current = score;
  comboRef.current = combo;
  currentLevelRef.current = currentLevel;
  levelPopsRef.current = levelPops;
  levelTargetColorPopsRef.current = levelTargetColorPops;
  levelTargetColor2PopsRef.current = levelTargetColor2Pops;
  levelMaxComboRef.current = levelMaxCombo;

  const currentLevelConfig = getPopBalloonLevel(currentLevel);

  /**
   * Spawn a new falling colored balloon configured for the current level
   */
  const spawnSingleBalloon = useCallback((customY?: number, overrideX?: number, overrideSpeed?: number) => {
    if (!containerRef.current || screenStateRef.current !== 'PLAYING') return;
    const width = containerRef.current.clientWidth || 360;

    const levelCfg = getPopBalloonLevel(currentLevelRef.current);

    const radius = levelCfg.minRadius + Math.random() * (levelCfg.maxRadius - levelCfg.minRadius);
    let speed = overrideSpeed ?? (levelCfg.minSpeed + Math.random() * (levelCfg.maxSpeed - levelCfg.minSpeed));

    // High-speed contrast bullet wave pattern
    if (!overrideSpeed && levelCfg.wavePattern === 'speed_contrast' && Math.random() < 0.35) {
      speed = levelCfg.maxSpeed;
    }

    // Pick horizontal X coordinate avoiding extreme edge overlap
    const minX = radius + 14;
    const maxX = Math.max(minX + 30, width - radius - 14);

    let bestX = overrideX ?? (minX + Math.random() * (maxX - minX));
    if (overrideX === undefined) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const candidateX = minX + Math.random() * (maxX - minX);
        const isClustered = balloonsRef.current.some(
          (b) => !b.isPopping && b.y < 120 && Math.abs(b.x - candidateX) < radius * 1.7
        );
        if (!isClustered) {
          bestX = candidateX;
          break;
        }
      }
    }

    // Smart color selection guaranteeing solvability for color quota objectives
    let chosenColor = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    if (levelCfg.objectiveType === 'target_color' && levelCfg.targetColor) {
      if (levelTargetColorPopsRef.current < (levelCfg.targetColorCount || 10) && Math.random() < 0.45) {
        chosenColor = levelCfg.targetColor;
      }
    } else if (levelCfg.objectiveType === 'dual_color') {
      const roll = Math.random();
      if (levelCfg.targetColor && levelTargetColorPopsRef.current < (levelCfg.targetColorCount || 8) && roll < 0.4) {
        chosenColor = levelCfg.targetColor;
      } else if (levelCfg.targetColor2 && levelTargetColor2PopsRef.current < (levelCfg.targetColor2Count || 8) && roll < 0.8) {
        chosenColor = levelCfg.targetColor2;
      }
    }

    const startY = customY !== undefined ? customY : -radius - 14;

    const newBalloon: Balloon = {
      id: nextBalloonId.current++,
      x: bestX,
      y: startY,
      radius,
      speed,
      color: chosenColor,
      spawnTime: performance.now(),
      isPopping: false,
      popProgress: 0,
    };

    balloonsRef.current.push(newBalloon);
    spawnedInLevelRef.current += 1;
  }, []);

  /**
   * Spawn burst particles upon popping
   */
  const spawnPopParticles = (x: number, y: number, color: string) => {
    const count = 9;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 95 + Math.random() * 95;
      particlesRef.current.push({
        id: nextParticleId.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 4 + Math.random() * 4,
        opacity: 1,
        life: 0,
        maxLife: 0.22,
      });
    }
  };

  /**
   * Spawn floating score indicator
   */
  const spawnScorePopup = (x: number, y: number, points: number) => {
    scorePopupsRef.current.push({
      id: nextPopupId.current++,
      x,
      y,
      points,
      life: 0,
      maxLife: 0.5,
    });
  };

  /**
   * Trigger Immediate Game Over
   */
  const triggerGameOver = useCallback((reason: string) => {
    if (screenStateRef.current === 'GAME_OVER') return;
    screenStateRef.current = 'GAME_OVER';
    setScreenState('GAME_OVER');
    setGameOverReason(reason);

    PopBalloonAudio.playGameOver();

    // Update match count in progress
    const updated: PopBalloonProgress = {
      ...progress,
      totalMatchesPlayed: progress.totalMatchesPlayed + 1,
      totalBalloonsPoppedAllTime: progress.totalBalloonsPoppedAllTime + levelPopsRef.current,
      bestComboAllTime: Math.max(progress.bestComboAllTime, levelMaxComboRef.current),
    };
    setProgress(updated);
    savePopBalloonProgress(updated);
  }, [progress]);

  /**
   * Check whether the level objective is fully satisfied
   */
  const checkIsLevelCleared = (
    levelCfg: PopBalloonLevelConfig,
    totalPops: number,
    c1Pops: number,
    c2Pops: number,
    maxCombo: number
  ): boolean => {
    // Check combo requirement if level specifies one
    if (levelCfg.requiredCombo && maxCombo < levelCfg.requiredCombo) {
      return false;
    }

    switch (levelCfg.objectiveType) {
      case 'target_color':
        return c1Pops >= (levelCfg.targetColorCount || 10);

      case 'dual_color':
        return (
          c1Pops >= (levelCfg.targetColorCount || 8) &&
          c2Pops >= (levelCfg.targetColor2Count || 8)
        );

      case 'combo_target':
        return (
          totalPops >= levelCfg.targetPops &&
          maxCombo >= (levelCfg.requiredCombo || 8)
        );

      case 'pop_all':
      case 'precision':
      case 'speed_rush':
      default:
        return totalPops >= levelCfg.targetPops;
    }
  };

  /**
   * Start 3-2-1-GO Countdown Sequence for a given Level
   */
  const startCountdownForLevel = (targetLvl: number) => {
    PopBalloonAudio.init();
    setScreenState('COUNTDOWN');
    screenStateRef.current = 'COUNTDOWN';
    setCountdownNum('3');
    PopBalloonAudio.playCountdownBeep(false);

    setTimeout(() => {
      setCountdownNum('2');
      PopBalloonAudio.playCountdownBeep(false);

      setTimeout(() => {
        setCountdownNum('1');
        PopBalloonAudio.playCountdownBeep(false);

        setTimeout(() => {
          setCountdownNum('GO!');
          PopBalloonAudio.playCountdownBeep(true);

          setTimeout(() => {
            // Start Active Gameplay
            setScreenState('PLAYING');
            screenStateRef.current = 'PLAYING';
            gameStartTimeRef.current = performance.now();
            lastFrameTime.current = performance.now();
            lastSpawnTime.current = performance.now();

            balloonsRef.current = [];
            particlesRef.current = [];
            scorePopupsRef.current = [];
            setBalloons([]);
            setParticles([]);
            setScorePopups([]);

            const levelCfg = getPopBalloonLevel(targetLvl);
            if (levelCfg.initialBalloonsCount <= 2) {
              spawnSingleBalloon(45);
              spawnSingleBalloon(-20);
            } else if (levelCfg.initialBalloonsCount === 3) {
              spawnSingleBalloon(35);
              spawnSingleBalloon(110);
              spawnSingleBalloon(-20);
            } else if (levelCfg.initialBalloonsCount === 4) {
              spawnSingleBalloon(35);
              spawnSingleBalloon(110);
              spawnSingleBalloon(185);
              spawnSingleBalloon(-20);
            } else if (levelCfg.initialBalloonsCount === 5) {
              spawnSingleBalloon(30);
              spawnSingleBalloon(95);
              spawnSingleBalloon(160);
              spawnSingleBalloon(225);
              spawnSingleBalloon(-20);
            } else {
              spawnSingleBalloon(25);
              spawnSingleBalloon(80);
              spawnSingleBalloon(135);
              spawnSingleBalloon(190);
              spawnSingleBalloon(245);
              spawnSingleBalloon(-20);
            }
          }, 350);
        }, 800);
      }, 800);
    }, 800);
  };

  /**
   * Launch a specific stage
   */
  const handleLaunchLevel = (levelNum: number) => {
    currentLevelRef.current = levelNum;
    setCurrentLevel(levelNum);
    levelPopsRef.current = 0;
    setLevelPops(0);
    levelTargetColorPopsRef.current = 0;
    setLevelTargetColorPops(0);
    levelTargetColor2PopsRef.current = 0;
    setLevelTargetColor2Pops(0);
    levelMaxComboRef.current = 0;
    setLevelMaxCombo(0);
    spawnedInLevelRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    comboRef.current = 0;
    setCombo(0);
    basePopsScoreRef.current = 0;
    reactionBonusRef.current = 0;
    precisionBonusRef.current = 0;
    comboBonusRef.current = 0;
    reactionTimesListRef.current = [];
    totalGameStartTimeRef.current = performance.now();
    startCountdownForLevel(levelNum);
  };

  /**
   * Retry Current Level upon failure
   */
  const handleRetryLevel = () => {
    handleLaunchLevel(currentLevelRef.current);
  };

  /**
   * Advance to Next Level
   */
  const handleNextLevel = () => {
    const nextLvl = Math.min(40, currentLevelRef.current + 1);
    handleLaunchLevel(nextLvl);
  };

  /**
   * Return to Main Menu
   */
  const handleReturnToMenu = () => {
    const durationSeconds = Math.max(
      1,
      Math.round((performance.now() - (totalGameStartTimeRef.current || performance.now())) / 1000)
    );
    onGameOver(progress.totalTournamentScore, durationSeconds);
    setScreenState('MENU');
    screenStateRef.current = 'MENU';
    balloonsRef.current = [];
    setBalloons([]);
  };

  /**
   * Full Exit to Game Center Hub
   */
  const handleFullExit = () => {
    const durationSeconds = Math.max(
      1,
      Math.round((performance.now() - (totalGameStartTimeRef.current || performance.now())) / 1000)
    );
    onGameOver(progress.totalTournamentScore, durationSeconds);
    onExit();
  };

  /**
   * Pause
   */
  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (screenStateRef.current !== 'PLAYING') return;
    pauseStartTimeRef.current = performance.now();
    screenStateRef.current = 'PAUSED';
    setScreenState('PAUSED');
  };

  /**
   * Resume
   */
  const handleResume = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (screenStateRef.current !== 'PAUSED') return;

    const pauseDuration = performance.now() - pauseStartTimeRef.current;
    gameStartTimeRef.current += pauseDuration;
    lastSpawnTime.current += pauseDuration;
    lastFrameTime.current = performance.now();

    for (const b of balloonsRef.current) {
      b.spawnTime += pauseDuration;
    }

    screenStateRef.current = 'PLAYING';
    setScreenState('PLAYING');
  };

  /**
   * 60FPS Game Loop
   */
  useEffect(() => {
    if (screenState !== 'PLAYING') return;

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastFrameTime.current) / 1000, 0.1);
      lastFrameTime.current = currentTime;

      if (screenStateRef.current === 'PLAYING' && containerRef.current) {
        const height = containerRef.current.clientHeight || 600;
        const width = containerRef.current.clientWidth || 360;
        const levelCfg = getPopBalloonLevel(currentLevelRef.current);

        // 1. Dynamic Spawning
        const activeUnpoppedCount = balloonsRef.current.filter((b) => !b.isPopping).length;
        if (
          activeUnpoppedCount < levelCfg.targetActive &&
          currentTime - lastSpawnTime.current > levelCfg.spawnIntervalMs
        ) {
          if (levelCfg.wavePattern === 'tandem' && activeUnpoppedCount <= levelCfg.targetActive - 2 && Math.random() < 0.4) {
            const leftX = width * 0.25;
            const rightX = width * 0.75;
            spawnSingleBalloon(-levelCfg.minRadius - 10, leftX);
            spawnSingleBalloon(-levelCfg.minRadius - 10, rightX);
          } else {
            spawnSingleBalloon();
          }
          lastSpawnTime.current = currentTime;
        }

        // 2. Update Balloons Position & Check Misses
        const nextBalloons: Balloon[] = [];
        let missedBalloon = false;

        for (const b of balloonsRef.current) {
          if (b.isPopping) {
            b.popProgress += dt / 0.14; // 140ms pop animation
            if (b.popProgress < 1.0) {
              nextBalloons.push(b);
            }
          } else {
            b.y += b.speed * dt;

            // MISSED BALLOON REACHES BOTTOM -> IMMEDIATE GAME OVER
            if (b.y + b.radius >= height) {
              missedBalloon = true;
            } else {
              nextBalloons.push(b);
            }
          }
        }

        balloonsRef.current = nextBalloons;
        setBalloons([...nextBalloons]);

        if (missedBalloon) {
          PopBalloonAudio.playMiss();
          triggerGameOver('A balloon reached the bottom!');
          return;
        }

        // 3. Update Particles
        const nextParticles: Particle[] = [];
        for (const p of particlesRef.current) {
          p.life += dt;
          if (p.life < p.maxLife) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.opacity = 1 - p.life / p.maxLife;
            nextParticles.push(p);
          }
        }
        particlesRef.current = nextParticles;
        setParticles(nextParticles);

        // 4. Update Score Popups
        const nextPopups: ScorePopup[] = [];
        for (const pop of scorePopupsRef.current) {
          pop.life += dt;
          if (pop.life < pop.maxLife) {
            pop.y -= 45 * dt;
            nextPopups.push(pop);
          }
        }
        scorePopupsRef.current = nextPopups;
        setScorePopups(nextPopups);
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [screenState, spawnSingleBalloon, triggerGameOver]);

  /**
   * Pointer/Touch Input Handling
   * - Hits active colored balloon -> POP + MULTI-FACTOR SCORE + PROGRESS
   * - Hits empty space / background -> IMMEDIATE GAME OVER
   */
  const handlePlayAreaPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (screenStateRef.current !== 'PLAYING' || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const touchX = e.clientX - rect.left;
    const touchY = e.clientY - rect.top;

    const levelCfg = getPopBalloonLevel(currentLevelRef.current);
    const tolerance = levelCfg.touchTolerance ?? 1.0;

    let hitIndex = -1;
    let hitDist = 0;

    const sortedIndices = balloonsRef.current
      .map((b, idx) => ({ b, idx }))
      .filter((item) => !item.b.isPopping)
      .sort((a, b) => b.b.y - a.b.y);

    for (const item of sortedIndices) {
      const b = item.b;
      const dist = Math.hypot(touchX - b.x, touchY - b.y);
      if (dist <= b.radius + tolerance) {
        hitIndex = item.idx;
        hitDist = dist;
        break;
      }
    }

    if (hitIndex !== -1) {
      // SUCCESSFUL HIT ON A COLORED BALLOON
      const popped = balloonsRef.current[hitIndex];
      popped.isPopping = true;
      popped.popProgress = 0;

      // 1. Deterministic Multi-Factor Scoring
      // Base: Exactly +1 per popped balloon
      const basePoints = 1.0;
      basePopsScoreRef.current += 1;

      // Reaction time bonus (faster tap gives up to +0.8)
      const timeOnScreen = (performance.now() - popped.spawnTime) / 1000;
      const reactionBonus = Math.max(0, 0.8 * (1 - Math.min(1, timeOnScreen / 1.2)));
      reactionTimesListRef.current.push(Math.round(timeOnScreen * 1000));
      reactionBonusRef.current += reactionBonus;

      // Precision bonus (tapping near center gives up to +0.6)
      const precisionRatio = Math.max(0, 1 - hitDist / popped.radius);
      const precisionBonus = precisionRatio * 0.6;
      precisionBonusRef.current += precisionBonus;

      // Combo streak multiplier
      const nextCombo = comboRef.current + 1;
      comboRef.current = nextCombo;
      setCombo(nextCombo);

      const nextMaxCombo = Math.max(levelMaxComboRef.current, nextCombo);
      levelMaxComboRef.current = nextMaxCombo;
      setLevelMaxCombo(nextMaxCombo);

      const comboMultiplier = nextCombo >= 20 ? 1.35 : nextCombo >= 10 ? 1.25 : nextCombo >= 5 ? 1.12 : 1.0;

      // Level stage multiplier
      const stageMultiplier = levelCfg.tierMultiplier || 1.0;

      // Total earned points for this pop
      const pointsEarned = (basePoints + reactionBonus + precisionBonus) * comboMultiplier * stageMultiplier;
      comboBonusRef.current += Math.max(0, pointsEarned - (basePoints + reactionBonus + precisionBonus) * stageMultiplier);

      const newScore = scoreRef.current + pointsEarned;
      scoreRef.current = newScore;
      setScore(newScore);

      // Visual & Audio Feedback
      PopBalloonAudio.playPop(nextCombo);
      spawnPopParticles(popped.x, popped.y, popped.color);
      spawnScorePopup(popped.x, popped.y, Math.round(pointsEarned * 10) / 10);

      // 2. Track Level Progress & Color Quotas
      const nextPops = levelPopsRef.current + 1;
      levelPopsRef.current = nextPops;
      setLevelPops(nextPops);

      let nextC1Pops = levelTargetColorPopsRef.current;
      if (levelCfg.targetColor && popped.color === levelCfg.targetColor) {
        nextC1Pops += 1;
        levelTargetColorPopsRef.current = nextC1Pops;
        setLevelTargetColorPops(nextC1Pops);
      }

      let nextC2Pops = levelTargetColor2PopsRef.current;
      if (levelCfg.targetColor2 && popped.color === levelCfg.targetColor2) {
        nextC2Pops += 1;
        levelTargetColor2PopsRef.current = nextC2Pops;
        setLevelTargetColor2Pops(nextC2Pops);
      }

      // 3. Check Level Completion
      const isCleared = checkIsLevelCleared(levelCfg, nextPops, nextC1Pops, nextC2Pops, nextMaxCombo);
      if (isCleared) {
        // LEVEL COMPLETE!
        PopBalloonAudio.playLevelComplete();

        // Clear remaining balloons
        for (const b of balloonsRef.current) {
          if (!b.isPopping) {
            spawnPopParticles(b.x, b.y, b.color);
          }
        }
        balloonsRef.current = [];
        setBalloons([]);

        // Calculate score breakdown
        const finalLevelScore = Math.round(newScore);
        const previousBest = progress.levelBestScores[currentLevelRef.current] || 0;
        const isNewBest = finalLevelScore > previousBest;

        const baseScore = nextPops;
        const calculatedComboBonus = Math.round(comboBonusRef.current);
        const calculatedPerfBonus = Math.round((reactionBonusRef.current + precisionBonusRef.current) * stageMultiplier);
        const calculatedDiffBonus = Math.max(0, finalLevelScore - baseScore - calculatedComboBonus - calculatedPerfBonus);

        // Update level best scores with anti-farming rule
        const updatedLevelBests = {
          ...progress.levelBestScores,
          [currentLevelRef.current]: Math.max(previousBest, finalLevelScore),
        };

        // Recalculate cumulative tournament score
        const newTotalTournamentScore = (Object.values(updatedLevelBests) as number[]).reduce((sum: number, val: number) => sum + val, 0);

        // Unlock next stage up to 40
        const nextUnlockedLevel = Math.min(40, Math.max(progress.unlockedLevel, currentLevelRef.current + 1));

        // Average reaction time
        const avgReactionMs =
          reactionTimesListRef.current.length > 0
            ? Math.round(
                reactionTimesListRef.current.reduce((a, b) => a + b, 0) / reactionTimesListRef.current.length
              )
            : progress.bestReactionMs;

        const updatedProgress: PopBalloonProgress = {
          ...progress,
          unlockedLevel: nextUnlockedLevel,
          levelBestScores: updatedLevelBests,
          totalTournamentScore: newTotalTournamentScore,
          totalBalloonsPoppedAllTime: progress.totalBalloonsPoppedAllTime + nextPops,
          totalMatchesPlayed: progress.totalMatchesPlayed + 1,
          bestComboAllTime: Math.max(progress.bestComboAllTime, nextMaxCombo),
          bestReactionMs: Math.min(progress.bestReactionMs, avgReactionMs),
          levelDetails: {
            ...progress.levelDetails,
            [currentLevelRef.current]: {
              bestScore: Math.max(previousBest, finalLevelScore),
              balloonsPopped: nextPops,
              comboBonus: calculatedComboBonus,
              performanceBonus: calculatedPerfBonus,
              difficultyBonus: calculatedDiffBonus,
              maxCombo: nextMaxCombo,
              stars: finalLevelScore >= levelCfg.targetPops * 2.2 ? 3 : finalLevelScore >= levelCfg.targetPops * 1.4 ? 2 : 1,
              completedAt: new Date().toISOString(),
            },
          },
        };

        setProgress(updatedProgress);
        savePopBalloonProgress(updatedProgress);

        const breakdown: LevelScoreBreakdown = {
          level: currentLevelRef.current,
          balloonsPopped: nextPops,
          baseScore,
          comboBonus: calculatedComboBonus,
          performanceBonus: calculatedPerfBonus,
          difficultyBonus: calculatedDiffBonus,
          levelScore: finalLevelScore,
          previousBest,
          totalTournamentScore: newTotalTournamentScore,
          isNewBest,
          globalRank: calculateGlobalRank(newTotalTournamentScore),
          nextLevelUnlocked: nextUnlockedLevel > progress.unlockedLevel,
          maxCombo: nextMaxCombo,
        };

        setLastLevelResult(breakdown);
        screenStateRef.current = 'LEVEL_COMPLETE';
        setScreenState('LEVEL_COMPLETE');

        // Notify parent of high tournament score
        const durationSeconds = Math.max(
          1,
          Math.round((performance.now() - (totalGameStartTimeRef.current || performance.now())) / 1000)
        );
        onGameOver(newTotalTournamentScore, durationSeconds);
        return;
      }

      setBalloons([...balloonsRef.current]);
    } else {
      // WRONG TAP ON EMPTY SPACE / WHITE BACKGROUND -> IMMEDIATE GAME OVER
      PopBalloonAudio.playWrongTap();
      triggerGameOver('You tapped empty space!');
    }
  };

  /**
   * HUD Objective Status text
   */
  const getObjectiveHudStatus = () => {
    switch (currentLevelConfig.objectiveType) {
      case 'target_color': {
        const remaining = Math.max(0, (currentLevelConfig.targetColorCount || 10) - levelTargetColorPops);
        return `${remaining} ${currentLevelConfig.targetColorName} LEFT`;
      }
      case 'dual_color': {
        const c1Left = Math.max(0, (currentLevelConfig.targetColorCount || 8) - levelTargetColorPops);
        const c2Left = Math.max(0, (currentLevelConfig.targetColor2Count || 8) - levelTargetColor2Pops);
        return `${c1Left} ${currentLevelConfig.targetColorName?.[0]} • ${c2Left} ${currentLevelConfig.targetColor2Name?.[0]} LEFT`;
      }
      case 'combo_target': {
        const remaining = Math.max(0, currentLevelConfig.targetPops - levelPops);
        const req = currentLevelConfig.requiredCombo || 8;
        const currentBest = Math.min(req, levelMaxCombo);
        return `${remaining} LEFT • ${currentBest}/${req}x`;
      }
      case 'pop_all':
      case 'precision':
      case 'speed_rush':
      default:
        return `${Math.max(0, currentLevelConfig.targetPops - levelPops)} LEFT`;
    }
  };

  // --- SUB-SCREEN ROUTING ---
  if (screenState === 'MENU') {
    return (
      <PopBalloonMenu
        progress={progress}
        profile={profile}
        onPlayLevel={handleLaunchLevel}
        onOpenScreen={setScreenState}
        onExit={handleFullExit}
        isSoundOn={isSoundOn}
        onToggleSound={toggleSound}
      />
    );
  }

  if (screenState === 'LEVEL_SELECT') {
    return (
      <PopBalloonLevelSelect
        progress={progress}
        onSelectLevel={handleLaunchLevel}
        onBack={() => setScreenState('MENU')}
      />
    );
  }

  if (screenState === 'LEADERBOARD') {
    return (
      <PopBalloonLeaderboard
        progress={progress}
        profile={profile}
        onBack={() => setScreenState('MENU')}
      />
    );
  }

  if (screenState === 'STATS') {
    return (
      <PopBalloonStats
        progress={progress}
        profile={profile}
        onBack={() => setScreenState('MENU')}
      />
    );
  }

  if (screenState === 'TOURNAMENT') {
    return (
      <PopBalloonTournament
        progress={progress}
        profile={profile}
        onBack={() => setScreenState('MENU')}
      />
    );
  }

  if (screenState === 'ACHIEVEMENTS') {
    return (
      <PopBalloonAchievements
        progress={progress}
        onBack={() => setScreenState('MENU')}
      />
    );
  }

  if (screenState === 'HOW_TO_PLAY') {
    return (
      <PopBalloonHowToPlay onBack={() => setScreenState('MENU')} />
    );
  }

  if (screenState === 'SETTINGS') {
    return (
      <PopBalloonSettings
        isSoundOn={isSoundOn}
        onToggleSound={toggleSound}
        progress={progress}
        onResetProgress={() => setProgress(loadPopBalloonProgress())}
        onBack={() => setScreenState('MENU')}
      />
    );
  }

  // --- ACTIVE GAMEPLAY VIEW (White background #FFFFFF with standardized HUD) ---
  return (
    <div
      className="relative w-full max-w-md mx-auto h-[600px] sm:h-[650px] bg-[#FFFFFF] rounded-3xl overflow-hidden flex flex-col select-none touch-none shadow-2xl border border-slate-200 font-['Plus_Jakarta_Sans',sans-serif]"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* 1. STANDARDIZED TOP HUD: [EXIT] [SCORE] [LEVEL TARGET] [SOUND] [PAUSE] */}
      <div 
        id="pop-balloon-hud"
        className="w-full bg-white/95 backdrop-blur-md px-2.5 sm:px-3.5 py-2 border-b border-slate-200/80 flex items-center justify-between gap-1.5 sm:gap-2 z-20 shrink-0 shadow-xs"
      >
        {/* BUTTON 0: EXIT (Returns to Tournament Menu) */}
        <button
          id="pop-balloon-exit-btn"
          onClick={handleReturnToMenu}
          onPointerDown={(e) => e.stopPropagation()}
          className="h-11 px-2.5 sm:px-3 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 active:scale-95 border border-slate-200 flex items-center gap-1 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
          style={{ boxShadow: 'inset 0 1px 1px #FFFFFF, 0 1px 2px rgba(0,0,0,0.06)' }}
          title="Return to Menu"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">MENU</span>
        </button>

        {/* BUTTON 1: SCORE */}
        <div 
          id="pop-balloon-score-card"
          className="flex-1 min-w-0 h-11 px-2 sm:px-2.5 rounded-2xl bg-gradient-to-b from-[#FFF0F5] to-[#FFE4E6] border border-[#FF3B30]/30 flex items-center gap-1.5 sm:gap-2 shadow-xs transition-transform"
          style={{ boxShadow: 'inset 0 1px 1px #FFFFFF, 0 1px 3px rgba(255, 59, 48, 0.12)' }}
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FF3B30] via-[#FF9500] to-[#FFD60A] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Trophy className="w-3.5 h-3.5 fill-white text-white" />
          </div>
          <div className="flex flex-col min-w-0 leading-none">
            <span className="text-[8px] sm:text-[9px] font-black text-[#FF3B30] uppercase tracking-wider">
              SCORE
            </span>
            <div className="flex items-center gap-1">
              <span className="text-sm sm:text-base font-black text-slate-900 font-mono tracking-tight tabular-nums truncate">
                {Math.floor(score)}
              </span>
              {combo >= 5 && (
                <span className="text-[8px] font-black bg-[#FF3B30] text-white px-1 py-0.2 rounded-full animate-pulse shrink-0">
                  {combo}x
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BUTTON 2: LEVEL & LIVE OBJECTIVE */}
        <div 
          id="pop-balloon-level-card"
          className="flex-1 min-w-0 h-11 px-2 sm:px-2.5 rounded-2xl border border-[#007AFF]/30 bg-gradient-to-b from-[#F0F8FF] to-[#E6F0FA] flex items-center gap-1.5 sm:gap-2 shadow-xs transition-colors text-slate-900"
          style={{ boxShadow: 'inset 0 1px 1px #FFFFFF, 0 1px 3px rgba(0, 122, 255, 0.12)' }}
        >
          <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-gradient-to-tr from-[#007AFF] to-[#34C759] text-white">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 leading-none">
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[#007AFF]">
              STAGE {currentLevel}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              {currentLevelConfig.objectiveType === 'target_color' && currentLevelConfig.targetColor && (
                <div 
                  className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: currentLevelConfig.targetColor }}
                />
              )}
              {currentLevelConfig.objectiveType === 'dual_color' && (
                <div className="flex items-center -space-x-1 shrink-0">
                  <div 
                    className="w-2 h-2 rounded-full z-10 shadow-xs"
                    style={{ backgroundColor: currentLevelConfig.targetColor }}
                  />
                  <div 
                    className="w-2 h-2 rounded-full shadow-xs"
                    style={{ backgroundColor: currentLevelConfig.targetColor2 }}
                  />
                </div>
              )}
              <span className="text-[10px] sm:text-[11px] font-black font-mono tracking-tight tabular-nums truncate text-slate-900">
                {getObjectiveHudStatus()}
              </span>
            </div>
          </div>
        </div>

        {/* BUTTON 3: SOUND */}
        <button
          id="pop-balloon-sound-btn"
          onClick={toggleSound}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-11 h-11 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 active:scale-95 border border-slate-200 flex items-center justify-center text-slate-700 transition-all cursor-pointer shadow-xs shrink-0"
          style={{ boxShadow: 'inset 0 1px 1px #FFFFFF, 0 1px 2px rgba(0,0,0,0.06)' }}
          aria-label={isSoundOn ? 'Mute Sound' : 'Unmute Sound'}
          title={isSoundOn ? 'Mute Sound' : 'Unmute Sound'}
        >
          {isSoundOn ? (
            <Volume2 className="w-4.5 h-4.5 text-[#34C759]" />
          ) : (
            <VolumeX className="w-4.5 h-4.5 text-slate-400" />
          )}
        </button>

        {/* BUTTON 4: PAUSE */}
        <button
          id="pop-balloon-pause-btn"
          onClick={handlePause}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={screenState !== 'PLAYING'}
          className={`w-11 h-11 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 active:scale-95 border border-slate-200 flex items-center justify-center text-slate-700 transition-all cursor-pointer shadow-xs shrink-0 ${
            screenState !== 'PLAYING' ? 'opacity-40 pointer-events-none' : ''
          }`}
          style={{ boxShadow: 'inset 0 1px 1px #FFFFFF, 0 1px 2px rgba(0,0,0,0.06)' }}
          aria-label="Pause Game"
          title="Pause Game"
        >
          <Pause className="w-4.5 h-4.5 fill-slate-700/20 text-slate-700" />
        </button>
      </div>

      {/* 2. MAIN PLAY AREA - PURE WHITE (#FFFFFF) */}
      <div
        ref={containerRef}
        onPointerDown={handlePlayAreaPointerDown}
        className="relative flex-1 w-full bg-[#FFFFFF] overflow-hidden cursor-crosshair"
      >
        {/* Falling Colored Circular Balloons */}
        {balloons.map((balloon) => {
          const isPopping = balloon.isPopping;
          const scale = isPopping ? 1.0 + balloon.popProgress * 0.25 : 1.0;
          const opacity = isPopping ? Math.max(0, 1.0 - balloon.popProgress) : 1.0;

          return (
            <div
              key={balloon.id}
              className="absolute rounded-full pointer-events-none transition-transform"
              style={{
                left: `${balloon.x - balloon.radius}px`,
                top: `${balloon.y - balloon.radius}px`,
                width: `${balloon.radius * 2}px`,
                height: `${balloon.radius * 2}px`,
                backgroundColor: balloon.color,
                transform: `scale(${scale})`,
                opacity: opacity,
                boxShadow: isPopping
                  ? 'none'
                  : '0 4px 10px rgba(0, 0, 0, 0.12), inset 0 -3px 6px rgba(0, 0, 0, 0.18), inset 0 3px 6px rgba(255, 255, 255, 0.45)',
              }}
            >
              {/* Top-left light reflection highlight */}
              {!isPopping && (
                <div
                  className="absolute rounded-full bg-white/40 pointer-events-none"
                  style={{
                    top: `${balloon.radius * 0.2}px`,
                    left: `${balloon.radius * 0.25}px`,
                    width: `${balloon.radius * 0.4}px`,
                    height: `${balloon.radius * 0.3}px`,
                    transform: 'rotate(-30deg)',
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Pop Burst Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x - p.size / 2}px`,
              top: `${p.y - p.size / 2}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.opacity,
            }}
          />
        ))}

        {/* Floating Score Popups */}
        {scorePopups.map((popup) => (
          <div
            key={popup.id}
            className="absolute pointer-events-none font-black font-mono text-sm text-slate-800"
            style={{
              left: `${popup.x - 12}px`,
              top: `${popup.y - 12}px`,
              opacity: Math.max(0, 1 - popup.life / popup.maxLife),
              transform: `scale(${1 + popup.life * 0.4})`,
            }}
          >
            +{Math.floor(popup.points) || 1}
          </div>
        ))}

        {/* 3. 3-2-1-GO COUNTDOWN OVERLAY */}
        {screenState === 'COUNTDOWN' && (
          <div className="absolute inset-0 bg-[#FFFFFF]/90 backdrop-blur-xs flex flex-col items-center justify-center z-40 pointer-events-none p-6 text-center">
            <div className="px-4 py-2 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-800 text-xs font-extrabold mb-5 shadow-xs animate-in fade-in slide-in-from-top-3 duration-200">
              <span className="text-[#007AFF] mr-1.5">STAGE {currentLevel}:</span>
              <span>{currentLevelConfig.description}</span>
            </div>
            <span className="text-7xl font-black text-slate-900 font-mono animate-in zoom-in-50 duration-200">
              {countdownNum}
            </span>
          </div>
        )}

        {/* 4. PAUSE OVERLAY */}
        {screenState === 'PAUSED' && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-40 animate-in fade-in duration-150">
            <div className="bg-[#FFFFFF] rounded-3xl p-6 w-full max-w-xs shadow-2xl border border-slate-100 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#007AFF] flex items-center justify-center mb-3">
                <Pause className="w-7 h-7 fill-[#007AFF]" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-1">PAUSED</h2>
              <p className="text-xs font-semibold text-slate-400 mb-5">Stage is frozen</p>

              <div className="w-full bg-slate-50 rounded-2xl p-4 mb-5 flex flex-col gap-2 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">STAGE</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {currentLevel}
                  </span>
                </div>
                <div className="h-px bg-slate-200/70" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">MISSION</span>
                  <span className="text-xs font-bold text-slate-700 text-right max-w-[150px] truncate">
                    {currentLevelConfig.description}
                  </span>
                </div>
                <div className="h-px bg-slate-200/70" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">STATUS</span>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {getObjectiveHudStatus()}
                  </span>
                </div>
                <div className="h-px bg-slate-200/70" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">SCORE</span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {Math.floor(score)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 w-full">
                <button
                  onClick={(e) => handleResume(e)}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#007AFF] hover:bg-blue-600 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>RESUME</span>
                </button>
                <button
                  onClick={handleReturnToMenu}
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>MAIN MENU</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. GAME OVER SCREEN */}
        {screenState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 z-40">
            <div className="bg-[#FFFFFF] rounded-3xl p-6 w-full max-w-xs shadow-2xl border border-slate-100 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-3">
                <Zap className="w-7 h-7 fill-red-500" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-1">STAGE FAILED</h2>
              <p className="text-xs font-semibold text-red-500 mb-4">{gameOverReason}</p>

              <div className="w-full bg-slate-50 rounded-2xl p-4 mb-5 flex flex-col gap-2 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">STAGE</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {currentLevel}
                  </span>
                </div>
                <div className="h-px bg-slate-200/70" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">POPS</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {levelPops} / {currentLevelConfig.targetPops}
                  </span>
                </div>
                <div className="h-px bg-slate-200/70" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">SCORE</span>
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {Math.floor(score)}
                  </span>
                </div>
                <div className="h-px bg-slate-200/70" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">STAGE BEST</span>
                  <span className="text-base font-bold text-slate-700 font-mono">
                    {progress.levelBestScores[currentLevel] || 0}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 w-full">
                <button
                  onClick={handleRetryLevel}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#007AFF] hover:bg-blue-600 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>RETRY STAGE</span>
                </button>
                <button
                  onClick={handleReturnToMenu}
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>MAIN MENU</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. LEVEL COMPLETE MODAL */}
        {screenState === 'LEVEL_COMPLETE' && lastLevelResult && (
          <PopBalloonLevelCompleteModal
            result={lastLevelResult}
            onNextLevel={handleNextLevel}
            onReplayLevel={handleRetryLevel}
            onMainMenu={handleReturnToMenu}
          />
        )}
      </div>
    </div>
  );
};
