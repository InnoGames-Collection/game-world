/**
 * Color Rush - Complete Competitive Mobile Game
 * 
 * Flow:
 * - Pre-Game Championship Menu First (PLAY, LEVELS, LEADERBOARD, MY STATS, ACHIEVEMENTS, DAILY CHALLENGE, SETTINGS)
 * - 40 Locked Progressive Levels
 * - Competitive Scoring Engine (+1 Base Point, Speed Bonus, Streak Bonus, Difficulty Bonus, Level Bonus, Perfect Bonus)
 * - Anti-Farming Cumulative Model (Only best valid score per level contributes to Career Total)
 * - Real Dynamic Leaderboard with Sticky Player Rank
 * - Responsive Mobile UI with Web Audio Synthesis
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  RotateCcw, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  Sparkles,
  Flame,
  Zap,
  Layers
} from 'lucide-react';
import { GameDefinition, UserProfile } from '../../types';
import { 
  ColorItem, 
  FloatingPoint, 
  ColorRushProgression, 
  ColorRushScreenState,
  LevelScoreBreakdown,
  LevelConfig
} from './types';
import { getLevelConfig, TOTAL_COLOR_RUSH_LEVELS } from './levels';
import { generateLevelChallenge } from './colorGenerator';
import { evaluateRoundScore, calculateLevelScoreBreakdown } from './scoring';
import { loadProgression, saveProgression } from './persistence';
import { evaluateAchievements } from './achievements';
import { getDailyChallengeConfig, getDailyChallengeAsLevelConfig, getTodayDateString } from './dailyChallenge';
import { ColorRushAudio } from './colorRushAudio';

// Sub-components
import { ColorRushMainMenu } from './components/ColorRushMainMenu';
import { ColorRushLeaderboardModal } from './components/ColorRushLeaderboardModal';
import { ColorRushLevelSelectModal } from './components/ColorRushLevelSelectModal';
import { ColorRushStatsModal } from './components/ColorRushStatsModal';
import { ColorRushAchievementsModal } from './components/ColorRushAchievementsModal';
import { ColorRushDailyChallengeModal } from './components/ColorRushDailyChallengeModal';
import { ColorRushSettingsModal } from './components/ColorRushSettingsModal';
import { ColorRushResultModal } from './components/ColorRushResultModal';

export interface ColorRushGameProps {
  game: GameDefinition;
  onGameOver: (score: number, durationSeconds: number) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
  profile?: UserProfile;
}

export const ColorRushGame: React.FC<ColorRushGameProps> = ({
  game,
  onGameOver,
  onExit,
  isAudioEnabled = true,
  profile,
}) => {
  // 1. Persistent Progression & State
  const [progression, setProgression] = useState<ColorRushProgression>(() => loadProgression());
  const [screen, setScreen] = useState<ColorRushScreenState>('MENU');

  // Active Gameplay Session State
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [activeLevelConfig, setActiveLevelConfig] = useState<LevelConfig>(() => getLevelConfig(1));
  const [isDailyChallengeActive, setIsDailyChallengeActive] = useState<boolean>(false);

  // In-game round states
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [targetColor, setTargetColor] = useState<ColorItem | null>(null);
  const [options, setOptions] = useState<ColorItem[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<'correct' | 'wrong' | null>(null);

  // In-game timer states
  const [roundTimeLimit, setRoundTimeLimit] = useState<number>(3000);
  const [timeRemaining, setTimeRemaining] = useState<number>(3000);
  const roundStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);

  // Scoring & Stats for current match
  const [liveLevelScore, setLiveLevelScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [accumulatedSpeedBonus, setAccumulatedSpeedBonus] = useState<number>(0);
  const [accumulatedStreakBonus, setAccumulatedStreakBonus] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);

  // Status for active gameplay
  const [playStatus, setPlayStatus] = useState<'playing' | 'paused'>('playing');
  const [lastResult, setLastResult] = useState<LevelScoreBreakdown | null>(null);

  // Match timing
  const matchStartTimeRef = useRef<number>(Date.now());

  // Audio Sync with props
  useEffect(() => {
    ColorRushAudio.setMuted(!isAudioEnabled || !progression.soundEnabled);
  }, [isAudioEnabled, progression.soundEnabled]);

  // Save progression whenever updated
  const updateProgression = useCallback((newProg: ColorRushProgression) => {
    setProgression(newProg);
    saveProgression(newProg);
  }, []);

  const playerName = profile?.displayName || 'Player';
  const playerAvatar = profile?.avatarId ? '⚡' : '⚡';

  // --- ROUND LIFECYCLE ---

  const clearTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Launch a new round inside current level
  const loadRound = useCallback((roundNum: number, config: LevelConfig) => {
    clearTimer();
    const challenge = generateLevelChallenge(config, roundNum);
    setTargetColor(challenge.target);
    setOptions(challenge.options);
    setRoundTimeLimit(challenge.timeLimitMs);
    setTimeRemaining(challenge.timeLimitMs);
    setSelectedOptionId(null);
    setFeedbackState(null);
    roundStartTimeRef.current = Date.now();

    const TICK_INTERVAL = 40;
    timerIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - roundStartTimeRef.current;
      const remaining = Math.max(0, challenge.timeLimitMs - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearTimer();
        handleTimeout(roundNum, config);
      }
    }, TICK_INTERVAL);
  }, [clearTimer]);

  // Handle Timeout (counts as wrong answer / reset streak)
  const handleTimeout = useCallback((roundNum: number, config: LevelConfig) => {
    ColorRushAudio.playWrong();
    setFeedbackState('wrong');
    setCurrentStreak(0);

    const fp: FloatingPoint = {
      id: `fp_${Date.now()}`,
      points: 0,
      comboText: 'TIMEOUT',
      isBonus: false,
    };
    setFloatingPoints([fp]);

    setTimeout(() => {
      setFloatingPoints([]);
      proceedNextRound(roundNum, config, false);
    }, 650);
  }, []);

  // Start Playing a specific level
  const startLevelSession = useCallback((level: number, isDaily: boolean = false) => {
    clearTimer();
    const config = isDaily 
      ? getDailyChallengeAsLevelConfig(getDailyChallengeConfig())
      : getLevelConfig(level);

    setActiveLevel(level);
    setActiveLevelConfig(config);
    setIsDailyChallengeActive(isDaily);
    setCurrentRound(1);
    setLiveLevelScore(0);
    setCorrectCount(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setAccumulatedSpeedBonus(0);
    setAccumulatedStreakBonus(0);
    setReactionTimes([]);
    setFloatingPoints([]);
    setPlayStatus('playing');
    setLastResult(null);
    matchStartTimeRef.current = Date.now();

    setScreen('PLAYING');
    loadRound(1, config);
  }, [clearTimer, loadRound]);

  // User selects an option
  const handleSelectOption = (option: ColorItem) => {
    if (feedbackState !== null || playStatus !== 'playing') return;

    clearTimer();
    const reactionTimeMs = Math.max(80, Date.now() - roundStartTimeRef.current);
    const isCorrect = option.isCorrect;

    setSelectedOptionId(option.id);
    setFeedbackState(isCorrect ? 'correct' : 'wrong');
    setReactionTimes((prev) => [...prev, reactionTimeMs]);

    // Evaluate points via Scoring Engine
    const evaluation = evaluateRoundScore(
      isCorrect,
      reactionTimeMs,
      roundTimeLimit,
      currentStreak
    );

    if (isCorrect) {
      const nextStreak = currentStreak + 1;
      setCurrentStreak(nextStreak);
      setMaxStreak((prev) => Math.max(prev, nextStreak));
      setCorrectCount((prev) => prev + 1);

      setAccumulatedSpeedBonus((prev) => prev + evaluation.speedBonus);
      setAccumulatedStreakBonus((prev) => prev + evaluation.streakBonus);
      setLiveLevelScore((prev) => prev + evaluation.totalRoundPoints);

      // Play escalating correct audio chime
      ColorRushAudio.playCorrect(nextStreak);
      if (evaluation.speedBonus >= 3) {
        setTimeout(() => ColorRushAudio.playSpeedBonus(), 70);
      }

      // Trigger floating point indicator
      let label = `+${evaluation.basePoints} BASE`;
      if (evaluation.speedBonus > 0) label += ` • +${evaluation.speedBonus} SPD`;
      if (evaluation.streakBonus > 0) label += ` • +${evaluation.streakBonus} STK`;

      const fp: FloatingPoint = {
        id: `fp_${Date.now()}`,
        points: evaluation.totalRoundPoints,
        comboText: evaluation.streakTierText || (evaluation.speedBonus >= 3 ? 'SUPER FAST!' : undefined),
        isBonus: evaluation.speedBonus >= 2 || evaluation.streakBonus >= 2,
        label,
      };
      setFloatingPoints([fp]);
    } else {
      setCurrentStreak(0);
      ColorRushAudio.playWrong();

      const fp: FloatingPoint = {
        id: `fp_${Date.now()}`,
        points: 0,
        comboText: 'MISS',
        isBonus: false,
      };
      setFloatingPoints([fp]);
    }

    // Proceed to next round after short tactile feedback delay
    setTimeout(() => {
      setFloatingPoints([]);
      proceedNextRound(currentRound, activeLevelConfig, isCorrect);
    }, 450);
  };

  // Proceed to next round or conclude level
  const proceedNextRound = (
    finishedRound: number, 
    config: LevelConfig, 
    lastWasCorrect: boolean
  ) => {
    if (finishedRound < config.rounds) {
      const nextR = finishedRound + 1;
      setCurrentRound(nextR);
      loadRound(nextR, config);
    } else {
      // Level Completed! Calculate final score and progression
      concludeLevel(config);
    }
  };

  // Conclude Level Match & Award Anti-Farming Competitive Score
  const concludeLevel = (config: LevelConfig) => {
    clearTimer();
    const durationSeconds = Math.max(1, Math.round((Date.now() - matchStartTimeRef.current) / 1000));
    const previousBest = progression.levelBestScores[config.level] || 0;

    const avgReaction = reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 500;

    // Calculate full breakdown with anti-farming competitive model
    const breakdown = calculateLevelScoreBreakdown({
      levelConfig: config,
      correctCount,
      totalRounds: config.rounds,
      accumulatedSpeedBonus,
      accumulatedStreakBonus,
      maxStreak,
      avgReactionMs: avgReaction,
      previousBest,
      existingLevelBests: progression.levelBestScores,
    });

    setLastResult(breakdown);

    // Update Player Progression
    let nextUnlockedLevel = progression.currentUnlockedLevel;
    if (breakdown.isPassed && config.level === progression.currentUnlockedLevel) {
      nextUnlockedLevel = Math.min(TOTAL_COLOR_RUSH_LEVELS, progression.currentUnlockedLevel + 1);
    }

    const updatedBestScores = {
      ...progression.levelBestScores,
      [config.level]: Math.max(previousBest, breakdown.totalLevelScore),
    };

    const newProgression: ColorRushProgression = {
      ...progression,
      currentUnlockedLevel: nextUnlockedLevel,
      levelBestScores: updatedBestScores,
      totalCumulativeScore: breakdown.newCumulativeScore,
      highestStreak: Math.max(progression.highestStreak, maxStreak),
      totalCorrectColors: progression.totalCorrectColors + correctCount,
      totalGamesPlayed: progression.totalGamesPlayed + 1,
      perfectLevelsCount: progression.perfectLevelsCount + (breakdown.isPerfect ? 1 : 0),
      totalReactionTimeMs: progression.totalReactionTimeMs + reactionTimes.reduce((a, b) => a + b, 0),
      reactionCount: progression.reactionCount + reactionTimes.length,
      dailyChallenge: isDailyChallengeActive
        ? {
            date: getTodayDateString(),
            completed: breakdown.isPassed,
            score: Math.max(progression.dailyChallenge?.score || 0, breakdown.totalLevelScore),
            bestStreak: Math.max(progression.dailyChallenge?.bestStreak || 0, maxStreak),
            rank: 42,
          }
        : progression.dailyChallenge,
    };

    // Check Achievements
    const { newlyUnlocked } = evaluateAchievements(newProgression);
    if (newlyUnlocked.length > 0) {
      newProgression.unlockedAchievements = [
        ...newProgression.unlockedAchievements,
        ...newlyUnlocked.map((a) => a.id),
      ];
    }

    updateProgression(newProgression);

    // Synchronize score to portal engine
    onGameOver(breakdown.newCumulativeScore, durationSeconds);

    // Transition to Result Screen
    setScreen('LEVEL_COMPLETE');
  };

  // Pause / Resume
  const handlePause = () => {
    if (playStatus === 'playing') {
      clearTimer();
      setPlayStatus('paused');
    } else {
      setPlayStatus('playing');
      roundStartTimeRef.current = Date.now() - (roundTimeLimit - timeRemaining);
      timerIntervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - roundStartTimeRef.current;
        const remaining = Math.max(0, roundTimeLimit - elapsed);
        setTimeRemaining(remaining);
        if (remaining <= 0) {
          clearTimer();
          handleTimeout(currentRound, activeLevelConfig);
        }
      }, 40);
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const timerPercent = Math.max(0, Math.min(100, (timeRemaining / roundTimeLimit) * 100));

  // --- SCREEN RENDERING CONTROLLER ---

  if (screen === 'MENU') {
    return (
      <ColorRushMainMenu
        progression={progression}
        playerName={playerName}
        playerAvatar={playerAvatar}
        onNavigate={(targetScreen) => setScreen(targetScreen)}
        onStartLevel={(lvl) => startLevelSession(lvl, false)}
        onExit={onExit}
      />
    );
  }

  if (screen === 'LEADERBOARD') {
    return (
      <ColorRushLeaderboardModal
        progression={progression}
        playerName={playerName}
        playerAvatar={playerAvatar}
        onBack={() => setScreen('MENU')}
      />
    );
  }

  if (screen === 'LEVEL_SELECT') {
    return (
      <ColorRushLevelSelectModal
        progression={progression}
        onSelectLevel={(lvl) => startLevelSession(lvl, false)}
        onBack={() => setScreen('MENU')}
      />
    );
  }

  if (screen === 'STATS') {
    return (
      <ColorRushStatsModal
        progression={progression}
        playerName={playerName}
        onBack={() => setScreen('MENU')}
      />
    );
  }

  if (screen === 'ACHIEVEMENTS') {
    return (
      <ColorRushAchievementsModal
        progression={progression}
        onBack={() => setScreen('MENU')}
      />
    );
  }

  if (screen === 'DAILY_CHALLENGE') {
    return (
      <ColorRushDailyChallengeModal
        progression={progression}
        onStartDaily={() => startLevelSession(999, true)}
        onBack={() => setScreen('MENU')}
      />
    );
  }

  if (screen === 'SETTINGS') {
    return (
      <ColorRushSettingsModal
        progression={progression}
        onUpdateProgression={updateProgression}
        onBack={() => setScreen('MENU')}
      />
    );
  }

  // --- ACTIVE GAMEPLAY STAGE ('PLAYING' OR 'LEVEL_COMPLETE') ---

  return (
    <div 
      className="relative w-full max-w-md mx-auto flex flex-col items-center select-none rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl min-h-[620px] font-['Plus_Jakarta_Sans',sans-serif] text-slate-100"
      style={{
        background: 'radial-gradient(circle at 50% 15%, #0a2752 0%, #041630 50%, #010a17 100%)',
      }}
    >
      {/* Dynamic Cyber Glow Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-44 h-44 rounded-full bg-emerald-500/15 blur-2xl" />
        <div className="absolute top-1/2 right-4 w-40 h-40 rounded-full bg-blue-600/20 blur-3xl" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.2) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* 1. STANDARDIZED TOP HUD: [MENU] [SCORE] [ROUND/TIME] [SOUND] [PAUSE] */}
      <div 
        id="color-rush-hud"
        className="w-full bg-[#051c3d]/95 backdrop-blur-md px-3 sm:px-4 py-2.5 border-b border-[#0e3b75] flex flex-col gap-2 z-20 shadow-md shrink-0"
      >
        <div className="flex items-center justify-between gap-2">
          {/* MENU BUTTON */}
          <button
            id="color-rush-exit-btn"
            onClick={() => {
              clearTimer();
              setScreen('MENU');
            }}
            className="h-11 px-3 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 active:scale-95 border border-slate-700 flex items-center gap-1 text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
            title="Return to Menu"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">MENU</span>
          </button>

          {/* LIVE MATCH SCORE (Neon Electric Blue) */}
          <div 
            id="color-rush-score-card"
            className="flex-1 min-w-0 h-11 px-2.5 sm:px-3 rounded-2xl bg-gradient-to-b from-[#0a3161]/80 to-[#031c3b]/90 border border-cyan-500/40 text-white flex items-center gap-2 shadow-xs"
          >
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 shadow-xs">
              <Target className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex flex-col min-w-0 leading-none">
              <span className="text-[8px] sm:text-[9px] font-black text-cyan-400 uppercase tracking-wider">
                LEVEL PTS
              </span>
              <div className="flex items-center gap-1">
                <span className="text-base sm:text-lg font-black text-white font-mono tracking-tight tabular-nums truncate">
                  {liveLevelScore}
                </span>
                {currentStreak > 1 && (
                  <span className="text-[8px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-1 py-0.2 rounded-full animate-bounce shrink-0">
                    {currentStreak}x
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* TIMER CARD */}
          <div 
            id="color-rush-time-card"
            className={`flex-1 min-w-0 h-11 px-2.5 sm:px-3 rounded-2xl border flex items-center gap-2 shadow-xs transition-colors ${
              timerPercent <= 25
                ? 'bg-rose-500/25 border-rose-500 text-rose-300 animate-pulse'
                : timerPercent <= 50
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-gradient-to-b from-[#0e3b75]/80 to-[#052147] border-emerald-500/40 text-white'
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              timerPercent <= 25
                ? 'bg-rose-500 text-white'
                : timerPercent <= 50
                ? 'bg-amber-500 text-slate-950'
                : 'bg-gradient-to-tr from-emerald-500 to-cyan-400 text-slate-950 font-bold'
            }`}>
              <Clock className="w-3.5 h-3.5 text-slate-950" />
            </div>
            <div className="flex flex-col min-w-0 leading-none">
              <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider ${
                timerPercent <= 25 ? 'text-rose-400' : timerPercent <= 50 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                TIMER
              </span>
              <span className="text-sm sm:text-base font-black font-mono tracking-tight tabular-nums">
                {(Math.max(0, timeRemaining) / 1000).toFixed(1)}s
              </span>
            </div>
          </div>

          {/* SOUND TOGGLE */}
          <button
            id="color-rush-sound-toggle"
            onClick={() => {
              const next = !progression.soundEnabled;
              updateProgression({ ...progression, soundEnabled: next });
            }}
            className="w-11 h-11 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 active:scale-95 border border-slate-700 flex items-center justify-center text-slate-200 transition-all cursor-pointer shadow-xs shrink-0"
            title={progression.soundEnabled ? 'Mute' : 'Unmute'}
          >
            {progression.soundEnabled ? <Volume2 className="w-4.5 h-4.5 text-emerald-400" /> : <VolumeX className="w-4.5 h-4.5 text-slate-500" />}
          </button>

          {/* PAUSE BUTTON */}
          <button
            id="color-rush-pause-toggle"
            onClick={handlePause}
            className="w-11 h-11 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 active:scale-95 border border-slate-700 flex items-center justify-center text-slate-200 transition-all cursor-pointer shadow-xs shrink-0"
            title="Pause Game"
          >
            <Pause className="w-4.5 h-4.5 fill-current text-white/80" />
          </button>
        </div>

        {/* Round Progression Badge & Precision Timer Bar */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="text-[10px] text-cyan-400 font-bold tracking-wider uppercase shrink-0">
            {isDailyChallengeActive ? 'Daily Challenge' : `Level ${activeLevel}`} • Round {currentRound}/{activeLevelConfig.rounds}
          </div>
          <div className="flex-1 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-75 rounded-full ${
                timerPercent > 50
                  ? 'bg-emerald-400'
                  : timerPercent > 25
                  ? 'bg-amber-400'
                  : 'bg-rose-500 animate-pulse'
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 font-mono font-bold shrink-0">
            {Math.max(0, (timeRemaining / 1000)).toFixed(1)}s
          </div>
        </div>
      </div>

      {/* 2. HIGH-PRECISION COUNTDOWN TIMER BAR */}
      <div className="w-full h-1.5 bg-slate-900 overflow-hidden relative border-b border-[#0e3b75]">
        <div
          className={`h-full transition-all duration-75 ${
            timerPercent > 50
              ? 'bg-emerald-400'
              : timerPercent > 25
              ? 'bg-amber-400'
              : 'bg-rose-500 animate-pulse'
          }`}
          style={{ width: `${timerPercent}%` }}
        />
      </div>

      {/* 3. MAIN REACTION STAGE */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-start pt-2 pb-5 px-4 sm:px-5 overflow-hidden">
        
        {/* Floating Point Indicators */}
        {floatingPoints.map((fp) => (
          <div
            key={fp.id}
            className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none font-mono font-black animate-bounce text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${
              fp.isBonus ? 'text-amber-300 text-2xl sm:text-3xl' : 'text-emerald-400 text-xl sm:text-2xl'
            }`}
          >
            {fp.points > 0 ? `+${fp.points}` : ''}
            {fp.comboText && (
              <div className="text-[10px] font-sans text-white font-black uppercase tracking-wider">
                {fp.comboText}
              </div>
            )}
            {fp.label && (
              <div className="text-[8px] font-sans text-cyan-300 font-bold uppercase tracking-wide">
                {fp.label}
              </div>
            )}
          </div>
        ))}

        {/* TARGET COLOR CARD */}
        <div className="w-full flex flex-col items-center mt-1 mb-4">
          <div className="text-[10px] text-slate-300 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Target className="w-3 h-3 text-emerald-400" />
            <span>Target Color</span>
          </div>

          <div
            className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 shadow-2xl transition-transform duration-150 flex items-center justify-center ${
              feedbackState === 'correct'
                ? 'scale-105 ring-4 ring-emerald-400'
                : feedbackState === 'wrong'
                ? 'scale-95 ring-4 ring-rose-500 animate-shake'
                : ''
            }`}
            style={{
              boxShadow: targetColor ? `0 0 35px ${targetColor.hex}80` : undefined,
            }}
          >
            {/* Glossy Target Sphere Card */}
            <div
              className="w-full h-full rounded-2xl border-2 border-white/90 shadow-inner flex items-center justify-center overflow-hidden relative"
              style={{ backgroundColor: targetColor?.hex || '#ffffff' }}
            >
              {/* Glossy Curved Highlight Overlay */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent pointer-events-none rounded-t-xl" />
              <div className="absolute top-2 left-2.5 w-4 h-2 rounded-full bg-white/80 rotate-[-30deg] pointer-events-none" />

              <div className="w-7 h-7 rounded-full bg-black/20 backdrop-blur-xs border border-white/40 flex items-center justify-center text-white">
                <Target className="w-3.5 h-3.5 drop-shadow-md" />
              </div>
            </div>
          </div>

          {targetColor?.name && (
            <div className="mt-2 px-3 py-0.5 rounded-full bg-[#051c3d]/90 border border-[#0e3b75] text-slate-200 font-bold text-[11px] shadow-sm">
              {targetColor.name}
            </div>
          )}
        </div>

        {/* LARGE TOUCH TARGETS GRID (2x2, 3x2, 4x2, or 3x3) */}
        <div className={`w-full grid gap-2.5 max-w-sm sm:max-w-md my-auto ${
          options.length === 9 
            ? 'grid-cols-3' 
            : options.length === 8 
            ? 'grid-cols-4 sm:grid-cols-4' 
            : options.length === 6 
            ? 'grid-cols-3' 
            : 'grid-cols-2'
        }`}>
          {options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrect = option.isCorrect;

            let cardRing = 'border-t-white/40 border-b-black/40 border-x-white/20 hover:brightness-110';
            if (feedbackState && isSelected) {
              cardRing = isCorrect ? 'ring-4 ring-emerald-400 brightness-125' : 'ring-4 ring-rose-500 brightness-75';
            }

            const buttonHeight = options.length >= 8 ? 'h-16 sm:h-18' : 'h-20 sm:h-22';

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option)}
                disabled={feedbackState !== null}
                className={`relative ${buttonHeight} rounded-2xl border-2 transition-all duration-75 flex items-center justify-center overflow-hidden cursor-pointer touch-none select-none active:translate-y-1 ${cardRing}`}
                style={{
                  backgroundColor: option.hex,
                  boxShadow: isSelected && feedbackState
                    ? '0 2px 0 rgba(0,0,0,0.6)'
                    : '0 4px 0 rgba(0,0,0,0.45), 0 6px 14px rgba(0,0,0,0.3)',
                }}
              >
                {/* 3D Convex bevel overlay */}
                <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none rounded-t-xl" />
                <div className="absolute top-1.5 left-2 w-4 h-2 rounded-full bg-white/60 rotate-[-25deg] pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-2 bg-black/25 pointer-events-none rounded-b-xl" />

                {/* Instant Feedback Overlay */}
                {feedbackState && isSelected && (
                  <div className={`absolute inset-0 flex items-center justify-center ${
                    isCorrect ? 'bg-emerald-500/40 backdrop-blur-xs' : 'bg-rose-500/40 backdrop-blur-xs'
                  }`}>
                    {isCorrect ? (
                      <CheckCircle2 className="w-8 h-8 text-white drop-shadow-lg animate-in zoom-in-75" />
                    ) : (
                      <XCircle className="w-8 h-8 text-white drop-shadow-lg animate-in zoom-in-75" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. PAUSE MODAL OVERLAY */}
      {playStatus === 'paused' && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-cyan-600 text-white flex items-center justify-center mb-3 shadow-xl">
            <Pause className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-white mb-1">Game Paused</h3>
          <p className="text-xs text-slate-300 mb-5">
            Level {activeLevel} • Round {currentRound}/{activeLevelConfig.rounds}
          </p>

          <div className="w-full max-w-xs space-y-2.5">
            <button
              onClick={handlePause}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Game</span>
            </button>

            <button
              onClick={() => startLevelSession(activeLevel, isDailyChallengeActive)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Level</span>
            </button>

            <button
              onClick={() => {
                clearTimer();
                setScreen('MENU');
              }}
              className="w-full py-2 text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              Exit to Color Rush Menu
            </button>
          </div>
        </div>
      )}

      {/* 5. LEVEL RESULTS SCREEN OVERLAY */}
      {screen === 'LEVEL_COMPLETE' && lastResult && (
        <ColorRushResultModal
          result={lastResult}
          progression={progression}
          onNextLevel={() => startLevelSession(Math.min(TOTAL_COLOR_RUSH_LEVELS, activeLevel + 1), false)}
          onReplay={() => startLevelSession(activeLevel, isDailyChallengeActive)}
          onMenu={() => setScreen('MENU')}
          onLeaderboard={() => setScreen('LEADERBOARD')}
        />
      )}
    </div>
  );
};
