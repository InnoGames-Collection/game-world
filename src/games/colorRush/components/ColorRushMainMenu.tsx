/**
 * Color Rush - Pre-Game Championship Main Menu
 * 
 * Top Bar: Logo, Avatar, Career Total Score, Current Level, Best Score, Settings
 * Center: Hero PLAY CTA with pulsing glow, Level progress, Level Best
 * Grid: Levels, Leaderboard, My Stats, Achievements, Daily Challenge, Settings
 */

import React from 'react';
import { 
  Play, 
  Layers, 
  Trophy, 
  BarChart3, 
  Award, 
  Calendar, 
  Settings as SettingsIcon, 
  Zap, 
  Target, 
  ArrowLeft,
  Flame,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { ColorRushProgression, ColorRushScreenState } from '../types';
import { getLevelConfig, getDifficultyBadgeColor, TOTAL_COLOR_RUSH_LEVELS } from '../levels';
import { ColorRushAudio } from '../colorRushAudio';

interface ColorRushMainMenuProps {
  progression: ColorRushProgression;
  playerName: string;
  playerAvatar: string;
  onNavigate: (screen: ColorRushScreenState) => void;
  onStartLevel: (level: number) => void;
  onExit: () => void;
}

export const ColorRushMainMenu: React.FC<ColorRushMainMenuProps> = ({
  progression,
  playerName,
  playerAvatar,
  onNavigate,
  onStartLevel,
  onExit,
}) => {
  const currentLevelConfig = getLevelConfig(progression.currentUnlockedLevel);
  const currentLevelBest = progression.levelBestScores[progression.currentUnlockedLevel] || 0;
  const badgeStyle = getDifficultyBadgeColor(currentLevelConfig.difficulty);

  const completedCount = Object.keys(progression.levelBestScores).length;
  const progressPercent = Math.round((completedCount / TOTAL_COLOR_RUSH_LEVELS) * 100);

  const handlePlayHero = () => {
    ColorRushAudio.playTap();
    onStartLevel(progression.currentUnlockedLevel);
  };

  return (
    <div 
      className="relative w-full max-w-md mx-auto flex flex-col items-center select-none rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl min-h-[640px] font-['Plus_Jakarta_Sans',sans-serif] text-slate-100"
      style={{
        background: 'radial-gradient(circle at 50% 15%, #0a254d 0%, #03142e 50%, #010917 100%)',
      }}
    >
      {/* Dynamic Cyber Glow Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35 z-0">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-cyan-500/25 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-12 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-12 right-0 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.25) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* TOP BAR: Logo, Avatar, Cumulative Career Score, Current Level, Best Score, Settings */}
      <div 
        id="color-rush-menu-header"
        className="w-full bg-[#051c3d]/90 backdrop-blur-md px-3.5 py-3 border-b border-[#0e3b75] flex items-center justify-between gap-2 z-20 shadow-md shrink-0"
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            id="color-rush-menu-exit"
            onClick={onExit}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700 flex items-center justify-center text-slate-300 transition-all cursor-pointer shrink-0"
            title="Exit to Portal"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          {/* Avatar & Player Profile summary */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 border border-cyan-400/40 flex items-center justify-center text-base shadow-sm shrink-0">
              {playerAvatar || '⚡'}
            </div>
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-[11px] font-black text-white truncate max-w-[110px]">
                {playerName || 'Player'}
              </span>
              <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">
                Rank #{Math.max(1, 14850 - Math.min(14840, Math.round(progression.totalCumulativeScore * 1.8)))}
              </span>
            </div>
          </div>
        </div>

        {/* Career Cumulative Score Pill */}
        <div className="flex items-center gap-1.5">
          <div 
            className="flex flex-col items-end px-2.5 py-1 rounded-xl bg-gradient-to-b from-[#0a2e5c]/90 to-[#031b38] border border-cyan-500/30 shadow-xs"
            title="Total Career Score (Cumulative Best of Completed Levels)"
          >
            <span className="text-[8px] font-black text-cyan-300 uppercase tracking-widest leading-none">
              CAREER PTS
            </span>
            <span className="text-sm font-black font-mono text-white leading-tight tabular-nums">
              {progression.totalCumulativeScore.toLocaleString()}
            </span>
          </div>

          {/* Quick Settings Icon */}
          <button
            id="color-rush-quick-settings-btn"
            onClick={() => {
              ColorRushAudio.playTap();
              onNavigate('SETTINGS');
            }}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700 flex items-center justify-center text-slate-300 transition-all cursor-pointer shrink-0"
            title="Game Settings"
          >
            <SettingsIcon className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* SCROLLABLE MAIN CONTENT AREA */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-start p-4 z-10 overflow-y-auto space-y-4">
        
        {/* BRAND IDENTITY BANNER */}
        <div className="flex flex-col items-center text-center pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-black uppercase tracking-widest mb-1 shadow-sm">
            <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400" />
            <span>Competitive Reaction Championship</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 drop-shadow-sm">
            COLOR RUSH
          </h1>
        </div>

        {/* HERO CARD: CURRENT LEVEL & LARGE PLAY BUTTON */}
        <div 
          className="w-full rounded-2xl bg-gradient-to-b from-[#092b57]/90 via-[#051c3d]/90 to-[#021026] border-2 border-cyan-500/50 p-4 shadow-xl flex flex-col items-center relative overflow-hidden"
          style={{ boxShadow: '0 8px 30px rgba(0, 240, 255, 0.15)' }}
        >
          {/* Subtle glossy sheen overlay */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-2xl" />

          {/* Level Header Header */}
          <div className="w-full flex items-center justify-between mb-2 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                Current Challenge
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                {currentLevelConfig.difficulty}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-300 font-bold">
              Level {progression.currentUnlockedLevel}/{TOTAL_COLOR_RUSH_LEVELS}
            </div>
          </div>

          <div className="text-lg sm:text-xl font-black text-white tracking-tight mb-1 text-center z-10">
            {currentLevelConfig.title}
          </div>

          {/* Metric Sub-Chips: Best Score & Config Details */}
          <div className="flex items-center gap-2.5 mb-4 text-center z-10">
            <div className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-medium text-slate-300">
              Best: <span className="text-amber-400 font-black font-mono">{currentLevelBest > 0 ? `${currentLevelBest} PTS` : 'None'}</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-medium text-slate-300">
              Rounds: <span className="text-cyan-400 font-black font-mono">{currentLevelConfig.rounds}</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-medium text-slate-300">
              Colors: <span className="text-emerald-400 font-black font-mono">{currentLevelConfig.optionCount}</span>
            </div>
          </div>

          {/* MASSIVE HERO PLAY BUTTON */}
          <button
            id="color-rush-hero-play-btn"
            onClick={handlePlayHero}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#10B981] via-[#00F0FF] to-[#0070F3] hover:brightness-110 active:scale-[0.98] text-slate-950 font-black text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer relative group overflow-hidden border-t border-white/40"
            style={{
              boxShadow: '0 0 25px rgba(0, 240, 255, 0.4), inset 0 1px 2px rgba(255,255,255,0.4)',
            }}
          >
            <div className="w-8 h-8 rounded-full bg-slate-950/20 flex items-center justify-center text-slate-950">
              <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
            </div>
            <span className="text-lg tracking-wide drop-shadow-xs font-black">
              PLAY LEVEL {progression.currentUnlockedLevel}
            </span>
          </button>

          {/* Campaign Overall Progress Bar */}
          <div className="w-full mt-3 flex flex-col gap-1 z-10">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>Overall Campaign Progress</span>
              <span className="text-cyan-400 font-mono">{completedCount}/{TOTAL_COLOR_RUSH_LEVELS} Completed ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* SECONDARY MENU NAVIGATION TILES */}
        <div className="w-full grid grid-cols-2 gap-2.5">
          
          {/* TILE 1: LEVELS (Locked Progression Map) */}
          <button
            id="color-rush-menu-levels-btn"
            onClick={() => {
              ColorRushAudio.playTap();
              onNavigate('LEVEL_SELECT');
            }}
            className="p-3 rounded-2xl bg-gradient-to-b from-[#0a2347] to-[#04152e] hover:from-[#0f305f] hover:to-[#071c3b] border border-cyan-500/30 text-left transition-all active:scale-[0.98] cursor-pointer shadow-md group flex flex-col justify-between min-h-[90px]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black font-mono text-cyan-300">
                40 LVLS
              </span>
            </div>
            <div>
              <div className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                Levels Map
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Locked progression
              </div>
            </div>
          </button>

          {/* TILE 2: LEADERBOARD (Global, Weekly, Monthly, My Rank) */}
          <button
            id="color-rush-menu-leaderboard-btn"
            onClick={() => {
              ColorRushAudio.playTap();
              onNavigate('LEADERBOARD');
            }}
            className="p-3 rounded-2xl bg-gradient-to-b from-[#0a2347] to-[#04152e] hover:from-[#0f305f] hover:to-[#071c3b] border border-amber-500/30 text-left transition-all active:scale-[0.98] cursor-pointer shadow-md group flex flex-col justify-between min-h-[90px]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-amber-400">
                LIVE
              </span>
            </div>
            <div>
              <div className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                Leaderboard
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Global & Weekly Ranks
              </div>
            </div>
          </button>

          {/* TILE 3: MY STATS (Detailed performance metrics) */}
          <button
            id="color-rush-menu-stats-btn"
            onClick={() => {
              ColorRushAudio.playTap();
              onNavigate('STATS');
            }}
            className="p-3 rounded-2xl bg-gradient-to-b from-[#0a2347] to-[#04152e] hover:from-[#0f305f] hover:to-[#071c3b] border border-blue-500/30 text-left transition-all active:scale-[0.98] cursor-pointer shadow-md group flex flex-col justify-between min-h-[90px]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-blue-300 font-mono">
                {progression.totalCorrectColors} HITS
              </span>
            </div>
            <div>
              <div className="text-sm font-black text-white group-hover:text-blue-300 transition-colors">
                My Stats
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Accuracy & Reaction
              </div>
            </div>
          </button>

          {/* TILE 4: ACHIEVEMENTS (Championship Trophies) */}
          <button
            id="color-rush-menu-achievements-btn"
            onClick={() => {
              ColorRushAudio.playTap();
              onNavigate('ACHIEVEMENTS');
            }}
            className="p-3 rounded-2xl bg-gradient-to-b from-[#0a2347] to-[#04152e] hover:from-[#0f305f] hover:to-[#071c3b] border border-violet-500/30 text-left transition-all active:scale-[0.98] cursor-pointer shadow-md group flex flex-col justify-between min-h-[90px]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-violet-300 font-mono">
                {progression.unlockedAchievements.length}/12
              </span>
            </div>
            <div>
              <div className="text-sm font-black text-white group-hover:text-violet-300 transition-colors">
                Achievements
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Badges & Trophies
              </div>
            </div>
          </button>

          {/* TILE 5: DAILY CHALLENGE (Chroma Blitz mode) */}
          <button
            id="color-rush-menu-daily-btn"
            onClick={() => {
              ColorRushAudio.playTap();
              onNavigate('DAILY_CHALLENGE');
            }}
            className="col-span-2 p-3 rounded-2xl bg-gradient-to-r from-[#172554] via-[#1e1b4b] to-[#0f172a] hover:brightness-110 border border-emerald-500/40 text-left transition-all active:scale-[0.98] cursor-pointer shadow-md group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                    Daily Challenge
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase">
                    TODAY
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 font-medium">
                  {progression.dailyChallenge?.completed 
                    ? `✓ Completed • ${progression.dailyChallenge.score} PTS` 
                    : 'Chroma Blitz: 12 rapid rounds for bonus trophies'}
                </div>
              </div>
            </div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <span>Enter</span>
              <Play className="w-3 h-3 fill-emerald-400" />
            </div>
          </button>
        </div>

        {/* BOTTOM METRIC SUMMARY BAR */}
        <div className="w-full flex items-center justify-around py-2.5 px-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase">Max Streak</div>
            <div className="text-xs font-black text-amber-400 font-mono">{progression.highestStreak}x</div>
          </div>
          <div className="h-6 w-[1px] bg-slate-800" />
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase">Perfect Levels</div>
            <div className="text-xs font-black text-emerald-400 font-mono">{progression.perfectLevelsCount}</div>
          </div>
          <div className="h-6 w-[1px] bg-slate-800" />
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase">Avg Reaction</div>
            <div className="text-xs font-black text-cyan-400 font-mono">
              {progression.reactionCount > 0 
                ? `${Math.round(progression.totalReactionTimeMs / progression.reactionCount)}ms` 
                : '—'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
