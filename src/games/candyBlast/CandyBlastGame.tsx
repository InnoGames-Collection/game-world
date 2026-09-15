/**
 * Candy Blast - 40-Level Handcrafted Match-3 Campaign
 * 
 * Commercial-Quality 8x8 Mobile Match-3 Implementation:
 * - Handcrafted 40-level progressive campaign (Foundations -> Obstacles -> Fortresses -> Cosmic Mastery)
 * - Strict Move-Based Economy (No 2-minute arbitrary timer)
 * - Rich objectives: Jellies (clear frost), Blockers (crack chocolate stones), Collect Candies, Special combos
 * - Dedicated Sugar Crush celebratory finale when clearing level with remaining moves
 * - 3-Star progression rating (★ ★ ★) and persistent save in localStorage
 * - Pure SWIPE Gesture Control (One Swipe = One Move, Threshold 20-28px)
 * - 4-Match Line Clears, 5-Match Color Bombs, L/T Area Bombs, Special Combos
 * - Dedicated Web Audio Synthesizer with zero clipping
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CandyPiece, 
  Position, 
  SpecialType, 
  CandyType, 
  FloatingScore, 
  BlastEffect, 
  Particle, 
  GameStats, 
  SpecialComboAnimation,
  LevelConfig,
  LevelObjective,
  PlayerProgress
} from './types';
import { 
  BOARD_ROWS, 
  BOARD_COLS, 
  isAdjacent, 
  getSwipeTarget, 
  findMatches, 
  expandSpecialTriggers, 
  handleSpecialComboSwap,
  getSingleSpecialBlastInfo,
  isHoleCell,
  hasBlockerAt,
  createInitialBoardForLevel,
  hasPossibleMovesForLevel,
  applyGravityForLevel,
  refillBoardForLevel,
} from './matchLogic';
import { CandyGraphic, BlockerGraphic, JellyOverlay } from './candyArt';
import { CandyAudio } from './candyAudio';
import { SpecialComboLayer } from './SpecialComboLayer';
import { ExplosionCanvas, ExplosionCanvasHandle } from './ExplosionCanvas';
import { CANDY_LEVELS, getLevelConfig } from './levelBank';
import { loadPlayerProgress, recordLevelCompletion, getTotalStarsEarned } from './levelStorage';
import { GameDefinition } from '../../types';
import { 
  Pause, 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Award, 
  ArrowLeft,
  Check,
  Star,
  Trophy,
  ChevronRight,
  Zap,
  Target
} from 'lucide-react';

interface CandyBlastGameProps {
  game: GameDefinition;
  onGameOver: (score: number, durationSeconds: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

const CANDY_HEX_COLORS: Record<CandyType, string> = {
  'red-jelly': '#EF4444',
  'blue-gem': '#3B82F6',
  'yellow-hexagon': '#EAB308',
  'orange-sphere': '#F97316',
  'purple-candy': '#A855F7',
  'green-crystal': '#22C55E',
};

export const CandyBlastGame: React.FC<CandyBlastGameProps> = ({
  game,
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  // Campaign & Level Selection State
  const [progress, setProgress] = useState<PlayerProgress>(() => loadPlayerProgress());
  const [levelNumber, setLevelNumber] = useState<number>(() => {
    const saved = loadPlayerProgress();
    return Math.min(40, Math.max(1, saved.unlockedLevel));
  });

  // Current Level Configuration
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(() => getLevelConfig(levelNumber));
  const [movesRemaining, setMovesRemaining] = useState<number>(() => levelConfig.moves);
  const [objectives, setObjectives] = useState<LevelObjective[]>(() => 
    levelConfig.objectives.map((o) => ({ ...o, current: 0 }))
  );
  
  // Board Obstacle Maps
  const [blockerMap, setBlockerMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    if (levelConfig.blockers) {
      levelConfig.blockers.forEach((b) => {
        map[`${b.row},${b.col}`] = b.hp;
      });
    }
    return map;
  });

  const [jellySet, setJellySet] = useState<Set<string>>(() => {
    const set = new Set<string>();
    if (levelConfig.jellies) {
      levelConfig.jellies.forEach((j) => {
        set.add(`${j.row},${j.col}`);
      });
    }
    return set;
  });

  // Board & Gameplay States
  const [board, setBoard] = useState<(CandyPiece | null)[][]>(() => 
    createInitialBoardForLevel(levelConfig, blockerMap)
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isReshuffling, setIsReshuffling] = useState<boolean>(false);
  const [swappingPair, setSwappingPair] = useState<{ from: Position; to: Position } | null>(null);
  const [boardShake, setBoardShake] = useState<'none' | 'light' | 'medium' | 'heavy'>('none');
  
  // Scores & Level Status
  const [rawScore, setRawScore] = useState<number>(0);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [levelStatus, setLevelStatus] = useState<'playing' | 'sugar_crush' | 'level_won' | 'level_lost' | 'paused'>('playing');
  const [earnedStars, setEarnedStars] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(!isAudioEnabled);
  const [sugarCrushBonus, setSugarCrushBonus] = useState<number>(0);
  
  // Statistics for Results Screen
  const [stats, setStats] = useState<GameStats>({
    matchesMade: 0,
    specialsCreated: 0,
    specialsActivated: 0,
    combosTriggered: 0,
    bestCombo: 1,
    movesMade: 0,
  });

  // FX & Visual Layers
  const [selectedTile, setSelectedTile] = useState<Position | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [blastEffects, setBlastEffects] = useState<BlastEffect[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [specialComboAnim, setSpecialComboAnim] = useState<SpecialComboAnimation | null>(null);
  const [activeSwipeFeedback, setActiveSwipeFeedback] = useState<{ from: Position; to?: Position } | null>(null);
  const explosionCanvasRef = useRef<ExplosionCanvasHandle>(null);

  const sessionStartTimeRef = useRef<number>(Date.now());
  const boardRef = useRef(board);
  boardRef.current = board;
  const isProcessingRef = useRef(isProcessing);
  isProcessingRef.current = isProcessing;
  const levelStatusRef = useRef(levelStatus);
  levelStatusRef.current = levelStatus;

  // Track objectives and blockers in refs for latest state access in cascading loops
  const blockerMapRef = useRef(blockerMap);
  blockerMapRef.current = blockerMap;
  const jellySetRef = useRef(jellySet);
  jellySetRef.current = jellySet;
  const objectivesRef = useRef(objectives);
  objectivesRef.current = objectives;

  // Swipe Drag Tracking State
  const dragRef = useRef<{
    startRow: number;
    startCol: number;
    startX: number;
    startY: number;
    pointerId: number;
    isDone: boolean;
  } | null>(null);

  // Sound sync & cleanup on unmount
  useEffect(() => {
    CandyAudio.setMuted(muted);
    return () => {
      CandyAudio.stopAll();
    };
  }, [muted]);

  /**
   * Helper to check if all objectives are currently met
   */
  const areAllObjectivesComplete = (currentObjs: LevelObjective[]): boolean => {
    return currentObjs.length > 0 && currentObjs.every((o) => o.current >= o.target);
  };

  /**
   * Initialize a new level setup
   */
  const setupLevel = useCallback((targetLevel: number) => {
    CandyAudio.stopAll();
    const config = getLevelConfig(targetLevel);
    setLevelNumber(targetLevel);
    setLevelConfig(config);
    setMovesRemaining(config.moves);

    // Initial objectives
    const initialObjs: LevelObjective[] = config.objectives.map((o) => ({ ...o, current: 0 }));
    setObjectives(initialObjs);
    objectivesRef.current = initialObjs;

    // Initial blockers
    const bMap: Record<string, number> = {};
    if (config.blockers) {
      config.blockers.forEach((b) => {
        bMap[`${b.row},${b.col}`] = b.hp;
      });
    }
    setBlockerMap(bMap);
    blockerMapRef.current = bMap;

    // Initial jellies
    const jSet = new Set<string>();
    if (config.jellies) {
      config.jellies.forEach((j) => {
        jSet.add(`${j.row},${j.col}`);
      });
    }
    setJellySet(jSet);
    jellySetRef.current = jSet;

    // Initial board
    const newBoard = createInitialBoardForLevel(config, bMap);
    setBoard(newBoard);
    boardRef.current = newBoard;

    setRawScore(0);
    setComboMultiplier(1);
    setEarnedStars(0);
    setSugarCrushBonus(0);
    setIsProcessing(false);
    isProcessingRef.current = false;
    setLevelStatus('playing');
    levelStatusRef.current = 'playing';

    setStats({
      matchesMade: 0,
      specialsCreated: 0,
      specialsActivated: 0,
      combosTriggered: 0,
      bestCombo: 1,
      movesMade: 0,
    });
    sessionStartTimeRef.current = Date.now();
    CandyAudio.playTap();
  }, []);

  /**
   * Spawns floating score indicator above cleared tiles
   */
  const spawnFloatingScore = (points: number, row: number, col: number, label?: string, isCombo = false) => {
    const id = `score_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setFloatingScores((prev) => [...prev, { id, points, x: col, y: row, label, isCombo }]);
    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((s) => s.id !== id));
    }, 850);
  };

  /**
   * Triggers visual blast effect overlay
   */
  const triggerBlastFX = (type: BlastEffect['type'], row?: number, col?: number, color?: string) => {
    const id = `blast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setBlastEffects((prev) => [...prev, { id, type, row, col, color }]);
    setTimeout(() => {
      setBlastEffects((prev) => prev.filter((b) => b.id !== id));
    }, 550);
  };

  /**
   * Triggers subtle, localized board shake
   */
  const triggerBoardShake = (level: 'light' | 'medium' | 'heavy') => {
    setBoardShake(level);
    setTimeout(() => {
      setBoardShake('none');
    }, level === 'heavy' ? 220 : level === 'medium' ? 180 : 120);
  };

  /**
   * Spawns radiant candy sparkle particles
   */
  const spawnParticlesAt = (row: number, col: number, candyType?: CandyType, extraSparks = false) => {
    const color = candyType ? CANDY_HEX_COLORS[candyType] : '#FFD54F';
    const newParts: Particle[] = [];
    const count = extraSparks ? 12 : 7;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      const speed = extraSparks ? 2.5 + Math.random() * 3.5 : 1.8 + Math.random() * 2.2;
      newParts.push({
        id: `p_${Date.now()}_${Math.random()}`,
        x: (col / BOARD_COLS) * 100 + 6,
        y: (row / BOARD_ROWS) * 100 + 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: extraSparks ? 5 + Math.random() * 5 : 4 + Math.random() * 3,
        alpha: 1,
        life: 0,
        maxLife: extraSparks ? 26 : 20,
      });
    }
    setParticles((prev) => [...prev.slice(-40), ...newParts]);
  };

  // Particle physics loop
  useEffect(() => {
    if (particles.length === 0) return;
    const anim = requestAnimationFrame(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.4,
            y: p.y + p.vy * 0.4,
            alpha: Math.max(0, 1 - p.life / p.maxLife),
            life: p.life + 1,
          }))
          .filter((p) => p.life < p.maxLife)
      );
    });
    return () => cancelAnimationFrame(anim);
  }, [particles]);

  /**
   * Run the exciting Sugar Crush celebration!
   * Converts leftover moves into detonating candy fireworks with hefty bonus points.
   */
  const triggerSugarCrushAndVictory = async (finalScore: number, leftoverMoves: number) => {
    setLevelStatus('sugar_crush');
    levelStatusRef.current = 'sugar_crush';
    CandyAudio.playLevelCompleteFanfare();

    let bonus = 0;
    let currScore = finalScore;

    if (leftoverMoves > 0) {
      for (let m = leftoverMoves; m >= 1; m--) {
        setMovesRemaining(m - 1);
        const pointsPerMove = 1500;
        bonus += pointsPerMove;
        currScore += pointsPerMove;
        setSugarCrushBonus(bonus);
        setRawScore(currScore);

        // Pick random cell for detonation firework
        const randRow = Math.floor(Math.random() * BOARD_ROWS);
        const randCol = Math.floor(Math.random() * BOARD_COLS);
        const randColor = ['#FF007F', '#00E5FF', '#FFD54F', '#00C853', '#A855F7'][Math.floor(Math.random() * 5)];
        
        explosionCanvasRef.current?.triggerBombExplosion({ row: randRow, col: randCol }, 1.5, randColor, 0.9);
        triggerBoardShake('light');
        CandyAudio.playColorBomb();
        spawnFloatingScore(pointsPerMove, randRow, randCol, 'SUGAR CRUSH!', true);

        await new Promise((r) => setTimeout(r, 220));
      }
    }

    await new Promise((r) => setTimeout(r, 400));

    // Calculate stars: 1 to 3 stars
    const [star1, star2, star3] = levelConfig.starThresholds;
    let stars = 1;
    if (currScore >= star3) stars = 3;
    else if (currScore >= star2) stars = 2;

    setEarnedStars(stars);

    // Save to persistent campaign progress
    const result = recordLevelCompletion(levelNumber, currScore, stars);
    setProgress(result.progress);

    CandyAudio.playFanfare();
    setLevelStatus('level_won');
    levelStatusRef.current = 'level_won';

    const elapsed = Math.max(1, Math.round((Date.now() - sessionStartTimeRef.current) / 1000));
    onGameOver(currScore, elapsed);
  };

  /**
   * Handle level defeat when out of moves
   */
  const handleLevelLoss = (finalScore: number) => {
    setLevelStatus('level_lost');
    levelStatusRef.current = 'level_lost';
    CandyAudio.playGameOver();
    const elapsed = Math.max(1, Math.round((Date.now() - sessionStartTimeRef.current) / 1000));
    onGameOver(finalScore, elapsed);
  };

  /**
   * Multi-Stage Cascading Processor Pipeline with Objectives Tracking
   */
  const processCascades = useCallback(
    async (
      currentBoard: (CandyPiece | null)[][],
      comboCount = 1,
      swappedPos?: Position,
      currentMoves = movesRemaining
    ): Promise<(CandyPiece | null)[][]> => {
      // 1. Scan for matches
      const { matchedPositions, specialPiecesToCreate } = findMatches(currentBoard, swappedPos);

      if (matchedPositions.length === 0) {
        // Cascade finished. Check for deadlocks on playable board
        if (!hasPossibleMovesForLevel(currentBoard, levelConfig, blockerMapRef.current)) {
          setIsReshuffling(true);
          CandyAudio.playSwap();
          await new Promise((r) => setTimeout(r, 600));
          const reshuffled = createInitialBoardForLevel(levelConfig, blockerMapRef.current);
          setBoard(reshuffled);
          boardRef.current = reshuffled;
          setIsReshuffling(false);
          return reshuffled;
        }

        // Check if level has been WON or LOST
        const areObjsMet = areAllObjectivesComplete(objectivesRef.current);
        if (areObjsMet) {
          setTimeout(() => {
            triggerSugarCrushAndVictory(rawScore, currentMoves);
          }, 200);
        } else if (currentMoves <= 0) {
          setTimeout(() => {
            handleLevelLoss(rawScore);
          }, 250);
        }

        return currentBoard;
      }

      // 2. Expand special triggers
      const { allClearedPositions, triggeredEffects } = expandSpecialTriggers(currentBoard, matchedPositions);
      const hasSpecialTriggered = triggeredEffects.length > 0;
      const hasSpecialCreated = specialPiecesToCreate.length > 0;

      if (hasSpecialTriggered) {
        // =====================================================================
        // SPECIAL CANDY ACTIVATION CHOREOGRAPHY
        // =====================================================================
        CandyAudio.playSpecialActivationAnticipation();
        triggeredEffects.forEach((fx) => {
          if (fx.type === 'bomb-3x3') {
            const pieceAtOrigin = currentBoard[fx.row]?.[fx.col];
            const candyColor = pieceAtOrigin ? CANDY_HEX_COLORS[pieceAtOrigin.type] : '#FFA500';
            explosionCanvasRef.current?.triggerBombAnticipation({ row: fx.row, col: fx.col }, candyColor);
          }
        });

        const chargingBoard = currentBoard.map((row) =>
          row.map((piece) => {
            if (!piece) return null;
            const isOrigin = triggeredEffects.some((fx) => fx.row === piece.row && fx.col === piece.col);
            return isOrigin ? { ...piece, isCharging: true } : piece;
          })
        );
        setBoard(chargingBoard);
        await new Promise((r) => setTimeout(r, 130));

        const isAreaOrColor = triggeredEffects.some((fx) => fx.type === 'bomb-3x3' || fx.type === 'color-rainbow');
        triggerBoardShake(isAreaOrColor ? 'medium' : 'light');

        const flashingBoard = chargingBoard.map((row) =>
          row.map((piece) => {
            if (!piece) return null;
            const isOrigin = triggeredEffects.some((fx) => fx.row === piece.row && fx.col === piece.col);
            return isOrigin ? { ...piece, isCharging: false, isSpecialTriggered: true } : piece;
          })
        );
        setBoard(flashingBoard);

        triggeredEffects.forEach((fx, fxIndex) => {
          triggerBlastFX(fx.type, fx.row, fx.col);
          const pieceAtOrigin = currentBoard[fx.row]?.[fx.col];
          const candyColor = pieceAtOrigin ? CANDY_HEX_COLORS[pieceAtOrigin.type] : '#FFA500';
          const intensity = fxIndex === 0 ? 1.0 : fxIndex === 1 ? 0.78 : 0.6;

          if (fx.type === 'line-h') {
            explosionCanvasRef.current?.triggerLineBlast('horizontal', fx.row, candyColor || '#00E5FF');
            CandyAudio.playLineClear();
          } else if (fx.type === 'line-v') {
            explosionCanvasRef.current?.triggerLineBlast('vertical', fx.col, candyColor || '#00E5FF');
            CandyAudio.playLineClear();
          } else if (fx.type === 'bomb-3x3') {
            explosionCanvasRef.current?.triggerBombExplosion({ row: fx.row, col: fx.col }, 1.7, candyColor || '#FFA500', intensity);
            if (fxIndex === 0) CandyAudio.playBombExplosion();
            else CandyAudio.playSecondaryExplosion(fxIndex);
          } else if (fx.type === 'color-rainbow') {
            explosionCanvasRef.current?.triggerColorSupernova({ row: fx.row, col: fx.col }, candyColor || '#FF007F');
            CandyAudio.playColorBomb();
          }
        });
        await new Promise((r) => setTimeout(r, 60));

        const reactingBoard = flashingBoard.map((row) =>
          row.map((piece) => {
            if (!piece) return null;
            const isAffected = allClearedPositions.some((p) => p.row === piece.row && p.col === piece.col);
            if (!isAffected) return piece;

            let minDist = 999;
            triggeredEffects.forEach((fx) => {
              const dist = Math.hypot(piece.row - fx.row, piece.col - fx.col);
              if (dist < minDist) minDist = dist;
            });
            const tier = minDist < 0.6 ? 0 : minDist <= 1.2 ? 1 : minDist <= 1.9 ? 2 : 3;
            const delay = tier * 35;

            explosionCanvasRef.current?.triggerStaggeredImpact(
              { row: piece.row, col: piece.col },
              CANDY_HEX_COLORS[piece.type] || '#FFD700',
              delay
            );

            return { ...piece, isReacting: true, isSpecialTriggered: false, isCharging: false };
          })
        );
        setBoard(reactingBoard);
        await new Promise((r) => setTimeout(r, 140));

        const clearingBoard = reactingBoard.map((row) =>
          row.map((piece) => {
            if (!piece) return null;
            const isCleared = allClearedPositions.some((p) => p.row === piece.row && p.col === piece.col);
            return isCleared ? { ...piece, isClearing: true, isReacting: false } : piece;
          })
        );
        setBoard(clearingBoard);
        CandyAudio.playCandyDestructionBatch(allClearedPositions.length);
        await new Promise((r) => setTimeout(r, 130));
      } else {
        // =====================================================================
        // STANDARD 3-MATCH & SPECIAL FORMATION CHOREOGRAPHY
        // =====================================================================
        if (hasSpecialCreated) {
          CandyAudio.playSpecialCharge();
          specialPiecesToCreate.forEach((s) => {
            const hex = CANDY_HEX_COLORS[s.candyType] || '#FFD700';
            explosionCanvasRef.current?.triggerCreationGather(s.pos, hex);
          });
        }

        const anticipationBoard = currentBoard.map((row) =>
          row.map((piece) => {
            if (!piece) return null;
            const isMatched = allClearedPositions.some((p) => p.row === piece.row && p.col === piece.col);
            const targetSpecial = hasSpecialCreated
              ? specialPiecesToCreate.find((s) => s.pos.row === piece.row && s.pos.col === piece.col)
              : null;
            const nearestSpecial = hasSpecialCreated
              ? specialPiecesToCreate[0]
              : null;

            return isMatched
              ? { 
                  ...piece, 
                  isMatched: true, 
                  isFormingSpecial: Boolean(targetSpecial),
                  convergeTarget: hasSpecialCreated && nearestSpecial ? nearestSpecial.pos : undefined
                }
              : piece;
          })
        );
        setBoard(anticipationBoard);

        if (comboCount > 1) {
          CandyAudio.playChainReaction(comboCount);
        } else {
          CandyAudio.playMatch(comboCount);
        }
        await new Promise((r) => setTimeout(r, hasSpecialCreated ? 140 : 90));

        const clearingBoard = anticipationBoard.map((row) =>
          row.map((piece) => {
            if (!piece) return null;
            const isCleared = allClearedPositions.some((p) => p.row === piece.row && p.col === piece.col);
            return isCleared ? { ...piece, isClearing: true, isMatched: false, convergeTarget: undefined } : piece;
          })
        );
        setBoard(clearingBoard);
        await new Promise((r) => setTimeout(r, 130));
      }

      // =====================================================================
      // 3. OBJECTIVES & OBSTACLE PROGRESSION UPDATE
      // =====================================================================
      
      // A. Jellies cleared
      let newlyClearedJellies = 0;
      const updatedJellySet = new Set(jellySetRef.current);
      allClearedPositions.forEach((pos) => {
        const key = `${pos.row},${pos.col}`;
        if (updatedJellySet.has(key)) {
          updatedJellySet.delete(key);
          newlyClearedJellies++;
        }
      });
      if (newlyClearedJellies > 0) {
        setJellySet(updatedJellySet);
        jellySetRef.current = updatedJellySet;
      }

      // B. Blockers damaged or destroyed by adjacent clears
      let newlyDestroyedBlockers = 0;
      const updatedBlockerMap = { ...blockerMapRef.current };
      const hitBlockerKeys = new Set<string>();
      const neighborDeltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];

      allClearedPositions.forEach((pos) => {
        neighborDeltas.forEach(([dr, dc]) => {
          const nr = pos.row + dr;
          const nc = pos.col + dc;
          const key = `${nr},${nc}`;
          if (updatedBlockerMap[key] !== undefined && !hitBlockerKeys.has(key)) {
            hitBlockerKeys.add(key);
            updatedBlockerMap[key] -= 1;
            newlyDestroyedBlockers++;
            if (updatedBlockerMap[key] <= 0) {
              delete updatedBlockerMap[key];
            }
          }
        });
      });

      if (hitBlockerKeys.size > 0) {
        setBlockerMap(updatedBlockerMap);
        blockerMapRef.current = updatedBlockerMap;
        CandyAudio.playLineClear();
      }

      // C. Count colored candies collected
      const candyCountByType: Record<string, number> = {};
      allClearedPositions.forEach((pos) => {
        const p = currentBoard[pos.row]?.[pos.col];
        if (p) {
          candyCountByType[p.type] = (candyCountByType[p.type] || 0) + 1;
        }
      });

      // D. Calibrated Score Calculation
      const basePts = allClearedPositions.length * 60;
      const specialSpawnBonus = specialPiecesToCreate.reduce((acc, s) => {
        return acc + (s.type === 'color-bomb' ? 400 : s.type === 'area-bomb' ? 250 : 150);
      }, 0);
      const specialTriggerBonus = triggeredEffects.length * 200;
      const obstacleBonus = newlyClearedJellies * 350 + newlyDestroyedBlockers * 500;
      const comboMult = comboCount === 1 ? 1 : comboCount === 2 ? 1.25 : comboCount === 3 ? 1.5 : comboCount === 4 ? 1.8 : 2.2;
      const earnedPoints = Math.round((basePts + specialSpawnBonus + specialTriggerBonus + obstacleBonus) * comboMult);

      setRawScore((prev) => prev + earnedPoints);
      setComboMultiplier(comboCount);

      // E. Update Live Objectives State
      const nextObjectives = objectivesRef.current.map((obj) => {
        let added = 0;
        if (obj.type === 'clear_jelly') added = newlyClearedJellies;
        else if (obj.type === 'clear_blockers') added = newlyDestroyedBlockers;
        else if (obj.type === 'collect_candy' && obj.candyType) {
          added = candyCountByType[obj.candyType] || 0;
        } else if (obj.type === 'create_specials') {
          added = specialPiecesToCreate.length + triggeredEffects.length;
        } else if (obj.type === 'combo_specials') {
          added = comboCount > 1 ? 1 : 0;
        } else if (obj.type === 'score') {
          added = earnedPoints;
        }
        return { ...obj, current: Math.min(obj.target, obj.current + added) };
      });

      setObjectives(nextObjectives);
      objectivesRef.current = nextObjectives;

      // Update Statistics
      setStats((prev) => ({
        ...prev,
        matchesMade: prev.matchesMade + 1,
        specialsCreated: prev.specialsCreated + specialPiecesToCreate.length,
        specialsActivated: prev.specialsActivated + triggeredEffects.length,
        combosTriggered: comboCount > 1 ? prev.combosTriggered + 1 : prev.combosTriggered,
        bestCombo: Math.max(prev.bestCombo, comboCount),
      }));

      // Spawn floating score
      const centerTile = allClearedPositions[Math.floor(allClearedPositions.length / 2)] || { row: 3, col: 3 };
      spawnFloatingScore(
        earnedPoints, 
        centerTile.row, 
        centerTile.col, 
        comboCount > 1 ? `COMBO x${comboCount}` : undefined, 
        comboCount > 1
      );

      // 4. REMOVE MATCHED PIECES AND SPAWN SPECIALS
      const postClearBoard: (CandyPiece | null)[][] = currentBoard.map((row) =>
        row.map((piece) => {
          if (!piece) return null;
          const isCleared = allClearedPositions.some((p) => p.row === piece.row && p.col === piece.col);
          return isCleared ? null : piece;
        })
      );

      // Place newly created specials
      if (specialPiecesToCreate.length > 0) {
        specialPiecesToCreate.forEach(({ type: sType, candyType, pos }) => {
          const newPiece = {
            ...postClearBoard[pos.row][pos.col],
            id: `special_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            row: pos.row,
            col: pos.col,
            type: candyType,
            special: sType,
            isSpawningSpecial: true,
          };
          postClearBoard[pos.row][pos.col] = newPiece;

          if (sType === 'color-bomb') CandyAudio.playColorBombFormed();
          else if (sType === 'area-bomb') CandyAudio.playBombFormed();
          else CandyAudio.playLineFormed();

          spawnParticlesAt(pos.row, pos.col, candyType, true);
        });

        setBoard(postClearBoard.map((rArr) => [...rArr]));
        await new Promise((r) => setTimeout(r, 160));

        specialPiecesToCreate.forEach(({ pos }) => {
          const piece = postClearBoard[pos.row][pos.col];
          if (piece) piece.isSpawningSpecial = false;
        });
      }

      await new Promise((r) => setTimeout(r, 60));

      // 5. LEVEL-AWARE GRAVITY GLIDE
      const { newBoard: gravityBoard } = applyGravityForLevel(postClearBoard, levelConfig, blockerMapRef.current);
      setBoard(gravityBoard);
      await new Promise((r) => setTimeout(r, 160));

      // 6. LEVEL-AWARE TOP REFILL
      const { newBoard: refilledBoard } = refillBoardForLevel(gravityBoard, levelConfig, blockerMapRef.current);
      CandyAudio.playRefillCascade();
      setBoard(refilledBoard);
      boardRef.current = refilledBoard;
      await new Promise((r) => setTimeout(r, 160));

      // 7. RECURSIVE CASCADE CHECK
      return processCascades(refilledBoard, comboCount + 1, undefined, currentMoves);
    },
    [levelConfig, rawScore, movesRemaining]
  );

  /**
   * DIRECT SPECIAL CANDY ACTIVATION (TAP ON SPECIAL CANDY)
   * Decrements moves by 1 and activates the special power!
   */
  const activateSpecialCandyDirect = async (pos: Position) => {
    if (isProcessingRef.current || levelStatus !== 'playing' || movesRemaining <= 0) return;

    const piece = board[pos.row]?.[pos.col];
    if (!piece || piece.special === 'none' || piece.isSpecialTriggered || piece.isClearing) return;

    isProcessingRef.current = true;
    setIsProcessing(true);
    setSelectedTile(null);

    // Decrement move
    const newMoves = movesRemaining - 1;
    setMovesRemaining(newMoves);
    setStats((prev) => ({ ...prev, movesMade: prev.movesMade + 1 }));

    CandyAudio.playSpecialActivationAnticipation();
    const chargeBoard = board.map((rArr) =>
      rArr.map((p) => {
        if (!p) return null;
        return p.row === pos.row && p.col === pos.col
          ? { ...p, isCharging: true, isSelected: true }
          : p;
      })
    );
    setBoard(chargeBoard);
    await new Promise((r) => setTimeout(r, 80));

    const flashBoard = chargeBoard.map((rArr) =>
      rArr.map((p) => {
        if (!p) return null;
        return p.row === pos.row && p.col === pos.col
          ? { ...p, isCharging: false, isSpecialTriggered: true, isSelected: true }
          : p;
      })
    );
    setBoard(flashBoard);
    await new Promise((r) => setTimeout(r, 80));

    const blastInfo = getSingleSpecialBlastInfo(board, pos);
    if (!blastInfo) {
      isProcessingRef.current = false;
      setIsProcessing(false);
      return;
    }

    const { type: blastType, affectedPositions, description } = blastInfo;
    const pieceColor = CANDY_HEX_COLORS[piece.type] || '#FFA500';

    triggerBlastFX(blastType, pos.row, pos.col);
    triggerBoardShake(blastType === 'bomb-3x3' || blastType === 'color-rainbow' ? 'medium' : 'light');

    if (blastType === 'bomb-3x3') {
      explosionCanvasRef.current?.triggerBombExplosion(pos, 1.6, pieceColor || '#FFA500');
      CandyAudio.playBombExplosion();
    } else if (blastType === 'color-rainbow') {
      explosionCanvasRef.current?.triggerColorSupernova(pos, pieceColor || '#FF007F');
      CandyAudio.playColorBomb();
    }

    const reactingBoard = flashBoard.map((rArr) =>
      rArr.map((p) => {
        if (!p) return null;
        const isAffected = affectedPositions.some((ap) => ap.row === p.row && ap.col === p.col);
        if (!isAffected) return p;

        const dist = Math.hypot(p.row - pos.row, p.col - pos.col);
        const tier = dist < 0.5 ? 0 : dist <= 1.2 ? 1 : dist <= 1.8 ? 2 : 3;
        const delay = tier * 30;

        explosionCanvasRef.current?.triggerStaggeredImpact(
          { row: p.row, col: p.col },
          CANDY_HEX_COLORS[p.type] || '#FFD700',
          delay
        );

        return { ...p, isReacting: true, isSpecialTriggered: false, isSelected: false, isCharging: false };
      })
    );
    setBoard(reactingBoard);
    await new Promise((r) => setTimeout(r, 120));

    const clearingBoard = reactingBoard.map((rArr) =>
      rArr.map((p) => {
        if (!p) return null;
        const isAffected = affectedPositions.some((ap) => ap.row === p.row && ap.col === p.col);
        return isAffected ? { ...p, isClearing: true, isReacting: false } : p;
      })
    );
    setBoard(clearingBoard);
    CandyAudio.playCandyDestructionBatch(affectedPositions.length);
    await new Promise((r) => setTimeout(r, 140));

    // Handle secondary specials hit
    const secondarySpecials = affectedPositions
      .map((ap) => board[ap.row]?.[ap.col])
      .filter((p): p is CandyPiece => Boolean(p && p.special !== 'none' && (p.row !== pos.row || p.col !== pos.col)));

    const allClearedPositions = [...affectedPositions];
    let totalSecondaryPoints = 0;
    let chainIndex = 1;

    for (const secondaryPiece of secondarySpecials) {
      const secondaryBlast = getSingleSpecialBlastInfo(board, { row: secondaryPiece.row, col: secondaryPiece.col });
      if (secondaryBlast) {
        await new Promise((r) => setTimeout(r, 80));
        CandyAudio.playSecondaryExplosion(chainIndex);
        triggerBlastFX(secondaryBlast.type, secondaryPiece.row, secondaryPiece.col);
        triggerBoardShake('light');

        const secColor = CANDY_HEX_COLORS[secondaryPiece.type] || '#FFD700';
        if (secondaryBlast.type === 'bomb-3x3') {
          explosionCanvasRef.current?.triggerBombExplosion(
            { row: secondaryPiece.row, col: secondaryPiece.col },
            1.2,
            secColor
          );
        } else {
          explosionCanvasRef.current?.triggerColorSupernova(
            { row: secondaryPiece.row, col: secondaryPiece.col },
            secColor
          );
        }

        secondaryBlast.affectedPositions.forEach((sp) => {
          if (!allClearedPositions.some((cp) => cp.row === sp.row && cp.col === sp.col)) {
            allClearedPositions.push(sp);
          }
        });
        totalSecondaryPoints += 250;
        chainIndex++;
      }
    }

    // Objectives progression from direct activation
    let newlyClearedJellies = 0;
    const updatedJellySet = new Set(jellySetRef.current);
    allClearedPositions.forEach((cp) => {
      const key = `${cp.row},${cp.col}`;
      if (updatedJellySet.has(key)) {
        updatedJellySet.delete(key);
        newlyClearedJellies++;
      }
    });
    if (newlyClearedJellies > 0) {
      setJellySet(updatedJellySet);
      jellySetRef.current = updatedJellySet;
    }

    let newlyDestroyedBlockers = 0;
    const updatedBlockerMap = { ...blockerMapRef.current };
    const neighborDeltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const hitDirectBlockers = new Set<string>();
    allClearedPositions.forEach((cp) => {
      neighborDeltas.forEach(([dr, dc]) => {
        const nr = cp.row + dr;
        const nc = cp.col + dc;
        const key = `${nr},${nc}`;
        if (updatedBlockerMap[key] !== undefined && !hitDirectBlockers.has(key)) {
          hitDirectBlockers.add(key);
          updatedBlockerMap[key] -= 1;
          newlyDestroyedBlockers++;
          if (updatedBlockerMap[key] <= 0) {
            delete updatedBlockerMap[key];
          }
        }
      });
    });
    if (hitDirectBlockers.size > 0) {
      setBlockerMap(updatedBlockerMap);
      blockerMapRef.current = updatedBlockerMap;
    }

    const earnedPoints = Math.round(
      allClearedPositions.length * 60 +
      (blastType === 'color-rainbow' ? 500 : blastType === 'bomb-3x3' ? 350 : 250) +
      totalSecondaryPoints +
      newlyClearedJellies * 350 +
      newlyDestroyedBlockers * 500
    );

    setRawScore((prev) => prev + earnedPoints);
    setStats((prev) => ({
      ...prev,
      specialsActivated: prev.specialsActivated + 1 + secondarySpecials.length,
      combosTriggered: secondarySpecials.length > 0 ? prev.combosTriggered + 1 : prev.combosTriggered,
    }));
    spawnFloatingScore(earnedPoints, pos.row, pos.col, description, secondarySpecials.length > 0);

    // Update objectives
    const nextObjectives = objectivesRef.current.map((obj) => {
      let added = 0;
      if (obj.type === 'clear_jelly') added = newlyClearedJellies;
      else if (obj.type === 'clear_blockers') added = newlyDestroyedBlockers;
      else if (obj.type === 'create_specials') added = 1 + secondarySpecials.length;
      else if (obj.type === 'collect_candy' && obj.candyType) {
        added = allClearedPositions.filter((cp) => board[cp.row]?.[cp.col]?.type === obj.candyType).length;
      }
      else if (obj.type === 'score') added = earnedPoints;
      return { ...obj, current: Math.min(obj.target, obj.current + added) };
    });
    setObjectives(nextObjectives);
    objectivesRef.current = nextObjectives;

    await new Promise((r) => setTimeout(r, 60));

    // Remove destroyed cells & apply gravity
    const emptiedBoard = board.map((rArr) =>
      rArr.map((p) => {
        if (!p) return null;
        return allClearedPositions.some((cp) => cp.row === p.row && cp.col === p.col) ? null : p;
      })
    );

    const { newBoard: gravityBoard } = applyGravityForLevel(emptiedBoard, levelConfig, blockerMapRef.current);
    setBoard(gravityBoard);
    await new Promise((r) => setTimeout(r, 160));

    const { newBoard: refilledBoard } = refillBoardForLevel(gravityBoard, levelConfig, blockerMapRef.current);
    CandyAudio.playRefillCascade();
    setBoard(refilledBoard);
    boardRef.current = refilledBoard;
    await new Promise((r) => setTimeout(r, 160));

    // Check cascade and end conditions
    await processCascades(refilledBoard, 1, undefined, newMoves);

    isProcessingRef.current = false;
    setIsProcessing(false);
  };

  /**
   * Performs Swap between two adjacent cells
   * ONE VALID SWIPE = ONE MOVE
   */
  const executeSwap = async (pos1: Position, pos2: Position) => {
    if (isProcessingRef.current || levelStatus !== 'playing' || movesRemaining <= 0) return;
    if (!isAdjacent(pos1, pos2)) return;

    // Reject swaps involving holes or blockers
    if (isHoleCell(pos1.row, pos1.col, levelConfig) || isHoleCell(pos2.row, pos2.col, levelConfig)) return;
    if (hasBlockerAt(pos1.row, pos1.col, blockerMapRef.current) || hasBlockerAt(pos2.row, pos2.col, blockerMapRef.current)) return;

    const piece1 = board[pos1.row]?.[pos1.col];
    const piece2 = board[pos2.row]?.[pos2.col];
    if (!piece1 || !piece2) return;

    isProcessingRef.current = true;
    setIsProcessing(true);
    setSelectedTile(null);

    // 1. Check for SPECIAL COMBO SWAPS
    const specialCombo = handleSpecialComboSwap(piece1, pos1, piece2, pos2, board);

    if (specialCombo.isSpecialCombo) {
      // Deduct move
      const newMoves = movesRemaining - 1;
      setMovesRemaining(newMoves);
      setStats((prev) => ({ ...prev, movesMade: prev.movesMade + 1 }));

      setSwappingPair({ from: pos1, to: pos2 });
      CandyAudio.playSwap();

      let animType: SpecialComboAnimation['type'] = 'bomb-5x5';
      if (specialCombo.description.includes('COSMIC')) animType = 'cosmic-board-wipe';
      else if (specialCombo.description.includes('RAINBOW LASER')) animType = 'rainbow-laser-cascade';
      else if (specialCombo.description.includes('RAINBOW BOMB')) animType = 'rainbow-bomb-shockwave';
      else if (specialCombo.description.includes('RAINBOW COLOR')) animType = 'rainbow-color-blast';
      else if (specialCombo.description.includes('CROSS LASER')) animType = 'cross-laser';
      else if (specialCombo.description.includes('MEGA TRIPLE')) animType = 'mega-triple';
      else if (specialCombo.description.includes('5x5')) animType = 'bomb-5x5';

      setSpecialComboAnim({
        id: `combo_${Date.now()}`,
        type: animType,
        pos1,
        pos2,
        targetPositions: specialCombo.clearedPositions,
        targetColor: piece1.special === 'color-bomb' ? piece2.type : piece1.type,
        phase: 'anticipation',
      });
      CandyAudio.playComboAnticipation();

      await new Promise((r) => setTimeout(r, 160));
      setSwappingPair(null);

      setSpecialComboAnim((prev) => (prev ? { ...prev, phase: 'detonation' } : null));
      triggerBoardShake('heavy');

      if (animType === 'bomb-5x5') {
        explosionCanvasRef.current?.triggerBombExplosion(pos1, 2.5, '#FFA500');
        CandyAudio.playBombBombCombo();
      } else if (animType === 'cross-laser') {
        explosionCanvasRef.current?.triggerLineBlast('horizontal', pos1.row, '#00E5FF');
        explosionCanvasRef.current?.triggerLineBlast('vertical', pos1.col, '#00E5FF');
        CandyAudio.playLineLineCombo();
      } else if (animType === 'mega-triple') {
        explosionCanvasRef.current?.triggerBombExplosion(pos1, 1.8, '#FFA500');
        explosionCanvasRef.current?.triggerLineBlast('horizontal', pos1.row, '#00E5FF');
        CandyAudio.playLineBombCombo();
      } else if (animType === 'rainbow-laser-cascade' || animType === 'rainbow-bomb-shockwave') {
        explosionCanvasRef.current?.triggerBombExplosion(pos1, 2.0, '#FF007F');
        CandyAudio.playColorSpecialCascade();
      } else if (animType === 'cosmic-board-wipe') {
        explosionCanvasRef.current?.triggerColorSupernova(pos1, '#FF007F');
        CandyAudio.playColorColorCosmicWipe();
      } else {
        CandyAudio.playColorBomb();
      }

      const reactingBoard = board.map((rArr) =>
        rArr.map((p) => {
          if (!p) return null;
          return specialCombo.clearedPositions.some((cp) => cp.row === p.row && cp.col === p.col)
            ? { ...p, isReacting: true }
            : p;
        })
      );
      setBoard(reactingBoard);
      await new Promise((r) => setTimeout(r, 150));

      const clearedBoard = reactingBoard.map((rArr) =>
        rArr.map((p) => {
          if (!p) return null;
          return specialCombo.clearedPositions.some((cp) => cp.row === p.row && cp.col === p.col)
            ? { ...p, isClearing: true, isReacting: false }
            : p;
        })
      );
      setBoard(clearedBoard);
      CandyAudio.playCandyDestructionBatch(specialCombo.clearedPositions.length);

      // Objectives update for combo
      let comboJellies = 0;
      const updatedJellySet = new Set(jellySetRef.current);
      specialCombo.clearedPositions.forEach((cp) => {
        const key = `${cp.row},${cp.col}`;
        if (updatedJellySet.has(key)) {
          updatedJellySet.delete(key);
          comboJellies++;
        }
      });
      if (comboJellies > 0) {
        setJellySet(updatedJellySet);
        jellySetRef.current = updatedJellySet;
      }

      let comboBlockers = 0;
      const updatedBlockerMap = { ...blockerMapRef.current };
      const nDeltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      const hitComboBlockers = new Set<string>();
      specialCombo.clearedPositions.forEach((cp) => {
        nDeltas.forEach(([dr, dc]) => {
          const nr = cp.row + dr;
          const nc = cp.col + dc;
          const key = `${nr},${nc}`;
          if (updatedBlockerMap[key] !== undefined && !hitComboBlockers.has(key)) {
            hitComboBlockers.add(key);
            updatedBlockerMap[key] -= 1;
            comboBlockers++;
            if (updatedBlockerMap[key] <= 0) {
              delete updatedBlockerMap[key];
            }
          }
        });
      });
      if (hitComboBlockers.size > 0) {
        setBlockerMap(updatedBlockerMap);
        blockerMapRef.current = updatedBlockerMap;
      }

      const comboPts = Math.round(
        (specialCombo.description.includes('COSMIC')
          ? 3500
          : specialCombo.description.includes('RAINBOW')
          ? 2500
          : specialCombo.description.includes('5x5')
          ? 2000
          : specialCombo.description.includes('TRIPLE')
          ? 1800
          : 1200) + comboJellies * 350 + comboBlockers * 500
      );

      setRawScore((prev) => prev + comboPts);
      setStats((prev) => ({
        ...prev,
        specialsActivated: prev.specialsActivated + 2,
        combosTriggered: prev.combosTriggered + 1,
      }));
      spawnFloatingScore(comboPts, pos2.row, pos2.col, specialCombo.description, true);

      const nextObjectives = objectivesRef.current.map((obj) => {
        let added = 0;
        if (obj.type === 'clear_jelly') added = comboJellies;
        else if (obj.type === 'clear_blockers') added = comboBlockers;
        else if (obj.type === 'combo_specials') added = 1;
        else if (obj.type === 'create_specials') added = 2;
        else if (obj.type === 'collect_candy' && obj.candyType) {
          added = specialCombo.clearedPositions.filter((cp) => board[cp.row]?.[cp.col]?.type === obj.candyType).length;
        }
        else if (obj.type === 'score') added = comboPts;
        return { ...obj, current: Math.min(obj.target, obj.current + added) };
      });
      setObjectives(nextObjectives);
      objectivesRef.current = nextObjectives;

      await new Promise((r) => setTimeout(r, 160));
      setSpecialComboAnim(null);

      const emptiedBoard = board.map((rArr) =>
        rArr.map((p) => {
          if (!p) return null;
          return specialCombo.clearedPositions.some((cp) => cp.row === p.row && cp.col === p.col) ? null : p;
        })
      );

      const { newBoard: gravityB } = applyGravityForLevel(emptiedBoard, levelConfig, blockerMapRef.current);
      setBoard(gravityB);
      await new Promise((r) => setTimeout(r, 160));

      const { newBoard: refilledB } = refillBoardForLevel(gravityB, levelConfig, blockerMapRef.current);
      CandyAudio.playRefillCascade();
      setBoard(refilledB);
      boardRef.current = refilledB;
      await new Promise((r) => setTimeout(r, 160));

      await processCascades(refilledB, 2, undefined, newMoves);
      isProcessingRef.current = false;
      setIsProcessing(false);
      return;
    }

    // 2. STANDARD SWAP
    setSwappingPair({ from: pos1, to: pos2 });
    CandyAudio.playSwap();

    const swappedBoard = board.map((rArr) => [...rArr]);
    swappedBoard[pos1.row][pos1.col] = { ...piece2, row: pos1.row, col: pos1.col };
    swappedBoard[pos2.row][pos2.col] = { ...piece1, row: pos2.row, col: pos2.col };

    setBoard(swappedBoard);
    await new Promise((r) => setTimeout(r, 160));
    setSwappingPair(null);

    const { matchedPositions } = findMatches(swappedBoard, pos2);

    if (matchedPositions.length === 0) {
      // INVALID SWAP: Spring back, NO moves deducted
      CandyAudio.playInvalid();
      const revertedBoard = board.map((rArr) => [...rArr]);
      setBoard(revertedBoard);
      await new Promise((r) => setTimeout(r, 160));
      isProcessingRef.current = false;
      setIsProcessing(false);
      return;
    }

    // VALID SWAP: Deduct move and run cascade
    const newMoves = movesRemaining - 1;
    setMovesRemaining(newMoves);
    setStats((prev) => ({ ...prev, movesMade: prev.movesMade + 1 }));

    await processCascades(swappedBoard, 1, pos2, newMoves);
    isProcessingRef.current = false;
    setIsProcessing(false);
  };

  /**
   * SWIPE GESTURE HANDLERS
   */
  const handlePointerDown = (e: React.PointerEvent, row: number, col: number) => {
    if (isProcessingRef.current || levelStatus !== 'playing' || movesRemaining <= 0) return;
    if (isHoleCell(row, col, levelConfig) || hasBlockerAt(row, col, blockerMapRef.current)) return;
    
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    dragRef.current = {
      startRow: row,
      startCol: col,
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId,
      isDone: false,
    };

    setActiveSwipeFeedback({ from: { row, col } });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || dragRef.current.isDone || isProcessingRef.current || levelStatus !== 'playing' || movesRemaining <= 0) return;
    if (dragRef.current.pointerId !== e.pointerId) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    const target = getSwipeTarget(
      { row: dragRef.current.startRow, col: dragRef.current.startCol },
      dx,
      dy,
      22
    );

    if (target) {
      dragRef.current.isDone = true;
      setActiveSwipeFeedback(null);
      setSelectedTile(null);
      executeSwap(
        { row: dragRef.current.startRow, col: dragRef.current.startCol },
        target
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current && !dragRef.current.isDone && !isProcessingRef.current && levelStatus === 'playing' && movesRemaining > 0) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      const target = getSwipeTarget(
        { row: dragRef.current.startRow, col: dragRef.current.startCol },
        dx,
        dy,
        18
      );

      if (target) {
        dragRef.current.isDone = true;
        setSelectedTile(null);
        executeSwap(
          { row: dragRef.current.startRow, col: dragRef.current.startCol },
          target
        );
      } else {
        // TAP INTERACTION
        const row = dragRef.current.startRow;
        const col = dragRef.current.startCol;
        const piece = board[row]?.[col];

        if (piece && piece.special !== 'none') {
          activateSpecialCandyDirect({ row, col });
        } else if (piece) {
          if (selectedTile) {
            if (selectedTile.row === row && selectedTile.col === col) {
              setSelectedTile(null);
            } else if (isAdjacent(selectedTile, { row, col })) {
              const fromTile = { ...selectedTile };
              setSelectedTile(null);
              executeSwap(fromTile, { row, col });
            } else {
              setSelectedTile({ row, col });
              CandyAudio.playTap();
            }
          } else {
            setSelectedTile({ row, col });
            CandyAudio.playTap();
          }
        }
      }
    }

    dragRef.current = null;
    setActiveSwipeFeedback(null);
  };

  const handlePointerCancel = () => {
    dragRef.current = null;
    setActiveSwipeFeedback(null);
  };

  const handleRestart = () => {
    setupLevel(levelNumber);
  };

  const handleNextLevel = () => {
    if (levelNumber < 40) {
      setupLevel(levelNumber + 1);
    } else {
      setupLevel(1);
    }
  };

  const handlePause = () => {
    CandyAudio.stopAll();
    setLevelStatus('paused');
  };

  const handleExitToArcade = () => {
    CandyAudio.stopAll();
    onExit();
  };

  // Warning when low on moves
  const isMovesLow = movesRemaining <= 5 && movesRemaining > 0;
  const isMovesCritical = movesRemaining <= 2 && movesRemaining > 0;

  // Board shake CSS transform
  const getBoardShakeStyle = () => {
    if (boardShake === 'heavy') return 'translate(2px, -2px) scale(0.995)';
    if (boardShake === 'medium') return 'translate(-1.5px, 1.5px)';
    if (boardShake === 'light') return 'translate(1px, -1px)';
    return 'none';
  };

  // Calculate star fill for HUD star meter
  const [thresh1, thresh2, thresh3] = levelConfig.starThresholds;
  const currentStars = rawScore >= thresh3 ? 3 : rawScore >= thresh2 ? 2 : rawScore >= thresh1 ? 1 : 0;
  const starProgressPercent = Math.min(100, Math.round((rawScore / thresh3) * 100));

  return (
    <div 
      className="relative w-full max-w-md mx-auto flex flex-col items-center select-none rounded-3xl overflow-hidden shadow-2xl min-h-[640px] font-['Plus_Jakarta_Sans',sans-serif] border-2 border-[#1688C9]/40"
      style={{
        background: 'radial-gradient(circle at 50% 25%, #072a44 0%, #071B2D 60%, #030d17 100%)',
      }}
    >
      {/* AMBIENT BACKGROUND CANDY BOKEH PARTICLES */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35 z-0">
        <div className="absolute top-10 left-6 w-32 h-32 rounded-full bg-[#00E5FF]/20 blur-2xl animate-pulse" />
        <div className="absolute top-1/2 right-4 w-40 h-40 rounded-full bg-[#FFD54F]/15 blur-3xl" />
        <div className="absolute bottom-12 left-10 w-36 h-36 rounded-full bg-[#8BCB3D]/15 blur-2xl" />
        <div className="absolute top-20 right-16 w-3 h-3 rounded-full bg-[#FFD54F] blur-xs animate-ping" />
        <div className="absolute bottom-32 right-12 w-2 h-2 rounded-full bg-[#8BCB3D] blur-xs animate-ping" />
      </div>

      {/* 1. STANDARDIZED TOP HUD: [EXIT] [LEVEL / MAP] [MOVES] [SOUND] [PAUSE] */}
      <div 
        id="candy-blast-hud"
        className="w-full bg-[#071B2D]/95 backdrop-blur-md px-3 sm:px-4 py-2 border-b border-[#1688C9]/40 flex items-center justify-between gap-1.5 z-20 shadow-md shrink-0"
      >
        {/* BUTTON: EXIT */}
        <button
          id="candy-exit-btn"
          onClick={handleExitToArcade}
          className="h-10 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 flex items-center gap-1 text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
          title="Exit Game"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">EXIT</span>
        </button>

        {/* CURRENT LEVEL DISPLAY (Hidden Total Level Count) */}
        <div
          id="candy-level-badge"
          className="flex-1 min-w-0 h-10 px-2.5 rounded-xl bg-gradient-to-r from-[#1688C9]/35 to-[#0E5282]/80 border border-[#1688C9]/60 text-white flex items-center gap-2 shadow-xs"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#1688C9] to-[#00E5FF] flex items-center justify-center text-slate-950 font-black text-xs shrink-0 shadow-xs">
            {levelNumber}
          </div>
          <div className="flex flex-col text-left min-w-0 leading-tight">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-wide truncate">
              LEVEL {levelNumber}
            </span>
            <span className="text-[8px] text-amber-300 font-bold uppercase tracking-wide truncate">
              {levelConfig.name}
            </span>
          </div>
        </div>

        {/* MOVES COUNTER CARD (Replaces the old 2-minute timer) */}
        <div 
          id="candy-moves-card"
          className={`flex-1 min-w-0 h-10 px-2.5 rounded-xl border flex items-center gap-1.5 shadow-xs transition-colors ${
            isMovesCritical
              ? 'bg-rose-500/25 border-rose-500 text-rose-300 animate-pulse'
              : isMovesLow
              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
              : 'bg-gradient-to-b from-[#071B2D]/90 to-[#030d17] border-slate-700 text-white'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
            isMovesCritical
              ? 'bg-rose-500 text-white font-black'
              : isMovesLow
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'bg-gradient-to-tr from-[#8BCB3D] to-[#558B2F] text-white font-bold'
          }`}>
            <Zap className="w-3 h-3 fill-current" />
          </div>
          <div className="flex flex-col min-w-0 leading-none">
            <span className={`text-[8px] font-black uppercase tracking-wider ${
              isMovesCritical ? 'text-rose-400' : isMovesLow ? 'text-amber-400' : 'text-slate-400'
            }`}>
              MOVES
            </span>
            <span className="text-sm font-black font-mono tracking-tight tabular-nums">
              {movesRemaining}
            </span>
          </div>
        </div>

        {/* BUTTON: SOUND TOGGLE */}
        <button
          id="candy-sound-toggle"
          onClick={() => setMuted(!muted)}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 flex items-center justify-center text-slate-200 transition-all cursor-pointer shadow-xs shrink-0"
          title={muted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#8BCB3D]" />}
        </button>

        {/* BUTTON: PAUSE */}
        <button
          id="candy-pause-toggle"
          onClick={handlePause}
          disabled={levelStatus !== 'playing'}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 flex items-center justify-center text-slate-200 transition-all cursor-pointer shadow-xs shrink-0 disabled:opacity-40 disabled:pointer-events-none"
          title="Pause Game"
        >
          <Pause className="w-4 h-4 fill-current text-white/80" />
        </button>
      </div>

      {/* 2. OBJECTIVES & STAR PROGRESS STRIP */}
      <div className="w-full bg-[#051322]/90 px-3 py-1.5 border-b border-white/10 flex items-center justify-between gap-2 z-20 shrink-0">
        {/* Objectives Progress Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1 shrink-0">
            <Target className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">GOALS:</span>
          </div>

          {objectives.map((obj, i) => {
            const isCompleted = obj.current >= obj.target;
            let iconText = '🎯';
            if (obj.type === 'clear_jelly') iconText = '❄️';
            else if (obj.type === 'clear_blockers') iconText = '🪨';
            else if (obj.type === 'collect_candy') iconText = '🍬';
            else if (obj.type === 'create_specials') iconText = '⚡';
            else if (obj.type === 'combo_specials') iconText = '💥';

            return (
              <div
                key={i}
                className={`px-2 py-0.5 rounded-lg border text-[11px] font-black flex items-center gap-1 shrink-0 transition-all ${
                  isCompleted
                    ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200'
                }`}
              >
                <span>{iconText}</span>
                <span>{obj.current}/{obj.target}</span>
                {isCompleted && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
              </div>
            );
          })}
        </div>

        {/* Score & Star Progress Meter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-0.5 bg-black/40 px-1.5 py-0.5 rounded-lg border border-white/5">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-3 h-3 ${
                  currentStars >= s
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_#FFD54F]'
                    : 'text-slate-600'
                }`}
              />
            ))}
          </div>
          <div className="text-xs font-mono font-black text-amber-300 tabular-nums">
            {rawScore.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 3. MAIN 8x8 MATCH-3 BOARD STAGE */}
      <div 
        className="relative w-full flex-1 flex flex-col items-center justify-center p-2.5 sm:p-3.5 overflow-hidden touch-none z-10"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {/* Floating Score Popups */}
        {floatingScores.map((fs) => (
          <div
            key={fs.id}
            className={`absolute z-40 pointer-events-none font-mono font-black animate-bounce text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] ${
              fs.isCombo ? 'text-[#FFD54F] text-sm sm:text-base scale-110' : 'text-white text-xs sm:text-sm'
            }`}
            style={{
              left: `${(fs.x / BOARD_COLS) * 100 + 4}%`,
              top: `${(fs.y / BOARD_ROWS) * 100 + 2}%`,
            }}
          >
            +{fs.points.toLocaleString()}
            {fs.label && <div className="text-[9px] font-sans font-black text-[#8BCB3D] uppercase tracking-wider">{fs.label}</div>}
          </div>
        ))}

        {/* Radiant Sparkle Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none z-30 shadow-sm"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.alpha,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        {/* Sugar Crush Fireworks Banner */}
        {levelStatus === 'sugar_crush' && (
          <div className="absolute top-4 inset-x-4 z-40 bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-500 p-2.5 rounded-2xl text-center text-white shadow-2xl animate-pulse flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-200 fill-yellow-200 animate-spin" />
            <span className="font-black tracking-widest text-sm uppercase">SUGAR CRUSH BONUS!</span>
            <span className="font-mono font-bold text-xs bg-black/30 px-2 py-0.5 rounded-lg">+{sugarCrushBonus.toLocaleString()}</span>
          </div>
        )}

        {/* Professional 8x8 Grid Container with Holes, Jellies & Blockers */}
        <div 
          id="candy-board-frame"
          className="relative bg-[#061828] p-2 sm:p-2.5 rounded-2xl border-2 border-[#1688C9]/45 shadow-[0_12px_40px_rgba(0,0,0,0.7)] max-w-[390px] sm:max-w-[420px] w-full aspect-square select-none backdrop-blur-sm transition-transform duration-75"
          style={{ transform: getBoardShakeStyle() }}
        >
          {/* Unified VFX Layer for Special Blasts & Special+Special Combos */}
          <SpecialComboLayer combo={specialComboAnim} blastEffects={blastEffects} />

          {/* Canvas-Accelerated Explosion & Particle FX Layer */}
          <ExplosionCanvas ref={explosionCanvasRef} />

          {/* Reshuffle Overlay */}
          {isReshuffling && (
            <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white animate-in fade-in">
              <Sparkles className="w-8 h-8 text-[#8BCB3D] animate-spin mb-2" />
              <div className="font-black text-sm tracking-wider uppercase">No Moves Left!</div>
              <div className="text-[11px] text-slate-300">Reshuffling board...</div>
            </div>
          )}

          {/* Mathematical 8x8 Cell Grid: Stable Underlying Structure */}
          <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-1 sm:gap-1.5">
            {board.map((rowArr, r) =>
              rowArr.map((piece, c) => {
                const isHole = isHoleCell(r, c, levelConfig);
                const isBlocker = hasBlockerAt(r, c, blockerMap);
                const blockerHp = blockerMap[`${r},${c}`] || 0;
                const hasJelly = jellySet.has(`${r},${c}`);

                if (isHole) {
                  return (
                    <div
                      key={`hole_${r}_${c}`}
                      className="rounded-xl opacity-0 pointer-events-none"
                    />
                  );
                }

                const isSwapping = swappingPair && (
                  (swappingPair.from.row === r && swappingPair.from.col === c) ||
                  (swappingPair.to.row === r && swappingPair.to.col === c)
                );
                const isDragSource = activeSwipeFeedback?.from.row === r && activeSwipeFeedback?.from.col === c;
                const isTileSelected = selectedTile?.row === r && selectedTile?.col === c;

                return (
                  <div
                    key={`cell_slot_${r}_${c}`}
                    id={`candy-cell-${r}-${c}`}
                    onPointerDown={(e) => !isBlocker && handlePointerDown(e, r, c)}
                    className={`relative rounded-xl flex items-center justify-center touch-none transition-all duration-100 ${
                      isTileSelected
                        ? 'bg-blue-500/25 ring-2 ring-[#00E5FF] scale-105 z-20 shadow-[0_0_12px_rgba(0,229,255,0.75)]'
                        : isDragSource
                        ? 'bg-amber-500/25 ring-2 ring-[#FFD54F] scale-105 z-20'
                        : isSwapping
                        ? 'scale-105 z-20 bg-[#040f1a]/90'
                        : 'bg-[#040f1a]/80 border border-white/[0.08] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.6)] hover:border-[#1688C9]/40'
                    } ${isBlocker ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
                  >
                    {/* Subtle inner cell depth frame */}
                    <div className="absolute inset-0 rounded-xl border border-black/30 pointer-events-none" />

                    {/* Jelly Frosting Floor Tile */}
                    {hasJelly && <JellyOverlay size={42} />}

                    {/* Chocolate / Stone Blocker */}
                    {isBlocker && <BlockerGraphic hp={blockerHp} size={42} />}

                    {/* Regular or Special Candy */}
                    {!isBlocker && piece && (
                      <CandyGraphic
                        type={piece.type}
                        special={piece.special}
                        isSelected={piece.isSelected || isTileSelected}
                        isMatched={piece.isMatched}
                        isClearing={piece.isClearing}
                        isReacting={piece.isReacting}
                        isCharging={piece.isCharging}
                        isSpawningSpecial={piece.isSpawningSpecial}
                        isFormingSpecial={piece.isFormingSpecial}
                        isSpecialTriggered={piece.isSpecialTriggered}
                        fallOffset={piece.fallOffset}
                        convergeOffset={piece.convergeTarget ? {
                          x: (piece.convergeTarget.col - piece.col) * 44,
                          y: (piece.convergeTarget.row - piece.row) * 44,
                        } : undefined}
                        size={42}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Helper Bar */}
        <div className="mt-2 text-center text-[10px] text-slate-400 font-semibold tracking-wide flex items-center justify-center">
          <span>Swipe to match 3+ candies</span>
        </div>
      </div>

      {/* 4. PAUSE OVERLAY MODAL */}
      {levelStatus === 'paused' && (
        <div className="absolute inset-0 z-50 bg-[#071B2D]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-[#1688C9]/40 border border-[#00E5FF]/60 text-white flex items-center justify-center mb-3 shadow-xl">
            <Pause className="w-7 h-7 text-[#00E5FF]" />
          </div>
          <h3 className="text-xl font-black text-white mb-1">Level {levelNumber}: {levelConfig.name}</h3>
          <p className="text-xs text-slate-300 mb-4 font-mono">
            Score: <strong className="text-[#FFD54F]">{rawScore.toLocaleString()}</strong> • Moves Left: <strong>{movesRemaining}</strong>
          </p>

          <div className="w-full max-w-xs space-y-2.5">
            <button
              onClick={() => setLevelStatus('playing')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1688C9] to-[#00E5FF] hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Game</span>
            </button>

            <button
              onClick={handleRestart}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-white/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Level</span>
            </button>

            <button
              onClick={handleExitToArcade}
              className="w-full py-2 text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              Exit to Arcade
            </button>
          </div>
        </div>
      )}

      {/* 5. LEVEL COMPLETE / VICTORY MODAL (AUTOMATIC NEXT-LEVEL FLOW) */}
      {levelStatus === 'level_won' && (
        <div className="absolute inset-0 z-50 bg-gradient-to-b from-[#072a44] via-[#071B2D] to-[#030d17] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#8BCB3D]/20 border border-[#8BCB3D]/50 text-[#8BCB3D] text-xs font-black uppercase tracking-wider mb-2">
            <Award className="w-4 h-4" />
            <span>LEVEL COMPLETE!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            {levelConfig.name}
          </h2>

          {/* 3-Star Rating Animation */}
          <div className="flex items-center justify-center gap-2.5 my-3">
            {[1, 2, 3].map((starNum) => (
              <div
                key={starNum}
                className={`transform transition-transform duration-300 ${
                  starNum === 2 ? '-translate-y-2' : ''
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl border ${
                    earnedStars >= starNum
                      ? 'bg-gradient-to-tr from-amber-400 to-yellow-200 border-amber-300 text-slate-950 shadow-amber-500/40 animate-bounce'
                      : 'bg-slate-800 border-slate-700 text-slate-600'
                  }`}
                  style={{ animationDelay: `${starNum * 120}ms` }}
                >
                  <Star className={`w-8 h-8 ${earnedStars >= starNum ? 'fill-current' : ''}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Final Score Display */}
          <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight mb-1 drop-shadow-lg">
            {rawScore.toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-300 uppercase tracking-widest font-bold mb-4">
            FINAL LEVEL SCORE
          </div>

          {/* Objectives Completed Checklist */}
          <div className="w-full max-w-xs bg-slate-900/80 rounded-2xl p-3 border border-slate-700/80 mb-4 space-y-1.5 text-left text-xs">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Objectives Cleared:
            </div>
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-center justify-between text-slate-200 font-medium">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  <span>{obj.label || 'Goal'}</span>
                </span>
                <span className="font-bold text-emerald-400">{obj.target}/{obj.target}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons: NEXT LEVEL & REPLAY */}
          <div className="w-full max-w-xs space-y-2">
            <button
              id="candy-next-level-btn"
              onClick={handleNextLevel}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8BCB3D] to-[#7CB342] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-95 cursor-pointer"
            >
              <span>NEXT LEVEL</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              id="candy-replay-level-btn"
              onClick={handleRestart}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Level</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. LEVEL FAILED / OUT OF MOVES MODAL */}
      {levelStatus === 'level_lost' && (
        <div className="absolute inset-0 z-50 bg-gradient-to-b from-[#072a44] via-[#071B2D] to-[#030d17] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-400 flex items-center justify-center mb-2 shadow-xl">
            <RotateCcw className="w-7 h-7 animate-spin-reverse" />
          </div>

          <div className="text-xl font-black text-white mb-1">
            OUT OF MOVES!
          </div>
          <p className="text-xs text-slate-300 mb-4">
            Level {levelNumber} is challenging! Check remaining targets:
          </p>

          {/* Unmet Objectives Summary */}
          <div className="w-full max-w-xs bg-slate-900/80 rounded-2xl p-3 border border-slate-700/80 mb-4 space-y-2 text-left text-xs">
            {objectives.map((obj, i) => {
              const done = obj.current >= obj.target;
              return (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium truncate">{obj.label || 'Goal'}:</span>
                  <span className={`font-black font-mono ${done ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {obj.current} / {obj.target} {done ? '✓' : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Actions: TRY AGAIN & EXIT */}
          <div className="w-full max-w-xs space-y-2">
            <button
              onClick={handleRestart}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1688C9] to-[#00E5FF] hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>TRY AGAIN</span>
            </button>

            <button
              onClick={handleExitToArcade}
              className="w-full py-2 text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              Exit to Arcade
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
