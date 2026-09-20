import React, { useState } from 'react';
import { ArrowLeft, Lock, Star, Trophy, ShieldCheck, Zap, Flag, Gauge } from 'lucide-react';
import { HILL_CLIMB_LEVELS } from '../levels';
import { PlayerLevelProgress, HillClimbTier } from '../types';

interface HillClimbLevelSelectProps {
  progress: PlayerLevelProgress;
  onSelectLevel: (levelNumber: number) => void;
  onClose: () => void;
}

export const HillClimbLevelSelect: React.FC<HillClimbLevelSelectProps> = ({
  progress,
  onSelectLevel,
  onClose,
}) => {
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  const highestUnlocked = progress.unlockedLevel || 1;
  const completedLevels = progress.completedLevels || {};

  const tiers: Array<{ label: string; value: string }> = [
    { label: 'ALL (40)', value: 'all' },
    { label: 'VERY HARD (1-5)', value: 'Very Hard' },
    { label: 'VERY HARD+ (6-10)', value: 'Very Hard+' },
    { label: 'EXTREME (11-20)', value: 'Extreme' },
    { label: 'EXTREME+ (21-30)', value: 'Extreme+' },
    { label: 'EXPERT (31-40)', value: 'Expert' },
  ];

  const filteredLevels = HILL_CLIMB_LEVELS.filter((lvl) => {
    if (selectedTierFilter === 'all') return true;
    if (selectedTierFilter === 'Expert') return lvl.tier.includes('Expert');
    return lvl.tier === selectedTierFilter;
  });

  const getTierColor = (tier: HillClimbTier) => {
    if (tier.includes('Expert')) return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (tier.includes('Extreme+')) return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    if (tier.includes('Extreme')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (tier.includes('Very Hard+')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  const totalStars = (Object.values(completedLevels) as Array<{ stars: number }>).reduce(
    (sum, c) => sum + (c.stars || 0),
    0
  );

  return (
    <div
      id="hill-climb-level-select-view"
      className="relative w-full h-full min-h-[580px] flex flex-col p-3.5 sm:p-5 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#07172b] via-[#040e1c] to-[#02070e] text-white overflow-y-auto"
    >
      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to Menu"
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span>Select Level</span>
          </h2>
          <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest">
            40 Stages (Very Hard &rarr; Expert Pinnacle)
          </p>
        </div>

        <div className="w-11 h-11" />
      </header>

      {/* SUMMARY BANNER */}
      <div className="relative z-10 my-3 py-2 px-3 sm:px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-[#8BCB3D]" />
          <span>
            Unlocked: <strong className="text-white font-mono">{highestUnlocked} / 40</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-300 font-mono font-bold">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{totalStars} Stars</span>
        </div>
      </div>

      {/* TIER FILTER PILLS */}
      <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar text-[11px] font-bold">
        {tiers.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setSelectedTierFilter(t.value)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer border ${
              selectedTierFilter === t.value
                ? 'bg-[#1688C9] text-white border-cyan-300 shadow-md scale-105'
                : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 40 LEVELS GRID */}
      <main className="relative z-10 flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 py-2 overflow-y-auto pr-1">
        {filteredLevels.map((lvl) => {
          const isUnlocked = lvl.levelNumber <= highestUnlocked;
          const record = completedLevels[lvl.levelNumber];
          const isCompleted = !!record?.completed;
          const stars = record?.stars || 0;
          const bestScore = record?.bestScore || 0;

          return (
            <button
              key={`level-card-${lvl.levelNumber}`}
              type="button"
              disabled={!isUnlocked}
              onClick={() => {
                if (isUnlocked) onSelectLevel(lvl.levelNumber);
              }}
              className={`relative flex flex-col justify-between p-3 rounded-2xl border transition-all text-left ${
                !isUnlocked
                  ? 'bg-slate-900/40 border-white/5 opacity-40 cursor-not-allowed'
                  : isCompleted
                  ? 'bg-gradient-to-b from-[#0b2847] to-[#041324] border-cyan-400/50 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(22,136,201,0.3)] active:scale-95 cursor-pointer shadow-md'
                  : 'bg-slate-900/80 border-[#8BCB3D]/50 hover:border-[#8BCB3D] hover:shadow-[0_0_15px_rgba(139,203,61,0.3)] active:scale-95 cursor-pointer shadow-md'
              }`}
            >
              {/* Card Header: Level Number & Star/Lock state */}
              <div className="w-full flex items-center justify-between mb-1.5">
                <span className="font-black text-sm text-white font-mono">
                  LEVEL {lvl.levelNumber}
                </span>

                {!isUnlocked ? (
                  <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={`star-${lvl.levelNumber}-${s}`}
                        className={`w-3 h-3 ${
                          s <= stars ? 'text-amber-400 fill-amber-400 drop-shadow' : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Level Name */}
              <div className="my-1">
                <div className="text-xs font-bold text-slate-200 truncate">{lvl.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{lvl.amharicTitle}</div>
              </div>

              {/* Tier & Target Distance */}
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${getTierColor(lvl.tier)}`}>
                  {lvl.tier.split('/')[0].trim()}
                </span>
                <span className="text-slate-400 font-mono flex items-center gap-0.5">
                  <Flag className="w-3 h-3 text-[#8BCB3D]" />
                  {lvl.targetDistance}m
                </span>
              </div>

              {/* Best Score (if played) or Locked Status */}
              <div className="mt-1.5 text-[10px] font-mono">
                {isCompleted ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Trophy className="w-2.5 h-2.5" />
                    BEST: {bestScore}
                  </span>
                ) : isUnlocked ? (
                  <span className="text-cyan-300 font-semibold uppercase">READY TO DRIVE</span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Locked (Pass Lvl {lvl.levelNumber - 1})
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </main>
    </div>
  );
};
