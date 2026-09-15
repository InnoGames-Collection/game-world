import React from 'react';
import { ArrowLeft, Info, Trophy, Brain, ShieldCheck, Sparkles } from 'lucide-react';

interface AboutModalProps {
  onBack: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onBack }) => {
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

        <span className="text-xs font-black text-white uppercase tracking-wider">ABOUT</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 space-y-3 py-3 text-xs leading-relaxed text-slate-300">
        <div className="bg-[#051424]/90 border border-[#0A7C45]/60 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-[#FFD54F] font-black text-sm uppercase">
            <Trophy className="w-4 h-4 text-[#FFD54F]" />
            <span>TelePlus Memory Match Championship</span>
          </div>
          <p>
            Memory Match is a flagship cognitive skill game engineered specifically for the TelePlus Ethiopia competitive gaming platform. Designed with 40 progressively calibrated levels, it challenges players to push the limits of working memory, spatial orientation, and visual discernment.
          </p>
        </div>

        <div className="bg-[#071D2F] border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase">
            <Brain className="w-4 h-4" />
            <span>Cognitive & Neurological Benefits</span>
          </div>
          <p>
            Regular engagement with calibrated memory matching strengthens visual working memory, short-term associative recall, and sustained executive attention. Players sharpen rapid pattern recognition across nuanced thematic categories.
          </p>
        </div>

        <div className="bg-[#071D2F] border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Tournament Integrity</span>
          </div>
          <p>
            Scores are computed strictly and deterministically using speed, move efficiency, match streaks, and difficulty multipliers. Every millisecond and move matters equally for every contender.
          </p>
        </div>

        <div className="text-center py-2 text-[10px] text-slate-400">
          <div>TelePlus Ethiopia Gaming Platform • v2.4.0</div>
          <div>Crafted for mobile & desktop with zero vertical page scrolling.</div>
        </div>
      </div>
    </div>
  );
};
