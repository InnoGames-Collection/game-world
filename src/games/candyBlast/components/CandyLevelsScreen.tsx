import React, { useState } from 'react';
import { ArrowLeft, Lock, Star, Check, Sparkles, Trophy } from 'lucide-react';
import { PlayerProgress } from '../types';
import { CANDY_LEVELS } from '../levelBank';

interface CandyLevelsScreenProps {
  currentLevel?: number;
  progress: PlayerProgress;
  onSelectLevel: (levelNum: number) => void;
  onBack: () => void;
}

export const CandyLevelsScreen: React.FC<CandyLevelsScreenProps> = ({
  currentLevel = 1,
  progress,
  onSelectLevel,
  onBack,
}) => {
  const [tierFilter, setTierFilter] = useState<'all' | '1-10' | '11-20' | '21-30' | '31-40'>('all');
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const unlockedLevel = progress.unlockedLevel || 1;

  const tiers = [
    { key: 'all', label: 'ALL 1-40' },
    { key: '1-10', label: '1–10' },
    { key: '11-20', label: '11–20' },
    { key: '21-30', label: '21–30' },
    { key: '31-40', label: '31–40' },
  ] as const;

  const filteredLevels = CANDY_LEVELS.filter((cfg) => {
    if (tierFilter === '1-10') return cfg.levelNumber >= 1 && cfg.levelNumber <= 10;
    if (tierFilter === '11-20') return cfg.levelNumber >= 11 && cfg.levelNumber <= 20;
    if (tierFilter === '21-30') return cfg.levelNumber >= 21 && cfg.levelNumber <= 30;
    if (tierFilter === '31-40') return cfg.levelNumber >= 31 && cfg.levelNumber <= 40;
    return true;
  });

  const handleLevelClick = (lvlNum: number) => {
    if (lvlNum > unlockedLevel) {
      setLockedNotice(`Level ${lvlNum} is locked! Complete Level ${lvlNum - 1} first.`);
      setTimeout(() => setLockedNotice(null), 2500);
      return;
    }
    onSelectLevel(lvlNum);
  };

  return (
    <div
      id="candy-levels-screen"
      className="relative w-full max-w-md mx-auto h-[640px] sm:h-[680px] rounded-3xl overflow-hidden shadow-2xl flex flex-col p-4 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif] border-2 border-pink-500/40 select-none text-white animate-in fade-in"
      style={{
        background: 'radial-gradient(circle at 50% 15%, #3b0764 0%, #1e1035 45%, #0a0614 100%)',
      }}
    >
      {/* TOP HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <button
          id="candy-levels-back-btn"
          type="button"
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white/90 border border-white/15 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-black text-white uppercase tracking-wider">
            SELECT LEVEL
          </h2>
          <span className="text-[10px] text-pink-300 font-bold">
            UNLOCKED UP TO LEVEL {unlockedLevel}
          </span>
        </div>

        <div className="min-w-[44px] flex justify-end">
          <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300 font-bold text-xs">
            {unlockedLevel}/40
          </div>
        </div>
      </div>

      {/* TIER TABS */}
      <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto scrollbar-none shrink-0">
        {tiers.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTierFilter(t.key)}
            className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
              tierFilter === t.key
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md border border-pink-300/50'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* LOCKED TOAST NOTIFICATION */}
      {lockedNotice && (
        <div className="shrink-0 mb-2 py-2 px-3 rounded-xl bg-rose-500/90 text-white text-xs font-bold text-center border border-rose-300 shadow-lg animate-in fade-in">
          {lockedNotice}
        </div>
      )}

      {/* LEVELS 8-COLUMN OR 4-COLUMN RESPONSIVE GRID */}
      <div className="flex-1 overflow-y-auto pr-1 py-1 grid grid-cols-4 sm:grid-cols-5 gap-2.5 content-start">
        {filteredLevels.map((cfg) => {
          const lvlNum = cfg.levelNumber;
          const isUnlocked = lvlNum <= unlockedLevel;
          const isCurrent = lvlNum === unlockedLevel;
          const record = progress.records[lvlNum];
          const isCompleted = !!record?.completed;
          const stars = record?.stars || 0;

          // State styling
          let cardStyle = 'bg-black/40 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed';
          if (isCurrent) {
            cardStyle =
              'bg-gradient-to-b from-pink-600/80 to-purple-800/90 border-2 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.6)] text-white scale-105 z-10 cursor-pointer animate-pulse';
          } else if (isCompleted) {
            cardStyle =
              'bg-gradient-to-b from-emerald-950/60 to-purple-950/80 border border-emerald-400/60 text-white hover:brightness-110 cursor-pointer shadow-md';
          } else if (isUnlocked) {
            cardStyle =
              'bg-gradient-to-b from-pink-900/50 to-purple-950/80 border border-pink-400/50 text-white hover:brightness-110 cursor-pointer shadow-md';
          }

          return (
            <button
              key={lvlNum}
              id={`candy-level-node-${lvlNum}`}
              type="button"
              onClick={() => handleLevelClick(lvlNum)}
              className={`relative min-h-[78px] rounded-2xl p-2 flex flex-col items-center justify-between transition-all active:scale-95 ${cardStyle}`}
            >
              {/* CURRENT BADGE */}
              {isCurrent && (
                <div className="absolute -top-2 inset-x-1 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black uppercase tracking-wider text-center shadow-md">
                  CURRENT
                </div>
              )}

              {/* TOP ICON / STATUS */}
              <div className="flex items-center justify-center w-full mt-0.5">
                {!isUnlocked ? (
                  <Lock className="w-4 h-4 text-slate-500" />
                ) : isCompleted ? (
                  <div className="flex items-center gap-0.5 text-amber-300">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-2.5 h-2.5 ${stars >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                      />
                    ))}
                  </div>
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                )}
              </div>

              {/* LEVEL NUMBER */}
              <div className="font-black text-sm sm:text-base font-mono leading-none">
                {lvlNum}
              </div>

              {/* BOTTOM SUBTEXT */}
              <div className="text-[8px] font-bold uppercase truncate max-w-full opacity-80 leading-none">
                {!isUnlocked ? 'LOCKED' : isCompleted ? 'DONE' : 'PLAY'}
              </div>
            </button>
          );
        })}
      </div>

      {/* FOOTER NOTE: 100% FREE */}
      <div className="shrink-0 pt-2 text-center text-[10px] text-pink-200/70 font-semibold border-t border-white/10 mt-1">
        Tap any unlocked level to play instantly • No coins or fees required
      </div>
    </div>
  );
};
