import React from 'react';
import { ArrowLeft, Target, Zap, Sparkles, CheckCircle2, Award } from 'lucide-react';

interface CandyHowToPlayProps {
  onBack: () => void;
}

export const CandyHowToPlay: React.FC<CandyHowToPlayProps> = ({ onBack }) => {
  return (
    <div
      id="candy-howtoplay-screen"
      className="relative w-full max-w-md mx-auto h-[640px] sm:h-[680px] rounded-3xl overflow-hidden shadow-2xl flex flex-col p-4 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif] border-2 border-pink-500/40 select-none text-white animate-in fade-in"
      style={{
        background: 'radial-gradient(circle at 50% 15%, #3b0764 0%, #1e1035 45%, #0a0614 100%)',
      }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <button
          id="candy-howtoplay-back-btn"
          type="button"
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white/90 border border-white/15 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-black text-white uppercase tracking-wider">
            HOW TO PLAY
          </h2>
          <span className="text-[10px] text-pink-300 font-bold uppercase tracking-wide">
            CANDY MATCH-3 GUIDE
          </span>
        </div>

        <div className="w-[44px]" />
      </div>

      {/* CONTENT LIST */}
      <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-2.5 scrollbar-thin">
        {/* Step 1: Match 3 Candies */}
        <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-500/30 border border-pink-400 flex items-center justify-center shrink-0 text-lg">
            🍬
          </div>
          <div>
            <div className="text-xs font-black text-pink-300 uppercase tracking-wide">
              1. SWIPE TO MATCH 3
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              Swipe adjacent candies horizontally or vertically to connect 3 or more of the same color to pop them and trigger cascades.
            </p>
          </div>
        </div>

        {/* Step 2: Objectives & Goals */}
        <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/30 border border-amber-400 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="text-xs font-black text-amber-300 uppercase tracking-wide">
              2. CLEAR LEVEL OBJECTIVES
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              Each level has unique targets shown in the top bar: frosted jellies, chocolate blockers, or specific candy collections.
            </p>
          </div>
        </div>

        {/* Step 3: Special Candies & Combos */}
        <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/30 border border-cyan-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="text-xs font-black text-cyan-300 uppercase tracking-wide">
              3. CREATE SPECIAL BLASTS
            </div>
            <div className="text-[11px] text-slate-300 space-y-1 mt-0.5">
              <div>• <strong>Striped Candy</strong> (4 in a row): Clears entire row/col.</div>
              <div>• <strong>Wrapped Candy</strong> (T/L match): Explodes 3x3 blast area.</div>
              <div>• <strong>Color Bomb</strong> (5 in a line): Clears all candies of that color!</div>
              <div>• <strong>Combo Specials</strong>: Swap two specials together for giant chain reactions.</div>
            </div>
          </div>
        </div>

        {/* Step 4: Moves Management */}
        <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/30 border border-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <div className="text-xs font-black text-purple-300 uppercase tracking-wide">
              4. WATCH YOUR MOVES
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              Achieve all goals before moves reach 0. Remaining moves convert into Sugar Crush fireworks for massive bonus points!
            </p>
          </div>
        </div>

        {/* Step 5: Sequential Progression */}
        <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/30 border border-emerald-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="text-xs font-black text-emerald-300 uppercase tracking-wide">
              5. UNLOCK ALL 40 LEVELS
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              Clear each level sequentially to unlock the next challenge, earn 1 to 3 stars, and climb the competitive leaderboard.
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM BUTTON */}
      <button
        type="button"
        onClick={onBack}
        className="w-full min-h-[48px] py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:brightness-110 active:scale-98 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer border border-pink-300/40 shrink-0 mt-2"
      >
        GOT IT, LET&apos;S PLAY!
      </button>
    </div>
  );
};
