import React from 'react';
import { ArrowLeft, Target, Zap, ShieldAlert, Award, Clock, Music, CheckCircle2 } from 'lucide-react';

interface PopPianoHowToPlayProps {
  onBack: () => void;
}

export const PopPianoHowToPlay: React.FC<PopPianoHowToPlayProps> = ({ onBack }) => {
  return (
    <div
      id="pop-piano-how-to-play-view"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white overflow-y-auto custom-scrollbar"
    >
      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-[#0B132B]/90 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Menu"
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
            How to Play
          </h2>
          <p className="text-[11px] text-cyan-300 font-bold uppercase tracking-widest">
            Tournament Rules & Scoring Guide
          </p>
        </div>

        <div className="w-11" />
      </header>

      {/* CONTENT SECTIONS */}
      <div className="my-4 space-y-4 max-w-xl mx-auto w-full">
        {/* CORE OBJECTIVE */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm uppercase tracking-wide mb-1.5">
            <Music className="w-4 h-4" />
            <span>1. Core Gameplay & Objective</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Black piano tiles descend along 4 vertical lanes. Tap each black tile as it crosses the lower baseline indicator.
            Each correct tap produces authentic acoustic piano notes and advances your level progress.
          </p>
          <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            ⚡ Level 1 Tournament Mandate: You must successfully hit at least <strong>100 Black Tiles</strong> to clear Level 1!
          </div>
        </div>

        {/* CONTROLS */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm uppercase tracking-wide mb-1.5">
            <Target className="w-4 h-4" />
            <span>2. Ergonomic Controls</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li><strong className="text-white">Touch / Mobile:</strong> Tap directly anywhere inside the column corresponding to the falling black tile.</li>
            <li><strong className="text-white">Keyboard (Desktop):</strong> Use keys <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[11px]">D</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[11px]">F</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[11px]">J</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[11px]">K</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[11px]">1</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[11px]">2</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[11px]">3</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[11px]">4</kbd>.</li>
          </ul>
        </div>

        {/* DETERMINISTIC MULTI-FACTOR SCORING */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm uppercase tracking-wide mb-2">
            <Award className="w-4 h-4" />
            <span>3. Deterministic Competitive Scoring</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
            Pop Piano uses an authoritative, multi-factor scoring formula. No random bonuses!
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-start justify-between bg-black/20 p-2 rounded-xl">
              <div>
                <span className="font-bold text-white">Base Tile Score:</span>
                <p className="text-[11px] text-slate-400">Every hit black tile provides exactly 1 base point.</p>
              </div>
              <span className="font-mono text-cyan-300 font-bold">1 pt / tile</span>
            </div>

            <div className="flex items-start justify-between bg-black/20 p-2 rounded-xl">
              <div>
                <span className="font-bold text-white">Speed Bonus:</span>
                <p className="text-[11px] text-slate-400">Rewards lightning reaction time (&lt;200ms).</p>
              </div>
              <span className="font-mono text-cyan-300 font-bold">Up to +25 pts</span>
            </div>

            <div className="flex items-start justify-between bg-black/20 p-2 rounded-xl">
              <div>
                <span className="font-bold text-white">Accuracy & Precision:</span>
                <p className="text-[11px] text-slate-400">High % of PERFECT judgments & minimal off-beat hits.</p>
              </div>
              <span className="font-mono text-cyan-300 font-bold">Up to +50 pts</span>
            </div>

            <div className="flex items-start justify-between bg-black/20 p-2 rounded-xl">
              <div>
                <span className="font-bold text-white">Combo & Streak Milestones:</span>
                <p className="text-[11px] text-slate-400">Rewards consecutive unbroken notes (25, 50, 100+).</p>
              </div>
              <span className="font-mono text-cyan-300 font-bold">Up to +50 pts</span>
            </div>

            <div className="flex items-start justify-between bg-black/20 p-2 rounded-xl">
              <div>
                <span className="font-bold text-white">Difficulty & Completion:</span>
                <p className="text-[11px] text-slate-400">Tied to level number (up to Master) + clear bonus.</p>
              </div>
              <span className="font-mono text-cyan-300 font-bold">Up to +55 pts</span>
            </div>

            <div className="flex items-start justify-between bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl">
              <div>
                <span className="font-bold text-rose-300">Penalties:</span>
                <p className="text-[11px] text-slate-400">Deduction for missed black tiles or clicking wrong lanes.</p>
              </div>
              <span className="font-mono text-rose-400 font-bold">-5 pts / mistake</span>
            </div>
          </div>
        </div>

        {/* 40 LEVELS PROGRESSION & ANTI-FARMING */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-sm uppercase tracking-wide mb-1.5">
            <Zap className="w-4 h-4" />
            <span>4. 40-Level Progression & Anti-Farming</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            There are exactly 40 sequential levels. Completing Level N unlocks Level N+1.
            To prevent score farming, your <strong className="text-white">Cumulative Tournament Score</strong> is strictly the sum of your <strong className="text-amber-300">BEST SCORE</strong> on each level (Best L1 + Best L2 + ... + Best L40). Replaying a level only improves your score if you beat your previous record!
          </p>
        </div>
      </div>
    </div>
  );
};
