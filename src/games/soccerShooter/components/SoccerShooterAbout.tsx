import React from 'react';
import { ArrowLeft, Info, ShieldCheck, Cpu, Flame, Layers } from 'lucide-react';

interface SoccerShooterAboutProps {
  onClose: () => void;
}

export const SoccerShooterAbout: React.FC<SoccerShooterAboutProps> = ({ onClose }) => {
  return (
    <div
      id="soccer-shooter-about-view"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#061224] via-[#091b36] to-[#040c18] overflow-y-auto custom-scrollbar"
    >
      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to Menu"
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-xl font-black text-white uppercase tracking-wider">About</h2>
          <p className="text-[11px] text-cyan-300 font-bold uppercase tracking-widest">
            TelePlay Game Studios
          </p>
        </div>

        <div className="w-11 h-11" />
      </header>

      {/* CONTENT */}
      <main className="relative z-10 flex-1 py-4 space-y-3.5 text-xs text-slate-300 overflow-y-auto custom-scrollbar pr-1">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1.5">
          <div className="text-base font-black text-white uppercase">Soccer Shooter Pro Arcade</div>
          <div className="text-[11px] text-cyan-300 font-mono">Version 3.5.0 Tournament Edition</div>
          <p className="text-[11px] text-slate-400 mt-2">
            Engineered specifically for high-precision competitive play with deterministic tournament physics, bank-shot raycasting, and 40 progressive stages.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
          <div className="text-xs font-black text-white uppercase flex items-center gap-2 border-b border-white/10 pb-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Architecture & Engine</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Physics:</span>
              <span className="text-white font-mono">Hexagonal Coordinate Raycaster</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Graphics:</span>
              <span className="text-white font-mono">3D Spherical Shader Lighting</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Audio:</span>
              <span className="text-white font-mono">Web Audio API Synthesis</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Stages:</span>
              <span className="text-white font-mono">40 Sequentially Locked Levels</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Anti-Farming:</span>
              <span className="text-emerald-400 font-bold">Sum of Best Level Scores</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="text-xs font-black text-white uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Fair Play Certified</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All 40 stages are deterministically scored. Replaying completed stages only updates your record if you achieve a higher score, preserving authentic leaderboard integrity.
          </p>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          Return to Menu
        </button>
      </footer>
    </div>
  );
};
