/**
 * EMOJI IQ — How To Play & Rules Guide
 */

import React from 'react';
import { EMOJI_IQ_COLORS } from '../colors';
import { X, CheckCircle2, AlertCircle, Lightbulb, Flame, Star } from 'lucide-react';
import { emojiIqAudio } from '../emojiIqAudio';

interface EmojiIqHowToPlayModalProps {
  onClose: () => void;
}

export const EmojiIqHowToPlayModal: React.FC<EmojiIqHowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-md max-h-[85vh] bg-white rounded-3xl p-5 shadow-2xl flex flex-col justify-between border-2 border-[#6C5CE7]/30 animate-in zoom-in-95">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
          <h2
            className="text-lg font-black font-['Fredoka',sans-serif] tracking-wide uppercase"
            style={{ color: EMOJI_IQ_COLORS.textPrimary }}
          >
            HOW TO PLAY EMOJI IQ
          </h2>

          <button
            onClick={() => {
              emojiIqAudio.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#241F3D] hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 py-3 text-xs leading-relaxed text-[#241F3D]">
          {/* Rule 1: Visual Arithmetic */}
          <div className="p-3 rounded-2xl bg-[#F7F5FF] border border-[#6C5CE7]/15">
            <h3 className="font-black text-sm text-[#6C5CE7] mb-1 flex items-center gap-1.5">
              <span>1. Deduce the Values</span>
            </h3>
            <p className="text-[#6B6780]">
              Each emoji represents a hidden integer. Look at the first rows to solve the values:
            </p>
            <div className="mt-1.5 p-2 rounded-xl bg-white border border-[#6C5CE7]/10 font-mono font-bold text-center">
              🍎 + 🍎 = 10 &nbsp;➔&nbsp; 🍎 = 5
            </div>
          </div>

          {/* Rule 2: Order of Operations */}
          <div className="p-3 rounded-2xl bg-[#F7F5FF] border border-[#6C5CE7]/15">
            <h3 className="font-black text-sm text-[#00B8D9] mb-1 flex items-center gap-1.5">
              <span>2. Order of Operations (PEMDAS)</span>
            </h3>
            <p className="text-[#6B6780]">
              In higher stages, multiplication (×) and division (÷) must always be calculated <b>before</b> addition (+) or subtraction (-)!
            </p>
            <div className="mt-1.5 p-2 rounded-xl bg-white border border-[#00B8D9]/20 font-mono font-bold text-center text-[11px]">
              🍎 + 🍌 × 🍇 &nbsp;➔&nbsp; 🍎 + (🍌 × 🍇)
            </div>
          </div>

          {/* Rule 3: Quantity & Visual Shifts */}
          <div className="p-3 rounded-2xl bg-[#F7F5FF] border border-[#6C5CE7]/15">
            <h3 className="font-black text-sm text-[#FFB703] mb-1 flex items-center gap-1.5">
              <span>3. Watch the Quantities!</span>
            </h3>
            <p className="text-[#6B6780]">
              A row might show pairs or triples (e.g. 🍌🍌🍌 = 15), while the final question asks for a single banana (🍌 = 5)!
            </p>
          </div>

          {/* Rule 4: Scoring & Tournament Combos */}
          <div className="p-3 rounded-2xl bg-[#F7F5FF] border border-[#6C5CE7]/15">
            <h3 className="font-black text-sm text-[#20C997] mb-1 flex items-center gap-1.5">
              <span>4. Speed & Combo Scoring</span>
            </h3>
            <p className="text-[#6B6780]">
              Answer quickly without hints to earn up to <b>+30% Speed Bonus</b> and <b>⭐ PERFECT!</b> ratings. Consecutive correct answers raise your Combo Multiplier up to <b>x2.0</b>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={() => {
            emojiIqAudio.playPop();
            onClose();
          }}
          className="w-full mt-2 py-3 rounded-2xl text-white font-black text-sm shadow-md hover:brightness-105 active:scale-95 transition-all"
          style={{
            backgroundColor: EMOJI_IQ_COLORS.primary,
          }}
        >
          Got It!
        </button>
      </div>
    </div>
  );
};
