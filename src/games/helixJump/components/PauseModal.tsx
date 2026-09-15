/**
 * Helix Jump Pause Modal
 */

import React from 'react';
import { Play, RotateCcw, Grid, Home } from 'lucide-react';
import { helixAudio } from '../audioEngine';

interface PauseModalProps {
  levelId: number;
  score: number;
  onResume: () => void;
  onRestart: () => void;
  onOpenLevels: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  levelId,
  score,
  onResume,
  onRestart,
  onOpenLevels,
  onHome,
}) => {
  return (
    <div
      id="helix-pause-modal"
      className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="w-full max-w-xs bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-1">
          Game Paused
        </h2>
        <p className="text-xs font-bold text-sky-400 mb-5">
          Level {levelId} • Current Score: {score}
        </p>

        <div className="w-full flex flex-col gap-2.5">
          {/* RESUME */}
          <button
            onClick={() => {
              helixAudio.playButtonClick();
              onResume();
            }}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume</span>
          </button>

          {/* RESTART */}
          <button
            onClick={() => {
              helixAudio.playButtonClick();
              onRestart();
            }}
            className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform border border-white/10 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Level</span>
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
            <span>Level Select</span>
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
