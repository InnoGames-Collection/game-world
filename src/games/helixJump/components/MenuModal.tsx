/**
 * Helix Jump Master Main Menu Screen
 * Fully featured pre-game hub with real statistics, achievements, settings, and navigation.
 */

import React from 'react';
import {
  Play,
  Grid,
  Trophy,
  HelpCircle,
  Award,
  BarChart3,
  Settings,
  Info,
  Volume2,
  VolumeX,
  ArrowLeft,
  Star,
  Flame,
} from 'lucide-react';
import { HelixJumpSaveData } from '../types';
import { helixAudio } from '../audioEngine';

interface MenuModalProps {
  saveData: HelixJumpSaveData;
  onPlay: () => void;
  onOpenLevels: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  onOpenAchievements: () => void;
  onOpenStatistics: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onToggleSound: () => void;
  onExit: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  saveData,
  onPlay,
  onOpenLevels,
  onOpenLeaderboard,
  onOpenHowToPlay,
  onOpenAchievements,
  onOpenStatistics,
  onOpenSettings,
  onOpenAbout,
  onToggleSound,
  onExit,
}) => {
  const totalStars = Object.values(saveData.stars || {}).reduce<number>(
    (acc, val) => acc + (Number(val) || 0),
    0
  );

  const bestScore = saveData.bestScore || 0;
  const currentLevel = saveData.highestUnlockedLevel || 1;

  return (
    <div
      id="helix-menu-modal"
      className="absolute inset-0 z-40 bg-gradient-to-b from-sky-600 via-sky-700 to-indigo-950 backdrop-blur-md flex flex-col justify-between items-center py-6 px-4 select-none font-['Plus_Jakarta_Sans',sans-serif] overflow-y-auto"
    >
      {/* Top Header Bar */}
      <div className="w-full max-w-sm flex items-center justify-between shrink-0">
        <button
          onClick={() => {
            helixAudio.playButtonClick();
            onExit();
          }}
          aria-label="Exit Game to Portal"
          className="w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Total Stars Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/40 border border-white/20 text-amber-300 text-xs font-black shadow-inner">
          <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
          <span>{totalStars} / 120</span>
        </div>

        {/* Quick Sound Toggle */}
        <button
          onClick={() => {
            helixAudio.playButtonClick();
            onToggleSound();
          }}
          aria-label="Toggle Sound"
          className="w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer shadow-md"
        >
          {saveData.soundEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5 text-rose-300" />
          )}
        </button>
      </div>

      {/* Center 3D Brand & Progress Card */}
      <div className="flex flex-col items-center text-center my-auto py-2">
        {/* Animated Helix Sphere Emblem */}
        <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-sky-400/30 blur-xl animate-pulse" />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-400 to-indigo-600 shadow-2xl border-2 border-white/40 flex items-center justify-center rotate-6 hover:rotate-0 transition-transform">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white to-sky-100 shadow-inner flex items-center justify-center animate-bounce">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
          Helix Jump
        </h1>
        <p className="text-sky-200 text-xs font-bold tracking-wider uppercase mt-1">
          Precision 3D Tower Championship
        </p>

        {/* Current Progress Card */}
        <div className="mt-3 w-full max-w-xs grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-950/40 border border-white/15 text-left shadow-lg">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              Current Level
            </div>
            <div className="text-sm font-black text-white mt-0.5">
              Level {currentLevel} <span className="text-[10px] text-slate-400 font-bold">/ 40</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              High Score
            </div>
            <div className="text-sm font-black text-amber-300 mt-0.5">
              {bestScore.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Navigation Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-2.5 shrink-0 pb-2">
        {/* 1. PRIMARY PLAY BUTTON */}
        <button
          id="helix-btn-menu-play"
          onClick={() => {
            helixAudio.playButtonClick();
            onPlay();
          }}
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-slate-950 font-black text-base tracking-wider uppercase shadow-xl shadow-amber-500/25 border-t border-white/40 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Play Level {currentLevel}</span>
        </button>

        {/* 2. LEVELS & LEADERBOARD (Row 1) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            id="helix-btn-menu-levels"
            onClick={() => {
              helixAudio.playButtonClick();
              onOpenLevels();
            }}
            className="h-11 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <Grid className="w-4 h-4 text-sky-300" />
            <span>Levels (40)</span>
          </button>

          <button
            id="helix-btn-menu-leaderboard"
            onClick={() => {
              helixAudio.playButtonClick();
              onOpenLeaderboard();
            }}
            className="h-11 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Leaderboard</span>
          </button>
        </div>

        {/* 3. ACHIEVEMENTS & STATISTICS (Row 2) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            id="helix-btn-menu-achievements"
            onClick={() => {
              helixAudio.playButtonClick();
              onOpenAchievements();
            }}
            className="h-11 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <Award className="w-4 h-4 text-emerald-300" />
            <span>Achievements</span>
          </button>

          <button
            id="helix-btn-menu-statistics"
            onClick={() => {
              helixAudio.playButtonClick();
              onOpenStatistics();
            }}
            className="h-11 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <BarChart3 className="w-4 h-4 text-purple-300" />
            <span>Statistics</span>
          </button>
        </div>

        {/* 4. HOW TO PLAY, SETTINGS & ABOUT (Row 3) */}
        <div className="grid grid-cols-3 gap-2">
          <button
            id="helix-btn-menu-how-to-play"
            onClick={() => {
              helixAudio.playButtonClick();
              onOpenHowToPlay();
            }}
            className="h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-[11px] uppercase flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-300" />
            <span>Guide</span>
          </button>

          <button
            id="helix-btn-menu-settings"
            onClick={() => {
              helixAudio.playButtonClick();
              onOpenSettings();
            }}
            className="h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-[11px] uppercase flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-300" />
            <span>Settings</span>
          </button>

          <button
            id="helix-btn-menu-about"
            onClick={() => {
              helixAudio.playButtonClick();
              onOpenAbout();
            }}
            className="h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-[11px] uppercase flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-slate-300" />
            <span>About</span>
          </button>
        </div>
      </div>
    </div>
  );
};
