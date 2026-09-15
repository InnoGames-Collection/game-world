import React, { useMemo } from 'react';
import { ArrowLeft, BarChart2, Target, Clock, Flame, Trophy, Award, Zap, Music } from 'lucide-react';
import { PopPianoProgress, LevelSaveData } from '../types';

interface PopPianoStatisticsProps {
  progress: PopPianoProgress;
  onBack: () => void;
}

export const PopPianoStatistics: React.FC<PopPianoStatisticsProps> = ({
  progress,
  onBack,
}) => {
  const stats = progress.stats;
  const completedEntries = Object.entries(progress.completedLevels || {}) as Array<[string, LevelSaveData]>;
  const levelsCompletedCount = completedEntries.length;

  const computedAverages = useMemo(() => {
    if (levelsCompletedCount === 0) {
      return { avgLevelScore: 0, bestLevelScore: 0 };
    }
    let sumScore = 0;
    let best = 0;
    completedEntries.forEach(([, data]) => {
      sumScore += data.highScore || 0;
      if (data.highScore > best) best = data.highScore;
    });
    return {
      avgLevelScore: Math.round(sumScore / levelsCompletedCount),
      bestLevelScore: best,
    };
  }, [completedEntries, levelsCompletedCount]);

  const formatPlayTime = (totalSecs: number): string => {
    if (!totalSecs || totalSecs <= 0) return '0s';
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const statItems = [
    {
      label: 'Cumulative Tournament Score',
      value: `${progress.totalScore.toLocaleString()} PTS`,
      color: 'text-amber-300',
      icon: Trophy,
    },
    {
      label: 'Highest Unlocked Level',
      value: `Level ${progress.highestUnlockedLevel} / 40`,
      color: 'text-cyan-300',
      icon: Zap,
    },
    {
      label: 'Levels Completed',
      value: `${levelsCompletedCount} / 40`,
      color: 'text-emerald-300',
      icon: Award,
    },
    {
      label: 'Total Black Tiles Pressed',
      value: stats.totalBlackTilesPressed.toLocaleString(),
      color: 'text-white',
      icon: Music,
    },
    {
      label: 'Total Misses & Mistakes',
      value: stats.totalMisses.toLocaleString(),
      color: 'text-rose-400',
      icon: Target,
    },
    {
      label: 'Overall Career Accuracy',
      value: `${stats.overallAccuracy}%`,
      color: 'text-emerald-300',
      icon: Target,
    },
    {
      label: 'Personal Best Accuracy',
      value: stats.bestAccuracy > 0 ? `${stats.bestAccuracy}%` : '--',
      color: 'text-teal-300',
      icon: Target,
    },
    {
      label: 'Average Reaction Time',
      value: stats.averageReactionTimeMs > 0 ? `${stats.averageReactionTimeMs}ms` : '--',
      color: 'text-blue-300',
      icon: Clock,
    },
    {
      label: 'Best Reaction Time',
      value: stats.bestReactionTimeMs > 0 ? `${stats.bestReactionTimeMs}ms` : '--',
      color: 'text-cyan-300',
      icon: Clock,
    },
    {
      label: 'Highest Consecutive Combo',
      value: stats.bestCombo > 0 ? `${stats.bestCombo}x` : '0x',
      color: 'text-amber-300',
      icon: Flame,
    },
    {
      label: 'Total Play Time',
      value: formatPlayTime(stats.totalPlayTimeSeconds),
      color: 'text-purple-300',
      icon: Clock,
    },
    {
      label: 'Best Single Level Score',
      value: computedAverages.bestLevelScore > 0 ? `${computedAverages.bestLevelScore} pts` : '--',
      color: 'text-amber-400',
      icon: Trophy,
    },
    {
      label: 'Average Level Score',
      value: computedAverages.avgLevelScore > 0 ? `${computedAverages.avgLevelScore} pts` : '--',
      color: 'text-slate-200',
      icon: BarChart2,
    },
  ];

  return (
    <div
      id="pop-piano-statistics-view"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white overflow-y-auto custom-scrollbar"
    >
      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-[#0B132B]/90 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Menu"
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
            Player Statistics
          </h2>
          <p className="text-[11px] text-cyan-300 font-bold uppercase tracking-widest">
            Lifetime Career Telemetry
          </p>
        </div>

        <div className="w-11" />
      </header>

      {/* STATS TILES GRID */}
      <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl mx-auto w-full">
        {statItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs text-slate-300 font-medium">
                  {item.label}
                </span>
              </div>
              <div className={`text-sm font-black font-mono ${item.color}`}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
