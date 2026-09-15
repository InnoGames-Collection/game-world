import React from 'react';
import { ArrowLeft, Lock, Star, Play, Trophy, Zap } from 'lucide-react';
import { LEVEL_CONFIGURATIONS } from '../stageBank';
import { MemoryMatchStorageData } from '../types';

interface LevelsViewProps {
  storage: MemoryMatchStorageData;
  onSelectLevel: (levelNum: number) => void;
  onBack: () => void;
}

export const LevelsView: React.FC<LevelsViewProps> = ({
  storage,
  onSelectLevel,
  onBack,
}) => {
  const unlockedLevel = storage.unlockedLevel || 1;
  const currentLevel = storage.currentLevel || 1;
  const levelScores = storage.levelScores || {};
  const stars = storage.stars || {};

  return (
    <div className="w-full h-full flex flex-col text-white px-3 py-3 sm:p-5 overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif] max-w-lg mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Menu</span>
        </button>

        <div className="flex flex-col items-end">
          <span className="text-xs font-black text-white uppercase tracking-wider">ALL 40 LEVELS</span>
          <span className="text-[10px] text-emerald-400 font-bold">
            Unlocked: {unlockedLevel} / 40
          </span>
        </div>
      </div>

      {/* Tiers Legend Bar */}
      <div className="flex items-center justify-between gap-1 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0 overflow-x-auto">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          1-10: HARD
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          11-20: VERY HARD
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          21-30: EXPERT
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          31-40: MASTER
        </span>
      </div>

      {/* Interactive 40-Level Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 space-y-3 pb-4">
        <div className="grid grid-cols-5 gap-2 pt-1">
          {LEVEL_CONFIGURATIONS.map((config) => {
            const lvl = config.levelNumber;
            const isUnlocked = lvl <= unlockedLevel;
            const isCurrent = lvl === currentLevel;
            const isCompleted = levelScores[lvl] !== undefined;
            const starCount = stars[lvl] || 0;
            const bestScore = levelScores[lvl] || 0;

            // Border color by tier
            let tierBorderColor = 'border-slate-800';
            let tierBgColor = 'bg-[#061423]/70';
            if (isUnlocked) {
              if (lvl <= 10) {
                tierBorderColor = isCurrent ? 'border-[#00C853] shadow-[0_0_12px_rgba(0,200,83,0.4)]' : 'border-emerald-600/50';
                tierBgColor = 'bg-[#071D2F]';
              } else if (lvl <= 20) {
                tierBorderColor = isCurrent ? 'border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.4)]' : 'border-sky-600/50';
                tierBgColor = 'bg-[#071F36]';
              } else if (lvl <= 30) {
                tierBorderColor = isCurrent ? 'border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]' : 'border-amber-600/50';
                tierBgColor = 'bg-[#1D1708]';
              } else {
                tierBorderColor = isCurrent ? 'border-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.4)]' : 'border-purple-600/50';
                tierBgColor = 'bg-[#1C0D2E]';
              }
            }

            return (
              <button
                key={lvl}
                disabled={!isUnlocked}
                onClick={() => onSelectLevel(lvl)}
                className={`relative flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-2xl border-2 transition-all cursor-pointer ${tierBgColor} ${tierBorderColor} ${
                  isUnlocked ? 'hover:scale-103 active:scale-95 opacity-100 shadow-md' : 'opacity-40 cursor-not-allowed'
                }`}
                style={{ minHeight: '68px' }}
              >
                {/* Top Badge: Star Rating or Lock */}
                <div className="w-full flex items-center justify-between text-[10px]">
                  {isUnlocked ? (
                    isCompleted ? (
                      <div className="flex items-center gap-0.5 text-amber-400 text-[9px] mx-auto">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-2.5 h-2.5 ${s <= starCount ? 'fill-current' : 'text-slate-600'}`}
                          />
                        ))}
                      </div>
                    ) : isCurrent ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mx-auto animate-ping" />
                    ) : (
                      <span className="text-[8px] text-slate-500 mx-auto font-mono">{config.pairsCount}p</span>
                    )
                  ) : (
                    <Lock className="w-3 h-3 text-slate-500 mx-auto" />
                  )}
                </div>

                {/* Level Number */}
                <div className="flex flex-col items-center">
                  <span className={`text-base sm:text-lg font-black font-mono leading-none ${
                    isCurrent ? 'text-[#FFD54F]' : isUnlocked ? 'text-white' : 'text-slate-500'
                  }`}>
                    {lvl}
                  </span>
                </div>

                {/* Bottom: Score if completed or Pairs info */}
                <div className="w-full text-center">
                  {isCompleted ? (
                    <span className="text-[8.5px] font-bold font-mono text-[#FFD54F] leading-none block truncate">
                      +{bestScore}
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tight leading-none block">
                      {config.difficultyTier.split(' ')[0]}
                    </span>
                  ) : (
                    <span className="text-[7.5px] text-slate-600 uppercase font-mono">LOCK</span>
                  )}
                </div>

                {/* Current level indicator ribbon */}
                {isCurrent && (
                  <div className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-[#00C853] text-[#040E1A] shadow-md">
                    <Play className="w-2.5 h-2.5 fill-current" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
