import React, { useState } from 'react';
import { Grid, X, Lock, Star, CheckCircle, Trophy, Flame } from 'lucide-react';
import { EmojiSortingPlayerProgress } from '../types';
import { TOTAL_EMOJI_SORTING_LEVELS, EMOJI_SORTING_LEVELS } from '../levels';

interface EmojiSortingLevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: EmojiSortingPlayerProgress;
  onSelectLevel: (levelNum: number) => void;
  currentLevel: number;
}

export const EmojiSortingLevelSelectModal: React.FC<EmojiSortingLevelSelectModalProps> = ({
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
  const levelStars = progress.levelStars || progress.stars || {};

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
    <div
      className="fixed inset-0 z-50 flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif] text-slate-800"
      style={{
        background: `
          radial-gradient(circle at 18% 12%, #FFE8E8 0%, transparent 48%),
          radial-gradient(circle at 82% 16%, #E8F6FF 0%, transparent 45%),
          radial-gradient(circle at 50% 45%, #F7EFFF 0%, transparent 60%),
          radial-gradient(circle at 15% 85%, #E7F9F3 0%, transparent 50%),
          radial-gradient(circle at 85% 88%, #FFE8E8 0%, transparent 45%),
          #FAF7FD
        `,
      }}
    >
      <div className="w-full max-w-lg mx-auto space-y-4 pb-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shadow-xs">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                SELECT LEVEL
              </h2>
              <p className="text-xs text-slate-500">
                40 Progressive Championship Puzzles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border border-purple-100 shadow-xs"
            aria-label="Close Level Select"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Selector Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-purple-50/80 border border-purple-100">
          {tiers.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTier(t.id)}
              className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                selectedTier === t.id
                  ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white font-black shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <div className="text-[11px] leading-none uppercase">
                {t.name.split(' ')[1]}
              </div>
            </button>
          ))}
        </div>

        {/* Tier Description */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{currentTierObj.name}</span>
          <span className="text-violet-700 font-mono text-[11px] font-bold">{currentTierObj.desc}</span>
        </div>

        {/* 10 Level Cards in Current Tier */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {tierLevels.map((lvl) => {
            const isUnlocked = lvl <= unlockedLvl;
            const isCompleted = completedLevels.includes(lvl);
            const isCurrent = lvl === currentLevel;
            const stars = levelStars[lvl] || 0;
            const score = levelScores[lvl] || 0;
            const lvlConfig = EMOJI_SORTING_LEVELS[lvl - 1];

            return (
              <button
                key={lvl}
                disabled={!isUnlocked}
                onClick={() => {
                  onSelectLevel(lvl);
                  onClose();
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-between min-h-[92px] transition-all text-left cursor-pointer shadow-xs ${
                  !isUnlocked
                    ? 'bg-slate-100/60 border-slate-200 opacity-50 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-violet-100 border-violet-400 shadow-sm scale-[1.02]'
                    : isCompleted
                    ? 'bg-emerald-50/90 border-emerald-200 hover:bg-emerald-100/80'
                    : 'bg-white hover:bg-purple-50/60 border-purple-100 hover:border-violet-300'
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-black tracking-wider text-slate-800">
                    LVL {lvl}
                  </span>
                  {!isUnlocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  )}
                </div>

                <div className="text-center my-1">
                  <span className="text-[10px] text-slate-500 line-clamp-1 block">
                    {lvlConfig?.themeTitle || `${lvlConfig?.tubes?.length || 6} Tubes`}
                  </span>
                  {score > 0 && (
                    <span className="text-[11px] font-bold text-amber-700 font-mono">
                      {score.toLocaleString()} pts
                    </span>
                  )}
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((starNum) => (
                    <Star
                      key={starNum}
                      className={`w-3 h-3 ${
                        starNum <= stars
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 rounded-xl bg-white border border-purple-100 shadow-xs flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Progress: {completedLevels.length} / {TOTAL_EMOJI_SORTING_LEVELS} Completed</span>
          </div>
          <span className="text-violet-700 font-bold">100% Solvable</span>
        </div>
      </div>
    </div>
  );
};
