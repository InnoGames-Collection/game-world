/**
 * KNIFE MADNESS - Statistics Screen
 * Deep tournament telemetry: accuracy, hits, par times, fruit counts, and level records.
 */

import React from 'react';
import {
  ArrowLeft,
  BarChart3,
  Target,
  Clock,
  Sparkles,
  Flame,
  Apple,
  ShieldAlert,
  Percent,
  TrendingUp,
} from 'lucide-react';
import { KnifeMadnessCareerProgress } from '../types';

interface KnifeMadnessStatisticsProps {
  career: KnifeMadnessCareerProgress;
  onBack: () => void;
}

export const KnifeMadnessStatistics: React.FC<KnifeMadnessStatisticsProps> = ({
  career,
  onBack,
}) => {
  const accuracy =
    career.totalThrows > 0
      ? Math.round((career.totalHits / career.totalThrows) * 100)
      : 0;

  const precisionText =
    career.bestPrecisionDeg > 0 && career.bestPrecisionDeg < 90
      ? `${career.bestPrecisionDeg.toFixed(1)}°`
      : '—';

  return (
    <div
      id="knife-madness-statistics"
      className="relative w-full h-full max-w-md mx-auto flex flex-col p-4 bg-[#050e1d] text-white select-none overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          id="btn-stats-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Menu</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-black uppercase tracking-wider text-amber-300">
            Player Statistics
          </h2>
          <p className="text-[10px] text-slate-400">Career Telemetry</p>
        </div>

        <div className="w-14" />
      </div>

      {/* Accuracy Hero Card */}
      <div className="my-3 bg-gradient-to-r from-amber-500/20 via-sky-500/10 to-transparent border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Overall Throw Accuracy
          </div>
          <div className="text-3xl font-black text-amber-300 mt-1">
            {accuracy}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {career.totalHits} hits / {career.totalThrows} total throws
          </div>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <Percent className="w-7 h-7" />
        </div>
      </div>

      {/* Detailed Stats 2x4 Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {/* Cumulative Score */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Cumulative Score</span>
          </div>
          <div className="text-lg font-black text-amber-300">{career.totalScore}</div>
          <div className="text-[10px] text-slate-400">Sum of best stage scores</div>
        </div>

        {/* Stages Cleared */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stages Cleared</span>
          </div>
          <div className="text-lg font-black text-emerald-300">
            {career.levelsCompleted} / 40
          </div>
          <div className="text-[10px] text-slate-400">Active: Lv {career.currentLevel}</div>
        </div>

        {/* Best Combo Streak */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Flame className="w-3.5 h-3.5 text-purple-400" />
            <span>Max Combo Streak</span>
          </div>
          <div className="text-lg font-black text-purple-300">
            {career.bestCombo > 0 ? `x${career.bestCombo}` : '0'}
          </div>
          <div className="text-[10px] text-slate-400">Consecutive blade hits</div>
        </div>

        {/* Best Precision */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Best Precision</span>
          </div>
          <div className="text-lg font-black text-cyan-300">{precisionText}</div>
          <div className="text-[10px] text-slate-400">Tightest safe angle gap</div>
        </div>

        {/* Fruits Sliced */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Apple className="w-3.5 h-3.5 text-red-400" />
            <span>Fruits Sliced</span>
          </div>
          <div className="text-lg font-black text-red-300">
            {career.totalFruitsSliced}
          </div>
          <div className="text-[10px] text-slate-400">Bonus points collected</div>
        </div>

        {/* Best Par Time */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Fastest Stage</span>
          </div>
          <div className="text-lg font-black text-blue-300">
            {career.bestLevelTimeSeconds > 0 ? `${career.bestLevelTimeSeconds}s` : '—'}
          </div>
          <div className="text-[10px] text-slate-400">Clean completion time</div>
        </div>

        {/* Blade Collisions */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Blade Deflections</span>
          </div>
          <div className="text-lg font-black text-rose-300">
            {career.totalFails}
          </div>
          <div className="text-[10px] text-slate-400">Failed collision attempts</div>
        </div>

        {/* Unlocked Level */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-yellow-400" />
            <span>Highest Tier</span>
          </div>
          <div className="text-lg font-black text-yellow-300">
            Tier {Math.min(5, Math.ceil(career.unlockedLevel / 8))}
          </div>
          <div className="text-[10px] text-slate-400">Stage unlocked</div>
        </div>
      </div>
    </div>
  );
};
