import React from 'react';
import { Trophy, Star, ArrowRight, RotateCcw, Home, Award, Sparkles, Clock, Zap } from 'lucide-react';
import { LevelScoreBreakdown } from '../types';

interface SortingVictoryModalProps {
  isOpen: boolean;
  level: number;
  totalLevels: number;
  scoreBreakdown: LevelScoreBreakdown;
  cumulativeTotalScore: number;
  isNewBest: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onGoToMenu: () => void;
  onOpenLeaderboard: () => void;
}

export const SortingVictoryModal: React.FC<SortingVictoryModalProps> = ({
  isOpen,
  level,
  totalLevels,
  scoreBreakdown,
  cumulativeTotalScore,
  isNewBest,
  onNextLevel,
  onReplay,
  onGoToMenu,
  onOpenLeaderboard,
}) => {
  if (!isOpen) return null;

  const isFinalLevel = level >= totalLevels;

  return (
    <div className="fixed inset-0 z-50 bg-[#070b16]/95 backdrop-blur-md flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-md mx-auto space-y-4 pb-8 my-auto text-center">
        {/* Confetti / Particle Aura */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-[0_0_40px_rgba(245,158,11,0.5)] animate-bounce">
            <div className="w-full h-full rounded-[22px] bg-[#0c1322] flex items-center justify-center text-amber-400">
              <Trophy className="w-10 h-10" />
            </div>
          </div>
          {isNewBest && (
            <span className="absolute -top-2 -right-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider shadow-lg border border-white/20">
              NEW BEST!
            </span>
          )}
        </div>

        {/* Title & Level */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            LEVEL {level} COMPLETED!
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            {isFinalLevel
              ? '🏆 Master Grandmaster — All 40 Levels Solved!'
              : 'Exceptional tactical execution.'}
          </p>
        </div>

        {/* 3-Star Rating Animation */}
        <div className="flex items-center justify-center gap-2 py-1">
          {[1, 2, 3].map((star) => (
            <div
              key={star}
              className={`p-2 rounded-2xl border transition-all ${
                star <= scoreBreakdown.stars
                  ? 'bg-amber-400/20 border-amber-400/40 text-amber-300 scale-110 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                  : 'bg-white/5 border-white/10 text-slate-600'
              }`}
            >
              <Star
                className={`w-7 h-7 ${
                  star <= scoreBreakdown.stars ? 'fill-amber-400' : ''
                }`}
              />
            </div>
          ))}
        </div>

        {/* Score Breakdown Card */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3 text-left">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Score Breakdown
            </span>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              {scoreBreakdown.moves} Moves • {scoreBreakdown.timeTakenSeconds}s
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            {/* Base Points */}
            <div className="flex justify-between text-slate-300">
              <span className="font-sans">Base Level Clearance</span>
              <span className="text-white">+{scoreBreakdown.basePoints}</span>
            </div>

            {/* Move Par Bonus */}
            <div className="flex justify-between text-slate-300">
              <span className="font-sans">
                Move Efficiency Bonus (Par {scoreBreakdown.optimalParMoves})
              </span>
              <span className="text-cyan-400">+{scoreBreakdown.moveBonus}</span>
            </div>

            {/* Speed Bonus */}
            <div className="flex justify-between text-slate-300">
              <span className="font-sans">Time / Speed Bonus</span>
              <span className="text-emerald-400">+{scoreBreakdown.timeBonus}</span>
            </div>

            {/* Penalties if any */}
            {scoreBreakdown.undoPenalty > 0 && (
              <div className="flex justify-between text-rose-400">
                <span className="font-sans">Undo Penalty</span>
                <span>-{scoreBreakdown.undoPenalty}</span>
              </div>
            )}
            {scoreBreakdown.hintPenalty > 0 && (
              <div className="flex justify-between text-rose-400">
                <span className="font-sans">Hint Penalty</span>
                <span>-{scoreBreakdown.hintPenalty}</span>
              </div>
            )}
            {scoreBreakdown.extraTubePenalty > 0 && (
              <div className="flex justify-between text-rose-400">
                <span className="font-sans">Extra Buffer Tube Penalty</span>
                <span>-{scoreBreakdown.extraTubePenalty}</span>
              </div>
            )}

            {/* Total Level Score */}
            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm font-bold">
              <span className="text-white font-sans uppercase">Level Score</span>
              <span className="text-amber-300 text-base font-black">
                {scoreBreakdown.totalScore.toLocaleString()} PTS
              </span>
            </div>

            {/* Total Cumulative Score */}
            <div className="pt-1 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-sans uppercase">
                Total Tournament Score
              </span>
              <span className="text-cyan-300 font-bold">
                {cumulativeTotalScore.toLocaleString()} PTS
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {!isFinalLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] text-white font-black text-sm uppercase tracking-wider shadow-lg border border-white/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>NEXT LEVEL</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onOpenLeaderboard}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-5 h-5" />
              <span>VIEW FINAL TOURNAMENT RANK</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/10 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>REPLAY</span>
            </button>

            <button
              onClick={onGoToMenu}
              className="py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-white/10 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-slate-300" />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
