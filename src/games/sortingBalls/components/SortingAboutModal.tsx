import React from 'react';
import { Info, X, ShieldCheck, Sparkles, Layers } from 'lucide-react';

interface SortingAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SortingAboutModal: React.FC<SortingAboutModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#070b16]/95 backdrop-blur-md flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-md mx-auto space-y-4 pb-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                ABOUT SORTING BALL
              </h2>
              <p className="text-xs text-slate-400">Version 2026.4.0 • Championship Edition</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            aria-label="Close About"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Game Overview</span>
            </h3>
            <p>
              <strong>Sorting Ball</strong> is a competitive 3D spatial logic puzzle. Test your tactical planning across 40 progressively demanding championship levels, featuring realistic physical ball dynamics and fluid Three.js graphics.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Controls & Ergonomics</span>
            </h3>
            <p>
              Designed for effortless single-finger touch and desktop mouse interaction. Tap any tube to lift balls, then tap the destination tube to transfer. Smart auto-batching lifts contiguous matching balls together to streamline multi-ball plays.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Strategy Note</span>
            </h3>
            <p>
              Every level is mathematically guaranteed 100% solvable. Focus on freeing up buffer tubes early, keep matching sequences together, and minimize unnecessary back-and-forth moves to maximize your Par Move Efficiency Score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
