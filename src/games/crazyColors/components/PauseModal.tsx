/**
 * Crazy Colors Pause Modal
 * Direct options: RESUME, RESTART, LEVELS, MENU
 */

import React from 'react';
import { Play, RotateCcw, Grid, Home } from 'lucide-react';
import { crazyColorsAudio } from '../audioEngine';

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
      id="crazy-colors-pause-modal"
      className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white select-none animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xs bg-[#242424] border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Title */}
        <div className="mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
            LEVEL {levelId}
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white mt-1">PAUSED</h2>
          <div className="mt-2 text-xs font-semibold text-white/50">
            CURRENT SCORE: <span className="text-white font-mono">{score.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Resume */}
          <button
            id="crazy-colors-pause-resume-btn"
            type="button"
            onClick={() => {
              crazyColorsAudio.playButton();
              onResume();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold text-base shadow-[0_0_16px_rgba(0,217,255,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>RESUME</span>
          </button>

          {/* Restart */}
          <button
            id="crazy-colors-pause-restart-btn"
            type="button"
            onClick={() => {
              crazyColorsAudio.playButton();
              onRestart();
            }}
            className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-semibold text-sm border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-amber-300" />
            <span>RESTART LEVEL</span>
          </button>

          {/* Levels */}
          <button
            id="crazy-colors-pause-levels-btn"
            type="button"
            onClick={() => {
              crazyColorsAudio.playButton();
              onOpenLevels();
            }}
            className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-semibold text-sm border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Grid className="w-4 h-4 text-cyan-300" />
            <span>SELECT LEVEL</span>
          </button>

          {/* Home */}
          <button
            id="crazy-colors-pause-home-btn"
            type="button"
            onClick={() => {
              crazyColorsAudio.playButton();
              onHome();
            }}
            className="w-full py-2.5 px-4 text-xs font-bold text-white/40 hover:text-white/80 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5 mt-1"
          >
            <Home className="w-4 h-4" />
            <span>Exit to Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
