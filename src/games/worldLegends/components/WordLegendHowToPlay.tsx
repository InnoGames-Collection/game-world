import React from 'react';
import { ArrowLeft, Target, Shuffle, Lightbulb, CheckCircle2, Award } from 'lucide-react';

const WOOD_MATERIAL = {
  hud: {
    background: 'linear-gradient(180deg, #f5d499 0%, #e0b06b 50%, #c98e40 100%)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 3px 6px rgba(0,0,0,0.35)',
  },
  tileOrButton: {
    background: 'linear-gradient(180deg, #fff2db 0%, #f6ce8e 45%, #e2a652 100%)',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.9), 0 3px 0 #915a1a, 0 5px 8px rgba(0,0,0,0.4)',
  },
  primaryButton: {
    background: 'linear-gradient(180deg, #ffe082 0%, #ffb300 45%, #e65100 100%)',
    boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.8), 0 4px 0 #8c2d00, 0 8px 15px rgba(0,0,0,0.5)',
  },
};

interface WordLegendHowToPlayProps {
  onBack: () => void;
}

export const WordLegendHowToPlay: React.FC<WordLegendHowToPlayProps> = ({ onBack }) => {
  return (
    <div
      id="word-legend-howtoplay-screen"
      className="relative w-full max-w-md mx-auto h-[600px] sm:h-[650px] rounded-3xl overflow-hidden shadow-2xl flex flex-col p-4 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif] border-4 border-[#b37324] select-none text-[#22140a] animate-in fade-in"
      style={{
        background: 'radial-gradient(circle at 50% 20%, #2e1809 0%, #170d05 60%, #0c0702 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), inset 0 0 0 2px #f1bc68, inset 0 0 25px rgba(0,0,0,0.5)',
      }}
    >
      {/* TOP HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-[#b37324]/40 shrink-0">
        <button
          id="word-howtoplay-back-btn"
          type="button"
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl text-[#22140a] flex items-center gap-1.5 font-black text-xs border border-[#c98833] active:translate-y-0.5 transition-all cursor-pointer shadow-md"
          style={WOOD_MATERIAL.tileOrButton}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-black text-[#f7e0b5] uppercase tracking-wider">
            HOW TO PLAY
          </h2>
          <span className="text-[10px] text-[#e0b06b] font-bold uppercase tracking-wide">
            WORD PUZZLE RULES
          </span>
        </div>

        <div className="w-[44px]" />
      </div>

      {/* INSTRUCTIONS LIST */}
      <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-2.5 scrollbar-thin">
        {/* Step 1: Connect Letters */}
        <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 flex items-start gap-3">
          <div 
            className="w-9 h-9 rounded-xl border border-[#b37324] flex items-center justify-center shrink-0 text-base font-black text-[#22140a]"
            style={WOOD_MATERIAL.tileOrButton}
          >
            A-Z
          </div>
          <div>
            <div className="text-xs font-black text-[#ffc164] uppercase tracking-wide">
              1. SWIPE LETTERS TO FORM WORDS
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              Drag your finger across the wooden letter wheel to connect letters in sequence and build English words.
            </p>
          </div>
        </div>

        {/* Step 2: Fill Target Slots */}
        <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/30 border border-amber-400 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="text-xs font-black text-amber-300 uppercase tracking-wide">
              2. FILL ALL TARGET SLOTS
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              Every level displays crossword-style letter boxes. Finding valid target words fills their slots on the board.
            </p>
          </div>
        </div>

        {/* Step 3: Bonus Words */}
        <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/30 border border-cyan-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="text-xs font-black text-cyan-300 uppercase tracking-wide">
              3. COLLECT BONUS WORDS
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              Valid dictionary words that aren&apos;t on the main board earn extra bonus points to boost your leaderboard rank.
            </p>
          </div>
        </div>

        {/* Step 4: Shuffle and Hints */}
        <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/30 border border-purple-400 flex items-center justify-center shrink-0 flex-col">
            <Shuffle className="w-3.5 h-3.5 text-purple-300" />
            <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <div>
            <div className="text-xs font-black text-purple-300 uppercase tracking-wide">
              4. SHUFFLE &amp; HINT TOOLS
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              Rearrange the letter wheel with <strong>Shuffle</strong> to spot fresh combinations, or reveal letters with <strong>Hint</strong>.
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
              5. COMPLETE ALL 40 TOURNAMENT LEVELS
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              Solve all words in each puzzle to unlock the next level. All 40 levels are completely free to enter!
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM BUTTON */}
      <button
        id="word-howtoplay-confirm-btn"
        type="button"
        onClick={onBack}
        className="w-full min-h-[48px] py-3 rounded-2xl text-[#22140a] font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer border border-[#b37324] shrink-0 mt-2 active:translate-y-0.5"
        style={WOOD_MATERIAL.primaryButton}
      >
        LET&apos;S PLAY WORD LEGEND!
      </button>
    </div>
  );
};
