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
  Sparkles,
} from 'lucide-react';
import { EmojiSortingPlayerProgress } from '../types';

interface EmojiSortingMenuModalProps {
  progress: EmojiSortingPlayerProgress;
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

export const EmojiSortingMenuModal: React.FC<EmojiSortingMenuModalProps> = ({
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

  const bestMovesValues = Object.values(progress.bestMoves || {}) as number[];
  const bestMoves = bestMovesValues.length > 0 ? Math.min(...bestMovesValues) : '--';

  const bestTimeValues = Object.values(progress.levelBestTimes || {}) as number[];
  const bestTime = bestTimeValues.length > 0 ? `${Math.min(...bestTimeValues)}s` : '--';

  return (
    <div
      className="fixed inset-0 z-50 text-slate-800 flex flex-col justify-start items-center overflow-y-auto select-none p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]"
      style={{
        background: `
          radial-gradient(circle at 15% 15%, #FFE8E8 0%, transparent 45%),
          radial-gradient(circle at 85% 18%, #E8F6FF 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, #F7EFFF 0%, transparent 55%),
          radial-gradient(circle at 20% 85%, #E7F9F3 0%, transparent 50%),
          radial-gradient(circle at 80% 85%, #FFE8E8 0%, transparent 45%),
          #FAF7FD
        `,
      }}
    >
      {/* Background Decorative Low-Contrast Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[540px] h-[540px] bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Very faint decorative emoji silhouettes */}
        <span className="absolute top-[8%] left-[8%] text-7xl opacity-[0.045] blur-[0.5px]">😀</span>
        <span className="absolute top-[12%] right-[10%] text-7xl opacity-[0.045] blur-[0.5px]">😍</span>
        <span className="absolute top-[48%] left-[4%] text-8xl opacity-[0.04] blur-[0.5px]">⭐</span>
        <span className="absolute top-[52%] right-[5%] text-8xl opacity-[0.04] blur-[0.5px]">🥳</span>
        <span className="absolute bottom-[10%] left-[12%] text-7xl opacity-[0.045] blur-[0.5px]">🐱</span>
        <span className="absolute bottom-[8%] right-[12%] text-7xl opacity-[0.045] blur-[0.5px]">🔥</span>
      </div>

      <div className="relative w-full max-w-md mx-auto my-auto flex flex-col items-center space-y-4 sm:space-y-5 z-10 py-4">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100/80 border border-violet-200 text-violet-700 text-xs font-bold tracking-wide uppercase shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 fill-violet-600" />
          <span>3D Emoji Tournament Puzzle</span>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase drop-shadow-xs flex items-center justify-center gap-2">
            <span>EMOJI</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500">
              SORTING BALL
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xs mx-auto font-medium leading-relaxed">
            Sort stylized 3D emojis into jewel-tinted glass cylinders. Plan every move and master all 40 levels.
          </p>
        </div>

        {/* Player Summary Stats Card */}
        <div className="w-full rounded-2xl bg-white/90 border border-purple-100/90 p-3.5 sm:p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Career Summary
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-600 font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>40 Championship Levels</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-2">
              <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Unlocked</span>
              <span className="text-base sm:text-lg font-black text-violet-700">
                Lvl {currentLvl}
              </span>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2">
              <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cleared</span>
              <span className="text-base sm:text-lg font-black text-emerald-700">
                {completedCount}/40
              </span>
            </div>
            <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-2">
              <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Best Lvl Pts</span>
              <span className="text-base sm:text-lg font-black text-amber-700">
                {bestLevelScore.toLocaleString()}
              </span>
            </div>
            <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-2">
              <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Pts</span>
              <span className="text-base sm:text-lg font-black text-sky-700">
                {totalCumulativeScore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Big Action Play Button */}
        <button
          onClick={onPlay}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-black text-lg tracking-wide uppercase shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-violet-300/30 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-white" />
          </div>
          <span>{completedCount === 0 ? 'START LEVEL 1' : `CONTINUE LEVEL ${currentLvl}`}</span>
        </button>

        {/* Secondary Grid Navigation */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          <button
            onClick={onOpenLevels}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/85 hover:bg-white border border-purple-100 shadow-xs active:scale-95 transition-all text-center group cursor-pointer"
          >
            <Grid className="w-5 h-5 text-violet-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">Level Select</span>
            <span className="text-[10px] text-slate-500">40 Levels</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/85 hover:bg-white border border-amber-100 shadow-xs active:scale-95 transition-all text-center group cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-amber-500 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">Leaderboard</span>
            <span className="text-[10px] text-slate-500">Rankings</span>
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/85 hover:bg-white border border-sky-100 shadow-xs active:scale-95 transition-all text-center group cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 text-sky-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">How to Play</span>
            <span className="text-[10px] text-slate-500">Rules & Strategy</span>
          </button>

          <button
            onClick={onOpenAchievements}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/85 hover:bg-white border border-pink-100 shadow-xs active:scale-95 transition-all text-center group cursor-pointer"
          >
            <Award className="w-5 h-5 text-pink-500 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">Awards</span>
            <span className="text-[10px] text-slate-500">Badges</span>
          </button>
        </div>

        {/* Tertiary Utility Buttons */}
        <div className="w-full grid grid-cols-4 gap-2">
          <button
            onClick={onOpenStatistics}
            className="py-2.5 px-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center text-slate-700 transition-all cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 mb-1 text-slate-500" />
            <span className="text-[10px] font-semibold">Stats</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="py-2.5 px-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center text-slate-700 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 mb-1 text-slate-500" />
            <span className="text-[10px] font-semibold">Audio</span>
          </button>

          <button
            onClick={onOpenAbout}
            className="py-2.5 px-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center text-slate-700 transition-all cursor-pointer"
          >
            <Info className="w-4 h-4 mb-1 text-slate-500" />
            <span className="text-[10px] font-semibold">About</span>
          </button>

          <button
            onClick={onExit}
            className="py-2.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-xs flex flex-col items-center text-center text-rose-700 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 mb-1 text-rose-500" />
            <span className="text-[10px] font-semibold">Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
