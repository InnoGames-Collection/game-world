/**
 * Soccer Shooter - Main Game Component
 * Professional 3D Soccer-themed Bubble Shooter with realistic ball physics,
 * stadium acoustics, 40-level progressive championship, and full Android safe-area responsiveness.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  ArrowLeft,
  Trophy,
  Star,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { GameDefinition, UserProfile } from '../../types';
import {
  GridBall,
  ProjectileBall,
  FallingBall,
  SoccerParticle,
  FloatingScore,
  SoccerGameState,
  SoccerTeamColor,
  SoccerProgress,
} from './types';
import { renderSoccerBall } from './soccerBallRenderer';
import {
  COLS_EVEN,
  COLS_ODD,
  MAX_GRID_ROWS,
  getColsInRow,
  getBallCenter,
  findMatchingCluster,
  findFloatingBalls,
  findSnapCell,
  calculateTrajectory,
  TrajectoryPath,
} from './hexGrid';
import { SOCCER_LEVELS } from './levels';
import { soccerAudio } from './audio';

interface SoccerShooterGameProps {
  game: GameDefinition;
  profile: UserProfile;
  onGameOver: (score: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

const STORAGE_KEY_PROGRESS = 'soccer_shooter_progress_v1';
const DANGER_ROW_INDEX = 10; // Row 10 is the red danger line

// Next Ball 3D Canvas Preview Component
const NextBallCanvas: React.FC<{ color: SoccerTeamColor }> = ({ color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderSoccerBall(ctx, 16, 16, 13, color);
  }, [color]);

  return (
    <div className="w-8 h-8 rounded-full bg-slate-950/90 border border-white/25 shadow-inner flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} width={32} height={32} className="block select-none" />
    </div>
  );
};

export const SoccerShooterGame: React.FC<SoccerShooterGameProps> = ({
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  // Container & Canvas refs
  const containerRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport & Scaling refs
  const boardWidthRef = useRef<number>(440);
  const boardHeightRef = useRef<number>(660);
  const ballRadiusRef = useRef<number>(26);
  const ceilingOffsetRef = useRef<number>(14);
  const launcherPosRef = useRef<{ x: number; y: number }>({ x: 220, y: 580 });

  // Game Progress State
  const [progress, setProgress] = useState<SoccerProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {
      highestUnlockedLevel: 1,
      completedLevels: {},
      totalScore: 0,
    };
  });

  // Active Game State
  const [currentLevelNum, setCurrentLevelNum] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [fouls, setFouls] = useState<number>(0);
  const [maxFouls, setMaxFouls] = useState<number>(5);
  const [gameState, setGameState] = useState<SoccerGameState>('READY');
  const [isMuted, setIsMuted] = useState<boolean>(!isAudioEnabled);
  const [showPauseModal, setShowPauseModal] = useState<boolean>(false);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);

  // Ball Launcher State
  const [currentBallColor, setCurrentBallColor] = useState<SoccerTeamColor>('BRAZIL');
  const [nextBallColor, setNextBallColor] = useState<SoccerTeamColor>('ARGENTINA');

  // Input Aiming state
  const isAimingRef = useRef<boolean>(false);
  const aimAngleRef = useRef<number>(-Math.PI / 2);
  const trajectoryRef = useRef<TrajectoryPath>({ points: [], reflectionPoint: null });

  // Active Game Simulation objects
  const gridRef = useRef<(GridBall | null)[][]>([]);
  const projectileRef = useRef<ProjectileBall | null>(null);
  const fallingBallsRef = useRef<FallingBall[]>([]);
  const particlesRef = useRef<SoccerParticle[]>([]);
  const floatingScoresRef = useRef<FloatingScore[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const netWiggleRef = useRef<number>(0);

  // Sync Audio Mute
  useEffect(() => {
    soccerAudio.setMuted(isMuted);
  }, [isMuted]);

  // Clean up any looping ambience on unmount
  useEffect(() => {
    return () => {
      soccerAudio.stopStadiumAmbience();
      soccerAudio.stopAll();
    };
  }, []);

  // Start stadium background ambient sound on first user touch/click
  const handleUserInteracted = useCallback(() => {
    soccerAudio.startStadiumAmbience();
  }, []);

  // Save progress helper
  const saveProgress = useCallback((newProgress: SoccerProgress) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(newProgress));
    } catch {
      // Ignore
    }
  }, []);

  /**
   * Generates a random color from current level's available palette
   */
  const getRandomLevelColor = useCallback((levelNum: number): SoccerTeamColor => {
    const config = SOCCER_LEVELS[levelNum - 1] || SOCCER_LEVELS[0];
    const colors = config.availableColors;
    // 5% chance of Special Champion Gold ball in levels 5+
    if (levelNum >= 5 && Math.random() < 0.06) {
      return 'SPECIAL_GOLD';
    }
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  /**
   * Initializes or loads a level
   */
  const initLevel = useCallback(
    (levelNum: number) => {
      const config = SOCCER_LEVELS[levelNum - 1] || SOCCER_LEVELS[0];
      setCurrentLevelNum(levelNum);
      setMaxFouls(config.maxFouls);
      setFouls(0);
      setCombo(0);
      setShowWinModal(false);
      setShowGameOverModal(false);
      setShowPauseModal(false);
      setGameState('READY');

      const radius = ballRadiusRef.current;
      const ceilingOffset = ceilingOffsetRef.current;

      // Initialize grid from level config
      const newGrid: (GridBall | null)[][] = [];
      for (let r = 0; r < MAX_GRID_ROWS; r++) {
        const rowData = config.rows[r];
        const colsCount = getColsInRow(r);
        const rowArray: (GridBall | null)[] = [];

        for (let c = 0; c < colsCount; c++) {
          const color = rowData?.[c];
          if (color) {
            const { x, y } = getBallCenter(r, c, radius, ceilingOffset);
            rowArray.push({
              id: `b_${r}_${c}_${Date.now()}`,
              color,
              row: r,
              col: c,
              x,
              y,
              radius,
            });
          } else {
            rowArray.push(null);
          }
        }
        newGrid.push(rowArray);
      }

      gridRef.current = newGrid;
      projectileRef.current = null;
      fallingBallsRef.current = [];
      particlesRef.current = [];
      floatingScoresRef.current = [];

      // Initialize launcher balls
      setCurrentBallColor(getRandomLevelColor(levelNum));
      setNextBallColor(getRandomLevelColor(levelNum));

      // Reset aiming trajectory straight up
      aimAngleRef.current = -Math.PI / 2;
      trajectoryRef.current = calculateTrajectory(
        launcherPosRef.current.x,
        launcherPosRef.current.y,
        -Math.PI / 2,
        newGrid,
        boardWidthRef.current,
        radius,
        ceilingOffset
      );
    },
    [getRandomLevelColor]
  );

  /**
   * Swaps current ball with next preview ball
   */
  const handleSwapBalls = useCallback(() => {
    if (gameState !== 'READY' && gameState !== 'AIMING') return;
    soccerAudio.playSnap();
    setCurrentBallColor((prevCurr) => {
      const next = nextBallColor;
      setNextBallColor(prevCurr);
      return next;
    });
  }, [gameState, nextBallColor]);

  /**
   * Responsive Viewport & Dimension Calculator
   * Calculates exact pixel metrics for Android phone, tablet, and desktop viewports
   */
  const updateDimensions = useCallback(() => {
    if (!arenaRef.current || !canvasRef.current) return;

    const arenaRect = arenaRef.current.getBoundingClientRect();
    const availableWidth = arenaRect.width;
    const availableHeight = arenaRect.height;

    // Cap maximum game width to 480px on desktop/tablets while maintaining clean aspect ratio
    const width = Math.min(availableWidth, 480);
    const height = availableHeight;

    boardWidthRef.current = width;
    boardHeightRef.current = height;

    // Calculate responsive ball radius based on 8 even columns
    // width = (radius + col * 2 * radius) + radius = radius * 2 * 8 = 16 * radius
    const calculatedRadius = Math.floor(width / (COLS_EVEN * 2));
    // Ensure minimum diameter for clear visibility on Android
    const radius = Math.max(18, Math.min(calculatedRadius, 30));
    ballRadiusRef.current = radius;

    // Safe ceiling offset below the HUD
    const safeCeilingGap = Math.max(14, Math.floor(height * 0.022));
    ceilingOffsetRef.current = safeCeilingGap;

    // Position launcher on the penalty spot in lower arena with safe bottom margin
    const launcherBottomMargin = Math.max(76, radius * 2.8 + 24);
    launcherPosRef.current = {
      x: width / 2,
      y: height - launcherBottomMargin,
    };

    // Update canvas resolution (with DPR for ultra-sharp rendering on Retina/OLED)
    const canvas = canvasRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    // Recalculate existing ball coordinates to snap with new dimensions
    const grid = gridRef.current;
    for (let r = 0; r < grid.length; r++) {
      const cols = getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const b = grid[r]?.[c];
        if (b) {
          const { x, y } = getBallCenter(r, c, radius, safeCeilingGap);
          b.x = x;
          b.y = y;
          b.radius = radius;
        }
      }
    }
  }, []);

  // Setup Resize & Viewport Observers
  useEffect(() => {
    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (arenaRef.current) {
      resizeObserver.observe(arenaRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateDimensions);
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateDimensions);
      }
    };
  }, [updateDimensions]);

  // Load Level 1 on mount
  useEffect(() => {
    initLevel(1);
  }, [initLevel]);

  /**
   * Adds a new row of soccer balls from the ceiling when fouls reach threshold
   */
  const addPenaltyRow = useCallback(() => {
    soccerAudio.playRefereeWhistle();
    const radius = ballRadiusRef.current;
    const ceilingOffset = ceilingOffsetRef.current;
    const grid = gridRef.current;

    // Shift all rows down by 1
    const newGrid: (GridBall | null)[][] = [];

    // Create fresh top row with random level colors
    const row0: (GridBall | null)[] = [];
    const cols0 = getColsInRow(0);
    for (let c = 0; c < cols0; c++) {
      const { x, y } = getBallCenter(0, c, radius, ceilingOffset);
      row0.push({
        id: `pen_0_${c}_${Date.now()}`,
        color: getRandomLevelColor(currentLevelNum),
        row: 0,
        col: c,
        x,
        y,
        radius,
      });
    }
    newGrid.push(row0);

    // Push existing rows down
    for (let r = 0; r < MAX_GRID_ROWS - 1; r++) {
      const targetRowIdx = r + 1;
      const targetCols = getColsInRow(targetRowIdx);
      const existingRow = grid[r] || [];
      const newRow: (GridBall | null)[] = [];

      for (let c = 0; c < targetCols; c++) {
        const b = existingRow[c];
        if (b) {
          const { x, y } = getBallCenter(targetRowIdx, c, radius, ceilingOffset);
          newRow.push({
            ...b,
            row: targetRowIdx,
            col: c,
            x,
            y,
          });
        } else {
          newRow.push(null);
        }
      }
      newGrid.push(newRow);
    }

    gridRef.current = newGrid;
    setFouls(0);

    // Check if any ball crossed danger line
    for (let r = DANGER_ROW_INDEX; r < newGrid.length; r++) {
      const rowCols = getColsInRow(r);
      for (let c = 0; c < rowCols; c++) {
        if (newGrid[r]?.[c]) {
          // Game Over condition!
          soccerAudio.playGameOver();
          setGameState('GAME_OVER');
          setShowGameOverModal(true);
          onGameOver(score);
          return;
        }
      }
    }
  }, [currentLevelNum, getRandomLevelColor, onGameOver, score]);

  /**
   * Resolves matches, cluster detachment, and scoring after projectile lands
   */
  const resolveLandedProjectile = useCallback(
    (landedRow: number, landedCol: number) => {
      const grid = gridRef.current;
      const cluster = findMatchingCluster(landedRow, landedCol, grid);

      if (cluster.length >= 3) {
        // MATCH MADE!
        const matchCount = cluster.length;
        const currentCombo = combo + 1;
        setCombo(currentCombo);
        soccerAudio.playMatchPop(Math.min(currentCombo, 5));

        // Spawn pop particles & remove matched balls
        let matchScore = matchCount * 30 * currentCombo;
        for (const b of cluster) {
          grid[b.row][b.col] = null;

          // Spawn sparkling fragments
          for (let i = 0; i < 7; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4.5;
            particlesRef.current.push({
              x: b.x,
              y: b.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              radius: 2 + Math.random() * 3,
              color: '#F8FAFC',
              alpha: 1,
              decay: 0.035 + Math.random() * 0.02,
              shape: 'spark',
            });
          }
        }

        // Floating match score popup
        const centerBall = cluster[0];
        floatingScoresRef.current.push({
          id: `sc_${Date.now()}`,
          text: `+${matchScore}`,
          x: centerBall.x,
          y: centerBall.y - 12,
          alpha: 1,
          color: '#38BDF8',
          fontSize: 18,
        });

        // Check for unsupported floating balls that now must fall
        const floating = findFloatingBalls(grid);
        if (floating.length > 0) {
          // Detach floating balls and add to falling animation queue
          for (const fb of floating) {
            grid[fb.row][fb.col] = null;
            const vx = (Math.random() - 0.5) * 4;
            const vy = -1 - Math.random() * 3; // slight upward bounce before falling
            fallingBallsRef.current.push({
              id: `fall_${fb.id}`,
              x: fb.x,
              y: fb.y,
              vx,
              vy,
              rotation: 0,
              vRot: (Math.random() - 0.5) * 0.15,
              radius: fb.radius,
              color: fb.color,
            });
          }
        }

        setScore((prev) => prev + matchScore);

        // Check if level is completely cleared!
        let remainingBalls = 0;
        for (let r = 0; r < grid.length; r++) {
          const cols = getColsInRow(r);
          for (let c = 0; c < cols; c++) {
            if (grid[r]?.[c]) remainingBalls++;
          }
        }

        if (remainingBalls === 0) {
          // LEVEL COMPLETE!
          soccerAudio.playLevelWin();
          setGameState('LEVEL_COMPLETE');
          setShowWinModal(true);

          // Calculate 1 to 3 stars based on target score
          const finalScore = score + matchScore;
          const config = SOCCER_LEVELS[currentLevelNum - 1];
          const stars = finalScore >= config.targetScore ? 3 : finalScore >= config.targetScore * 0.7 ? 2 : 1;

          // Unlock next level up to 40
          saveProgress({
            highestUnlockedLevel: Math.min(40, Math.max(progress.highestUnlockedLevel, currentLevelNum + 1)),
            completedLevels: {
              ...progress.completedLevels,
              [currentLevelNum]: {
                level: currentLevelNum,
                unlocked: true,
                completed: true,
                stars,
                bestScore: Math.max(progress.completedLevels[currentLevelNum]?.bestScore || 0, finalScore),
                shotsUsed: 0,
              },
            },
            totalScore: progress.totalScore + finalScore,
          });
          return;
        }
      } else {
        // NO MATCH -> FOUL!
        setCombo(0);
        const newFouls = fouls + 1;
        setFouls(newFouls);

        if (newFouls >= maxFouls) {
          // Fouls exceeded! Trigger penalty row descent
          addPenaltyRow();
        } else {
          soccerAudio.playSnap();
        }
      }

      // Check danger boundary
      for (let r = DANGER_ROW_INDEX; r < grid.length; r++) {
        const rowCols = getColsInRow(r);
        for (let c = 0; c < rowCols; c++) {
          if (grid[r]?.[c]) {
            soccerAudio.playGameOver();
            setGameState('GAME_OVER');
            setShowGameOverModal(true);
            onGameOver(score);
            return;
          }
        }
      }

      // Advance launcher balls
      setCurrentBallColor(nextBallColor);
      setNextBallColor(getRandomLevelColor(currentLevelNum));
      setGameState('READY');
    },
    [
      addPenaltyRow,
      combo,
      currentLevelNum,
      fouls,
      getRandomLevelColor,
      maxFouls,
      nextBallColor,
      onGameOver,
      progress,
      saveProgress,
      score,
    ]
  );

  /**
   * Shoot Current Ball
   */
  const handleShootBall = useCallback(() => {
    if (gameState !== 'READY' && gameState !== 'AIMING') return;
    if (projectileRef.current) return; // Prevent double projectile

    const angle = aimAngleRef.current;
    // Don't allow shooting downwards
    if (angle > -0.08 || angle < -Math.PI + 0.08) return;

    const launcher = launcherPosRef.current;
    const speed = 18; // Fast, responsive soccer ball velocity
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    projectileRef.current = {
      x: launcher.x,
      y: launcher.y,
      vx,
      vy,
      radius: ballRadiusRef.current,
      color: currentBallColor,
    };

    soccerAudio.playKick();
    setGameState('SHOOTING');
  }, [currentBallColor, gameState]);

  /**
   * Aiming Input Event Handlers
   */
  const handlePointerDown = (e: React.PointerEvent) => {
    handleUserInteracted();
    if (gameState !== 'READY' && gameState !== 'AIMING') return;

    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;

    isAimingRef.current = true;
    setGameState('AIMING');

    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;

    const launcher = launcherPosRef.current;
    const dx = pointerX - launcher.x;
    const dy = pointerY - launcher.y;

    // Constrain angle to upper hemisphere
    let angle = Math.atan2(dy, dx);
    angle = Math.max(-Math.PI + 0.12, Math.min(-0.12, angle));
    aimAngleRef.current = angle;

    trajectoryRef.current = calculateTrajectory(
      launcher.x,
      launcher.y,
      angle,
      gridRef.current,
      boardWidthRef.current,
      ballRadiusRef.current,
      ceilingOffsetRef.current
    );
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isAimingRef.current) return;

    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;

    const launcher = launcherPosRef.current;
    const dx = pointerX - launcher.x;
    const dy = pointerY - launcher.y;

    let angle = Math.atan2(dy, dx);
    angle = Math.max(-Math.PI + 0.12, Math.min(-0.12, angle));
    aimAngleRef.current = angle;

    trajectoryRef.current = calculateTrajectory(
      launcher.x,
      launcher.y,
      angle,
      gridRef.current,
      boardWidthRef.current,
      ballRadiusRef.current,
      ceilingOffsetRef.current
    );
  };

  const handlePointerUp = () => {
    if (!isAimingRef.current) return;
    isAimingRef.current = false;
    handleShootBall();
  };

  /**
   * Main 60 FPS Render & Physics Loop
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const width = boardWidthRef.current;
      const height = boardHeightRef.current;
      const radius = ballRadiusRef.current;
      const ceilingOffset = ceilingOffsetRef.current;

      // 1. Clear Canvas with Stadium Background
      ctx.clearRect(0, 0, width, height);

      // Draw Atmospheric Stadium Turf & Floodlight Sky
      drawStadiumEnvironment(ctx, width, height, ceilingOffset);

      // Draw Danger Warning Line at Row 10
      const dangerRowY = radius + DANGER_ROW_INDEX * (radius * Math.sqrt(3)) + ceilingOffset;
      ctx.save();
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, dangerRowY);
      ctx.lineTo(width - 8, dangerRowY);
      ctx.stroke();

      // "DANGER ZONE" badge
      ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.font = '10px monospace';
      ctx.fillText('GOAL DEFENSE LINE', 14, dangerRowY - 6);
      ctx.restore();

      // 2. Render Suspended Grid Balls
      const grid = gridRef.current;
      for (let r = 0; r < grid.length; r++) {
        const cols = getColsInRow(r);
        for (let c = 0; c < cols; c++) {
          const b = grid[r]?.[c];
          if (b) {
            renderSoccerBall(ctx, b.x, b.y, b.radius, b.color);
          }
        }
      }

      // 3. Render Aiming Laser Trajectory
      if (
        (gameState === 'READY' || gameState === 'AIMING') &&
        trajectoryRef.current.points.length > 1
      ) {
        drawAimingTrajectory(ctx, trajectoryRef.current);
      }

      // 4. Update & Render Projectile
      const proj = projectileRef.current;
      if (proj) {
        // Multi-substep physics for collision accuracy
        const subSteps = 3;
        const subVx = proj.vx / subSteps;
        const subVy = proj.vy / subSteps;
        let landed = false;

        for (let s = 0; s < subSteps; s++) {
          proj.x += subVx;
          proj.y += subVy;

          // Wall bounce
          if (proj.x <= proj.radius) {
            proj.x = proj.radius;
            proj.vx = -proj.vx;
            soccerAudio.playBounce();
          } else if (proj.x >= width - proj.radius) {
            proj.x = width - proj.radius;
            proj.vx = -proj.vx;
            soccerAudio.playBounce();
          }

          // Ceiling collision
          if (proj.y <= proj.radius + ceilingOffset + 2) {
            landed = true;
            break;
          }

          // Ball collision
          for (let r = 0; r < grid.length; r++) {
            const cols = getColsInRow(r);
            for (let c = 0; c < cols; c++) {
              const b = grid[r]?.[c];
              if (!b) continue;

              const dx = proj.x - b.x;
              const dy = proj.y - b.y;
              const distSq = dx * dx + dy * dy;
              const hitRadius = radius * 1.8;

              if (distSq <= hitRadius * hitRadius) {
                landed = true;
                break;
              }
            }
            if (landed) break;
          }
          if (landed) break;
        }

        if (landed) {
          // Snap projectile to grid
          const snap = findSnapCell(proj.x, proj.y, grid, radius, ceilingOffset);
          if (snap) {
            const { x: cx, y: cy } = getBallCenter(snap.row, snap.col, radius, ceilingOffset);
            grid[snap.row][snap.col] = {
              id: `b_${snap.row}_${snap.col}_${Date.now()}`,
              color: proj.color,
              row: snap.row,
              col: snap.col,
              x: cx,
              y: cy,
              radius,
            };
            projectileRef.current = null;
            resolveLandedProjectile(snap.row, snap.col);
          } else {
            // Edge case: snap directly below ceiling
            grid[0][0] = {
              id: `b_0_0_${Date.now()}`,
              color: proj.color,
              row: 0,
              col: 0,
              x: radius,
              y: radius + ceilingOffset,
              radius,
            };
            projectileRef.current = null;
            resolveLandedProjectile(0, 0);
          }
        } else {
          // Draw projectile with subtle motion blur
          renderSoccerBall(ctx, proj.x, proj.y, proj.radius, proj.color);
        }
      }

      // 5. Update & Render Falling Balls (Location-based scoring)
      const falling = fallingBallsRef.current;
      for (let i = falling.length - 1; i >= 0; i--) {
        const fb = falling[i];
        fb.vy += 22 * dt; // Gravity
        fb.x += fb.vx;
        fb.y += fb.vy;
        fb.rotation += fb.vRot;

        // Render falling rotating soccer ball
        renderSoccerBall(ctx, fb.x, fb.y, fb.radius, fb.color, fb.rotation);

        // Check if ball reached lower goal area
        if (fb.y >= height - 30 && !fb.scoreAwarded) {
          fb.scoreAwarded = true;
          // Location-based falling score:
          // Center goal area = 250 PTS, Mid area = 100 PTS, Edge = 50 PTS
          const midX = width / 2;
          const distFromCenter = Math.abs(fb.x - midX);
          let points = 50;
          let isGoal = false;

          if (distFromCenter < width * 0.22) {
            points = 250;
            isGoal = true;
            netWiggleRef.current = 1.0;
          } else if (distFromCenter < width * 0.4) {
            points = 100;
            netWiggleRef.current = 0.5;
          }

          setScore((s) => s + points);
          soccerAudio.playGoalScore(isGoal);

          floatingScoresRef.current.push({
            id: `goal_${Date.now()}_${i}`,
            text: isGoal ? `GOAL! +${points}` : `+${points}`,
            x: fb.x,
            y: height - 48,
            alpha: 1,
            color: isGoal ? '#F59E0B' : '#38BDF8',
            fontSize: isGoal ? 20 : 16,
            isGoal,
          });
        }

        // Remove if off-screen
        if (fb.y > height + 60) {
          falling.splice(i, 1);
        }
      }

      // Decay goal net ripple
      if (netWiggleRef.current > 0.01) {
        netWiggleRef.current *= 0.92;
      } else {
        netWiggleRef.current = 0;
      }

      // 6. Update & Render Spark & Impact Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        if (p.shape === 'ring') {
          p.radius += 2.6;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.shape === 'star') {
          ctx.fillStyle = p.color;
          const s = p.radius;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - s);
          ctx.lineTo(p.x + s * 0.25, p.y - s * 0.25);
          ctx.lineTo(p.x + s, p.y);
          ctx.lineTo(p.x + s * 0.25, p.y + s * 0.25);
          ctx.lineTo(p.x, p.y + s);
          ctx.lineTo(p.x - s * 0.25, p.y + s * 0.25);
          ctx.lineTo(p.x - s, p.y);
          ctx.lineTo(p.x - s * 0.25, p.y - s * 0.25);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 7. Update & Render Floating Score Badges
      const floatingScores = floatingScoresRef.current;
      for (let i = floatingScores.length - 1; i >= 0; i--) {
        const fs = floatingScores[i];
        fs.y -= 35 * dt; // Float upwards
        fs.alpha -= 0.65 * dt; // Fade out

        if (fs.alpha <= 0) {
          floatingScores.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = fs.alpha;
        ctx.fillStyle = fs.color;
        ctx.font = `bold ${fs.fontSize}px 'Plus Jakarta Sans', sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fillText(fs.text, fs.x, fs.y);
        ctx.restore();
      }

      // 8. Render Bottom Launcher on Penalty Spot
      const launcher = launcherPosRef.current;
      drawLauncherHousing(ctx, launcher.x, launcher.y, radius);

      // Render Current Ball resting in Launcher with active prominence
      if (gameState === 'READY' || gameState === 'AIMING') {
        renderSoccerBall(ctx, launcher.x, launcher.y, radius, currentBallColor, 0, true);
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [currentBallColor, gameState, resolveLandedProjectile]);

  /**
   * Draws the realistic 3D stadium background:
   * Atmospheric night sky, cantilever roof trusses, floodlight gantries with volumetric light shafts,
   * 3-tier seating crowd with camera flashes, pitchside LED advertising ribbon, lush perspective turf with
   * mowing stripes, and 3D soccer goal frame with responsive net mesh.
   */
  const drawStadiumEnvironment = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    ceilingOffset: number
  ) => {
    // 1. Upper Night Sky with Deep Blue/Navy Atmosphere
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.42);
    skyGrad.addColorStop(0, '#020712');
    skyGrad.addColorStop(0.35, '#05142B');
    skyGrad.addColorStop(0.75, '#0A2246');
    skyGrad.addColorStop(1, '#0E2E5B');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.42);

    // 2. Stadium Roof Structural Cantilever Steel Trusses
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
    ctx.lineWidth = 1.5;
    // Main arch girder
    ctx.beginPath();
    ctx.moveTo(0, h * 0.05);
    ctx.quadraticCurveTo(w * 0.5, h * 0.01, w, h * 0.05);
    ctx.stroke();
    // Lower support truss
    ctx.beginPath();
    ctx.moveTo(0, h * 0.08);
    ctx.quadraticCurveTo(w * 0.5, h * 0.035, w, h * 0.08);
    ctx.stroke();
    // Cross braces
    const trussSteps = 12;
    for (let i = 0; i <= trussSteps; i++) {
      const tx = (w / trussSteps) * i;
      const ty1 = h * 0.05 - Math.sin((i / trussSteps) * Math.PI) * (h * 0.04);
      const ty2 = h * 0.08 - Math.sin((i / trussSteps) * Math.PI) * (h * 0.045);
      ctx.beginPath();
      ctx.moveTo(tx, ty1);
      ctx.lineTo(tx, ty2);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Volumetric Stadium Floodlight Beams (Angled across the field)
    ctx.save();
    // Left floodlight volumetric cone
    const leftBeam = ctx.createLinearGradient(30, 20, w * 0.8, h * 0.45);
    leftBeam.addColorStop(0, 'rgba(224, 242, 254, 0.12)');
    leftBeam.addColorStop(0.4, 'rgba(56, 189, 248, 0.06)');
    leftBeam.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = leftBeam;
    ctx.beginPath();
    ctx.moveTo(25, 20);
    ctx.lineTo(w * 0.85, h * 0.42);
    ctx.lineTo(w * 0.4, h * 0.42);
    ctx.closePath();
    ctx.fill();

    // Right floodlight volumetric cone
    const rightBeam = ctx.createLinearGradient(w - 30, 20, w * 0.2, h * 0.45);
    rightBeam.addColorStop(0, 'rgba(224, 242, 254, 0.12)');
    rightBeam.addColorStop(0.4, 'rgba(56, 189, 248, 0.06)');
    rightBeam.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = rightBeam;
    ctx.beginPath();
    ctx.moveTo(w - 25, 20);
    ctx.lineTo(w * 0.15, h * 0.42);
    ctx.lineTo(w * 0.6, h * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 4. Seating Tiers & Densely Packed Stadium Crowd
    // Tier 3: Upper Deck Stand (from h*0.09 to h*0.17)
    ctx.fillStyle = '#061324';
    ctx.fillRect(0, h * 0.09, w, h * 0.08);

    // Crowd Spectator Heads with Varied National Team Fan Shirts
    const fanShirtColors = [
      '#EF4444', // Red
      '#38BDF8', // Sky Blue
      '#FACC15', // Yellow
      '#F8FAFC', // White
      '#10B981', // Green
      '#1E3A8A', // Navy
      '#F97316', // Orange
    ];

    const timeNow = Date.now();
    for (let x = 6; x < w - 4; x += 9) {
      const rowOffset = (x % 3) * 4;
      const headY = h * 0.11 + rowOffset;
      const colorIdx = (Math.floor(x * 1.7)) % fanShirtColors.length;

      // Body / Jersey
      ctx.fillStyle = fanShirtColors[colorIdx];
      ctx.fillRect(x - 2.5, headY + 2, 5, 4);

      // Head silhouette
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.arc(x, headY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Occasional stadium camera flashbulbs
      if (Math.sin(timeNow * 0.003 + x * 0.5) > 0.985) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(x, headY - 1, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Tier 2: VIP Executive Suites & Balcony Deck (from h*0.17 to h*0.27)
    const tier2Grad = ctx.createLinearGradient(0, h * 0.17, 0, h * 0.27);
    tier2Grad.addColorStop(0, '#040C1A');
    tier2Grad.addColorStop(1, '#07152B');
    ctx.fillStyle = tier2Grad;
    ctx.fillRect(0, h * 0.17, w, h * 0.1);

    // Warm VIP Executive Suite Windows
    for (let x = 12; x < w - 16; x += 32) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.18)';
      ctx.fillRect(x, h * 0.185, 22, 10);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, h * 0.185, 22, 10);
    }

    // Tier 1: Lower Pitchside Stand (from h*0.27 to h*0.37)
    ctx.fillStyle = '#030814';
    ctx.fillRect(0, h * 0.27, w, h * 0.1);

    // Crowd silhouettes in lower stand
    for (let x = 4; x < w; x += 8) {
      const rowOffset = (x % 4) * 3;
      const headY = h * 0.29 + rowOffset;
      const colorIdx = (Math.floor(x * 2.3)) % fanShirtColors.length;

      ctx.fillStyle = fanShirtColors[colorIdx];
      ctx.fillRect(x - 2, headY + 2, 4, 3);

      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(x, headY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pitchside Security Barrier Railing
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.365);
    ctx.lineTo(w, h * 0.365);
    ctx.stroke();

    // 5. Electronic LED Perimeter Advertising Ribbon (h*0.37 to h*0.41)
    const ledGrad = ctx.createLinearGradient(0, h * 0.37, 0, h * 0.41);
    ledGrad.addColorStop(0, '#030A18');
    ledGrad.addColorStop(1, '#051124');
    ctx.fillStyle = ledGrad;
    ctx.fillRect(0, h * 0.37, w, h * 0.04);

    // Glowing Neon Digital Text on LED Board
    ctx.save();
    ctx.font = "bold 9px 'Plus Jakarta Sans', monospace";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38BDF8';
    ctx.shadowColor = '#0284C7';
    ctx.shadowBlur = 6;
    ctx.fillText('★ CHAMPIONS LEAGUE • STRIKER PRO 3D • WORLD CUP ★', w * 0.5, h * 0.395);
    ctx.restore();

    // LED Board top/bottom glowing chrome borders
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.fillRect(0, h * 0.37, w, 1);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.fillRect(0, h * 0.41, w, 1.5);

    // 6. Dual Floodlight Tower Gantry Batteries (Top Corners)
    // Left Floodlight Tower
    ctx.save();
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(10, 8, 38, 22);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 8, 38, 22);
    // Halogen bulbs matrix (4x2)
    for (let bx = 15; bx <= 42; bx += 9) {
      for (let by = 13; by <= 23; by += 10) {
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 10;
        ctx.fill();
      }
    }
    // Floodlight radial glow halo
    const floodLeftGlow = ctx.createRadialGradient(28, 18, 5, 28, 18, 90);
    floodLeftGlow.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    floodLeftGlow.addColorStop(0.4, 'rgba(56, 189, 248, 0.16)');
    floodLeftGlow.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = floodLeftGlow;
    ctx.fillRect(0, 0, 140, 110);
    ctx.restore();

    // Right Floodlight Tower
    ctx.save();
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(w - 48, 8, 38, 22);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w - 48, 8, 38, 22);
    // Halogen bulbs matrix (4x2)
    for (let bx = w - 43; bx <= w - 16; bx += 9) {
      for (let by = 13; by <= 23; by += 10) {
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 10;
        ctx.fill();
      }
    }
    // Floodlight radial glow halo
    const floodRightGlow = ctx.createRadialGradient(w - 28, 18, 5, w - 28, 18, 90);
    floodRightGlow.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    floodRightGlow.addColorStop(0.4, 'rgba(56, 189, 248, 0.16)');
    floodRightGlow.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = floodRightGlow;
    ctx.fillRect(w - 140, 0, 140, 110);
    ctx.restore();

    // 7. Foreground Football Pitch Grass Turf (from h*0.41 to h)
    const turfGrad = ctx.createLinearGradient(0, h * 0.41, 0, h);
    turfGrad.addColorStop(0, '#022C22'); // Deep pitch horizon green
    turfGrad.addColorStop(0.25, '#064E3B');
    turfGrad.addColorStop(0.65, '#047857'); // Emerald green
    turfGrad.addColorStop(1, '#065F46');
    ctx.fillStyle = turfGrad;
    ctx.fillRect(0, h * 0.41, w, h * 0.59);

    // Perspective Alternating Lawn Mowing Stripes
    const stripeBaseH = 18;
    for (let y = h * 0.41; y < h; y += stripeBaseH * 2) {
      const progress = (y - h * 0.41) / (h * 0.59);
      const stripeH = stripeBaseH * (0.8 + progress * 0.6);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(0, y, w, stripeH);
    }

    // 8. Crisp Pitch Chalk Markings
    ctx.save();
    // 18-yard Penalty Area Box
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.lineWidth = 2.5;
    const penLeft = w * 0.08;
    const penRight = w * 0.92;
    const penTop = h * 0.58;
    ctx.strokeRect(penLeft, penTop, penRight - penLeft, h - penTop + 10);

    // 6-yard Goal Box
    const goalBoxLeft = w * 0.22;
    const goalBoxRight = w * 0.78;
    const goalBoxTop = h * 0.72;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.strokeRect(goalBoxLeft, goalBoxTop, goalBoxRight - goalBoxLeft, h - goalBoxTop + 10);

    // Penalty Arc D-Curve
    ctx.beginPath();
    ctx.arc(w * 0.5, penTop, w * 0.22, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();

    // Penalty Spot Circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.81, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 9. Integrated 3D Professional Soccer Goal with Dynamic Mesh Net
    const goalTop = h * 0.52;
    const goalBottom = h * 0.77;
    const goalLeft = w * 0.16;
    const goalRight = w * 0.84;
    const goalWidth = goalRight - goalLeft;

    ctx.save();

    // Dynamic Net Mesh Pattern (Reacts when balls drop into goal!)
    const netWiggle = netWiggleRef.current;
    const netStep = 11;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.2;

    // Diagonal forward weave
    for (let x = goalLeft; x <= goalRight; x += netStep) {
      const wave = Math.sin((x / netStep) + timeNow * 0.015) * 5 * netWiggle;
      ctx.beginPath();
      ctx.moveTo(x + wave, goalTop);
      ctx.lineTo(x + (goalBottom - goalTop) * 0.32 - wave, goalBottom);
      ctx.stroke();
    }
    // Diagonal backward weave
    for (let x = goalRight; x >= goalLeft; x -= netStep) {
      const wave = Math.cos((x / netStep) + timeNow * 0.015) * 5 * netWiggle;
      ctx.beginPath();
      ctx.moveTo(x - wave, goalTop);
      ctx.lineTo(x - (goalBottom - goalTop) * 0.32 + wave, goalBottom);
      ctx.stroke();
    }

    // Rear depth shadow inside the goal pocket
    const netShadow = ctx.createLinearGradient(0, goalTop, 0, goalBottom);
    netShadow.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
    netShadow.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
    ctx.fillStyle = netShadow;
    ctx.fillRect(goalLeft, goalTop, goalWidth, goalBottom - goalTop);

    // 3D White Steel Goalposts & Crossbar
    // Drop shadow under crossbar
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(goalLeft, goalTop + 4);
    ctx.lineTo(goalRight, goalTop + 4);
    ctx.stroke();

    // Goal Frame Metallic White Posts
    const postGrad = ctx.createLinearGradient(goalLeft, 0, goalLeft + 6, 0);
    postGrad.addColorStop(0, '#94A3B8');
    postGrad.addColorStop(0.4, '#FFFFFF');
    postGrad.addColorStop(1, '#CBD5E1');

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    // Left upright post
    ctx.moveTo(goalLeft, goalBottom);
    ctx.lineTo(goalLeft, goalTop);
    // Horizontal crossbar
    ctx.lineTo(goalRight, goalTop);
    // Right upright post
    ctx.lineTo(goalRight, goalBottom);
    ctx.stroke();

    // Goal Post Specular Metallic Highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(goalLeft - 1, goalBottom);
    ctx.lineTo(goalLeft - 1, goalTop - 1);
    ctx.lineTo(goalRight + 1, goalTop - 1);
    ctx.lineTo(goalRight + 1, goalBottom);
    ctx.stroke();
    ctx.restore();

    // 10. Subtle Playfield Contrast Vignette (Guarantees crisp bubble grid visibility)
    const playfieldVignette = ctx.createLinearGradient(0, 0, 0, h * 0.52);
    playfieldVignette.addColorStop(0, 'rgba(2, 6, 23, 0.55)');
    playfieldVignette.addColorStop(0.8, 'rgba(2, 6, 23, 0.35)');
    playfieldVignette.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = playfieldVignette;
    ctx.fillRect(0, 0, w, h * 0.52);

    // 11. Top Ceiling Anchor Bar with Cyan LED Track
    ctx.save();
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, ceilingOffset - 4, w, 7);
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(0, ceilingOffset + 3, w, 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.fillRect(0, ceilingOffset + 5, w, 3);
    ctx.restore();
  };

  /**
   * Draws the dotted laser trajectory guide with reflection indication
   */
  const drawAimingTrajectory = (ctx: CanvasRenderingContext2D, traj: TrajectoryPath) => {
    ctx.save();

    // Dotted guide trajectory
    for (let i = 1; i < traj.points.length; i++) {
      const p = traj.points[i];
      const alpha = Math.max(0.2, 1 - (i / traj.points.length) * 0.6);

      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.fill();

      // Core white center
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 1.2})`;
      ctx.fill();
    }

    // Wall Reflection Ring Indicator
    if (traj.reflectionPoint) {
      const rp = traj.reflectionPoint;
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, 7, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  };

  /**
   * Draws the 3D metallic soccer launcher on the penalty spot
   */
  const drawLauncherHousing = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number
  ) => {
    ctx.save();

    // White Chalk Penalty Spot
    ctx.beginPath();
    ctx.ellipse(cx, cy + radius * 0.65, radius * 1.3, radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fill();

    // 3D Metallic Base Ring
    const baseGrad = ctx.createLinearGradient(cx - radius * 1.3, cy, cx + radius * 1.3, cy);
    baseGrad.addColorStop(0, '#0F172A');
    baseGrad.addColorStop(0.5, '#334155');
    baseGrad.addColorStop(1, '#0F172A');

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.22, 0, Math.PI * 2);
    ctx.fillStyle = baseGrad;
    ctx.fill();

    // Inner Glowing Cyan Ring
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
    ctx.stroke();

    // Aiming directional arrow on the launcher rim
    const angle = aimAngleRef.current;
    const arrowX = cx + Math.cos(angle) * (radius * 1.45);
    const arrowY = cy + Math.sin(angle) * (radius * 1.45);

    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(arrowX, arrowY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] flex flex-col justify-between items-center bg-[#061325] select-none touch-none overscroll-none overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* ============================================================ */}
      {/* 1. TOP SPORTS HUD (LEVEL, SCORE, SOUND, PAUSE)              */}
      {/* ============================================================ */}
      <header
        ref={hudRef}
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)',
        }}
        className="w-full max-w-[480px] px-3.5 pb-2 flex items-center justify-between z-30 shrink-0 select-none"
      >
        {/* Left Side: Exit Button & Level Selector Pill */}
        <div className="flex items-center gap-2">
          <button
            id="soccer-exit-btn"
            onClick={onExit}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/15 text-white/85 hover:text-white hover:bg-slate-800 active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer"
            aria-label="Exit Game"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            id="soccer-level-btn"
            onClick={() => setShowLevelSelect(true)}
            className="h-12 px-3.5 flex items-center gap-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-amber-500/35 text-white active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer hover:bg-slate-800"
            aria-label="Select Level"
          >
            <Trophy className="w-4 h-4 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
            <span className="text-xs font-black tracking-wider text-amber-300">
              LVL {currentLevelNum}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          </button>
        </div>

        {/* Center: High-Contrast Elevated Score Container */}
        <div
          id="soccer-score-box"
          className="h-12 px-4 flex flex-col items-center justify-center rounded-2xl bg-slate-900/90 backdrop-blur-md border border-sky-500/35 shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] min-w-[124px]"
        >
          <span className="text-[9px] font-black uppercase tracking-widest text-sky-400 leading-none drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]">
            SCORE
          </span>
          <span className="text-lg font-black text-white font-mono leading-none tracking-tight mt-0.5">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Right Side: Sound & Pause Controls */}
        <div className="flex items-center gap-2">
          <button
            id="soccer-sound-btn"
            onClick={() => setIsMuted((m) => !m)}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl border active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer ${
              isMuted
                ? 'bg-rose-950/80 border-rose-500/35 text-rose-400'
                : 'bg-slate-900/90 backdrop-blur-md border-white/15 text-white/90 hover:bg-slate-800'
            }`}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            id="soccer-pause-btn"
            onClick={() => {
              setGameState('PAUSED');
              setShowPauseModal(true);
            }}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/15 text-white/90 hover:bg-slate-800 active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer"
            aria-label="Pause Game"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN GAMEPLAY ARENA CANVAS                                */}
      {/* ============================================================ */}
      <main
        ref={arenaRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full flex-1 flex flex-col justify-center items-center overflow-hidden cursor-crosshair touch-none"
      >
        <canvas ref={canvasRef} className="block select-none touch-none" />

        {/* Combo Multiplier Badge */}
        {combo > 1 && (
          <div className="absolute top-2 left-4 z-20 pointer-events-none animate-bounce">
            <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs tracking-wider shadow-lg flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              COMBO x{combo}
            </span>
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* 3. BOTTOM CONTROLS & FOUL INDICATOR TRAY                    */}
      {/* ============================================================ */}
      <footer
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
        }}
        className="w-full max-w-[480px] px-4 pt-1 z-30 shrink-0 flex items-center justify-between"
      >
        {/* Next Ball 3D Preview & Quick Swap Button */}
        <div className="flex items-center gap-2">
          <button
            id="soccer-swap-btn"
            onClick={handleSwapBalls}
            className="h-12 px-3.5 flex items-center gap-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-sky-500/35 text-white active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer hover:bg-slate-800"
            title="Swap with Next Ball"
          >
            <ArrowUpDown className="w-4 h-4 text-sky-400" />
            <div className="flex flex-col text-left mr-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">NEXT</span>
              <span className="text-xs font-black text-sky-300 leading-none mt-1">SWAP</span>
            </div>
            {/* 3D Soccer Ball Canvas Preview */}
            <NextBallCanvas color={nextBallColor} />
          </button>
        </div>

        {/* White Penalty Foul Balls Tray */}
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
            PENALTY FOULS
          </span>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/15 shadow-inner">
            {Array.from({ length: maxFouls }).map((_, idx) => {
              const remaining = maxFouls - fouls;
              const hasBall = idx < remaining;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-300 relative flex items-center justify-center ${
                    hasBall
                      ? 'bg-gradient-to-br from-white via-slate-100 to-slate-400 shadow-[0_2px_6px_rgba(255,255,255,0.6),inset_0_-1px_2px_rgba(0,0,0,0.4)] border border-slate-300 scale-100'
                      : 'bg-slate-950/80 border border-rose-500/30 scale-85 opacity-50 shadow-inner'
                  }`}
                  title={hasBall ? 'Remaining Foul allowance' : 'Foul Committed'}
                >
                  {hasBall ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800/70" />
                  ) : (
                    <span className="text-[8px] font-black text-rose-500 leading-none">✕</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* 4. MODALS: PAUSE, LEVEL COMPLETE, GAME OVER, LEVEL SELECT   */}
      {/* ============================================================ */}

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 flex flex-col items-center text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
              <Pause className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">Match Paused</h2>
            <p className="text-xs text-slate-400 mb-6">
              Level {currentLevelNum} • Current Score: {score.toLocaleString()}
            </p>

            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setShowPauseModal(false);
                  setGameState('READY');
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Resume Match
              </button>

              <button
                onClick={() => {
                  initLevel(currentLevelNum);
                }}
                className="w-full py-3.5 rounded-2xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
              >
                <RotateCcw className="w-4 h-4" />
                Restart Level
              </button>

              <button
                onClick={() => {
                  setShowPauseModal(false);
                  setShowLevelSelect(true);
                }}
                className="w-full py-3.5 rounded-2xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
              >
                <Layers className="w-4 h-4" />
                Select Level (1 - 40)
              </button>

              <button
                onClick={onExit}
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-rose-400 font-bold text-sm hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-500/20"
              >
                <ArrowLeft className="w-4 h-4" />
                Exit to Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Complete Modal */}
      {showWinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/30 p-6 flex flex-col items-center text-center shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Trophy className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-black text-white">Level Complete!</h2>
            <p className="text-xs text-amber-400/80 mb-4 font-bold">
              Level {currentLevelNum}: {SOCCER_LEVELS[currentLevelNum - 1]?.title}
            </p>

            {/* Stars */}
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3].map((starIdx) => (
                <Star
                  key={starIdx}
                  className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                />
              ))}
            </div>

            {/* Score Summary */}
            <div className="w-full bg-slate-950/70 border border-white/10 rounded-2xl p-3 mb-5 flex justify-around items-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">SCORE</span>
                <span className="text-lg font-black text-white font-mono">{score.toLocaleString()}</span>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">BEST</span>
                <span className="text-lg font-black text-amber-400 font-mono">
                  {Math.max(
                    score,
                    progress.completedLevels[currentLevelNum]?.bestScore || 0
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2.5">
              {currentLevelNum < 40 ? (
                <button
                  onClick={() => {
                    initLevel(currentLevelNum + 1);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Next Level</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              ) : (
                <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-bold mb-2">
                  🏆 WORLD CUP CHAMPION! You conquered all 40 Tournament Levels!
                </div>
              )}

              <button
                onClick={() => {
                  initLevel(currentLevelNum);
                }}
                className="w-full py-3 rounded-2xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
              >
                <RotateCcw className="w-4 h-4" />
                Replay Level
              </button>

              <button
                onClick={onExit}
                className="w-full py-3 rounded-2xl bg-slate-900 text-slate-400 font-bold text-xs hover:text-white active:scale-95 transition-all cursor-pointer"
              >
                Exit to Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {showGameOverModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-rose-500/30 p-6 flex flex-col items-center text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <RotateCcw className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">Defense Breached!</h2>
            <p className="text-xs text-rose-400/90 mb-4 font-bold">
              Soccer balls crossed the penalty line
            </p>

            <div className="w-full bg-slate-950/70 border border-white/10 rounded-2xl p-3 mb-5 flex justify-around items-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">FINAL SCORE</span>
                <span className="text-lg font-black text-white font-mono">{score.toLocaleString()}</span>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">LEVEL</span>
                <span className="text-lg font-black text-sky-400 font-mono">{currentLevelNum} / 40</span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={() => {
                  initLevel(currentLevelNum);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Match
              </button>

              <button
                onClick={onExit}
                className="w-full py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 active:scale-95 transition-all cursor-pointer border border-white/10"
              >
                Exit to Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Select 40-Stage Grid Modal */}
      {showLevelSelect && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-start items-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md flex items-center justify-between py-3 border-b border-white/10">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Tournament Levels (1 - 40)
            </h2>
            <button
              onClick={() => setShowLevelSelect(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="w-full max-w-md flex-1 overflow-y-auto py-4 grid grid-cols-5 gap-2.5">
            {SOCCER_LEVELS.map((lvl) => {
              const isUnlocked = lvl.levelNumber <= progress.highestUnlockedLevel;
              const isCurrent = lvl.levelNumber === currentLevelNum;
              const completedData = progress.completedLevels[lvl.levelNumber];

              return (
                <button
                  key={lvl.levelNumber}
                  disabled={!isUnlocked}
                  onClick={() => {
                    setShowLevelSelect(false);
                    initLevel(lvl.levelNumber);
                  }}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-sky-500/25 border-sky-400 text-sky-300 ring-2 ring-sky-400/50'
                      : isUnlocked
                      ? 'bg-slate-900 border-white/10 text-white hover:bg-slate-800 active:scale-95'
                      : 'bg-slate-950/60 border-white/5 text-slate-600 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span className="text-sm font-black font-mono">{lvl.levelNumber}</span>
                  {isUnlocked && completedData?.stars && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: completedData.stars }).map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
