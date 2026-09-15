/**
 * About Modal for Block (Puzzle Block)
 * Game overview, 10x10 board mechanics, version, and architecture notes.
 */

import React from 'react';
import { X, Info, ShieldCheck, Grid3X3, Layers, Award } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#6b2a12] via-[#4e1d0c] to-[#2c0d05] border-2 border-[#d97c38] shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)] p-6 flex flex-col items-center gap-4 text-amber-100 font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center">
              <Info className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow leading-none">
                ABOUT BLOCK
              </h2>
              <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">
                Puzzle Block Game • v1.4
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-[#341107] border border-[#6e2e14] text-amber-300 flex items-center justify-center cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Cards List */}
        <div className="w-full flex flex-col gap-2.5 max-h-[55vh] overflow-y-auto pr-0.5">
          {/* Board Spec */}
          <div className="p-3 rounded-2xl bg-[#240c06]/85 border border-[#8a3f20]/60 flex items-start gap-3 shadow-inner">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 shrink-0">
              <Grid3X3 className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-amber-200">10×10 Playfield Board</span>
              <span className="text-[11px] text-amber-300/80 leading-relaxed mt-0.5">
                Every level begins with a 100% empty 100-cell grid. Blocks snap with pixel-perfect anchor accuracy.
              </span>
            </div>
          </div>

          {/* Tray Spec */}
          <div className="p-3 rounded-2xl bg-[#240c06]/85 border border-[#8a3f20]/60 flex items-start gap-3 shadow-inner">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-amber-200">Independent 3-Piece Tray</span>
              <span className="text-[11px] text-amber-300/80 leading-relaxed mt-0.5">
                Tray pieces are completely isolated from the board until dropped. Features emergency reshuffles to prevent deadlocks.
              </span>
            </div>
          </div>

          {/* Campaign Spec */}
          <div className="p-3 rounded-2xl bg-[#240c06]/85 border border-[#8a3f20]/60 flex items-start gap-3 shadow-inner">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-amber-200">40 Campaign Challenges</span>
              <span className="text-[11px] text-amber-300/80 leading-relaxed mt-0.5">
                Progressive difficulty with target scores, lines cleared, 3-star thresholds, and high-score persistence.
              </span>
            </div>
          </div>

          {/* Audio Engine */}
          <div className="p-3 rounded-2xl bg-[#240c06]/85 border border-[#8a3f20]/60 flex items-start gap-3 shadow-inner">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-amber-200">Zero-Scroll Responsive Engine</span>
              <span className="text-[11px] text-amber-300/80 leading-relaxed mt-0.5">
                Engineered for flawless touch controls, natural finger lift, and Android back button navigation.
              </span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-b from-[#8a3f20] to-[#501c09] text-amber-100 font-black text-sm border border-[#d97c38] shadow active:scale-95 transition-all flex items-center justify-center cursor-pointer mt-1 hover:brightness-110"
        >
          BACK TO MENU
        </button>
      </div>
    </div>
  );
};
