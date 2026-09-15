/**
 * KNIFE MADNESS - About Screen
 * Technical architecture, tournament scoring guidelines, and engine details.
 */

import React from 'react';
import { ArrowLeft, Info, ShieldCheck, Cpu, Trophy, Sparkles } from 'lucide-react';

interface KnifeMadnessAboutProps {
  onBack: () => void;
}

export const KnifeMadnessAbout: React.FC<KnifeMadnessAboutProps> = ({ onBack }) => {
  return (
    <div
      id="knife-madness-about"
      className="relative w-full h-full max-w-md mx-auto flex flex-col p-4 bg-[#050e1d] text-white select-none overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          id="btn-about-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Menu</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-black uppercase tracking-wider text-amber-300">
            About Game
          </h2>
          <p className="text-[10px] text-slate-400">Architecture & Rules</p>
        </div>

        <div className="w-14" />
      </div>

      {/* Content */}
      <div className="space-y-3 my-3 text-xs">
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
            <Trophy className="w-4 h-4" />
            <span>Anti-Farming Tournament Model</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Unlike arcade games where infinite replays artificially inflate leaderboard standing, Knife Madness uses a strict, deterministic tournament structure. Your total career score is the exact sum of your single best score on each of the 40 stages.
          </p>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
            <Cpu className="w-4 h-4" />
            <span>60 FPS Vector Physics Engine</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Custom 3D pseudo-volumetric canvas renderer with simulated depth extrusions, multi-layer ambient occlusion shadows, dynamic rim lighting, and deterministic angular collision math with sub-degree precision.
          </p>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Procedural Audio Synthesis</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Zero external audio files required. All throw whooshes, timber clunks, metallic ricochets, fruit squishes, and victory fanfares are synthesized live via Web Audio API oscillators and gain envelopes.
          </p>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>telebirr SuperApp Compliance</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Version 2.4.0-release. Engineered to work inside mobile webviews with responsive touch coordinates, viewport scaling, and immediate touch feedback.
          </p>
        </div>
      </div>

      <div className="mt-auto text-center text-[10px] text-slate-400 pb-2">
        GameON Tele • Knife Madness 3D Edition
      </div>
    </div>
  );
};
