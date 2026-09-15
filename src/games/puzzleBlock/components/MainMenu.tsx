/**
 * Professional Pre-Game Menu for Block (Puzzle Block)
 * Authentic wooden and copper styling, high-contrast typography, zero-scroll mobile layout.
 */

import React from 'react';
import { 
  Play, 
  Grid, 
  HelpCircle, 
  Calendar, 
  Trophy, 
  BarChart2, 
  Settings, 
  Info, 
  ArrowLeft,
  Volume2,
  VolumeX,
  Star
} from 'lucide-react';
import { PuzzleBlockSaveData } from '../types';

interface MainMenuProps {
  saveData: PuzzleBlockSaveData;
  onPlay: () => void;
  onOpenLevels: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  onOpenDailyChallenge: () => void;
  onOpenAchievements: () => void;
  onOpenStatistics: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onToggleSound: () => void;
  onExit: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  saveData,
  onPlay,
  onOpenLevels,
  onOpenLeaderboard,
  onOpenHowToPlay,
  onOpenDailyChallenge,
  onOpenAchievements,
  onOpenStatistics,
  onOpenSettings,
  onOpenAbout,
  onToggleSound,
  onExit,
}) => {
  const totalStars = (Object.values(saveData.stars || {}) as number[]).reduce((sum, s) => sum + s, 0);
  const currentLevelId = Math.min(40, saveData.highestUnlockedLevel || 1);

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-b from-[#4e1d0c] via-[#381307] to-[#1e0703] flex flex-col justify-between items-center px-4 py-3 select-none overflow-hidden touch-none text-amber-100 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Header Bar */}
      <div className="w-full max-w-md flex items-center justify-between z-10 pt-1">
        <button
          onClick={onExit}
          aria-label="Exit Game"
          className="h-10 px-3 rounded-xl bg-gradient-to-b from-[#7a3215] to-[#451808] border border-[#b55823] text-amber-200 flex items-center gap-1.5 text-xs font-bold shadow active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>PORTAL</span>
        </button>

        {/* Total Stars Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-600/70 shadow-inner">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-black text-amber-300 font-mono">
            {totalStars} / 120
          </span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          aria-label={saveData.soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#7a3215] to-[#451808] border border-[#b55823] text-amber-200 flex items-center justify-center shadow active:scale-95 transition-all cursor-pointer"
        >
          {saveData.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-amber-300 stroke-[2.5]" />
          ) : (
            <VolumeX className="w-4 h-4 text-stone-400 stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* Hero Section: Logo, Title & Decorative Block Motifs */}
      <div className="w-full max-w-md flex flex-col items-center justify-center my-auto py-2 z-10">
        {/* Decorative 3x3 Jewel Block Mosaic */}
        <div className="relative mb-3">
          <div className="grid grid-cols-3 gap-1 p-2 rounded-2xl bg-gradient-to-b from-[#6b2a12] to-[#2c0d05] border-2 border-[#d97c38] shadow-[0_12px_28px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.4)]">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-cyan-600 border border-cyan-200/60 shadow-sm" />
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-200/60 shadow-sm" />
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-400 to-purple-600 border border-purple-200/60 shadow-sm" />
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 border border-emerald-200/60 shadow-sm" />
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-rose-500 to-rose-700 border border-rose-200/60 shadow-sm" />
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-yellow-400 to-yellow-600 border border-yellow-200/60 shadow-sm" />
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-400 to-orange-600 border border-orange-200/60 shadow-sm" />
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-400 to-indigo-600 border border-indigo-200/60 shadow-sm" />
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-cyan-600 border border-cyan-200/60 shadow-sm" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black text-amber-300 font-serif tracking-wider drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-none">
          BLOCK
        </h1>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-px w-6 bg-gradient-to-r from-transparent to-amber-500/70" />
          <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#e89c62]">
            PUZZLE BLOCK
          </span>
          <div className="h-px w-6 bg-gradient-to-l from-transparent to-amber-500/70" />
        </div>

        {/* Player Level & Best Score Card */}
        <div className="w-full mt-4 p-3 rounded-2xl bg-[#240c06]/85 border border-[#8a3f20]/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-around text-center">
          <div>
            <span className="block text-[10px] uppercase font-bold text-[#e89c62] tracking-wider">CURRENT LEVEL</span>
            <span className="text-lg font-black text-amber-300 font-mono">Level {currentLevelId}</span>
          </div>
          <div className="h-7 w-px bg-[#4e1d0c]" />
          <div>
            <span className="block text-[10px] uppercase font-bold text-[#e89c62] tracking-wider">BEST SCORE</span>
            <span className="text-lg font-black text-emerald-300 font-mono">
              {(saveData.highestScore || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* MAIN HERO BUTTON: PLAY */}
        <button
          onClick={onPlay}
          id="btn-main-play"
          aria-label="Start Game"
          className="w-full mt-4 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 text-white font-black text-xl shadow-[0_8px_20px_rgba(16,185,129,0.35),inset_0_2px_2px_rgba(255,255,255,0.4)] border-2 border-emerald-300 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer hover:brightness-110 animate-in zoom-in-95 duration-200"
        >
          <Play className="w-6 h-6 fill-white" />
          <span>PLAY LEVEL {currentLevelId}</span>
        </button>
      </div>

      {/* Menu Action Tiles (2-Column Grid) */}
      <div className="w-full max-w-md grid grid-cols-2 gap-2.5 pb-2 z-10">
        {/* LEADERBOARD */}
        <button
          onClick={onOpenLeaderboard}
          id="btn-menu-leaderboard"
          className="p-3 rounded-xl bg-gradient-to-b from-[#b55823] via-[#7d3210] to-[#4e1b0b] border border-amber-400 text-amber-100 shadow-lg active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer hover:brightness-110 col-span-2"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
            <Trophy className="w-5 h-5 text-slate-950 fill-current" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-black text-white leading-tight flex items-center gap-1.5">
              LEADERBOARD <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black">TOP PLAYERS</span>
            </span>
            <span className="text-[11px] text-amber-200 font-semibold">Live Champions & Tournaments</span>
          </div>
        </button>

        {/* LEVELS */}
        <button
          onClick={onOpenLevels}
          id="btn-menu-levels"
          className="p-3 rounded-xl bg-gradient-to-b from-[#6e2a14] via-[#4e1b0b] to-[#341106] border border-[#b55823] text-amber-100 shadow-md active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer hover:brightness-110"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shrink-0">
            <Grid className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-amber-200 leading-tight">LEVELS</span>
            <span className="text-[10px] text-amber-400/80 font-semibold">40 Challenges</span>
          </div>
        </button>

        {/* HOW TO PLAY */}
        <button
          onClick={onOpenHowToPlay}
          id="btn-menu-how-to-play"
          className="p-3 rounded-xl bg-gradient-to-b from-[#6e2a14] via-[#4e1b0b] to-[#341106] border border-[#b55823] text-amber-100 shadow-md active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer hover:brightness-110"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-amber-200 leading-tight">HOW TO PLAY</span>
            <span className="text-[10px] text-amber-400/80 font-semibold">Rules & Tips</span>
          </div>
        </button>

        {/* DAILY CHALLENGE */}
        <button
          onClick={onOpenDailyChallenge}
          id="btn-menu-daily"
          className="p-3 rounded-xl bg-gradient-to-b from-[#6e2a14] via-[#4e1b0b] to-[#341106] border border-[#b55823] text-amber-100 shadow-md active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer hover:brightness-110 relative"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-amber-200 leading-tight">DAILY QUEST</span>
            <span className="text-[10px] text-amber-400/80 font-semibold">
              {saveData.dailyChallengeCompleted ? 'Completed ✓' : 'Earn Bonus'}
            </span>
          </div>
          {!saveData.dailyChallengeCompleted && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>

        {/* ACHIEVEMENTS */}
        <button
          onClick={onOpenAchievements}
          id="btn-menu-achievements"
          className="p-3 rounded-xl bg-gradient-to-b from-[#6e2a14] via-[#4e1b0b] to-[#341106] border border-[#b55823] text-amber-100 shadow-md active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer hover:brightness-110"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-amber-200 leading-tight">TROPHIES</span>
            <span className="text-[10px] text-amber-400/80 font-semibold">Achievements</span>
          </div>
        </button>

        {/* STATISTICS */}
        <button
          onClick={onOpenStatistics}
          id="btn-menu-statistics"
          className="p-3 rounded-xl bg-gradient-to-b from-[#6e2a14] via-[#4e1b0b] to-[#341106] border border-[#b55823] text-amber-100 shadow-md active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer hover:brightness-110"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shrink-0">
            <BarChart2 className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-amber-200 leading-tight">STATISTICS</span>
            <span className="text-[10px] text-amber-400/80 font-semibold">Career Data</span>
          </div>
        </button>

        {/* SETTINGS */}
        <button
          onClick={onOpenSettings}
          id="btn-menu-settings"
          className="p-3 rounded-xl bg-gradient-to-b from-[#6e2a14] via-[#4e1b0b] to-[#341106] border border-[#b55823] text-amber-100 shadow-md active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer hover:brightness-110"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-amber-200 leading-tight">SETTINGS</span>
            <span className="text-[10px] text-amber-400/80 font-semibold">Audio & Reset</span>
          </div>
        </button>
      </div>

      {/* Bottom About Link */}
      <div className="w-full max-w-md flex items-center justify-center pt-1 pb-1 z-10">
        <button
          onClick={onOpenAbout}
          className="flex items-center gap-1.5 text-xs text-amber-300/80 hover:text-amber-200 transition-colors font-medium cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>About Block • v1.4</span>
        </button>
      </div>
    </div>
  );
};
