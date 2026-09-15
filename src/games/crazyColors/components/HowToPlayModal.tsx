/**
 * Crazy Colors How To Play Visual Guide
 */

import React from 'react';
import { X, ArrowUp, RefreshCw, Star, ShieldAlert } from 'lucide-react';
import { CRAZY_COLORS_PALETTE } from '../constants';
import { crazyColorsAudio } from '../audioEngine';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div
      id="crazy-colors-how-to-play-modal"
      className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 text-white select-none animate-in fade-in duration-150"
    >
      <div className="w-full max-w-sm bg-[#242424] border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            <span>HOW TO PLAY</span>
          </h2>
          <button
            id="crazy-colors-help-close-btn"
            type="button"
            onClick={() => {
              crazyColorsAudio.playButton();
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions List */}
        <div className="space-y-4 py-4 text-left text-xs">
          {/* Rule 1: Tap to Jump */}
          <div className="flex gap-3 items-start bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center flex-shrink-0 text-cyan-300">
              <ArrowUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">1. Tap to Bounce</h3>
              <p className="text-white/70 mt-0.5 leading-relaxed">
                Tap anywhere on the screen or press <span className="font-bold text-cyan-300">Spacebar</span> to bounce your ball upwards against gravity.
              </p>
            </div>
          </div>

          {/* Rule 2: Color Matching */}
          <div className="flex gap-3 items-start bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center flex-shrink-0 text-pink-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">2. Match Obstacle Colors</h3>
              <p className="text-white/70 mt-0.5 leading-relaxed">
                Your ball can only pass through obstacle segments of the <span className="font-bold text-pink-400">SAME COLOR</span>. Hitting any other color shatters your ball!
              </p>
              <div className="flex gap-1.5 mt-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FF008C] shadow-[0_0_6px_#FF008C]" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#00D9FF] shadow-[0_0_6px_#00D9FF]" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#FFD800] shadow-[0_0_6px_#FFD800]" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#7A00FF] shadow-[0_0_6px_#7A00FF]" />
              </div>
            </div>
          </div>

          {/* Rule 3: Color Switcher Orbs */}
          <div className="flex gap-3 items-start bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center flex-shrink-0 text-yellow-300">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">3. Color Switchers</h3>
              <p className="text-white/70 mt-0.5 leading-relaxed">
                Passing through multi-colored floating orbs instantly alters your ball’s color to prepare for upcoming obstacles.
              </p>
            </div>
          </div>

          {/* Rule 4: Stars & 40 Levels */}
          <div className="flex gap-3 items-start bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0 text-amber-300">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">4. Collect Stars & Reach Portal</h3>
              <p className="text-white/70 mt-0.5 leading-relaxed">
                Collect golden stars for bonus score, reach the glowing finish portal at the top, and conquer all <span className="font-bold text-amber-300">40 Championship Levels</span>!
              </p>
            </div>
          </div>
        </div>

        {/* Got it button */}
        <button
          id="crazy-colors-help-got-it-btn"
          type="button"
          onClick={() => {
            crazyColorsAudio.playButton();
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold text-sm tracking-wide shadow-lg active:scale-95 transition-all"
        >
          GOT IT, LET'S PLAY!
        </button>
      </div>
    </div>
  );
};
