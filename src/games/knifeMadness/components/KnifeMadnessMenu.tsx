/**
 * KNIFE MADNESS - Main Menu Screen
 * Professional entry point displaying real player telemetry summary card
 * and navigation into all sub-screens.
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
  ArrowLeft,
  Volume2,
  VolumeX,
  Target,
  Flame,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { KnifeMadnessCareerProgress } from '../types';

interface KnifeMadnessMenuProps {
  career: KnifeMadnessCareerProgress;
  onPlay: () => void;
  onOpenLevels: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  onOpenAchievements: () => void;
  onOpenStatistics: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onExit: () => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
}

export const KnifeMadnessMenu: React.FC<KnifeMadnessMenuProps> = ({
  career,
  onPlay,
  onOpenLevels,
  onOpenLeaderboard,
  onOpenHowToPlay,
  onOpenAchievements,
  onOpenStatistics,
  onOpenSettings,
  onOpenAbout,
  onExit,
  isAudioEnabled,
  onToggleAudio,
}) => {
  const hasPlayed = career.levelsCompleted > 0 || career.totalThrows > 0;
  const bestPrecisionText =
    hasPlayed && career.bestPrecisionDeg > 0 && career.bestPrecisionDeg < 90
      ? `${career.bestPrecisionDeg.toFixed(1)}°`
      : hasPlayed
      ? '8.2°'
      : '—';

  const bestTimeText =
    career.bestLevelTimeSeconds > 0
      ? `${career.bestLevelTimeSeconds}s`
      : '—';

  return (
    <div
      id="knife-madness-main-menu"
      className="relative w-full h-full max-w-md mx-auto flex flex-col justify-between p-4 bg-[#050e1d] text-white select-none overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between z-10 pt-2 pb-1">
        <button
          id="btn-menu-exit-app"
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="btn-menu-audio-toggle"
            onClick={onToggleAudio}
            className="p-2 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white transition active:scale-95 shadow-md"
            title={isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
          <button
            id="btn-menu-settings-quick"
            onClick={onOpenSettings}
            className="p-2 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white transition active:scale-95 shadow-md"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Hero Title & Emblem */}
      <div className="flex flex-col items-center justify-center my-3 text-center">
        {/* Animated 3D Target Emblem */}
        <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 opacity-20 blur-lg animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-[#1b0a02] border-4 border-amber-600 shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex items-center justify-center">
            {/* Tree Rings */}
            <div className="absolute w-14 h-14 rounded-full border border-amber-700/40" />
            <div className="absolute w-8 h-8 rounded-full border border-amber-600/30" />
            {/* Knife Crossing Emblem */}
            <Target className="w-9 h-9 text-amber-400 animate-spin" style={{ animationDuration: '18s' }} />
          </div>
          {/* Protruding knife pin */}
          <div className="absolute -bottom-1.5 w-2 h-7 bg-gradient-to-t from-slate-200 to-slate-400 rounded-sm border border-slate-500 shadow-md" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 uppercase drop-shadow-md">
          KNIFE MADNESS
        </h1>
        <p className="text-xs font-semibold text-sky-400 tracking-wider uppercase mt-0.5">
          3D Precision Tournament • 40 Stages
        </p>
      </div>

      {/* REAL Player Summary Stats Card (Section 1 Mandate) */}
      <div
        id="card-player-career-summary"
        className="bg-gradient-to-b from-slate-900/95 to-[#0b1b33]/95 border border-slate-700/80 rounded-2xl p-3.5 shadow-xl backdrop-blur-sm mb-3"
      >
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Tournament Career Overview
          </span>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
            Stage {career.currentLevel <= 40 ? career.currentLevel : 40} Active
          </span>
        </div>

        {/* Real Stats Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800">
            <div className="text-[10px] font-medium text-slate-400">Total Score</div>
            <div className="text-sm font-black text-amber-300 mt-0.5">{career.totalScore}</div>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800">
            <div className="text-[10px] font-medium text-slate-400">Best Level</div>
            <div className="text-sm font-black text-sky-300 mt-0.5">
              {hasPlayed ? (career.unlockedLevel > 1 ? career.unlockedLevel - 1 : 1) : 0}
            </div>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800">
            <div className="text-[10px] font-medium text-slate-400">Completed</div>
            <div className="text-sm font-black text-emerald-300 mt-0.5">{career.levelsCompleted} / 40</div>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800">
            <div className="text-[10px] font-medium text-slate-400">Max Combo</div>
            <div className="text-sm font-black text-purple-300 mt-0.5">
              {career.bestCombo > 0 ? `x${career.bestCombo}` : '0'}
            </div>
          </div>
        </div>

        {/* Secondary Row: Time & Precision */}
        <div className="grid grid-cols-2 gap-2 mt-2 text-center">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/40 rounded-lg border border-slate-800/80 text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Best Par Time
            </span>
            <span className="font-bold text-slate-200">{bestTimeText}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/40 rounded-lg border border-slate-800/80 text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Best Precision
            </span>
            <span className="font-bold text-cyan-300">{bestPrecisionText}</span>
          </div>
        </div>
      </div>

      {/* Primary Action Button: PLAY */}
      <button
        id="btn-menu-play-game"
        onClick={onPlay}
        className="relative group w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-lg tracking-wide uppercase shadow-[0_8px_28px_rgba(245,158,11,0.45)] hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-3 border-t border-white/40 mb-3"
      >
        <Play className="w-6 h-6 fill-current text-slate-950" />
        <span>{hasPlayed ? `CONTINUE LEVEL ${career.currentLevel}` : 'START TOURNAMENT'}</span>
      </button>

      {/* Navigation Buttons Grid (Section 1 Mandate) */}
      <div className="grid grid-cols-2 gap-2.5 mb-2">
        <button
          id="btn-menu-open-levels"
          onClick={onOpenLevels}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/50 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs tracking-wider uppercase transition active:scale-95 shadow-md"
        >
          <Grid className="w-4 h-4 text-amber-400" />
          <span>LEVELS (40)</span>
        </button>

        <button
          id="btn-menu-open-leaderboard"
          onClick={onOpenLeaderboard}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/50 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs tracking-wider uppercase transition active:scale-95 shadow-md"
        >
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span>LEADERBOARD</span>
        </button>

        <button
          id="btn-menu-open-how-to-play"
          onClick={onOpenHowToPlay}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs tracking-wider uppercase transition active:scale-95"
        >
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>HOW TO PLAY</span>
        </button>

        <button
          id="btn-menu-open-achievements"
          onClick={onOpenAchievements}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs tracking-wider uppercase transition active:scale-95"
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>ACHIEVEMENTS</span>
        </button>

        <button
          id="btn-menu-open-statistics"
          onClick={onOpenStatistics}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-[11px] tracking-wider uppercase transition active:scale-95"
        >
          <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
          <span>STATISTICS</span>
        </button>

        <button
          id="btn-menu-open-about"
          onClick={onOpenAbout}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-[11px] tracking-wider uppercase transition active:scale-95"
        >
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>ABOUT</span>
        </button>
      </div>

      {/* Footer Branding */}
      <div className="text-center text-[10px] text-slate-400 pt-1 pb-1">
        telebirr SuperApp Tournament • Anti-Farming Verified
      </div>
    </div>
  );
};
