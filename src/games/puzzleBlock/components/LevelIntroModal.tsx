/**
 * Pre-Level Introduction & Objective Modal
 */

import React from 'react';
import { Play, Grid } from 'lucide-react';
import { LevelDefinition } from '../types';

interface LevelIntroModalProps {
  level: LevelDefinition;
  onStart: () => void;
  onLevelSelect: () => void;
}

export const LevelIntroModal: React.FC<LevelIntroModalProps> = ({
  level,
  onStart,
  onLevelSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#6b2a12] via-[#4e1d0c] to-[#2c0d05] border-2 border-[#d97c38] shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)] p-6 flex flex-col items-center gap-4 text-center text-amber-100">
        
        {/* Header */}
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-[#e89c62] font-bold">PUZZLE BLOCK</span>
          <h2 className="text-3xl font-black text-amber-300 font-serif tracking-wide drop-shadow">
            LEVEL {level.id}
          </h2>
          <span className="text-sm font-semibold text-amber-200/90">{level.title}</span>
          
          {/* Difficulty Badge */}
          <div className="mt-2 px-3 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 font-black text-xs uppercase tracking-wider">
            DIFFICULTY: {level.difficulty.toUpperCase()}
          </div>
        </div>

        {/* Objective Card */}
        <div className="w-full p-4 rounded-2xl bg-[#240c06]/80 border border-[#8a3f20]/60 flex flex-col gap-2 shadow-inner">
          <span className="text-[11px] uppercase font-bold text-[#e89c62] tracking-wider">
            MISSION OBJECTIVE
          </span>
          <p className="text-sm text-amber-100 font-medium leading-relaxed">
            {level.description}
          </p>

          <div className="mt-2 pt-2 border-t border-[#4e1d0c] flex justify-around text-center">
            <div>
              <span className="block text-[10px] text-amber-400/80 font-bold uppercase">Target Score</span>
              <span className="text-base font-black text-amber-300 font-mono">
                {level.targetScore.toLocaleString()}
              </span>
            </div>
            {level.targetLines && (
              <div>
                <span className="block text-[10px] text-amber-400/80 font-bold uppercase">Clear Lines</span>
                <span className="text-base font-black text-amber-300 font-mono">
                  {level.targetLines} Lines
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 mt-2">
          <button
            onClick={onStart}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 text-white font-black text-base shadow-lg border border-emerald-300 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer hover:brightness-110"
          >
            <Play className="w-5 h-5 fill-white" />
            START LEVEL
          </button>

          <button
            onClick={onLevelSelect}
            className="w-full py-2.5 px-4 rounded-xl bg-[#3d160b] text-amber-200/90 font-bold text-sm border border-[#6e2e14] shadow active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            LEVEL SELECT
          </button>
        </div>
      </div>
    </div>
  );
};
