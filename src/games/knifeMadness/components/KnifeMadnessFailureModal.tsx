/**
 * KNIFE MADNESS - Blade Collision Failure Modal
 * Clear feedback explaining blade collision failure, level progress, and quick retry.
 */

import React from 'react';
import { ShieldAlert, RotateCcw, Menu, Grid, Target, TrendingUp } from 'lucide-react';
import { LevelFailedData } from '../KnifeMadnessEngine';

interface KnifeMadnessFailureModalProps {
  failData: LevelFailedData;
  bestLevelScore: number;
  cumulativeTotalScore: number;
  onRetry: () => void;
  onOpenLevels: () => void;
  onMenu: () => void;
}

export const KnifeMadnessFailureModal: React.FC<KnifeMadnessFailureModalProps> = ({
  failData,
  bestLevelScore,
  cumulativeTotalScore,
  onRetry,
  onOpenLevels,
  onMenu,
}) => {
  const { level, knivesPlaced, fruitsSlicedCount } = failData;

  return (
    <div
      id="modal-blade-collision-failure"
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#1c0b11] to-[#0a0306] border border-red-500/60 rounded-3xl p-5 shadow-[0_16px_48px_rgba(0,0,0,0.9)] text-white text-center select-none overflow-hidden">
        {/* Header Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-10 bg-red-500/25 blur-2xl rounded-full" />

        {/* Failure Icon */}
        <div className="relative w-16 h-16 mx-auto mb-2 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-red-500/20 blur-md animate-pulse" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-black uppercase tracking-tight text-red-200">
          BLADE COLLISION!
        </h2>
        <p className="text-xs text-rose-300/90 mt-1 max-w-[240px] mx-auto leading-tight">
          Your thrown knife deflected off an embedded blade.
        </p>

        {/* Attempt Stats Card */}
        <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-3 my-3">
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Stage</span>
              <span className="text-sm font-black text-white">#{level.levelNumber}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Embedded</span>
              <span className="text-sm font-black text-amber-300">
                {knivesPlaced}/{level.requiredKnives}
              </span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Best Stage</span>
              <span className="text-sm font-black text-emerald-300">{bestLevelScore} pts</span>
            </div>
          </div>
        </div>

        {/* Cumulative Score Reminder */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-2.5 mb-3 flex items-center justify-between text-left text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                Tournament Total
              </div>
              <div className="text-[11px] text-slate-300">Sum of best stage scores</div>
            </div>
          </div>
          <div className="text-sm font-black text-amber-300">{cumulativeTotalScore} pts</div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            id="btn-failure-retry"
            onClick={onRetry}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white font-black text-sm uppercase tracking-wide shadow-lg hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TRY AGAIN</span>
          </button>

          <div className="flex gap-2">
            <button
              id="btn-failure-levels"
              onClick={onOpenLevels}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Stages</span>
            </button>

            <button
              id="btn-failure-menu"
              onClick={onMenu}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
