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
  LogOut,
  Star,
  Zap,
  Flame,
} from 'lucide-react';
import { SortingPlayerProgress } from '../types';

interface SortingMenuModalProps {
  progress: SortingPlayerProgress;
  onPlay: () => void;
  onOpenLevels: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  onOpenAchievements: () => void;
  onOpenStatistics: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onExit: () => void;
}

export const SortingMenuModal: React.FC<SortingMenuModalProps> = ({
  progress,
  onPlay,
  onOpenLevels,
  onOpenLeaderboard,
  onOpenHowToPlay,
  onOpenAchievements,
  onOpenStatistics,
  onOpenSettings,
  onOpenAbout,
  onExit,
}) => {
  const currentLvl = progress.unlockedLevel || 1;
  const completedCount = progress.completedLevels?.length || 0;
  const bestLevelScore = progress.highScore || 0;
  const totalCumulativeScore = progress.totalCumulativeScore || 0;

  // Best moves across any level
  const bestMovesValues = (Object.values(progress.bestMoves || {}) as number[]);
  const bestMoves = bestMovesValues.length > 0 ? Math.min(...bestMovesValues) : '--';

  // Best time across any level
  const bestTimeValues = (Object.values(progress.levelBestTimes || {}) as number[]);
  const bestTime =
    bestTimeValues.length > 0
      ? `${Math.min(...bestTimeValues)}s`
      : '--';

  return (
    <div className="fixed inset-0 z-50 bg-[#070b16] text-white flex flex-col justify-start items-center overflow-y-auto select-none p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Ambient Aura */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative w-full max-w-md mx-auto my-auto flex flex-col items-center space-y-4 sm:space-y-5 z-10 py-4">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 text-xs font-bold tracking-wide uppercase shadow-sm">
          <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
          <span>Strategic 3D Puzzle</span>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-sm flex items-center justify-center gap-2">
            <span>SORTING</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              BALL
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto font-medium leading-relaxed">
            Sort the balls, plan every move and complete each level with the highest possible score.
          </p>
        </div>

        {/* Player Summary Stats Card (Real Stored Data) */}
        <div className="w-full rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 sm:p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Career Summary
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>40 Levels</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            {/* Current Level */}
            <div className="p-2 rounded-xl bg-black/30 border border-white/5">
              <span className="block text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">
                Current
              </span>
              <span className="text-base font-black text-cyan-400">
                Lvl {currentLvl}
              </span>
            </div>

            {/* Total Cumulative Score */}
            <div className="p-2 rounded-xl bg-black/30 border border-white/5">
              <span className="block text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">
                Total Score
              </span>
              <span className="text-base font-black text-amber-300">
                {totalCumulativeScore.toLocaleString()}
              </span>
            </div>

            {/* Best Score */}
            <div className="p-2 rounded-xl bg-black/30 border border-white/5">
              <span className="block text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">
                Best Score
              </span>
              <span className="text-base font-black text-emerald-400">
                {bestLevelScore.toLocaleString()}
              </span>
            </div>

            {/* Levels Completed */}
            <div className="p-2 rounded-xl bg-black/30 border border-white/5">
              <span className="block text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">
                Cleared
              </span>
              <span className="text-sm font-bold text-white">
                {completedCount} / 40
              </span>
            </div>

            {/* Best Moves */}
            <div className="p-2 rounded-xl bg-black/30 border border-white/5">
              <span className="block text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">
                Best Moves
              </span>
              <span className="text-sm font-bold text-white">
                {bestMoves}
              </span>
            </div>

            {/* Best Time */}
            <div className="p-2 rounded-xl bg-black/30 border border-white/5">
              <span className="block text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">
                Best Time
              </span>
              <span className="text-sm font-bold text-white">
                {bestTime}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Call to Action: PLAY BUTTON */}
        <button
          onClick={onPlay}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] text-white font-black text-base uppercase tracking-wider shadow-[0_8px_25px_rgba(6,182,212,0.4)] border border-white/30 flex items-center justify-center gap-3 transition-all cursor-pointer group"
        >
          <Play className="w-6 h-6 fill-white stroke-none group-hover:scale-110 transition-transform" />
          <span>PLAY LEVEL {currentLvl}</span>
        </button>

        {/* Secondary Navigation Buttons Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5">
          {/* Levels */}
          <button
            onClick={onOpenLevels}
            className="py-3 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/10 flex items-center justify-center gap-2 shadow-sm"
          >
            <Grid className="w-4 h-4 text-cyan-400" />
            <span>LEVELS</span>
          </button>

          {/* Leaderboard */}
          <button
            onClick={onOpenLeaderboard}
            className="py-3 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/10 flex items-center justify-center gap-2 shadow-sm"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>LEADERBOARD</span>
          </button>

          {/* How to Play */}
          <button
            onClick={onOpenHowToPlay}
            className="py-3 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/10 flex items-center justify-center gap-2 shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>HOW TO PLAY</span>
          </button>

          {/* Achievements */}
          <button
            onClick={onOpenAchievements}
            className="py-3 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/10 flex items-center justify-center gap-2 shadow-sm"
          >
            <Award className="w-4 h-4 text-purple-400" />
            <span>ACHIEVEMENTS</span>
          </button>

          {/* Statistics */}
          <button
            onClick={onOpenStatistics}
            className="py-3 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/10 flex items-center justify-center gap-2 shadow-sm"
          >
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>STATISTICS</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="py-3 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/10 flex items-center justify-center gap-2 shadow-sm"
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span>SETTINGS</span>
          </button>
        </div>

        {/* Utility Buttons: About & Exit */}
        <div className="w-full flex items-center justify-between pt-1">
          <button
            onClick={onOpenAbout}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>ABOUT</span>
          </button>

          <button
            onClick={onExit}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>EXIT GAME</span>
          </button>
        </div>
      </div>
    </div>
  );
};
