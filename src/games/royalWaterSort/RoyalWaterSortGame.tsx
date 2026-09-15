import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GameDefinition, UserProfile } from '../../types';
import { 
  GameScreen, 
  BottleState, 
  MoveRecord, 
  LevelConfig, 
  LevelSaveData, 
  PourAnimationState,
  PourStep,
  HintAction,
  LiquidColorId,
  LevelScoreBreakdown,
  CareerSummary
} from './types';
import { ROYAL_WATER_SORT_LEVELS } from './levels';
import { WaterSortEngine } from './solver';
import { RoyalWaterBottle } from './RoyalWaterBottle';
import { RoyalWaterSortVictoryModal } from './RoyalWaterSortVictoryModal';
import { royalWaterSortAudio } from './audio';
import { LIQUID_COLORS } from './colors';
import { GameLeaderboardModal, GAME_CONFIGS, GameLeaderboardService } from '../../components/gameNavigation';
import { 
  ArrowLeft, 
  Pause, 
  Play, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Lock, 
  Star, 
  Trophy, 
  Crown,
  Home, 
  ChevronRight, 
  Shuffle, 
  Undo2, 
  PlusCircle, 
  Coins, 
  Sparkles,
  HelpCircle,
  Settings,
  Info,
  BookOpen,
  Vibrate,
  CheckCircle2,
  AlertTriangle,
  ListOrdered,
  Flame
} from 'lucide-react';

interface RoyalWaterSortGameProps {
  game: GameDefinition;
  profile?: UserProfile;
  onGameOver: (finalScore: number, durationSeconds: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

const STORAGE_KEY_LEVELS = 'royal_water_sort_levels_v1';
const STORAGE_KEY_COINS = 'royal_water_sort_coins_v1';
const STORAGE_KEY_BOOSTERS = 'royal_water_sort_boosters_v1';
const STORAGE_KEY_SETTINGS = 'royal_water_sort_settings_v1';

export const RoyalWaterSortGame: React.FC<RoyalWaterSortGameProps> = ({
  game,
  profile,
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  // ---------------------------------------------------------------------------
  // High-Level State Management
  // ---------------------------------------------------------------------------
  const [screen, setScreen] = useState<GameScreen>('LOADING');
  const [loadingProgress, setLoadingProgress] = useState<number>(10);
  const [isCurtainOpen, setIsCurtainOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(!royalWaterSortAudio.isEnabled());
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);

  // Coins & Booster Inventory
  const [coins, setCoins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COINS);
      return saved ? parseInt(saved, 10) : 100;
    } catch {
      return 100;
    }
  });

