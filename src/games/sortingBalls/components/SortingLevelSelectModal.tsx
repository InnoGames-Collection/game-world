import React, { useState } from 'react';
import { Grid, X, Lock, Star, CheckCircle, Trophy, Flame } from 'lucide-react';
import { SortingPlayerProgress } from '../types';
import { TOTAL_SORTING_LEVELS, SORTING_LEVELS } from '../levels';

interface SortingLevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: SortingPlayerProgress;
  onSelectLevel: (levelNum: number) => void;
  currentLevel: number;
}

export const SortingLevelSelectModal: React.FC<SortingLevelSelectModalProps> = ({
  isOpen,
  onClose,
  progress,
  onSelectLevel,
  currentLevel,
}) => {
  const [selectedTier, setSelectedTier] = useState<number>(1);

  if (!isOpen) return null;

  const unlockedLvl = progress.unlockedLevel || 1;
  const completedLevels = progress.completedLevels || [];
  const levelScores = progress.levelScores || {};
  const levelStars = progress.levelStars || {};

  const tiers = [
    { id: 1, name: 'Levels 1–10', range: [1, 10], desc: 'Hard & Very Hard' },
    { id: 2, name: 'Levels 11–20', range: [11, 20], desc: 'Expert Tier' },
    { id: 3, name: 'Levels 21–30', range: [21, 30], desc: 'Advanced Expert+' },
    { id: 4, name: 'Levels 31–40', range: [31, 40], desc: 'Extreme & Master' },
  ];

  const currentTierObj = tiers.find((t) => t.id === selectedTier) || tiers[0];
  const [startLvl, endLvl] = currentTierObj.range;

  const tierLevels = Array.from({ length: endLvl - startLvl + 1 }, (_, i) => startLvl + i);

  return (
    <div className="fixed inset-0 z-50 bg-[#070b16]/95 backdrop-blur-md flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-lg mx-auto space-y-4 pb-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                SELECT LEVEL
              </h2>
              <p className="text-xs text-slate-400">
                40 Progressive Championship Puzzles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            aria-label="Close Level Select"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Selector Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
          {tiers.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTier(t.id)}
              className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                selectedTier === t.id
                  ? 'bg-cyan-500 text-black font-black shadow-md'
                  : 'text-slate-400 hover:text-white font-semibold'
              }`}
            >
              <div className="text-[11px] leading-none uppercase">
                {t.name.split(' ')[1]}
              </div>
            </button>
          ))}
        </div>

        {/* Tier Description */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">{currentTierObj.name}</span>
          <span className="text-cyan-400 font-mono text-[11px]">{currentTierObj.desc}</span>
        </div>

        {/* 10 Level Cards in Current Tier */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {tierLevels.map((lvl) => {
            const isUnlocked = lvl <= unlockedLvl;
            const isCompleted = completedLevels.includes(lvl);
            const isCurrent = lvl === currentLevel;
            const stars = levelStars[lvl] || 0;
            const bestScore = levelScores[lvl] || 0;
            const optimalMoves = SORTING_LEVELS[lvl - 1]?.optimalMoves || 15;

            return (
              <button
                key={lvl}
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(lvl);
                    onClose();
                  }
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-between min-h-[96px] transition-all cursor-pointer relative border ${
                  !isUnlocked
                    ? 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-gradient-to-b from-cyan-500/25 to-blue-600/25 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg'
                    : isCompleted
                    ? 'bg-white/[0.05] border-emerald-500/40 hover:bg-white/[0.09]'
                    : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
                }`}
              >
                {/* Top: Level Number & Lock / Completed Icon */}
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-black font-mono text-white">
                    #{lvl}
                  </span>
                  {!isUnlocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </div>

                {/* Center: Stars */}
                <div className="flex items-center gap-0.5 my-1">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= stars
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Bottom: Score or Par */}
                <div className="text-[10px] font-mono text-slate-400 w-full text-center truncate">
                  {bestScore > 0 ? (
                    <span className="text-amber-300 font-bold">
                      {bestScore} pts
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-slate-500">Par {optimalMoves}</span>
                  ) : (
                    <span className="text-slate-600">Locked</span>
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
