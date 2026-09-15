import React from 'react';
import { ArrowLeft, Target, Layers, Zap, AlertTriangle, Sparkles } from 'lucide-react';

interface BubbleShooterHowToPlayProps {
  onClose: () => void;
}

export const BubbleShooterHowToPlay: React.FC<BubbleShooterHowToPlayProps> = ({ onClose }) => {
  return (
    <div
      id="bubble-shooter-how-to-play-view"
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
          <h2 className="text-xl font-black text-white uppercase tracking-wider">How To Play</h2>
          <p className="text-[11px] text-cyan-300 font-bold uppercase tracking-widest">
            Rules & Master Strategies
          </p>
        </div>

        <div className="w-11 h-11" />
      </header>

      {/* CONTENT */}
      <main className="relative z-10 flex-1 py-4 space-y-4 text-slate-300 text-xs leading-relaxed overflow-y-auto custom-scrollbar pr-1">
        {/* Core Objective */}
        <section className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Core Objective</span>
          </div>
          <p>
            Aim your 3D bubble launcher toward clusters of 3 or more bubbles of the identical color to pop them. Clear all bubbles before the ceiling descends past the danger line.
          </p>
        </section>

        {/* Controls */}
        <section className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Controls & Bank Shots</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            <li><strong>Touch & Drag:</strong> Direct the luminous dashed aiming guideline.</li>
            <li><strong>Release:</strong> Launch your bubble toward the target hex cell.</li>
            <li><strong>Side Walls:</strong> Rebound shots off side cushions to navigate around obstacles and reach high anchor points.</li>
          </ul>
        </section>

        {/* Avalanches & Cascades */}
        <section className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Drop Avalanches (Cascades)</span>
          </div>
          <p>
            Any bubbles that become disconnected from the ceiling after a match will fall away as dropped clusters. Detaching massive unsupported groups awards high cascade bonuses!
          </p>
        </section>

        {/* Fouls & Board Advance */}
        <section className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Fouls & Descending Ceiling</span>
          </div>
          <p>
            Every shot that fails to create a match adds a foul. When fouls exceed the limit, the entire hex grid advances downwards by one row. Prevent the board from reaching your launcher!
          </p>
        </section>

        {/* Pro Tips */}
        <section className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-2 text-cyan-100">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Tournament Pro Tips</span>
          </div>
          <ul className="list-disc list-inside space-y-1">
            <li>Aim high: Severing an upper branch drops all connected lower bubbles at once.</li>
            <li>Monitor the Next Bubble in the pod to plan consecutive combo moves.</li>
            <li>Keep fouls at zero to earn the coveted <strong>PERFECT</strong> rating and 3 stars!</li>
          </ul>
        </section>
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
