/**
 * Helix Jump Grandmaster Final Championship Screen (Level 40 Complete)
 */

import React from 'react';
import { RotateCcw, Grid, Home, Trophy, Sparkles } from 'lucide-react';
import { helixAudio } from '../audioEngine';

interface FinalCompleteModalProps {
  score: number;
  bestScore: number;
  totalStars: number;
  onReplayLevel40: () => void;
  onOpenLevels: () => void;
  onHome: () => void;
}

export const FinalCompleteModal: React.FC<FinalCompleteModalProps> = ({
  score,
  bestScore,
  totalStars,
  onReplayLevel40,
  onOpenLevels,
  onHome,
}) => {
  return (
    <div
      id="helix-final-complete-modal"
      className="absolute inset-0 z-50 bg-gradient-to-b from-slate-950/95 via-amber-950/90 to-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-black rounded-3xl p-6 border-2 border-amber-400/60 shadow-2xl flex flex-col items-center text-center">
        {/* Animated Championship Cup */}
        <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-xl">
            <Trophy className="w-10 h-10 stroke-[2.5]" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-300 animate-spin" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-amber-400 uppercase tracking-tight">
          Helix Jump Master!
        </h2>
        <p className="text-xs font-bold text-white/90 tracking-wide uppercase mt-1 mb-4">
          All 40 Championship Levels Completed
        </p>

        {/* Stats Summary Card */}
        <div className="w-full bg-white/5 rounded-2xl p-4 mb-5 border border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold">Total Stars</span>
            <span className="text-amber-400 font-black text-sm">{totalStars} / 120 ★</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold">Level 40 Score</span>
            <span className="text-white font-black text-sm">{score}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold">Level 40 Best</span>
            <span className="text-amber-300 font-black text-sm">{bestScore}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              helixAudio.playButtonClick();
              onReplayLevel40();
            }}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay Level 40</span>
          </button>

          <button
            onClick={() => {
              helixAudio.playButtonClick();
              onOpenLevels();
            }}
            className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform border border-white/10 cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            <span>Level Select</span>
          </button>

          <button
            onClick={() => {
              helixAudio.playButtonClick();
              onHome();
            }}
            className="w-full h-12 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-400 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
