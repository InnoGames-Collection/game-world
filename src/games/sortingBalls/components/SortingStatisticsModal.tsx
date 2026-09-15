import React from 'react';
import { BarChart3, X, CheckCircle, Clock, Zap, Undo, HelpCircle, PlusCircle, Trophy } from 'lucide-react';
import { SortingPlayerProgress } from '../types';

interface SortingStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: SortingPlayerProgress;
}

export const SortingStatisticsModal: React.FC<SortingStatisticsModalProps> = ({
  isOpen,
  onClose,
  progress,
}) => {
  if (!isOpen) return null;

  const completedCount = progress.completedLevels?.length || 0;
  const bestMovesValues = (Object.values(progress.bestMoves || {}) as number[]);
  const bestMoves = bestMovesValues.length > 0 ? Math.min(...bestMovesValues) : '--';

  const bestTimesValues = (Object.values(progress.levelBestTimes || {}) as number[]);
  const bestTime =
    bestTimesValues.length > 0 ? `${Math.min(...bestTimesValues)}s` : '--';

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
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      color: 'border-cyan-500/20 bg-cyan-500/5',
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
    <div className="fixed inset-0 z-50 bg-[#070b16]/95 backdrop-blur-md flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-lg mx-auto space-y-4 pb-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                STATISTICS
              </h2>
              <p className="text-xs text-slate-400">
                Detailed Sorting Ball Career Metrics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            aria-label="Close Statistics"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border ${item.color} flex items-center justify-between`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-xs font-semibold text-slate-300">
                  {item.label}
                </span>
              </div>
              <span className="text-sm font-black font-mono text-white">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
