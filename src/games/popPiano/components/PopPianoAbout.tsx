import React from 'react';
import { ArrowLeft, Music, ShieldCheck, Sparkles, Award } from 'lucide-react';

interface PopPianoAboutProps {
  onBack: () => void;
}

export const PopPianoAbout: React.FC<PopPianoAboutProps> = ({ onBack }) => {
  return (
    <div
      id="pop-piano-about-view"
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
            About Pop Piano
          </h2>
          <p className="text-[11px] text-cyan-300 font-bold uppercase tracking-widest">
            Tournament Specification & Audio Architecture
          </p>
        </div>

        <div className="w-11" />
      </header>

      {/* ABOUT CONTENT */}
      <div className="my-6 max-w-lg mx-auto w-full space-y-4 text-xs text-slate-300 leading-relaxed">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wide mb-1.5">
            <Music className="w-4 h-4 text-cyan-400" />
            <span>Pop Piano — Official Tournament Edition</span>
          </div>
          <p>
            Pop Piano Tournament Edition is an authentic 40-level competitive rhythm game designed for precision tapping, reaction speed, and harmonic musical performance on TelePlay Ethiopia.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm uppercase tracking-wide mb-1.5">
            <Award className="w-4 h-4" />
            <span>Tournament Progression Rules</span>
          </div>
          <p>
            The tournament features exactly 40 sequential levels with strict unlock progression:
          </p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-slate-400">
            <li><strong className="text-emerald-300">Levels 1–5 (Hard):</strong> Begins with a mandatory 100-black-tile requirement on Level 1.</li>
            <li><strong className="text-blue-300">Levels 6–10 (Very Hard):</strong> 150–190 notes, fast alternating duos and trill swarms.</li>
            <li><strong className="text-purple-300">Levels 11–20 (Expert):</strong> 195–240 notes, syncopated bursts and complex cascades.</li>
            <li><strong className="text-pink-300">Levels 21–30 (Expert+):</strong> 245–290 notes, up to 820 px/s velocity.</li>
            <li><strong className="text-orange-300">Levels 31–39 (Extreme):</strong> 295–318 notes, extreme tempo shifts.</li>
            <li><strong className="text-amber-300">Level 40 (Master):</strong> 320 black tiles at 950 px/s ultimate tempo.</li>
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-sm uppercase tracking-wide mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Zero-Latency Acoustic Piano Synthesizer</span>
          </div>
          <p>
            Powered by the Web Audio API, every tile triggers an acoustic piano harmonic oscillator with physical hammer attack, authentic decay envelopes, and polyphonic voice pooling.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-sm uppercase tracking-wide mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Integrity & Fair Play</span>
          </div>
          <p>
            Scoring is completely deterministic and verifiable. No random bonuses or multipliers are used. Total score is the cumulative sum of each level's personal best score to eliminate score farming.
          </p>
        </div>
      </div>
    </div>
  );
};
