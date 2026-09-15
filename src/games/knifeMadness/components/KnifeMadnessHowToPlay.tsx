/**
 * KNIFE MADNESS - How To Play Screen
 * Clear, engaging rule breakdown detailing knife throws, fruit slicing, precision scoring,
 * and the critical failure condition.
 */

import React from 'react';
import { ArrowLeft, Target, ShieldAlert, Sparkles, Flame, Apple, Zap } from 'lucide-react';

interface KnifeMadnessHowToPlayProps {
  onBack: () => void;
}

export const KnifeMadnessHowToPlay: React.FC<KnifeMadnessHowToPlayProps> = ({ onBack }) => {
  return (
    <div
      id="knife-madness-how-to-play"
      className="relative w-full h-full max-w-md mx-auto flex flex-col p-4 bg-[#050e1d] text-white select-none overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          id="btn-how-to-play-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Menu</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-black uppercase tracking-wider text-amber-300">
            How To Play
          </h2>
          <p className="text-[10px] text-slate-400">Rules & Strategy Guide</p>
        </div>

        <div className="w-14" />
      </div>

      {/* Guide Cards */}
      <div className="space-y-3 my-3">
        {/* Rule 1: Tap to Throw */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-amber-300">1. Tap Anywhere To Throw</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Tap the screen to launch your knife upward into the spinning 3D target. Place all required knives to shatter the target and advance!
            </p>
          </div>
        </div>

        {/* Rule 2: CRITICAL FAILURE CONDITION */}
        <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-3 flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-red-300">2. Avoid Blade Collisions</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              <strong className="text-white">Strict Rule:</strong> Your throw fails only if it collides with an already embedded knife or obstacle blade. Landing on the target surface or slicing fruit is always safe!
            </p>
          </div>
        </div>

        {/* Rule 3: Slice Fruits for Bonus Points */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Apple className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-emerald-300">3. Slice Fruits For +2 to +3</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Cut through apples, oranges, lemons, and watermelons attached to the target perimeter to earn extra tournament points and juice splash effects.
            </p>
          </div>
        </div>

        {/* Rule 4: Precision & Combos */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-cyan-300">4. High Precision & Combos</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Embedding a knife tightly next to an existing blade without touching awards <span className="text-cyan-300 font-bold">Extreme Precision (+3)</span>. Hitting rapid consecutive throws triggers <span className="text-amber-300 font-bold">Combo Streaks (+1 to +3)</span>.
            </p>
          </div>
        </div>

        {/* Rule 5: Boss Targets */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-purple-300">5. Boss Encounters Every 5 Stages</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Stages 5, 10, 15, 20, 25, 30, 35, and 40 feature Boss Targets with erratic reversing rotation patterns and pre-existing obstacle blades.
            </p>
          </div>
        </div>
      </div>

      {/* Button to Play */}
      <button
        onClick={onBack}
        className="mt-auto w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wide transition active:scale-95 shadow-lg"
      >
        Understood — Let's Play!
      </button>
    </div>
  );
};
