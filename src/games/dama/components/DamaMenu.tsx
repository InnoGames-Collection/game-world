import React from 'react';
import {
  Play,
  Grid,
  Trophy,
  BookOpen,
  Award,
  BarChart3,
  Settings,
  Info,
  ArrowLeft,
  Flame,
  Crown,
  Shield,
  Zap,
} from 'lucide-react';
import { DamaProgress, DamaTournamentView, DamaLevelSaveData } from '../types';

interface DamaMenuProps {
  progress: DamaProgress;
  onNavigate?: (view: DamaTournamentView) => void;
  onStartLevel?: (level: number) => void;
  onPlay?: () => void;
  onLevels?: () => void;
  onLeaderboard?: () => void;
  onHowToPlay?: () => void;
  onAchievements?: () => void;
  onStatistics?: () => void;
  onSettings?: () => void;
  onAbout?: () => void;
  onExit: () => void;
}

export const DamaMenu: React.FC<DamaMenuProps> = ({
  progress,
  onNavigate,
  onStartLevel,
  onPlay,
  onLevels,
  onLeaderboard,
  onHowToPlay,
  onAchievements,
  onStatistics,
  onSettings,
  onAbout,
  onExit,
}) => {
  const completedCount = (Object.values(progress.completedLevels) as DamaLevelSaveData[]).filter((l) => l.wins > 0).length;
  const currentLvl = progress.highestUnlockedLevel;
  const totalWins = progress.stats.wins;
  const totalLosses = progress.stats.losses;
  const totalGames = totalWins + totalLosses;
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  // Compute average move efficiency across completed levels
  const efficiencies = (Object.values(progress.completedLevels) as DamaLevelSaveData[])
    .map((l) => l.bestEfficiencyPercent || 0)
    .filter((e) => e > 0);
  const bestEfficiency =
    efficiencies.length > 0 ? Math.max(...efficiencies) : 0;

  const handleStartPlay = () => {
    if (onPlay) {
      onPlay();
    } else if (onStartLevel) {
      onStartLevel(currentLvl);
    } else if (onNavigate) {
      onNavigate('GAMEPLAY');
    }
  };

  const handleNav = (target: DamaTournamentView) => {
    if (target === 'LEVEL_SELECT' && onLevels) {
      onLevels();
      return;
    }
    if (target === 'LEADERBOARD' && onLeaderboard) {
      onLeaderboard();
      return;
    }
    if (target === 'HOW_TO_PLAY' && onHowToPlay) {
      onHowToPlay();
      return;
    }
    if (target === 'ACHIEVEMENTS' && onAchievements) {
      onAchievements();
      return;
    }
    if (target === 'STATISTICS' && onStatistics) {
      onStatistics();
      return;
    }
    if (target === 'SETTINGS' && onSettings) {
      onSettings();
      return;
    }
    if (target === 'ABOUT' && onAbout) {
      onAbout();
      return;
    }
    if (onNavigate) {
      onNavigate(target);
    }
  };

  return (
    <div
      id="dama-main-menu-container"
      className="w-full max-w-lg mx-auto flex flex-col items-center justify-between min-h-screen px-4 py-6 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] select-none"
    >
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          id="dama-menu-exit-btn"
          onClick={onExit}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Hub</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold shadow-inner">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{progress.totalScore.toLocaleString()} PTS</span>
          </div>
        </div>
      </div>

      {/* Hero Board Title & Crest */}
      <div className="flex flex-col items-center text-center my-2">
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-700 via-amber-900 to-stone-950 border-2 border-amber-500/40 shadow-2xl flex items-center justify-center p-3 relative overflow-hidden group">
            {/* Checkerboard emblem overlay */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-20 pointer-events-none">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={`${(Math.floor(i / 4) + (i % 4)) % 2 === 1 ? 'bg-amber-400' : 'bg-transparent'}`}
                />
              ))}
            </div>
            <Crown className="w-10 h-10 text-amber-300 drop-shadow-md z-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 border border-amber-200 flex items-center justify-center text-[10px] font-black text-stone-950 shadow-md">
            40
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
          DAMA <span className="text-amber-400 font-extrabold text-2xl sm:text-3xl">ዳማ</span>
        </h1>
        <p className="text-xs text-amber-200/80 font-medium tracking-wide mt-1">
          Competitive 40-Level Draughts Tournament
        </p>
      </div>

      {/* Real Career Telemetry Cards */}
      <div className="w-full bg-slate-900/80 border border-amber-600/30 rounded-2xl p-4 backdrop-blur-md shadow-xl my-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
          <span>Tournament Progress</span>
          <span className="font-mono">LVL {currentLvl} / 40</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 text-center">
          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block uppercase tracking-tight">Unlocked</span>
            <span className="text-base font-black text-amber-300 font-mono">Level {currentLvl}</span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block uppercase tracking-tight">Total Score</span>
            <span className="text-base font-black text-amber-400 font-mono">
              {progress.totalScore.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block uppercase tracking-tight">Best Level</span>
            <span className="text-base font-black text-emerald-400 font-mono">
              {progress.stats.bestLevelScore || 0}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
          <div className="bg-slate-950/40 rounded-lg py-1.5 px-1 border border-slate-800/50">
            <span className="text-[9px] text-slate-500 block">Cleared</span>
            <span className="font-bold text-slate-200 font-mono">{completedCount}/40</span>
          </div>
          <div className="bg-slate-950/40 rounded-lg py-1.5 px-1 border border-slate-800/50">
            <span className="text-[9px] text-slate-500 block">Record</span>
            <span className="font-bold text-emerald-400 font-mono">
              {totalWins}W <span className="text-slate-600">/</span> {totalLosses}L
            </span>
          </div>
          <div className="bg-slate-950/40 rounded-lg py-1.5 px-1 border border-slate-800/50">
            <span className="text-[9px] text-slate-500 block">Streak</span>
            <span className="font-bold text-amber-400 font-mono flex items-center justify-center gap-0.5">
              <Flame className="w-3 h-3 fill-current text-amber-400" />
              {progress.stats.bestWinStreak}
            </span>
          </div>
          <div className="bg-slate-950/40 rounded-lg py-1.5 px-1 border border-slate-800/50">
            <span className="text-[9px] text-slate-500 block">Best Eff.</span>
            <span className="font-bold text-cyan-400 font-mono">{bestEfficiency > 0 ? `${bestEfficiency}%` : '--'}</span>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="w-full flex flex-col gap-2.5 my-2">
        {/* PLAY BUTTON (Starts current level) */}
        <button
          id="dama-menu-play-btn"
          onClick={handleStartPlay}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-stone-950 font-black text-lg tracking-wide uppercase shadow-lg shadow-amber-600/30 border border-amber-300/40 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current text-stone-950" />
          <span>Play Level {currentLvl}</span>
        </button>

        {/* 2-Column Menu Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="dama-menu-levels-btn"
            onClick={() => handleNav('LEVEL_SELECT')}
            className="py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Grid className="w-4 h-4 text-amber-400" />
            <span>Levels (40)</span>
          </button>

          <button
            id="dama-menu-leaderboard-btn"
            onClick={() => handleNav('LEADERBOARD')}
            className="py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Leaderboard</span>
          </button>

          <button
            id="dama-menu-howtoplay-btn"
            onClick={() => handleNav('HOW_TO_PLAY')}
            className="py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>How to Play</span>
          </button>

          <button
            id="dama-menu-achievements-btn"
            onClick={() => handleNav('ACHIEVEMENTS')}
            className="py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Achievements</span>
          </button>

          <button
            id="dama-menu-stats-btn"
            onClick={() => handleNav('STATISTICS')}
            className="py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Statistics</span>
          </button>

          <button
            id="dama-menu-settings-btn"
            onClick={() => handleNav('SETTINGS')}
            className="py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Settings</span>
          </button>
        </div>

        <button
          id="dama-menu-about-btn"
          onClick={() => handleNav('ABOUT')}
          className="w-full py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>About Dama Tournament Rules</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="text-center text-[11px] text-slate-500 font-medium">
        Deterministic Multi-Factor Scoring • 40 Tiers • Zero Random Bonuses
      </div>
    </div>
  );
};
