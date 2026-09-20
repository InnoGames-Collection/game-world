import React, { useState } from 'react';
import { ArrowLeft, Lock, Check, Sparkles, BookOpen } from 'lucide-react';
import { WorldLegendsProgress } from '../worldLegendsStorage';

const WOOD_MATERIAL = {
  hud: {
    background: 'linear-gradient(180deg, #f5d499 0%, #e0b06b 50%, #c98e40 100%)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 3px 6px rgba(0,0,0,0.35)',
  },
  tileOrButton: {
    background: 'linear-gradient(180deg, #fff2db 0%, #f6ce8e 45%, #e2a652 100%)',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.9), 0 3px 0 #915a1a, 0 5px 8px rgba(0,0,0,0.4)',
  },
  completedTile: {
    background: 'linear-gradient(180deg, #dcfce7 0%, #86efac 45%, #22c55e 100%)',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.9), 0 3px 0 #15803d, 0 5px 8px rgba(0,0,0,0.4)',
  },
  currentTile: {
    background: 'linear-gradient(180deg, #ffe082 0%, #ffb300 45%, #e65100 100%)',
    boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.8), 0 4px 0 #8c2d00, 0 0 16px rgba(255,179,0,0.7)',
  },
};

interface WordLegendLevelsScreenProps {
  progress: WorldLegendsProgress;
  onSelectLevel: (levelIndex: number) => void;
  onBack: () => void;
}

