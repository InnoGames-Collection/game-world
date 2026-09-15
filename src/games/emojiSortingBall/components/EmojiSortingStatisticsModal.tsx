import React from 'react';
import { BarChart3, X, CheckCircle, Clock, Zap, Undo, HelpCircle, PlusCircle, Trophy } from 'lucide-react';
import { EmojiSortingPlayerProgress } from '../types';

interface EmojiSortingStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: EmojiSortingPlayerProgress;
}

export const EmojiSortingStatisticsModal: React.FC<EmojiSortingStatisticsModalProps> = ({
  isOpen,
  onClose,
  progress,
}) => {
  if (!isOpen) return null;

  const completedCount = progress.completedLevels?.length || 0;
  const bestMovesValues = Object.values(progress.bestMoves || {}) as number[];
  const bestMoves = bestMovesValues.length > 0 ? Math.min(...bestMovesValues) : '--';

  const bestTimesValues = Object.values(progress.levelBestTimes || {}) as number[];
  const bestTime = bestTimesValues.length > 0 ? `${Math.min(...bestTimesValues)}s` : '--';

  const stats = [
    {
      label: 'Levels Completed',
      value: `${completedCount} / 40`,
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/20 bg-emerald-500/5',
    },
    {
      label: 'Total Cumulative Score',
      value: (progress.totalCumulativeScore || 0).toLocaleString(),
      icon: <Trophy className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/20 bg-amber-500/5',
    },
    {
      label: 'Highest Single Level Score',
      value: (progress.highScore || 0).toLocaleString(),
      icon: <Zap className="w-4 h-4 text-violet-400" />,
      color: 'border-violet-500/20 bg-violet-500/5',
    },
    {
      label: 'Total Games Played',
      value: progress.stats?.gamesPlayed || completedCount,
      icon: <BarChart3 className="w-4 h-4 text-blue-400" />,
      color: 'border-blue-500/20 bg-blue-500/5',
    },
    {
      label: 'Best Move Count',
      value: bestMoves,
      icon: <Zap className="w-4 h-4 text-purple-400" />,
      color: 'border-purple-500/20 bg-purple-500/5',
    },
    {
      label: 'Best Completion Time',
      value: bestTime,
      icon: <Clock className="w-4 h-4 text-sky-400" />,
      color: 'border-sky-500/20 bg-sky-500/5',
    },
    {
      label: 'Total Undos Used',
      value: progress.stats?.totalUndosUsed || 0,
      icon: <Undo className="w-4 h-4 text-slate-400" />,
      color: 'border-white/10 bg-white/5',
    },
    {
      label: 'Total Hints Used',
      value: progress.stats?.totalHintsUsed || 0,
      icon: <HelpCircle className="w-4 h-4 text-rose-400" />,
      color: 'border-rose-500/20 bg-rose-500/5',
    },
    {
      label: 'Total Extra Tubes Used',
      value: progress.stats?.totalExtraTubesUsed || 0,
      icon: <PlusCircle className="w-4 h-4 text-amber-500" />,
      color: 'border-amber-500/20 bg-amber-500/5',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif] text-slate-800"
      style={{
        background: `
          radial-gradient(circle at 18% 12%, #FFE8E8 0%, transparent 48%),
          radial-gradient(circle at 82% 16%, #E8F6FF 0%, transparent 45%),
          radial-gradient(circle at 50% 45%, #F7EFFF 0%, transparent 60%),
          radial-gradient(circle at 15% 85%, #E7F9F3 0%, transparent 50%),
          radial-gradient(circle at 85% 88%, #FFE8E8 0%, transparent 45%),
          #FAF7FD
        `,
      }}
    >
      <div className="w-full max-w-lg mx-auto space-y-4 pb-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                STATISTICS
              </h2>
              <p className="text-xs text-slate-500">
                Detailed Emoji Sorting Ball Career Metrics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border border-purple-100 shadow-xs"
            aria-label="Close Statistics"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 9 Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col justify-between shadow-xs bg-white/95 border-purple-100`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  {s.label}
                </span>
                {s.icon}
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
