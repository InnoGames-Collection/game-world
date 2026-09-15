import React from 'react';
import { ArrowLeft, BarChart2, Award, Zap, Target, Flame, CheckCircle2, Star, Clock } from 'lucide-react';
import { PopBalloonProgress } from '../types';
import { formatMsisdnMasked, calculateGlobalRank } from '../storage';
import { UserProfile } from '../../../types';

interface PopBalloonStatsProps {
  progress: PopBalloonProgress;
  profile?: UserProfile;
  onBack: () => void;
}

export const PopBalloonStats: React.FC<PopBalloonStatsProps> = ({
  progress,
  profile,
  onBack,
}) => {
  const maskedPhone = formatMsisdnMasked(profile?.phoneNumber);
  const globalRank = calculateGlobalRank(progress.totalTournamentScore);
  const bestLevelScore = (Object.values(progress.levelBestScores) as number[]).reduce((max: number, s: number) => Math.max(max, s), 0);
  const completedCount = Object.keys(progress.levelBestScores).length;

  return (
    <div
      id="pop-balloon-stats-view"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-5 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#070D1E] via-[#0D183A] to-[#070D1E] text-white overflow-y-auto custom-scrollbar"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-[#070D1E]/95 backdrop-blur-md z-20 shrink-0">
        <button
          id="pop-balloon-stats-back-btn"
          type="button"
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-md"
          title="Back to Menu"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-400" />
            <span>Player Statistics</span>
          </h2>
          <p className="text-[11px] text-blue-300 font-bold uppercase tracking-widest font-mono">
            {maskedPhone}
          </p>
        </div>

        <div className="w-11" />
      </div>

      {/* STATS HERO METRIC */}
      <div className="my-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 border border-emerald-400/30 text-center shadow-xl shrink-0">
        <div className="text-xs font-black text-emerald-300 uppercase tracking-widest mb-1">
          Cumulative Tournament Score
        </div>
        <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
          {progress.totalTournamentScore.toLocaleString()}
        </div>
        <div className="text-[11px] text-slate-300 mt-1 font-medium">
          Global Rank #{globalRank.toLocaleString()} • Top {Math.max(1, Math.round((globalRank / 5000) * 100))}% of all competitors
        </div>
      </div>

      {/* DETAILED STATS GRID */}
      <div className="grid grid-cols-2 gap-2.5 flex-1">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>Stages Completed</span>
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {completedCount} <span className="text-sm font-normal text-slate-400">/ 40</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Current Stage: {progress.unlockedLevel}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Best Stage Score</span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-300 font-mono">
            {bestLevelScore.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Single Stage High Run
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Max Combo Chain</span>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-400 font-mono">
            {progress.bestComboAllTime > 0 ? `${progress.bestComboAllTime}x` : '0x'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Continuous Hits Without Miss
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
            <Target className="w-4 h-4 text-purple-400" />
            <span>Total Balloons Popped</span>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-300 font-mono">
            {progress.totalBalloonsPoppedAllTime.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Across All Tournament Runs
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Reaction Speed</span>
          </div>
          <div className="mt-2 text-2xl font-black text-cyan-300 font-mono">
            {progress.bestReactionMs}ms
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Average Sub-Second Reflex
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
            <Star className="w-4 h-4 text-amber-400" />
            <span>Matches Attempted</span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-200 font-mono">
            {progress.totalMatchesPlayed.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Championship Engagements
          </div>
        </div>
      </div>
    </div>
  );
};
