/**
 * Juicy Match - Master Match-3 Fruit Game Component
 * Features tropical visuals, 3D glossy fruit assets, responsive board grid,
 * combo feedback, booster tools, banana mascot, and complete 40-level progression.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FruitType,
  SpecialType,
  Cell,
  LevelConfig,
  LevelObjective,
  BoosterType,
  FloatingScore,
  ComboFeedbackItem,
} from './types';
import { FruitGraphic, BlockerGraphic, UnderlayGraphic, OverlayGraphic } from './fruitRenderer';
import { soundManager } from './audioEngine';
import { JuicyStorage, JuicyMatchSaveData } from './storage';
import { ALL_40_LEVELS, getLevelConfig } from './levelBank';
import {
  createInitialBoard,
  hasLegalMoves,
  reshuffleMovableFruits,
  findMatches,
  handleSpecialCombination,
  activateSpecialPiece,
  damageBlockersAndUnderlays,
  applyGravity,
  refillTopCells,
} from './matchLogic';
import { MapScreen } from './MapScreen';
import { MainMenuScreen } from './MainMenuScreen';
import {
  HowToPlayModal,
  AchievementsModal,
  BoostersModal,
  StatisticsModal,
  SettingsModal,
  AboutModal,
  DailyChallengeModal,
} from './CandyJuicyModals';
import { GameLeaderboardModal, GAME_CONFIGS } from '../../components/gameNavigation';
import { checkAchievements, AchievementDef } from './achievements';
import {
  DailyRewardModal,
  LevelStartModal,
  WinModal,
  FailModal,
  AchievementGiftModal,
  PauseModal,
} from './modals';
import { ArrowLeft, Pause, Volume2, VolumeX, Star, Hammer, RefreshCw, Zap, Disc } from 'lucide-react';

interface JuicyMatchGameProps {
  onBackToHub?: () => void;
  onLevelComplete?: (score: number, durationSeconds?: number) => void;
  onScoreUpdate?: (score: number) => void;
}

export const JuicyMatchGame: React.FC<JuicyMatchGameProps> = ({
  onBackToHub,
  onLevelComplete,
  onScoreUpdate,
}) => {
  // Persistence state
  const [saveData, setSaveData] = useState<JuicyMatchSaveData>(() => JuicyStorage.load());

  // View state: 'menu' (Default Main Menu) | 'map' (40 Stages Map) | 'playing' (Board)
  const [viewMode, setViewMode] = useState<'menu' | 'map' | 'playing'>('menu');
  const [activeModal, setActiveModal] = useState<
    | 'none'
    | 'daily_reward'
    | 'level_start'
    | 'win'
    | 'fail'
    | 'pause'
    | 'achievement_gift'
    | 'how_to_play'
    | 'achievements'
    | 'boosters'
    | 'statistics'
    | 'settings'
    | 'about'
    | 'daily_challenge'
    | 'leaderboard'
  >('none');

  // In-Game Non-Blocking Notification Queue
  const [activeInGameToast, setActiveInGameToast] = useState<{
    id: string;
    type: 'achievement' | 'high_score';
    title: string;
    subtitle?: string;
    icon?: string;
  } | null>(null);
  const toastQueueRef = useRef<{
    id: string;
    type: 'achievement' | 'high_score';
    title: string;
    subtitle?: string;
    icon?: string;
  }[]>([]);
  const hasTriggeredHighScoreRef = useRef<boolean>(false);
  const previousBestScoreRef = useRef<number>(0);

  // Active level data
  const [currentLevelNum, setCurrentLevelNum] = useState<number>(1);
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(() => getLevelConfig(1));

  // Gameplay active state
  const [board, setBoard] = useState<Cell[][]>([]);
  const [movesLeft, setMovesLeft] = useState<number>(24);
  const [score, setScore] = useState<number>(0);
  const [objectives, setObjectives] = useState<LevelObjective[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [activeBooster, setActiveBooster] = useState<BoosterType | null>(null);

  // FX state
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [comboBanner, setComboBanner] = useState<ComboFeedbackItem | null>(null);
  const [reshufflingNotice, setReshufflingNotice] = useState<boolean>(false);
  const [starsEarned, setStarsEarned] = useState<number>(0);

  // Drag interaction tracking
  const dragStartRef = useRef<{ x: number; y: number; clientX: number; clientY: number } | null>(null);
  const isExecutingRef = useRef<boolean>(false);

  // Sync mute state on mount
  useEffect(() => {
    soundManager.setMuted(!saveData.soundEnabled);
    if (saveData.soundEnabled && saveData.musicEnabled && viewMode === 'playing') {
      soundManager.startMusic();
    } else {
      soundManager.stopMusic();
    }
    return () => {
      soundManager.stopMusic();
    };
  }, [saveData.soundEnabled, saveData.musicEnabled, viewMode]);

  // Toggle Sound
  const toggleSound = useCallback(() => {
    const updated = { ...saveData, soundEnabled: !saveData.soundEnabled };
    soundManager.setMuted(!updated.soundEnabled);
    JuicyStorage.save(updated);
    setSaveData(updated);
  }, [saveData]);

  // Start chosen level
  const handleSelectLevelFromMap = (lvl: number) => {
    setCurrentLevelNum(lvl);
    setLevelConfig(getLevelConfig(lvl));
    setActiveModal('level_start');
  };

  // Enqueue achievements into non-blocking queue (max 1 visible, 1.8s duration)
  const enqueueAchievements = (newUnlocks: AchievementDef[]) => {
    if (newUnlocks.length === 0) return;

    if (newUnlocks.length === 1) {
      toastQueueRef.current.push({
        id: `ach_${Date.now()}_${newUnlocks[0].id}`,
        type: 'achievement',
        title: 'Achievement Unlocked!',
        subtitle: `${newUnlocks[0].icon} ${newUnlocks[0].name}`,
        icon: newUnlocks[0].icon,
      });
    } else {
      // Consolidate if multiple unlocked in the same cascade sequence
      toastQueueRef.current.push({
        id: `ach_multi_${Date.now()}`,
        type: 'achievement',
        title: `+${newUnlocks.length} Achievements Unlocked!`,
        subtitle: newUnlocks.map((a) => a.name).join(', '),
        icon: '🏆',
      });
    }

    if (activeInGameToast === null) {
      const next = toastQueueRef.current.shift();
      if (next) {
        setActiveInGameToast(next);
        setTimeout(() => {
          setActiveInGameToast(null);
        }, 1800);
      }
    }
  };

  // Queue runner effect
  useEffect(() => {
    if (activeInGameToast !== null || toastQueueRef.current.length === 0) return;
    if (activeModal === 'pause') return; // Pause timer when game is paused

    const nextItem = toastQueueRef.current.shift();
    if (!nextItem) return;

    setActiveInGameToast(nextItem);
    const timer = setTimeout(() => {
      setActiveInGameToast(null);
    }, 1800);

    return () => clearTimeout(timer);
  }, [activeInGameToast, activeModal]);

  const startLevelGameplay = () => {
    const cfg = getLevelConfig(currentLevelNum);
    setLevelConfig(cfg);
    const initialGrid = createInitialBoard(cfg);
    setBoard(initialGrid);
    setMovesLeft(cfg.moves);
    setScore(0);
    setObjectives(cfg.objectives.map((obj) => ({ ...obj, current: 0 })));
    setSelectedCell(null);
    setActiveBooster(null);
    setFloatingScores([]);
    setComboBanner(null);
    setStarsEarned(0);
    setIsProcessing(false);
    isExecutingRef.current = false;

    // Reset session high-score & achievement notification queue
    previousBestScoreRef.current = saveData.bestScores[currentLevelNum] || 0;
    hasTriggeredHighScoreRef.current = false;
    toastQueueRef.current = [];
    setActiveInGameToast(null);

    setActiveModal('none');
    setViewMode('playing');

    if (saveData.soundEnabled && saveData.musicEnabled) {
      soundManager.startMusic();
    }
  };

  // Add floating score visual popup
  const addFloatingScore = (x: number, y: number, value: number, color = '#fbbf24') => {
    const item: FloatingScore = {
      id: `score_${Date.now()}_${Math.random()}`,
      x,
      y,
      score: value,
      color,
      createdAt: Date.now(),
    };
    setFloatingScores((prev) => [...prev, item]);
    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((p) => p.id !== item.id));
    }, 1000);
  };

  // Trigger combo banner feedback
  const triggerComboFeedback = (count: number) => {
    if (count < 4) return;
    let text = 'GOOD!';
    let bannerType: ComboFeedbackItem['bannerType'] = 'good';
    let color = '#ec4899';

    if (count >= 10) {
      text = 'JUICY MATCH!';
      bannerType = 'juicy_match';
      color = '#e11d48';
    } else if (count >= 7) {
      text = 'AMAZING!';
      bannerType = 'amazing';
      color = '#f59e0b';
    } else if (count >= 5) {
      text = 'GREAT!';
      bannerType = 'great';
      color = '#10b981';
    }

    soundManager.playComboFanfare(bannerType);
    const item: ComboFeedbackItem = {
      id: `combo_${Date.now()}`,
      text,
      bannerType,
      color,
      createdAt: Date.now(),
    };
    setComboBanner(item);
    setTimeout(() => {
      setComboBanner(null);
    }, 1400);
  };

  // Check victory condition
  const checkWinCondition = (currentObjectives: LevelObjective[]): boolean => {
    return currentObjectives.every((obj) => obj.current >= obj.target);
  };

  // Resolve cascades loop
  const resolveBoardCascades = async (currentGrid: Cell[][], cascadeIndex = 1): Promise<void> => {
    // 1. Detect matches
    const { matchedCells, specialCreations } = findMatches(currentGrid);

    if (matchedCells.length === 0) {
      // Check if board has legal moves
      if (!hasLegalMoves(currentGrid, levelConfig.availableFruits)) {
        setReshufflingNotice(true);
        soundManager.playSpecialCreate();
        await new Promise((r) => setTimeout(r, 600));
        reshuffleMovableFruits(currentGrid, levelConfig.availableFruits);
        setReshufflingNotice(false);
        setBoard([...currentGrid]);
      }
      setIsProcessing(false);
      isExecutingRef.current = false;
      return;
    }

    // 2. Sound & Haptics for matches
    soundManager.playMatch(cascadeIndex);
    if (matchedCells.length >= 4) {
      soundManager.playSpecialCreate();
    }
    triggerComboFeedback(matchedCells.length);

    // 3. Mark matched cells for animation
    matchedCells.forEach(([mx, my]) => {
      if (currentGrid[my][mx].fruit) {
        currentGrid[my][mx].fruit!.isMatched = true;
      }
    });
    setBoard([...currentGrid]);

    // Small delay for pop animation
    await new Promise((r) => setTimeout(r, 160));

    // 4. Calculate score & damage blockers
    const addedScore = matchedCells.length * 30 * cascadeIndex;
    let nextCalculatedScore = 0;
    setScore((s) => {
      const nextScore = s + addedScore;
      nextCalculatedScore = nextScore;
      if (onScoreUpdate) onScoreUpdate(nextScore);

      // Genuine High Score Check: only when previous personal record was > 0 and surpassed for first time
      if (
        previousBestScoreRef.current > 0 &&
        nextScore > previousBestScoreRef.current &&
        !hasTriggeredHighScoreRef.current
      ) {
        hasTriggeredHighScoreRef.current = true;
        toastQueueRef.current.unshift({
          id: `high_score_${Date.now()}`,
          type: 'high_score',
          title: 'NEW HIGH SCORE!',
          subtitle: `${nextScore.toLocaleString()} pts`,
          icon: '🏆',
        });
      }

      return nextScore;
    });

    // Check & unlock achievements with strict deduplication
    const { updatedSave, newUnlocks } = checkAchievements(saveData, {
      matchCount: 1,
      matchLength: matchedCells.length,
      cascadeIndex,
      currentLevelScore: nextCalculatedScore || addedScore,
      isNewHighScore: hasTriggeredHighScoreRef.current,
    });
    if (newUnlocks.length > 0) {
      JuicyStorage.save(updatedSave);
      setSaveData(updatedSave);
      enqueueAchievements(newUnlocks);
    }

    const [firstX, firstY] = matchedCells[0];
    addFloatingScore(firstX, firstY, addedScore);

    // Damage adjacent blockers & underlays
    const { juiceCleared, cratesBroken, chestsOpened } = damageBlockersAndUnderlays(
      currentGrid,
      matchedCells
    );

    if (cratesBroken > 0) soundManager.playCrateBreak();
    if (juiceCleared > 0) soundManager.playJuiceClear();

    // 5. Update objectives
    let updatedObjs = [...objectives];
    setObjectives((prev) => {
      updatedObjs = prev.map((obj) => {
        let delta = 0;
        if (obj.type === 'collect_fruit' && obj.fruitType) {
          delta = matchedCells.filter(([mx, my]) => currentGrid[my][mx].fruit?.type === obj.fruitType).length;
        } else if (obj.type === 'clear_juice') {
          delta = juiceCleared;
        } else if (obj.type === 'break_crates') {
          delta = cratesBroken;
        } else if (obj.type === 'open_chests') {
          delta = chestsOpened;
        }
        return {
          ...obj,
          current: Math.min(obj.target, obj.current + delta),
        };
      });
      return updatedObjs;
    });

    // 6. Clear matched fruits & place newly generated special fruits
    matchedCells.forEach(([mx, my]) => {
      currentGrid[my][mx].fruit = null;
    });

    specialCreations.forEach((sc) => {
      currentGrid[sc.y][sc.x].fruit = {
        id: `special_${Date.now()}_${Math.random()}`,
        type: sc.fruitType,
        special: sc.special,
      };
    });

    setBoard([...currentGrid]);
    await new Promise((r) => setTimeout(r, 120));

    // 7. Apply gravity & refill
    let falling = true;
    while (falling) {
      const moved = applyGravity(currentGrid);
      const refilled = refillTopCells(currentGrid, levelConfig.availableFruits);
      falling = moved || refilled;
      if (falling) {
        setBoard([...currentGrid]);
        await new Promise((r) => setTimeout(r, 80));
      }
    }

    // 8. Check victory condition immediately
    if (checkWinCondition(updatedObjs)) {
      handleLevelVictory();
      return;
    }

    // 9. Cascade to next round
    await resolveBoardCascades(currentGrid, cascadeIndex + 1);
  };

  // Handle Level Victory
  const handleLevelVictory = () => {
    soundManager.stopMusic();
    soundManager.playLevelComplete();

    // Calculate stars
    let stars = 1;
    if (score >= levelConfig.starThresholds[2]) stars = 3;
    else if (score >= levelConfig.starThresholds[1]) stars = 2;
    setStarsEarned(stars);

    const { winStreak } = JuicyStorage.completeLevel(currentLevelNum, score, stars);
    const updatedSave = JuicyStorage.load();

    // Check level completion achievements
    const { updatedSave: withVictoryAch, newUnlocks } = checkAchievements(updatedSave, {
      levelCompleted: currentLevelNum,
      currentLevelScore: score,
      totalStars: (Object.values(updatedSave.stars || {}) as number[]).reduce((a, b) => a + (b || 0), 0),
    });

    JuicyStorage.save(withVictoryAch);
    setSaveData(withVictoryAch);
    if (newUnlocks.length > 0) {
      enqueueAchievements(newUnlocks);
    }

    // Genuinely report completed level to portal once upon victory
    if (onLevelComplete) {
      onLevelComplete(score, 60);
    }

    setTimeout(() => {
      // Trigger achievement gift every 3 win streak!
      if (winStreak > 0 && winStreak % 3 === 0) {
        setActiveModal('achievement_gift');
      } else {
        setActiveModal('win');
      }
    }, 400);
  };

  // Execute swap action between two cells
  const handleSwap = async (x1: number, y1: number, x2: number, y2: number) => {
    if (isProcessing || isExecutingRef.current) return;

    const c1 = board[y1][x1];
    const c2 = board[y2][x2];

    if (!c1.valid || !c2.valid || !c1.fruit || !c2.fruit) return;
    if (c1.blocker || c2.blocker || c1.overlay === 'chain' || c2.overlay === 'chain') {
      soundManager.playInvalidSwap();
      return;
    }

    setIsProcessing(true);
    isExecutingRef.current = true;
    soundManager.playSwap();

    // 1. Check for Special Combination
    const specialCombo = handleSpecialCombination(board, c1, c2);

    if (specialCombo) {
      // Deduct move
      setMovesLeft((m) => m - 1);

      if (specialCombo.comboType.includes('rainbow')) {
        soundManager.playRainbowLaser();
      } else if (specialCombo.comboType.includes('bomb')) {
        soundManager.playBombExplosion();
      } else {
        soundManager.playStripedBeam();
      }

      // Mark affected cells
      specialCombo.affectedCells.forEach(([ax, ay]) => {
        if (board[ay][ax].fruit) {
          board[ay][ax].fruit!.isMatched = true;
        }
      });
      setBoard([...board]);
      await new Promise((r) => setTimeout(r, 200));

      // Clear & resolve
      specialCombo.affectedCells.forEach(([ax, ay]) => {
        board[ay][ax].fruit = null;
      });

      const { juiceCleared, cratesBroken, chestsOpened } = damageBlockersAndUnderlays(
        board,
        specialCombo.affectedCells
      );

      // Gravity & Refill
      let falling = true;
      while (falling) {
        const moved = applyGravity(board);
        const refilled = refillTopCells(board, levelConfig.availableFruits);
        falling = moved || refilled;
        if (falling) {
          setBoard([...board]);
          await new Promise((r) => setTimeout(r, 80));
        }
      }

      await resolveBoardCascades(board, 1);
      return;
    }

    // 2. Normal Swap
    const temp = c1.fruit;
    c1.fruit = c2.fruit;
    c2.fruit = temp;
    setBoard([...board]);

    const { matchedCells } = findMatches(board);

    if (matchedCells.length === 0) {
      // Invalid swap - bounce back!
      await new Promise((r) => setTimeout(r, 180));
      c2.fruit = c1.fruit;
      c1.fruit = temp;
      setBoard([...board]);
      soundManager.playInvalidSwap();
      setIsProcessing(false);
      isExecutingRef.current = false;
      return;
    }

    // Valid move: deduct move
    setMovesLeft((m) => {
      const nextMoves = m - 1;
      if (nextMoves <= 0 && !checkWinCondition(objectives)) {
        setTimeout(() => {
          soundManager.playLevelFail();
          JuicyStorage.failLevel(currentLevelNum);
          setActiveModal('fail');
        }, 800);
      }
      return nextMoves;
    });

    await resolveBoardCascades(board, 1);
  };

  // Booster action handler
  const handleBoosterClick = (type: BoosterType) => {
    if (isProcessing) return;
    soundManager.playButtonClick();
    if (activeBooster === type) {
      setActiveBooster(null);
    } else {
      setActiveBooster(type);
    }
  };

  // Execute active booster on target cell
  const applyBoosterOnCell = async (x: number, y: number) => {
    if (!activeBooster || isProcessing) return;
    const cell = board[y][x];
    if (!cell.valid) return;

    setIsProcessing(true);
    isExecutingRef.current = true;

    if (activeBooster === 'hammer') {
      soundManager.playBombExplosion();
      cell.fruit = null;
      if (cell.blocker) cell.blocker = null;
      if (cell.overlay !== 'none') cell.overlay = 'none';
      if (cell.underlay !== 'none') cell.underlay = 'none';
      setBoard([...board]);
      addFloatingScore(x, y, 100);
    } else if (activeBooster === 'reshuffle') {
      soundManager.playSpecialCreate();
      reshuffleMovableFruits(board, levelConfig.availableFruits);
      setBoard([...board]);
    } else if (activeBooster === 'row_blast') {
      soundManager.playStripedBeam();
      for (let cx = 0; cx < levelConfig.gridWidth; cx++) {
        board[y][cx].fruit = null;
      }
      setBoard([...board]);
    } else if (activeBooster === 'rainbow_bomb') {
      soundManager.playRainbowLaser();
      if (cell.fruit) {
        const targetColor = cell.fruit.type;
        board.forEach((r) =>
          r.forEach((c) => {
            if (c.fruit?.type === targetColor) c.fruit = null;
          })
        );
      }
      setBoard([...board]);
    }

    // Deduct booster count
    const updated = { ...saveData };
    if (updated.boosters[activeBooster] > 0) {
      updated.boosters[activeBooster]--;
      JuicyStorage.save(updated);
      setSaveData(updated);
    }

    // Check booster achievements
    const { updatedSave: withBoosterAch, newUnlocks } = checkAchievements(updated, {
      boosterUsed: activeBooster,
    });
    if (newUnlocks.length > 0) {
      JuicyStorage.save(withBoosterAch);
      setSaveData(withBoosterAch);
      enqueueAchievements(newUnlocks);
    }

    setActiveBooster(null);

    // Gravity & Cascade
    let falling = true;
    while (falling) {
      const moved = applyGravity(board);
      const refilled = refillTopCells(board, levelConfig.availableFruits);
      falling = moved || refilled;
      if (falling) {
        setBoard([...board]);
        await new Promise((r) => setTimeout(r, 80));
      }
    }

    await resolveBoardCascades(board, 1);
  };

  // Cell Interaction (Click / Tap)
  const handleCellClick = (x: number, y: number) => {
    if (isProcessing || activeModal === 'pause') return;

    if (activeBooster) {
      applyBoosterOnCell(x, y);
      return;
    }

    soundManager.playSelect();

    if (!selectedCell) {
      setSelectedCell({ x, y });
    } else {
      const dx = Math.abs(selectedCell.x - x);
      const dy = Math.abs(selectedCell.y - y);

      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        // Adjacent swap
        handleSwap(selectedCell.x, selectedCell.y, x, y);
        setSelectedCell(null);
      } else {
        // Change selection
        setSelectedCell({ x, y });
      }
    }
  };

  // Drag / Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent, x: number, y: number) => {
    if (isProcessing || activeBooster || activeModal === 'pause') return;
    const touch = e.touches[0];
    dragStartRef.current = { x, y, clientX: touch.clientX, clientY: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!dragStartRef.current || isProcessing || activeBooster || activeModal === 'pause') return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - dragStartRef.current.clientX;
    const dy = touch.clientY - dragStartRef.current.clientY;
    const { x, y } = dragStartRef.current;
    dragStartRef.current = null;

    const threshold = 24; // Swipe distance threshold
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
      const targetX = dx > 0 ? x + 1 : x - 1;
      if (targetX >= 0 && targetX < levelConfig.gridWidth) {
        handleSwap(x, y, targetX, y);
      }
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > threshold) {
      const targetY = dy > 0 ? y + 1 : y - 1;
      if (targetY >= 0 && targetY < levelConfig.gridHeight) {
        handleSwap(x, y, x, targetY);
      }
    }
  };

  // -------------------------------------------------------------
  // RENDER: Main Menu Screen View
  // -------------------------------------------------------------
  if (viewMode === 'menu') {
    return (
      <div className="relative w-full h-full">
        <MainMenuScreen
          saveData={saveData}
          onPlay={() => {
            const nextLvl = saveData.highestUnlockedLevel || 1;
            handleSelectLevelFromMap(nextLvl);
          }}
          onOpenLevels={() => setViewMode('map')}
          onOpenLeaderboard={() => setActiveModal('leaderboard')}
          onOpenDailyChallenge={() => setActiveModal('daily_challenge')}
          onOpenHowToPlay={() => setActiveModal('how_to_play')}
          onOpenAchievements={() => setActiveModal('achievements')}
          onOpenBoosters={() => setActiveModal('boosters')}
          onOpenStatistics={() => setActiveModal('statistics')}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenAbout={() => setActiveModal('about')}
          onToggleSound={toggleSound}
          onExitToPortal={() => onBackToHub && onBackToHub()}
        />

        {/* Metagame Modals accessible from Main Menu */}
        {activeModal === 'leaderboard' && (
          <GameLeaderboardModal
            gameConfig={GAME_CONFIGS['candy-juicy']}
            onClose={() => setActiveModal('none')}
          />
        )}
        {activeModal === 'how_to_play' && <HowToPlayModal onClose={() => setActiveModal('none')} />}
        {activeModal === 'achievements' && <AchievementsModal saveData={saveData} onClose={() => setActiveModal('none')} />}
        {activeModal === 'boosters' && <BoostersModal saveData={saveData} onClose={() => setActiveModal('none')} />}
        {activeModal === 'statistics' && <StatisticsModal saveData={saveData} onClose={() => setActiveModal('none')} />}
        {activeModal === 'settings' && (
          <SettingsModal
            saveData={saveData}
            onUpdateSave={(fresh) => setSaveData(fresh)}
            onClose={() => setActiveModal('none')}
          />
        )}
        {activeModal === 'about' && <AboutModal onClose={() => setActiveModal('none')} />}
        {activeModal === 'daily_challenge' && (
          <DailyChallengeModal
            saveData={saveData}
            onPlayChallenge={() => {
              setActiveModal('none');
              handleSelectLevelFromMap(saveData.highestUnlockedLevel || 1);
            }}
            onClose={() => setActiveModal('none')}
          />
        )}
        {activeModal === 'level_start' && (
          <LevelStartModal
            config={levelConfig}
            onStart={startLevelGameplay}
            onClose={() => setActiveModal('none')}
          />
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Map Screen View
  // -------------------------------------------------------------
  if (viewMode === 'map') {
    return (
      <div className="relative w-full h-full">
        <MapScreen
          saveData={saveData}
          onSelectLevel={handleSelectLevelFromMap}
          onOpenDailyReward={() => setActiveModal('daily_reward')}
          onExitToPortal={() => setViewMode('menu')}
          onToggleSound={toggleSound}
        />

        {/* Daily Reward Modal */}
        {activeModal === 'daily_reward' && (
          <DailyRewardModal
            currentDay={saveData.dailyRewardDay}
            onClaim={() => {
              JuicyStorage.claimDailyReward();
              setSaveData(JuicyStorage.load());
              setActiveModal('none');
            }}
            onClose={() => setActiveModal('none')}
          />
        )}

        {/* Level Start Modal */}
        {activeModal === 'level_start' && (
          <LevelStartModal
            config={levelConfig}
            onStart={startLevelGameplay}
            onClose={() => setActiveModal('none')}
          />
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Active Gameplay Screen View
  // -------------------------------------------------------------
  return (
    <div className="relative w-full h-full flex flex-col bg-[#38bdf8] overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Tropical Island Sky & Clouds Background */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#38bdf8] via-[#7dd3fc] to-[#fef08a] opacity-95">
        {/* Palm tree leaves silhouettes in top corners */}
        <div className="absolute top-0 left-0 text-7xl opacity-25 filter drop-shadow">🌴</div>
        <div className="absolute top-0 right-0 text-7xl opacity-25 filter drop-shadow -scale-x-100">🌴</div>
      </div>

      {/* 1. TOP HEADER HUD */}
      <div className="relative z-30 flex items-center justify-between px-3 py-2 bg-white/85 backdrop-blur-md border-b-2 border-amber-300 shadow-md">
        {/* [ BACK ] Button */}
        <button
          onClick={() => {
            soundManager.playButtonClick();
            setViewMode('map');
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xs shadow-md active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Map</span>
        </button>

        {/* [ LEVEL & MOVES BADGE ] */}
        <div className="flex items-center gap-2">
          {/* Level Pill */}
          <div className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-black shadow-inner">
            Lvl {currentLevelNum}
          </div>

          {/* Moves Display Counter */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-black shadow-md animate-pulse">
            <span>Moves:</span>
            <span className="text-base font-extrabold">{movesLeft}</span>
          </div>
        </div>

        {/* Right Action Icons (Sound & Pause) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              toggleSound();
            }}
            className="p-1.5 rounded-full bg-slate-100 text-slate-700 shadow-sm active:scale-95"
          >
            {saveData.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              setActiveModal('pause');
            }}
            className="p-1.5 rounded-full bg-slate-100 text-slate-700 shadow-sm active:scale-95"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. OBJECTIVES & SCORE RIBBON */}
      <div className="relative z-20 flex items-center justify-between px-4 py-2 bg-amber-100/90 border-b border-amber-200 text-xs font-bold text-slate-700 shadow-inner">
        {/* Objectives Progress Counters */}
        <div className="flex items-center gap-3">
          {objectives.map((obj, i) => (
            <div key={i} className="flex items-center gap-1 bg-white/95 px-2.5 py-1 rounded-full shadow-sm border border-amber-300">
              {obj.type === 'collect_fruit' && obj.fruitType ? (
                <FruitGraphic type={obj.fruitType} size={22} />
              ) : obj.type === 'clear_juice' ? (
                <span className="text-base">🧃</span>
              ) : obj.type === 'break_crates' ? (
                <span className="text-base">📦</span>
              ) : (
                <span className="text-base">🎁</span>
              )}
              <span className={`font-black ${obj.current >= obj.target ? 'text-emerald-600' : 'text-slate-800'}`}>
                {obj.current}/{obj.target}
              </span>
            </div>
          ))}
        </div>

        {/* Score & Star Threshold Meter */}
        <div className="flex items-center gap-1.5 bg-white/95 px-3 py-1 rounded-full shadow-sm border border-amber-300">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span className="font-black text-amber-900">{score.toLocaleString()}</span>
        </div>
      </div>

      {/* 2.5 NON-BLOCKING IN-GAME TOAST (HIGH SCORE & ACHIEVEMENTS) */}
      {activeInGameToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none w-11/12 max-w-xs animate-in fade-in slide-in-from-top-3 duration-200">
          <div
            className={`px-3.5 py-2 rounded-2xl shadow-xl border-2 flex items-center gap-2.5 backdrop-blur-md ${
              activeInGameToast.type === 'high_score'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-yellow-200'
                : 'bg-white/95 text-slate-800 border-amber-300'
            }`}
          >
            <span className="text-2xl filter drop-shadow">{activeInGameToast.icon || '🏆'}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-black uppercase tracking-wider leading-tight">
                {activeInGameToast.title}
              </div>
              {activeInGameToast.subtitle && (
                <div
                  className={`text-[10px] font-bold truncate ${
                    activeInGameToast.type === 'high_score' ? 'text-amber-100' : 'text-amber-700'
                  }`}
                >
                  {activeInGameToast.subtitle}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN PUZZLE TRAY & BOARD AREA */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-2">
        {/* Reshuffling Floating Toast */}
        {reshufflingNotice && (
          <div className="absolute top-4 z-40 px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm shadow-2xl animate-bounce border-2 border-white">
            RESHUFFLING NO MOVES...
          </div>
        )}

        {/* Combo Feedback Banner (e.g. "JUICY MATCH!", "AMAZING!") */}
        {comboBanner && (
          <div className="absolute top-12 z-40 pointer-events-none animate-scale-up">
            <div
              className="px-6 py-2 rounded-full text-white font-black text-xl tracking-wider uppercase shadow-2xl border-2 border-white filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
              style={{ backgroundColor: comboBanner.color }}
            >
              {comboBanner.text}
            </div>
          </div>
        )}

        {/* The Golden Physical Board Tray Frame */}
        <div className="relative p-3 bg-gradient-to-b from-[#f59e0b] to-[#b45309] rounded-3xl shadow-[0_12px_24px_rgba(0,0,0,0.35)] border-4 border-[#fef08a] max-w-full">
          {/* Inner Cream/Beige Tray Board Surface */}
          <div className="relative bg-[#fef3c7] rounded-2xl p-2 shadow-inner border-2 border-amber-200">
            {/* Grid Container */}
            <div
              className="grid gap-1.5"
              style={{
                gridTemplateColumns: `repeat(${levelConfig.gridWidth}, minmax(0, 1fr))`,
              }}
            >
              {board.map((row, y) =>
                row.map((cell, x) => {
                  const isSelected = selectedCell?.x === x && selectedCell?.y === y;
                  if (!cell.valid) {
                    // Transparent Cutout hole in irregular board shape
                    return <div key={`${x}-${y}`} className="w-10 h-10 sm:w-12 sm:h-12 opacity-0 pointer-events-none" />;
                  }

                  return (
                    <div
                      key={`${x}-${y}`}
                      onClick={() => handleCellClick(x, y)}
                      onTouchStart={(e) => handleTouchStart(e, x, y)}
                      onTouchEnd={handleTouchEnd}
                      className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center cursor-pointer transition-transform duration-100 ${
                        isSelected
                          ? 'ring-4 ring-amber-400 scale-105 z-20 bg-amber-200'
                          : 'bg-amber-100/60 hover:bg-amber-200/50'
                      }`}
                      style={{ touchAction: 'none' }}
                    >
                      {/* Underlay (Juice stain / puddle) */}
                      {cell.underlay !== 'none' && <UnderlayGraphic type={cell.underlay} size={42} />}

                      {/* Blocker (Crate / Chest) */}
                      {cell.blocker && <BlockerGraphic type={cell.blocker} size={42} />}

                      {/* Fruit Graphic */}
                      {cell.fruit && !cell.blocker && (
                        <FruitGraphic
                          type={cell.fruit.type}
                          special={cell.fruit.special}
                          size={40}
                          isMatched={cell.fruit.isMatched}
                        />
                      )}

                      {/* Overlay (Frost Ice or Metal Chains) */}
                      {cell.overlay !== 'none' && <OverlayGraphic type={cell.overlay} size={44} />}
                    </div>
                  );
                })
              )}
            </div>

            {/* Floating Score Popups */}
            {floatingScores.map((fs) => (
              <div
                key={fs.id}
                className="absolute pointer-events-none font-black text-sm animate-float-up text-amber-500 drop-shadow"
                style={{
                  left: `${fs.x * 48 + 20}px`,
                  top: `${fs.y * 48}px`,
                }}
              >
                +{fs.score}
              </div>
            ))}
          </div>
        </div>

        {/* Helper Banana Character with Sunglasses & Speech Bubble */}
        <div className="w-full max-w-sm flex items-center justify-between mt-2 px-2">
          <div className="flex items-center gap-2">
            <div className="text-3xl filter drop-shadow animate-bounce">🍌</div>
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-2xl rounded-bl-none shadow-md border border-amber-300 text-[11px] font-bold text-amber-900 max-w-[220px]">
              {levelConfig.hintMessage || "Match 4 for striped fruit, or 5 for a rainbow blast!"}
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM BOOSTERS TOOLBAR */}
      <div className="relative z-30 flex items-center justify-around px-4 py-2.5 bg-white/90 backdrop-blur-md border-t-2 border-amber-300 shadow-lg">
        {/* Hammer Booster */}
        <button
          onClick={() => handleBoosterClick('hammer')}
          className={`flex flex-col items-center p-2 rounded-2xl border-2 transition-transform active:scale-95 ${
            activeBooster === 'hammer' ? 'bg-amber-200 border-amber-400 scale-105' : 'bg-white border-amber-200'
          }`}
        >
          <div className="relative">
            <Hammer className="w-5 h-5 text-amber-700" />
            <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {saveData.boosters.hammer}
            </span>
          </div>
          <span className="text-[10px] font-black text-slate-600 mt-0.5">Smash</span>
        </button>

        {/* Reshuffle Booster */}
        <button
          onClick={() => handleBoosterClick('reshuffle')}
          className={`flex flex-col items-center p-2 rounded-2xl border-2 transition-transform active:scale-95 ${
            activeBooster === 'reshuffle' ? 'bg-amber-200 border-amber-400 scale-105' : 'bg-white border-amber-200'
          }`}
        >
          <div className="relative">
            <RefreshCw className="w-5 h-5 text-emerald-600" />
            <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {saveData.boosters.reshuffle}
            </span>
          </div>
          <span className="text-[10px] font-black text-slate-600 mt-0.5">Shuffle</span>
        </button>

        {/* Row Rocket Booster */}
        <button
          onClick={() => handleBoosterClick('row_blast')}
          className={`flex flex-col items-center p-2 rounded-2xl border-2 transition-transform active:scale-95 ${
            activeBooster === 'row_blast' ? 'bg-amber-200 border-amber-400 scale-105' : 'bg-white border-amber-200'
          }`}
        >
          <div className="relative">
            <Zap className="w-5 h-5 text-sky-600" />
            <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {saveData.boosters.row_blast}
            </span>
          </div>
          <span className="text-[10px] font-black text-slate-600 mt-0.5">Rocket</span>
        </button>

        {/* Rainbow Bomb Booster */}
        <button
          onClick={() => handleBoosterClick('rainbow_bomb')}
          className={`flex flex-col items-center p-2 rounded-2xl border-2 transition-transform active:scale-95 ${
            activeBooster === 'rainbow_bomb' ? 'bg-amber-200 border-amber-400 scale-105' : 'bg-white border-amber-200'
          }`}
        >
          <div className="relative">
            <Disc className="w-5 h-5 text-pink-600" />
            <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {saveData.boosters.rainbow_bomb}
            </span>
          </div>
          <span className="text-[10px] font-black text-slate-600 mt-0.5">Rainbow</span>
        </button>
      </div>

      {/* 5. MODALS */}
      {activeModal === 'win' && (
        <WinModal
          level={currentLevelNum}
          score={score}
          stars={starsEarned}
          coinsEarned={50 + starsEarned * 20}
          onContinue={() => {
            setActiveModal('none');
            // Advance to next level if available
            if (currentLevelNum < 40) {
              setCurrentLevelNum(currentLevelNum + 1);
              setLevelConfig(getLevelConfig(currentLevelNum + 1));
              setActiveModal('level_start');
            } else {
              setViewMode('map');
            }
          }}
        />
      )}

      {activeModal === 'achievement_gift' && (
        <AchievementGiftModal
          onClaim={() => {
            setActiveModal('win');
          }}
        />
      )}

      {activeModal === 'fail' && (
        <FailModal
          level={currentLevelNum}
          objectives={objectives}
          onRetry={startLevelGameplay}
          onExitToMap={() => {
            setActiveModal('none');
            setViewMode('map');
          }}
        />
      )}

      {activeModal === 'pause' && (
        <PauseModal
          soundEnabled={saveData.soundEnabled}
          onResume={() => setActiveModal('none')}
          onRestart={() => {
            setActiveModal('none');
            startLevelGameplay();
          }}
          onOpenHowToPlay={() => setActiveModal('how_to_play')}
          onOpenAchievements={() => setActiveModal('achievements')}
          onOpenSettings={() => setActiveModal('settings')}
          onExitToMap={() => {
            setActiveModal('none');
            setViewMode('map');
          }}
          onExitToMainMenu={() => {
            setActiveModal('none');
            setViewMode('menu');
          }}
          onToggleSound={toggleSound}
        />
      )}

      {/* Metagame Modals accessible while playing or paused */}
      {activeModal === 'how_to_play' && <HowToPlayModal onClose={() => setActiveModal('pause')} />}
      {activeModal === 'achievements' && <AchievementsModal saveData={saveData} onClose={() => setActiveModal('pause')} />}
      {activeModal === 'settings' && (
        <SettingsModal
          saveData={saveData}
          onUpdateSave={(fresh) => setSaveData(fresh)}
          onClose={() => setActiveModal('pause')}
        />
      )}
      {activeModal === 'leaderboard' && (
        <GameLeaderboardModal
          gameConfig={GAME_CONFIGS['candy-juicy']}
          onClose={() => setActiveModal('pause')}
        />
      )}
    </div>
  );
};
