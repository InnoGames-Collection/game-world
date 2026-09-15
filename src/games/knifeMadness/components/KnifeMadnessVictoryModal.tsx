/**
 * KNIFE MADNESS - Stage Victory Modal
 * Displays comprehensive tournament scoring breakdown, stars, new best indicators,
 * and updated cumulative total score.
 */

import React from 'react';
import {
  Trophy,
  Star,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Menu,
  Clock,
  Zap,
  Crown,
  Apple,
  TrendingUp,
} from 'lucide-react';
import { KnifeMadnessScoreBreakdown } from '../types';

interface KnifeMadnessVictoryModalProps {
  levelNumber: number;
  isBoss: boolean;
  breakdown: KnifeMadnessScoreBreakdown;
  isNewBest: boolean;
  cumulativeTotalScore: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onMenu: () => void;
}

export const KnifeMadnessVictoryModal: React.FC<KnifeMadnessVictoryModalProps> = ({
  levelNumber,
  isBoss,
  breakdown,
  isNewBest,
  cumulativeTotalScore,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onMenu,
}) => {
  return (
    <div
      id="modal-stage-victory"
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#091b34] to-[#040b17] border border-amber-500/50 rounded-3xl p-5 shadow-[0_16px_48px_rgba(0,0,0,0.8)] text-white text-center select-none overflow-hidden">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-10 bg-amber-500/25 blur-2xl rounded-full" />

        {/* Victory Badge / Crown */}
        <div className="relative w-16 h-16 mx-auto mb-2 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-md animate-pulse" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg">
            {isBoss ? <Crown className="w-8 h-8 fill-current" /> : <Trophy className="w-8 h-8 fill-current" />}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400">
          {isBoss ? 'BOSS DEFEATED!' : `STAGE ${levelNumber} CLEARED!`}
        </h2>
        <p className="text-xs font-semibold text-slate-400">
          Target completely shattered
        </p>

        {/* Stars */}
        <div className="flex justify-center gap-1.5 my-2.5">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`w-6 h-6 ${
                s <= breakdown.stars
                  ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_2px_8px_rgba(250,204,21,0.5)]'
                  : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Stage Total Score Display */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 my-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">
              Stage Score
            </span>
            {isNewBest && (
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700 uppercase">
                New Best!
              </span>
            )}
          </div>
          <div className="text-3xl font-black text-amber-300 mt-0.5">
            +{breakdown.finalTotalScore}
          </div>

          {/* Breakdown Pills Grid */}
          <div className="grid grid-cols-3 gap-1.5 mt-2.5 text-center text-[10px] pt-2 border-t border-slate-800">
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Knives</span>
              <span className="font-bold text-slate-200">+{breakdown.baseKnifeScore}</span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Fruit</span>
              <span className="font-bold text-red-300">+{breakdown.fruitBonusScore}</span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Precision</span>
              <span className="font-bold text-cyan-300">+{breakdown.precisionBonusScore}</span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Combo</span>
              <span className="font-bold text-amber-300">+{breakdown.comboBonusScore}</span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Par Time</span>
              <span className="font-bold text-blue-300">+{breakdown.parTimeBonusScore}</span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Clean Par</span>
              <span className="font-bold text-emerald-300">+{breakdown.parEfficiencyBonusScore}</span>
            </div>
          </div>
        </div>

        {/* Cumulative Tournament Score Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border border-amber-500/30 rounded-xl p-2.5 mb-3 flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                Tournament Total
              </div>
              <div className="text-xs font-semibold text-slate-200">
                Sum of best stage scores
              </div>
            </div>
          </div>
          <div className="text-base font-black text-amber-300">
            {cumulativeTotalScore} pts
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {hasNextLevel ? (
            <button
              id="btn-victory-next-level"
              onClick={onNextLevel}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wide shadow-lg hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <span>NEXT STAGE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-3 bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs font-black rounded-xl uppercase">
              🎉 TOURNAMENT COMPLETE — ALL 40 STAGES CONQUERED!
            </div>
          )}

          <div className="flex gap-2">
            <button
              id="btn-victory-replay"
              onClick={onReplay}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>

            <button
              id="btn-victory-menu"
              onClick={onMenu}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 active:scale-95"
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
