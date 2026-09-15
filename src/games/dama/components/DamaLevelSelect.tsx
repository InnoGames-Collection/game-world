import React from 'react';
import {
  ArrowLeft,
  Lock,
  Star,
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import { DamaProgress } from '../types';
import { DAMA_40_LEVEL_CONFIGS } from '../damaAi';

interface DamaLevelSelectProps {
  progress: DamaProgress;
  currentLevel?: number;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

export const DamaLevelSelect: React.FC<DamaLevelSelectProps> = ({
  progress,
  currentLevel,
  onSelectLevel,
  onBack,
}) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Hard':
        return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
      case 'Very Hard':
        return 'text-orange-400 bg-orange-500/15 border-orange-500/30';
      case 'Expert':
        return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
      case 'Expert+':
        return 'text-purple-400 bg-purple-500/15 border-purple-500/30';
      case 'Extreme':
        return 'text-red-400 bg-red-500/15 border-red-500/30';
      case 'Master':
        return 'text-yellow-300 bg-yellow-500/20 border-yellow-400/40';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div
      id="dama-level-select-container"
      className="w-full max-w-xl mx-auto flex flex-col h-screen px-3 py-4 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          id="dama-level-select-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Menu</span>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-black text-white tracking-wide uppercase">Select Level</span>
          <span className="text-[10px] text-amber-400/90 font-mono font-bold">
            {progress.highestUnlockedLevel} of 40 Unlocked
          </span>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{progress.totalScore.toLocaleString()}</span>
        </div>
      </div>

      {/* Tier Legend */}
      <div className="flex items-center justify-between py-2 overflow-x-auto gap-1 text-[10px] border-b border-slate-800/80 scrollbar-none">
        <span className="px-2 py-0.5 rounded-full border text-amber-400 bg-amber-500/10 border-amber-500/30 font-semibold whitespace-nowrap">
          1-5 Hard
        </span>
        <span className="px-2 py-0.5 rounded-full border text-orange-400 bg-orange-500/10 border-orange-500/30 font-semibold whitespace-nowrap">
          6-10 Very Hard
        </span>
        <span className="px-2 py-0.5 rounded-full border text-rose-400 bg-rose-500/10 border-rose-500/30 font-semibold whitespace-nowrap">
          11-20 Expert
        </span>
        <span className="px-2 py-0.5 rounded-full border text-purple-400 bg-purple-500/10 border-purple-500/30 font-semibold whitespace-nowrap">
          21-30 Expert+
        </span>
        <span className="px-2 py-0.5 rounded-full border text-red-400 bg-red-500/10 border-red-500/30 font-semibold whitespace-nowrap">
          31-39 Extreme
        </span>
        <span className="px-2 py-0.5 rounded-full border text-yellow-300 bg-yellow-500/15 border-yellow-400/30 font-bold whitespace-nowrap">
          40 Master
        </span>
      </div>

      {/* 40 Levels Scrollable Grid */}
      <div className="flex-1 overflow-y-auto py-3 pr-1 space-y-2.5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {DAMA_40_LEVEL_CONFIGS.map((config) => {
            const lvl = config.level;
            const isUnlocked = lvl <= progress.highestUnlockedLevel;
            const saveData = progress.completedLevels[lvl];
            const isCleared = (saveData?.wins || 0) > 0;
            const stars = saveData?.stars || 0;
            const highScore = saveData?.highScore || 0;
            const wins = saveData?.wins || 0;
            const bestTime = saveData?.bestTimeSeconds;

            return (
              <button
                key={lvl}
                id={`dama-level-card-${lvl}`}
                disabled={!isUnlocked}
                onClick={() => onSelectLevel(lvl)}
                className={`relative flex flex-col p-3 rounded-2xl text-left transition-all border ${
                  isUnlocked
                    ? 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80 hover:border-amber-500/50 shadow-md active:scale-[0.98] cursor-pointer'
                    : 'bg-slate-950/60 border-slate-800/40 opacity-55 cursor-not-allowed'
                }`}
              >
                {/* Card Top: Level Number + Tier Tag */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black text-white font-mono">
                      #{lvl}
                    </span>
                    {isCleared && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${getTierColor(
                      config.tier
                    )}`}
                  >
                    {config.tier}
                  </span>
                </div>

                {/* Level Title */}
                <span className="text-xs font-bold text-slate-200 truncate block mb-2">
                  {config.name}
                </span>

                {/* Center Content: Cleared details vs Locked status */}
                {isUnlocked ? (
                  <div className="space-y-1 text-[10px] text-slate-400">
                    <div className="flex items-center justify-between font-mono">
                      <span>Best Score:</span>
                      <span className="font-bold text-amber-300">
                        {highScore > 0 ? `${highScore} pts` : '--'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-mono">
                      <span>Record:</span>
                      <span className="text-slate-300">
                        {wins > 0 ? `${wins}W (${saveData?.losses || 0}L)` : 'Not Cleared'}
                      </span>
                    </div>

                    {bestTime && (
                      <div className="flex items-center justify-between font-mono">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-slate-400" /> Time:
                        </span>
                        <span className="text-slate-300">{bestTime}s</span>
                      </div>
                    )}

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 pt-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= stars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-14 flex flex-col items-center justify-center text-slate-600">
                    <Lock className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-semibold">Locked</span>
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