  const [boosters, setBoosters] = useState<{ shuffle: number; undo: number; extraTube: number }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOSTERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { shuffle: 3, undo: 5, extraTube: 2 };
  });

  // Level Progression (1 to 40)
  const [currentLevelNum, setCurrentLevelNum] = useState<number>(1);
  const [levelProgress, setLevelProgress] = useState<Record<number, LevelSaveData>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEVELS);
      if (saved) return JSON.parse(saved);
    } catch {}
    const init: Record<number, LevelSaveData> = {};
    for (let i = 1; i <= 40; i++) {
      init[i] = {
        unlocked: i === 1,
        completed: false,
        stars: 0,
        bestMoves: 0,
        highScore: 0,
      };
    }
    return init;
  });

  // Active Puzzle State
  const [bottles, setBottles] = useState<BottleState[]>([]);
  const [selectedBottleId, setSelectedBottleId] = useState<number | null>(null);
  const [shakingBottleId, setShakingBottleId] = useState<number | null>(null);
  const [isInputLocked, setIsInputLocked] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [hint, setHint] = useState<HintAction | null>(null);
  const [showTutorialHint, setShowTutorialHint] = useState<boolean>(true);

  // Competitive Scoring & Round Tracking
  const [activePlaySeconds, setActivePlaySeconds] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [tubesAdded, setTubesAdded] = useState<number>(0);
  const [invalidAttempts, setInvalidAttempts] = useState<number>(0);
  const [scoreBreakdown, setScoreBreakdown] = useState<LevelScoreBreakdown | null>(null);

  // Synchronized Pour Animation Controller
  const [pourAnim, setPourAnim] = useState<PourAnimationState>({
    isPouring: false,
    step: 'IDLE',
    sourceBottleId: null,
    destBottleId: null,
    color: null,
    count: 0,
    progress: 0,
    sourceOffset: { x: 0, y: 0 },
    tiltAngle: 0,
    sourceTransferProgress: 0,
    destTransferProgress: 0,
    streamOrigin: null,
    streamTarget: null,
  });

  // Dynamic SVG Stream Path relative to the arena
  const [streamPath, setStreamPath] = useState<string | null>(null);

  // DOM refs to calculate exact bottle mouth coordinates in viewport
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const bottleRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const pourRafRef = useRef<number | null>(null);
  const pourTimersRef = useRef<number[]>([]);
  const matchStartTimeRef = useRef<number>(Date.now());

  // Flying coins celebration state
  const [flyingCoins, setFlyingCoins] = useState<number[]>([]);

  // ---------------------------------------------------------------------------
  // Lifecycle & Audio Clean-up: Zero audio leak guaranteed
  // ---------------------------------------------------------------------------
  useEffect(() => {
    royalWaterSortAudio.setEnabled(isAudioEnabled);
    setIsMuted(!isAudioEnabled);

    // Synchronous clean up when component unmounts or routes change
    return () => {
      if (pourRafRef.current) cancelAnimationFrame(pourRafRef.current);
      pourTimersRef.current.forEach((t) => clearTimeout(t));
      pourTimersRef.current = [];
      royalWaterSortAudio.destroy();
    };
  }, [isAudioEnabled]);

  const triggerHaptic = useCallback(
    (pattern: number | number[] = 15) => {
      if (!hapticsEnabled || typeof window === 'undefined') return;
      try {
        navigator.vibrate?.(pattern);
      } catch {}
    },
    [hapticsEnabled]
  );

  // ---------------------------------------------------------------------------
  // 1. Loading Screen Progression & Curtain Shutter Opening
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (screen !== 'LOADING') return;

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Trigger sliding curtain transition after loading hits 100%
          const t1 = window.setTimeout(() => {
            setIsCurtainOpen(true);
            const t2 = window.setTimeout(() => {
              setScreen('MENU');
            }, 600);
            pourTimersRef.current.push(t2);
          }, 300);
          pourTimersRef.current.push(t1);
          return 100;
        }
        return prev + 15;
      });
    }, 160);

    return () => clearInterval(interval);
  }, [screen]);

  // Career Summary memo calculation across all 40 levels
  const careerSummary: CareerSummary = useMemo(() => {
    let totalScore = 0;
    let completedCount = 0;
    let totalStars = 0;
    let totalMoves = 0;
    let bestLevelScore = { levelNum: 1, score: 0 };

    (Object.entries(levelProgress) as [string, LevelSaveData][]).forEach(([lvlStr, data]) => {
      const lvl = Number(lvlStr);
      if (data.completed) {
        completedCount++;
        totalScore += data.highScore || 0;
        totalStars += data.stars || 0;
        totalMoves += data.bestMoves || 0;
        if ((data.highScore || 0) > bestLevelScore.score) {
          bestLevelScore = { levelNum: lvl, score: data.highScore || 0 };
        }
      }
    });

    return {
      totalCumulativeScore: totalScore,
      levelsCompleted: completedCount,
      totalStars,
      bestLevelScore,
      totalMoves,
      totalPlaytimeSeconds: completedCount * 90,
    };
  }, [levelProgress]);

  // Active gameplay timer (counts only while active on PLAYING screen)
  useEffect(() => {
    if (screen !== 'PLAYING') return;
    const timer = window.setInterval(() => {
      setActivePlaySeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [screen]);

  const formatPlayTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Highest unlocked level helper for "PLAY"
  const getHighestUnlockedLevel = useCallback(() => {
    let highest = 1;
    for (let i = 1; i <= 40; i++) {
      if (levelProgress[i]?.unlocked) {
        highest = i;
      }
    }
    return highest;
  }, [levelProgress]);

  // ---------------------------------------------------------------------------
  // 2. Start / Initialize Level
  // ---------------------------------------------------------------------------
  const currentConfig: LevelConfig = 
    ROYAL_WATER_SORT_LEVELS.find((l) => l.levelNum === currentLevelNum) || ROYAL_WATER_SORT_LEVELS[0];

  const startLevel = useCallback((lvlNum: number) => {
    const config = ROYAL_WATER_SORT_LEVELS.find((l) => l.levelNum === lvlNum) || ROYAL_WATER_SORT_LEVELS[0];
    setCurrentLevelNum(lvlNum);

    const initialBottles: BottleState[] = config.bottles.map((layers, idx) => ({
      id: idx + 1,
      layers: [...layers],
      capacity: config.capacity,
      isCompleted: false,
    }));

    setBottles(initialBottles);
    setSelectedBottleId(null);
    setShakingBottleId(null);
    setIsInputLocked(false);
    setMoveHistory([]);
    setMovesCount(0);
    setActivePlaySeconds(0);
    setHintsUsed(0);
    setTubesAdded(0);
    setInvalidAttempts(0);
    setScoreBreakdown(null);
    setHint(null);
    setStreamPath(null);
    setPourAnim({
      isPouring: false,
      step: 'IDLE',
      sourceBottleId: null,
      destBottleId: null,
      color: null,
      count: 0,
      progress: 0,
      sourceOffset: { x: 0, y: 0 },
      tiltAngle: 0,
      sourceTransferProgress: 0,
      destTransferProgress: 0,
      streamOrigin: null,
      streamTarget: null,
    });

    setScreen('PLAYING');
    matchStartTimeRef.current = Date.now();
    royalWaterSortAudio.playLevelStart();
  }, []);

  // ---------------------------------------------------------------------------
  // 3. User Tap Interaction & Real-State Pouring Engine
  // ---------------------------------------------------------------------------
  const handleBottleTap = (clickedId: number) => {
    if (screen !== 'PLAYING' || pourAnim.isPouring || isInputLocked) return;
    setShowTutorialHint(false);

    // If no bottle selected yet
    if (selectedBottleId === null) {
      const clicked = bottles.find((b) => b.id === clickedId);
      if (!clicked || clicked.layers.length === 0) return; // Cannot select empty bottle as source
      if (WaterSortEngine.isBottleCompleted(clicked)) return; // Already finished

      setSelectedBottleId(clickedId);
      setHint(null);
      royalWaterSortAudio.playBottleSelect();
      triggerHaptic(15);
      return;
    }

    // If tapping the already selected bottle -> deselect
    if (selectedBottleId === clickedId) {
      setSelectedBottleId(null);
      royalWaterSortAudio.playClick();
      return;
    }

    // Tapping another bottle as destination
    const sourceBottle = bottles.find((b) => b.id === selectedBottleId);
    const destBottle = bottles.find((b) => b.id === clickedId);

    if (!sourceBottle || !destBottle) {
      setSelectedBottleId(null);
      return;
    }

    // Check legality FIRST using real game state
    if (!WaterSortEngine.canPour(sourceBottle, destBottle)) {
      // If clicked bottle is also a valid alternative source, switch selection smoothly
      if (destBottle.layers.length > 0 && !WaterSortEngine.isBottleCompleted(destBottle)) {
        setSelectedBottleId(clickedId);
        royalWaterSortAudio.playBottleSelect();
      } else {
        // Invalid move feedback with royal shake and deduction penalty
        royalWaterSortAudio.playInvalid();
        setShakingBottleId(selectedBottleId);
        setInvalidAttempts((prev) => prev + 1);
        setIsInputLocked(true);
        triggerHaptic([30, 40, 30]);

        setTimeout(() => {
          setShakingBottleId(null);
          setSelectedBottleId(null);
          setIsInputLocked(false);
        }, 350);
      }
      return;
    }

    // VALID POUR: Begin synchronized transaction
    executePourTransaction(sourceBottle, destBottle);
  };

  const executePourTransaction = (source: BottleState, dest: BottleState) => {
    const res = WaterSortEngine.executePour(source, dest);
    if (!res) return;

    const sourceEl = bottleRefs.current.get(source.id);
    const destEl = bottleRefs.current.get(dest.id);
    const arenaEl = arenaRef.current;

    let targetOffsetX = 0;
    let targetOffsetY = 0;
    let tiltAngle = 65;
    let sMouth = { x: 180, y: 240 };
    let dMouth = { x: 220, y: 260 };

    if (sourceEl && destEl && arenaEl) {
      const sRect = sourceEl.getBoundingClientRect();
      const dRect = destEl.getBoundingClientRect();
      const aRect = arenaEl.getBoundingClientRect();

      const dx = dRect.left + dRect.width / 2 - (sRect.left + sRect.width / 2);
      const dy = dRect.top - sRect.top;

      // If dest is to right: tilt clockwise (+65 deg). If to left: tilt counter-clockwise (-65 deg).
      const isRight = dx >= 0;
      tiltAngle = isRight ? 65 : -65;

      // Source bottle positions itself just above and slightly to the side of destination mouth
      targetOffsetX = isRight ? dx - 26 : dx + 26;
      targetOffsetY = dy - 55;

      // Source mouth in arena coordinates when tilted
      const sCenterArenaX = sRect.left + sRect.width / 2 - aRect.left + targetOffsetX;
      const sCenterArenaY = sRect.top - aRect.top + targetOffsetY;
      sMouth = {
        x: isRight ? sCenterArenaX + 26 : sCenterArenaX - 26,
        y: sCenterArenaY + 18,
      };

      // Destination mouth in arena coordinates
      dMouth = {
        x: dRect.left + dRect.width / 2 - aRect.left,
        y: dRect.top - aRect.top + 18,
      };
    }

    // Record for Undo history
    const record: MoveRecord = {
      sourceBottleId: source.id,
      destBottleId: dest.id,
      color: res.color,
      count: res.count,
      previousSourceLayers: [...source.layers],
      previousDestLayers: [...dest.layers],
    };

    // Calculate natural curved parabolic stream path
    const ctrlX = (sMouth.x + dMouth.x) / 2;
    const ctrlY = Math.min(sMouth.y, dMouth.y) - 20;
    const calculatedStream = `M ${sMouth.x} ${sMouth.y} Q ${ctrlX} ${ctrlY} ${dMouth.x} ${dMouth.y}`;

    // Volumetric pour duration scaling with unit count
    const pourDuration = Math.max(480, 360 + res.count * 150);

    // STEP 1: MOVING SOURCE (Lift & Translate)
    setPourAnim({
      isPouring: true,
      step: 'MOVING_SOURCE',
      sourceBottleId: source.id,
      destBottleId: dest.id,
      color: res.color,
      count: res.count,
      progress: 0,
      sourceOffset: { x: targetOffsetX, y: targetOffsetY },
      tiltAngle: 0,
      sourceTransferProgress: 0,
      destTransferProgress: 0,
      streamOrigin: sMouth,
      streamTarget: dMouth,
    });

    triggerHaptic(20);

    // STEP 2: TILTING & STREAM FLOW
    const tTilt = window.setTimeout(() => {
      setPourAnim((prev) => ({
        ...prev,
        step: 'POURING',
        tiltAngle: tiltAngle,
      }));

      // Stream becomes visible and realistic water trickle audio plays
      setStreamPath(calculatedStream);
      royalWaterSortAudio.startPourSound(pourDuration);

      // Smooth RAF-based liquid level animation
      const pourStartTime = performance.now();

      const animatePour = (now: number) => {
        const elapsed = now - pourStartTime;
        const p = Math.min(1, elapsed / pourDuration);

        setPourAnim((prev) => ({
          ...prev,
          progress: p,
          sourceTransferProgress: p,
          destTransferProgress: Math.max(0, (p - 0.1) / 0.9),
        }));

        if (p < 1) {
          pourRafRef.current = requestAnimationFrame(animatePour);
        } else {
          // STEP 3: SETTLING & RETURNING
          setStreamPath(null);
          royalWaterSortAudio.stopPourSound();
          royalWaterSortAudio.playPourSettle();

          setPourAnim((prev) => ({
            ...prev,
            step: 'SETTLING',
            tiltAngle: 0,
            sourceOffset: { x: 0, y: 0 },
          }));

          const tSettle = window.setTimeout(() => {
            // Apply authoritative game state
            const updatedBottles = bottles.map((b) => {
              if (b.id === source.id) return { ...b, layers: res.newSourceLayers };
              if (b.id === dest.id) return { ...b, layers: res.newDestLayers };
              return b;
            });

            // Check if destination bottle is completed (4 of same color)
            const updatedDest = updatedBottles.find((b) => b.id === dest.id);
            if (updatedDest && WaterSortEngine.isBottleCompleted(updatedDest)) {
              updatedDest.isCompleted = true;
              royalWaterSortAudio.playCorkPop();
              triggerHaptic([40, 60, 60]);
            }

            setBottles(updatedBottles);
            setMoveHistory((prev) => [...prev, record]);
            setMovesCount((prev) => prev + 1);
            setSelectedBottleId(null);

            setPourAnim({
              isPouring: false,
              step: 'IDLE',
              sourceBottleId: null,
              destBottleId: null,
              color: null,
              count: 0,
              progress: 0,
              sourceOffset: { x: 0, y: 0 },
              tiltAngle: 0,
              sourceTransferProgress: 0,
              destTransferProgress: 0,
              streamOrigin: null,
              streamTarget: null,
            });

            // Check Win or No Moves
            if (WaterSortEngine.isLevelComplete(updatedBottles)) {
              handleLevelComplete();
            } else if (!WaterSortEngine.hasAnyLegalMove(updatedBottles)) {
              setScreen('NO_MOVES');
              royalWaterSortAudio.playInvalid();
            }
          }, 220);

          pourTimersRef.current.push(tSettle);
        }
      };

      pourRafRef.current = requestAnimationFrame(animatePour);
    }, 200);

    pourTimersRef.current.push(tTilt);
  };

  // ---------------------------------------------------------------------------
  // 4. Win / Level Clear Event Flow & Deterministic Scoring Engine
  // ---------------------------------------------------------------------------
  const handleLevelComplete = () => {
    royalWaterSortAudio.playVictory();
    triggerHaptic([60, 60, 100, 60, 120]);

    const reward = currentConfig.rewardCoins;
    const newCoins = coins + reward;
    setCoins(newCoins);
    try {
      localStorage.setItem(STORAGE_KEY_COINS, String(newCoins));
    } catch {}

    // Multi-factor competitive scoring system
    const difficultyMultiplier = 1 + ((currentLevelNum - 1) / 39) * 1.8;
    const baseScore = Math.round(1000 * difficultyMultiplier);

    const targetTimeSec = Math.max(35, currentConfig.parMoves * 3);
    const timeBonus = activePlaySeconds < targetTimeSec
      ? Math.round(Math.pow(Math.max(0, (targetTimeSec - activePlaySeconds) / targetTimeSec), 1.4) * 600 * difficultyMultiplier)
      : 0;

    let moveBonus = 0;
    if (movesCount <= currentConfig.parMoves) {
      moveBonus = Math.round((currentConfig.parMoves - movesCount + 1) * 40 * difficultyMultiplier);
    } else {
      moveBonus = Math.round(-Math.min(300, (movesCount - currentConfig.parMoves) * 15 * difficultyMultiplier));
    }

    const hintPenalty = Math.round(hintsUsed * 150 * difficultyMultiplier);
    const extraTubePenalty = Math.round(tubesAdded * 300 * difficultyMultiplier);
    const invalidPenalty = Math.round(invalidAttempts * 25);

    const levelFinalScore = Math.max(300, Math.round(baseScore + timeBonus + moveBonus - hintPenalty - extraTubePenalty - invalidPenalty));

    // Calculate stars based on Par Moves
    let stars = 1;
    if (movesCount <= currentConfig.parMoves) stars = 3;
    else if (movesCount <= currentConfig.parMoves + 4) stars = 2;

    const updatedProgress = { ...levelProgress };
    const curRec = updatedProgress[currentLevelNum] || {
      unlocked: true,
      completed: false,
      stars: 0,
      bestMoves: 999,
      highScore: 0,
    };

    const isNewBest = levelFinalScore > (curRec.highScore || 0);
    const updatedHighScore = Math.max(curRec.highScore || 0, levelFinalScore);
    const updatedBestMoves = curRec.bestMoves === 0 ? movesCount : Math.min(curRec.bestMoves, movesCount);

    updatedProgress[currentLevelNum] = {
      unlocked: true,
      completed: true,
      stars: Math.max(curRec.stars, stars),
      bestMoves: updatedBestMoves,
      highScore: updatedHighScore,
    };

    // Unlock next level up to 40
    if (currentLevelNum < 40) {
      updatedProgress[currentLevelNum + 1] = {
        ...(updatedProgress[currentLevelNum + 1] || { completed: false, stars: 0, bestMoves: 0, highScore: 0 }),
        unlocked: true,
      };
    }

    setLevelProgress(updatedProgress);
    try {
      localStorage.setItem(STORAGE_KEY_LEVELS, JSON.stringify(updatedProgress));
    } catch {}

    // Recalculate Championship Total Score (sum of all best level scores)
    let cumulativeTotal = 0;
    (Object.values(updatedProgress) as LevelSaveData[]).forEach((rec) => {
      if (rec.completed) cumulativeTotal += (rec.highScore || 0);
    });

    // Record score with global tournament leaderboard service
    GameLeaderboardService.recordScore(
      'royal-water-sort',
      cumulativeTotal,
      profile?.displayName || profile?.phoneNumber,
      currentLevelNum
    );

    const breakdown: LevelScoreBreakdown = {
      levelNum: currentLevelNum,
      baseScore,
      timeBonus,
      moveBonus,
      hintPenalty,
      extraTubePenalty,
      invalidPenalty,
      finalScore: levelFinalScore,
      isNewBest,
      cumulativeTotalScore: cumulativeTotal,
      moves: movesCount,
      parMoves: currentConfig.parMoves,
      timeSeconds: activePlaySeconds,
      stars,
    };
    setScoreBreakdown(breakdown);

    // Flying coin shower particles
    setFlyingCoins(Array.from({ length: 8 }, (_, i) => i));

    const tClear = window.setTimeout(() => {
      setFlyingCoins([]);
      if (currentLevelNum === 40) {
        setScreen('CHAMPIONSHIP_COMPLETE');
      } else {
        setScreen('LEVEL_CLEAR');
      }
      onGameOver(cumulativeTotal, activePlaySeconds);
    }, 1100);

    pourTimersRef.current.push(tClear);
  };

  // ---------------------------------------------------------------------------
  // 5. Booster Actions (Shuffle, Undo, Extra Tube)
  // ---------------------------------------------------------------------------
  const handleBoosterShuffle = () => {
    if (screen !== 'PLAYING' || pourAnim.isPouring || boosters.shuffle <= 0) return;
    royalWaterSortAudio.playBoosterChime();
    triggerHaptic(25);

    const allLayers: LiquidColorId[] = [];
    bottles.forEach((b) => {
      if (!WaterSortEngine.isBottleCompleted(b)) {
        allLayers.push(...b.layers);
      }
    });

    // Shuffle layers randomly
    for (let i = allLayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLayers[i], allLayers[j]] = [allLayers[j], allLayers[i]];
    }

    // Redistribute into open bottles
    let readIdx = 0;
    const shuffledBottles = bottles.map((b) => {
      if (WaterSortEngine.isBottleCompleted(b)) return b;
      const count = b.layers.length;
      const newLayers = allLayers.slice(readIdx, readIdx + count);
      readIdx += count;
      return { ...b, layers: newLayers };
    });

    setBottles(shuffledBottles);
    setSelectedBottleId(null);
    setBoosters((prev) => {
      const next = { ...prev, shuffle: prev.shuffle - 1 };
      try {
        localStorage.setItem(STORAGE_KEY_BOOSTERS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleBoosterUndo = () => {
    if (screen !== 'PLAYING' || pourAnim.isPouring || moveHistory.length === 0 || boosters.undo <= 0) return;
    royalWaterSortAudio.playBoosterChime();
    triggerHaptic(20);

    const lastMove = moveHistory[moveHistory.length - 1];
    const newHistory = moveHistory.slice(0, -1);

    const revertedBottles = bottles.map((b) => {
      if (b.id === lastMove.sourceBottleId) {
        return { ...b, layers: [...lastMove.previousSourceLayers], isCompleted: false };
      }
      if (b.id === lastMove.destBottleId) {
        return { ...b, layers: [...lastMove.previousDestLayers], isCompleted: false };
      }
      return b;
    });

    setBottles(revertedBottles);
    setMoveHistory(newHistory);
    setSelectedBottleId(null);
    setMovesCount((prev) => Math.max(0, prev - 1));
    setBoosters((prev) => {
      const next = { ...prev, undo: prev.undo - 1 };
      try {
        localStorage.setItem(STORAGE_KEY_BOOSTERS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleBoosterExtraTube = () => {
    if (screen !== 'PLAYING' || pourAnim.isPouring || boosters.extraTube <= 0) return;
    if (bottles.length > currentConfig.bottles.length) return; // Cap at 1 extra tube per level

    royalWaterSortAudio.playBoosterChime();
    triggerHaptic(25);
    setTubesAdded((prev) => prev + 1);

    const newBottle: BottleState = {
      id: bottles.length + 1,
      layers: [],
      capacity: currentConfig.capacity,
      isCompleted: false,
    };

    setBottles([...bottles, newBottle]);
    setBoosters((prev) => {
      const next = { ...prev, extraTube: prev.extraTube - 1 };
      try {
        localStorage.setItem(STORAGE_KEY_BOOSTERS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleHint = () => {
    if (screen !== 'PLAYING' || pourAnim.isPouring) return;
    const move = WaterSortEngine.findHintMove(bottles);
    if (move) {
      royalWaterSortAudio.playBoosterChime();
      triggerHaptic(20);
      setHintsUsed((prev) => prev + 1);
      setHint(move);
    }
  };

  // ---------------------------------------------------------------------------
  // Sound & Navigation Helpers
  // ---------------------------------------------------------------------------
  const handleToggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    royalWaterSortAudio.setEnabled(!nextState);
  };

  const handleExitGame = () => {
    royalWaterSortAudio.destroy();
    onExit();
  };

  // ===========================================================================
  // RENDER VIEWPORT
  // ===========================================================================
  return (
    <div
      id="royal-water-sort-viewport"
      className="relative w-full h-full max-w-lg md:max-w-xl mx-auto flex flex-col justify-between overflow-hidden bg-[#07133A] text-white select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* =====================================================================
          1. LOADING SCREEN & SLIDING CURTAIN
         ===================================================================== */}
      {screen === 'LOADING' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#180A2D] via-[#0E153D] to-[#060D24] text-center select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

          <div className="w-full pt-4" />

          <div className="flex flex-col items-center justify-center my-auto space-y-4">
            <div className="relative text-5xl drop-shadow-[0_4px_12px_rgba(255,215,0,0.6)] animate-bounce">
              👑
            </div>

            <div className="space-y-0.5">
              <h1 className="text-4xl sm:text-5xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-[#E0F2FE] to-[#38BDF8] drop-shadow-xl uppercase">
                ROYAL
              </h1>
              <h2 className="text-3xl sm:text-4xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#38BDF8] to-[#2563EB] drop-shadow-xl uppercase">
                WATER
              </h2>
              <h3 className="text-3xl sm:text-4xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#C084FC] to-[#7E22CE] drop-shadow-xl uppercase">
                SORT
              </h3>
            </div>

            <div className="flex items-center justify-center gap-3 pt-6">
              {[
                { color: '#25DCE8', name: 'cyan' },
                { color: '#FF4FA3', name: 'pink' },
                { color: '#42D66B', name: 'green' },
                { color: '#FFD83D', name: 'yellow' },
              ].map((b, idx) => (
                <div
                  key={idx}
                  className="w-7 h-20 rounded-full border-2 border-white/60 bg-white/10 p-1 flex flex-col justify-end shadow-lg overflow-hidden animate-pulse"
                  style={{ animationDelay: `${idx * 180}ms` }}
                >
                  <div
                    className="w-full rounded-full transition-all duration-300"
                    style={{
                      height: `${45 + (idx % 3) * 20}%`,
                      backgroundColor: b.color,
                      boxShadow: `0 0 10px ${b.color}`,
                    }}
                  />
                </div>
              ))}
            </div>

            <p className="text-sm font-black tracking-widest text-amber-300 uppercase pt-4">
              LOADING... {loadingProgress}%
            </p>
          </div>

          <div className="w-full pb-6 text-xs text-slate-400 font-medium">
            GameON Tele • Royal Puzzle Series
          </div>
        </div>
      )}

      {/* Sliding Shutter / Curtain Animation Overlay */}
      {isCurtainOpen && (
        <div className="absolute inset-0 z-40 pointer-events-none flex">
          <div className="w-1/2 h-full bg-[#180A2D] border-r-2 border-amber-400/80 transition-transform duration-500 ease-out transform -translate-x-full" />
          <div className="w-1/2 h-full bg-[#180A2D] border-l-2 border-amber-400/80 transition-transform duration-500 ease-out transform translate-x-full" />
        </div>
      )}

      {/* =====================================================================
          2. MAIN MENU (Complete, Professional Experience with Full Options)
         ===================================================================== */}
      {screen === 'MENU' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-4 sm:p-5 bg-gradient-to-b from-[#180A2D] via-[#0E1742] to-[#050C22] text-center select-none animate-in fade-in duration-300 overflow-y-auto">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />

          {/* Top Bar: Back, Coins & Sound */}
          <div className="w-full flex items-center justify-between pt-1 z-10">
            <button
              onClick={() => {
                royalWaterSortAudio.playClick();
                handleExitGame();
              }}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer border border-white/15"
              aria-label="Back to portal"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            {/* Coin Pill */}
            <div className="flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 px-3.5 py-1.5 rounded-full shadow-lg">
              <span className="text-base">🪙</span>
              <span className="text-sm font-black text-amber-300">{coins}</span>
              <button
                onClick={() => {
                  royalWaterSortAudio.playCoin();
                  setCoins((c) => c + 50);
                }}
                className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer border border-white/15"
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-[#8BCB3D]" />}
            </button>
          </div>

          {/* Central Logo */}
          <div className="flex flex-col items-center justify-center my-3 space-y-1 z-10">
            <span className="text-4xl sm:text-5xl drop-shadow-[0_6px_16px_rgba(255,215,0,0.6)] animate-pulse">
              👑
            </span>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-[#E0F2FE] to-[#38BDF8] drop-shadow-2xl uppercase">
              ROYAL
            </h1>
            <h2 className="text-2xl sm:text-3xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#38BDF8] to-[#2563EB] drop-shadow-2xl uppercase">
              WATER SORT
            </h2>
            <p className="text-[11px] uppercase font-extrabold tracking-widest text-amber-300 pt-0.5">
              40 Championship Levels • 3D Glass Puzzle
            </p>
          </div>

          {/* Career Summary Card (Tournament High-Level Statistics) */}
          <div className="w-full max-w-sm mb-3 z-10 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 text-left shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Career Summary
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>40 Levels</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              {/* Current Level */}
              <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                <span className="block text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">
                  Current
                </span>
                <span className="text-sm sm:text-base font-black text-cyan-400">
                  Lvl {currentLevelNum}
                </span>
              </div>

              {/* Total Cumulative Score */}
              <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                <span className="block text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">
                  Total Score
                </span>
                <span className="text-sm sm:text-base font-black text-amber-300">
                  {careerSummary.totalCumulativeScore.toLocaleString()}
                </span>
              </div>

              {/* Best Score */}
              <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                <span className="block text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">
                  Best Score
                </span>
                <span className="text-sm sm:text-base font-black text-emerald-400">
                  {careerSummary.bestLevelScore.score.toLocaleString()}
                </span>
              </div>

              {/* Levels Completed */}
              <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                <span className="block text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">
                  Cleared
                </span>
                <span className="text-xs sm:text-sm font-bold text-white">
                  {careerSummary.levelsCompleted} / 40
                </span>
              </div>

              {/* Total Stars */}
              <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                <span className="block text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">
                  Stars Earned
                </span>
                <span className="text-xs sm:text-sm font-bold text-amber-300 flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                  <span>{careerSummary.totalStars} / 120</span>
                </span>
              </div>

              {/* Best Moves */}
              <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                <span className="block text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">
                  Best Moves
                </span>
                <span className="text-xs sm:text-sm font-bold text-white">
                  {levelProgress[currentLevelNum]?.bestMoves > 0 ? `${levelProgress[currentLevelNum].bestMoves} m` : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Action Buttons (PLAY, LEVELS, HOW TO PLAY, BOOSTERS, SETTINGS, ABOUT) */}
          <div className="w-full max-w-sm space-y-2.5 pb-4 flex flex-col items-center z-10">
            {/* Primary Action Button: PLAY */}
            <button
              onClick={() => startLevel(getHighestUnlockedLevel())}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#FFD54F] via-[#FFCA28] to-[#FFA000] hover:brightness-110 active:scale-95 text-[#0F1E2E] font-black text-lg tracking-wider shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-300"
            >
              <Play className="w-5 h-5 fill-current text-[#0F1E2E]" />
              <span>PLAY LEVEL {getHighestUnlockedLevel()}</span>
            </button>

            {/* Secondary: LEVELS & LEADERBOARD */}
            <div className="w-full grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  royalWaterSortAudio.playClick();
                  setScreen('LEVEL_SELECT');
                }}
                className="h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-black text-xs tracking-wider flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>LEVELS (1–40)</span>
              </button>

              <button
                onClick={() => {
                  royalWaterSortAudio.playClick();
                  setScreen('LEADERBOARD');
                }}
                className="h-11 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 font-black text-xs tracking-wider flex items-center justify-center gap-1.5 border border-amber-400/40 transition-all cursor-pointer shadow-sm"
              >
                <Trophy className="w-4 h-4 text-yellow-300 fill-current" />
                <span>LEADERBOARD</span>
              </button>
            </div>

            {/* Secondary Row: HOW TO PLAY & BOOSTERS */}
            <div className="w-full grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  royalWaterSortAudio.playClick();
                  setScreen('HOW_TO_PLAY');
                }}
                className="h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>HOW TO PLAY</span>
              </button>

              <button
                onClick={() => {
                  royalWaterSortAudio.playClick();
                  setScreen('BOOSTERS');
                }}
                className="h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>BOOSTERS</span>
              </button>
            </div>

            {/* Third Row: SETTINGS & ABOUT */}
            <div className="w-full grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  royalWaterSortAudio.playClick();
                  setScreen('SETTINGS');
                }}
                className="h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-300" />
                <span>SETTINGS</span>
              </button>

              <button
                onClick={() => {
                  royalWaterSortAudio.playClick();
                  setScreen('ABOUT');
                }}
                className="h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
              >
                <Info className="w-4 h-4 text-slate-300" />
                <span>ABOUT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. HOW TO PLAY SCREEN (Rich, Comprehensive Interactive Guide)
         ===================================================================== */}
      {screen === 'HOW_TO_PLAY' && (
        <div className="absolute inset-0 z-30 flex flex-col bg-[#0A122E] text-white p-4 overflow-hidden select-none animate-in fade-in duration-200">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <button
              onClick={() => {
                royalWaterSortAudio.playClick();
                setScreen('MENU');
              }}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-lg font-black tracking-tight uppercase text-white">How To Play</h2>
            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-left text-xs leading-relaxed text-slate-200 scrollbar-thin scrollbar-thumb-white/20">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 font-black text-amber-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>OBJECTIVE</span>
              </div>
              <p>
                Sort all colored liquid so that each completed bottle contains only one pure color from top to bottom.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 font-black text-cyan-300 text-sm">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>HOW TO POUR</span>
              </div>
              <p>
                1. Tap any non-empty glass bottle to lift and select it.<br />
                2. Tap a compatible destination bottle to tilt and transfer liquid.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 font-black text-green-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>LEGAL POUR RULES</span>
              </div>
              <p>
                • You can pour into an <strong>EMPTY</strong> bottle if there is enough capacity.<br />
                • You can pour onto a non-empty bottle <strong>ONLY IF</strong> its top color matches the source top color.<br />
                • The <strong>entire continuous top group</strong> of matching colors must fit. If destination lacks room for the complete group, the pour is invalid.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 font-black text-red-300 text-sm">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>INVALID MOVES</span>
              </div>
              <p>
                • You cannot pour onto a different color.<br />
                • You cannot pour into a full bottle.<br />
                • You cannot partially pour a group if the full group does not fit.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 font-black text-yellow-300 text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>WIN CONDITION & STARS</span>
              </div>
              <p>
                A level is complete when every non-empty bottle is full and pure (monochromatic). Golden wooden corks will seal the bottles.<br />
                Earn up to 3 Stars based on beating each level&apos;s Par Move threshold!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              royalWaterSortAudio.playClick();
              setScreen('MENU');
            }}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#FFD54F] to-[#FFA000] text-slate-950 font-black text-sm uppercase tracking-wider transition-all cursor-pointer border border-amber-300 mt-2"
          >
            GOT IT, LET&apos;S PLAY
          </button>
        </div>
      )}

      {/* =====================================================================
          4. BOOSTERS SCREEN (Detailed Guide for All Boosters)
         ===================================================================== */}
      {screen === 'BOOSTERS' && (
        <div className="absolute inset-0 z-30 flex flex-col bg-[#0A122E] text-white p-4 overflow-hidden select-none animate-in fade-in duration-200">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <button
              onClick={() => {
                royalWaterSortAudio.playClick();
                setScreen('MENU');
              }}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-lg font-black tracking-tight uppercase text-white">Boosters Guide</h2>
            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-left text-xs leading-relaxed text-slate-200 scrollbar-thin scrollbar-thumb-white/20">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#26C6DA] to-[#0097A7] border border-cyan-300 flex items-center justify-center shadow">
                  <Shuffle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-cyan-300">SHUFFLE</h3>
                  <p className="text-[11px] text-slate-400">Available count: {boosters.shuffle}</p>
                </div>
              </div>
              <p>
                Rearranges all unconsolidated liquid layers across open bottles. Use this when stuck in a dead-end to unlock new combinations!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#26C6DA] to-[#0097A7] border border-cyan-300 flex items-center justify-center shadow">
                  <Undo2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-cyan-300">UNDO</h3>
                  <p className="text-[11px] text-slate-400">Available count: {boosters.undo}</p>
                </div>
              </div>
              <p>
                Reverts your exact previous valid pour, restoring the bottle states and move counter without restarting the level.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#26C6DA] to-[#0097A7] border border-cyan-300 flex items-center justify-center shadow">
                  <PlusCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-cyan-300">EXTRA BOTTLE</h3>
                  <p className="text-[11px] text-slate-400">Available count: {boosters.extraTube}</p>
                </div>
              </div>
              <p>
                Adds a brand new empty 3D glass vial into the arena, providing crucial breathing room for intricate multi-color sorting.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#F59E0B] to-[#D97706] border border-amber-300 flex items-center justify-center shadow">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-amber-300">HINT SYSTEM</h3>
                  <p className="text-[11px] text-slate-400">Free to use</p>
                </div>
              </div>
              <p>
                Tap the side HINT button during gameplay to highlight the recommended source and destination bottles.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              royalWaterSortAudio.playClick();
              setScreen('MENU');
            }}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#FFD54F] to-[#FFA000] text-slate-950 font-black text-sm uppercase tracking-wider transition-all cursor-pointer border border-amber-300 mt-2"
          >
            RETURN TO MENU
          </button>
        </div>
      )}

      {/* =====================================================================
          5. SETTINGS SCREEN
         ===================================================================== */}
      {screen === 'SETTINGS' && (
        <div className="absolute inset-0 z-30 flex flex-col bg-[#0A122E] text-white p-4 overflow-hidden select-none animate-in fade-in duration-200">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <button
              onClick={() => {
                royalWaterSortAudio.playClick();
                setScreen('MENU');
              }}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-lg font-black tracking-tight uppercase text-white">Settings</h2>
            <div className="w-10" />
          </div>

          <div className="flex-1 py-6 space-y-4 text-left">
            {/* Sound Toggle */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="font-bold text-sm text-white">Game Sound Effects</div>
                  <div className="text-[11px] text-slate-400">Procedural Web Audio synthesis</div>
                </div>
              </div>
              <button
                onClick={handleToggleSound}
                className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                  !isMuted ? 'bg-[#22C55E]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transition-transform ${
                    !isMuted ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Haptics Toggle */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Vibrate className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="font-bold text-sm text-white">Vibration & Haptics</div>
                  <div className="text-[11px] text-slate-400">Touch response during pours</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setHapticsEnabled(!hapticsEnabled);
                  triggerHaptic(20);
                }}
                className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                  hapticsEnabled ? 'bg-[#22C55E]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transition-transform ${
                    hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Reset Progress Option */}
            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-red-300">Reset All Progress</div>
                <div className="text-[11px] text-slate-400">Lock levels 2–40 and reset coins</div>
              </div>
              <button
                onClick={() => {
                  if (confirm('Reset Royal Water Sort progression back to Level 1?')) {
                    localStorage.removeItem(STORAGE_KEY_LEVELS);
                    localStorage.removeItem(STORAGE_KEY_COINS);
                    localStorage.removeItem(STORAGE_KEY_BOOSTERS);
                    window.location.reload();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 active:scale-95 text-white font-bold text-xs cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              royalWaterSortAudio.playClick();
              setScreen('MENU');
            }}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#FFD54F] to-[#FFA000] text-slate-950 font-black text-sm uppercase tracking-wider transition-all cursor-pointer border border-amber-300"
          >
            SAVE & CLOSE
          </button>
        </div>
      )}

      {/* =====================================================================
          6. ABOUT SCREEN
         ===================================================================== */}
      {screen === 'ABOUT' && (
        <div className="absolute inset-0 z-30 flex flex-col bg-[#0A122E] text-white p-4 overflow-hidden select-none animate-in fade-in duration-200">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <button
              onClick={() => {
                royalWaterSortAudio.playClick();
                setScreen('MENU');
              }}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-lg font-black tracking-tight uppercase text-white">About Game</h2>
            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 text-left text-xs leading-relaxed text-slate-300 scrollbar-thin scrollbar-thumb-white/20">
            <div className="text-center py-2 space-y-1">
              <span className="text-4xl">👑</span>
              <h3 className="text-xl font-black text-white">ROYAL WATER SORT</h3>
              <p className="text-[11px] text-amber-400 font-bold uppercase">Championship Edition v1.2.0</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-black text-white text-sm">✨ 40 Hand-Crafted Levels</div>
              <p>
                Progression begins at Level 1 with a very difficult challenge, scaling through Expert, Extreme, Master, up to the World Championship Final at Level 40.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-black text-white text-sm">🧪 3D Glass & Liquid Physics</div>
              <p>
                Features true 3D glass reflection tubes, curved meniscus liquid boundaries, golden wooden cork seals, and smooth dynamic liquid stream pouring.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-black text-white text-sm">🎵 Pure Web Audio Engine</div>
              <p>
                Procedural audio synthesis with realistic liquid bubbles, settling droplets, cork pops, and victory fanfares without external audio file bloat.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              royalWaterSortAudio.playClick();
              setScreen('MENU');
            }}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#FFD54F] to-[#FFA000] text-slate-950 font-black text-sm uppercase tracking-wider transition-all cursor-pointer border border-amber-300 mt-2"
          >
            BACK TO MENU
          </button>
        </div>
      )}

      {/* =====================================================================
          7. LEVEL SELECT SCREEN (40 Levels Grid)
         ===================================================================== */}
      {screen === 'LEVEL_SELECT' && (
        <div className="absolute inset-0 z-30 flex flex-col bg-[#0A122E] text-white p-4 overflow-hidden select-none animate-in fade-in duration-200">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <button
              onClick={() => {
                royalWaterSortAudio.playClick();
                setScreen('MENU');
              }}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center cursor-pointer transition-all border border-white/15"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-black tracking-tight uppercase text-white">Select Level</h2>
              <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                Level 1 is Very Difficult
              </p>
            </div>

            <div className="flex items-center gap-1 bg-amber-400/20 px-2.5 py-1 rounded-full border border-amber-400/30 text-xs font-bold text-amber-300">
              <span>🪙</span>
              <span>{coins}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-3 pr-1 scrollbar-thin scrollbar-thumb-white/20">
            {/* Career Progress Mini-Banner */}
            <div className="flex items-center justify-between mb-3 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>{careerSummary.levelsCompleted} / 40 Cleared</span>
              </div>
              <div className="flex items-center gap-1 text-amber-300 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{careerSummary.totalStars} / 120</span>
              </div>
              <div className="text-cyan-300 font-mono font-bold">
                {careerSummary.totalCumulativeScore.toLocaleString()} PTS
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {ROYAL_WATER_SORT_LEVELS.map((lvl) => {
                const rec = levelProgress[lvl.levelNum] || {
                  unlocked: lvl.levelNum === 1,
                  completed: false,
                  stars: 0,
                  bestMoves: 0,
                  highScore: 0,
                };
                const isUnlocked = rec.unlocked;
                const isCurrent = lvl.levelNum === currentLevelNum;

                return (
                  <button
                    key={lvl.levelNum}
                    disabled={!isUnlocked}
                    onClick={() => startLevel(lvl.levelNum)}
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-1.5 transition-all border ${
                      !isUnlocked
                        ? 'bg-slate-900/60 border-white/5 opacity-45 cursor-not-allowed'
                        : isCurrent
                        ? 'bg-gradient-to-b from-[#FFD54F] to-[#FFA000] border-amber-300 text-slate-900 shadow-md shadow-amber-500/30 cursor-pointer active:scale-95'
                        : rec.completed
                        ? 'bg-gradient-to-b from-[#1D7A3F]/50 to-[#14522B]/70 border-[#238947] text-white cursor-pointer active:scale-95'
                        : 'bg-white/10 hover:bg-white/20 border-white/20 text-white cursor-pointer active:scale-95'
                    }`}
                  >
                    {!isUnlocked ? (
                      <Lock className="w-5 h-5 text-slate-400" />
                    ) : (
                      <>
                        <span className={`text-lg font-black leading-none ${isCurrent ? 'text-slate-900' : 'text-white'}`}>
                          {lvl.levelNum}
                        </span>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-2.5 h-2.5 ${
                                s <= rec.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          8. TOP GAMEPLAY HUD (Back, Pause, LEVEL X, Coins, Sound)
         ===================================================================== */}
      {(screen === 'PLAYING' || screen === 'PAUSED' || screen === 'LEVEL_CLEAR' || screen === 'NO_MOVES') && (
        <header className="relative z-20 w-full px-3.5 pt-3 pb-2 flex flex-col gap-1 bg-gradient-to-b from-[#07133A]/95 to-transparent">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Back & Pause */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  royalWaterSortAudio.playClick();
                  royalWaterSortAudio.pauseAll();
                  setScreen('PAUSED');
                }}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer"
                aria-label="Pause and open menu"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={() => {
                  royalWaterSortAudio.playClick();
                  royalWaterSortAudio.pauseAll();
                  setScreen('PAUSED');
                }}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer"
                aria-label="Pause game"
              >
                <Pause className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Center: LEVEL X & Par & Time */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wider uppercase">
                  LEVEL {currentLevelNum}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 font-mono font-bold">
                  {formatPlayTime(activePlaySeconds)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-extrabold uppercase tracking-wider">
                <span>{currentConfig.difficultyLabel}</span>
                <span>•</span>
                <span className={movesCount > currentConfig.parMoves ? 'text-rose-400 font-bold' : 'text-emerald-300 font-bold'}>
                  MOVES: {movesCount} / {currentConfig.parMoves} PAR
                </span>
              </div>
            </div>

            {/* Right: Coin Pill & Sound */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 px-3 py-1.5 rounded-xl shadow">
                <span className="text-sm">🪙</span>
                <span className="text-xs font-black text-amber-300">{coins}</span>
              </div>

              <button
                onClick={handleToggleSound}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer"
                aria-label="Toggle Sound"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#8BCB3D]" />}
              </button>
            </div>
          </div>

          {/* Reference Instruction Banner */}
          {showTutorialHint && screen === 'PLAYING' && (
            <div className="mx-auto mt-1 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/15 text-center animate-in fade-in">
              <p className="text-[11px] font-bold text-slate-200">
                Only Pour Water Into the Same Color
              </p>
            </div>
          )}
        </header>
      )}

      {/* =====================================================================
          9. BOTTLE ARENA & REAL DYNAMIC SVG STREAM CONNECTOR
         ===================================================================== */}
      <div 
        ref={arenaRef}
        className="relative flex-1 w-full h-full flex flex-col items-center justify-center p-3 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none" />

        {/* Dynamic Curved SVG Liquid Stream (Real coordinates connecting bottle mouth to opening) */}
        {pourAnim.isPouring && streamPath && pourAnim.color && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible">
            <defs>
              <filter id="royal-stream-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d={streamPath}
              stroke={LIQUID_COLORS[pourAnim.color].stream}
              strokeWidth="7.5"
              strokeLinecap="round"
              fill="none"
              filter="url(#royal-stream-glow)"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Bottle Layout (Responsive 1 or 2 rows based on bottle count) */}
        <div className="w-full flex flex-col items-center justify-center gap-6 my-auto z-20">
          {/* Row 1 */}
          <div className="flex items-center justify-center flex-wrap gap-3 sm:gap-4">
            {bottles.slice(0, Math.ceil(bottles.length / 2)).map((bottle) => {
              const isSource = pourAnim.sourceBottleId === bottle.id;
              const isDest = pourAnim.destBottleId === bottle.id;

              return (
                <RoyalWaterBottle
                  key={bottle.id}
                  innerRef={(el) => {
                    if (el) bottleRefs.current.set(bottle.id, el);
                    else bottleRefs.current.delete(bottle.id);
                  }}
                  bottle={bottle}
                  isSelected={selectedBottleId === bottle.id}
                  isShaking={shakingBottleId === bottle.id}
                  isPouringSource={isSource}
                  isPouringDest={isDest}
                  isHintSource={hint?.sourceBottleId === bottle.id}
                  isHintDest={hint?.destBottleId === bottle.id}
                  tiltAngle={isSource ? pourAnim.tiltAngle : 0}
                  offsetX={isSource ? pourAnim.sourceOffset.x : 0}
                  offsetY={isSource ? pourAnim.sourceOffset.y : 0}
                  sourceTransferProgress={isSource ? pourAnim.sourceTransferProgress : 0}
                  transferCount={pourAnim.count}
                  destTransferProgress={isDest ? pourAnim.destTransferProgress : 0}
                  transferColor={pourAnim.color}
                  onSelect={handleBottleTap}
                  width={bottles.length > 7 ? 50 : 58}
                  height={bottles.length > 7 ? 150 : 168}
                />
              );
            })}
          </div>

          {/* Row 2 (if bottles > 4) */}
          {bottles.length > 4 && (
            <div className="flex items-center justify-center flex-wrap gap-3 sm:gap-4">
              {bottles.slice(Math.ceil(bottles.length / 2)).map((bottle) => {
                const isSource = pourAnim.sourceBottleId === bottle.id;
                const isDest = pourAnim.destBottleId === bottle.id;

                return (
                  <RoyalWaterBottle
                    key={bottle.id}
                    innerRef={(el) => {
                      if (el) bottleRefs.current.set(bottle.id, el);
                      else bottleRefs.current.delete(bottle.id);
                    }}
                    bottle={bottle}
                    isSelected={selectedBottleId === bottle.id}
                    isShaking={shakingBottleId === bottle.id}
                    isPouringSource={isSource}
                    isPouringDest={isDest}
                    isHintSource={hint?.sourceBottleId === bottle.id}
                    isHintDest={hint?.destBottleId === bottle.id}
                    tiltAngle={isSource ? pourAnim.tiltAngle : 0}
                    offsetX={isSource ? pourAnim.sourceOffset.x : 0}
                    offsetY={isSource ? pourAnim.sourceOffset.y : 0}
                    sourceTransferProgress={isSource ? pourAnim.sourceTransferProgress : 0}
                    transferCount={pourAnim.count}
                    destTransferProgress={isDest ? pourAnim.destTransferProgress : 0}
                    transferColor={pourAnim.color}
                    onSelect={handleBottleTap}
                    width={bottles.length > 7 ? 50 : 58}
                    height={bottles.length > 7 ? 150 : 168}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Circular "HINT" Button on right side of screen */}
        {screen === 'PLAYING' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-20">
            <button
              onClick={handleHint}
              className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 active:scale-95 border border-white/20 flex flex-col items-center justify-center text-white text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg"
              title="Hint"
            >
              <span>Hint</span>
              <ChevronRight className="w-3 h-3 text-amber-400" />
            </button>
          </div>
        )}
      </div>

      {/* =====================================================================
          10. BOTTOM BOOSTER BAR (Shuffle, Undo, Add Extra Bottle)
         ===================================================================== */}
      {screen === 'PLAYING' && (
        <footer className="relative z-20 w-full px-6 py-4 flex items-center justify-center gap-6 bg-gradient-to-t from-[#050C22] via-[#07133A]/80 to-transparent">
          {/* Booster 1: SHUFFLE */}
          <button
            onClick={handleBoosterShuffle}
            disabled={boosters.shuffle <= 0 || pourAnim.isPouring}
            className={`relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer active:scale-95 shadow-lg ${
              boosters.shuffle > 0 && !pourAnim.isPouring
                ? 'bg-gradient-to-b from-[#26C6DA] to-[#0097A7] border-cyan-300 text-white shadow-cyan-500/20'
                : 'bg-slate-800/60 border-white/10 opacity-40 cursor-not-allowed'
            }`}
            title="Shuffle Puzzle"
          >
            <Shuffle className="w-7 h-7" />
            <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow">
              {boosters.shuffle}
            </span>
          </button>

          {/* Booster 2: UNDO */}
          <button
            onClick={handleBoosterUndo}
            disabled={boosters.undo <= 0 || moveHistory.length === 0 || pourAnim.isPouring}
            className={`relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer active:scale-95 shadow-lg ${
              boosters.undo > 0 && moveHistory.length > 0 && !pourAnim.isPouring
                ? 'bg-gradient-to-b from-[#26C6DA] to-[#0097A7] border-cyan-300 text-white shadow-cyan-500/20'
                : 'bg-slate-800/60 border-white/10 opacity-40 cursor-not-allowed'
            }`}
            title="Undo Move"
          >
            <Undo2 className="w-7 h-7" />
            <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow">
              {boosters.undo}
            </span>
          </button>

          {/* Booster 3: ADD EXTRA BOTTLE */}
          <button
            onClick={handleBoosterExtraTube}
            disabled={boosters.extraTube <= 0 || bottles.length > currentConfig.bottles.length || pourAnim.isPouring}
            className={`relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer active:scale-95 shadow-lg ${
              boosters.extraTube > 0 && bottles.length === currentConfig.bottles.length && !pourAnim.isPouring
                ? 'bg-gradient-to-b from-[#26C6DA] to-[#0097A7] border-cyan-300 text-white shadow-cyan-500/20'
                : 'bg-slate-800/60 border-white/10 opacity-40 cursor-not-allowed'
            }`}
            title="Add Extra Bottle"
          >
            <PlusCircle className="w-7 h-7" />
            <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow">
              {boosters.extraTube}
            </span>
          </button>
        </footer>
      )}

      {/* =====================================================================
          11. LEVEL CLEAR / CHAMPIONSHIP VICTORY MODAL WITH DETAILED BREAKDOWN
         ===================================================================== */}
      <RoyalWaterSortVictoryModal
        isOpen={screen === 'LEVEL_CLEAR' || screen === 'CHAMPIONSHIP_COMPLETE'}
        levelConfig={currentConfig}
        scoreBreakdown={scoreBreakdown}
        totalLevels={ROYAL_WATER_SORT_LEVELS.length}
        rewardCoins={currentConfig.rewardCoins}
        onNextLevel={() => {
          royalWaterSortAudio.playClick();
          startLevel(currentLevelNum + 1);
        }}
        onReplay={() => {
          royalWaterSortAudio.playClick();
          startLevel(currentLevelNum);
        }}
        onOpenLevels={() => {
          royalWaterSortAudio.playClick();
          setScreen('LEVEL_SELECT');
        }}
        onOpenLeaderboard={() => {
          royalWaterSortAudio.playClick();
          setScreen('LEADERBOARD');
        }}
      />

      {/* =====================================================================
          13. PAUSE PANEL (With Direct Menu & Help Access)
         ===================================================================== */}
      {screen === 'PAUSED' && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-xs rounded-3xl bg-[#0E1742] border-2 border-white/20 p-6 text-center space-y-3.5 shadow-2xl">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">
              GAME PAUSED
            </h2>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  royalWaterSortAudio.playClick();
                  royalWaterSortAudio.resumeAll();
                  setScreen('PLAYING');
                }}
                className="w-full h-12 rounded-2xl bg-[#00E5FF] hover:bg-[#00b0ff] active:scale-95 text-[#0F1E2E] font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>RESUME</span>
              </button>

              <button
                onClick={() => {
                  royalWaterSortAudio.playClick();
                  setScreen('LEADERBOARD');
                }}
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-amber-400/40 transition-all cursor-pointer shadow-sm"
              >
                <Trophy className="w-4 h-4 text-yellow-300 fill-current" />
                <span>LEADERBOARD</span>
              </button>

              <button
                onClick={() => {
                  royalWaterSortAudio.resumeAll();
                  startLevel(currentLevelNum);
                }}
                className="w-full h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESTART LEVEL</span>
              </button>

              <button
                onClick={() => {
                  royalWaterSortAudio.playClick();
                  setScreen('HOW_TO_PLAY');
                }}
                className="w-full h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>HOW TO PLAY</span>
              </button>

              <button
                onClick={() => {
                  royalWaterSortAudio.playClick();
                  setScreen('SETTINGS');
                }}
                className="w-full h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-300" />
                <span>SETTINGS</span>
              </button>

              <button
                onClick={() => {
                  royalWaterSortAudio.playClick();
                  royalWaterSortAudio.stopAll();
                  setScreen('MENU');
                }}
                className="w-full h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4 text-amber-400" />
                <span>MAIN MENU</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          14. NO MOVES LEFT MODAL
         ===================================================================== */}
      {screen === 'NO_MOVES' && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 select-none animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-xs rounded-3xl bg-[#0E1742] border-2 border-red-500/40 p-6 text-center space-y-4 shadow-2xl">
            <h2 className="text-2xl font-black text-red-400 uppercase tracking-wider">
              NO MORE MOVES
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              No legal water transfers remain. Use Undo or restart to try again!
            </p>

            <div className="space-y-2.5">
              {moveHistory.length > 0 && boosters.undo > 0 && (
                <button
                  onClick={() => {
                    handleBoosterUndo();
                    setScreen('PLAYING');
                  }}
                  className="w-full h-12 rounded-2xl bg-[#00E5FF] text-slate-900 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Undo2 className="w-4 h-4" />
                  <span>UNDO MOVE</span>
                </button>
              )}

              <button
                onClick={() => startLevel(currentLevelNum)}
                className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RETRY LEVEL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {screen === 'LEADERBOARD' && (
        <GameLeaderboardModal
          gameConfig={GAME_CONFIGS['royal-water-sort']}
          onClose={() => setScreen('MENU')}
        />
      )}
    </div>
  );
};
