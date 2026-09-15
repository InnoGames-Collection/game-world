import React from 'react';
import { ArrowLeft, Trophy, CheckCircle2, Compass, RotateCcw, AlertTriangle, Flame, Clock, Star, Zap } from 'lucide-react';
import { MemoryMatchStorageData } from '../types';

interface StatisticsModalProps {
  storage: MemoryMatchStorageData;
  onBack: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({ storage, onBack }) => {
  const totalScore = storage.totalCumulativeScore || 0;
  const levelsCompleted = storage.levelsCompleted || 0;
  const totalPairsMatched = storage.totalPairsMatched || 0;
  const totalMoves = storage.totalMoves || 0;
  const totalMistakes = storage.totalMistakes || 0;
  const bestCombo = storage.bestCombo || 0;

  // Best time across any completed level
  const bestTimesList = Object.values(storage.bestTimes || {}) as number[];
  const bestTimeSeconds = bestTimesList.length > 0 ? Math.min(...bestTimesList) : 0;

  // Highest score on any single level
  const levelScoresList = Object.values(storage.levelScores || {}) as number[];
  const bestLevelScore = levelScoresList.length > 0 ? Math.max(...levelScoresList) : 0;

  // Total stars earned out of 120
  const starsEarned = (Object.values(storage.stars || {}) as number[]).reduce((acc: number, s: number) => acc + (s || 0), 0);

  // Overall accuracy rate
  const overallAccuracy = totalMoves > 0
    ? Math.min(100, Math.round((totalPairsMatched / totalMoves) * 100))
    : 0;

  return (
    <div className="w-full h-full flex flex-col text-white px-3 py-3 sm:p-5 overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif] max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Menu</span>
        </button>

        <span className="text-xs font-black text-white uppercase tracking-wider">PLAYER STATISTICS</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 space-y-3 py-3">
        {/* Cumulative Tournament Score Banner */}
        <div className="bg-gradient-to-r from-[#051828] via-[#0A7C45]/30 to-[#051828] border-2 border-[#0A7C45]/70 rounded-3xl p-4 text-center shadow-xl">
          <div className="text-3xl sm:text-4xl font-black font-mono text-[#FFD54F] tracking-tight">
            {totalScore.toLocaleString()}
          </div>
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">
            TOTAL CUMULATIVE TOURNAMENT SCORE
          </div>
          <div className="text-[10px] text-emerald-400 font-medium mt-1">
            Persisted across all 40 completed levels
          </div>
        </div>

        {/* 2x4 Metric Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Levels Completed */}
          <div className="bg-[#071D2F] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black font-mono text-white">
                {levelsCompleted} <span className="text-xs text-slate-500 font-normal">/ 40</span>
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Levels Completed</div>
            </div>
          </div>

          {/* Stars Earned */}
          <div className="bg-[#071D2F] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-base font-black font-mono text-amber-300">
                {starsEarned} <span className="text-xs text-slate-500 font-normal">/ 120</span>
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Stars Earned</div>
            </div>
          </div>

          {/* Pairs Matched */}
          <div className="bg-[#071D2F] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black font-mono text-white">
                {totalPairsMatched.toLocaleString()}
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Pairs Matched</div>
            </div>
          </div>

          {/* Total Moves */}
          <div className="bg-[#071D2F] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black font-mono text-white">
                {totalMoves.toLocaleString()}
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Total Moves</div>
            </div>
          </div>

          {/* Total Mistakes */}
          <div className="bg-[#071D2F] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black font-mono text-white">
                {totalMistakes.toLocaleString()}
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Total Mistakes</div>
            </div>
          </div>

          {/* Best Streak / Combo */}
          <div className="bg-[#071D2F] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-base font-black font-mono text-[#FFD54F]">
                ×{bestCombo}
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Best Combo</div>
            </div>
          </div>

          {/* Best Time */}
          <div className="bg-[#071D2F] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/15 text-teal-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black font-mono text-white">
                {bestTimeSeconds > 0 ? `${bestTimeSeconds}s` : '—'}
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Best Level Time</div>
            </div>
          </div>

          {/* Best Level Score */}
          <div className="bg-[#071D2F] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black font-mono text-[#FFD54F]">
                {bestLevelScore > 0 ? `+${bestLevelScore}` : '—'}
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Best Single Level</div>
            </div>
          </div>
        </div>

        {/* Accuracy Bar */}
        <div className="bg-[#051424]/90 border border-white/10 rounded-2xl p-3 space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-300">Lifetime Accuracy Rate</span>
            <span className="text-emerald-400 font-mono">{overallAccuracy}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0A7C45] to-[#00C853] transition-all duration-500"
              style={{ width: `${overallAccuracy}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
