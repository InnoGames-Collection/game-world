import React, { useMemo } from 'react';
import { ArrowLeft, BarChart2, Zap, Trophy, Star, Flame, Clock, Target, CheckCircle2 } from 'lucide-react';
import { LevelProgress } from '../types';

interface BubbleShooterStatisticsProps {
  progress: LevelProgress;
  onClose: () => void;
}

export const BubbleShooterStatistics: React.FC<BubbleShooterStatisticsProps> = ({
  progress,
  onClose,
}) => {
  const stats = useMemo(() => {
    const completedList = Object.values(progress.completedLevels || {}) as Array<{
      stars: number;
      highScore: number;
    }>;
    const levelsCompleted = completedList.length;
    const totalStars = completedList.reduce((acc, c) => acc + (c.stars || 0), 0);
    const bestLevelScore = completedList.reduce((max, c) => Math.max(max, c.highScore || 0), 0);

    const s = progress.stats || {
      gamesPlayed: levelsCompleted,
      levelsCompleted,
      totalShotsFired: 0,
      totalEffectiveShots: 0,
      totalMissedShots: 0,
      totalBubblesPopped: 0,
      totalBubblesDropped: 0,
      bestCombo: 0,
      bestTimeSeconds: 0,
      perfectLevelsCount: 0,
    };

    const accuracy =
      s.totalShotsFired > 0
        ? Math.round((s.totalEffectiveShots / s.totalShotsFired) * 100)
        : 0;

    return {
      highestLevel: progress.highestUnlockedLevel || 1,
      totalCumulativeScore: progress.totalScore || 0,
      levelsCompleted,
      totalStars,
      bestLevelScore,
      gamesPlayed: s.gamesPlayed,
      totalShotsFired: s.totalShotsFired,
      totalEffectiveShots: s.totalEffectiveShots,
      totalMissedShots: s.totalMissedShots,
      accuracy,
      totalBubblesPopped: s.totalBubblesPopped,
      totalBubblesDropped: s.totalBubblesDropped,
      bestCombo: s.bestCombo,
      bestTimeSeconds: s.bestTimeSeconds,
      perfectLevelsCount: s.perfectLevelsCount,
    };
  }, [progress]);

  const formatTime = (secs: number) => {
    if (!secs || secs <= 0) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="bubble-shooter-statistics-view"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#061224] via-[#091b36] to-[#040c18] overflow-y-auto custom-scrollbar"
    >
      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to Menu"
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-400" />
            <span>Player Statistics</span>
          </h2>
          <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest">
            Verified In-Engine Telemetry
          </p>
        </div>

        <div className="w-11 h-11" />
      </header>

      {/* STATS MATRIX */}
      <main className="relative z-10 flex-1 py-4 space-y-3 overflow-y-auto custom-scrollbar pr-1">
        {/* HERO TOTAL SCORE BANNER */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30 border border-cyan-400/30 text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
            Total Cumulative Score (Sum of Best Scores)
          </div>
          <div className="text-3xl font-black text-amber-300 font-mono mt-1 drop-shadow">
            {stats.totalCumulativeScore.toLocaleString()} PTS
          </div>
          <div className="text-[11px] text-slate-300 mt-1">
            Across {stats.levelsCompleted} of 40 completed stages
          </div>
        </div>

        {/* PRIMARY METRICS GRID */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Current Highest Level</span>
            </div>
            <div className="text-lg font-black text-white mt-1">
              Level {stats.highestLevel} / 40
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Best Single Level Score</span>
            </div>
            <div className="text-lg font-black text-amber-300 font-mono mt-1">
              {stats.bestLevelScore > 0 ? stats.bestLevelScore.toLocaleString() : '---'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Total Stars Earned</span>
            </div>
            <div className="text-lg font-black text-amber-300 mt-1">
              {stats.totalStars} / 120
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Perfect Stage Clears</span>
            </div>
            <div className="text-lg font-black text-emerald-400 mt-1">
              {stats.perfectLevelsCount}
            </div>
          </div>
        </div>

        {/* COMBAT & SHOT PRECISION */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
          <div className="text-[11px] font-black uppercase tracking-wider text-cyan-300 border-b border-white/10 pb-1 flex items-center justify-between">
            <span>Firing Efficiency</span>
            <span className="font-mono text-white">{stats.accuracy}% Accuracy</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Total Shots</div>
              <div className="text-sm font-black text-white font-mono mt-0.5">{stats.totalShotsFired}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Effective</div>
              <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">{stats.totalEffectiveShots}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Misses (Fouls)</div>
              <div className="text-sm font-black text-rose-400 font-mono mt-0.5">{stats.totalMissedShots}</div>
            </div>
          </div>
        </div>

        {/* BUBBLE IMPACTS & COMBOS */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bubbles Popped</span>
            </div>
            <div className="text-base font-black text-white font-mono mt-1">
              {stats.totalBubblesPopped.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Max Combo Streak</span>
            </div>
            <div className="text-base font-black text-rose-300 font-mono mt-1">
              {stats.bestCombo}x
            </div>
          </div>
        </div>

        {/* BEST TIME */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Fastest Stage Completion Time</span>
          </div>
          <div className="font-mono font-black text-white text-sm">
            {formatTime(stats.bestTimeSeconds)}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          Return to Menu
        </button>
      </footer>
    </div>
  );
};
