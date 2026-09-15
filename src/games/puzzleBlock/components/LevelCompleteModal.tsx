/**
 * Level Complete Modal for Puzzle Block
 * Displays stars earned, score, lines, best score, Next Level, Replay, Level Select.
 */

import React from 'react';
import { Star, ArrowRight, RotateCcw, Grid } from 'lucide-react';
import { LevelDefinition } from '../types';

interface LevelCompleteModalProps {
  level: LevelDefinition;
  score: number;
  lines: number;
  bestScore: number;
  stars: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  score,
  lines,
  bestScore,
  stars,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onLevelSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#6b2a12] via-[#4e1d0c] to-[#2c0d05] border-2 border-amber-400 shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)] p-6 flex flex-col items-center gap-4 text-center text-amber-100">
        
        {/* Victory Header */}
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">VICTORY!</span>
          <h2 className="text-3xl font-black text-amber-300 font-serif tracking-wide drop-shadow">
            LEVEL {level.id} COMPLETE
          </h2>
          <span className="text-xs text-amber-200/80 font-medium">{level.title}</span>
        </div>

        {/* 3-Star Rating Animation */}
        <div className="flex items-center gap-3 my-1">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars;
            return (
              <div
                key={starIdx}
                className={`p-2 rounded-2xl border transition-all ${
                  isEarned
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-110 shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-bounce'
                    : 'bg-stone-900/40 border-stone-700 text-stone-600 scale-90'
                }`}
              >
                <Star className={`w-8 h-8 ${isEarned ? 'fill-amber-400 text-amber-400' : 'text-stone-600'}`} />
              </div>
            );
          })}
        </div>

        {/* Stats Table */}
        <div className="w-full p-4 rounded-2xl bg-[#240c06]/80 border border-[#8a3f20]/60 flex flex-col gap-2.5 shadow-inner">
          <div className="flex justify-between items-center text-sm">
            <span className="text-amber-300/80 font-bold">Final Score:</span>
            <span className="text-lg font-black text-amber-200 font-mono">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-amber-300/80 font-bold">Lines Cleared:</span>
            <span className="text-base font-black text-amber-200 font-mono">{lines}</span>
          </div>
          <div className="flex justify-between items-center text-sm pt-2 border-t border-[#4e1d0c]">
            <span className="text-emerald-400 font-bold">Best Score:</span>
            <span className="text-base font-black text-emerald-300 font-mono">{bestScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full flex flex-col gap-2.5 mt-2">
          {hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-black text-base shadow-lg border border-amber-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer hover:brightness-110"
            >
              <span>NEXT LEVEL</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          <div className="flex gap-2 w-full">
            <button
              onClick={onReplay}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#3d160b] text-amber-200/90 font-bold text-sm border border-[#6e2e14] shadow active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              REPLAY
            </button>

            <button
              onClick={onLevelSelect}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#3d160b] text-amber-200/90 font-bold text-sm border border-[#6e2e14] shadow active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Grid className="w-4 h-4" />
              LEVELS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
