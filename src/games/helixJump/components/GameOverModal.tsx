/**
 * Helix Jump Game Over Modal
 */

import React from 'react';
import { RotateCcw, Grid, Home, AlertTriangle } from 'lucide-react';
import { helixAudio } from '../audioEngine';

interface GameOverModalProps {
  levelId: number;
  score: number;
  bestScore: number;
  onRetry: () => void;
  onOpenLevels: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  levelId,
  score,
  bestScore,
  onRetry,
  onOpenLevels,
  onHome,
}) => {
  return (
    <div
      id="helix-game-over-modal"
      className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="w-full max-w-xs bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 border border-rose-500/30 shadow-2xl flex flex-col items-center text-center">
        {/* Danger Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-500 flex items-center justify-center mb-3">
          <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
        </div>

        <h2 className="text-2xl font-black text-white uppercase tracking-wider">
          Game Over
        </h2>
        <p className="text-xs font-bold text-rose-400 mb-4">
          Crashed on Level {levelId}
        </p>

        {/* Score & Best Score Grid */}
        <div className="w-full grid grid-cols-2 gap-2 bg-white/5 rounded-2xl p-3 mb-5 border border-white/10">
          <div>
            <div className="text-[10px] font-extrabold uppercase text-slate-400">Score</div>
            <div className="text-xl font-black text-white">{score}</div>
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase text-amber-400">Best</div>
            <div className="text-xl font-black text-amber-300">{bestScore}</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {/* RETRY */}
          <button
            onClick={() => {
              helixAudio.playButtonClick();
              onRetry();
            }}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          {/* LEVELS */}
          <button
            onClick={() => {
              helixAudio.playButtonClick();
              onOpenLevels();
            }}
            className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform border border-white/10 cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            <span>Select Level</span>
          </button>

          {/* HOME */}
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
