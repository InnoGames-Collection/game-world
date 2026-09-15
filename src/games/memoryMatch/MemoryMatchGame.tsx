import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GameDefinition } from '../../types';
import { MemoryCard, MemoryGameState, MemoryMenuView, CalculatedScore } from './types';
import { getLevelConfig, generateFreshLevelCards, LEVEL_CONFIGURATIONS } from './stageBank';
import { MemoryCardView } from './MemoryCardView';
import { MemoryAudio } from './memoryAudio';
import { CinematicBackground } from './CinematicBackground';
import { calculateResponsiveLayout } from './layoutEngine';
import { calculateAuthoritativeScore, calculateInGameProgressiveScore } from './scoring';
import { 
  loadMemoryMatchState, 
  saveMemoryMatchState, 
  recordLevelCompletion, 
  resetMemoryMatchState 
} from './storage';

// Pre-game menu components
import { MemoryMainMenu } from './components/MemoryMainMenu';
import { LevelsView } from './components/LevelsView';
import { HowToPlayModal } from './components/HowToPlayModal';
import { StatisticsModal } from './components/StatisticsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { GameLeaderboardModal, GAME_CONFIGS, GameLeaderboardService } from '../../components/gameNavigation';

import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  RotateCcw, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Flame,
  Clock,
  Compass,
  Target,
  AlertTriangle,
  Grid3X3,
  Menu,
  Star
} from 'lucide-react';

