/**
 * Crazy Colors 40-Level Selection Screen
 * Displays all 40 levels with stars (1-5), lock status, difficulty tiers, and fast jump navigation.
 */

import React, { useState } from 'react';
import { ArrowLeft, Lock, Star, Trophy } from 'lucide-react';
import { CRAZY_COLORS_LEVELS } from '../levels';
import { CrazyColorsSaveData } from '../types';
import { crazyColorsAudio } from '../audioEngine';

interface LevelSelectModalProps {
  saveData: CrazyColorsSaveData;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  saveData,
  onSelectLevel,
  onBack,
}) => {
  const [selectedTier, setSelectedTier] = useState<number>(1); // 1: 1-10, 2: 11-20, 3: 21-30, 4: 31-40

  const totalStars = Object.values(saveData.stars).reduce(
    (sum: number, stars: number) => sum + stars,
    0
  );

  // Filter levels for the selected tier tab
  const tierStart = (selectedTier - 1) * 10 + 1;
  const tierEnd = selectedTier * 10;
  const filteredLevels = CRAZY_COLORS_LEVELS.filter(
    (lvl) => lvl.id >= tierStart && lvl.id <= tierEnd
  );

  const getTierName = (tier: number) => {
    switch (tier) {
      case 1:
        return 'HARD (1-10)';
      case 2:
        return 'VERY HARD (11-20)';
      case 3:
        return 'EXPERT (21-30)';
      case 4:
        return 'MASTER (31-40)';
      default:
        return '';
    }
  };

  return (
    <div
      id="crazy-colors-level-select-modal"
      className="absolute inset-0 z-50 bg-[#2B2B2B] flex flex-col text-white select-none overflow-hidden"
    >
      {/* Top Header */}
      <header className="px-4 py-3 bg-black/40 border-b border-white/10 flex items-center justify-between gap-3 backdrop-blur-md">
        <button
          id="crazy-colors-levels-back-btn"
          type="button"
          onClick={() => {
            crazyColorsAudio.playButton();
            onBack();
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-base font-black tracking-tight uppercase">SELECT LEVEL</h2>
          <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
            40 Levels Total
          </span>
        </div>

        {/* Total Stars Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-yellow-500/30">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-black text-yellow-300 font-mono">
            {totalStars} / 200
          </span>
        </div>
      </header>

      {/* Tier Jump Navigation Tabs */}
      <div className="px-3 py-2.5 bg-black/20 border-b border-white/5 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        {[1, 2, 3, 4].map((tier) => (
          <button
            key={tier}
            id={`crazy-colors-tier-tab-${tier}`}
            type="button"
            onClick={() => {
              crazyColorsAudio.playButton();
              setSelectedTier(tier);
            }}
            className={`flex-1 min-w-[76px] py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
              selectedTier === tier
                ? 'bg-gradient-to-r from-pink-500/30 to-cyan-500/30 border border-cyan-400/50 text-white shadow-[0_0_10px_rgba(0,217,255,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-white/50 border border-transparent'
            }`}
          >
            {getTierName(tier)}
          </button>
        ))}
      </div>

      {/* 10-level grid for selected tier */}
      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3.5 pb-8">
          {filteredLevels.map((lvl) => {
            const isUnlocked = lvl.id <= saveData.highestUnlockedLevel;
            const starsEarned = saveData.stars[lvl.id] || 0;
            const bestScore = saveData.bestScores[lvl.id] || 0;

            return (
              <button
                key={lvl.id}
                id={`crazy-colors-level-card-${lvl.id}`}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    crazyColorsAudio.playButton();
                    onSelectLevel(lvl.id);
                  }
                }}
                className={`relative p-3.5 rounded-2xl flex flex-col justify-between items-start text-left border transition-all ${
                  isUnlocked
                    ? 'bg-white/10 hover:bg-white/15 active:scale-95 border-white/20 shadow-lg hover:border-cyan-400/50 hover:shadow-[0_0_16px_rgba(0,217,255,0.2)]'
                    : 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Card Top: Level # and Lock/Difficulty Badge */}
                <div className="w-full flex items-center justify-between">
                  <span className="text-xl font-black tracking-tight text-white font-mono">
                    #{lvl.id}
                  </span>
                  {isUnlocked ? (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-white/10 text-white/70 border border-white/10">
                      {lvl.difficulty.replace('_', ' ')}
                    </span>
                  ) : (
                    <Lock className="w-4 h-4 text-white/40" />
                  )}
                </div>

                {/* Level Title & Obstacle Count */}
                <div className="my-2.5">
                  <h3 className="text-sm font-bold text-white line-clamp-1">{lvl.title}</h3>
                  <p className="text-[11px] text-white/50 line-clamp-1">
                    {lvl.obstacles.length} Obstacles
                  </p>
                </div>

                {/* 1-5 Star display & Best Score */}
                <div className="w-full flex items-center justify-between pt-1 border-t border-white/10">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((starIndex) => (
                      <Star
                        key={starIndex}
                        className={`w-3 h-3 ${
                          starIndex <= starsEarned
                            ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_4px_rgba(255,216,0,0.8)]'
                            : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  {bestScore > 0 && (
                    <span className="text-[10px] font-mono font-semibold text-yellow-300/80">
                      {bestScore}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
