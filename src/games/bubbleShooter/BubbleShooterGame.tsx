/**
 * Bubble Shooter - Main Game Module
 * Full-featured mobile portrait Bubble Shooter engine matching reference video
 * Tournament Edition: 40 progressive stages, deterministic scoring, 3D launcher, full menus.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BubbleColor,
  GridBubble,
  ProjectileBubble,
  FallingBubble,
  PopParticle,
  FloatingScore,
  BubbleShooterLevel,
  LevelProgress,
  GameState,
  LevelScoreBreakdown,
} from './types';
import {
  COLS_EVEN,
  MAX_GRID_ROWS,
  BUBBLE_PALETTE,
  getColsInRow,
  calculateBoardMetrics,
  getBubbleCenter,
  findSnapCell,
  findMatchingCluster,
  findDisconnectedBubbles,
  calculateTrajectory,
} from './hexGrid';
import { BUBBLE_SHOOTER_LEVELS } from './levels';
import { bubbleAudio } from './audio';
import {
  calculateBubblePopScore,
  calculateGroupBonus,
  calculateComboBonus,
  calculateCascadeBonus,
  calculateDropScore,
  computeLevelScoreBreakdown,
} from './scoring';
import { GameLeaderboardService } from '../../services/gameLeaderboardService';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  ArrowLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { GameDefinition, UserProfile } from '../../types';

// Sub-components
import { BubbleShooterMenu } from './components/BubbleShooterMenu';
import { BubbleShooterLevelSelect } from './components/BubbleShooterLevelSelect';
import { BubbleShooterLeaderboard } from './components/BubbleShooterLeaderboard';
import { BubbleShooterHowToPlay } from './components/BubbleShooterHowToPlay';
import { BubbleShooterAchievements } from './components/BubbleShooterAchievements';
import { BubbleShooterStatistics } from './components/BubbleShooterStatistics';
import { BubbleShooterSettings } from './components/BubbleShooterSettings';
import { BubbleShooterAbout } from './components/BubbleShooterAbout';
import { BubbleShooterVictoryModal } from './components/BubbleShooterVictoryModal';

interface BubbleShooterGameProps {
  game: GameDefinition;
  profile: UserProfile;
  onGameOver?: (score: number, durationSeconds: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

const STORAGE_KEY = 'teleplay_bubble_shooter_progress_v1';

export const BubbleShooterGame: React.FC<BubbleShooterGameProps> = ({
  profile,
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  // Container & Canvas references
  const containerRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const ceilingOffsetRef = useRef<number>(16);

  // Persistence State with clean backward compatibility & anti-farming integrity
  const [progress, setProgress] = useState<LevelProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const completedLevels = parsed.completedLevels || {};
        // Recompute clean cumulative score = sum of best score for each completed level
        const cleanTotalScore = (Object.values(completedLevels) as Array<{ highScore?: number }>).reduce(
          (acc: number, c) => acc + (c?.highScore || 0),
          0
        );

        return {
          highestUnlockedLevel: Math.max(1, Math.min(40, parsed.highestUnlockedLevel || 1)),
          completedLevels,
          totalScore: cleanTotalScore > 0 ? cleanTotalScore : parsed.totalScore || 0,
          stats: parsed.stats || {
            gamesPlayed: Object.keys(completedLevels).length,
            levelsCompleted: Object.keys(completedLevels).length,
            totalShotsFired: 0,
            totalEffectiveShots: 0,
            totalMissedShots: 0,
            totalBubblesPopped: 0,
            totalBubblesDropped: 0,
            bestCombo: 0,
            bestTimeSeconds: 0,
            perfectLevelsCount: 0,
          },
        };
      }
    } catch {
      // Fallback
    }
    return {
      highestUnlockedLevel: 1,
      completedLevels: {},
      totalScore: 0,
      stats: {
        gamesPlayed: 0,
        levelsCompleted: 0,
        totalShotsFired: 0,
        totalEffectiveShots: 0,
        totalMissedShots: 0,
        totalBubblesPopped: 0,
        totalBubblesDropped: 0,
        bestCombo: 0,
        bestTimeSeconds: 0,
        perfectLevelsCount: 0,
      },
    };
  });

  // Current Level State (defaults to highest unlocked stage)
  const [currentLevelNum, setCurrentLevelNum] = useState<number>(() => {
    return Math.min(40, Math.max(1, progress.highestUnlockedLevel || 1));
  });

  const currentLevelConfig: BubbleShooterLevel =
    BUBBLE_SHOOTER_LEVELS.find((l) => l.levelNumber === currentLevelNum) ||
    BUBBLE_SHOOTER_LEVELS[0];

  // Game Flow State: START DIRECTLY IN MAIN MENU (Requirement 1)
  const [gameState, setGameState] = useState<GameState>('MAIN_MENU');
  const [score, setScore] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [foulsRemaining, setFoulsRemaining] = useState<number>(currentLevelConfig.maxFouls);
  const [shotsFired, setShotsFired] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(!isAudioEnabled);
  const [showTutorial, setShowTutorial] = useState<boolean>(true);

  // Victory Breakdown Modal Data
  const [victoryBreakdown, setVictoryBreakdown] = useState<LevelScoreBreakdown | null>(null);

  // Active Game Entities in Refs for 60fps canvas loop
  const gridRef = useRef<(GridBubble | null)[][]>([]);
  const projectileRef = useRef<ProjectileBubble | null>(null);
  const currentBubbleColorRef = useRef<BubbleColor>('RED');
  const nextBubbleColorRef = useRef<BubbleColor>('BLUE');
  const fallingBubblesRef = useRef<FallingBubble[]>([]);
  const particlesRef = useRef<PopParticle[]>([]);
  const floatingScoresRef = useRef<FloatingScore[]>([]);

  // Telemetry Refs for deterministic scoring
  const activeTimeRef = useRef<number>(0);
  const lastActiveTimestampRef = useRef<number>(0);
  const effectiveShotsRef = useRef<number>(0);
  const missedShotsRef = useRef<number>(0);
  const bubblesPoppedCountRef = useRef<number>(0);
  const bubblesDroppedCountRef = useRef<number>(0);
  const maxComboRef = useRef<number>(0);

  // Deterministic Scoring Accumulator Refs
  const accumulatedPopScoreRef = useRef<number>(0);
  const accumulatedGroupBonusRef = useRef<number>(0);
  const accumulatedComboBonusRef = useRef<number>(0);
  const accumulatedCascadeBonusRef = useRef<number>(0);
  const accumulatedDropScoreRef = useRef<number>(0);

  // Aiming Controls
  const isDraggingRef = useRef<boolean>(false);
  const aimAngleRef = useRef<number>(-Math.PI / 2); // pointing straight up
  const launcherPosRef = useRef<{ x: number; y: number }>({ x: 200, y: 550 });
  const boardDimsRef = useRef<{
    width: number;
    height: number;
    radius: number;
    sideMargin: number;
  }>({
    width: 360,
    height: 600,
    radius: 21,
    sideMargin: 12,
  });

  // Audio mute sync
  useEffect(() => {
    bubbleAudio.setMuted(isMuted);
  }, [isMuted]);

  // Save progress helper
  const saveProgress = useCallback((newProg: LevelProgress) => {
    setProgress(newProg);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProg));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Reset progress handler
  const handleResetProgress = useCallback(() => {
    const emptyProgress: LevelProgress = {
      highestUnlockedLevel: 1,
      completedLevels: {},
      totalScore: 0,
      stats: {
        gamesPlayed: 0,
        levelsCompleted: 0,
        totalShotsFired: 0,
        totalEffectiveShots: 0,
        totalMissedShots: 0,
        totalBubblesPopped: 0,
        totalBubblesDropped: 0,
        bestCombo: 0,
        bestTimeSeconds: 0,
        perfectLevelsCount: 0,
      },
    };
    saveProgress(emptyProgress);
    setCurrentLevelNum(1);
    setGameState('MAIN_MENU');
  }, [saveProgress]);

  // Haptics trigger
  const triggerHaptic = useCallback((ms = 30) => {
    try {
      if (
        localStorage.getItem('teleplay_bubble_haptics') !== 'false' &&
        typeof navigator !== 'undefined' &&
        'vibrate' in navigator
      ) {
        navigator.vibrate?.(ms);
      }
    } catch {}
  }, []);

  /**
   * Helper to pick a bubble color from colors present on board
   */
  const getRandomActiveColor = useCallback(
    (grid: (GridBubble | null)[][]): BubbleColor => {
      const activeColors = new Set<BubbleColor>();
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < (grid[r]?.length || 0); c++) {
          const b = grid[r][c];
          if (b) activeColors.add(b.color);
        }
      }

      const pool =
        activeColors.size > 0 ? Array.from(activeColors) : currentLevelConfig.availableColors;
      return pool[Math.floor(Math.random() * pool.length)];
    },
    [currentLevelConfig]
  );

  /**
   * Initialize a level
   * @param lvlNum Level number to load
   * @param autoStart If true, transitions to 'READY' (gameplay); if false, remains in current state
   */
  const initLevel = useCallback(
    (lvlNum: number, autoStart = false) => {
      const config =
        BUBBLE_SHOOTER_LEVELS.find((l) => l.levelNumber === lvlNum) || BUBBLE_SHOOTER_LEVELS[0];
      setCurrentLevelNum(lvlNum);

      const { radius, sideMargin } = boardDimsRef.current;
      const ceilingOffset = ceilingOffsetRef.current;
      const newGrid: (GridBubble | null)[][] = [];

      for (let r = 0; r < MAX_GRID_ROWS; r++) {
        const cols = getColsInRow(r);
        newGrid[r] = [];
        for (let c = 0; c < cols; c++) {
          const color = config.rows[r]?.[c] || null;
          if (color) {
            const { x, y } = getBubbleCenter(r, c, radius, ceilingOffset, sideMargin);
            newGrid[r][c] = {
              id: `b_${r}_${c}_${Date.now()}`,
              color,
              row: r,
              col: c,
              x,
              y,
              radius,
            };
          } else {
            newGrid[r][c] = null;
          }
        }
      }

      gridRef.current = newGrid;
      projectileRef.current = null;
      fallingBubblesRef.current = [];
      particlesRef.current = [];
      floatingScoresRef.current = [];

      // Reset Telemetry
      activeTimeRef.current = 0;
      lastActiveTimestampRef.current = performance.now();
      effectiveShotsRef.current = 0;
      missedShotsRef.current = 0;
      bubblesPoppedCountRef.current = 0;
      bubblesDroppedCountRef.current = 0;
      maxComboRef.current = 0;

      // Reset Score Accumulators
      accumulatedPopScoreRef.current = 0;
      accumulatedGroupBonusRef.current = 0;
      accumulatedComboBonusRef.current = 0;
      accumulatedCascadeBonusRef.current = 0;
      accumulatedDropScoreRef.current = 0;

      // Initial shot queue from active board colors
      const firstColor = getRandomActiveColor(newGrid);
      const secondColor = getRandomActiveColor(newGrid);
      currentBubbleColorRef.current = firstColor;
      nextBubbleColorRef.current = secondColor;

      setScore(0);
      setComboCount(0);
      setFoulsRemaining(config.maxFouls);
      setShotsFired(0);
      setVictoryBreakdown(null);
      isDraggingRef.current = false;

      if (autoStart) {
        setGameState('READY');
      }
    },
    [getRandomActiveColor]
  );

  // Resize canvas according to container and arena
  const updateDimensions = useCallback(() => {
    if (!arenaRef.current || !canvasRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    const availableWidth = rect.width;
    const availableHeight = rect.height;
    if (availableWidth <= 0 || availableHeight <= 0) return;

    // Cap maximum game width to 480px while maintaining clean aspect ratio
    const width = Math.min(availableWidth, 480);
    const height = availableHeight;

    // Use authoritative single source of truth for bubble radius and symmetric side margins
    const { radius, sideMargin } = calculateBoardMetrics(width);

    // Safe ceiling offset below HUD
    const safeCeilingGap = Math.max(14, Math.floor(height * 0.022));
    ceilingOffsetRef.current = safeCeilingGap;

    // Responsive launcher placement in lower area with safe margin above catch buckets
    const launcherBottomMargin = Math.max(76, radius * 2.8 + 24);
    launcherPosRef.current = {
      x: width / 2,
      y: height - launcherBottomMargin,
    };

    boardDimsRef.current = {
      width,
      height,
      radius,
      sideMargin,
    };

    // Update canvas resolution (with DPR for sharp rendering)
    const canvas = canvasRef.current;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Refresh existing grid coordinates with updated ceiling offset, radius & sideMargin
    if (gridRef.current.length > 0) {
      for (let r = 0; r < gridRef.current.length; r++) {
        const cols = getColsInRow(r);
        for (let c = 0; c < cols; c++) {
          const b = gridRef.current[r]?.[c];
          if (b) {
            const { x, y } = getBubbleCenter(r, c, radius, safeCeilingGap, sideMargin);
            b.x = x;
            b.y = y;
            b.radius = radius;
          }
        }
      }
    }
  }, []);

  // Mount effect & ResizeObserver & window event listeners
  useEffect(() => {
    updateDimensions();
    // Initialize level in background, but remain in 'MAIN_MENU'
    initLevel(currentLevelNum, false);

    const handleResize = () => {
      updateDimensions();
    };

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    if (arenaRef.current) {
      observer.observe(arenaRef.current);
    }
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [updateDimensions, initLevel, currentLevelNum]);

  // Synchronize canvas dimensions whenever entering active gameplay
  useEffect(() => {
    if (gameState === 'READY' || gameState === 'AIMING') {
      updateDimensions();
    }
  }, [gameState, updateDimensions]);

  /**
   * Shoot the loaded bubble
   */
  const shootCurrentBubble = useCallback(() => {
    if (gameState !== 'READY' && gameState !== 'AIMING') return;
    if (projectileRef.current) return;

    const { radius } = boardDimsRef.current;
    const { x, y } = launcherPosRef.current;
    const angle = aimAngleRef.current;

    // Constrain angle upward (prevent shooting downward)
    const clampedAngle = Math.min(Math.max(angle, -Math.PI + 0.12), -0.12);

    const speed = 22; // Quick, responsive projectile velocity
    projectileRef.current = {
      color: currentBubbleColorRef.current,
      x,
      y,
      vx: Math.cos(clampedAngle) * speed,
      vy: Math.sin(clampedAngle) * speed,
      radius,
    };

    bubbleAudio.playShoot();
    triggerHaptic(25);
    setShotsFired((prev) => prev + 1);
    setGameState('SHOOTING');
    setShowTutorial(false);
  }, [gameState, triggerHaptic]);

  /**
   * Create explosion sparkles on match pop
   */
  const spawnPopParticles = (x: number, y: number, colorDef: (typeof BUBBLE_PALETTE)[BubbleColor]) => {
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 2.5,
        color: i % 2 === 0 ? colorDef.highlight : colorDef.accent,
        alpha: 1,
        decay: 0.04 + Math.random() * 0.03,
      });
    }
  };

  /**
   * Descend the entire hex board by 1 row when fouls expire
   */
  const descendBoard = () => {
    bubbleAudio.playDescend();
    triggerHaptic(40);
    const grid = gridRef.current;
    const { radius, sideMargin } = boardDimsRef.current;
    const ceilingOffset = ceilingOffsetRef.current;

    // Shift all existing rows down by 1
    for (let r = MAX_GRID_ROWS - 1; r > 0; r--) {
      grid[r] = grid[r - 1];
      const cols = getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const b = grid[r][c];
        if (b) {
          b.row = r;
          const center = getBubbleCenter(r, c, radius, ceilingOffset, sideMargin);
          b.x = center.x;
          b.y = center.y;
        }
      }
    }

    // Spawn a new top row
    grid[0] = [];
    const topCols = getColsInRow(0);
    for (let c = 0; c < topCols; c++) {
      const randomColor =
        currentLevelConfig.availableColors[
          Math.floor(Math.random() * currentLevelConfig.availableColors.length)
        ];
      const { x, y } = getBubbleCenter(0, c, radius, ceilingOffset, sideMargin);
      grid[0][c] = {
        id: `descend_${Date.now()}_${c}`,
        color: randomColor,
        row: 0,
        col: c,
        x,
        y,
        radius,
      };
    }

    // Check danger line overflow
    checkDangerLineOverflow();
  };

  /**
   * Check if any bubble has crossed the failure danger line
   */
  const checkDangerLineOverflow = (): boolean => {
    const dangerRow = 11; // Failure boundary row
    for (let r = dangerRow; r < MAX_GRID_ROWS; r++) {
      for (let c = 0; c < (gridRef.current[r]?.length || 0); c++) {
        if (gridRef.current[r][c] !== null) {
          setGameState('LEVEL_FAILED');
          bubbleAudio.playLevelFail();
          triggerHaptic(80);
          return true;
        }
      }
    }
    return false;
  };

  /**
   * Projectile collision & match resolver
   */
  const resolveProjectileLanded = (proj: ProjectileBubble) => {
    const grid = gridRef.current;
    const { radius, sideMargin } = boardDimsRef.current;
    const ceilingOffset = ceilingOffsetRef.current;

    const snap = findSnapCell(proj.x, proj.y, grid, radius, ceilingOffset, sideMargin);
    if (!snap) {
      // Fallback: Level failed if no vacant slot
      setGameState('LEVEL_FAILED');
      bubbleAudio.playLevelFail();
      triggerHaptic(80);
      return;
    }

    const { x, y } = getBubbleCenter(snap.row, snap.col, radius, ceilingOffset, sideMargin);
    const newBubble: GridBubble = {
      id: `snap_${snap.row}_${snap.col}_${Date.now()}`,
      color: proj.color,
      row: snap.row,
      col: snap.col,
      x,
      y,
      radius,
    };

    grid[snap.row][snap.col] = newBubble;
    projectileRef.current = null;
    bubbleAudio.playAttach();

    // Check for match >= 3
    const matches = findMatchingCluster(snap.row, snap.col, grid);

    if (matches.length >= 3) {
      setGameState('RESOLVING_MATCH');
      const newCombo = comboCount + 1;
      setComboCount(newCombo);
      bubbleAudio.playPop(newCombo);
      triggerHaptic(35);

      // Track telemetry
      effectiveShotsRef.current += 1;
      bubblesPoppedCountRef.current += matches.length;
      maxComboRef.current = Math.max(maxComboRef.current, newCombo);

      // Deterministic Score calculation
      const popScore = calculateBubblePopScore(matches.length);
      const groupBonus = calculateGroupBonus(matches.length);
      const comboBonus = calculateComboBonus(newCombo);
      accumulatedPopScoreRef.current += popScore;
      accumulatedGroupBonusRef.current += groupBonus;
      accumulatedComboBonusRef.current += comboBonus;

      const totalPoints = popScore + groupBonus + comboBonus;
      setScore((prev) => prev + totalPoints);

      // Spawn pop particles & remove bubbles
      const colorDef = BUBBLE_PALETTE[proj.color];
      matches.forEach((m) => {
        const b = grid[m.row][m.col];
        if (b) {
          spawnPopParticles(b.x, b.y, colorDef);
        }
        grid[m.row][m.col] = null;
      });

      // Floating score badge
      floatingScoresRef.current.push({
        id: `score_${Date.now()}`,
        text: `+${totalPoints}`,
        x: newBubble.x,
        y: newBubble.y,
        color: colorDef.highlight,
        alpha: 1,
        scale: 1.2,
        durationMs: 700,
        createdAt: Date.now(),
      });

      // Check disconnected / unsupported clusters
      const disconnected = findDisconnectedBubbles(grid);
      if (disconnected.length > 0) {
        setGameState('DROPPING_CLUSTERS');
        bubbleAudio.playClusterDrop(disconnected.length);

        bubblesDroppedCountRef.current += disconnected.length;

        const cascadeBonus = calculateCascadeBonus(true, true);
        const dropScore = calculateDropScore(disconnected.length);
        accumulatedCascadeBonusRef.current += cascadeBonus;
        accumulatedDropScoreRef.current += dropScore;

        const totalDropPoints = dropScore + cascadeBonus;
        setScore((prev) => prev + totalDropPoints);

        floatingScoresRef.current.push({
          id: `drop_${Date.now()}`,
          text: `Drop Bonus +${totalDropPoints}`,
          x: boardDimsRef.current.width / 2,
          y: newBubble.y + 40,
          color: '#F7B51D',
          alpha: 1,
          scale: 1.3,
          durationMs: 950,
          createdAt: Date.now(),
        });

        // Convert disconnected bubbles to physics falling bubbles
        disconnected.forEach((item) => {
          grid[item.row][item.col] = null;
          fallingBubblesRef.current.push({
            id: `fall_${item.row}_${item.col}_${Date.now()}`,
            color: item.bubble.color,
            x: item.bubble.x,
            y: item.bubble.y,
            vx: (Math.random() - 0.5) * 3,
            vy: -1.5 - Math.random() * 2, // Slight initial hop
            radius: item.bubble.radius,
            rotation: 0,
            vRot: (Math.random() - 0.5) * 0.15,
            alpha: 1,
          });
        });
      }
    } else {
      // Missed shot / Foul
      missedShotsRef.current += 1;
      setComboCount(0);
      const newFouls = foulsRemaining - 1;
      if (newFouls <= 0) {
        setFoulsRemaining(currentLevelConfig.maxFouls);
        descendBoard();
      } else {
        setFoulsRemaining(newFouls);
      }
    }

    // Check danger line overflow
    if (checkDangerLineOverflow()) {
      return;
    }

    // Check level clear
    let remainingCount = 0;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < (grid[r]?.length || 0); c++) {
        if (grid[r][c] !== null) remainingCount++;
      }
    }

    if (remainingCount === 0) {
      // LEVEL COMPLETED!
      setGameState('LEVEL_COMPLETE');
      bubbleAudio.playLevelWin();
      triggerHaptic(60);

      const totalShotsCount = shotsFired + 1;
      const prevLvlData = progress.completedLevels[currentLevelNum];
      const existingBest = prevLvlData?.highScore || 0;
      const timeTaken = Math.max(1, Math.round(activeTimeRef.current));

      const currentBestMap: Record<number, number> = {};
      Object.entries(progress.completedLevels || {}).forEach(([lvl, data]: [string, any]) => {
        currentBestMap[Number(lvl)] = data?.highScore || 0;
      });

      // Calculate deterministic, anti-inflationary score breakdown
      const breakdown = computeLevelScoreBreakdown({
        level: currentLevelConfig,
        accumulatedPopScore: accumulatedPopScoreRef.current,
        accumulatedGroupBonus: accumulatedGroupBonusRef.current,
        accumulatedComboBonus: accumulatedComboBonusRef.current,
        accumulatedCascadeBonus: accumulatedCascadeBonusRef.current,
        accumulatedDropScore: accumulatedDropScoreRef.current,
        shotsUsed: totalShotsCount,
        effectiveShots: effectiveShotsRef.current,
        missedShots: missedShotsRef.current,
        invalidShots: 0,
        activeElapsedSeconds: timeTaken,
        previousBestScore: existingBest,
        currentCompletedLevelsBestScores: currentBestMap,
      });

      // Update level record
      const newHighScore = Math.max(existingBest, breakdown.finalLevelScore);
      const newStars = Math.max(prevLvlData?.stars || 0, breakdown.stars);
      const newBestShots = prevLvlData
        ? Math.min(prevLvlData.bestShots, totalShotsCount)
        : totalShotsCount;
      const newBestTime = prevLvlData?.bestTimeSeconds
        ? Math.min(prevLvlData.bestTimeSeconds, timeTaken)
        : timeTaken;

      const nextUnlocked = Math.max(
        progress.highestUnlockedLevel,
        Math.min(40, currentLevelNum + 1)
      );

      const updatedCompleted = {
        ...progress.completedLevels,
        [currentLevelNum]: {
          stars: newStars,
          highScore: newHighScore,
          bestShots: newBestShots,
          bestTimeSeconds: newBestTime,
        },
      };

      // Recalculate true cumulative score (SUM OF BEST SCORE FOR EACH COMPLETED LEVEL)
      const trueCumulativeScore = (Object.values(updatedCompleted) as Array<{ highScore: number }>).reduce(
        (sum, item) => sum + (item.highScore || 0),
        0
      );

      // Update career stats
      const currentStats = progress.stats || {
        gamesPlayed: 0,
        levelsCompleted: 0,
        totalShotsFired: 0,
        totalEffectiveShots: 0,
        totalMissedShots: 0,
        totalBubblesPopped: 0,
        totalBubblesDropped: 0,
        bestCombo: 0,
        bestTimeSeconds: 0,
        perfectLevelsCount: 0,
      };

      const isFirstClear = !prevLvlData;
      const updatedStats = {
        gamesPlayed: currentStats.gamesPlayed + 1,
        levelsCompleted: currentStats.levelsCompleted + (isFirstClear ? 1 : 0),
        totalShotsFired: currentStats.totalShotsFired + totalShotsCount,
        totalEffectiveShots: currentStats.totalEffectiveShots + effectiveShotsRef.current,
        totalMissedShots: currentStats.totalMissedShots + missedShotsRef.current,
        totalBubblesPopped: currentStats.totalBubblesPopped + bubblesPoppedCountRef.current,
        totalBubblesDropped: currentStats.totalBubblesDropped + bubblesDroppedCountRef.current,
        bestCombo: Math.max(currentStats.bestCombo, maxComboRef.current),
        bestTimeSeconds:
          currentStats.bestTimeSeconds === 0
            ? timeTaken
            : Math.min(currentStats.bestTimeSeconds, timeTaken),
        perfectLevelsCount:
          currentStats.perfectLevelsCount + (breakdown.performanceRating === 'PERFECT' ? 1 : 0),
      };

      const updatedProgress: LevelProgress = {
        highestUnlockedLevel: nextUnlocked,
        completedLevels: updatedCompleted,
        totalScore: trueCumulativeScore,
        stats: updatedStats,
      };

      saveProgress(updatedProgress);
      setVictoryBreakdown(breakdown);
      setScore(breakdown.finalLevelScore);

      // Record to persistent tournament leaderboard
      if (trueCumulativeScore > 0) {
        GameLeaderboardService.recordScore(
          'bubble-shooter',
          trueCumulativeScore,
          profile?.displayName || 'You',
          nextUnlocked
        );
      }

      if (onGameOver) {
        onGameOver(breakdown.finalLevelScore, timeTaken);
      }
      return;
    }

    // Load next bubble
    currentBubbleColorRef.current = nextBubbleColorRef.current;
    nextBubbleColorRef.current = getRandomActiveColor(grid);

    setTimeout(() => {
      setGameState('READY');
    }, 120);
  };

  /**
   * Main 60FPS Game Loop
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const renderLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Track active gameplay time (only when state is actively playable)
      if (
        gameState === 'READY' ||
        gameState === 'AIMING' ||
        gameState === 'SHOOTING' ||
        gameState === 'RESOLVING_MATCH' ||
        gameState === 'DROPPING_CLUSTERS'
      ) {
        activeTimeRef.current += dt;
      }

      const { width, height, radius, sideMargin } = boardDimsRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

      // Enforce clean 1:1 scale on every single frame
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 1. CLEAR & BACKGROUND (Dark Navy / Deep Teal with subtle radial lighting)
      ctx.clearRect(0, 0, width, height);

      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.25,
        width * 0.1,
        width * 0.5,
        height * 0.5,
        height * 0.8
      );
      bgGrad.addColorStop(0, '#0c273e');
      bgGrad.addColorStop(0.5, '#071728');
      bgGrad.addColorStop(1, '#040d17');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric grid dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
      for (let x = 15; x < width; x += 30) {
        for (let y = 30; y < height - 120; y += 30) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const ceilingOffset = ceilingOffsetRef.current;

      // Ceiling anchor bar (positioned at safe ceilingOffset)
      ctx.fillStyle = '#1e3852';
      ctx.fillRect(sideMargin, Math.max(0, ceilingOffset - 4), width - 2 * sideMargin, 4);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(sideMargin, Math.max(0, ceilingOffset - 1), width - 2 * sideMargin, 1.5);

      // Danger / Failure Line (at row 11)
      const dangerRowCenter = getBubbleCenter(11, 0, radius, ceilingOffset, sideMargin);
      const dangerY = dangerRowCenter.y + radius;
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(sideMargin, dangerY);
      ctx.lineTo(width - sideMargin, dangerY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('DANGER LINE', sideMargin + 4, dangerY - 4);
      ctx.restore();

      // Bottom Catch Buckets (50 | 100 | 250 | 100 | 50)
      const safeBottomMargin = 12;
      const bucketY = height - 30 - safeBottomMargin;
      const bucketPlayableWidth = width - 2 * sideMargin;
      const bucketWidth = bucketPlayableWidth / 5;
      const bucketScores = [50, 100, 250, 100, 50];
      for (let i = 0; i < 5; i++) {
        const bx = sideMargin + i * bucketWidth;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.fillRect(bx + 2, bucketY, bucketWidth - 4, 26);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeRect(bx + 2, bucketY, bucketWidth - 4, 26);

        ctx.fillStyle = i === 2 ? '#fbbf24' : '#94a3b8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${bucketScores[i]}`, bx + bucketWidth / 2, bucketY + 17);
      }

      // 2. RENDER GRID BUBBLES (Spherical Glossy 3D with 1:1 circular aspect ratio)
      const grid = gridRef.current;
      for (let r = 0; r < grid.length; r++) {
        const cols = getColsInRow(r);
        for (let c = 0; c < cols; c++) {
          const b = grid[r]?.[c];
          if (b) {
            renderGlossyBubble(ctx, b.x, b.y, b.radius, b.color);
          }
        }
      }

      // 3. RENDER FALLING DISCONNECTED BUBBLES (Physics Gravity & Wobble)
      const falling = fallingBubblesRef.current;
      for (let i = falling.length - 1; i >= 0; i--) {
        const fb = falling[i];
        fb.vy += 0.55; // Gravity
        fb.x += fb.vx;
        fb.y += fb.vy;
        fb.rotation += fb.vRot;

        ctx.save();
        ctx.translate(fb.x, fb.y);
        ctx.rotate(fb.rotation);
        renderGlossyBubble(ctx, 0, 0, fb.radius, fb.color);
        ctx.restore();

        // Remove when fallen past bottom
        if (fb.y > height + 50) {
          falling.splice(i, 1);
        }
      }

      // 4. RENDER PROJECTILE BUBBLE
      const proj = projectileRef.current;
      if (proj) {
        proj.x += proj.vx;
        proj.y += proj.vy;

        // Wall bounce (Left and Right bounds of hex grid)
        const leftWall = sideMargin + proj.radius;
        const rightWall = width - sideMargin - proj.radius;
        if (proj.x <= leftWall) {
          proj.x = leftWall;
          proj.vx = Math.abs(proj.vx);
          bubbleAudio.playBounce();
          triggerHaptic(15);
        } else if (proj.x >= rightWall) {
          proj.x = rightWall;
          proj.vx = -Math.abs(proj.vx);
          bubbleAudio.playBounce();
          triggerHaptic(15);
        }

        // Ceiling collision
        if (proj.y - proj.radius <= ceilingOffset) {
          proj.y = ceilingOffset + proj.radius;
          resolveProjectileLanded(proj);
        } else {
          // Check collision against all bubbles on the board
          let hit = false;
          for (let r = 0; r < grid.length && !hit; r++) {
            const cols = getColsInRow(r);
            for (let c = 0; c < cols && !hit; c++) {
              const gb = grid[r]?.[c];
              if (gb) {
                const dx = proj.x - gb.x;
                const dy = proj.y - gb.y;
                const distSq = dx * dx + dy * dy;
                const collisionDist = radius * 1.88; // Slight tolerance
                if (distSq <= collisionDist * collisionDist) {
                  hit = true;
                  resolveProjectileLanded(proj);
                }
              }
            }
          }
        }

        if (projectileRef.current) {
          renderGlossyBubble(ctx, proj.x, proj.y, proj.radius, proj.color);
        }
      }

      // 5. RENDER AIMING TRAJECTORY (Dotted Laser with Wall Reflection)
      if ((gameState === 'AIMING' || isDraggingRef.current) && !projectileRef.current) {
        const { x: lx, y: ly } = launcherPosRef.current;
        const angle = aimAngleRef.current;
        const traj = calculateTrajectory(
          lx,
          ly,
          angle,
          grid,
          width,
          radius,
          ceilingOffset,
          sideMargin
        );

        const currentColorDef = BUBBLE_PALETTE[currentBubbleColorRef.current];

        ctx.save();
        ctx.lineWidth = 1.5;
        let distAccum = 0;
        const dotSpacing = 16;

        for (let i = 0; i < traj.points.length - 1; i++) {
          const p1 = traj.points[i];
          const p2 = traj.points[i + 1];
          const segDx = p2.x - p1.x;
          const segDy = p2.y - p1.y;
          const segDist = Math.sqrt(segDx * segDx + segDy * segDy);

          const step = 8;
          for (let d = 0; d < segDist; d += step) {
            distAccum += step;
            if (distAccum % dotSpacing < step) {
              const progressRatio = d / segDist;
              const dotX = p1.x + segDx * progressRatio;
              const dotY = p1.y + segDy * progressRatio;

              // Trajectory point strictly inside gameplay bounds (never inside HUD)
              if (dotY < ceilingOffset) continue;

              ctx.fillStyle = currentColorDef.highlight;
              ctx.shadowColor = currentColorDef.glow;
              ctx.shadowBlur = 6;
              ctx.beginPath();
              ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Wall reflection point glow
        if (traj.reflectionPoint && traj.reflectionPoint.y >= ceilingOffset) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(traj.reflectionPoint.x, traj.reflectionPoint.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // 6. RENDER ORIGINAL SHOOTER LAUNCHER
      const { x: lx, y: ly } = launcherPosRef.current;
      renderOriginalLauncher(
        ctx,
        lx,
        ly,
        radius,
        aimAngleRef.current,
        currentBubbleColorRef.current,
        nextBubbleColorRef.current,
        foulsRemaining,
        currentLevelConfig.maxFouls,
        !projectileRef.current
      );

      // 7. PARTICLES UPDATE & RENDER
      const particles = particlesRef.current;
      for (let p = particles.length - 1; p >= 0; p--) {
        const pt = particles[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.decay;

        if (pt.alpha <= 0) {
          particles.splice(p, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 8. FLOATING SCORES
      const floatScores = floatingScoresRef.current;
      const now = Date.now();
      for (let s = floatScores.length - 1; s >= 0; s--) {
        const fs = floatScores[s];
        const elapsed = now - fs.createdAt;
        if (elapsed > fs.durationMs) {
          floatScores.splice(s, 1);
          continue;
        }

        const progressRatio = elapsed / fs.durationMs;
        const currentY = fs.y - progressRatio * 38;
        const currentAlpha = Math.max(0, 1 - progressRatio);

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.font = 'bold 15px monospace';
        ctx.fillStyle = fs.color;
        ctx.shadowColor = fs.color;
        ctx.shadowBlur = 6;
        ctx.textAlign = 'center';
        ctx.fillText(fs.text, fs.x, currentY);
        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [gameState, foulsRemaining, currentLevelConfig, triggerHaptic]);

  /**
   * Render glossy 3D bubble onto canvas with specular reflection & ambient shading
   */
  const renderGlossyBubble = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    color: BubbleColor
  ) => {
    const pal = BUBBLE_PALETTE[color];

    ctx.save();

    // 1. Subtle soft contact shadow
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.15, r * 0.95, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fill();

    // 2. Primary 3D Sphere Radial Gradient
    const sphereGrad = ctx.createRadialGradient(
      cx - r * 0.32,
      cy - r * 0.32,
      r * 0.08,
      cx,
      cy,
      r
    );
    sphereGrad.addColorStop(0, pal.highlight);
    sphereGrad.addColorStop(0.25, pal.accent);
    sphereGrad.addColorStop(0.7, pal.base);
    sphereGrad.addColorStop(1, pal.shadow);

    ctx.beginPath();
    ctx.arc(cx, cy, r - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = sphereGrad;
    ctx.fill();

    // 3. Specular upper-left bright light reflection
    ctx.save();
    ctx.translate(cx - r * 0.32, cy - r * 0.32);
    ctx.rotate(-Math.PI / 4);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.34, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.fill();
    ctx.restore();

    // 4. Secondary micro specular dot
    ctx.beginPath();
    ctx.arc(cx + r * 0.28, cy - r * 0.28, r * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();

    // 5. Subtle rim light at bottom-right
    const rimGrad = ctx.createRadialGradient(
      cx + r * 0.4,
      cy + r * 0.4,
      r * 0.6,
      cx + r * 0.4,
      cy + r * 0.4,
      r
    );
    rimGrad.addColorStop(0, 'transparent');
    rimGrad.addColorStop(0.85, 'transparent');
    rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.22)');
    ctx.beginPath();
    ctx.arc(cx, cy, r - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = rimGrad;
    ctx.fill();

    ctx.restore();
  };

  /**
   * Render original classic bubble shooter launcher
   */
  const renderOriginalLauncher = (
    ctx: CanvasRenderingContext2D,
    lx: number,
    ly: number,
    radius: number,
    aimAngle: number,
    currentColor: BubbleColor,
    nextColor: BubbleColor,
    foulsRemaining: number,
    maxFouls: number,
    isLoaded: boolean
  ) => {
    ctx.save();

    // 1. Base ring / housing for the launcher
    ctx.beginPath();
    ctx.arc(lx, ly, radius * 1.25, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 2. Aiming directional arrow / needle
    const arrowDist = radius * 1.55;
    const arrowX = lx + Math.cos(aimAngle) * arrowDist;
    const arrowY = ly + Math.sin(aimAngle) * arrowDist;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(arrowX, arrowY);
    ctx.stroke();

    // Arrow pointer head
    const headLen = 8;
    const angle1 = aimAngle + Math.PI * 0.82;
    const angle2 = aimAngle - Math.PI * 0.82;
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX + Math.cos(angle1) * headLen, arrowY + Math.sin(angle1) * headLen);
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX + Math.cos(angle2) * headLen, arrowY + Math.sin(angle2) * headLen);
    ctx.stroke();

    // 3. Render active loaded bubble on the launcher
    if (isLoaded) {
      renderGlossyBubble(ctx, lx, ly, radius, currentColor);
    }

    // 4. Next bubble preview (placed to the right)
    const nextX = lx + radius * 2.6;
    const nextY = ly;
    ctx.beginPath();
    ctx.arc(nextX, nextY, radius * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    renderGlossyBubble(ctx, nextX, nextY, radius * 0.75, nextColor);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NEXT', nextX, nextY - radius * 0.95);

    // 5. Foul indicators (remaining misses before ceiling descends, placed to the left)
    const foulStartX = lx - radius * 2.6;
    const foulY = ly;
    const foulSpacing = 12;
    for (let i = 0; i < maxFouls; i++) {
      const fx = foulStartX - i * foulSpacing;
      const isActive = i < foulsRemaining;
      ctx.beginPath();
      ctx.arc(fx, foulY, 4, 0, Math.PI * 2);
      if (isActive) {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 4;
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(100, 116, 139, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    ctx.restore();
  };

  /**
   * Helper to convert pointer event into logical canvas coordinates
   */
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const { width, height } = boardDimsRef.current;
    const scaleX = rect.width > 0 ? width / rect.width : 1;
    const scaleY = rect.height > 0 ? height / rect.height : 1;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  /**
   * Pointer Events: Aiming & Shooting
   */
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'READY' && gameState !== 'AIMING') return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    const { x, y } = coords;
    const { x: lx, y: ly } = launcherPosRef.current;
    const { radius } = boardDimsRef.current;

    // Direct touch on Next Bubble pod triggers swap
    const nextPodX = lx + radius * 2.6;
    const nextPodY = ly;
    const distToNext = Math.hypot(x - nextPodX, y - nextPodY);
    if (distToNext <= radius * 1.25) {
      handleSwapBubbles();
      return;
    }

    const angle = Math.atan2(y - ly, x - lx);

    // Only allow aiming upward (negative y)
    if (angle < 0) {
      aimAngleRef.current = angle;
      isDraggingRef.current = true;
      setGameState('AIMING');
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    const { x, y } = coords;
    const { x: lx, y: ly } = launcherPosRef.current;
    const angle = Math.atan2(y - ly, x - lx);

    if (angle < 0) {
      aimAngleRef.current = Math.min(Math.max(angle, -Math.PI + 0.15), -0.15);
    }
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      shootCurrentBubble();
    }
  };

  /**
   * Swap current and next bubble
   */
  const handleSwapBubbles = () => {
    if (gameState !== 'READY') return;
    const temp = currentBubbleColorRef.current;
    currentBubbleColorRef.current = nextBubbleColorRef.current;
    nextBubbleColorRef.current = temp;
    bubbleAudio.playBounce();
    triggerHaptic(20);
  };

  // -------------------------------------------------------------
  // ACTIVE GAMEPLAY SCREEN (CANVAS + HUD + SUB-SCREENS)
  // -------------------------------------------------------------

  return (
    <div
      ref={containerRef}
      style={{
        height: '100dvh',
        maxHeight: '100%',
        overscrollBehavior: 'none',
        touchAction: 'none',
      }}
      className="relative w-full h-full max-w-[480px] mx-auto flex flex-col justify-start select-none overflow-hidden bg-[#071626]"
    >
      {/* 1. TOP MOBILE GAMEPLAY HUD */}
      <div
        ref={hudRef}
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)',
        }}
        className="relative z-30 flex items-center justify-between px-3 sm:px-4 py-2 bg-[#081b2e]/95 border-b border-sky-950/80 shadow-lg backdrop-blur-md shrink-0 select-none"
      >
        {/* Left: Back to Menu & Level Indicator */}
        <div className="flex items-center gap-2">
          {/* Back button returns cleanly to Main Menu */}
          <button
            type="button"
            onClick={() => setGameState('MAIN_MENU')}
            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 active:scale-95 text-slate-200 border border-white/10 shadow-md backdrop-blur-md flex items-center justify-center transition-all cursor-pointer"
            title="Return to Main Menu"
            aria-label="Return to Main Menu"
          >
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>

          {/* Level Indicator Pill (44dp touch target) */}
          <button
            type="button"
            onClick={() => setGameState('LEVEL_SELECT')}
            className="min-h-[44px] h-11 px-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 active:scale-95 text-sky-300 border border-sky-500/25 shadow-md backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
            title="Select Level"
            aria-label={`Current Level ${currentLevelNum}. Tap to select level.`}
          >
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-black tracking-wider uppercase font-mono text-sky-100">
              LVL {currentLevelNum}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-sky-400/60 shrink-0 ml-0.5" />
          </button>
        </div>

        {/* Center: Score Display */}
        <div className="h-11 px-4 rounded-2xl bg-slate-900/85 border border-amber-500/25 shadow-md backdrop-blur-md flex flex-col items-center justify-center min-w-[84px]">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-0.5">
            SCORE
          </span>
          <span className="text-sm sm:text-base font-black text-amber-300 font-mono tracking-wide leading-none">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Right: Sound & Pause Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle Button (44x44dp) */}
          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 active:scale-95 border border-white/10 shadow-md backdrop-blur-md flex items-center justify-center transition-all cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-rose-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-sky-300" />
            )}
          </button>

          {/* Pause Button (44x44dp) */}
          <button
            type="button"
            onClick={() => setGameState('PAUSED')}
            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 active:scale-95 text-slate-100 border border-white/10 shadow-md backdrop-blur-md flex items-center justify-center transition-all cursor-pointer"
            title="Pause Game"
            aria-label="Pause Game"
          >
            <Pause className="w-5 h-5 text-slate-100" />
          </button>
        </div>
      </div>

      {/* 2. MAIN CANVAS ARENA */}
      <div
        ref={arenaRef}
        className="relative flex-1 w-full overflow-hidden touch-none flex flex-col justify-start items-center select-none overscroll-none"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="cursor-crosshair touch-none select-none block"
        />

        {/* First-time gentle tutorial hint */}
        {showTutorial && gameState === 'READY' && shotsFired === 0 && (
          <div
            style={{
              bottom: 'max(env(safe-area-inset-bottom, 0px) + 90px, 100px)',
            }}
            className="absolute pointer-events-none px-4 py-2 rounded-full bg-slate-900/85 border border-sky-400/30 text-sky-200 text-xs font-semibold animate-pulse shadow-lg backdrop-blur-md z-10"
          >
            Drag to aim • Release to shoot
          </div>
        )}

        {/* Quick swap button beside launcher */}
        <button
          type="button"
          onClick={handleSwapBubbles}
          style={{
            bottom: 'max(env(safe-area-inset-bottom, 0px) + 12px, 16px)',
            right: '16px',
          }}
          className="absolute min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-slate-900/85 hover:bg-slate-800/90 active:scale-95 text-sky-300 border border-sky-500/30 shadow-lg backdrop-blur-md flex items-center justify-center transition-all cursor-pointer z-10"
          title="Swap Next Bubble"
          aria-label="Swap loaded bubble with next bubble"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* 3. SUB-SCREEN OVERLAYS (Full coverage over gameplay arena) */}
      {gameState === 'MAIN_MENU' && (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#071626]">
          <BubbleShooterMenu
            progress={progress}
            profile={profile}
            currentLevelNumber={currentLevelNum}
            onPlayLevel={(lvlNum) => {
              initLevel(lvlNum, true);
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
        </div>
      )}

      {gameState === 'LEVEL_SELECT' && (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#071626]">
          <BubbleShooterLevelSelect
            progress={progress}
            onSelectLevel={(lvlNum) => {
              initLevel(lvlNum, true);
            }}
            onClose={() => setGameState('MAIN_MENU')}
          />
        </div>
      )}

      {gameState === 'LEADERBOARD' && (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#071626]">
          <BubbleShooterLeaderboard
            progress={progress}
            profile={profile}
            onClose={() => setGameState('MAIN_MENU')}
          />
        </div>
      )}

      {gameState === 'HOW_TO_PLAY' && (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#071626]">
          <BubbleShooterHowToPlay onClose={() => setGameState('MAIN_MENU')} />
        </div>
      )}

      {gameState === 'ACHIEVEMENTS' && (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#071626]">
          <BubbleShooterAchievements progress={progress} onClose={() => setGameState('MAIN_MENU')} />
        </div>
      )}

      {gameState === 'STATISTICS' && (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#071626]">
          <BubbleShooterStatistics progress={progress} onClose={() => setGameState('MAIN_MENU')} />
        </div>
      )}

      {gameState === 'SETTINGS' && (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#071626]">
          <BubbleShooterSettings
            isAudioMuted={isMuted}
            onToggleAudio={() => setIsMuted((prev) => !prev)}
            onResetProgress={handleResetProgress}
            onClose={() => setGameState('MAIN_MENU')}
          />
        </div>
      )}

      {gameState === 'ABOUT' && (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#071626]">
          <BubbleShooterAbout onClose={() => setGameState('MAIN_MENU')} />
        </div>
      )}

      {/* 4. MODAL OVERLAYS */}

      {/* A. PAUSE MODAL */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex flex-col justify-center items-center p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-slate-900 border border-sky-500/30 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <h2 className="text-xl font-black text-white tracking-wide">GAME PAUSED</h2>
            <p className="text-xs text-slate-400">
              Level {currentLevelNum} &bull; {currentLevelConfig.name}
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => setGameState('READY')}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Game</span>
              </button>

              <button
                type="button"
                onClick={() => initLevel(currentLevelNum, true)}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Level</span>
              </button>

              <button
                type="button"
                onClick={() => setGameState('LEVEL_SELECT')}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Select Level</span>
              </button>

              <button
                type="button"
                onClick={() => setGameState('MAIN_MENU')}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Main Menu</span>
              </button>

              <button
                type="button"
                onClick={onExit}
                className="w-full py-2.5 rounded-xl text-rose-400 hover:text-rose-300 font-semibold text-xs cursor-pointer"
              >
                Exit to Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* B. LEVEL COMPLETE DETAILED BREAKDOWN MODAL */}
      {gameState === 'LEVEL_COMPLETE' && victoryBreakdown && (
        <BubbleShooterVictoryModal
          breakdown={victoryBreakdown}
          hasNextLevel={currentLevelNum < 40}
          onNextLevel={() => initLevel(currentLevelNum + 1, true)}
          onReplay={() => initLevel(currentLevelNum, true)}
          onMainMenu={() => setGameState('MAIN_MENU')}
        />
      )}

      {/* C. LEVEL FAILED MODAL */}
      {gameState === 'LEVEL_FAILED' && (
        <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex flex-col justify-center items-center p-6 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-xs bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Zap className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">LEVEL FAILED</h2>
              <p className="text-xs text-rose-300/80 font-semibold mt-0.5">
                Bubbles crossed the danger line!
              </p>
            </div>

            <div className="bg-slate-950/60 rounded-2xl p-3 text-xs font-mono text-slate-300 flex justify-between">
              <span className="text-slate-400 font-sans">Score Earned:</span>
              <span className="font-bold text-amber-300">{score.toLocaleString()}</span>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => initLevel(currentLevelNum, true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={() => setGameState('LEVEL_SELECT')}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Select Level</span>
              </button>

              <button
                type="button"
                onClick={() => setGameState('MAIN_MENU')}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Main Menu</span>
              </button>

              <button
                type="button"
                onClick={onExit}
                className="w-full py-2 rounded-xl text-slate-400 hover:text-white font-semibold text-xs cursor-pointer"
              >
                Quit Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