interface MemoryMatchGameProps {
  game: GameDefinition;
  onGameOver: (score: number, durationSeconds: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  // Persistent storage state
  const [storage, setStorage] = useState(() => {
    const loaded = loadMemoryMatchState();
    if (!isAudioEnabled) {
      loaded.soundEnabled = false;
    }
    return loaded;
  });

  // Current view: MENU or active PLAY or sub-modals
  const [currentView, setCurrentView] = useState<MemoryMenuView>('MENU');

  // Active level number (1 to 40)
  const [levelNumber, setLevelNumber] = useState(() => storage.currentLevel || 1);
  const [isDaily, setIsDaily] = useState(false);

  const levelConfig = useMemo(() => {
    if (isDaily) {
      // Special Daily Challenge configuration: 12 pairs (24 cards), 55s limit, 1.35x
      return {
        levelNumber: 0,
        pairsCount: 12,
        totalCards: 24,
        cols: 4,
        rows: 6,
        targetMoves: 16,
        timeLimit: 55,
        title: 'Daily Synchronized Trial',
        themeCategory: 'Daily Challenge',
        difficultyTier: 'HARD+' as const,
        difficultyMultiplier: 1.35,
        coinReward: 80,
        visualSimilarityTier: 2 as const,
      };
    }
    return getLevelConfig(levelNumber);
  }, [levelNumber, isDaily]);

  // Cards and Game State
  const [cards, setCards] = useState<MemoryCard[]>(() => generateFreshLevelCards(1));
  const [gameState, setGameState] = useState<MemoryGameState>('PLAYING');
  const [selectedCards, setSelectedCards] = useState<MemoryCard[]>([]);

  // Performance Metrics
  const [moves, setMoves] = useState(0);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [pairsFound, setPairsFound] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [streakBanner, setStreakBanner] = useState<number | null>(null);

  // Time tracking
  const [timeRemaining, setTimeRemaining] = useState(50);
  const [timeUsedSeconds, setTimeUsedSeconds] = useState(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculated score on level win
  const [lastCalculatedScore, setLastCalculatedScore] = useState<CalculatedScore | null>(null);

  // Viewport tracking for zero-scroll layout
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? window.innerHeight : 844,
  }));

  // Track viewport resize
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Responsive Board Layout calculation (strictly prevents any scrolling)
  const layout = useMemo(() => {
    return calculateResponsiveLayout(
      levelNumber,
      cards.length || levelConfig.totalCards,
      viewport.width,
      viewport.height
    );
  }, [levelNumber, cards.length, levelConfig.totalCards, viewport.width, viewport.height]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      MemoryAudio.stopAllAudio();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Update sound settings
  const handleUpdateSettings = (partial: Partial<typeof storage>) => {
    setStorage((prev) => {
      const next = { ...prev, ...partial };
      saveMemoryMatchState(next);
      return next;
    });
  };

  const handleResetProgress = () => {
    const fresh = resetMemoryMatchState();
    setStorage(fresh);
    setLevelNumber(1);
    setCurrentView('MENU');
  };

  // --------------------------------------------------------------------------
  // Level Initialization
  // --------------------------------------------------------------------------
  const startPlayLevel = useCallback((targetLevel: number, daily = false) => {
    setIsDaily(daily);
    setLevelNumber(targetLevel);
    const freshCards = generateFreshLevelCards(daily ? 8 : targetLevel);
    const cfg = daily ? {
      levelNumber: 0,
      pairsCount: 12,
      totalCards: 24,
      cols: 4,
      rows: 6,
      targetMoves: 16,
      timeLimit: 55,
      title: 'Daily Synchronized Trial',
      themeCategory: 'Daily Challenge',
      difficultyTier: 'HARD+' as const,
      difficultyMultiplier: 1.35,
      coinReward: 80,
      visualSimilarityTier: 2 as const,
    } : getLevelConfig(targetLevel);

    setCards(freshCards);
    setSelectedCards([]);
    setPairsFound(0);
    setMoves(0);
    setIncorrectAttempts(0);
    setStreak(0);
    setMaxStreak(0);
    setStreakBanner(null);
    setTimeRemaining(cfg.timeLimit);
    setTimeUsedSeconds(0);
    setLastCalculatedScore(null);
    setGameState('PLAYING');
    setCurrentView('PLAY');
  }, []);

  // --------------------------------------------------------------------------
  // Level Timer Controller
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (currentView !== 'PLAY' || gameState !== 'PLAYING') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          // Time expired! Level Failed
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setGameState('LEVEL_LOST');
          MemoryAudio.playMatchFail(storage.soundEnabled);
          return 0;
        }
        return prevTime - 1;
      });
      setTimeUsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [currentView, gameState, storage.soundEnabled]);

  // --------------------------------------------------------------------------
  // Card Click & Matching Controller
  // --------------------------------------------------------------------------
  const handleCardClick = (card: MemoryCard) => {
    if (gameState !== 'PLAYING' || card.isFlipped || card.isMatched) return;
    if (selectedCards.length >= 2) return;

    // Haptics feedback
    if (storage.hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }

    // Card 1
    if (selectedCards.length === 0) {
      MemoryAudio.playCardTap(storage.soundEnabled);
      MemoryAudio.playCardFlip(storage.soundEnabled);

      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c))
      );
      setSelectedCards([card]);
      return;
    }

    // Card 2
    if (selectedCards.length === 1 && selectedCards[0].id !== card.id) {
      MemoryAudio.playCardTap(storage.soundEnabled);
      MemoryAudio.playCardFlip(storage.soundEnabled);

      const firstCard = selectedCards[0];
      const secondCard = card;

      setCards((prev) =>
        prev.map((c) => (c.id === secondCard.id ? { ...c, isFlipped: true } : c))
      );
      setSelectedCards([firstCard, secondCard]);
      const nextMoves = moves + 1;
      setMoves(nextMoves);
      setGameState('CHECKING');

      const isMatch = firstCard.pairId === secondCard.pairId;

      if (isMatch) {
        // MATCH SUCCESS
        const nextStreak = streak + 1;
        const nextMaxStreak = Math.max(maxStreak, nextStreak);
        setStreak(nextStreak);
        setMaxStreak(nextMaxStreak);
        const updatedPairsCount = pairsFound + 1;
        setPairsFound(updatedPairsCount);

        MemoryAudio.playMatchSuccess(nextStreak, storage.soundEnabled);

        if (storage.hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(25);
        }

        if (nextStreak >= 2) {
          setStreakBanner(nextStreak);
          MemoryAudio.playStreak(nextStreak, storage.soundEnabled);
          setTimeout(() => setStreakBanner(null), 1200);
        }

        // Lock in matched cards
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstCard.id || c.id === secondCard.id
                ? { ...c, isMatched: true, isJustMatched: true }
                : c
            )
          );
          setSelectedCards([]);

          // Check if board is cleared
          if (updatedPairsCount >= levelConfig.pairsCount) {
            handleLevelVictory(nextMoves, incorrectAttempts, nextMaxStreak);
          } else {
            setGameState('PLAYING');
          }
        }, 380);

      } else {
        // MISMATCH FAIL
        setStreak(0);
        const nextMistakes = incorrectAttempts + 1;
        setIncorrectAttempts(nextMistakes);
        MemoryAudio.playMatchFail(storage.soundEnabled);

        // Highlight error
        setCards((prev) =>
          prev.map((c) =>
            c.id === firstCard.id || c.id === secondCard.id
              ? { ...c, isError: true }
              : c
          )
        );

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstCard.id || c.id === secondCard.id
                ? { ...c, isFlipped: false, isError: false }
                : c
            )
          );
          setSelectedCards([]);
          setGameState('PLAYING');
        }, 700);
      }
    }
  };

  // --------------------------------------------------------------------------
  // Level Victory Controller
  // --------------------------------------------------------------------------
  const handleLevelVictory = (finalMoves: number, mistakes: number, peakStreak: number) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const calculated = calculateAuthoritativeScore({
      levelConfig,
      moves: finalMoves,
      timeUsedSeconds: Math.max(1, timeUsedSeconds),
      incorrectAttempts: mistakes,
      maxStreak: peakStreak,
    });

    setLastCalculatedScore(calculated);

    if (isDaily) {
      // Record daily challenge completion
      const todayStr = new Date().toISOString().split('T')[0];
      setStorage((prev) => {
        const next = {
          ...prev,
          dailyLastCompletedDate: todayStr,
          dailyBestScore: Math.max(prev.dailyBestScore || 0, calculated.finalLevelScore),
          totalCumulativeScore: prev.totalCumulativeScore + calculated.finalLevelScore,
        };
        saveMemoryMatchState(next);
        return next;
      });
      setGameState('LEVEL_WON');
      MemoryAudio.playLevelWon(storage.soundEnabled);
      return;
    }

    // Standard 40-Level Progression record
    const updatedStorage = recordLevelCompletion(storage, {
      levelNumber,
      levelScore: calculated.finalLevelScore,
      stars: calculated.stars,
      timeUsedSeconds,
      moves: finalMoves,
      incorrectAttempts: mistakes,
      maxStreak: peakStreak,
      pairsCount: levelConfig.pairsCount,
    });
    setStorage(updatedStorage);

    // Notify parent app container of updated tournament score
    onGameOver(updatedStorage.totalCumulativeScore, timeUsedSeconds);
    GameLeaderboardService.recordScore('memory-match', updatedStorage.totalCumulativeScore);

    if (levelNumber >= 40) {
      // Grand Master Championship Final Cleared!
      setGameState('ALL_LEVELS_WON');
      MemoryAudio.playMasterVictory(storage.soundEnabled);
    } else {
      setGameState('LEVEL_WON');
      MemoryAudio.playLevelWon(storage.soundEnabled);
    }
  };

  // Current in-game progressive score
  const activeInGameScore = useMemo(() => {
    return calculateInGameProgressiveScore(levelConfig, pairsFound, moves, streak);
  }, [levelConfig, pairsFound, moves, streak]);

  // Accuracy calculation percentage
  const accuracyPercent = moves > 0 
    ? Math.min(100, Math.round((pairsFound / moves) * 100)) 
    : 100;

  // Next level navigation
  const handleNextLevel = () => {
    if (levelNumber >= 40) {
      startPlayLevel(1);
    } else {
      startPlayLevel(levelNumber + 1);
    }
  };

  // Replay current level
  const handleReplayCurrent = () => {
    startPlayLevel(levelNumber, isDaily);
  };

  // =========================================================================
  // RENDER PRE-GAME MENUS
  // =========================================================================
  if (currentView === 'MENU') {
    return (
      <CinematicBackground>
        <MemoryMainMenu
          storage={storage}
          onNavigate={(view) => setCurrentView(view)}
          onStartPlay={(lvl) => startPlayLevel(lvl || storage.currentLevel || 1)}
          onExit={onExit}
        />
      </CinematicBackground>
    );
  }

  if (currentView === 'LEVELS') {
    return (
      <CinematicBackground>
        <LevelsView
          storage={storage}
          onSelectLevel={(lvl) => startPlayLevel(lvl)}
          onBack={() => setCurrentView('MENU')}
        />
      </CinematicBackground>
    );
  }

  if (currentView === 'HOW_TO_PLAY') {
    return (
      <CinematicBackground>
        <HowToPlayModal onBack={() => setCurrentView('MENU')} />
      </CinematicBackground>
    );
  }

  if (currentView === 'STATS') {
    return (
      <CinematicBackground>
        <StatisticsModal storage={storage} onBack={() => setCurrentView('MENU')} />
      </CinematicBackground>
    );
  }

  if (currentView === 'ACHIEVEMENTS') {
    return (
      <CinematicBackground>
        <AchievementsModal storage={storage} onBack={() => setCurrentView('MENU')} />
      </CinematicBackground>
    );
  }

  if (currentView === 'DAILY') {
    return (
      <CinematicBackground>
        <DailyChallengeModal
          storage={storage}
          onPlayDaily={() => startPlayLevel(0, true)}
          onBack={() => setCurrentView('MENU')}
        />
      </CinematicBackground>
    );
  }

  if (currentView === 'SETTINGS') {
    return (
      <CinematicBackground>
        <SettingsModal
          storage={storage}
          onUpdateSettings={handleUpdateSettings}
          onResetProgress={handleResetProgress}
          onBack={() => setCurrentView('MENU')}
        />
      </CinematicBackground>
    );
  }

  if (currentView === 'ABOUT') {
    return (
      <CinematicBackground>
        <AboutModal onBack={() => setCurrentView('MENU')} />
      </CinematicBackground>
    );
  }

  if (currentView === 'LEADERBOARD') {
    return (
      <CinematicBackground>
        <GameLeaderboardModal
          gameConfig={GAME_CONFIGS['memory-match']}
          onClose={() => setCurrentView('MENU')}
        />
      </CinematicBackground>
    );
  }

  // =========================================================================
  // RENDER ACTIVE GAMEPLAY (NO VERTICAL SCROLLING!)
  // =========================================================================
  const timeRatio = timeRemaining / Math.max(1, levelConfig.timeLimit);
  const timeBarColor = timeRatio > 0.5 ? 'bg-[#00C853]' : timeRatio > 0.25 ? 'bg-amber-400' : 'bg-rose-500 animate-pulse';

  return (
    <CinematicBackground>
      <div className="w-full h-full max-h-[100dvh] flex flex-col justify-between items-center select-none font-['Plus_Jakarta_Sans',sans-serif] px-2 sm:px-4 py-1.5 overflow-hidden max-w-4xl mx-auto">
        
        {/* =====================================================================
            1. FIXED TOP GAME HUD (INCLUDES TIMER, STATS, TITLE, SOUND & PAUSE)
           ===================================================================== */}
        <header className="w-full shrink-0 bg-[#051424]/95 backdrop-blur-xl border border-[#0A7C45]/60 rounded-2xl p-2 sm:p-2.5 text-white shadow-2xl flex flex-col gap-1.5 relative overflow-hidden">
          {/* Subtle gold hairline accent */}
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#FFD54F]/70 to-transparent" />

          {/* Top Row: Navigation + Stage Title + Controls */}
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            {/* Back to Menu */}
            <button
              onClick={() => {
                setGameState('PAUSED');
                setCurrentView('MENU');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 touch-manipulation"
              title="Return to Menu"
            >
              <Menu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-xs">Menu</span>
            </button>

            {/* Level Info & Difficulty Tier Badge */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00C853] shadow-[0_0_8px_#00C853] animate-pulse" />
                <span className="text-xs sm:text-sm font-black tracking-widest text-white uppercase font-mono">
                  {isDaily ? 'DAILY CHALLENGE' : `LEVEL ${levelNumber}`}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {levelConfig.difficultyTier}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-[#FFD54F] font-bold tracking-tight truncate max-w-[140px] sm:max-w-[240px]">
                {levelConfig.title}
              </span>
            </div>

            {/* Controls: Audio & Pause */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleUpdateSettings({ soundEnabled: !storage.soundEnabled })}
                className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer active:scale-95 touch-manipulation"
                title={storage.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
              >
                {storage.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#00C853]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-rose-300" />
                )}
              </button>
              <button
                onClick={() => setGameState((s) => (s === 'PAUSED' ? 'PLAYING' : 'PAUSED'))}
                className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer active:scale-95 touch-manipulation"
                title={gameState === 'PAUSED' ? 'Resume' : 'Pause'}
              >
                {gameState === 'PAUSED' ? (
                  <Play className="w-4 h-4 text-[#00C853]" />
                ) : (
                  <Pause className="w-4 h-4 text-slate-300" />
                )}
              </button>
            </div>
          </div>

          {/* Second Row: Timer Bar & Performance Metrics */}
          <div className="flex flex-col gap-1">
            {/* Timer Progress Bar */}
            <div className="w-full flex items-center gap-2">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 ${timeBarColor}`}
                  style={{ width: `${Math.max(0, Math.min(100, timeRatio * 100))}%` }}
                />
              </div>
              <span className={`text-[10px] font-mono font-black shrink-0 ${timeRemaining <= 10 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-300'}`}>
                {timeRemaining}s
              </span>
            </div>

            {/* 4 In-Game Stat Cards */}
            <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center pt-0.5">
              {/* Pairs Found */}
              <div className="bg-[#030D18]/90 rounded-xl py-1 px-1 border border-[#0A7C45]/50 shadow-inner">
                <div className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-0.5">
                  <Compass className="w-2.5 h-2.5 text-[#00C853]" />
                  <span>PAIRS</span>
                </div>
                <div className="text-xs sm:text-sm font-black font-mono text-[#00C853]">
                  {pairsFound} / {levelConfig.pairsCount}
                </div>
              </div>

              {/* Moves Count */}
              <div className="bg-[#030D18]/90 rounded-xl py-1 px-1 border border-[#0A7C45]/50 shadow-inner">
                <div className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-0.5">
                  <RotateCcw className="w-2.5 h-2.5 text-[#FFD54F]" />
                  <span>MOVES</span>
                </div>
                <div className="text-xs sm:text-sm font-black font-mono text-[#FFD54F]">
                  {moves}
                </div>
              </div>

              {/* Accuracy */}
              <div className="bg-[#030D18]/90 rounded-xl py-1 px-1 border border-[#0A7C45]/50 shadow-inner">
                <div className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-0.5">
                  <Target className="w-2.5 h-2.5 text-sky-400" />
                  <span>ACCURACY</span>
                </div>
                <div className="text-xs sm:text-sm font-black font-mono text-sky-300">
                  {accuracyPercent}%
                </div>
              </div>

              {/* Score */}
              <div className="bg-[#030D18]/90 rounded-xl py-1 px-1 border border-[#0A7C45]/50 shadow-inner">
                <div className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-0.5">
                  <Trophy className="w-2.5 h-2.5 text-[#FFD54F]" />
                  <span>SCORE</span>
                </div>
                <div className="text-xs sm:text-sm font-black font-mono text-white truncate">
                  {activeInGameScore}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Floating Streak Multiplier Pill */}
        {streakBanner !== null && streakBanner >= 2 && (
          <div className="shrink-0 my-1 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#FFD54F] to-[#F59E0B] text-[#071B2D] text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-amber-500/25 animate-bounce z-20">
            <Flame className="w-3 h-3 fill-current text-[#071B2D]" />
            <span>MATCH STREAK ×{streakBanner}!</span>
          </div>
        )}

        {/* =====================================================================
            2. ZERO-SCROLL CENTERED BOARD SURFACE (NO VERTICAL SCROLLING!)
           ===================================================================== */}
        <main className="flex-1 w-full flex items-center justify-center overflow-hidden my-auto p-0">
          <div 
            className="bg-[#030C16]/90 backdrop-blur-2xl border-2 border-[#0A7C45]/60 rounded-3xl p-1.5 sm:p-3 shadow-[inset_0_0_35px_rgba(10,124,69,0.25),0_15px_40px_rgba(0,0,0,0.85)] relative flex items-center justify-center mx-auto overflow-hidden"
            style={{
              maxWidth: `${layout.maxBoardWidthPx}px`,
            }}
          >
            {/* Precision Golden Corner Accents */}
            <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-[#FFD54F]/70 rounded-tl-xs pointer-events-none" />
            <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-[#FFD54F]/70 rounded-tr-xs pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-[#FFD54F]/70 rounded-bl-xs pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-[#FFD54F]/70 rounded-br-xs pointer-events-none" />

            {/* The Fully Centered, Mathematically Scaled Dynamic Card Grid */}
            <div 
              className="grid justify-center items-center mx-auto"
              style={{
                gridTemplateColumns: `repeat(${layout.cols}, ${layout.cardWidthPx}px)`,
                gap: `${layout.gapPx}px`,
                padding: `${layout.boardPaddingPx}px 0`,
              }}
            >
              {cards.map((card) => (
                <MemoryCardView
                  key={card.id}
                  card={card}
                  isInteractable={gameState === 'PLAYING'}
                  onCardClick={handleCardClick}
                  widthPx={layout.cardWidthPx}
                  heightPx={layout.cardHeightPx}
                  showCategoryTag={layout.showCategoryTag}
                  showCardTitle={layout.showCardTitle}
                />
              ))}
            </div>

            {/* PAUSE OVERLAY */}
            {gameState === 'PAUSED' && (
              <div className="absolute inset-0 bg-[#071B2D]/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-white z-30 animate-in fade-in">
                <h3 className="text-xl font-black mb-2 text-[#00C853] tracking-wider">GAME PAUSED</h3>
                <p className="text-xs text-slate-300 mb-5 text-center max-w-xs leading-relaxed">
                  Take a breath. Review your memory map. Timer is stopped!
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <button
                    onClick={() => setGameState('PLAYING')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0A7C45] to-[#00C853] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>RESUME GAME</span>
                  </button>

                  <button
                    onClick={handleReplayCurrent}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restart Level</span>
                  </button>

                  <button
                    onClick={() => setCurrentView('LEVELS')}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                    <span>Level Select</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* =====================================================================
            3. LEVEL COMPLETE MODAL (AUTHORITATIVE TOURNAMENT SCORING)
           ===================================================================== */}
        {gameState === 'LEVEL_WON' && lastCalculatedScore && (
          <div className="fixed inset-0 z-50 bg-[#030C16]/94 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in zoom-in-95">
            <div className="w-full max-w-sm bg-[#071B2D] border-2 border-[#00C853]/70 rounded-3xl p-5 text-white text-center shadow-2xl space-y-3 relative">
              
              {/* Header Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C853]/20 border border-[#00C853]/60 text-[#00C853] text-xs font-black uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>LEVEL {isDaily ? 'DAILY' : levelNumber} COMPLETE!</span>
              </div>

              {/* Stars Performance Rating */}
              <div className="flex items-center justify-center gap-2 py-0.5">
                {[1, 2, 3].map((starIdx) => (
                  <span
                    key={starIdx}
                    className={`text-2xl sm:text-3xl transition-all ${
                      starIdx <= lastCalculatedScore.stars ? 'text-[#FFD54F] scale-110 drop-shadow-md' : 'text-slate-700'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Level Score Showcase with Difficulty Multiplier */}
              <div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-[#FFD54F] tracking-tight">
                  +{lastCalculatedScore.finalLevelScore}
                </div>
                <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-0.5 flex items-center justify-center gap-1">
                  <span>STAGE POINTS</span>
                  <span className="text-emerald-400 font-mono">({levelConfig.difficultyMultiplier}x Tier)</span>
                </div>
              </div>

              {/* Tournament Total Score Banner */}
              <div className="px-3.5 py-2 rounded-2xl bg-[#051424] border border-[#0A7C45]/60 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">CUMULATIVE SCORE</span>
                <span className="text-sm font-black font-mono text-white">
                  {storage.totalCumulativeScore.toLocaleString()} PTS
                </span>
              </div>

              {/* Performance Details Grid */}
              <div className="grid grid-cols-3 gap-1.5 bg-[#051322] rounded-2xl p-2.5 border border-[#0A7C45]/40 text-center">
                <div>
                  <div className="text-[8.5px] text-slate-400 font-bold uppercase">Time Used</div>
                  <div className="text-xs font-mono font-black text-emerald-400">
                    {timeUsedSeconds}s <span className="text-[8px] text-slate-500">/{levelConfig.timeLimit}s</span>
                  </div>
                </div>
                <div>
                  <div className="text-[8.5px] text-slate-400 font-bold uppercase">Moves</div>
                  <div className="text-xs font-mono font-black text-[#FFD54F]">
                    {moves}
                  </div>
                </div>
                <div>
                  <div className="text-[8.5px] text-slate-400 font-bold uppercase">Accuracy</div>
                  <div className="text-xs font-mono font-black text-sky-400">
                    {accuracyPercent}%
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handleNextLevel}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0A7C45] to-[#00C853] hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#00C853]/25 flex items-center justify-center gap-2 transition-all cursor-pointer touch-manipulation"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>CONTINUE NEXT LEVEL</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleReplayCurrent}
                    className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer touch-manipulation"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay</span>
                  </button>

                  <button
                    onClick={() => setCurrentView('LEVELS')}
                    className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer touch-manipulation"
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                    <span>All Levels</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            4. LEVEL LOST / TIME EXPIRED MODAL
           ===================================================================== */}
        {gameState === 'LEVEL_LOST' && (
          <div className="fixed inset-0 z-50 bg-[#030C16]/95 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in zoom-in-95">
            <div className="w-full max-w-sm bg-[#1A0A10] border-2 border-rose-500/70 rounded-3xl p-5 text-white text-center shadow-2xl space-y-3.5 relative">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-black text-rose-400 uppercase tracking-tight">TIME EXPIRED!</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  The {levelConfig.timeLimit}-second clock ran out before all {levelConfig.pairsCount} pairs were matched.
                </p>
              </div>

              <div className="bg-[#050B14] rounded-2xl p-3 border border-rose-500/30 text-left space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pairs Found:</span>
                  <span className="font-mono text-white font-bold">{pairsFound} of {levelConfig.pairsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Moves Made:</span>
                  <span className="font-mono text-white font-bold">{moves}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mistakes:</span>
                  <span className="font-mono text-rose-400 font-bold">{incorrectAttempts}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handleReplayCurrent}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>TRY AGAIN</span>
                </button>

                <button
                  onClick={() => setCurrentView('LEVELS')}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  <span>Select Another Level</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            5. ALL 40 LEVELS WON GRAND MASTER TRIUMPH
           ===================================================================== */}
        {gameState === 'ALL_LEVELS_WON' && (
          <div className="fixed inset-0 z-50 bg-[#030C16]/96 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in zoom-in-95">
            <div className="w-full max-w-sm bg-gradient-to-b from-[#071F36] via-[#051424] to-[#040E1A] border-2 border-[#FFD54F]/80 rounded-3xl p-5 text-white text-center shadow-[0_0_50px_rgba(255,213,79,0.3)] space-y-3.5 relative overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-600 to-[#FFD54F] p-0.5 mx-auto shadow-2xl flex items-center justify-center">
                <div className="w-full h-full rounded-[22px] bg-[#071B2D] flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-[#FFD54F] animate-bounce" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#FFD54F] uppercase tracking-wide">
                  COGNITIVE TITAN!
                </h3>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  You have conquered all 40 competitive levels of the TelePlus Memory Match Championship!
                </p>
              </div>

              <div className="bg-[#030D18] rounded-2xl p-3 border border-[#FFD54F]/40 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase">FINAL TOURNAMENT SCORE</div>
                <div className="text-3xl font-black font-mono text-[#FFD54F]">
                  {storage.totalCumulativeScore.toLocaleString()} PTS
                </div>
                <div className="text-[11px] text-emerald-400 font-bold">
                  All 40 Stages Cleared • Grand Master Tier
                </div>
              </div>

              <button
                onClick={() => setCurrentView('MENU')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-[#FFD54F] to-amber-500 hover:brightness-110 active:scale-95 text-[#071B2D] font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Trophy className="w-4 h-4 fill-current" />
                <span>RETURN TO MAIN MENU</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </CinematicBackground>
  );
};
