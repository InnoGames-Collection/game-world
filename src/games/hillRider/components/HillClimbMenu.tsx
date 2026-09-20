import React from 'react';
import { 
  Play, 
  Grid, 
  Trophy, 
  Settings as SettingsIcon, 
  ArrowLeft, 
  Star, 
  Zap, 
  Gauge, 
  Award,
  ShieldCheck,
  Coins
} from 'lucide-react';
import { PlayerLevelProgress, LevelCompletionRecord } from '../types';
import { UserProfile } from '../../../types';
import { HILL_CLIMB_LEVELS } from '../levels';

interface HillClimbMenuProps {
  progress: PlayerLevelProgress;
  profile?: UserProfile;
  onPlay: (levelNumber?: number) => void;
  onOpenLevels: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  onExit: () => void;
}

export const HillClimbMenu: React.FC<HillClimbMenuProps> = ({
  progress,
  profile,
  onPlay,
  onOpenLevels,
  onOpenLeaderboard,
  onOpenSettings,
  onExit,
}) => {
  const currentLevel = HILL_CLIMB_LEVELS.find((l) => l.levelNumber === progress.unlockedLevel) || HILL_CLIMB_LEVELS[0];
  const totalStars = Object.values(progress.completedLevels).reduce(
    (sum: number, c: LevelCompletionRecord) => sum + (c.stars || 0),
    0
  );
  const completedCount = Object.keys(progress.completedLevels).length;

  return (
    <div
      id="hill-climb-main-menu"
      className="relative w-full h-full min-h-[580px] flex flex-col justify-between p-4 sm:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#07172b] via-[#040e1c] to-[#02070e] text-white overflow-y-auto"
    >
      {/* Background Decorative Mountain Mesh & Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#1688C9]/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-[#8BCB3D]/15 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {/* TOP HEADER BAR */}
      <header className="relative z-10 flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          aria-label="Back to Arcade"
          className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-slate-200 hover:text-white border border-white/10 shadow-md flex items-center gap-2 text-xs font-bold transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline uppercase tracking-wider">Arcade</span>
        </button>

        {/* Player Profile Badge */}
        <div className="flex items-center gap-2 sm:gap-3 px-3.5 py-1.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md shadow-lg">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#1688C9] to-[#8BCB3D] flex items-center justify-center text-white font-black text-xs shadow-inner">
            {profile?.displayName?.charAt(0) || 'P'}
          </div>
          <div className="text-left leading-none">
            <div className="text-[10px] text-slate-400 font-semibold truncate max-w-[90px] sm:max-w-[130px]">
              {profile?.displayName || 'Player'}
            </div>
            <div className="text-xs text-amber-400 font-mono font-bold flex items-center gap-1 mt-0.5">
              <Coins className="w-3 h-3 fill-amber-400" />
              <span>{progress.totalCoins}</span>
            </div>
          </div>
        </div>

        {/* Settings Quick Access */}
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Game Settings"
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-slate-200 hover:text-white border border-white/10 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </header>

      {/* CENTER LOGO & VEHICLE BANNER */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center py-4">
        {/* 3D Crest Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#1688C9] to-[#8BCB3D] flex items-center justify-center mb-3 shadow-[0_10px_30px_rgba(22,136,201,0.4)] border-2 border-white/30 transform -rotate-3 hover:rotate-0 transition-transform">
          <Gauge className="w-9 h-9 sm:w-11 sm:h-11 text-white drop-shadow-md" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase drop-shadow-lg">
          HILL CLIMB <span className="text-[#8BCB3D]">3D</span>
        </h1>
        <p className="text-xs sm:text-sm text-cyan-300 font-bold uppercase tracking-widest mt-1">
          Highland Mountain Extreme Racing
        </p>

        {/* Current Active Stage Pill */}
        <div className="mt-4 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#8BCB3D] animate-pulse" />
          <div className="text-left leading-none">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Current Challenge
            </span>
            <span className="text-sm font-black text-white">
              Level {currentLevel.levelNumber}: {currentLevel.name}
            </span>
          </div>
          <span className="ml-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#1688C9]/20 text-cyan-300 border border-[#1688C9]/40">
            {currentLevel.tier}
          </span>
        </div>

        {/* Progress Stats Strip */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-sm mt-5">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">UNLOCKED</div>
            <div className="text-base sm:text-lg font-black font-mono text-white mt-0.5">
              {progress.unlockedLevel} <span className="text-xs text-slate-400 font-sans">/ 40</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">STARS</div>
            <div className="text-base sm:text-lg font-black font-mono text-amber-400 flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{totalStars}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">CLEARED</div>
            <div className="text-base sm:text-lg font-black font-mono text-[#8BCB3D] mt-0.5">
              {completedCount}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BUTTONS */}
      <div className="relative z-10 w-full max-w-md mx-auto space-y-3 pt-2">
        {/* PRIMARY PLAY / START BUTTON */}
        <button
          type="button"
          onClick={() => onPlay(progress.unlockedLevel)}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8BCB3D] via-[#7cb736] to-[#5a9c1e] hover:brightness-110 active:scale-[0.98] text-slate-950 font-black text-base sm:text-lg uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(139,203,61,0.5)] border-2 border-white/40 transition-all cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>PLAY LEVEL {progress.unlockedLevel}</span>
        </button>

        {/* SECONDARY BUTTONS: LEVELS, LEADERBOARD, SETTINGS */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={onOpenLevels}
            className="py-3 px-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-slate-700 text-white font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
          >
            <Grid className="w-4 h-4 text-cyan-400" />
            <span>LEVELS</span>
          </button>

          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="py-3 px-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-slate-700 text-white font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>RANKINGS</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="py-3 px-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-slate-700 text-white font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
          >
            <SettingsIcon className="w-4 h-4 text-slate-300" />
            <span>SETTINGS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
