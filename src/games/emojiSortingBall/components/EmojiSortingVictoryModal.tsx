import React from 'react';
import { Trophy, Star, ArrowRight, RotateCcw, Home, Award, Sparkles, Clock, Zap } from 'lucide-react';
import { EmojiLevelScoreBreakdown } from '../types';

interface EmojiSortingVictoryModalProps {
  isOpen: boolean;
  level: number;
  totalLevels: number;
  scoreBreakdown: EmojiLevelScoreBreakdown;
  cumulativeTotalScore: number;
  isNewBest: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onGoToMenu: () => void;
  onOpenLeaderboard: () => void;
}

export const EmojiSortingVictoryModal: React.FC<EmojiSortingVictoryModalProps> = ({
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
      <div className="w-full max-w-md mx-auto space-y-4 pb-8 my-auto text-center">
        {/* Confetti / Particle Trophy Aura */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-500 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-purple-500/20 animate-bounce">
            <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center text-amber-500">
              <Trophy className="w-10 h-10" />
            </div>
          </div>
          {isNewBest && (
            <span className="absolute -top-2 -right-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider shadow-md border border-white">
              NEW BEST!
            </span>
          )}
        </div>

        {/* Title & Level */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            LEVEL {level} COMPLETED!
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            {isFinalLevel
              ? '🏆 Master Grandmaster — All 40 Emoji Levels Solved!'
              : 'Exceptional tactical execution.'}
          </p>
        </div>

        {/* 3-Star Rating Animation */}
        <div className="flex items-center justify-center gap-2 py-1">
          {[1, 2, 3].map((star) => (
            <div
              key={star}
              className={`p-2 rounded-2xl border transition-all ${
                star <= (scoreBreakdown.stars || 1)
                  ? 'bg-amber-100 border-amber-300 text-amber-500 scale-110 shadow-sm'
                  : 'bg-white/80 border-slate-200 text-slate-300'
              }`}
            >
              <Star
                className={`w-7 h-7 ${
                  star <= (scoreBreakdown.stars || 1) ? 'fill-amber-400 text-amber-500' : ''
                }`}
              />
            </div>
          ))}
        </div>

        {/* Score Breakdown Card */}
        <div className="p-4 rounded-2xl bg-white/90 border border-purple-100 shadow-md space-y-3 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Score Breakdown
            </span>
            <span className="text-xs font-mono text-violet-700 font-bold">
              {scoreBreakdown.moves} Moves • {scoreBreakdown.timeTakenSeconds}s
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            {/* Base Points */}
            <div className="flex justify-between text-slate-600">
              <span className="font-sans">Base Level Clearance</span>
              <span className="text-slate-900 font-semibold">+{scoreBreakdown.basePoints}</span>
            </div>

            {/* Move Par Bonus */}
            <div className="flex justify-between text-slate-600">
              <span className="font-sans">
                Move Efficiency Bonus (Par {scoreBreakdown.optimalParMoves})
              </span>
              <span className="text-violet-700 font-semibold">+{scoreBreakdown.moveBonus || 0}</span>
            </div>

            {/* Speed Bonus */}
            <div className="flex justify-between text-slate-600">
              <span className="font-sans">Time / Speed Bonus</span>
              <span className="text-emerald-700 font-semibold">+{scoreBreakdown.timeBonus}</span>
            </div>

            {/* Penalties if any */}
            {(scoreBreakdown.undoPenalty || 0) > 0 && (
              <div className="flex justify-between text-rose-600">
                <span className="font-sans">Undo Penalty</span>
                <span>-{scoreBreakdown.undoPenalty}</span>
              </div>
            )}
            {(scoreBreakdown.hintPenalty || 0) > 0 && (
              <div className="flex justify-between text-rose-600">
                <span className="font-sans">Hint Penalty</span>
                <span>-{scoreBreakdown.hintPenalty}</span>
              </div>
            )}
            {(scoreBreakdown.extraTubePenalty || 0) > 0 && (
              <div className="flex justify-between text-rose-600">
                <span className="font-sans">Extra Buffer Tube Penalty</span>
                <span>-{scoreBreakdown.extraTubePenalty}</span>
              </div>
            )}

            {/* Total Level Score */}
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-bold">
              <span className="text-slate-900 font-sans uppercase">Level Score</span>
              <span className="text-amber-700 text-base font-black">
                {(scoreBreakdown.totalScore || scoreBreakdown.finalLevelScore || 0).toLocaleString()} PTS
              </span>
            </div>

            {/* Total Cumulative Score */}
            <div className="pt-1 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-sans uppercase">
                Total Tournament Score
              </span>
              <span className="text-sky-700 font-bold">
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
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 active:scale-[0.98] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-violet-500/20 border border-white/20 flex items-center justify-center gap-2 cursor-pointer"
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
              className="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-purple-100 shadow-xs flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-violet-600" />
              <span>REPLAY</span>
            </button>

            <button
              onClick={onGoToMenu}
              className="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-purple-100 shadow-xs flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
