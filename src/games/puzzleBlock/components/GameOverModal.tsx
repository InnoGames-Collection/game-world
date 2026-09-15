/**
 * Game Over (No More Moves) Modal
 */

import React from 'react';
import { RotateCcw, Grid, Home } from 'lucide-react';
import { LevelDefinition } from '../types';

interface GameOverModalProps {
  level: LevelDefinition;
  score: number;
  bestScore: number;
  onRetry: () => void;
  onLevelSelect: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  score,
  bestScore,
  onRetry,
  onLevelSelect,
  onHome,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#5c1c14] via-[#42120b] to-[#250905] border-2 border-red-500/80 shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.3)] p-6 flex flex-col items-center gap-4 text-center text-amber-100">
        
        {/* Header */}
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-red-400 font-bold">NO MORE MOVES</span>
          <h2 className="text-3xl font-black text-amber-300 font-serif tracking-wide drop-shadow">
            GAME OVER
          </h2>
          <span className="text-xs text-amber-200/80 font-medium">Level {level.id} • {level.title}</span>
        </div>

        {/* Score Card */}
        <div className="w-full p-4 rounded-2xl bg-[#1f0804]/80 border border-red-950 flex flex-col gap-2.5 shadow-inner">
          <div className="flex justify-between items-center text-sm">
            <span className="text-amber-300/80 font-bold">Your Score:</span>
            <span className="text-lg font-black text-amber-200 font-mono">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-amber-300/80 font-bold">Target Score:</span>
            <span className="text-base font-black text-amber-400/90 font-mono">{level.targetScore.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm pt-2 border-t border-[#3d1309]">
            <span className="text-amber-400 font-bold">All-Time Best:</span>
            <span className="text-base font-black text-amber-300 font-mono">{bestScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full flex flex-col gap-2.5 mt-2">
          <button
            onClick={onRetry}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-black text-base shadow-lg border border-amber-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer hover:brightness-110"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>TRY AGAIN</span>
          </button>

          <div className="flex gap-2 w-full">
            <button
              onClick={onLevelSelect}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#341107] text-amber-200/90 font-bold text-sm border border-[#5c1c14] shadow active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Grid className="w-4 h-4" />
              LEVELS
            </button>

            <button
              onClick={onHome}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#341107] text-stone-300 font-bold text-sm border border-stone-800 shadow active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              PORTAL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
