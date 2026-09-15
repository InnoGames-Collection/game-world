/**
 * Helix Jump Level Select Modal
 * 40 Finite levels with sequential unlocking, star ratings, ring count, and high scores.
 */

import React, { useState } from 'react';
import { ArrowLeft, Lock, Star, Check, Trophy } from 'lucide-react';
import { HelixJumpSaveData } from '../types';
import { HELIX_LEVELS } from '../levels';
import { helixAudio } from '../audioEngine';

interface LevelSelectModalProps {
  saveData: HelixJumpSaveData;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  saveData,
  onSelectLevel,
  onBack,
}) => {
  const [filterTier, setFilterTier] = useState<'all' | 'hard' | 'expert' | 'extreme' | 'master'>('all');

  const filteredLevels = HELIX_LEVELS.filter((lvl) => {
    if (filterTier === 'all') return true;
    if (filterTier === 'hard') return lvl.id <= 10;
    if (filterTier === 'expert') return lvl.id >= 11 && lvl.id <= 20;
    if (filterTier === 'extreme') return lvl.id >= 21 && lvl.id <= 30;
    if (filterTier === 'master') return lvl.id >= 31;
    return true;
  });

  return (
    <div
      id="helix-level-select-modal"
      className="absolute inset-0 z-40 bg-gradient-to-b from-slate-900 via-sky-950 to-slate-950 flex flex-col justify-between py-5 px-3 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <button
          onClick={() => {
            helixAudio.playButtonClick();
            onBack();
          }}
          className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg font-black text-white uppercase tracking-wider">
            Select Level
          </h2>
          <p className="text-[11px] font-bold text-sky-400">
            {saveData.highestUnlockedLevel} / 40 Unlocked
          </p>
        </div>

        <div className="w-11" /> {/* Spacer */}
      </div>

      {/* Tier Filter Tabs */}
      <div className="w-full max-w-md mx-auto flex items-center justify-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar shrink-0">
        {(['all', 'hard', 'expert', 'extreme', 'master'] as const).map((tier) => (
          <button
            key={tier}
            onClick={() => {
              helixAudio.playButtonClick();
              setFilterTier(tier);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
              filterTier === tier
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* 40-Level Responsive Grid */}
      <div className="flex-1 w-full max-w-md mx-auto overflow-y-auto px-1 py-2 grid grid-cols-4 sm:grid-cols-5 gap-2.5">
        {filteredLevels.map((lvl) => {
          const isUnlocked = lvl.id <= (saveData.highestUnlockedLevel || 1);
          const starsEarned = saveData.stars?.[lvl.id] || 0;
          const isCompleted = starsEarned > 0;
          const isCurrent = lvl.id === (saveData.highestUnlockedLevel || 1);
          const bestScore = saveData.bestScores?.[lvl.id] || 0;

          return (
            <button
              key={lvl.id}
              disabled={!isUnlocked}
              onClick={() => {
                if (isUnlocked) {
                  helixAudio.playButtonClick();
                  onSelectLevel(lvl.id);
                }
              }}
              className={`relative aspect-square rounded-2xl p-1.5 flex flex-col items-center justify-between border transition-all ${
                isCurrent
                  ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30 scale-105 cursor-pointer ring-2 ring-amber-300'
                  : isCompleted
                  ? 'bg-sky-900/60 hover:bg-sky-800/80 text-white border-sky-400/40 cursor-pointer shadow-md'
                  : isUnlocked
                  ? 'bg-slate-800/80 hover:bg-slate-700/80 text-white border-white/20 cursor-pointer'
                  : 'bg-slate-950/60 text-slate-600 border-white/5 opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Level Number & Check */}
              <div className="w-full flex items-center justify-between px-0.5">
                <span className="text-[11px] font-black">#{lvl.id}</span>
                {isCompleted && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
              </div>

              {/* Center status: Lock or Sections Count */}
              <div className="my-auto flex flex-col items-center">
                {!isUnlocked ? (
                  <Lock className="w-4 h-4 text-slate-500" />
                ) : (
                  <>
                    <div className="text-[10px] font-black uppercase opacity-85">
                      {lvl.rings.length} R
                    </div>
                    {bestScore > 0 && (
                      <div className="text-[8px] font-bold text-amber-300/90 leading-none mt-0.5">
                        {bestScore}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Star rating row */}
              <div className="flex items-center gap-0.5 pb-0.5">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`w-2.5 h-2.5 ${
                      s <= starsEarned
                        ? 'fill-amber-300 text-amber-300'
                        : isCurrent
                        ? 'text-slate-900/40'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
