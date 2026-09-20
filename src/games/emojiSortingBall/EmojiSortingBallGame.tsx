/**
 * EMOJI SORTING BALL - Independent Tournament 3D Logic Experience
 * - Complete duplicate architecture of Sorting Ball
 * - Distinct game identity, separate storage key, isolated state and progression
 * - Stylized 3D vinyl emoji spheres (never shrunk or distorted)
 * - Mandatory tube palette (Coral Red, Aqua Cyan, Royal Violet, Golden Amber, Emerald, Rose Pink, Electric Blue, Lime)
 * - 40 isomorphic tournament levels (100% solvable)
 * - Full Web Audio procedural sound engine
 * - Coordinated multi-ball group transfer, undo, hints, extra buffer tubes, and Par move scoring
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition, UserProfile } from '../../types';
import { EMOJI_SORTING_LEVELS, TOTAL_EMOJI_SORTING_LEVELS } from './levels';
import {
  EmojiKey,
  EmojiSortingGameState,
  EmojiSortingMoveRecord,
  EmojiSortingPlayerProgress,
  EmojiSortingLevelConfig,
  EmojiLevelScoreBreakdown,
} from './types';
import { EmojiSortingRenderer3D } from './emojiSortingRenderer3D';
import { emojiSortingAudio } from './emojiSortingAudio';
import { isEmojiStateSolved, findNextBestEmojiMove } from './solver';
import { EmojiSortingMenuModal } from './components/EmojiSortingMenuModal';
import { EmojiSortingLevelSelectModal } from './components/EmojiSortingLevelSelectModal';
import { EmojiSortingVictoryModal } from './components/EmojiSortingVictoryModal';
import { EmojiSortingLeaderboardModal } from './components/EmojiSortingLeaderboardModal';
import { EmojiSortingHowToPlayModal } from './components/EmojiSortingHowToPlayModal';
import { EmojiSortingAchievementsModal } from './components/EmojiSortingAchievementsModal';
import { EmojiSortingStatisticsModal } from './components/EmojiSortingStatisticsModal';
import { EmojiSortingSettingsModal } from './components/EmojiSortingSettingsModal';
import { EmojiSortingAboutModal } from './components/EmojiSortingAboutModal';
import { EmojiSortingReferenceVideoModal } from './EmojiSortingReferenceVideoModal';
import {
  ArrowLeft,
  RotateCcw,
  Undo2,
  Plus,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Film,
  Flame,
  Lightbulb,
  Clock,
} from 'lucide-react';

interface EmojiSortingBallGameProps {
  game: GameDefinition;
  profile?: UserProfile;
  onGameOver: (score: number, duration: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

const STORAGE_KEY = 'teleplus_emoji_sorting_ball_progression_v1';

export const EmojiSortingBallGame: React.FC<EmojiSortingBallGameProps> = ({
  game,
  profile,
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  // 1. Persistent Progression & Scoring (Independent from original Sorting Ball)
  const [progress, setProgress] = useState<EmojiSortingPlayerProgress>(() => {
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
          stars: parsed.stars || {},
          levelStars: parsed.levelStars || parsed.stars || {},
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

  const saveProgress = (newProg: EmojiSortingPlayerProgress) => {
    setProgress(newProg);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProg));
    } catch {
      // Storage fallback
    }
  };

  // 2. Active Game Flow States (Defaults to MENU per design)
  const [gameState, setGameState] = useState<EmojiSortingGameState>('MENU');
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(1);
  const [currentTubes, setCurrentTubes] = useState<EmojiKey[][]>([]);
  const [selectedTubeIndex, setSelectedTubeIndex] = useState<number | null>(null);
  const [selectedGroupCount, setSelectedGroupCount] = useState<number>(1);
  const [moveHistory, setMoveHistory] = useState<EmojiSortingMoveRecord[]>([]);
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
  const [lastScoreBreakdown, setLastScoreBreakdown] = useState<EmojiLevelScoreBreakdown>({
    basePoints: 1000,
    moveBonus: 500,
    timeBonus: 250,
    undoPenalty: 0,
    hintPenalty: 0,
    extraTubePenalty: 0,
    totalScore: 1750,
    finalLevelScore: 1750,
    moves: 12,
    optimalParMoves: 12,
    timeTakenSeconds: 30,
    stars: 3,
  });
  const [isNewBestScore, setIsNewBestScore] = useState<boolean>(false);

  // 3. 3D WebGL Canvas
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const renderer3DRef = useRef<EmojiSortingRenderer3D | null>(null);

  // Sync audio master mute
  useEffect(() => {
    emojiSortingAudio.isAudioEnabled = soundActive;
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
  const currentConfig: EmojiSortingLevelConfig =
    EMOJI_SORTING_LEVELS.find((lvl) => lvl.level === currentLevelNumber) || EMOJI_SORTING_LEVELS[0];

  /**
   * Initialize and prepare a level
   */
  const loadLevel = useCallback((lvlNumber: number) => {
    const config = EMOJI_SORTING_LEVELS.find((l) => l.level === lvlNumber) || EMOJI_SORTING_LEVELS[0];
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

    const renderer = new EmojiSortingRenderer3D(canvasContainerRef.current);
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
   * Add 1 Extra Empty Buffer Tube
   * Penalty: -250 PTS
   */
  const handleAddExtraTube = () => {
    if (extraTubesAdded >= 2 || gameState !== 'PLAYING' || isAnimating) return;
    emojiSortingAudio.playButton();
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
    emojiSortingAudio.playButton();

    const nextMove = findNextBestEmojiMove(currentTubes, currentConfig.capacity);
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

    // Shake source tube gently
    renderer3DRef.current?.shakeTube(nextMove.from);

    setLastScoreGain({ amount: -150, label: 'HINT USED -150 PTS' });
    setTimeout(() => setLastScoreGain(null), 2000);
  };

  /**
   * Check if a tube has completed 4 matching emoji balls
   */
  const isTubeComplete = (tube: EmojiKey[], capacity: number) => {
    return tube.length === capacity && tube.every((c) => c === tube[0]);
  };

  /**
   * Execute Coordinated Group Transfer
   * Moves the connected group of identical emoji balls sequentially
   */
  const executeGroupTransfer = (
    fromIdx: number,
    toIdx: number,
    transferCount: number,
    movingEmoji: EmojiKey
  ) => {
    if (transferCount <= 0) return;

    setIsAnimating(true);

    if (transferCount > 1) {
      emojiSortingAudio.playGroupMove(transferCount);
      if (transferCount >= 3) {
        emojiSortingAudio.playCombo(transferCount);
      }
    } else {
      emojiSortingAudio.playDrop();
    }

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

    if (renderer3DRef.current) {
      renderer3DRef.current.animateSequentialGroupMove(
        fromIdx,
        toIdx,
        movingEmoji,
        transferCount,
        destCurrentCount,
        (stepIdx) => {
          emojiSortingAudio.playSequentialBallLaunch(stepIdx);
        },
        (stepIdx) => {
          emojiSortingAudio.playBallSettle(stepIdx);
        },
        () => {
          const nextTubes = currentTubes.map((t) => [...t]);
          for (let m = 0; m < transferCount; m++) {
            const b = nextTubes[fromIdx].pop()!;
            nextTubes[toIdx].push(b);
          }

          let tubeBonus = 0;
          if (isTubeComplete(nextTubes[toIdx], currentConfig.capacity)) {
            tubeBonus = 350;
            emojiSortingAudio.playTubeComplete();
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
              emoji: movingEmoji,
              emojiKey: movingEmoji,
              count: transferCount,
            },
          ]);
          setMovesCount((prev) => prev + 1);
          setIsAnimating(false);

          if (renderer3DRef.current) {
            renderer3DRef.current.setLevelState(nextTubes, null, 1);
          }

          if (isEmojiStateSolved(nextTubes, currentConfig.capacity)) {
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

    // A. No tube selected: Select Source Tube
    if (selectedTubeIndex === null) {
      const tube = currentTubes[tappedIndex];
      if (!tube || tube.length === 0) return;

      if (isTubeComplete(tube, currentConfig.capacity)) {
        emojiSortingAudio.playInvalid();
        renderer3DRef.current?.shakeTube(tappedIndex);
        return;
      }

      const topEmoji = tube[tube.length - 1];
      let groupCount = 0;
      for (let k = tube.length - 1; k >= 0; k--) {
        if (tube[k] === topEmoji) groupCount++;
        else break;
      }

      setSelectedTubeIndex(tappedIndex);
      setSelectedGroupCount(groupCount);
      emojiSortingAudio.playSelect();

      if (renderer3DRef.current) {
        renderer3DRef.current.setLevelState(currentTubes, tappedIndex, groupCount);
      }
      return;
    }

    // B. Same tube tapped again: Deselect
    if (selectedTubeIndex === tappedIndex) {
      setSelectedTubeIndex(null);
      setSelectedGroupCount(1);
      emojiSortingAudio.playSelect();
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

    const movingEmoji = sourceTube[sourceTube.length - 1];
    const isDestEmpty = destTube.length === 0;
    const destSpace = currentConfig.capacity - destTube.length;
    const destMatchesEmoji = !isDestEmpty && destTube[destTube.length - 1] === movingEmoji;

    if (!isDestEmpty && !destMatchesEmoji) {
      // If tapped destination is another playable tube with emoji balls, switch selection
      if (destTube.length > 0 && !isTubeComplete(destTube, currentConfig.capacity)) {
        const newTopEmoji = destTube[destTube.length - 1];
        let newGroupCount = 0;
        for (let k = destTube.length - 1; k >= 0; k--) {
          if (destTube[k] === newTopEmoji) newGroupCount++;
          else break;
        }
        setSelectedTubeIndex(toIdx);
        setSelectedGroupCount(newGroupCount);
        emojiSortingAudio.playSelect();
        if (renderer3DRef.current) {
          renderer3DRef.current.setLevelState(currentTubes, toIdx, newGroupCount);
        }
        return;
      }

      emojiSortingAudio.playInvalid();
      renderer3DRef.current?.shakeTube(toIdx);
      return;
    }

    if (destSpace <= 0) {
      emojiSortingAudio.playInvalid();
      renderer3DRef.current?.shakeTube(toIdx);
      return;
    }

    const transferCount = Math.min(selectedGroupCount, destSpace);
    if (transferCount <= 0) {
      emojiSortingAudio.playInvalid();
      renderer3DRef.current?.shakeTube(toIdx);
      return;
    }

    executeGroupTransfer(fromIdx, toIdx, transferCount, movingEmoji);
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
      setSelectedTubeIndex(null);
      setSelectedGroupCount(1);
      emojiSortingAudio.playSelect();
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
    const { fromIndex, toIndex, emoji, count = 1 } = lastMove;

    const nextTubes = currentTubes.map((t) => [...t]);
    if (nextTubes[toIndex].length < count) return;

    setIsAnimating(true);
    emojiSortingAudio.playUndo();

    const destStart = nextTubes[fromIndex].length;

    if (renderer3DRef.current) {
      renderer3DRef.current.animateSequentialGroupMove(
        toIndex,
        fromIndex,
        emoji,
        count,
        destStart,
        (stepIdx) => emojiSortingAudio.playSequentialBallLaunch(stepIdx),
        (stepIdx) => emojiSortingAudio.playBallSettle(stepIdx),
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
    emojiSortingAudio.playButton();
    loadLevel(currentLevelNumber);
  };

  /**
   * Handle Comprehensive Level Complete & Scoring
   */
  const handleLevelComplete = (finalTubes: EmojiKey[][]) => {
    setGameState('LEVEL_COMPLETE');
    emojiSortingAudio.playLevelWin();

    const finalMoves = movesCount + 1;
    const par = currentConfig.optimalMoves;
    const timeTaken = Math.max(1, elapsedSeconds);

    const basePoints = 1000;

    let moveBonus = 500;
    if (finalMoves <= par) {
      moveBonus = 500 + (par - finalMoves) * 150;
    } else {
      moveBonus = Math.max(50, 500 - (finalMoves - par) * 45);
    }

    let timeBonus = 100;
    if (timeTaken <= 20) timeBonus = 400;
    else if (timeTaken <= 40) timeBonus = 250;
    else if (timeTaken <= 80) timeBonus = 120;
    else timeBonus = 40;

    const undoPenalty = undosUsedCount * 50;
    const hintPenalty = hintsUsedCount * 150;
    const extraTubePenalty = extraTubesAdded * 250;

    const totalLevelScore = Math.max(
      150,
      basePoints + moveBonus + timeBonus - undoPenalty - hintPenalty - extraTubePenalty
    );

    let stars = 1;
    if (finalMoves <= par && extraTubesAdded === 0) stars = 3;
    else if (finalMoves <= par + 3) stars = 2;

    const breakdown: EmojiLevelScoreBreakdown = {
      basePoints,
      moveBonus,
      timeBonus,
      undoPenalty,
      hintPenalty,
      extraTubePenalty,
      totalScore: totalLevelScore,
      finalLevelScore: totalLevelScore,
      moves: finalMoves,
      optimalParMoves: par,
      timeTakenSeconds: timeTaken,
      stars,
    };
    setLastScoreBreakdown(breakdown);

    const prevBestScore = progress.levelScores[currentLevelNumber] || 0;
    const isNewBest = totalLevelScore > prevBestScore;
    setIsNewBestScore(isNewBest);

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

    const totalCumulative = (Object.values(updatedScores) as number[]).reduce((a: number, b: number) => a + b, 0);

    const newProgress: EmojiSortingPlayerProgress = {
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

    if (currentLevelNumber >= TOTAL_EMOJI_SORTING_LEVELS) {
      onGameOver(totalCumulative, elapsedSeconds);
    }
  };

  /**
   * Reset All Progress (Settings Modal)
   */
  const handleResetProgress = () => {
    const blank: EmojiSortingPlayerProgress = {
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
    emojiSortingAudio.playButton();
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
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif] text-slate-800"
      style={{
        background: `
          radial-gradient(circle at 18% 12%, #FFE8E8 0%, transparent 48%),
          radial-gradient(circle at 82% 16%, #E8F6FF 0%, transparent 45%),
          radial-gradient(circle at 50% 45%, #F7EFFF 0%, transparent 60%),
          radial-gradient(circle at 15% 85%, #E7F9F3 0%, transparent 50%),
          radial-gradient(circle at 85% 88%, #FFE8E8 0%, transparent 45%),
          #FAF7FD
        `,
      }}
    >
      {/* ===================================================================
          1. IN-GAME TOURNAMENT APP BAR (Visible during PLAYING)
         =================================================================== */}
      {gameState === 'PLAYING' && (
        <header className="w-full h-14 sm:h-15 bg-white/80 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 border-b border-purple-100/80 z-30 shrink-0 shadow-xs">
          {/* Left: [ BACK TO MENU ] Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                emojiSortingAudio.playButton();
                setGameState('MENU');
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer border border-purple-100 shadow-xs"
              title="Return to Main Menu"
              aria-label="Return to Main Menu"
            >
              <ArrowLeft className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-black uppercase tracking-wider">
                MENU
              </span>
            </button>

            {/* Level Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200">
              <span className="text-[11px] font-black text-violet-700 font-mono uppercase">
                LVL {currentLevelNumber} / {TOTAL_EMOJI_SORTING_LEVELS}
              </span>
            </div>
          </div>

          {/* Center: Live Timer & Level Score */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-slate-700 font-mono text-xs shadow-xs">
              <Clock className="w-3.5 h-3.5 text-pink-500" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50/90 border border-amber-200 text-amber-800 font-mono text-xs shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{currentScore.toLocaleString()} PTS</span>
            </div>
          </div>

          {/* Right: Demo Video, Sound, Fullscreen, Exit */}
          <div className="flex items-center gap-1.5">
            {/* Demo Video */}
            <button
              onClick={() => {
                emojiSortingAudio.playButton();
                setIsVideoModalOpen(true);
              }}
              className="w-8.5 h-8.5 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer border border-purple-100 shadow-xs"
              title="Demo Video"
              aria-label="Demo Video"
            >
              <Film className="w-4 h-4 text-amber-500" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundActive(!soundActive)}
              className="w-8.5 h-8.5 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer border border-purple-100 shadow-xs"
              aria-label="Toggle Sound"
            >
              {soundActive ? (
                <Volume2 className="w-4 h-4 text-violet-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="w-8.5 h-8.5 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer border border-purple-100 shadow-xs"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-slate-600" />
              ) : (
                <Maximize2 className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Exit Game */}
            <button
              onClick={handleExitGame}
              className="w-8.5 h-8.5 rounded-xl bg-rose-50 hover:bg-rose-100 hover:text-rose-700 active:scale-95 text-rose-500 flex items-center justify-center transition-all cursor-pointer border border-rose-200 shadow-xs"
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
      <main className="relative flex-1 w-full flex flex-col overflow-hidden bg-transparent">
        {/* Background Decorative Faint Silhouettes & Soft Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute top-[8%] left-[20%] w-72 h-72 rounded-full bg-purple-200/35 blur-3xl" />
          <div className="absolute top-[35%] right-[15%] w-80 h-80 rounded-full bg-pink-200/30 blur-3xl" />
          <div className="absolute bottom-[10%] left-[25%] w-80 h-80 rounded-full bg-teal-200/30 blur-3xl" />

          {/* Faint subtle emoji silhouettes in background */}
          <span className="absolute top-[18%] left-[6%] text-8xl opacity-[0.04] blur-[0.5px]">⭐</span>
          <span className="absolute top-[28%] right-[8%] text-8xl opacity-[0.04] blur-[0.5px]">🎈</span>
          <span className="absolute bottom-[22%] left-[8%] text-8xl opacity-[0.04] blur-[0.5px]">🌟</span>
          <span className="absolute bottom-[18%] right-[6%] text-8xl opacity-[0.04] blur-[0.5px]">💎</span>
        </div>

        {/* IN-GAME SECONDARY HUD BAR (Moves, Par, Undo, Hint, Add Buffer Tube) */}
        {gameState === 'PLAYING' && (
          <div className="w-full max-w-xl mx-auto px-4 pt-3 pb-1 flex items-center justify-between z-20 pointer-events-auto">
            {/* Left: Restart */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="w-10 h-10 rounded-xl bg-white/90 hover:bg-white active:scale-95 text-slate-700 hover:text-slate-900 flex items-center justify-center border border-purple-100 hover:border-violet-300 transition-all cursor-pointer shadow-xs"
                aria-label="Restart Level"
                title="Restart Level"
              >
                <RotateCcw className="w-4.5 h-4.5 stroke-[2.2]" />
              </button>
            </div>

            {/* Center: Moves & Par Pill */}
            <button
              onClick={() => setGameState('LEVEL_SELECT')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/90 border border-purple-100 hover:border-violet-300 backdrop-blur-md shadow-xs active:scale-98 transition-all cursor-pointer"
              title="Choose Level"
            >
              <div className="flex items-center gap-2 text-xs font-mono font-medium">
                <span className="text-slate-500">
                  Moves:{' '}
                  <strong className="text-slate-800 font-mono font-bold">
                    {movesCount}
                  </strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-violet-700 font-mono font-semibold">
                  Par: {currentConfig.optimalMoves}
                </span>
              </div>
            </button>

            {/* Right: Hint, Undo & Add Extra Tube */}
            <div className="flex items-center gap-2">
              {/* Hint Button */}
              <button
                onClick={handleRequestHint}
                className="w-10 h-10 rounded-xl bg-white/90 hover:bg-amber-50 active:scale-95 text-amber-600 flex items-center justify-center border border-amber-200 hover:border-amber-300 transition-all cursor-pointer shadow-xs"
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
                  className={`w-10 h-10 rounded-xl bg-white/90 hover:bg-purple-50 active:scale-95 text-violet-700 flex items-center justify-center border border-purple-100 hover:border-violet-300 transition-all cursor-pointer shadow-xs ${
                    moveHistory.length === 0 || undosRemaining <= 0
                      ? 'opacity-40 cursor-not-allowed'
                      : ''
                  }`}
                  aria-label="Undo Move"
                  title="Undo Move"
                >
                  <Undo2 className="w-4.5 h-4.5 stroke-[2.2]" />
                </button>

                <div className="absolute -bottom-1 -left-1 px-1.5 py-0.2 rounded-full bg-violet-600 border border-white text-[9px] font-black text-white shadow-xs">
                  {undosRemaining}
                </div>
              </div>

              {/* Extra Tube Button (+1) */}
              <button
                onClick={handleAddExtraTube}
                disabled={extraTubesAdded >= 2}
                className={`w-10 h-10 rounded-xl bg-white/90 hover:bg-emerald-50 active:scale-95 text-emerald-700 flex items-center justify-center border border-emerald-200 hover:border-emerald-300 transition-all cursor-pointer shadow-xs ${
                  extraTubesAdded >= 2 ? 'opacity-40 cursor-not-allowed' : ''
                }`}
                aria-label="Add Extra Buffer Tube (-250 PTS)"
                title="Add 1 Tube (-250 PTS)"
              >
                <div className="flex items-center text-emerald-600">
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
              className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-sm flex items-center gap-1.5 font-mono ${
                lastScoreGain.amount < 0
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-amber-50 border-amber-300 text-amber-800'
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
            <div className="px-4 py-1.5 rounded-full bg-amber-100/95 border border-amber-300 text-amber-900 text-xs font-bold tracking-wide shadow-md backdrop-blur-md flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
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
        <EmojiSortingMenuModal
          progress={progress}
          onPlay={() => {
            emojiSortingAudio.playButton();
            setGameState('PLAYING');
          }}
          onOpenLevels={() => {
            emojiSortingAudio.playButton();
            setGameState('LEVEL_SELECT');
          }}
          onOpenLeaderboard={() => {
            emojiSortingAudio.playButton();
            setGameState('LEADERBOARD');
          }}
          onOpenHowToPlay={() => {
            emojiSortingAudio.playButton();
            setGameState('HOW_TO_PLAY');
          }}
          onOpenAchievements={() => {
            emojiSortingAudio.playButton();
            setGameState('ACHIEVEMENTS');
          }}
          onOpenStatistics={() => {
            emojiSortingAudio.playButton();
            setGameState('STATISTICS');
          }}
          onOpenSettings={() => {
            emojiSortingAudio.playButton();
            setGameState('SETTINGS');
          }}
          onOpenAbout={() => {
            emojiSortingAudio.playButton();
            setGameState('ABOUT');
          }}
          onExit={handleExitGame}
        />
      )}

      {/* ===================================================================
          4. LEADERBOARD MODAL
         =================================================================== */}
      <EmojiSortingLeaderboardModal
        isOpen={gameState === 'LEADERBOARD'}
        onClose={() => setGameState('MENU')}
        progress={progress}
        playerName={profile?.username || 'You'}
      />

      {/* ===================================================================
          5. HOW TO PLAY MODAL
         =================================================================== */}
      <EmojiSortingHowToPlayModal
        isOpen={gameState === 'HOW_TO_PLAY'}
        onClose={() => setGameState('MENU')}
      />

      {/* ===================================================================
          6. ACHIEVEMENTS MODAL
         =================================================================== */}
      <EmojiSortingAchievementsModal
        isOpen={gameState === 'ACHIEVEMENTS'}
        onClose={() => setGameState('MENU')}
        progress={progress}
      />

      {/* ===================================================================
          7. STATISTICS MODAL
         =================================================================== */}
      <EmojiSortingStatisticsModal
        isOpen={gameState === 'STATISTICS'}
        onClose={() => setGameState('MENU')}
        progress={progress}
      />

      {/* ===================================================================
          8. SETTINGS MODAL
         =================================================================== */}
      <EmojiSortingSettingsModal
        isOpen={gameState === 'SETTINGS'}
        onClose={() => setGameState('MENU')}
        onResetProgress={handleResetProgress}
      />

      {/* ===================================================================
          9. ABOUT MODAL
         =================================================================== */}
      <EmojiSortingAboutModal
        isOpen={gameState === 'ABOUT'}
        onClose={() => setGameState('MENU')}
      />

      {/* ===================================================================
          10. 40-LEVEL SELECTION MODAL
         =================================================================== */}
      <EmojiSortingLevelSelectModal
        isOpen={gameState === 'LEVEL_SELECT'}
        onClose={() => setGameState(gameState === 'LEVEL_SELECT' ? 'PLAYING' : 'MENU')}
        progress={progress}
        currentLevel={currentLevelNumber}
        onSelectLevel={(lvl) => {
          emojiSortingAudio.playButton();
          loadLevel(lvl);
          setGameState('PLAYING');
        }}
      />

      {/* ===================================================================
          11. LEVEL VICTORY MODAL
         =================================================================== */}
      <EmojiSortingVictoryModal
        isOpen={gameState === 'LEVEL_COMPLETE'}
        level={currentLevelNumber}
        totalLevels={TOTAL_EMOJI_SORTING_LEVELS}
        scoreBreakdown={lastScoreBreakdown}
        cumulativeTotalScore={progress.totalCumulativeScore}
        isNewBest={isNewBestScore}
        onNextLevel={() => {
          emojiSortingAudio.playButton();
          if (currentLevelNumber < TOTAL_EMOJI_SORTING_LEVELS) {
            loadLevel(currentLevelNumber + 1);
            setGameState('PLAYING');
          } else {
            setGameState('LEADERBOARD');
          }
        }}
        onReplay={() => {
          emojiSortingAudio.playButton();
          loadLevel(currentLevelNumber);
          setGameState('PLAYING');
        }}
        onGoToMenu={() => {
          emojiSortingAudio.playButton();
          setGameState('MENU');
        }}
        onOpenLeaderboard={() => {
          emojiSortingAudio.playButton();
          setGameState('LEADERBOARD');
        }}
      />

      {/* Sample Reference Video Modal */}
      <EmojiSortingReferenceVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </div>
  );
};
