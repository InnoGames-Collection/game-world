/**
 * 40-Level Campaign Selection Screen for Puzzle Block
 * Shows 1 to 40 nodes with locks, current highlight, 1-3 stars, and difficulty badges.
 */

import React from 'react';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { PUZZLE_BLOCK_LEVELS } from '../levelBank';
import { LevelDefinition } from '../types';

interface LevelSelectModalProps {
  highestUnlockedLevel: number;
  starsRecord: Record<number, number>;
  bestScores: Record<number, number>;
  onSelectLevel: (level: LevelDefinition) => void;
  onBack: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  highestUnlockedLevel,
  starsRecord,
  bestScores,
  onSelectLevel,
  onBack,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#4a180b] via-[#351006] to-[#1c0803] flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="px-4 py-3 bg-[#2c0d06]/90 border-b border-[#6e2e14] flex items-center justify-between shadow-md">
        <button
          onClick={onBack}
          aria-label="Back"
          className="h-10 px-3 rounded-xl bg-gradient-to-b from-[#8a3f20] to-[#501c09] border border-[#d97c38] text-amber-200 flex items-center gap-2 text-sm font-bold shadow cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>PORTAL</span>
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-xl font-black text-amber-300 font-serif tracking-wider drop-shadow">
            LEVEL SELECT
          </h2>
          <span className="text-[11px] font-bold text-amber-400/80 uppercase tracking-widest">
            40 Campaign Levels
          </span>
        </div>

        {/* Total Stars Counter */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-600/60 text-amber-300 font-black text-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>
            {Object.values(starsRecord).reduce((a: number, b: number) => a + b, 0)} / 120
          </span>
        </div>
      </div>

      {/* 40 Levels Scrollable Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-md mx-auto grid grid-cols-4 sm:grid-cols-5 gap-3">
          {PUZZLE_BLOCK_LEVELS.map((lvl) => {
            const isUnlocked = lvl.id <= highestUnlockedLevel;
            const isCurrent = lvl.id === highestUnlockedLevel;
            const stars = starsRecord[lvl.id] || 0;
            const bestScore = bestScores[lvl.id] || 0;

            return (
              <button
                key={lvl.id}
                onClick={() => isUnlocked && onSelectLevel(lvl)}
                disabled={!isUnlocked}
                className={`relative flex flex-col items-center justify-between p-2 rounded-2xl border transition-all aspect-square cursor-pointer ${
                  isCurrent
                    ? 'bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800 border-amber-300 text-stone-950 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-105 animate-pulse'
                    : isUnlocked
                    ? 'bg-gradient-to-b from-[#6e2a14] via-[#4e1b0b] to-[#341106] border-[#b55823] text-amber-100 shadow-md hover:scale-105'
                    : 'bg-[#220904]/70 border-stone-800 text-stone-600 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Level Number */}
                <div className="w-full flex justify-between items-start">
                  <span className={`text-xs font-black font-mono leading-none ${isCurrent ? 'text-stone-950' : 'text-amber-200'}`}>
                    {lvl.id}
                  </span>
                  {/* Difficulty Tag */}
                  <span className={`text-[8px] font-black uppercase px-1 rounded ${
                    lvl.difficulty.includes('master') ? 'bg-red-950/80 text-red-300' :
                    lvl.difficulty.includes('extreme') ? 'bg-orange-950/80 text-orange-300' :
                    lvl.difficulty.includes('expert') ? 'bg-purple-950/80 text-purple-300' :
                    'bg-amber-950/80 text-amber-300'
                  }`}>
                    {lvl.difficulty}
                  </span>
                </div>

                {/* Center Graphic: Lock icon or Level Badge */}
                <div className="flex items-center justify-center my-auto">
                  {!isUnlocked ? (
                    <Lock className="w-5 h-5 text-stone-600" />
                  ) : (
                    <span className={`text-xl font-black font-serif ${isCurrent ? 'text-stone-950' : 'text-amber-300'}`}>
                      {lvl.id}
                    </span>
                  )}
                </div>

                {/* Bottom Star Rating */}
                <div className="flex items-center gap-0.5">
                  {isUnlocked ? (
                    <>
                      <Star className={`w-3 h-3 ${stars >= 1 ? 'fill-amber-300 text-amber-300' : 'text-stone-600'}`} />
                      <Star className={`w-3 h-3 ${stars >= 2 ? 'fill-amber-300 text-amber-300' : 'text-stone-600'}`} />
                      <Star className={`w-3 h-3 ${stars >= 3 ? 'fill-amber-300 text-amber-300' : 'text-stone-600'}`} />
                    </>
                  ) : (
                    <div className="h-3" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Hint Footer */}
      <div className="px-4 py-2 bg-[#200803] border-t border-[#4a180b] text-center text-xs text-amber-300/70 font-medium">
        Complete each level to unlock the next challenge!
      </div>
    </div>
  );
};
