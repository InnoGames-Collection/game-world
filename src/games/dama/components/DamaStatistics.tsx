import React from 'react';
import {
  ArrowLeft,
  BarChart3,
  Trophy,
  Flame,
  Clock,
  Swords,
  Crown,
  Target,
  Percent,
  CheckCircle2,
} from 'lucide-react';
import { DamaProgress, DamaLevelSaveData } from '../types';

interface DamaStatisticsProps {
  progress: DamaProgress;
  onBack: () => void;
}

export const DamaStatistics: React.FC<DamaStatisticsProps> = ({
  progress,
  onBack,
}) => {
  const completedLevels = Object.values(progress.completedLevels) as DamaLevelSaveData[];
  const completedCount = completedLevels.filter((l) => l.wins > 0).length;
  const totalGames = progress.stats.wins + progress.stats.losses;
  const winRate = totalGames > 0 ? Math.round((progress.stats.wins / totalGames) * 100) : 0;

  // Average level score among cleared levels
  const clearedLevels = completedLevels.filter((l) => l.wins > 0);
  const avgLevelScore =
    clearedLevels.length > 0
      ? Math.round(
          clearedLevels.reduce((acc: number, l: DamaLevelSaveData) => acc + (l.highScore || 0), 0) /
            clearedLevels.length
        )
      : 0;

  // Average time in seconds
  const totalPlayTimeSec = progress.stats.totalPlayTimeSeconds;
  const avgTimePerGame =
    totalGames > 0 ? Math.round(totalPlayTimeSec / totalGames) : 0;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div
      id="dama-statistics-container"
      className="w-full max-w-xl mx-auto flex flex-col h-screen px-3 py-4 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          id="dama-stats-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Menu</span>
        </button>

        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-black text-white uppercase tracking-wide">
            Career Statistics
          </span>
        </div>

        <div className="w-12" />
      </div>

      {/* Grid of Real Stored Statistics */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
        {/* Primary Highlights */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
              Total Score
            </span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {progress.totalScore.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Cumulative Level Bests
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
              Win Rate
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {winRate}%
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {progress.stats.wins}W / {progress.stats.losses}L
            </span>
          </div>
        </div>

        {/* Detailed Stats List */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Highest Unlocked Level</span>
            </span>
            <span className="font-mono font-bold text-white text-xs">
              Level {progress.highestUnlockedLevel} / 40
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Levels Cleared</span>
            </span>
            <span className="font-mono font-bold text-white text-xs">
              {completedCount} Levels
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Best Win Streak</span>
            </span>
            <span className="font-mono font-bold text-amber-400 text-xs">
              {progress.stats.bestWinStreak} Consecutive Wins
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Best Single Level Score</span>
            </span>
            <span className="font-mono font-bold text-amber-300 text-xs">
              {progress.stats.bestLevelScore || 0} pts
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Average Level Score</span>
            </span>
            <span className="font-mono font-bold text-white text-xs">
              {avgLevelScore} pts
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>Total Pieces Captured</span>
            </span>
            <span className="font-mono font-bold text-white text-xs">
              {progress.stats.totalCaptures}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Kings Crowned</span>
            </span>
            <span className="font-mono font-bold text-white text-xs">
              {progress.stats.totalKings}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Total Moves Played</span>
            </span>
            <span className="font-mono font-bold text-white text-xs">
              {progress.stats.totalMoves}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Total Play Time</span>
            </span>
            <span className="font-mono font-bold text-white text-xs">
              {formatTime(totalPlayTimeSec)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Average Match Duration</span>
            </span>
            <span className="font-mono font-bold text-white text-xs">
              {avgTimePerGame > 0 ? `${avgTimePerGame}s` : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