export const WordLegendLevelsScreen: React.FC<WordLegendLevelsScreenProps> = ({
  progress,
  onSelectLevel,
  onBack,
}) => {
  const [tierFilter, setTierFilter] = useState<'all' | '1-10' | '11-20' | '21-30' | '31-40'>('all');
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const unlockedLevel = progress.unlockedLevel || 1;
  const completedSet = new Set(progress.completedLevels);

  const tiers = [
    { key: 'all', label: 'ALL 1-40' },
    { key: '1-10', label: '1–10' },
    { key: '11-20', label: '11–20' },
    { key: '21-30', label: '21–30' },
    { key: '31-40', label: '31–40' },
  ] as const;

  const allLevels = Array.from({ length: 40 }, (_, i) => i + 1);

  const filteredLevels = allLevels.filter((lvlNum) => {
    if (tierFilter === '1-10') return lvlNum >= 1 && lvlNum <= 10;
    if (tierFilter === '11-20') return lvlNum >= 11 && lvlNum <= 20;
    if (tierFilter === '21-30') return lvlNum >= 21 && lvlNum <= 30;
    if (tierFilter === '31-40') return lvlNum >= 31 && lvlNum <= 40;
    return true;
  });

  const handleLevelClick = (lvlNum: number) => {
    if (lvlNum > unlockedLevel) {
      setLockedNotice(`Level ${lvlNum} is locked! Complete Level ${lvlNum - 1} first.`);
      setTimeout(() => setLockedNotice(null), 2500);
      return;
    }
    // 0-indexed level for internal gameplay engine
    onSelectLevel(lvlNum - 1);
  };

  return (
    <div
      id="word-legend-levels-screen"
      className="relative w-full max-w-md mx-auto h-[600px] sm:h-[650px] rounded-3xl overflow-hidden shadow-2xl flex flex-col p-4 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif] border-4 border-[#b37324] select-none text-[#22140a] animate-in fade-in"
      style={{
        background: 'radial-gradient(circle at 50% 20%, #2e1809 0%, #170d05 60%, #0c0702 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), inset 0 0 0 2px #f1bc68, inset 0 0 25px rgba(0,0,0,0.5)',
      }}
    >
      {/* TOP HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-[#b37324]/40 shrink-0">
        <button
          id="word-levels-back-btn"
          type="button"
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl text-[#22140a] flex items-center gap-1.5 font-black text-xs border border-[#c98833] active:translate-y-0.5 transition-all cursor-pointer shadow-md"
          style={WOOD_MATERIAL.tileOrButton}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-black text-[#f7e0b5] uppercase tracking-wider">
            SELECT LEVEL
          </h2>
          <span className="text-[10px] text-[#e0b06b] font-bold">
            UNLOCKED UP TO LEVEL {unlockedLevel}
          </span>
        </div>

        <div className="min-w-[44px] flex justify-end">
          <div 
            className="w-9 h-9 rounded-xl border border-[#b37324] flex items-center justify-center text-[#22140a] font-black text-xs shadow-md"
            style={WOOD_MATERIAL.hud}
          >
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
                ? 'text-[#22140a] shadow-md border border-[#c98833]'
                : 'bg-white/5 hover:bg-white/10 text-[#c7a47b] border border-white/5'
            }`}
            style={tierFilter === t.key ? WOOD_MATERIAL.tileOrButton : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* LOCKED TOAST NOTIFICATION */}
      {lockedNotice && (
        <div className="shrink-0 mb-2 py-2 px-3 rounded-xl bg-rose-700/90 text-white text-xs font-bold text-center border border-rose-400 shadow-lg animate-in fade-in">
          {lockedNotice}
        </div>
      )}

      {/* LEVELS GRID */}
      <div className="flex-1 overflow-y-auto pr-1 py-1 grid grid-cols-4 sm:grid-cols-5 gap-2.5 content-start">
        {filteredLevels.map((lvlNum) => {
          const isUnlocked = lvlNum <= unlockedLevel;
          const isCurrent = lvlNum === unlockedLevel;
          const isCompleted = completedSet.has(lvlNum);

          let tileCustomStyle = WOOD_MATERIAL.tileOrButton;
          let textStyle = 'text-[#22140a]';

          if (isCurrent) {
            tileCustomStyle = WOOD_MATERIAL.currentTile;
            textStyle = 'text-[#22140a] font-black';
          } else if (isCompleted) {
            tileCustomStyle = WOOD_MATERIAL.completedTile;
            textStyle = 'text-[#14532d] font-black';
          } else if (!isUnlocked) {
            tileCustomStyle = {
              background: 'linear-gradient(180deg, #1f1207 0%, #150a04 100%)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)',
            };
            textStyle = 'text-[#6b523c]';
          }

          return (
            <button
              key={lvlNum}
              id={`word-level-node-${lvlNum}`}
              type="button"
              onClick={() => handleLevelClick(lvlNum)}
              style={tileCustomStyle}
              className={`relative min-h-[78px] rounded-2xl p-2 flex flex-col items-center justify-between border border-[#b37324]/50 transition-all ${
                isCurrent
                  ? 'scale-105 z-10 animate-pulse active:translate-y-1'
                  : isUnlocked
                  ? 'cursor-pointer hover:brightness-105 active:translate-y-0.5'
                  : 'cursor-not-allowed opacity-60'
              }`}
            >
              {/* CURRENT BADGE */}
              {isCurrent && (
                <div className="absolute -top-2 inset-x-1 py-0.5 rounded-full bg-[#fce9ca] text-[#7a4110] text-[8px] font-black uppercase tracking-wider text-center border border-[#b37324] shadow-md">
                  CURRENT
                </div>
              )}

              {/* TOP STATUS */}
              <div className="flex items-center justify-center w-full mt-0.5">
                {!isUnlocked ? (
                  <Lock className="w-4 h-4 text-[#8a684b]" />
                ) : isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-700/30 flex items-center justify-center text-emerald-900">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-[#8c3204]" />
                )}
              </div>

              {/* LEVEL NUMBER */}
              <div className={`font-black text-sm sm:text-base font-mono leading-none ${textStyle}`}>
                {lvlNum}
              </div>

              {/* BOTTOM STATUS TEXT */}
              <div className={`text-[8px] font-black uppercase truncate max-w-full leading-none opacity-85 ${textStyle}`}>
                {!isUnlocked ? 'LOCKED' : isCompleted ? 'DONE' : 'PLAY'}
              </div>
            </button>
          );
        })}
      </div>

      {/* FOOTER NOTE */}
      <div className="shrink-0 pt-2 text-center text-[10px] text-[#c7a47b] font-semibold border-t border-[#b37324]/40 mt-1">
        Tap any unlocked level to begin • Free tournament match entry
      </div>
    </div>
  );
};
