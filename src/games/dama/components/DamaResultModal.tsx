import React from 'react';
import {
  Trophy,
  Star,
  RotateCcw,
  ArrowRight,
  Grid,
  Menu,
  CheckCircle2,
  XCircle,
  Crown,
  Swords,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';
import { DamaScoreBreakdown } from '../types';

interface DamaResultModalProps {
  breakdown: DamaScoreBreakdown;
  unlockedNewLevel: boolean;
  onNextLevel: () => void;
  onRetry: () => void;
  onLevels: () => void;
  onMenu: () => void;
}

export const DamaResultModal: React.FC<DamaResultModalProps> = ({
  breakdown,
  unlockedNewLevel,
  onNextLevel,
  onRetry,
  onLevels,
  onMenu,
}) => {
  const isWin = breakdown.isWin;
  const isMaxLevel = breakdown.levelNumber >= 40;

  return (
    <div
      id="dama-result-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Banner Status */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-2 shadow-lg">
            {isWin ? (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 shadow-amber-500/20 shadow-lg">
                <Trophy className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center text-white shadow-rose-600/20 shadow-lg">
                <XCircle className="w-8 h-8" />
              </div>
            )}
          </div>

          <h2 className="text-xl font-black uppercase tracking-wide text-white">
            Level {breakdown.levelNumber} {isWin ? 'Victory' : 'Defeat'}
          </h2>
          <p className="text-xs font-semibold text-amber-300/90">
            {breakdown.levelName} • <span className="uppercase">{breakdown.tier} Tier</span>
          </p>

          {/* Stars */}
          {isWin && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= breakdown.starsEarned
                      ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Level Performance Telemetry */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 my-2 space-y-1.5 text-xs">
          <div className="grid grid-cols-3 gap-2 text-center pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block">Moves</span>
              <span className="font-mono font-bold text-white text-sm">
                {breakdown.moves}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Captures</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {breakdown.captures}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Remaining</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {breakdown.piecesRemaining}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1 text-[11px]">
            <div>
              <span className="text-[9px] text-slate-400 block">Kings</span>
              <span className="font-mono font-bold text-amber-300">
                {breakdown.kings}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block">Efficiency</span>
              <span className="font-mono font-bold text-emerald-300">
                {breakdown.efficiencyPercent}%
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block">Avg Move</span>
              <span className="font-mono font-bold text-slate-300">
                {breakdown.avgMoveTimeSeconds}s
              </span>
            </div>
          </div>
        </div>

        {/* Deterministic Scoring Breakdown */}
        <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-3 my-2 space-y-1 text-xs">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
            Score Breakdown
          </span>

          <div className="flex justify-between text-slate-400">
            <span>Base Level Score</span>
            <span className="font-mono text-slate-200">+{breakdown.baseScore}</span>
          </div>

          {breakdown.winBonus > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Victory Bonus</span>
              <span className="font-mono text-emerald-400">+{breakdown.winBonus}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-400">
            <span>Difficulty Bonus ({breakdown.tier})</span>
            <span className="font-mono text-amber-400">+{breakdown.difficultyBonus}</span>
          </div>

          {breakdown.captureEfficiencyBonus > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Capture Efficiency</span>
              <span className="font-mono text-slate-200">+{breakdown.captureEfficiencyBonus}</span>
            </div>
          )}

          {breakdown.pieceSurvivalBonus > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Piece Survival</span>
              <span className="font-mono text-slate-200">+{breakdown.pieceSurvivalBonus}</span>
            </div>
          )}

          {breakdown.kingBonus > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>King Promotion Bonus</span>
              <span className="font-mono text-amber-300">+{breakdown.kingBonus}</span>
            </div>
          )}

          {breakdown.moveEfficiencyBonus > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Move Efficiency</span>
              <span className="font-mono text-slate-200">+{breakdown.moveEfficiencyBonus}</span>
            </div>
          )}

          {breakdown.timeBonus > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Tempo Bonus</span>
              <span className="font-mono text-slate-200">+{breakdown.timeBonus}</span>
            </div>
          )}

          {breakdown.tacticalStreakBonus > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Tactical Streak</span>
              <span className="font-mono text-slate-200">+{breakdown.tacticalStreakBonus}</span>
            </div>
          )}

          {breakdown.cleanPlayBonus > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Clean Play (0 Invalid)</span>
              <span className="font-mono text-emerald-400">+{breakdown.cleanPlayBonus}</span>
            </div>
          )}

          {breakdown.completionBonus > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Clear Bonus</span>
              <span className="font-mono text-slate-200">+{breakdown.completionBonus}</span>
            </div>
          )}

          {breakdown.penalties > 0 && (
            <div className="flex justify-between text-rose-400">
              <span>Invalid Move Penalties</span>
              <span className="font-mono">-{breakdown.penalties}</span>
            </div>
          )}

          {/* Grand Totals */}
          <div className="pt-2 mt-1 border-t border-slate-800 flex items-center justify-between">
            <span className="font-bold text-white">Level Score:</span>
            <span className="font-mono font-black text-amber-400 text-base">
              {breakdown.finalScore} PTS
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Tournament Total:</span>
            <span className="font-mono font-bold text-amber-300">
              {breakdown.newCumulativeTotal.toLocaleString()} PTS
            </span>
          </div>
        </div>

        {/* Level Unlock Notice */}
        {unlockedNewLevel && (
          <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-2.5 text-center my-1 text-amber-300 text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Level {breakdown.levelNumber + 1} Unlocked!</span>
          </div>
        )}

        {!isWin && (
          <div className="bg-rose-950/40 border border-rose-800/40 rounded-xl p-2 text-center my-1 text-rose-300 text-xs font-semibold">
            Next level remains locked. Replay to claim victory!
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2 mt-3">
          {isWin && !isMaxLevel ? (
            <button
              id="dama-result-next-btn"
              onClick={onNextLevel}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm uppercase tracking-wide shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <span>Next Level</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="dama-result-retry-btn"
              onClick={onRetry}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Level {breakdown.levelNumber}</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              id="dama-result-levels-btn"
              onClick={onLevels}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Grid className="w-4 h-4 text-amber-400" />
              <span>Levels</span>
            </button>

            <button
              id="dama-result-menu-btn"
              onClick={onMenu}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Menu className="w-4 h-4 text-amber-400" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
