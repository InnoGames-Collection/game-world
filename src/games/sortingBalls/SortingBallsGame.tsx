/**
 * SORTING BALLS - Professional Tournament-Quality 3D Experience
 * - Deep navy/midnight purple ambient gradient arena with subtle glow and vignette
 * - Coordinated color-group multi-ball transfers (2-4 balls move together as a unit)
 * - Authentic 3D glass tubes with metallic dual rims and floor contact shadows
 * - Substantial glossy 3D spheres occupying 85-90% of inner tube diameter (never shrunk!)
 * - Tournament HUD with real-time score, par efficiency rating, and rank badges
 * - 40 verified challenging tournament levels with strict progression locking
 * - Full Web Audio procedural synthesis with harmonic chords and fanfare
 * - Proper Main Menu opening, full navigation, in-game Back button, and multi-tier leaderboards
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition, UserProfile } from '../../types';
import { SORTING_LEVELS, TOTAL_SORTING_LEVELS } from './levels';
import {
  BallColorKey,
  GameState,
  MoveRecord,
  SortingPlayerProgress,
  SortingLevelConfig,
  LevelScoreBreakdown,
} from './types';
import { SortingRenderer3D } from './sortingRenderer3D';
import { sortingAudio } from './sortingAudio';
import { isStateSolved, findNextBestMove } from './solver';
import { SortingReferenceVideoModal } from './SortingReferenceVideoModal';
import { SortingMenuModal } from './components/SortingMenuModal';
import { SortingLeaderboardModal } from './components/SortingLeaderboardModal';
import { SortingHowToPlayModal } from './components/SortingHowToPlayModal';
import { SortingAchievementsModal } from './components/SortingAchievementsModal';
import { SortingStatisticsModal } from './components/SortingStatisticsModal';
import { SortingSettingsModal } from './components/SortingSettingsModal';
import { SortingAboutModal } from './components/SortingAboutModal';
import { SortingLevelSelectModal } from './components/SortingLevelSelectModal';
import { SortingVictoryModal } from './components/SortingVictoryModal';
import {
  ArrowLeft,
  RotateCcw,
  Undo2,
  Plus,
  Play,
  Home,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Star,
  Film,
  Trophy,
  Flame,
  Lightbulb,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface SortingBallsGameProps {
  game: GameDefinition;
  profile?: UserProfile;
  onGameOver: (score: number, duration: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

const STORAGE_KEY = 'teleplus_sorting_balls_progression_v3';

export const SortingBallsGame: React.FC<SortingBallsGameProps> = ({
  game,
  profile,
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  // 1. Persistent Progression & Scoring
  const [progress, setProgress] = useState<SortingPlayerProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          unlockedLevel: parsed.unlockedLevel || 1,
          completedLevels: parsed.completedLevels || [],
          totalCumulativeScore: parsed.totalCumulativeScore || 0,
          levelScores: parsed.levelScores || {},
          bestMoves: parsed.bestMoves || {},
          stars: parsed.stars || parsed.levelStars || {},
          levelStars: parsed.levelStars || {},
          levelBestTimes: parsed.levelBestTimes || {},
          stats: parsed.stats || {
            gamesPlayed: 0,
            totalUndosUsed: 0,
            totalHintsUsed: 0,
            totalExtraTubesUsed: 0,
          },
          highScore: parsed.highScore || 0,
        };
      }
    } catch {
      // Fallback
    }
    return {
      unlockedLevel: 1,
      completedLevels: [],
      totalCumulativeScore: 0,
      levelScores: {},
      bestMoves: {},
      stars: {},
      levelStars: {},
      levelBestTimes: {},
      stats: {
        gamesPlayed: 0,
        totalUndosUsed: 0,
        totalHintsUsed: 0,
        totalExtraTubesUsed: 0,
      },
      highScore: 0,
    };
  });

  const saveProgress = (newProg: SortingPlayerProgress) => {
    setProgress(newProg);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProg));
    } catch {
      // Storage fallback
    }
  };

  // 2. Active Game Flow States (Defaults to MENU per prompt requirement)
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(1);
  const [currentTubes, setCurrentTubes] = useState<BallColorKey[][]>([]);
  const [selectedTubeIndex, setSelectedTubeIndex] = useState<number | null>(null);
  const [selectedGroupCount, setSelectedGroupCount] = useState<number>(1);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [undosRemaining, setUndosRemaining] = useState<number>(5);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [lastScoreGain, setLastScoreGain] = useState<{ amount: number; label: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundActive, setSoundActive] = useState<boolean>(isAudioEnabled);
  const [extraTubesAdded, setExtraTubesAdded] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [undosUsedCount, setUndosUsedCount] = useState<number>(0);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [activeHintMessage, setActiveHintMessage] = useState<string | null>(null);

  // Active Gameplay Timer (seconds)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const levelTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Score breakdown for Victory modal
  const [lastScoreBreakdown, setLastScoreBreakdown] = useState<LevelScoreBreakdown>({
    basePoints: 1000,
    moveBonus: 500,
    timeBonus: 250,
    undoPenalty: 0,
    hintPenalty: 0,
    extraTubePenalty: 0,
    totalScore: 1750,
    moves: 12,
    optimalParMoves: 12,
    timeTakenSeconds: 30,
    stars: 3,
  });
  const [isNewBestScore, setIsNewBestScore] = useState<boolean>(false);

  // 3. 3D WebGL Canvas
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const renderer3DRef = useRef<SortingRenderer3D | null>(null);
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Sync audio master mute
  useEffect(() => {
    sortingAudio.isAudioEnabled = soundActive;
  }, [soundActive]);

  // Active level timer ticker
  useEffect(() => {
    if (gameState === 'PLAYING') {
      levelTimerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (levelTimerRef.current) {
        clearInterval(levelTimerRef.current);
        levelTimerRef.current = null;
      }
    }
    return () => {
      if (levelTimerRef.current) {
        clearInterval(levelTimerRef.current);
        levelTimerRef.current = null;
      }
    };
  }, [gameState]);

  // Current Level Config
  const currentConfig: SortingLevelConfig =
    SORTING_LEVELS.find((lvl) => lvl.level === currentLevelNumber) || SORTING_LEVELS[0];

  /**
   * Initialize and prepare a level
   */
  const loadLevel = useCallback((lvlNumber: number) => {
    const config = SORTING_LEVELS.find((l) => l.level === lvlNumber) || SORTING_LEVELS[0];
    setCurrentLevelNumber(config.level);
    const cloned = config.tubes.map((t) => [...t]);
    setCurrentTubes(cloned);
    setSelectedTubeIndex(null);
    setSelectedGroupCount(1);
    setMoveHistory([]);
    setMovesCount(0);
    setExtraTubesAdded(0);
    setUndosRemaining(5);
    setUndosUsedCount(0);
    setHintsUsedCount(0);
    setActiveHintMessage(null);
    setElapsedSeconds(0);
    setCurrentScore(0);
    setIsAnimating(false);
    setLastScoreGain(null);

    if (renderer3DRef.current) {
      renderer3DRef.current.setLevelState(cloned, null, 1);
    }
  }, []);

  // Mount load initial tubes
  useEffect(() => {
    loadLevel(progress.unlockedLevel || 1);
  }, [loadLevel, progress.unlockedLevel]);

  // Mount WebGL renderer
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const renderer = new SortingRenderer3D(canvasContainerRef.current);
    renderer3DRef.current = renderer;

    if (currentTubes.length > 0) {
      renderer.setLevelState(currentTubes, selectedTubeIndex, selectedGroupCount);
    }

    return () => {
      renderer.dispose();
      renderer3DRef.current = null;
    };
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  /**
   * Add 1 Extra Empty Tube
   * Penalty: -250 PTS
   */
  const handleAddExtraTube = () => {
    if (extraTubesAdded >= 2 || gameState !== 'PLAYING' || isAnimating) return;
    sortingAudio.playButton();
    const updated = [...currentTubes, []];
    setCurrentTubes(updated);
    setExtraTubesAdded((prev) => prev + 1);

    // Update lifetime stats
    saveProgress({
      ...progress,
      stats: {
        ...progress.stats,
        totalExtraTubesUsed: (progress.stats?.totalExtraTubesUsed || 0) + 1,
      },
    });

    setLastScoreGain({ amount: -250, label: 'EXTRA TUBE -250 PTS' });
    setTimeout(() => setLastScoreGain(null), 2000);

    if (renderer3DRef.current) {
      renderer3DRef.current.setLevelState(updated, selectedTubeIndex, selectedGroupCount);
    }
  };

  /**
   * Hint Feature
   * Analyzes current tubes with BFS solver and flashes the best move
   * Penalty: -150 PTS
   */
  const handleRequestHint = () => {
    if (gameState !== 'PLAYING' || isAnimating) return;
    sortingAudio.playButton();

    const nextMove = findNextBestMove(currentTubes, currentConfig.capacity);
    if (!nextMove) {
      setActiveHintMessage('No simple move found. Try using Undo or Add a Tube.');
      setTimeout(() => setActiveHintMessage(null), 3000);
      return;
    }

    setHintsUsedCount((prev) => prev + 1);
    saveProgress({
      ...progress,
      stats: {
        ...progress.stats,
        totalHintsUsed: (progress.stats?.totalHintsUsed || 0) + 1,
      },
    });

    const msg = `Hint: Move from Tube ${nextMove.from + 1} ➔ Tube ${nextMove.to + 1}`;
    setActiveHintMessage(msg);
    setTimeout(() => setActiveHintMessage(null), 4500);

    // Animate subtle tube shake to guide attention
    renderer3DRef.current?.shakeTube(nextMove.from);

    setLastScoreGain({ amount: -150, label: 'HINT USED -150 PTS' });
    setTimeout(() => setLastScoreGain(null), 2000);
  };

  /**
   * Check if a tube has completed 4 matching balls
   */
  const isTubeComplete = (tube: BallColorKey[], capacity: number) => {
    return tube.length === capacity && tube.every((c) => c === tube[0]);
  };

  /**
   * Execute Coordinated Group Transfer
   * Moves the connected group of identical-colored balls sequentially
   */
  const executeGroupTransfer = (
    fromIdx: number,
    toIdx: number,
    transferCount: number,
    movingColor: BallColorKey
  ) => {
    if (transferCount <= 0) return;

    setIsAnimating(true);

    // Play audio matching group size
    if (transferCount > 1) {
      sortingAudio.playGroupMove(transferCount);
      if (transferCount >= 3) {
        sortingAudio.playCombo(transferCount);
      }
    } else {
      sortingAudio.playDrop();
    }

    // Calculate score for this move
    let pts = transferCount * 100;
    let label = `+${pts}`;
    if (transferCount === 2) {
      pts = 260;
      label = `DUAL TRANSFER +${pts}`;
    } else if (transferCount === 3) {
      pts = 450;
      label = `TRIPLE COMBO +${pts}`;
    } else if (transferCount === 4) {
      pts = 750;
      label = `QUAD SWEEP +${pts}`;
    }

    const destCurrentCount = currentTubes[toIdx].length;

    // Sequential Automatic Group Move in Three.js
    if (renderer3DRef.current) {
      renderer3DRef.current.animateSequentialGroupMove(
        fromIdx,
        toIdx,
        movingColor,
        transferCount,
        destCurrentCount,
        (stepIdx) => {
          sortingAudio.playSequentialBallLaunch(stepIdx);
        },
        (stepIdx) => {
          sortingAudio.playBallSettle(stepIdx);
        },
        () => {
          // Animation complete callback: apply state update
          const nextTubes = currentTubes.map((t) => [...t]);
          for (let m = 0; m < transferCount; m++) {
            const b = nextTubes[fromIdx].pop()!;
            nextTubes[toIdx].push(b);
          }

          // Check if destination tube was completed
          let tubeBonus = 0;
          if (isTubeComplete(nextTubes[toIdx], currentConfig.capacity)) {
            tubeBonus = 350;
            sortingAudio.playTubeComplete();
            label = `TUBE COMPLETE! +${pts + tubeBonus}`;
          }

          const totalMovePts = pts + tubeBonus;
          setCurrentScore((prev) => prev + totalMovePts);
          setLastScoreGain({ amount: totalMovePts, label });
          setTimeout(() => setLastScoreGain(null), 1800);

          setCurrentTubes(nextTubes);
          setSelectedTubeIndex(null);
          setSelectedGroupCount(1);
          setMoveHistory((prev) => [
            ...prev,
            {
              fromIndex: fromIdx,
              toIndex: toIdx,
              color: movingColor,
              count: transferCount,
            },
          ]);
          setMovesCount((prev) => prev + 1);
          setIsAnimating(false);

          if (renderer3DRef.current) {
            renderer3DRef.current.setLevelState(nextTubes, null, 1);
          }

          // Check win condition
          if (isStateSolved(nextTubes, currentConfig.capacity)) {
            handleLevelComplete(nextTubes);
          }
        }
      );
    }
  };

  /**
   * Handle Tube Interaction: Tap Source -> Lift; Tap Dest -> Transfer
   */
  const handleTubeInteraction = (tappedIndex: number) => {
    if (gameState !== 'PLAYING' || isAnimating) return;

    // A. No tube currently selected: Select Source Tube
    if (selectedTubeIndex === null) {
      const tube = currentTubes[tappedIndex];
      if (!tube || tube.length === 0) return;

      // If already completed tube, feedback
      if (isTubeComplete(tube, currentConfig.capacity)) {
        sortingAudio.playInvalid();
        renderer3DRef.current?.shakeTube(tappedIndex);
        return;
      }

      // Detect top contiguous group of matching color
      const topColor = tube[tube.length - 1];
      let groupCount = 0;
      for (let k = tube.length - 1; k >= 0; k--) {
        if (tube[k] === topColor) groupCount++;
        else break;
      }

      // Elevate top group to clearly indicate selection
      setSelectedTubeIndex(tappedIndex);
      setSelectedGroupCount(groupCount);
      sortingAudio.playSelect();

      if (renderer3DRef.current) {
        renderer3DRef.current.setLevelState(currentTubes, tappedIndex, groupCount);
      }
      return;
    }

    // B. Same tube tapped again: Deselect
    if (selectedTubeIndex === tappedIndex) {
      setSelectedTubeIndex(null);
      setSelectedGroupCount(1);
      sortingAudio.playSelect();
      if (renderer3DRef.current) {
        renderer3DRef.current.setLevelState(currentTubes, null, 1);
      }
      return;
    }

    // C. Different tube tapped: Destination Tube
    const fromIdx = selectedTubeIndex;
    const toIdx = tappedIndex;
    const sourceTube = currentTubes[fromIdx];
    const destTube = currentTubes[toIdx];

    if (!sourceTube || sourceTube.length === 0) {
      setSelectedTubeIndex(null);
      setSelectedGroupCount(1);
      return;
    }

    const movingColor = sourceTube[sourceTube.length - 1];
    const isDestEmpty = destTube.length === 0;
    const destSpace = currentConfig.capacity - destTube.length;
    const destMatchesColor = !isDestEmpty && destTube[destTube.length - 1] === movingColor;

    // If destination is not empty and colors don't match:
    if (!isDestEmpty && !destMatchesColor) {
      // If tapped destination is another tube with balls and not complete, switch selection to it!
      if (destTube.length > 0 && !isTubeComplete(destTube, currentConfig.capacity)) {
        const newTopColor = destTube[destTube.length - 1];
        let newGroupCount = 0;
        for (let k = destTube.length - 1; k >= 0; k--) {
          if (destTube[k] === newTopColor) newGroupCount++;
          else break;
        }
        setSelectedTubeIndex(toIdx);
        setSelectedGroupCount(newGroupCount);
        sortingAudio.playSelect();
        if (renderer3DRef.current) {
          renderer3DRef.current.setLevelState(currentTubes, toIdx, newGroupCount);
        }
        return;
      }

      sortingAudio.playInvalid();
      renderer3DRef.current?.shakeTube(toIdx);
      return;
    }

    // Check if destination has room
    if (destSpace <= 0) {
      sortingAudio.playInvalid();
      renderer3DRef.current?.shakeTube(toIdx);
      return;
    }

    // Respect destination capacity
    const transferCount = Math.min(selectedGroupCount, destSpace);
    if (transferCount <= 0) {
      sortingAudio.playInvalid();
      renderer3DRef.current?.shakeTube(toIdx);
      return;
    }

    // Execute sequential transfer
    executeGroupTransfer(fromIdx, toIdx, transferCount, movingColor);
  };

  /**
   * Pointer Down on 3D Canvas
   */
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== 'PLAYING' || isAnimating) return;
    if (!renderer3DRef.current) return;

    const tubeIndex = renderer3DRef.current.getTubeAtCoordinates(e.clientX, e.clientY);

    if (tubeIndex !== null) {
      handleTubeInteraction(tubeIndex);
    } else if (selectedTubeIndex !== null) {
      // Tap background: Deselect
      setSelectedTubeIndex(null);
      setSelectedGroupCount(1);
      sortingAudio.playSelect();
      if (renderer3DRef.current) {
        renderer3DRef.current.setLevelState(currentTubes, null, 1);
      }
    }
  };

  /**
   * Undo last move
   */
  const handleUndo = () => {
    if (moveHistory.length === 0 || gameState !== 'PLAYING' || isAnimating) return;
    if (undosRemaining <= 0) return;

    const lastMove = moveHistory[moveHistory.length - 1];
    const { fromIndex, toIndex, color, count = 1 } = lastMove;

    const nextTubes = currentTubes.map((t) => [...t]);
    if (nextTubes[toIndex].length < count) return;

    setIsAnimating(true);
    sortingAudio.playUndo();

    const destStart = nextTubes[fromIndex].length;

    if (renderer3DRef.current) {
      renderer3DRef.current.animateSequentialGroupMove(
        toIndex,
        fromIndex,
        color,
        count,
        destStart,
        (stepIdx) => sortingAudio.playSequentialBallLaunch(stepIdx),
        (stepIdx) => sortingAudio.playBallSettle(stepIdx),
        () => {
          for (let i = 0; i < count; i++) {
            const ball = nextTubes[toIndex].pop()!;
            nextTubes[fromIndex].push(ball);
          }

          setCurrentTubes(nextTubes);
          setSelectedTubeIndex(null);
          setSelectedGroupCount(1);
          setMoveHistory((prev) => prev.slice(0, -1));
          setUndosRemaining((prev) => Math.max(0, prev - 1));
          setUndosUsedCount((prev) => prev + 1);

          // Update lifetime stats
          saveProgress({
            ...progress,
            stats: {
              ...progress.stats,
              totalUndosUsed: (progress.stats?.totalUndosUsed || 0) + 1,
            },
          });

          setIsAnimating(false);

          if (renderer3DRef.current) {
            renderer3DRef.current.setLevelState(nextTubes, null, 1);
          }
        }
      );
    }
  };

  /**
   * Reset current level
   */
  const handleReset = () => {
    sortingAudio.playButton();
    loadLevel(currentLevelNumber);
  };

  /**
   * Handle Comprehensive Level Complete & Scoring
   */
  const handleLevelComplete = (finalTubes: BallColorKey[][]) => {
    setGameState('LEVEL_COMPLETE');
    sortingAudio.playLevelWin();

    const finalMoves = movesCount + 1;
    const par = currentConfig.optimalMoves;
    const timeTaken = Math.max(1, elapsedSeconds);

    // 1. Base points: 1000
    const basePoints = 1000;

    // 2. Move Efficiency / Par bonus
    let moveBonus = 500;
    if (finalMoves <= par) {
      moveBonus = 500 + (par - finalMoves) * 150;
    } else {
      moveBonus = Math.max(50, 500 - (finalMoves - par) * 45);
    }

    // 3. Time speed bonus
    let timeBonus = 100;
    if (timeTaken <= 20) timeBonus = 400;
    else if (timeTaken <= 40) timeBonus = 250;
    else if (timeTaken <= 80) timeBonus = 120;
    else timeBonus = 40;

    // 4. Penalties
    const undoPenalty = undosUsedCount * 50;
    const hintPenalty = hintsUsedCount * 150;
    const extraTubePenalty = extraTubesAdded * 250;

    // 5. Total Level Score
    const totalLevelScore = Math.max(
      150,
      basePoints + moveBonus + timeBonus - undoPenalty - hintPenalty - extraTubePenalty
    );

    // Stars: 3 if <= par and no extra tubes, 2 if par+2, 1 otherwise
    let stars = 1;
    if (finalMoves <= par && extraTubesAdded === 0) stars = 3;
    else if (finalMoves <= par + 3) stars = 2;

    const breakdown: LevelScoreBreakdown = {
      basePoints,
      moveBonus,
      timeBonus,
      undoPenalty,
      hintPenalty,
      extraTubePenalty,
      totalScore: totalLevelScore,
      moves: finalMoves,
      optimalParMoves: par,
      timeTakenSeconds: timeTaken,
      stars,
    };
    setLastScoreBreakdown(breakdown);

    // Check if new best score
    const prevBestScore = progress.levelScores[currentLevelNumber] || 0;
    const isNewBest = totalLevelScore > prevBestScore;
    setIsNewBestScore(isNewBest);

    // Update Persistent Progress
    const nextUnlocked = Math.max(progress.unlockedLevel, Math.min(40, currentLevelNumber + 1));
    const completedSet = new Set<number>(progress.completedLevels);
    completedSet.add(currentLevelNumber);

    const updatedScores = {
      ...progress.levelScores,
      [currentLevelNumber]: Math.max(prevBestScore, totalLevelScore),
    };

    const prevBestMoves = progress.bestMoves[currentLevelNumber];
    const updatedBestMoves = {
      ...progress.bestMoves,
      [currentLevelNumber]: prevBestMoves ? Math.min(prevBestMoves, finalMoves) : finalMoves,
    };

    const prevBestTime = progress.levelBestTimes[currentLevelNumber];
    const updatedBestTimes = {
      ...progress.levelBestTimes,
      [currentLevelNumber]: prevBestTime ? Math.min(prevBestTime, timeTaken) : timeTaken,
    };

    const updatedStars = {
      ...progress.levelStars,
      [currentLevelNumber]: Math.max(stars, progress.levelStars[currentLevelNumber] || 0),
    };

    // Calculate total cumulative score across all completed levels
    const totalCumulative = (Object.values(updatedScores) as number[]).reduce((a: number, b: number) => a + b, 0);

    const newProgress: SortingPlayerProgress = {
      unlockedLevel: nextUnlocked,
      completedLevels: Array.from(completedSet),
      totalCumulativeScore: totalCumulative,
      levelScores: updatedScores,
      bestMoves: updatedBestMoves,
      stars: updatedStars,
      levelStars: updatedStars,
      levelBestTimes: updatedBestTimes,
      stats: {
        ...progress.stats,
        gamesPlayed: (progress.stats?.gamesPlayed || 0) + 1,
      },
      highScore: Math.max(progress.highScore || 0, totalLevelScore),
    };

    saveProgress(newProgress);

    if (currentLevelNumber >= 40) {
      onGameOver(totalCumulative, elapsedSeconds);
    }
  };

  /**
   * Reset All Progress (Settings Modal)
   */
  const handleResetProgress = () => {
    const blank: SortingPlayerProgress = {
      unlockedLevel: 1,
      completedLevels: [],
      totalCumulativeScore: 0,
      levelScores: {},
      bestMoves: {},
      stars: {},
      levelStars: {},
      levelBestTimes: {},
      stats: {
        gamesPlayed: 0,
        totalUndosUsed: 0,
        totalHintsUsed: 0,
        totalExtraTubesUsed: 0,
      },
      highScore: 0,
    };
    saveProgress(blank);
    loadLevel(1);
    setGameState('MENU');
  };

  /**
   * Exit Game Handler
   */
  const handleExitGame = () => {
    sortingAudio.playButton();
    if (progress.totalCumulativeScore > 0) {
      onGameOver(progress.totalCumulativeScore, elapsedSeconds);
    }
    onExit();
  };

  /**
   * Format seconds to MM:SS
   */
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif] bg-[#050917]">
      {/* ===================================================================
          1. IN-GAME TOURNAMENT APP BAR (Visible during PLAYING)
         =================================================================== */}
      {gameState === 'PLAYING' && (
        <header className="w-full h-14 sm:h-15 bg-[#070e24]/90 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 border-b border-white/[0.08] z-30 shrink-0 shadow-md">
          {/* Left: Prominent [ BACK TO MENU ] Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                sortingAudio.playButton();
                setGameState('MENU');
              }}
              className="px-3 py-1.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] active:scale-95 text-white flex items-center gap-1.5 transition-all cursor-pointer border border-white/10 shadow-sm"
              title="Return to Main Menu"
              aria-label="Return to Main Menu"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black uppercase tracking-wider">
                MENU
              </span>
            </button>

            {/* Level Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-400/25">
              <span className="text-[11px] font-black text-cyan-300 font-mono uppercase">
                LVL {currentLevelNumber} / {TOTAL_SORTING_LEVELS}
              </span>
            </div>
          </div>

          {/* Center: Live Timer & Level Score */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 text-slate-300 font-mono text-xs">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-amber-400/30 text-amber-300 font-mono text-xs shadow-inner">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{currentScore.toLocaleString()} PTS</span>
            </div>
          </div>

          {/* Right: Audio, Fullscreen, Video, Close */}
          <div className="flex items-center gap-1.5">
            {/* Demo Video */}
            <button
              onClick={() => {
                sortingAudio.playButton();
                setIsVideoModalOpen(true);
              }}
              className="w-8.5 h-8.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
              title="Demo Video"
              aria-label="Demo Video"
            >
              <Film className="w-4 h-4 text-amber-400/90" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundActive(!soundActive)}
              className="w-8.5 h-8.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
              aria-label="Toggle Sound"
            >
              {soundActive ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="w-8.5 h-8.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-slate-300" />
              ) : (
                <Maximize2 className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* Exit Game */}
            <button
              onClick={handleExitGame}
              className="w-8.5 h-8.5 rounded-xl bg-white/[0.05] hover:bg-rose-950/40 hover:text-rose-300 active:scale-95 text-slate-400 flex items-center justify-center transition-all cursor-pointer border border-white/10"
              aria-label="Exit Game"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* ===================================================================
          2. PUZZLE ARENA (3D Canvas + In-Game HUD Controls)
         =================================================================== */}
      <main className="relative flex-1 w-full flex flex-col overflow-hidden bg-[#050917]">
        {/* Background Ambient Aura */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 25%, #0e1738 0%, #0a112c 45%, #060a1c 85%, #030612 100%)',
          }}
        />

        {/* Floating Bokeh Motes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[22%] left-[18%] w-2 h-2 rounded-full bg-cyan-400/20 blur-[1px] animate-pulse" />
          <div
            className="absolute top-[35%] right-[16%] w-1.5 h-1.5 rounded-full bg-sky-300/25 blur-[1px] animate-pulse"
            style={{ animationDelay: '1.2s' }}
          />
          <div
            className="absolute bottom-[32%] left-[24%] w-2.5 h-2.5 rounded-full bg-indigo-400/15 blur-[1.5px] animate-pulse"
            style={{ animationDelay: '2.4s' }}
          />
        </div>

        {/* IN-GAME SECONDARY HUD BAR (Moves, Par, Undo, Hint, Add Tube) */}
        {gameState === 'PLAYING' && (
          <div className="w-full max-w-xl mx-auto px-4 pt-3 pb-1 flex items-center justify-between z-20 pointer-events-auto">
            {/* Left: Restart */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer shadow-sm"
                aria-label="Restart Level"
                title="Restart Level"
              >
                <RotateCcw className="w-4.5 h-4.5 stroke-[2.2]" />
              </button>
            </div>

            {/* Center: Moves & Par Pill */}
            <button
              onClick={() => setGameState('LEVEL_SELECT')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/70 border border-white/10 hover:border-cyan-500/30 backdrop-blur-md shadow-sm active:scale-98 transition-all cursor-pointer"
              title="Choose Level"
            >
              <div className="flex items-center gap-2 text-xs font-mono font-medium">
                <span className="text-slate-400">
                  Moves:{' '}
                  <strong className="text-white font-mono font-bold">
                    {movesCount}
                  </strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400/90 font-mono">
                  Par: {currentConfig.optimalMoves}
                </span>
              </div>
            </button>

            {/* Right: Hint, Undo & Add Extra Tube */}
            <div className="flex items-center gap-2">
              {/* Hint Button */}
              <button
                onClick={handleRequestHint}
                className="w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 active:scale-95 text-amber-300 flex items-center justify-center border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer shadow-sm"
                aria-label="Request Hint (-150 PTS)"
                title="Hint (-150 PTS)"
              >
                <Lightbulb className="w-4.5 h-4.5" />
              </button>

              {/* Undo Button with Remaining Badge */}
              <div className="relative">
                <button
                  onClick={handleUndo}
                  disabled={moveHistory.length === 0 || undosRemaining <= 0 || isAnimating}
                  className={`w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer shadow-sm ${
                    moveHistory.length === 0 || undosRemaining <= 0
                      ? 'opacity-40 cursor-not-allowed'
                      : ''
                  }`}
                  aria-label="Undo Move"
                  title="Undo Move"
                >
                  <Undo2 className="w-4.5 h-4.5 text-cyan-300 stroke-[2.2]" />
                </button>

                <div className="absolute -bottom-1 -left-1 px-1.5 py-0.2 rounded-full bg-cyan-600 border border-white/60 text-[9px] font-black text-white shadow-xs">
                  {undosRemaining}
                </div>
              </div>

              {/* Extra Tube Button (+1) */}
              <button
                onClick={handleAddExtraTube}
                disabled={extraTubesAdded >= 2}
                className={`w-10 h-10 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer shadow-sm ${
                  extraTubesAdded >= 2 ? 'opacity-40 cursor-not-allowed' : ''
                }`}
                aria-label="Add Extra Buffer Tube (-250 PTS)"
                title="Add 1 Tube (-250 PTS)"
              >
                <div className="flex items-center text-emerald-400">
                  <span className="text-xs font-bold font-mono">1+</span>
                  <Plus className="w-3.5 h-3.5 stroke-[2.5] -ml-0.5" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Live Score Gain / Penalty Floating Notification */}
        {lastScoreGain && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div
              className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm flex items-center gap-1.5 font-mono ${
                lastScoreGain.amount < 0
                  ? 'bg-rose-950/90 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900/90 border-amber-400/40 text-amber-300'
              }`}
            >
              <span>✦</span>
              <span>{lastScoreGain.label}</span>
              <span>✦</span>
            </div>
          </div>
        )}

        {/* Active Hint Banner */}
        {activeHintMessage && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-bold tracking-wide shadow-xl backdrop-blur-md flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{activeHintMessage}</span>
            </div>
          </div>
        )}

        {/* 3D WEBGL ARENA CONTAINER */}
        <div
          ref={canvasContainerRef}
          onPointerDown={handleCanvasPointerDown}
          className="relative flex-1 w-full h-full cursor-pointer touch-none"
        />
      </main>

      {/* ===================================================================
          3. FULL MAIN PRE-GAME MENU MODAL (Opening Screen by Default)
         =================================================================== */}
      {gameState === 'MENU' && (
        <SortingMenuModal
          progress={progress}
          onPlay={() => {
            sortingAudio.playButton();
            setGameState('PLAYING');
          }}
          onOpenLevels={() => {
            sortingAudio.playButton();
            setGameState('LEVEL_SELECT');
          }}
          onOpenLeaderboard={() => {
            sortingAudio.playButton();
            setGameState('LEADERBOARD');
          }}
          onOpenHowToPlay={() => {
            sortingAudio.playButton();
            setGameState('HOW_TO_PLAY');
          }}
          onOpenAchievements={() => {
            sortingAudio.playButton();
            setGameState('ACHIEVEMENTS');
          }}
          onOpenStatistics={() => {
            sortingAudio.playButton();
            setGameState('STATISTICS');
          }}
          onOpenSettings={() => {
            sortingAudio.playButton();
            setGameState('SETTINGS');
          }}
          onOpenAbout={() => {
            sortingAudio.playButton();
            setGameState('ABOUT');
          }}
          onExit={handleExitGame}
        />
      )}

      {/* ===================================================================
          4. LEADERBOARD MODAL
         =================================================================== */}
      <SortingLeaderboardModal
        isOpen={gameState === 'LEADERBOARD'}
        onClose={() => setGameState('MENU')}
        progress={progress}
        playerName={profile?.displayName || 'You'}
      />

      {/* ===================================================================
          5. HOW TO PLAY MODAL
         =================================================================== */}
      <SortingHowToPlayModal
        isOpen={gameState === 'HOW_TO_PLAY'}
        onClose={() => setGameState('MENU')}
      />

      {/* ===================================================================
          6. ACHIEVEMENTS MODAL
         =================================================================== */}
      <SortingAchievementsModal
        isOpen={gameState === 'ACHIEVEMENTS'}
        onClose={() => setGameState('MENU')}
        progress={progress}
      />

      {/* ===================================================================
          7. STATISTICS MODAL
         =================================================================== */}
      <SortingStatisticsModal
        isOpen={gameState === 'STATISTICS'}
        onClose={() => setGameState('MENU')}
        progress={progress}
      />

      {/* ===================================================================
          8. SETTINGS MODAL
         =================================================================== */}
      <SortingSettingsModal
        isOpen={gameState === 'SETTINGS'}
        onClose={() => setGameState('MENU')}
        onResetProgress={handleResetProgress}
      />

      {/* ===================================================================
          9. ABOUT MODAL
         =================================================================== */}
      <SortingAboutModal
        isOpen={gameState === 'ABOUT'}
        onClose={() => setGameState('MENU')}
      />

      {/* ===================================================================
          10. 40-LEVEL SELECTION MODAL
         =================================================================== */}
      <SortingLevelSelectModal
        isOpen={gameState === 'LEVEL_SELECT'}
        onClose={() => setGameState(gameState === 'LEVEL_SELECT' ? 'PLAYING' : 'MENU')}
        progress={progress}
        currentLevel={currentLevelNumber}
        onSelectLevel={(lvl) => {
          sortingAudio.playButton();
          loadLevel(lvl);
          setGameState('PLAYING');
        }}
      />

      {/* ===================================================================
          11. LEVEL VICTORY MODAL
         =================================================================== */}
      <SortingVictoryModal
        isOpen={gameState === 'LEVEL_COMPLETE'}
        level={currentLevelNumber}
        totalLevels={TOTAL_SORTING_LEVELS}
        scoreBreakdown={lastScoreBreakdown}
        cumulativeTotalScore={progress.totalCumulativeScore}
        isNewBest={isNewBestScore}
        onNextLevel={() => {
          sortingAudio.playButton();
          if (currentLevelNumber < TOTAL_SORTING_LEVELS) {
            loadLevel(currentLevelNumber + 1);
            setGameState('PLAYING');
          } else {
            setGameState('LEADERBOARD');
          }
        }}
        onReplay={() => {
          sortingAudio.playButton();
          loadLevel(currentLevelNumber);
          setGameState('PLAYING');
        }}
        onGoToMenu={() => {
          sortingAudio.playButton();
          setGameState('MENU');
        }}
        onOpenLeaderboard={() => {
          sortingAudio.playButton();
          setGameState('LEADERBOARD');
        }}
      />

      {/* Sample Reference Video Modal */}
      <SortingReferenceVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </div>
  );
};
