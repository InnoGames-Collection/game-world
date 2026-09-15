/**
 * SOCCER PING PONG - Main Game Hub Orchestrator
 * Comprehensive Overhaul:
 * - Removed dedicated Left/Right movement buttons in favor of full-width swipe-to-defend
 * - Clear, responsive [ ⚽ KICK ] button with immediate visual and auditory feedback
 * - Locked Level Modal explaining unlock requirements (Level completion + Cumulative score)
 * - Carried-forward progression score persisted across completed levels
 * - Deterministic, non-random skill-based scoring with anti-camping penalties
 * - Country & Club Customization interface with Ethiopian, Brazilian, European, and African teams
 * - Dynamic lives allocation based on level tier (3 -> 2 -> 1)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Star,
  ChevronRight,
  Lock,
  BarChart2,
  Settings,
  Award,
  Zap,
  CheckCircle2,
  XCircle,
  Sparkles,
  Globe,
  Shield,
} from 'lucide-react';
import { SOCCER_LEVELS } from './soccerLevels';
import {
  SOCCER_TEAMS,
  FICTIONAL_CLUBS,
  COUNTRY_TEAMS,
  SoccerTeam,
  DEFAULT_PLAYER_TEAM,
  DEFAULT_OPPONENT_TEAM,
} from './soccerTeams';
import { SoccerPitchCanvas } from './SoccerPitchCanvas';
import { soccerAudio } from './soccerAudio';
import { getChampionshipStandings } from './leagueStandings';
import { INITIAL_TROPHIES, evaluateTrophies } from './soccerTrophies';
import {
  GameState,
  PlayerProgress,
  HitQuality,
  GameSettings,
  SoccerLevelConfig,
} from './types';
import { UserProfile, GameDefinition } from '../../types';
import { GameLeaderboardModal, GAME_CONFIGS } from '../../components/gameNavigation';

interface SoccerPingPongGameProps {
  game?: GameDefinition;
  profile: UserProfile | null;
  onExit: () => void;
  onGameOver: (finalScore: number, matchDurationSeconds: number) => void;
  isAudioEnabled?: boolean;
}

const STORAGE_KEY = 'teleplus_soccer_ping_pong_v4_hub';

const INITIAL_PROGRESS: PlayerProgress = {
  unlockedLevel: 1,
  completedLevels: [],
  currentTotalScore: 0,
  bestTotalScore: 0,
  bestScores: {},
  stars: {},
  bestCombos: {},
  highestRallyOverall: 0,
  winStreak: 0,
  totalMatchesPlayed: 0,
  totalWins: 0,
  totalLosses: 0,
  totalReturnsCompleted: 0,
  selectedTeamId: 'country-ethiopia', // Default country representation
  tutorialSeen: false,
  unlockedTrophies: [],
};

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  controlsMode: 'DRAG',
  sensitivity: 1.0,
};

export const SoccerPingPongGame: React.FC<SoccerPingPongGameProps> = ({
  profile,
  onExit,
  onGameOver,
  isAudioEnabled = true,
}) => {
  // Persistent Player Progression
  const [progress, setProgress] = useState<PlayerProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_PROGRESS,
          ...parsed,
          bestScores: parsed.bestScores || {},
          stars: parsed.stars || {},
          bestCombos: parsed.bestCombos || {},
          completedLevels: parsed.completedLevels || [],
          unlockedTrophies: parsed.unlockedTrophies || [],
        };
      }
    } catch {
      // Fallback
    }
    return INITIAL_PROGRESS;
  });

  const saveProgress = (newProg: PlayerProgress) => {
    setProgress(newProg);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProg));
    } catch {
      // Storage safety
    }
  };

  // Settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // Fallback
    }
    return { ...DEFAULT_SETTINGS, soundEnabled: isAudioEnabled };
  });

  const updateSettings = (partial: Partial<GameSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    try {
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(updated));
    } catch {}
    soccerAudio.soundEnabled = updated.soundEnabled;
  };

  // Primary Navigation State
  const [gameState, setGameState] = useState<GameState>('HUB');
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);

  // Locked Level Modal Dialog state
  const [lockedModalLevel, setLockedModalLevel] = useState<SoccerLevelConfig | null>(null);

  // Customization selection tab: 'CLUBS' | 'COUNTRIES'
  const [customizationTab, setCustomizationTab] = useState<'CLUBS' | 'COUNTRIES'>('COUNTRIES');

  // Championship screen tab: 'STANDINGS' | 'LEVELS'
  const [champTab, setChampTab] = useState<'STANDINGS' | 'LEVELS'>('STANDINGS');

  const currentLevelConfig: SoccerLevelConfig =
    SOCCER_LEVELS[currentLevelIndex] || SOCCER_LEVELS[0];

  // Helper: check if a level is unlocked
  const isLevelUnlocked = (levelNumber: number) => {
    if (levelNumber === 1) return true;
    const prevLevelCompleted = progress.completedLevels.includes(levelNumber - 1);
    const cfg = SOCCER_LEVELS[levelNumber - 1];
    const scoreRequirementMet =
      progress.currentTotalScore >= (cfg?.requiredCumulativeScore || 0);
    return prevLevelCompleted && scoreRequirementMet;
  };

  // Selected Player Team & Opponent Team
  const playerTeam: SoccerTeam = useMemo(() => {
    return SOCCER_TEAMS.find((t) => t.id === progress.selectedTeamId) || DEFAULT_PLAYER_TEAM;
  }, [progress.selectedTeamId]);

  const opponentTeam: SoccerTeam = useMemo(() => {
    const oppTeams = SOCCER_TEAMS.filter((t) => t.id !== playerTeam.id);
    return oppTeams[currentLevelIndex % oppTeams.length] || DEFAULT_OPPONENT_TEAM;
  }, [playerTeam, currentLevelIndex]);

  // Active Match State
  const [playerGoals, setPlayerGoals] = useState<number>(0);
  const [computerGoals, setComputerGoals] = useState<number>(0);
  const [levelScore, setLevelScore] = useState<number>(0);
  const [matchRally, setMatchRally] = useState<number>(0);
  const [highestMatchRally, setHighestMatchRally] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [countdownNum, setCountdownNum] = useState<number | string>(3);
  const [kickTrigger, setKickTrigger] = useState<number>(0);
  const [starsEarned, setStarsEarned] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);

  // Keyboard navigation
  const [isMovingLeft, setIsMovingLeft] = useState<boolean>(false);
  const [isMovingRight, setIsMovingRight] = useState<boolean>(false);

  const matchStartTime = useRef<number>(Date.now());
  const statsCounters = useRef({ perfectHits: 0, goodHits: 0, powerKicks: 0 });
  const matchEndedRef = useRef<boolean>(false);

  // Sync sound settings
  useEffect(() => {
    soccerAudio.soundEnabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Keyboard controls for desktop testers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'PLAYING') {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          setIsMovingLeft(true);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          setIsMovingRight(true);
        } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K') {
          setKickTrigger((prev) => prev + 1);
        } else if (e.key === 'Escape') {
          setGameState('PAUSED');
        }
      } else if (gameState === 'PAUSED' && e.key === 'Escape') {
        setGameState('PLAYING');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setIsMovingLeft(false);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setIsMovingRight(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Carried Forward Career Score
  const displayedTotalScore = progress.currentTotalScore + levelScore;

  // =========================================================================
  // MATCH SETUP & TRANSITIONS
  // =========================================================================

  const openMatchSetup = (levelIdx: number) => {
    const targetLvl = SOCCER_LEVELS[levelIdx];
    if (!targetLvl) return;

    if (!isLevelUnlocked(targetLvl.level)) {
      setLockedModalLevel(targetLvl);
      return;
    }

    setCurrentLevelIndex(levelIdx);
    setGameState('MATCH_SETUP');
  };

  const startMatchCountdown = () => {
    matchEndedRef.current = false;
    setPlayerGoals(0);
    setComputerGoals(0);
    setLevelScore(0);
    setMatchRally(0);
    setHighestMatchRally(0);
    setLives(currentLevelConfig.livesAllowed);
    setStarsEarned(0);
    setFeedbackText(null);
    statsCounters.current = { perfectHits: 0, goodHits: 0, powerKicks: 0 };
    matchStartTime.current = Date.now();

    setGameState('COUNTDOWN');
    setCountdownNum('READY');
    soccerAudio.playBounce(0.5);

    let step = 3;
    const interval = setInterval(() => {
      if (step === 3) {
        setCountdownNum(3);
        soccerAudio.playBounce(0.6);
      } else if (step === 2) {
        setCountdownNum(2);
        soccerAudio.playBounce(0.7);
      } else if (step === 1) {
        setCountdownNum(1);
        soccerAudio.playBounce(0.8);
      } else if (step === 0) {
        setCountdownNum('KICK OFF!');
        soccerAudio.playWhistle();
      } else {
        clearInterval(interval);
        setGameState('PLAYING');
      }
      step--;
    }, 600);
  };

  const handlePlayerHit = (
    quality: HitQuality,
    points: number,
    curRally: number,
    isPower: boolean
  ) => {
    if (matchEndedRef.current) return;

    // Award progression skill points for successful human kick & rally
    setLevelScore((prev) => prev + points);

    if (quality === 'PERFECT') statsCounters.current.perfectHits++;
    else if (quality === 'GOOD') statsCounters.current.goodHits++;
  };

  const handleComputerHit = () => {
    // Computer returned cleanly
  };

  // If player fails to defend -> COMPUTER SCORES A GOAL!
  const handlePlayerMiss = () => {
    if (matchEndedRef.current) return;

    setComputerGoals((prevComp) => {
      const nextCompGoals = prevComp + 1;
      setLives((prevLives) => {
        const nextLives = prevLives - 1;
        if (
          !matchEndedRef.current &&
          (nextLives <= 0 || nextCompGoals >= currentLevelConfig.targetGoals)
        ) {
          matchEndedRef.current = true;
          setTimeout(() => handleLevelLoss(), 400);
          return 0;
        }
        return nextLives;
      });
      return nextCompGoals;
    });
  };

  // If computer fails to defend -> PLAYER SCORES A GOAL!
  const handleComputerMiss = (goalPoints: number) => {
    if (matchEndedRef.current) return;

    // Add goal bonus to progression score
    setLevelScore((prev) => prev + goalPoints);

    setPlayerGoals((prevPlayer) => {
      const nextPlayerGoals = prevPlayer + 1;
      // Match Win Condition: Player reaches target goals!
      if (!matchEndedRef.current && nextPlayerGoals >= currentLevelConfig.targetGoals) {
        matchEndedRef.current = true;
        setTimeout(() => handleLevelWin(levelScore + goalPoints), 400);
      }
      return nextPlayerGoals;
    });
  };

  const handleRallyIncrement = (rally: number) => {
    setMatchRally(rally);
    setHighestMatchRally((prev) => Math.max(prev, rally));
  };

  // Level Won (Guaranteed to execute exactly once per match completion)
  const handleLevelWin = (finalScore: number) => {
    setGameState((current) => {
      if (current === 'RESULT_WIN' || current === 'RESULT_LOSS') return current;

      let stars = 1;
      if (lives === currentLevelConfig.livesAllowed || highestMatchRally >= currentLevelConfig.targetRally + 3) {
        stars = 3;
      } else if (lives >= Math.max(1, currentLevelConfig.livesAllowed - 1)) {
        stars = 2;
      }
      setStarsEarned(stars);

      // Carried-forward score persists across all completed levels!
      const newTotalScore = progress.currentTotalScore + finalScore;
      const newBestTotal = Math.max(progress.bestTotalScore, newTotalScore);
      const nextUnlocked = Math.max(progress.unlockedLevel, Math.min(20, currentLevelConfig.level + 1));
      const completedSet = new Set(progress.completedLevels);
      completedSet.add(currentLevelConfig.level);

      const updatedTrophies = evaluateTrophies(progress, highestMatchRally, lives);

      const updatedProg: PlayerProgress = {
        ...progress,
        unlockedLevel: nextUnlocked,
        completedLevels: Array.from(completedSet),
        currentTotalScore: newTotalScore, // Carried forward!
        bestTotalScore: newBestTotal,
        bestScores: {
          ...progress.bestScores,
          [currentLevelConfig.level]: Math.max(
            progress.bestScores[currentLevelConfig.level] || 0,
            finalScore
          ),
        },
        stars: {
          ...progress.stars,
          [currentLevelConfig.level]: Math.max(progress.stars[currentLevelConfig.level] || 0, stars),
        },
        highestRallyOverall: Math.max(progress.highestRallyOverall, highestMatchRally),
        winStreak: progress.winStreak + 1,
        totalMatchesPlayed: progress.totalMatchesPlayed + 1,
        totalWins: progress.totalWins + 1,
        totalReturnsCompleted: progress.totalReturnsCompleted + matchRally,
        unlockedTrophies: updatedTrophies,
      };

      saveProgress(updatedProg);

      const matchDuration = Math.max(1, Math.floor((Date.now() - matchStartTime.current) / 1000));
      onGameOver(newTotalScore, matchDuration);
      soccerAudio.playVictoryFanfare();

      return 'RESULT_WIN';
    });
  };

  // Level Lost (Guaranteed to execute exactly once)
  const handleLevelLoss = () => {
    setGameState((current) => {
      if (current === 'RESULT_WIN' || current === 'RESULT_LOSS') return current;

      saveProgress({
        ...progress,
        winStreak: 0,
        totalMatchesPlayed: progress.totalMatchesPlayed + 1,
        totalLosses: progress.totalLosses + 1,
      });
      soccerAudio.playDefeatSound();
      return 'RESULT_LOSS';
    });
  };

  // Advance to Next Level
  const advanceToNextLevel = () => {
    if (currentLevelIndex + 1 < SOCCER_LEVELS.length) {
      openMatchSetup(currentLevelIndex + 1);
    } else {
      setGameState('CHAMPIONSHIP');
    }
  };

  // =========================================================================
  // VIEW 1: PRE-MATCH SETUP (PLAYER VS COMPUTER)
  // =========================================================================
  if (gameState === 'MATCH_SETUP') {
    return (
      <div className="relative w-full h-full min-h-screen bg-gradient-to-b from-[#051322] via-[#09223a] to-[#030a13] text-white flex flex-col justify-between p-4 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="max-w-md mx-auto w-full space-y-4 py-2">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setGameState('HUB')}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer border border-white/15 shadow-sm"
              aria-label="Back to Hub"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">
                MATCH SETUP
              </span>
              <h2 className="text-base font-black uppercase text-white tracking-tight">
                LEVEL {currentLevelConfig.level < 10 ? `0${currentLevelConfig.level}` : currentLevelConfig.level} • {currentLevelConfig.difficultyTier}
              </h2>
            </div>

            <div className="w-10" />
          </div>

          {/* 1V1 MATCHUP PRESENTATION (Player VS Computer) */}
          <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl space-y-3">
            {/* Top Team: Computer Opponent */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shadow-md border border-white/20"
                  style={{ backgroundColor: opponentTeam.primaryColor, color: opponentTeam.textColor }}
                >
                  {opponentTeam.flagEmoji || opponentTeam.crestSymbol}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-rose-400 uppercase tracking-wider">COMPUTER</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">AI</span>
                  </div>
                  <h3 className="text-base font-black text-white">{opponentTeam.name}</h3>
                  <span className="text-[11px] text-slate-300">
                    Striker: {opponentTeam.striker.name} #{opponentTeam.striker.number}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: opponentTeam.stars }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            {/* VS Badge */}
            <div className="flex items-center justify-center">
              <div className="px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs tracking-widest uppercase shadow-lg border border-white/25">
                VS
              </div>
            </div>

            {/* Bottom Team: Human Player */}
            <div className="p-3 rounded-2xl bg-[#0284c7]/20 border border-[#0284c7]/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shadow-md border border-white/20"
                  style={{ backgroundColor: playerTeam.primaryColor, color: playerTeam.textColor }}
                >
                  {playerTeam.flagEmoji || playerTeam.crestSymbol}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-cyan-300 uppercase tracking-wider">YOU</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">HUMAN</span>
                  </div>
                  <h3 className="text-base font-black text-white">{playerTeam.name}</h3>
                  <span className="text-[11px] text-cyan-200">
                    {playerTeam.striker.name} #{playerTeam.striker.number}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: playerTeam.stars }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          </div>

          {/* Level Objectives Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">GOAL TARGET</span>
              <span className="text-base font-black text-emerald-300 font-mono mt-1">
                {currentLevelConfig.targetGoals} GOALS
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">MATCH SCORE</span>
              <span className="text-base font-black text-white font-mono mt-1">
                YOU 0 - 0 AI
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">RALLY TARGET</span>
              <span className="text-base font-black text-amber-400 font-mono mt-1">
                {currentLevelConfig.targetRally} Hits
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OPPONENT SKILL</span>
              <span className="text-xs font-black text-rose-400 uppercase mt-1">
                {currentLevelConfig.opponentSkill}
              </span>
            </div>
          </div>

          {/* Special Rule */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>MATCH RULE</span>
            </div>
            <p className="text-xs text-amber-200/90 font-medium leading-relaxed">
              {currentLevelConfig.specialRule}
            </p>
          </div>

          {/* Controls Instruction: Swipe Defense */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-center space-y-1">
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block">
              DEFENSE: FULL-WIDTH HORIZONTAL SWIPE
            </span>
            <p className="text-slate-300 text-[11px]">
              Swipe across the pitch to protect <strong className="text-white">Left, Center & Right Wings</strong> • Tap <strong className="text-amber-400">⚽ KICK</strong> at the sweet spot!
            </p>
          </div>

          {/* PLAY / KICK OFF CTA BUTTON */}
          <div className="pt-2">
            <button
              onClick={startMatchCountdown}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#10b981] via-[#059669] to-[#10b981] hover:brightness-110 active:scale-[0.98] text-white font-black text-base tracking-wider uppercase shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/30"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>PLAY / KICK OFF</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: CHAMPIONSHIP & 20 LEVELS
  // =========================================================================
  if (gameState === 'CHAMPIONSHIP') {
    const standings = getChampionshipStandings(playerTeam.id, progress);

    return (
      <div className="relative w-full h-full min-h-screen bg-[#05111c] text-white flex flex-col justify-between overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[#05111c]/95 backdrop-blur-md p-4 border-b border-white/10 flex items-center justify-between max-w-md mx-auto w-full">
          <button
            onClick={() => setGameState('HUB')}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer border border-white/15"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <h2 className="text-base font-black uppercase text-white tracking-tight">
              SOCCER PING-PONG CHAMPIONSHIP
            </h2>
            <span className="text-[11px] text-cyan-300 font-bold">
              Level {progress.unlockedLevel}/20 • Score: {progress.currentTotalScore.toLocaleString()}
            </span>
          </div>

          <div className="w-10" />
        </header>

        {/* Tab Toggle: League Standings vs 20 Levels */}
        <div className="max-w-md mx-auto w-full px-4 pt-3">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase">
            <button
              onClick={() => setChampTab('STANDINGS')}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                champTab === 'STANDINGS' ? 'bg-[#0284c7] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              LEAGUE STANDINGS
            </button>
            <button
              onClick={() => setChampTab('LEVELS')}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                champTab === 'LEVELS' ? 'bg-[#0284c7] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              ALL 20 LEVELS
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 max-w-md mx-auto w-full p-4 pb-20">
          {champTab === 'STANDINGS' ? (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-cyan-200/90 text-center">
                Swipe horizontally anywhere across the field to defend your touchlines!
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-xl">
                <div className="grid grid-cols-12 gap-1 p-2.5 bg-white/10 text-[10px] font-black uppercase tracking-wider text-slate-300 border-b border-white/10">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-5">TEAM</div>
                  <div className="col-span-1 text-center">W</div>
                  <div className="col-span-1 text-center">D</div>
                  <div className="col-span-1 text-center">L</div>
                  <div className="col-span-1 text-center">GF</div>
                  <div className="col-span-1 text-center">GA</div>
                  <div className="col-span-1 text-center font-bold text-cyan-300">PT</div>
                </div>

                <div className="divide-y divide-white/5">
                  {standings.map((row, idx) => {
                    const isUser = row.team.id === playerTeam.id;
                    return (
                      <div
                        key={row.teamId}
                        className={`grid grid-cols-12 gap-1 p-2.5 items-center text-xs font-mono transition-colors ${
                          isUser ? 'bg-[#0284c7]/25 font-bold text-white' : 'text-slate-200'
                        }`}
                      >
                        <div className="col-span-1 text-center font-black">{idx + 1}.</div>
                        <div className="col-span-5 flex items-center gap-2 truncate font-sans font-bold">
                          <span className="text-sm shrink-0">
                            {row.team.flagEmoji || row.team.crestSymbol}
                          </span>
                          <span className="truncate">{row.team.name}</span>
                          {isUser && <span className="text-[9px] text-cyan-300 font-bold">(YOU)</span>}
                        </div>
                        <div className="col-span-1 text-center">{row.won}</div>
                        <div className="col-span-1 text-center text-slate-400">{row.drawn}</div>
                        <div className="col-span-1 text-center text-slate-400">{row.lost}</div>
                        <div className="col-span-1 text-center">{row.goalsFor}</div>
                        <div className="col-span-1 text-center text-slate-400">{row.goalsAgainst}</div>
                        <div className="col-span-1 text-center font-black text-amber-400">{row.points}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* 20 LEVELS LIST WITH LOCKED STATE & REQUIREMENTS */
            <div className="space-y-2.5">
              {SOCCER_LEVELS.map((lvl, index) => {
                const isUnlocked = isLevelUnlocked(lvl.level);
                const isCompleted = progress.completedLevels.includes(lvl.level);
                const isCurrent = lvl.level === progress.unlockedLevel;
                const stars = progress.stars[lvl.level] || 0;

                return (
                  <div
                    key={lvl.level}
                    onClick={() => {
                      if (isUnlocked) {
                        openMatchSetup(index);
                      } else {
                        setLockedModalLevel(lvl);
                        soccerAudio.playBounce(0.3);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-[#0284c7]/20 border-[#0284c7] shadow-lg cursor-pointer active:scale-[0.99]'
                        : isCompleted
                        ? 'bg-white/5 hover:bg-white/10 border-white/15 cursor-pointer active:scale-[0.99]'
                        : 'bg-black/40 border-white/5 opacity-60 cursor-pointer hover:opacity-80 active:scale-[0.99]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs border ${
                          isCurrent
                            ? 'bg-[#0284c7] text-white border-white/30'
                            : isCompleted
                            ? 'bg-emerald-500 text-white border-white/20'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                      >
                        {lvl.level < 10 ? `0${lvl.level}` : lvl.level}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-white leading-tight">{lvl.title}</h4>
                          {!isUnlocked && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                              LOCKED
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-cyan-300 font-bold block mt-0.5">
                          Target: {lvl.targetGoals} Goals • {lvl.targetRally} Rally
                        </span>
                        {!isUnlocked && lvl.requiredCumulativeScore > 0 && (
                          <span className="text-[9.5px] text-slate-400 block font-mono">
                            Req: Level {lvl.level - 1} + {lvl.requiredCumulativeScore.toLocaleString()} pts
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= stars ? 'fill-amber-400 text-amber-400' : 'text-white/20'
                              }`}
                            />
                          ))}
                        </div>
                      ) : isUnlocked ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#0284c7]/20 text-[#38bdf8] text-[9px] font-black uppercase border border-[#0284c7]/50">
                          PLAY
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Lock className="w-4 h-4 text-amber-400/80" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Big Bottom Play Button */}
        <footer className="sticky bottom-0 bg-[#05111c]/95 backdrop-blur-md p-4 border-t border-white/10 max-w-md mx-auto w-full z-20">
          <button
            onClick={() => openMatchSetup(progress.unlockedLevel - 1)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#10b981] via-[#059669] to-[#10b981] hover:brightness-110 active:scale-[0.98] text-white font-black text-base tracking-wider uppercase shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer border border-white/25"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>PLAY LEVEL {progress.unlockedLevel}</span>
          </button>
        </footer>

        {/* LOCKED LEVEL MODAL EXPLAINING UNLOCK REQUIREMENTS */}
        {lockedModalLevel && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0e2740] to-[#061424] border border-amber-500/40 p-5 space-y-4 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl text-amber-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                    LEVEL {lockedModalLevel.level} LOCKED
                  </span>
                  <h3 className="text-base font-black text-white leading-tight">
                    {lockedModalLevel.title}
                  </h3>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  UNLOCK REQUIREMENTS:
                </span>

                {/* Requirement 1: Previous level */}
                <div className="flex items-start gap-2">
                  {progress.completedLevels.includes(lockedModalLevel.level - 1) ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-white">
                      Complete Level {lockedModalLevel.level - 1}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {progress.completedLevels.includes(lockedModalLevel.level - 1)
                        ? 'Completed ✓'
                        : `You must beat Level ${lockedModalLevel.level - 1} first`}
                    </span>
                  </div>
                </div>

                {/* Requirement 2: Cumulative score */}
                <div className="flex items-start gap-2">
                  {progress.currentTotalScore >= lockedModalLevel.requiredCumulativeScore ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-white">
                      Cumulative Score: {lockedModalLevel.requiredCumulativeScore.toLocaleString()} pts
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Your Career Score: {progress.currentTotalScore.toLocaleString()} pts (
                      {progress.currentTotalScore >= lockedModalLevel.requiredCumulativeScore
                        ? 'Target Reached ✓'
                        : `${(lockedModalLevel.requiredCumulativeScore - progress.currentTotalScore).toLocaleString()} more pts needed`}
                      )
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setLockedModalLevel(null)}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase cursor-pointer"
                >
                  GOT IT
                </button>
                <button
                  onClick={() => {
                    setLockedModalLevel(null);
                    openMatchSetup(progress.unlockedLevel - 1);
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-black text-xs uppercase cursor-pointer shadow-md"
                >
                  PLAY LEVEL {progress.unlockedLevel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: TEAM / PLAYER CUSTOMIZATION (CLUBS & COUNTRIES)
  // =========================================================================
  if (gameState === 'TEAM_SELECT') {
    const listToDisplay = customizationTab === 'COUNTRIES' ? COUNTRY_TEAMS : FICTIONAL_CLUBS;

    return (
      <div className="relative w-full h-full min-h-screen bg-[#05111c] text-white flex flex-col justify-between overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
        <header className="sticky top-0 z-20 bg-[#05111c]/95 backdrop-blur-md p-4 border-b border-white/10 flex items-center justify-between max-w-md mx-auto w-full">
          <button
            onClick={() => setGameState('HUB')}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer border border-white/15"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <h2 className="text-base font-black uppercase text-white">SELECT REPRESENTATION</h2>
            <span className="text-[11px] text-cyan-300 font-bold">National Teams & Fictional Clubs</span>
          </div>
          <div className="w-10" />
        </header>

        {/* Tab Toggle: COUNTRIES vs CLUBS */}
        <div className="max-w-md mx-auto w-full px-4 pt-3">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase">
            <button
              onClick={() => setCustomizationTab('COUNTRIES')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                customizationTab === 'COUNTRIES' ? 'bg-[#0284c7] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>COUNTRIES ({COUNTRY_TEAMS.length})</span>
            </button>
            <button
              onClick={() => setCustomizationTab('CLUBS')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                customizationTab === 'CLUBS' ? 'bg-[#0284c7] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>CLUBS ({FICTIONAL_CLUBS.length})</span>
            </button>
          </div>
        </div>

        <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-3 pb-16">
          {listToDisplay.map((team) => {
            const isSelected = team.id === playerTeam.id;
            return (
              <div
                key={team.id}
                onClick={() => {
                  saveProgress({ ...progress, selectedTeamId: team.id });
                  soccerAudio.playBounce(0.5);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#0284c7]/25 border-[#0284c7] shadow-lg shadow-[#0284c7]/25 scale-[1.01]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shadow-md border border-white/20"
                    style={{ backgroundColor: team.primaryColor, color: team.textColor }}
                  >
                    {team.flagEmoji || team.crestSymbol}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{team.name}</h3>
                    <span className="text-[11px] text-slate-300 block">{team.city}, {team.country}</span>
                    <span className="text-[10px] text-cyan-300 font-bold">
                      Striker: {team.striker.name} #{team.striker.number}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: team.stars }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {isSelected ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase border border-emerald-500/40">
                      SELECTED
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold uppercase">CHOOSE</span>
                  )}
                </div>
              </div>
            );
          })}
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: CAREER STATS MODAL
  // =========================================================================
  if (gameState === 'CAREER_STATS') {
    const totalStars = (Object.values(progress.stars) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
    const winRate =
      progress.totalMatchesPlayed > 0
        ? Math.round((progress.totalWins / progress.totalMatchesPlayed) * 100)
        : 0;

    return (
      <div className="relative w-full h-full min-h-screen bg-[#05111c] text-white flex flex-col justify-between overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
        <header className="sticky top-0 z-20 bg-[#05111c]/95 backdrop-blur-md p-4 border-b border-white/10 flex items-center justify-between max-w-md mx-auto w-full">
          <button
            onClick={() => setGameState('HUB')}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer border border-white/15"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <h2 className="text-base font-black uppercase text-white">CAREER STATS</h2>
            <span className="text-[11px] text-cyan-300 font-bold">{playerTeam.name}</span>
          </div>
          <div className="w-10" />
        </header>

        <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-3 pb-16">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">CARRIED TOTAL SCORE</span>
              <span className="text-lg font-black text-[#38bdf8] font-mono mt-1 block">
                {progress.currentTotalScore.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">HIGHEST RALLY</span>
              <span className="text-lg font-black text-emerald-400 font-mono mt-1 block">
                {progress.highestRallyOverall} Hits
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">MATCHES PLAYED</span>
              <span className="text-lg font-black text-white font-mono mt-1 block">
                {progress.totalMatchesPlayed}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">WIN RATE</span>
              <span className="text-lg font-black text-amber-400 font-mono mt-1 block">
                {winRate}% ({progress.totalWins}W / {progress.totalLosses}L)
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">ACTIVE WIN STREAK</span>
              <span className="text-lg font-black text-rose-400 font-mono mt-1 block">
                {progress.winStreak} Matches
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">TOTAL STARS</span>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-lg font-black text-amber-300 font-mono">
                  {totalStars} / 60
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-slate-400">Total Returns Made</span>
              <span className="font-bold text-white">{progress.totalReturnsCompleted.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-slate-400">Completed Levels</span>
              <span className="font-bold text-cyan-300">{progress.completedLevels.length} / 20</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Career Best Total</span>
              <span className="font-bold text-emerald-400">{progress.bestTotalScore.toLocaleString()}</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW 5: TROPHIES
  // =========================================================================
  if (gameState === 'TROPHIES') {
    return (
      <div className="relative w-full h-full min-h-screen bg-[#05111c] text-white flex flex-col justify-between overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
        <header className="sticky top-0 z-20 bg-[#05111c]/95 backdrop-blur-md p-4 border-b border-white/10 flex items-center justify-between max-w-md mx-auto w-full">
          <button
            onClick={() => setGameState('HUB')}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer border border-white/15"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <h2 className="text-base font-black uppercase text-white">TROPHIES & AWARDS</h2>
            <span className="text-[11px] text-amber-300 font-bold">
              {progress.unlockedTrophies.length} / {INITIAL_TROPHIES.length} Unlocked
            </span>
          </div>
          <div className="w-10" />
        </header>

        <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-2.5 pb-16">
          {INITIAL_TROPHIES.map((tr) => {
            const isUnlocked = progress.unlockedTrophies.includes(tr.id);
            return (
              <div
                key={tr.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                  isUnlocked
                    ? 'bg-amber-500/10 border-amber-500/30 shadow-md'
                    : 'bg-white/5 border-white/5 opacity-50'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shrink-0">
                  {tr.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-white truncate">{tr.title}</h3>
                    {isUnlocked && (
                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                        UNLOCKED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight mt-0.5">{tr.description}</p>
                </div>
              </div>
            );
          })}
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW 6: SETTINGS
  // =========================================================================
  if (gameState === 'SETTINGS') {
    return (
      <div className="relative w-full h-full min-h-screen bg-[#05111c] text-white flex flex-col justify-between overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
        <header className="sticky top-0 z-20 bg-[#05111c]/95 backdrop-blur-md p-4 border-b border-white/10 flex items-center justify-between max-w-md mx-auto w-full">
          <button
            onClick={() => setGameState('HUB')}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer border border-white/15"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <h2 className="text-base font-black uppercase text-white">GAME SETTINGS</h2>
            <span className="text-[11px] text-cyan-300 font-bold">Preferences</span>
          </div>
          <div className="w-10" />
        </header>

        <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-4 pb-16">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-400">AUDIO</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Sound Effects</span>
              <button
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`px-4 py-1.5 rounded-xl font-black text-xs uppercase ${
                  settings.soundEnabled ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'
                }`}
              >
                {settings.soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h3 className="text-xs font-black uppercase text-slate-400">DEFENSIVE CONTROLS</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Touch and swipe across the pitch to reposition your platform between Left Wing, Center, and Right Wing. Tap the KICK button when the ball reaches your strike zone.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW 7: LEADERBOARD
  // =========================================================================
  if (gameState === 'LEADERBOARD') {
    return (
      <div className="relative w-full h-full min-h-screen bg-[#07131F] text-white flex flex-col items-center justify-center select-none font-['Plus_Jakarta_Sans',sans-serif]">
        <GameLeaderboardModal
          gameConfig={GAME_CONFIGS['soccer-ping-pong']}
          profile={profile || undefined}
          onClose={() => setGameState('HUB')}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 8: RESULT SCREEN (WIN / LOSS)
  // =========================================================================
  if (gameState === 'RESULT_WIN' || gameState === 'RESULT_LOSS') {
    const isWin = gameState === 'RESULT_WIN';

    return (
      <div className="fixed inset-0 z-50 bg-[#05111c]/95 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0a2238] to-[#040e18] border border-white/20 p-6 space-y-4 shadow-2xl text-center">
          {/* Trophy / Emblem */}
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-xl border border-white/20 bg-gradient-to-tr from-[#0b335c] to-[#0284c7]">
            {isWin ? '🏆' : '⚽'}
          </div>

          <div className="space-y-1">
            <h2 className={`text-2xl font-black uppercase tracking-tight ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isWin ? 'VICTORY!' : 'MATCH LOSS'}
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              {isWin
                ? `Level ${currentLevelConfig.level} Completed Successfully!`
                : 'Conceded too many goals in the wing exchange. Try again!'}
            </p>
          </div>

          {/* Stars (on win) */}
          {isWin && (
            <div className="flex items-center justify-center gap-1.5 py-1">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-6 h-6 ${
                    s <= starsEarned ? 'fill-amber-400 text-amber-400' : 'text-white/20'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Stats Box */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Match Goals</span>
              <span className="font-black text-white">YOU {playerGoals} - {computerGoals} AI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Progression Points</span>
              <span className="font-black text-emerald-400">+{levelScore.toLocaleString()} pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Highest Rally</span>
              <span className="font-black text-amber-300">{highestMatchRally} Hits</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-1.5">
              <span className="text-slate-400">Carried Total Career Score</span>
              <span className="font-black text-[#38bdf8]">{progress.currentTotalScore.toLocaleString()}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            {isWin ? (
              <button
                onClick={advanceToNextLevel}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#10b981] via-[#059669] to-[#10b981] hover:brightness-110 active:scale-[0.98] text-white font-black text-sm tracking-wider uppercase shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer border border-white/25"
              >
                <span>NEXT LEVEL</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => openMatchSetup(currentLevelIndex)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:brightness-110 active:scale-[0.98] text-white font-black text-sm tracking-wider uppercase shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-white/25"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RETRY MATCH</span>
              </button>
            )}

            <button
              onClick={() => setGameState('HUB')}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-black text-xs uppercase flex items-center justify-center border border-white/10"
            >
              RETURN TO GAME HUB
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 9: MAIN SPORTS GAME HUB (DEFAULT HOME MENU)
  // =========================================================================
  if (gameState === 'HUB') {
    const totalStars = (Object.values(progress.stars) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);

    return (
      <div className="relative w-full h-full min-h-screen bg-gradient-to-b from-[#040f1a] via-[#081e33] to-[#030911] text-white flex flex-col justify-between overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Top App Header */}
        <header className="p-4 flex items-center justify-between z-10 max-w-md mx-auto w-full">
          <button
            onClick={onExit}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer border border-white/15 shadow-sm"
            aria-label="Exit Game"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="px-3.5 py-1 rounded-full bg-[#0284c7]/20 border border-[#0284c7]/50 text-[#38bdf8] text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
            <span>SOCCER PING PONG</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setGameState('SETTINGS')}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer border border-white/15"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </header>

        {/* Hero Banner with Team & Matchup */}
        <main className="flex-1 max-w-md mx-auto w-full px-4 py-2 space-y-4 flex flex-col justify-center">
          {/* Selected Representation Card (Country / Club) */}
          <div
            onClick={() => setGameState('TEAM_SELECT')}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md cursor-pointer flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shadow-md border border-white/20"
                style={{ backgroundColor: playerTeam.primaryColor, color: playerTeam.textColor }}
              >
                {playerTeam.flagEmoji || playerTeam.crestSymbol}
              </div>
              <div>
                <span className="text-[10px] text-cyan-300 font-black uppercase tracking-wider block">
                  YOUR TEAM
                </span>
                <h3 className="text-sm font-black text-white leading-tight">{playerTeam.name}</h3>
                <span className="text-[10px] text-slate-400">
                  Striker: {playerTeam.striker.name} #{playerTeam.striker.number}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-300">
              <span>CUSTOMIZE</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Carried Total Score & Progression Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-b from-[#0c2a49] to-[#06182a] border border-[#0284c7]/40 shadow-xl space-y-3 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                CARRIED PROGRESSION SCORE
              </span>
              <span className="text-3xl font-black text-[#38bdf8] font-mono tracking-tight">
                {progress.currentTotalScore.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10">
              <div className="p-2 rounded-xl bg-white/5">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">LEVEL</span>
                <span className="text-sm font-black text-white font-mono">{progress.unlockedLevel}/20</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">STARS</span>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-black text-amber-300 font-mono">{totalStars}/60</span>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/5">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">BEST RALLY</span>
                <span className="text-sm font-black text-emerald-400 font-mono">{progress.highestRallyOverall} Hits</span>
              </div>
            </div>
          </div>

          {/* PRIMARY ACTION: PLAY (Big Kickoff CTA) */}
          <button
            onClick={() => openMatchSetup(progress.unlockedLevel - 1)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#10b981] via-[#059669] to-[#10b981] hover:brightness-110 active:scale-[0.98] text-white font-black text-base tracking-wider uppercase shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/25"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>PLAY LEVEL {progress.unlockedLevel}</span>
          </button>

          {/* GAME HUB MENU NAVIGATION CARDS */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* LEVELS / CHAMPIONSHIP */}
            <button
              onClick={() => setGameState('CHAMPIONSHIP')}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 flex flex-col items-start gap-1 transition-all text-left cursor-pointer"
            >
              <Trophy className="w-5 h-5 text-amber-400 mb-0.5" />
              <span className="text-xs font-black uppercase text-white tracking-wide">CHAMPIONSHIP</span>
              <span className="text-[10px] text-slate-400">Standings & 20 Levels</span>
            </button>

            {/* CAREER / STATS */}
            <button
              onClick={() => setGameState('CAREER_STATS')}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 flex flex-col items-start gap-1 transition-all text-left cursor-pointer"
            >
              <BarChart2 className="w-5 h-5 text-cyan-400 mb-0.5" />
              <span className="text-xs font-black uppercase text-white tracking-wide">CAREER STATS</span>
              <span className="text-[10px] text-slate-400">Records & Win Rate</span>
            </button>

            {/* LEADERBOARD */}
            <button
              onClick={() => setGameState('LEADERBOARD')}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 flex flex-col items-start gap-1 transition-all text-left cursor-pointer"
            >
              <Award className="w-5 h-5 text-purple-400 mb-0.5" />
              <span className="text-xs font-black uppercase text-white tracking-wide">LEADERBOARD</span>
              <span className="text-[10px] text-slate-400">Global Rankings</span>
            </button>

            {/* TROPHIES / AWARDS */}
            <button
              onClick={() => setGameState('TROPHIES')}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 flex flex-col items-start gap-1 transition-all text-left cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-yellow-400 mb-0.5" />
              <span className="text-xs font-black uppercase text-white tracking-wide">TROPHIES</span>
              <span className="text-[10px] text-slate-400">{progress.unlockedTrophies.length} Unlocked</span>
            </button>
          </div>
        </main>

        <footer className="p-3 text-center text-[10.5px] text-slate-400 font-medium">
          Horizontal Soccer Ping Pong • Swipe to defend • Tap KICK to return
        </footer>
      </div>
    );
  }

  // =========================================================================
  // VIEW 10: COUNTDOWN & IN-MATCH GAMEPLAY
  // Fully Refactored with:
  // - No Left/Right buttons
  // - Clear [ ⚽ KICK ] button
  // - Swipe-to-defend full pitch guidance
  // =========================================================================
  return (
    <div className="relative w-full h-full min-h-screen bg-[#07131f] text-white flex flex-col justify-between overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. TOP HUD */}
      <header className="relative z-20 p-2.5 sm:p-3 bg-[#05111c]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between max-w-md mx-auto w-full shadow-md">
        {/* Left: Pause & Team Score Box */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGameState('PAUSED')}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white cursor-pointer border border-white/15"
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4 fill-current" />
          </button>

          {/* Goal Scoreboard: YOU [flag] 0 - 0 [flag] AI */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/15 shadow-inner">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black text-cyan-300">YOU</span>
              <span className="text-xs">{playerTeam.flagEmoji || playerTeam.crestSymbol}</span>
              <span className="font-mono font-black text-sm text-white">{playerGoals}</span>
            </div>

            <span className="text-xs text-slate-500 font-bold px-0.5">-</span>

            <div className="flex items-center gap-1">
              <span className="font-mono font-black text-sm text-rose-400">{computerGoals}</span>
              <span className="text-xs">{opponentTeam.flagEmoji || opponentTeam.crestSymbol}</span>
              <span className="text-[10px] font-black text-rose-300">AI</span>
            </div>
          </div>
        </div>

        {/* Center: Rally Counter */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase">
            <span>RALLY</span>
            <span className="font-mono text-xs">{matchRally}</span>
          </div>
        </div>

        {/* Right: Target Goals & Carried Progression Score */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[8.5px] text-amber-300 font-bold uppercase block">TARGET</span>
            <span className="text-xs font-mono font-black text-white">
              {currentLevelConfig.targetGoals} G
            </span>
          </div>

          <div className="text-right pl-1.5 border-l border-white/10">
            <span className="text-[8.5px] text-slate-400 font-bold uppercase block">SCORE</span>
            <span className="text-xs font-mono font-black text-[#38bdf8]">
              {displayedTotalScore.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      {/* 2. VERTICAL SOCCER PITCH CANVAS */}
      <div className="relative flex-1 w-full max-w-md mx-auto overflow-hidden flex items-center justify-center">
        <SoccerPitchCanvas
          playerTeam={playerTeam}
          opponentTeam={opponentTeam}
          levelConfig={currentLevelConfig}
          isRunning={gameState === 'PLAYING'}
          onPlayerHit={handlePlayerHit}
          onComputerHit={handleComputerHit}
          onPlayerMiss={handlePlayerMiss}
          onComputerMiss={handleComputerMiss}
          onRallyIncrement={handleRallyIncrement}
          onKickFeedback={(txt) => {
            setFeedbackText(txt);
            setTimeout(() => setFeedbackText(null), 750);
          }}
          kickTrigger={kickTrigger}
          isMovingLeft={isMovingLeft}
          isMovingRight={isMovingRight}
        />

        {/* Feedback Pill Banner */}
        {feedbackText && (
          <div className="absolute top-1/3 z-30 px-4 py-1.5 rounded-full bg-black/85 border border-amber-400 text-amber-300 font-black text-xs uppercase tracking-wider animate-bounce shadow-2xl">
            {feedbackText}
          </div>
        )}

        {/* Countdown Overlay */}
        {gameState === 'COUNTDOWN' && (
          <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-2">
              <span className="text-5xl font-black text-white drop-shadow-2xl font-mono tracking-tight animate-pulse">
                {countdownNum}
              </span>
              <span className="block text-xs font-bold text-cyan-300 uppercase tracking-widest">
                LEVEL {currentLevelConfig.level} KICKOFF
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. LOWER CONTROLS (Removed Left/Right buttons, prominent Kick button + Gesture guidance) */}
      <footer className="relative z-20 p-3 bg-[#05111c]/95 backdrop-blur-md border-t border-white/10 max-w-md mx-auto w-full space-y-2">
        {/* Swipe Guidance Prompt */}
        <div className="text-center">
          <span className="text-[10px] text-cyan-300/90 font-bold uppercase tracking-wider">
            ↔ Swipe field to defend Left, Center & Right Wings
          </span>
        </div>

        {/* Large Centered Responsive KICK Button */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onPointerDown={() => setKickTrigger((prev) => prev + 1)}
            className="w-full max-w-xs h-14 rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#0284c7] hover:brightness-110 active:scale-[0.97] active:from-amber-500 active:to-amber-600 text-white font-black text-base uppercase tracking-wider shadow-lg shadow-[#0284c7]/30 flex items-center justify-center gap-2 cursor-pointer select-none border border-white/30 transition-all"
            aria-label="Kick Football"
          >
            <span className="text-2xl">⚽</span>
            <span className="text-sm font-black tracking-widest">KICK / RETURN</span>
          </button>
        </div>
      </footer>

      {/* PAUSE MODAL */}
      {gameState === 'PAUSED' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs rounded-3xl bg-[#091b2e] border border-white/20 p-5 space-y-3 shadow-2xl text-center">
            <h3 className="text-base font-black uppercase text-white">MATCH PAUSED</h3>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setGameState('PLAYING')}
                className="w-full py-3 rounded-xl bg-[#0284c7] text-white text-xs font-black uppercase cursor-pointer"
              >
                RESUME
              </button>
              <button
                onClick={startMatchCountdown}
                className="w-full py-3 rounded-xl bg-white/10 text-white text-xs font-black uppercase cursor-pointer"
              >
                RESTART MATCH
              </button>
              <button
                onClick={() => setGameState('HUB')}
                className="w-full py-3 rounded-xl bg-white/5 text-slate-400 hover:text-white text-xs font-black uppercase cursor-pointer"
              >
                GAME HUB
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
