/**
 * World Legends - Premium Mobile Word-Connect Puzzle Game
 * 
 * Commercial Football Word Game Visual Overhaul:
 * - Rich Dark Mahogany & Smoked Walnut Wood finishes with polished brass bevels.
 * - Realistic 3D Floodlit Football Pitch with mown lawn striping & chalk markings.
 * - Tactile 3D physical Letter Tiles with engraved typography & letter value subscripts.
 * - Dynamic glowing energetic connection line following touch gestures.
 * - Physical carved dark-wood Word Puzzle Board with recessed slots.
 * - No-Repetition Session Word Bank across 10 categories (2,000+ words).
 * - Tournament Scoring System capped strictly at MAX 400 POINTS.
 * - Complete Session Review modal detailing solved vs missed words.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition, UserProfile } from '../../types';
import { TargetWord, WordRecord, LevelData } from './types';
import { getLevelData, calculateWordPoints, getLetterValue } from './puzzleBank';
import { WorldLegendsAudio } from './worldLegendsAudio';
import { 
  Pause, 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Trophy, 
  Award, 
  CheckCircle2, 
  Clock, 
  Compass, 
  Coins, 
  FileText,
  Sparkles,
  Flame,
  ArrowLeft,
  Tag,
  Lightbulb,
  BookOpen
} from 'lucide-react';

interface WorldLegendsGameProps {
  game: GameDefinition;
  profile?: UserProfile;
  onGameOver: (score: number, durationSeconds: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

// Category icons / labels for aesthetic badge
const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  SPORTS: { label: 'FOOTBALL ARENA', icon: '⚽' },
  NATURE: { label: 'WILD NATURE', icon: '🌿' },
  ETHIOPIA: { label: 'HIGHLAND HERITAGE', icon: '🇪🇹' },
  WORLD: { label: 'WORLD ATLAS', icon: '🌍' },
  FOOD: { label: 'GOURMET KITCHEN', icon: '🍽️' },
  TECH: { label: 'DIGITAL FRONTIER', icon: '⚡' },
  CULTURE: { label: 'GRAND SYMPHONY', icon: '🎭' },
  SCIENCE: { label: 'QUANTUM LAB', icon: '🔬' },
  PEOPLE: { label: 'MASTERS OF TRADE', icon: '👑' },
  AFRICA: { label: 'GREAT CONTINENT', icon: '🦁' },
  EVERYDAY: { label: 'EVERYDAY LIFE', icon: '🧭' },
};

// ============================================================================
// WORLD_LEGENDS_WOOD_MATERIAL
// Master Light Warm Natural Wood Palette & Treatments (Reference Matched)
// ============================================================================
const WOOD_MATERIAL = {
  // Master Outer Border & Bevel Tone
  border: '#b37324',
  borderLight: '#c98833',
  borderDark: '#8a501a',
  
  // Outer Raised Wood (Honey / Golden Maple)
  frame: {
    background: 'linear-gradient(180deg, #f0ba6c 0%, #e09f48 50%, #cb842e 100%)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.55), inset 0 2px 3px rgba(255,235,185,0.7), inset 0 -3px 4px rgba(138,80,24,0.5)',
  },

  // Top Wooden HUD Header Bar
  hud: {
    background: 'linear-gradient(180deg, #f4c37b 0%, #e5a752 60%, #d4933d 100%)',
    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 32px, rgba(160,95,25,0.05) 32px, rgba(160,95,25,0.05) 33px), linear-gradient(180deg, #f4c37b 0%, #e5a752 60%, #d4933d 100%)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,245,210,0.7)',
  },

  // Sub-header / Category Banner Strip
  categoryStrip: {
    background: 'linear-gradient(90deg, #e5a752 0%, #d89842 50%, #e5a752 100%)',
  },

  // Inner Recessed Basin (Puzzle Board Surface)
  basin: {
    background: 'linear-gradient(180deg, #e4a752 0%, #d89842 50%, #cd8c35 100%)',
    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(160,95,25,0.06) 24px, rgba(160,95,25,0.06) 25px), linear-gradient(180deg, #e8ae5a 0%, #dc9d45 50%, #d19139 100%)',
    boxShadow: 'inset 0 3px 6px rgba(100,55,10,0.35), 0 1px 0 rgba(255,255,255,0.3)',
  },

  // Bottom Circular Rotary Wheel Turntable
  wheelTurntable: {
    background: 'radial-gradient(circle, #f5c47c 0%, #e5a650 45%, #cb842e 85%, #b37021 100%)',
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 60%), radial-gradient(circle, #f5c47c 0%, #e5a650 45%, #cb842e 85%, #b37021 100%)',
    boxShadow: '0 15px 30px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,245,210,0.7), inset 0 -4px 8px rgba(138,80,24,0.55), 0 0 0 3px #b37324, 0 0 0 5px #8a501a',
  },

  // Raised Tactile Wooden Buttons, Badges, Chips & Letter Tiles
  tileOrButton: {
    background: 'linear-gradient(180deg, #fce09d 0%, #f1bc68 50%, #e4a64d 100%)',
    boxShadow: '0 3px 6px rgba(0,0,0,0.3), inset 0 1.5px 2px rgba(255,255,255,0.7), inset 0 -2.5px 0 #a96c24',
    border: '1px solid #c98833',
  },

  // Selected / Highlighted Wooden State
  selectedTile: {
    background: 'linear-gradient(180deg, #fff2cc 0%, #f8ce7d 50%, #eca94c 100%)',
    boxShadow: '0 3px 8px rgba(0,0,0,0.45), inset 0 2px 2px #ffffff, inset 0 -2px 0 #9c5c1a, 0 0 12px rgba(245,190,80,0.5)',
    border: '2px solid #df9525',
  },

  // Recessed Slots (Empty Letter Slots & recessed score trays)
  recessedSlot: {
    background: 'linear-gradient(180deg, #ae6f2b 0%, #9e6020 50%, #905316 100%)',
    border: '1px solid #7c4412',
    boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.45), inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 0 rgba(255,230,175,0.3)',
  },

  // Modal Card Panel (Pause & Results Modals)
  modalCard: {
    background: 'linear-gradient(180deg, #f5c47d 0%, #e6a854 50%, #cf8630 100%)',
    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(160,95,25,0.05) 28px, rgba(160,95,25,0.05) 29px), linear-gradient(180deg, #f5c47d 0%, #e6a854 50%, #cf8630 100%)',
    border: '2px solid #b37324',
    boxShadow: '0 20px 40px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,245,210,0.7), inset 0 -4px 6px rgba(138,80,24,0.4)',
  },
};

export const WorldLegendsGame: React.FC<WorldLegendsGameProps> = ({
  game,
  profile,
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  // Audio state
  const [isSoundOn, setIsSoundOn] = useState<boolean>(isAudioEnabled);

  useEffect(() => {
    WorldLegendsAudio.setMuted(!isSoundOn);
  }, [isSoundOn]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSoundOn((prev) => !prev);
  };

  // Game Flow States
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'paused' | 'gameover'>('playing');
  const [showReview, setShowReview] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [bonusPointsNotification, setBonusPointsNotification] = useState<string | null>(null);

  // Session-safe no-repeat words set & recent puzzle history
  const sessionUsedWordsRef = useRef<Set<string>>(new Set<string>());
  const recentSignaturesRef = useRef<string[]>([]);

  // Performance analytics tracking (Internal time, attempts, accuracy)
  const sessionStartTimeRef = useRef<number>(Date.now());
  const levelStartTimeRef = useRef<number>(Date.now());
  const levelAttemptsRef = useRef<number>(0);
  const levelMistakesRef = useRef<number>(0);
  const hintsUsedRef = useRef<number>(0);
  const shufflesUsedRef = useRef<number>(0);
  const totalMistakesRef = useRef<number>(0);
  const totalAttemptsRef = useRef<number>(0);

  // Level & Puzzle States
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<LevelData>(() =>
    getLevelData(0, sessionUsedWordsRef.current, recentSignaturesRef.current)
  );
  const [solvedWordMap, setSolvedWordMap] = useState<Record<string, boolean>>({});
  const [sessionWordRecords, setSessionWordRecords] = useState<WordRecord[]>([]);

  // Letter Wheel State
  const [wheelLetters, setWheelLetters] = useState<string[]>(() => [...currentLevel.letters]);
  const [isWheelShuffling, setIsWheelShuffling] = useState<boolean>(false);

  // Drag / Swipe Word Formation State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);
  const [invalidShake, setInvalidShake] = useState<boolean>(false);
  const [celebrateLevel, setCelebrateLevel] = useState<boolean>(false);
  const [hintLettersMap, setHintLettersMap] = useState<Record<string, number>>({});
  const [celebrationBanner, setCelebrationBanner] = useState<string | null>(null);

  // References
  const wheelContainerRef = useRef<HTMLDivElement | null>(null);
  const letterPositionsRef = useRef<{ x: number; y: number; index: number; letter: string }[]>([]);
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Initialize level data when level index changes (Fresh randomized puzzle generated)
  const loadLevel = useCallback((levelIdx: number) => {
    const level = getLevelData(levelIdx, sessionUsedWordsRef.current, recentSignaturesRef.current);
    setCurrentLevel(level);
    setWheelLetters([...level.letters]);
    setSolvedWordMap({});
    setSelectedIndices([]);
    setIsDragging(false);
    setPointerPos(null);
    setCelebrateLevel(false);
    setHintLettersMap({});
    setCelebrationBanner(null);

    // Reset level performance metrics
    levelStartTimeRef.current = Date.now();
    levelAttemptsRef.current = 0;
    levelMistakesRef.current = 0;
  }, []);

  // Update wheel letters when currentLevel changes
  useEffect(() => {
    setWheelLetters([...currentLevel.letters]);
  }, [currentLevel]);

  // Conclude session (on completion of 40 levels or explicit finish/exit)
  const handleEndGame = useCallback(() => {
    if (gameStateRef.current === 'gameover') return;
    setGameState('gameover');
    gameStateRef.current = 'gameover';

    WorldLegendsAudio.playGameOver();

    const totalElapsedSecs = Math.max(1, Math.round((Date.now() - sessionStartTimeRef.current) / 1000));
    
    // Call onGameOver with score and total elapsed time
    setTimeout(() => {
      onGameOver(scoreRef.current, totalElapsedSecs);
    }, 0);
  }, [onGameOver]);

  // Restart match with fresh randomized puzzles
  const handleRestart = () => {
    sessionUsedWordsRef.current.clear();
    recentSignaturesRef.current = [];
    sessionStartTimeRef.current = Date.now();
    totalMistakesRef.current = 0;
    totalAttemptsRef.current = 0;
    hintsUsedRef.current = 0;
    shufflesUsedRef.current = 0;
    setCurrentLevelIndex(0);
    loadLevel(0);
    setScore(0);
    setCombo(0);
    setSessionWordRecords([]);
    setShowReview(false);
    setGameState('playing');
    WorldLegendsAudio.playButton();
  };

  // Format MM:SS for internal performance analytics display
  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Re-calculate letter node positions in wheel container
  const updateLetterPositions = useCallback(() => {
    if (!wheelContainerRef.current) return;
    const rect = wheelContainerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) * 0.36; // 36% radius from center

    const total = wheelLetters.length;
    const positions: { x: number; y: number; index: number; letter: string }[] = [];

    wheelLetters.forEach((letter, i) => {
      // Start from top (-90 deg) and distribute evenly
      const angle = (i * (2 * Math.PI / total)) - (Math.PI / 2);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      positions.push({ x, y, index: i, letter });
    });

    letterPositionsRef.current = positions;
  }, [wheelLetters]);

  useEffect(() => {
    updateLetterPositions();
    window.addEventListener('resize', updateLetterPositions);
    return () => window.removeEventListener('resize', updateLetterPositions);
  }, [updateLetterPositions]);

  // Shuffle letters on wheel
  const handleShuffleWheel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gameState !== 'playing' || isWheelShuffling) return;

    setIsWheelShuffling(true);
    WorldLegendsAudio.playShuffle();

    setWheelLetters((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });

    setTimeout(() => {
      setIsWheelShuffling(false);
      updateLetterPositions();
    }, 250);
  };

  // Find tile node index from pointer client coordinates
  const findTileIndexAt = (clientX: number, clientY: number): number | null => {
    if (!wheelContainerRef.current) return null;
    const rect = wheelContainerRef.current.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    const threshold = 34; // Touch radius in px
    for (const pos of letterPositionsRef.current) {
      const dist = Math.hypot(pos.x - localX, pos.y - localY);
      if (dist <= threshold) {
        return pos.index;
      }
    }
    return null;
  };

  // TOUCH & DRAG EVENT HANDLERS
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== 'playing') return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    const tileIdx = findTileIndexAt(e.clientX, e.clientY);
    if (tileIdx !== null) {
      setIsDragging(true);
      setSelectedIndices([tileIdx]);
      WorldLegendsAudio.playTileConnect(0);

      if (wheelContainerRef.current) {
        const rect = wheelContainerRef.current.getBoundingClientRect();
        setPointerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || gameState !== 'playing') return;

    if (wheelContainerRef.current) {
      const rect = wheelContainerRef.current.getBoundingClientRect();
      setPointerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    const tileIdx = findTileIndexAt(e.clientX, e.clientY);
    if (tileIdx !== null) {
      // If tile is already selected:
      if (selectedIndices.includes(tileIdx)) {
        // Check if moving backwards to the previous tile in sequence (undo last letter)
        const secondToLast = selectedIndices[selectedIndices.length - 2];
        if (secondToLast === tileIdx) {
          setSelectedIndices((prev) => prev.slice(0, -1));
          WorldLegendsAudio.playTileRemove();
        }
      } else {
        // Add new tile to sequence
        const newIndices = [...selectedIndices, tileIdx];
        setSelectedIndices(newIndices);
        WorldLegendsAudio.playTileConnect(newIndices.length - 1);
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setPointerPos(null);

    // Validate the formed word
    const formedWord = selectedIndices.map((idx) => wheelLetters[idx]).join('');
    validateWordSelection(formedWord);
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setSelectedIndices([]);
    setPointerPos(null);
  };

  // Handle Hint (Reveals first letter of next unsolved word)
  const handleHint = () => {
    if (gameState !== 'playing') return;
    hintsUsedRef.current += 1;

    // Find first unsolved target word
    const unsolved = currentLevel.targetWords.find((w) => !solvedWordMap[w.word]);
    if (!unsolved) return;

    const currentHintCount = hintLettersMap[unsolved.word] || 0;
    if (currentHintCount < unsolved.word.length) {
      setHintLettersMap((prev) => ({
        ...prev,
        [unsolved.word]: currentHintCount + 1,
      }));
      WorldLegendsAudio.playTileConnect(1);
    }
  };

  // Validate swiped word
  const validateWordSelection = (formedWord: string) => {
    if (!formedWord || formedWord.length < 2) {
      setSelectedIndices([]);
      return;
    }

    levelAttemptsRef.current += 1;
    totalAttemptsRef.current += 1;

    // 1. Check if word is one of the target words on the puzzle board
    const matchedTarget = currentLevel.targetWords.find((w) => w.word === formedWord);

    if (matchedTarget) {
      if (solvedWordMap[formedWord]) {
        // Already discovered: subtle visual bounce
        setInvalidShake(true);
        WorldLegendsAudio.playWordInvalid();
        setTimeout(() => {
          setInvalidShake(false);
          setSelectedIndices([]);
        }, 300);
        return;
      }

      // Valid newly discovered target word!
      const newCombo = combo + 1;
      setCombo(newCombo);

      // Base word points + combo multiplier (strictly capped at 400)
      const earnedPts = matchedTarget.points + (newCombo > 1 ? newCombo * 5 : 0);
      const newScore = Math.min(400, score + earnedPts);
      setScore(newScore);

      WorldLegendsAudio.playWordSuccess(newCombo);

      // Mark word as solved
      const updatedSolved = { ...solvedWordMap, [formedWord]: true };
      setSolvedWordMap(updatedSolved);

      // Record for session review
      setSessionWordRecords((prev) => [
        ...prev,
        {
          level: currentLevel.levelNumber,
          word: formedWord,
          isSolved: true,
          points: earnedPts,
        },
      ]);

      setSelectedIndices([]);

      // Check if all target words for current level are solved
      const allSolved = currentLevel.targetWords.every((w) => updatedSolved[w.word]);
      if (allSolved) {
        // Level Completed! Analyze attempt performance
        const levelCompletionTime = Date.now();
        const levelElapsedSecs = Math.max(1, Math.round((levelCompletionTime - levelStartTimeRef.current) / 1000));
        const mistakes = levelMistakesRef.current;
        const hints = hintsUsedRef.current;

        // Performance bonus: speed bonus + flawless accuracy bonus
        const speedBonus = levelElapsedSecs <= 20 ? 15 : levelElapsedSecs <= 40 ? 10 : levelElapsedSecs <= 60 ? 5 : 0;
        const accuracyBonus = mistakes === 0 ? 15 : mistakes === 1 ? 8 : 0;
        const perfBonus = speedBonus + accuracyBonus;

        if (perfBonus > 0) {
          setScore((s) => Math.min(400, s + perfBonus));
        }

        setCelebrationBanner(`LEVEL ${currentLevel.levelNumber} COMPLETE! +${perfBonus} BONUS`);
        setCelebrateLevel(true);
        WorldLegendsAudio.playLevelComplete();

        // Check if all 40 tournament levels completed
        const nextLevelIdx = currentLevelIndex + 1;
        if (nextLevelIdx >= 40) {
          setTimeout(() => {
            handleEndGame();
          }, 1200);
          return;
        }

        // Automatic progression to next level in ~0.85 seconds
        setTimeout(() => {
          setCurrentLevelIndex(nextLevelIdx);
          loadLevel(nextLevelIdx);
        }, 850);
      }
      return;
    }

    // 2. Check if word is a bonus dictionary word
    if (currentLevel.bonusWords && currentLevel.bonusWords.includes(formedWord)) {
      if (!solvedWordMap[formedWord]) {
        const bonusPts = 10;
        const newScore = Math.min(400, score + bonusPts);
        setScore(newScore);
        setSolvedWordMap((prev) => ({ ...prev, [formedWord]: true }));
        setBonusPointsNotification(`+${bonusPts} BONUS!`);
        WorldLegendsAudio.playBonusWord();

        setTimeout(() => {
          setBonusPointsNotification(null);
        }, 1200);

        setSelectedIndices([]);
        return;
      }
    }

    // 3. Invalid word: track mistake, subtle shake, soft error tone, immediate retry
    levelMistakesRef.current += 1;
    totalMistakesRef.current += 1;
    WorldLegendsAudio.playWordInvalid();
    setInvalidShake(true);
    setCombo(0); // Reset combo

    setTimeout(() => {
      setInvalidShake(false);
      setSelectedIndices([]);
    }, 350);
  };

  const currentSwipedText = selectedIndices.map((i) => wheelLetters[i]).join('');
  const categoryInfo = currentLevel.category
    ? CATEGORY_META[currentLevel.category] || { label: currentLevel.category, icon: '⭐' }
    : { label: 'CHALLENGE', icon: '⚽' };

  return (
    <div 
      className="relative w-full max-w-md mx-auto h-[600px] sm:h-[650px] rounded-3xl overflow-hidden flex flex-col select-none touch-none shadow-2xl border-4 border-[#b37324] font-['Plus_Jakarta_Sans',sans-serif]"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), inset 0 0 0 2px #f1bc68, inset 0 0 25px rgba(0,0,0,0.4)',
      }}
    >
      
      {/* ========================================================================= */}
      {/* 1. TOP HUD: LIGHT WARM NATURAL WOOD (WORLD_LEGENDS_WOOD_MATERIAL)          */}
      {/* ========================================================================= */}
      <div 
        className="w-full px-3 py-2 flex items-center justify-between z-20 shrink-0 border-b-2 border-[#b37324]"
        style={WOOD_MATERIAL.hud}
      >
        {/* Left: Exit, Pause & Level Badge */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onExit}
            onPointerDown={(e) => e.stopPropagation()}
            className="px-2.5 py-1 rounded-xl text-[#22140a] flex items-center gap-1 font-bold text-xs border border-[#c98833] active:translate-y-0.5 transition-all cursor-pointer shadow-sm"
            style={WOOD_MATERIAL.tileOrButton}
            title="Exit Game"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>EXIT</span>
          </button>

          <button
            onClick={() => setGameState('paused')}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-full text-[#22140a] flex items-center justify-center font-black border border-[#c98833] active:translate-y-0.5 transition-all cursor-pointer shadow-sm"
            style={WOOD_MATERIAL.tileOrButton}
            title="Pause Game"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
          </button>

          <div 
            className="px-2.5 py-1 rounded-xl flex items-center gap-1 border border-[#c98833]"
            style={{
              ...WOOD_MATERIAL.tileOrButton,
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 1px 0 rgba(169,108,36,0.3)',
            }}
          >
            <Compass className="w-3 h-3 text-[#8a501a]" />
            <span className="text-xs font-black text-[#22140a] font-mono tracking-wide">
              LVL {currentLevel.levelNumber}
            </span>
          </div>
        </div>

        {/* Center: Score Display */}
        <div className="flex flex-col items-center justify-center leading-none">
          <span className="text-[8px] font-black text-[#5c3510] uppercase tracking-widest mb-0.5">
            SCORE
          </span>
          <div className="flex items-baseline gap-1">
            <span 
              className="text-xl sm:text-2xl font-black font-mono tracking-tight tabular-nums text-[#22140a]"
              style={{
                textShadow: '0 1px 0 rgba(255,255,255,0.7)',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
              }}
            >
              {score}
            </span>
            {combo >= 2 && (
              <span className="text-[8px] font-black bg-[#13692e] text-[#bbf7d0] px-1.5 py-0.5 rounded-full animate-pulse flex items-center gap-0.5 ml-0.5 border border-[#4ade80]/40 shadow-sm">
                <Flame className="w-2 h-2 fill-current text-amber-300" />
                {combo}x
              </span>
            )}
          </div>
        </div>

        {/* Right: Coins, Sound */}
        <div className="flex items-center gap-1.5">
          {/* User Coins from Platform */}
          <div 
            className="px-2 py-0.5 rounded-lg border border-[#c98833] text-[#22140a] flex items-center gap-1"
            style={{
              ...WOOD_MATERIAL.tileOrButton,
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 1px 0 rgba(169,108,36,0.3)',
            }}
            title="Coins"
          >
            <Coins className="w-3 h-3 text-[#8a501a] fill-[#8a501a]" />
            <span className="text-xs font-black font-mono">{profile?.coins ?? 0}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-lg text-[#22140a] flex items-center justify-center border border-[#c98833] active:translate-y-0.5 transition-all cursor-pointer shadow-sm"
            style={WOOD_MATERIAL.tileOrButton}
            title={isSoundOn ? 'Mute Sound' : 'Unmute Sound'}
          >
            {isSoundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-40" />}
          </button>
        </div>
      </div>

      {/* Category Banner Strip (Light Warm Wood Strip) */}
      <div 
        className="w-full px-3 py-1 flex items-center justify-between text-[10px] font-bold z-10 border-b border-[#b37324]"
        style={WOOD_MATERIAL.categoryStrip}
      >
        <div className="flex items-center gap-1 text-[#22140a]">
          <span>{categoryInfo.icon}</span>
          <span className="tracking-wider uppercase font-black">{categoryInfo.label}</span>
        </div>
        <span className="text-[#4a2608] text-[9px] font-bold tracking-wide">
          {currentLevel.theme}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 2. 3D FOOTBALL PITCH PLAYING FIELD (Realistic Lawn Striping & Stadium Glow)*/}
      {/* ========================================================================= */}
      <div 
        className="relative flex-1 w-full flex flex-col justify-between p-2 sm:p-3 overflow-hidden"
        style={{
          backgroundColor: '#0e4a21',
          backgroundImage: `
            linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.4) 100%),
            repeating-linear-gradient(0deg, #115827 0px, #115827 24px, #0e4b21 24px, #0e4b21 48px)
          `,
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.85)',
        }}
      >
        {/* Stadium Overhead Floodlight Illumination */}
        <div 
          className="absolute -top-12 -left-12 w-64 h-64 rounded-full pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, rgba(200, 240, 210, 0.15) 40%, transparent 70%)',
          }}
        />
        <div 
          className="absolute -top-12 -right-12 w-64 h-64 rounded-full pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, rgba(200, 240, 210, 0.15) 40%, transparent 70%)',
          }}
        />

        {/* Pitch Chalk Boundary & Center Markings */}
        <div 
          className="absolute inset-x-4 top-2 bottom-2 rounded-2xl pointer-events-none border border-white/15"
          style={{
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          {/* Subtle Penalty Arc / Center Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-white/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/20" />
        </div>

        {/* Level Complete Performance Banner */}
        {celebrationBanner && (
          <div 
            className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full text-[#22140a] font-black text-xs uppercase tracking-wider shadow-2xl animate-bounce border-2 border-[#b8782a] flex items-center gap-1.5"
            style={{
              background: 'linear-gradient(180deg, #ffe0a0 0%, #f4bf6a 50%, #e6a74b 100%)',
            }}
          >
            <Trophy className="w-3.5 h-3.5 text-[#8a501a]" />
            <span>{celebrationBanner}</span>
          </div>
        )}

        {/* Bonus Points Floating Toast */}
        {bonusPointsNotification && (
          <div 
            className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full text-[#140904] font-black text-xs uppercase tracking-wider shadow-xl animate-bounce border-2 border-[#d4af37] flex items-center gap-1"
            style={{
              background: 'linear-gradient(180deg, #f5d77f 0%, #d4af37 100%)',
            }}
          >
            <Sparkles className="w-3 h-3 text-[#140904]" />
            <span>{bonusPointsNotification}</span>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* A. LIGHT WARM NATURAL WOOD PUZZLE BOARD (Reference Match)               */}
        {/* ----------------------------------------------------------------------- */}
        <div 
          className={`relative w-full max-w-sm mx-auto rounded-3xl p-3 border-[3px] border-[#b37324] flex flex-col items-center justify-center transition-all duration-300 z-10 ${
            celebrateLevel ? 'scale-105 ring-4 ring-[#ffe0a0]' : ''
          }`}
          style={{
            background: 'linear-gradient(180deg, #f0ba6c 0%, #e09f48 50%, #cb842e 100%)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.55), inset 0 2px 3px rgba(255,235,185,0.7), inset 0 -3px 4px rgba(138,80,24,0.5)',
          }}
        >
          {/* Brass Corner Screw Rivets with center slot */}
          <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-[#a36826] border border-[#7a4814] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
            <div className="w-1.5 h-[1px] bg-[#4a2608]" />
          </div>
          <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#a36826] border border-[#7a4814] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
            <div className="w-1.5 h-[1px] bg-[#4a2608]" />
          </div>
          <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-[#a36826] border border-[#7a4814] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
            <div className="w-1.5 h-[1px] bg-[#4a2608]" />
          </div>
          <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-[#a36826] border border-[#7a4814] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
            <div className="w-1.5 h-[1px] bg-[#4a2608]" />
          </div>

          {/* Top-Right Wooden Plaque Dictionary Icon (Reference Match) */}
          <div 
            className="absolute -top-2.5 right-5 px-1.5 py-0.5 rounded-md border border-[#9b5f1b] flex items-center justify-center shadow-sm"
            style={{
              background: 'linear-gradient(180deg, #f7cb7f 0%, #e1a049 100%)',
            }}
            title="World Legends Dictionary"
          >
            <BookOpen className="w-3 h-3 text-[#3d200a]" />
          </div>

          {/* Inner Light Warm Wood Surface Basin */}
          <div 
            className="w-full rounded-2xl p-2.5 flex flex-col items-center justify-center gap-2 border-[1.5px] border-[#bd7b2a] min-h-[105px]"
            style={{
              background: 'linear-gradient(180deg, #e4a752 0%, #d89842 50%, #cd8c35 100%)',
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(160,95,25,0.06) 24px, rgba(160,95,25,0.06) 25px), linear-gradient(180deg, #e8ae5a 0%, #dc9d45 50%, #d19139 100%)',
              boxShadow: 'inset 0 3px 6px rgba(100,55,10,0.35), 0 1px 0 rgba(255,255,255,0.3)',
            }}
          >
            {/* Target Words Rows */}
            <div className="flex flex-col items-center justify-center gap-2 w-full">
              {currentLevel.targetWords.map((target, wordIdx) => {
                const isSolved = Boolean(solvedWordMap[target.word]);
                const wordLength = target.word.length;
                const revealedHintCount = hintLettersMap[target.word] || 0;

                return (
                  <div key={wordIdx} className="flex items-center justify-center gap-1.5">
                    {Array.from({ length: wordLength }).map((_, charIdx) => {
                      const letterChar = isSolved ? target.word[charIdx] : (charIdx < revealedHintCount ? target.word[charIdx] : null);
                      const isHinted = !isSolved && charIdx < revealedHintCount;

                      return (
                        <div
                          key={charIdx}
                          className="relative w-8 h-9 sm:w-9 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                        >
                          {/* Empty Recessed Slot: Carved Warm Wood Slot */}
                          <div 
                            className="absolute inset-0 rounded-xl"
                            style={{
                              background: isSolved
                                ? 'transparent'
                                : 'linear-gradient(180deg, #ae6f2b 0%, #9e6020 50%, #905316 100%)',
                              border: isSolved ? 'none' : '1px solid #7c4412',
                              boxShadow: isSolved
                                ? 'none'
                                : 'inset 0 3px 6px rgba(0,0,0,0.45), inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 0 rgba(255,230,175,0.3)',
                            }}
                          />

                          {/* Discovered / Hinted Tactile Letter Tile: Light Warm Natural Wooden Tile */}
                          {(isSolved || isHinted) && letterChar && (
                            <div
                              className={`absolute inset-0 rounded-xl flex flex-col items-center justify-center animate-in zoom-in-75 duration-200 ${
                                isHinted ? 'opacity-90' : ''
                              }`}
                              style={{
                                background: 'linear-gradient(180deg, #fce09d 0%, #f1bc68 50%, #e4a64d 100%)',
                                boxShadow: '0 3px 6px rgba(0,0,0,0.3), inset 0 1.5px 2px rgba(255,255,255,0.7), inset 0 -2.5px 0 #a96c24',
                                border: '1px solid #c98833',
                              }}
                            >
                              <span 
                                className="font-black text-lg sm:text-xl leading-none text-[#22140a] font-serif select-none"
                                style={{ textShadow: '0 1px 0 rgba(255,255,255,0.5)' }}
                              >
                                {letterChar}
                              </span>
                              {/* Letter Value Subscript */}
                              <span className="absolute bottom-0.5 right-1 text-[7px] font-bold text-[#8a501a] font-mono leading-none">
                                {getLetterValue(letterChar)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* B. CURRENT SWIPED WORD FLOATING PREVIEW PLAQUE                           */}
        {/* ----------------------------------------------------------------------- */}
        <div className="relative w-full flex items-center justify-center h-8 z-10">
          {currentSwipedText ? (
            <div 
              className={`px-4 py-1 rounded-full border border-[#b87726] flex items-center gap-1 font-black text-base tracking-widest uppercase shadow-xl transition-transform ${
                invalidShake ? 'animate-bounce bg-rose-950 border-rose-600 text-rose-200' : 'text-[#22140a]'
              }`}
              style={{
                background: invalidShake ? undefined : 'linear-gradient(180deg, #fce09d 0%, #f1bc68 50%, #e4a64d 100%)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.7)',
              }}
            >
              {currentSwipedText.split('').map((char, i) => (
                <span key={i} className="text-[#22140a] drop-shadow-sm font-serif font-black">
                  {char}
                </span>
              ))}
            </div>
          ) : (
            <div className="h-6" />
          )}
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* C. LETTER WHEEL AREA: TACTILE WARM WOOD TILES ON ROTARY DIAL            */}
        {/* ----------------------------------------------------------------------- */}
        <div className="relative w-full flex items-center justify-center my-auto z-10 shrink-0">
          {/* Hint Button on Left of Wheel */}
          <button
            onClick={handleHint}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={gameState !== 'playing'}
            className="absolute left-3 sm:left-6 z-20 w-11 h-11 rounded-full text-[#22140a] flex flex-col items-center justify-center font-bold text-[9px] shadow-lg border border-[#c98833] active:scale-95 transition-transform cursor-pointer"
            style={WOOD_MATERIAL.tileOrButton}
            title="Get a Hint"
          >
            <Lightbulb className="w-4 h-4 text-[#8a501a]" />
            <span className="text-[7.5px] font-black uppercase text-[#22140a] leading-none mt-0.5">HINT</span>
          </button>

          <div 
            ref={wheelContainerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full flex items-center justify-center cursor-pointer select-none"
            style={WOOD_MATERIAL.wheelTurntable}
          >
            {/* Concentric Brass Dial Ring */}
            <div 
              className="absolute inset-4 rounded-full pointer-events-none border border-[#b37324]/35"
              style={{
                boxShadow: 'inset 0 0 10px rgba(138,80,24,0.25)',
              }}
            />

            {/* SVG Connecting Lines between touched tiles */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {selectedIndices.length > 1 && (
                <path
                  d={selectedIndices.reduce((acc, idx, i) => {
                    const pos = letterPositionsRef.current[idx];
                    if (!pos) return acc;
                    return i === 0 ? `M ${pos.x} ${pos.y}` : `${acc} L ${pos.x} ${pos.y}`;
                  }, '')}
                  fill="none"
                  stroke="#854d0e"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(255,245,210,0.9)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                />
              )}

              {/* Line extending to active pointer position */}
              {isDragging && pointerPos && selectedIndices.length > 0 && (
                (() => {
                  const lastIdx = selectedIndices[selectedIndices.length - 1];
                  const lastPos = letterPositionsRef.current[lastIdx];
                  if (!lastPos) return null;
                  return (
                    <line
                      x1={lastPos.x}
                      y1={lastPos.y}
                      x2={pointerPos.x}
                      y2={pointerPos.y}
                      stroke="#854d0e"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="4 4"
                      style={{ filter: 'drop-shadow(0 0 5px rgba(255,245,210,0.9))' }}
                    />
                  );
                })()
              )}
            </svg>

            {/* Center Shuffle Button (Warm Wood & Brass Emblem) */}
            <button
              onClick={handleShuffleWheel}
              onPointerDown={(e) => e.stopPropagation()}
              disabled={isWheelShuffling || gameState !== 'playing'}
              className="absolute z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full text-[#22140a] flex items-center justify-center font-black shadow-lg border border-[#c98833] active:scale-90 transition-transform cursor-pointer"
              style={WOOD_MATERIAL.tileOrButton}
              title="Shuffle Letters"
            >
              <Shuffle className={`w-5 h-5 text-[#22140a] ${isWheelShuffling ? 'animate-spin' : ''}`} />
            </button>

            {/* Tactile Dimensional Letter Tiles on Radial Wheel (Warm Honey Wood) */}
            {letterPositionsRef.current.map((pos) => {
              const isSelected = selectedIndices.includes(pos.index);
              const tilePoints = getLetterValue(pos.letter);

              return (
                <div
                  key={pos.index}
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute z-10 w-12 h-14 sm:w-13 sm:h-15 rounded-2xl flex flex-col items-center justify-center transition-all duration-100 ${
                    isSelected
                      ? 'scale-95 ring-2 ring-[#df9525] shadow-[0_0_15px_rgba(245,190,80,0.6)]'
                      : 'hover:scale-105 active:scale-95'
                  }`}
                >
                  <div
                    className="relative w-full h-full rounded-2xl flex flex-col items-center justify-center"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(180deg, #fff2cc 0%, #f8ce7d 50%, #eca94c 100%)'
                        : 'linear-gradient(180deg, #fce09d 0%, #f1bc68 50%, #e4a64d 100%)',
                      boxShadow: isSelected
                        ? '0 3px 8px rgba(0,0,0,0.45), inset 0 2px 2px #ffffff, inset 0 -2px 0 #9c5c1a, 0 0 12px rgba(245,190,80,0.5)'
                        : '0 6px 12px rgba(0,0,0,0.4), inset 0 1.5px 2px rgba(255,255,255,0.7), inset 0 -3px 0 #a96c24',
                      border: isSelected ? '2px solid #df9525' : '1.5px solid #c98833',
                    }}
                  >
                    {/* Letter Character */}
                    <span 
                      className="font-black text-xl sm:text-2xl leading-none text-[#22140a] font-serif select-none"
                      style={{ textShadow: '0 1px 0 rgba(255,255,255,0.5)' }}
                    >
                      {pos.letter}
                    </span>

                    {/* Scrabble-style Letter Point Subscript */}
                    <span className="absolute bottom-1 right-1.5 text-[8px] font-black text-[#8a501a] font-mono leading-none select-none">
                      {tilePoints}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. PAUSE OVERLAY MODAL (Light Warm Natural Wood Set Styling)              */}
      {/* ========================================================================= */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 z-40 bg-[#0a180f]/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div 
            className="rounded-3xl p-6 w-full max-w-xs shadow-2xl border-2 border-[#b37324] flex flex-col items-center text-[#22140a]"
            style={WOOD_MATERIAL.modalCard}
          >
            <div 
              className="w-14 h-14 rounded-2xl text-[#22140a] flex items-center justify-center mb-3 shadow-lg border border-[#c98833]"
              style={WOOD_MATERIAL.tileOrButton}
            >
              <Pause className="w-7 h-7 fill-current" />
            </div>

            <h3 className="text-xl font-black text-[#22140a] tracking-wide mb-1">GAME PAUSED</h3>
            <p className="text-[11px] text-[#5c3510] font-bold mb-3">Level {currentLevel.levelNumber} - {categoryInfo.label}</p>

            <div 
              className="w-full rounded-2xl p-4 my-3 flex flex-col gap-2 border border-[#b37324]/50"
              style={WOOD_MATERIAL.basin}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5c3510] uppercase">SCORE</span>
                <span className="text-xl font-black text-[#22140a] font-mono">{score} / 400</span>
              </div>
              <div className="h-px bg-[#b37324]/40" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5c3510] uppercase">ELAPSED TIME</span>
                <span className="text-base font-bold text-[#22140a] font-mono">
                  {formatTime(Math.max(0, Math.round((Date.now() - sessionStartTimeRef.current) / 1000)))}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full mt-2">
              <button
                onClick={() => setGameState('playing')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-b from-[#168a3a] to-[#0d5924] hover:brightness-110 active:translate-y-0.5 text-[#ecfdf5] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border border-[#4ade80]/50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>RESUME MATCH</span>
              </button>

              <button
                onClick={handleRestart}
                className="w-full py-2.5 px-4 rounded-xl hover:brightness-105 active:translate-y-0.5 text-[#22140a] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#c98833] shadow-sm"
                style={WOOD_MATERIAL.tileOrButton}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESTART</span>
              </button>

              <button
                onClick={onExit}
                className="w-full py-2 text-xs text-[#5c3510] hover:text-[#22140a] font-semibold transition-colors cursor-pointer"
              >
                EXIT MATCH
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FINAL RESULTS SCREEN (Score, Time, Words + REVIEW Button)               */}
      {/* ========================================================================= */}
      {gameState === 'gameover' && !showReview && (
        <div 
          className="absolute inset-0 z-40 flex flex-col items-center justify-center p-5 text-center animate-in zoom-in-95 overflow-y-auto"
          style={{
            background: 'linear-gradient(180deg, #1e0e06 0%, #0d2913 50%, #09170c 100%)',
          }}
        >
          
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[#22140a] text-xs font-black uppercase tracking-wider mb-2 border border-[#c98833] shadow-md"
            style={WOOD_MATERIAL.tileOrButton}
          >
            <Award className="w-4 h-4 text-[#8a501a]" />
            <span>SESSION COMPLETE</span>
          </div>

          {/* Final Score */}
          <div 
            className="text-5xl font-black font-mono tracking-tight mb-0.5 text-[#22140a]"
            style={{
              textShadow: '0 2px 4px rgba(255,240,200,0.8)',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.8))',
            }}
          >
            {score}
          </div>
          <div className="text-[10px] text-[#e0a050] uppercase tracking-widest font-semibold mb-4">
            FINAL TOURNAMENT SCORE
          </div>

          {/* Performance Matrix */}
          <div className="w-full max-w-xs grid grid-cols-2 gap-2 mb-4 text-left">
            <div 
              className="rounded-xl p-2.5 border border-[#b37324]"
              style={WOOD_MATERIAL.tileOrButton}
            >
              <div className="text-[9px] text-[#5c3510] uppercase font-bold">LEVEL REACHED</div>
              <div className="text-[#22140a] font-black font-mono text-base">
                LEVEL {currentLevel.levelNumber}
              </div>
            </div>

            <div 
              className="rounded-xl p-2.5 border border-[#b37324]"
              style={WOOD_MATERIAL.tileOrButton}
            >
              <div className="text-[9px] text-[#5c3510] uppercase font-bold">WORDS SOLVED</div>
              <div className="text-[#13692e] font-black font-mono text-base">
                {sessionWordRecords.length}
              </div>
            </div>

            <div 
              className="col-span-2 rounded-xl p-2.5 border border-[#b37324]"
              style={WOOD_MATERIAL.tileOrButton}
            >
              <div className="text-[9px] text-[#5c3510] uppercase font-bold">TIME SPENT</div>
              <div className="text-[#22140a] font-black font-mono text-sm">
                {formatTime(Math.max(0, Math.round((Date.now() - sessionStartTimeRef.current) / 1000)))}
              </div>
            </div>
          </div>

          {/* Action Buttons: REVIEW (Mandatory) & PLAY AGAIN & EXIT */}
          <div className="w-full max-w-xs space-y-2">
            <button
              onClick={() => setShowReview(true)}
              className="w-full py-3 rounded-xl hover:brightness-110 active:translate-y-0.5 text-[#22140a] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border border-[#c98833]"
              style={WOOD_MATERIAL.tileOrButton}
            >
              <FileText className="w-4 h-4 text-[#8a501a]" />
              <span>REVIEW DISCOVERED WORDS</span>
            </button>

            <button
              onClick={handleRestart}
              className="w-full py-3 rounded-xl bg-gradient-to-b from-[#168a3a] to-[#0d5924] hover:brightness-110 active:translate-y-0.5 text-[#ecfdf5] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border border-[#4ade80]/50"
            >
              <RotateCcw className="w-4 h-4 stroke-[3]" />
              <span>PLAY AGAIN</span>
            </button>

            <button
              onClick={onExit}
              className="w-full py-2.5 rounded-xl text-[#5c3510] hover:text-[#22140a] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-[#b37324]/40 bg-[#fce09d]/20"
            >
              EXIT
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MANDATORY REVIEW MODAL (Details Solved vs Missed Words)                */}
      {/* ========================================================================= */}
      {showReview && (
        <div 
          className="absolute inset-0 z-50 backdrop-blur-md flex flex-col p-4 text-center animate-in fade-in overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1d0f07 0%, #102113 100%)',
          }}
        >
          
          {/* Top Review Header */}
          <div 
            className="flex items-center justify-between p-2.5 rounded-xl border border-[#b37324] mb-3 shrink-0"
            style={WOOD_MATERIAL.hud}
          >
            <button
              onClick={() => setShowReview(false)}
              className="p-1.5 rounded-lg text-[#22140a] hover:brightness-110 transition-colors cursor-pointer border border-[#c98833]"
              style={WOOD_MATERIAL.tileOrButton}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <span className="text-sm font-black text-[#22140a] tracking-wider uppercase">
              SESSION WORDS REVIEW
            </span>

            <div className="w-7" />
          </div>

          {/* Solved Words List */}
          <div className="flex-1 overflow-y-auto py-1 space-y-2 pr-1">
            {sessionWordRecords.length > 0 ? (
              sessionWordRecords.map((rec, i) => (
                <div
                  key={i}
                  className="w-full rounded-xl p-2.5 border border-[#c98833] flex items-center justify-between text-left"
                  style={WOOD_MATERIAL.tileOrButton}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0" />
                    <div>
                      <span className="text-sm font-black text-[#22140a] font-mono tracking-wider">
                        {rec.word}
                      </span>
                      <span className="text-[9px] text-[#5c3510] block font-semibold">
                        Level {rec.level}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-black text-[#8a501a] font-mono">
                    +{rec.points} PTS
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-[#a89078]">
                No words completed during this session.
              </div>
            )}
          </div>

          {/* Bottom Back Button */}
          <button
            onClick={() => setShowReview(false)}
            className="w-full py-3 rounded-xl text-[#22140a] font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer border border-[#c98833] shrink-0 mt-3"
            style={WOOD_MATERIAL.tileOrButton}
          >
            BACK TO RESULTS
          </button>
        </div>
      )}

    </div>
  );
};
