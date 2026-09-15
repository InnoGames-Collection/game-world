/**
 * Solitaire Level Selection Screen
 * Exactly 40 levels (Level 1 to Level 40).
 * Shows locked, unlocked, and completed levels with 1-3 stars, best score, and best time.
 */

import React from 'react';
import { ALL_40_SOLITAIRE_LEVELS } from '../levelBank';
import { SolitaireSaveData } from '../types';
import { soundManager } from '../audioEngine';
import { ArrowLeft, Lock, Star, Trophy, Clock } from 'lucide-react';

interface LevelSelectScreenProps {
  saveData: SolitaireSaveData;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  saveData,
  onSelectLevel,
  onBack,
}) => {
  const totalStars = (Object.values(saveData.stars) as number[]).reduce((a, b) => a + (b || 0), 0);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#004d2a] overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Deep Emerald Green Felt Table Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 25%, #007a40 0%, #005a30 50%, #00361d 100%)',
        }}
      />

      {/* TOP HEADER */}
      <div className="relative z-20 flex items-center justify-between p-3 bg-black/40 backdrop-blur-md border-b border-white/15 text-white">
        <button
          onClick={() => {
            soundManager.playButton();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs font-bold border border-white/20 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-base font-black text-amber-300 uppercase tracking-wider">
            CAMPAIGN LEVELS
          </h2>
          <span className="text-[10px] text-emerald-200 font-medium">40 Progressive Solitaire Trials</span>
        </div>

        {/* Stars Tally Badge */}
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-black">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{totalStars} / 120</span>
        </div>
      </div>

      {/* 40 LEVELS GRID */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 pb-8">
          {ALL_40_SOLITAIRE_LEVELS.map((cfg) => {
            const isUnlocked = cfg.level <= saveData.highestUnlockedLevel;
            const isCurrent = cfg.level === saveData.highestUnlockedLevel;
            const stars = saveData.stars[cfg.level] || 0;
            const bestScore = saveData.bestScores[cfg.level];
            const isDraw3 = cfg.mode === 'draw3';

            return (
              <div
                key={cfg.level}
                onClick={() => {
                  if (isUnlocked) {
                    soundManager.playButton();
                    onSelectLevel(cfg.level);
                  } else {
                    soundManager.playInvalid();
                  }
                }}
                className={`relative flex flex-col items-center justify-between p-2 rounded-2xl transition-all duration-200 ${
                  isUnlocked
                    ? isCurrent
                      ? 'bg-gradient-to-b from-amber-500/90 to-amber-700/90 border-2 border-amber-300 shadow-[0_4px_16px_rgba(245,158,11,0.5)] scale-105 cursor-pointer text-white ring-2 ring-white/60 animate-pulse'
                      : 'bg-gradient-to-b from-[#1b5e20]/90 to-[#0f3813]/90 border border-emerald-400/50 hover:border-emerald-300 shadow-md cursor-pointer text-white hover:scale-102'
                    : 'bg-black/50 border border-white/10 opacity-60 cursor-not-allowed text-white/50'
                }`}
              >
                {/* Mode Tag */}
                <div className="w-full flex justify-between items-center text-[9px] font-black px-0.5">
                  <span className={isDraw3 ? 'text-amber-300' : 'text-emerald-300'}>
                    {isDraw3 ? 'D3' : 'D1'}
                  </span>
                  {isUnlocked && stars > 0 && (
                    <div className="flex text-amber-300 text-[10px]">
                      {'★'.repeat(stars)}
                    </div>
                  )}
                </div>

                {/* Big Level Number or Lock Icon */}
                <div className="my-1.5 flex flex-col items-center justify-center">
                  {isUnlocked ? (
                    <span className="text-xl font-black tracking-tight">{cfg.level}</span>
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {/* Bottom status */}
                <div className="text-[9px] font-bold tracking-tight text-center truncate w-full">
                  {isUnlocked ? (
                    bestScore ? (
                      <span className="text-amber-200">{bestScore} pts</span>
                    ) : (
                      <span className="text-emerald-300">{isCurrent ? 'Play' : 'Ready'}</span>
                    )
                  ) : (
                    <span className="text-slate-400">Locked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
