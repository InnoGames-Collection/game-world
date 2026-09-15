import React from 'react';
import { ArrowLeft, Brain, Eye, Flame, Timer, Target, Trophy, Star } from 'lucide-react';

interface HowToPlayModalProps {
  onBack: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onBack }) => {
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

        <span className="text-xs font-black text-white uppercase tracking-wider">HOW TO PLAY</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 space-y-3 py-3">
        {/* Core Rule */}
        <div className="bg-[#051424]/90 border border-[#0A7C45]/60 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
            <Brain className="w-4 h-4" />
            <span>The Objective</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            Tap to reveal a card and memorize its icon, color, and location. Flip a second card to find its identical twin. Clear all pairs before the timer runs out!
          </p>
        </div>

        {/* 4 Step Visual Progression */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#071D2F] border border-white/10 rounded-2xl p-2.5 space-y-1">
            <div className="flex items-center gap-1.5 text-[#FFD54F] font-bold text-[11px]">
              <Eye className="w-3.5 h-3.5" />
              <span>1. Reveal Card</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-snug">
              Tap any card to inspect its subject and memorize its slot.
            </p>
          </div>

          <div className="bg-[#071D2F] border border-white/10 rounded-2xl p-2.5 space-y-1">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
              <Target className="w-3.5 h-3.5" />
              <span>2. Match Pairs</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-snug">
              Select its matching counterpart to lock in both cards permanently.
            </p>
          </div>

          <div className="bg-[#071D2F] border border-white/10 rounded-2xl p-2.5 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
              <Flame className="w-3.5 h-3.5" />
              <span>3. Build Combos</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-snug">
              Uninterrupted consecutive matches activate up to a 5x multiplier!
            </p>
          </div>

          <div className="bg-[#071D2F] border border-white/10 rounded-2xl p-2.5 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <Timer className="w-3.5 h-3.5" />
              <span>4. Speed Bonus</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-snug">
              Remaining seconds translate directly into high-tier tournament points.
            </p>
          </div>
        </div>

        {/* Scoring Breakdown Rules */}
        <div className="bg-[#051424]/90 border border-white/10 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-[#FFD54F] font-black text-xs uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            <span>Competitive Scoring Formula</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="font-bold text-white">Base Pair Match</span>
              <span className="font-mono text-emerald-400">+10 Points per pair</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="font-bold text-white">Time Performance</span>
              <span className="font-mono text-sky-400">Up to +45 Points</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="font-bold text-white">Move Efficiency</span>
              <span className="font-mono text-amber-400">Up to +35 Points</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="font-bold text-white">Match Streak</span>
              <span className="font-mono text-purple-400">+4 Pts per streak</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="font-bold text-white">Mistake Penalty</span>
              <span className="font-mono text-rose-400">-3 Points per error</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="font-bold text-white">Difficulty Multiplier</span>
              <span className="font-mono text-[#FFD54F]">1.00x up to 1.80x</span>
            </div>
          </div>
        </div>

        {/* Star Rating Info */}
        <div className="bg-[#051424]/90 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
          <div className="flex text-amber-400 text-lg">
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div className="text-[11px] text-slate-300">
            Earn up to <strong className="text-white">3 Stars</strong> per level by completing stages under target moves and fast times. Collect all 120 stars across 40 levels!
          </div>
        </div>
      </div>
    </div>
  );
};
