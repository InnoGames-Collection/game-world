import React from 'react';
import { ArrowLeft, Lock, Star, Trophy, ShieldCheck, Zap } from 'lucide-react';
import { BUBBLE_SHOOTER_LEVELS } from '../levels';
import { LevelProgress } from '../types';

interface BubbleShooterLevelSelectProps {
  progress: LevelProgress;
  onSelectLevel: (levelNumber: number) => void;
  onClose: () => void;
}

export const BubbleShooterLevelSelect: React.FC<BubbleShooterLevelSelectProps> = ({
  progress,
  onSelectLevel,
  onClose,
}) => {
  const highestUnlocked = progress.highestUnlockedLevel || 1;
  const completedLevels = progress.completedLevels || {};

  const getTierColor = (tier: string) => {
    const t = tier.toLowerCase();
    if (t.includes('master')) return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (t.includes('extreme')) return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    if (t.includes('expert+')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (t.includes('expert')) return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    if (t.includes('very hard')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  return (
    <div
      id="bubble-shooter-level-select-view"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#061224] via-[#091b36] to-[#040c18] overflow-y-auto custom-scrollbar"
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
          <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span>Select Level</span>
          </h2>
          <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest">
            40 Progressive Stages (Hard &rarr; Master)
          </p>
        </div>

        <div className="w-11 h-11" />
      </header>

      {/* SUMMARY BANNER */}
      <div className="relative z-10 my-3 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Unlocked: <strong className="text-white">{highestUnlocked} / 40</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-300 font-mono font-bold">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>
            {(Object.values(completedLevels) as Array<{ stars: number }>).reduce((sum, c) => sum + (c.stars || 0), 0)} Stars
          </span>
        </div>
      </div>

      {/* 40 LEVELS GRID */}
      <main className="relative z-10 flex-1 grid grid-cols-4 sm:grid-cols-5 gap-2.5 py-2 overflow-y-auto custom-scrollbar pr-1">
        {BUBBLE_SHOOTER_LEVELS.slice(0, 40).map((lvl) => {
          const isUnlocked = lvl.levelNumber <= highestUnlocked;
          const completion = completedLevels[lvl.levelNumber];
          const isCompleted = !!completion;
          const stars = completion?.stars || 0;

          return (
            <button
              key={`lvl-select-${lvl.levelNumber}`}
              type="button"
              disabled={!isUnlocked}
              onClick={() => {
                if (isUnlocked) onSelectLevel(lvl.levelNumber);
              }}
              className={`relative flex flex-col items-center justify-between p-2.5 rounded-2xl border transition-all text-center ${
                !isUnlocked
                  ? 'bg-slate-900/40 border-white/5 opacity-45 cursor-not-allowed'
                  : isCompleted
                  ? 'bg-gradient-to-b from-cyan-900/30 to-blue-900/30 border-cyan-400/40 hover:border-cyan-300 active:scale-95 cursor-pointer shadow-md'
                  : 'bg-white/10 border-white/20 hover:border-white/40 active:scale-95 cursor-pointer shadow-md'
              }`}
            >
              {/* Top Star/Lock Status */}
              <div className="w-full flex items-center justify-center min-h-[16px]">
                {!isUnlocked ? (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={`star-${lvl.levelNumber}-${s}`}
                        className={`w-2.5 h-2.5 ${
                          s <= stars
                            ? 'text-amber-400 fill-amber-400 drop-shadow'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Level Number */}
              <div className="my-1">
                <span
                  className={`text-base font-black ${
                    !isUnlocked ? 'text-slate-500' : isCompleted ? 'text-cyan-300' : 'text-white'
                  }`}
                >
                  {lvl.levelNumber}
                </span>
              </div>

              {/* Tier Badge */}
              <div
                className={`w-full text-[8px] font-black uppercase tracking-wider py-0.5 rounded-md border text-center truncate ${
                  isUnlocked ? getTierColor(lvl.difficultyTier) : 'border-transparent text-slate-600'
                }`}
              >
                {lvl.difficultyTier}
              </div>

              {/* Best Score if completed */}
              {isCompleted && completion.highScore > 0 && (
                <div className="text-[9px] font-mono font-bold text-amber-300 mt-1">
                  {completion.highScore}
                </div>
              )}
            </button>
          );
        })}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          Return to Menu
        </button>
      </footer>
    </div>
  );
};
