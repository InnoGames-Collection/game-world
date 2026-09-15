/**
 * Pause Modal for Puzzle Block
 */

import React, { useState } from 'react';
import { Play, RotateCcw, Grid, Home, Trophy, BookOpen, AlertCircle } from 'lucide-react';

interface PauseModalProps {
  score: number;
  levelId: number;
  onResume: () => void;
  onRestart: () => void;
  onLevelSelect: () => void;
  onLeaderboard: () => void;
  onHowToPlay: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  score,
  levelId,
  onResume,
  onRestart,
  onLevelSelect,
  onLeaderboard,
  onHowToPlay,
  onHome,
}) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xs rounded-3xl bg-gradient-to-b from-[#6b2a12] via-[#4e1d0c] to-[#300f05] border-2 border-[#d97c38] shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)] p-6 flex flex-col items-center gap-5 text-center text-amber-100">
        
        {/* Title */}
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-[#e89c62] font-bold">PUZZLE BLOCK</span>
          <h2 className="text-3xl font-black text-amber-300 font-serif tracking-wide drop-shadow">
            PAUSED
          </h2>
          <span className="text-xs text-amber-200/80 font-mono mt-0.5">
            Level {levelId} • Score: {score.toLocaleString()}
          </span>
        </div>

        {showExitConfirm ? (
          <div className="w-full space-y-3 py-2 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 mx-auto flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-xs text-amber-100/90 leading-snug">
              Exit to Menu? Current game board progress will be lost.
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="py-2.5 rounded-xl bg-white/10 font-bold text-xs uppercase text-white active:scale-95"
              >
                Keep Playing
              </button>
              <button
                onClick={onHome}
                className="py-2.5 rounded-xl bg-red-600 font-bold text-xs uppercase text-white shadow active:scale-95"
              >
                Exit to Menu
              </button>
            </div>
          </div>
        ) : (
          /* Buttons List */
          <div className="w-full flex flex-col gap-2.5">
            {/* Resume */}
            <button
              onClick={onResume}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 text-white font-black text-base shadow-lg border border-emerald-300 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              RESUME
            </button>

            {/* Leaderboard */}
            <button
              onClick={onLeaderboard}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-b from-[#b55823] to-[#7d3210] text-amber-100 font-bold text-sm border border-amber-400/80 shadow active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              LEADERBOARD
            </button>

            {/* Restart */}
            <button
              onClick={onRestart}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-b from-[#8a3f20] to-[#5a210d] text-amber-100 font-bold text-sm border border-[#d97c38] shadow active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              RESTART LEVEL
            </button>

            {/* Level Select & How to Play in 2 cols */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onLevelSelect}
                className="py-2.5 px-2 rounded-xl bg-gradient-to-b from-[#8a3f20] to-[#5a210d] text-amber-100 font-bold text-xs border border-[#d97c38] shadow active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>LEVELS</span>
              </button>

              <button
                onClick={onHowToPlay}
                className="py-2.5 px-2 rounded-xl bg-gradient-to-b from-[#8a3f20] to-[#5a210d] text-amber-100 font-bold text-xs border border-[#d97c38] shadow active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
                <span>RULES</span>
              </button>
            </div>

            {/* Home / Exit */}
            <button
              onClick={() => setShowExitConfirm(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 font-bold text-xs uppercase tracking-wider border border-red-500/40 shadow active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <Home className="w-3.5 h-3.5" />
              EXIT TO MENU
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
