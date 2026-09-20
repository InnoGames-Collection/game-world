/**
 * World Legends - Level Selection Modal
 * Direct access to all levels without any coin payment or entry fee.
 * Tapping any unlocked level starts gameplay immediately.
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Lock, 
  Check, 
  Trophy, 
  Sparkles, 
  Compass, 
  Play,
  Flame,
  ChevronRight
} from 'lucide-react';
import { CATEGORIZED_WORD_DICTIONARY } from './wordDictionary';

interface WorldLegendsLevelModalProps {
  currentLevelIndex: number; // 0-indexed (0 to 39)
  unlockedLevel: number; // 1-indexed (1 to 40)
  onSelectLevel: (levelIdx: number) => void;
  onClose: () => void;
}

// Categories list for level grouping
const LEVEL_CATEGORIES = [
  { id: 'ancient_rome', label: 'Ancient Rome & Greece', minLvl: 1, maxLvl: 4, icon: '🏛️', color: 'from-amber-600 to-amber-800' },
  { id: 'ethiopian_heritage', label: 'Ethiopian Heritage', minLvl: 5, maxLvl: 10, icon: '🦁', color: 'from-emerald-600 to-emerald-800' },
  { id: 'mythology_titans', label: 'Mythology & Titans', minLvl: 11, maxLvl: 16, icon: '⚡', color: 'from-blue-600 to-blue-800' },
  { id: 'medieval_conquest', label: 'Medieval Conquest', minLvl: 17, maxLvl: 22, icon: '⚔️', color: 'from-purple-600 to-purple-800' },
  { id: 'golden_trade_routes', label: 'Golden Trade Routes', minLvl: 23, maxLvl: 28, icon: '🏺', color: 'from-yellow-600 to-yellow-800' },
  { id: 'ancient_wonders', label: 'Ancient Wonders', minLvl: 29, maxLvl: 34, icon: '🗿', color: 'from-orange-600 to-orange-800' },
  { id: 'legendary_empires', label: 'Legendary Empires', minLvl: 35, maxLvl: 40, icon: '👑', color: 'from-rose-600 to-rose-800' },
];

export const WorldLegendsLevelModal: React.FC<WorldLegendsLevelModalProps> = ({
  currentLevelIndex,
  unlockedLevel,
  onSelectLevel,
  onClose,
}) => {
  const currentLvlNum = currentLevelIndex + 1;
  const initialCatIndex = LEVEL_CATEGORIES.findIndex(
    (c) => currentLvlNum >= c.minLvl && currentLvlNum <= c.maxLvl
  );
  const [selectedCatIndex, setSelectedCatIndex] = useState<number>(
    initialCatIndex >= 0 ? initialCatIndex : 0
  );

  const activeCategory = LEVEL_CATEGORIES[selectedCatIndex];

  // Generate the levels list for active category
  const categoryLevels = useMemo(() => {
    const list: { levelNum: number; levelIdx: number; isUnlocked: boolean; isCurrent: boolean }[] = [];
    for (let i = activeCategory.minLvl; i <= activeCategory.maxLvl; i++) {
      list.push({
        levelNum: i,
        levelIdx: i - 1,
        isUnlocked: i <= unlockedLevel,
        isCurrent: i === currentLvlNum,
      });
    }
    return list;
  }, [activeCategory, unlockedLevel, currentLvlNum]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0a180f]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-2 border-[#b37324] flex flex-col max-h-[90vh] bg-[#fbf5eb] text-[#22140a] animate-in zoom-in-95 duration-150"
        style={{
          boxShadow: '0 20px 40px -10px rgba(10,24,15,0.7), inset 0 2px 4px rgba(255,255,255,0.7)',
        }}
      >
        {/* Header with Wood Texture */}
        <div 
          className="p-4 border-b border-[#c48e4b] flex items-center justify-between text-white shrink-0 relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #91511a 0%, #683710 100%)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Compass className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm uppercase tracking-wider text-amber-100">
                  Select Puzzle Level
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 uppercase tracking-widest">
                  FREE PLAY
                </span>
              </div>
              <p className="text-[11px] text-amber-200/80 font-medium">
                Tap any unlocked level to start playing directly
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-amber-200 flex items-center justify-center transition-colors cursor-pointer border border-amber-300/20"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="p-2 border-b border-[#e6c99c] bg-[#eedbc1] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {LEVEL_CATEGORIES.map((cat, idx) => {
            const isCatActive = idx === selectedCatIndex;
            const isCatUnlocked = cat.minLvl <= unlockedLevel;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCatIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                  isCatActive
                    ? 'bg-[#683710] text-[#ffedd5] shadow-md border border-[#c48e4b]'
                    : 'bg-[#dfc5a0]/60 text-[#5c3510] hover:bg-[#dfc5a0]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[9px] px-1 rounded-sm ${isCatActive ? 'bg-amber-400/25 text-amber-200' : 'text-[#8a501a]'}`}>
                  {cat.minLvl}-{cat.maxLvl}
                </span>
              </button>
            );
          })}
        </div>

        {/* Level Grid (Scrollable) */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{activeCategory.icon}</span>
              <div>
                <h4 className="text-xs font-black text-[#5c3510] uppercase tracking-wider">
                  {activeCategory.label}
                </h4>
                <p className="text-[10px] text-[#8a501a]">
                  Levels {activeCategory.minLvl} to {activeCategory.maxLvl}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#5c3510]">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Direct Entry (0 Coins)</span>
            </div>
          </div>

          {/* Level Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {categoryLevels.map((lvl) => {
              const isPastCompleted = lvl.levelNum < unlockedLevel;

              return (
                <button
                  key={lvl.levelNum}
                  disabled={!lvl.isUnlocked}
                  onClick={() => {
                    if (lvl.isUnlocked) {
                      onSelectLevel(lvl.levelIdx);
                      onClose();
                    }
                  }}
                  className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    lvl.isCurrent
                      ? 'bg-gradient-to-b from-[#fef08a] to-[#fde047] border-[#eab308] text-[#713f12] shadow-lg scale-102 ring-2 ring-amber-400/50'
                      : lvl.isUnlocked
                      ? 'bg-[#f7efe1] hover:bg-[#eedbc1] border-[#c48e4b] text-[#22140a] shadow-xs active:scale-95'
                      : 'bg-[#e5d5c0]/60 border-[#c48e4b]/40 text-[#8a501a]/60 cursor-not-allowed opacity-60'
                  }`}
                >
                  {/* Status Indicator */}
                  <div className="absolute top-1.5 right-1.5">
                    {lvl.isCurrent ? (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                      </span>
                    ) : isPastCompleted ? (
                      <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    ) : !lvl.isUnlocked ? (
                      <Lock className="w-3 h-3 text-[#8a501a]/70" />
                    ) : null}
                  </div>

                  {/* Level Number */}
                  <div className="text-xl font-black font-mono tracking-tight text-[#22140a] mb-0.5">
                    {lvl.levelNum}
                  </div>

                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#5c3510]">
                    {lvl.isCurrent ? 'Current' : lvl.isUnlocked ? 'Play Now' : 'Locked'}
                  </span>

                  {/* Direct Play Banner */}
                  {lvl.isUnlocked && (
                    <div className="mt-1.5 flex items-center gap-1 text-[8px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-full">
                      <Play className="w-2 h-2 fill-current" />
                      <span>START</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#e6c99c] bg-[#eedbc1] text-center shrink-0">
          <p className="text-[10px] text-[#5c3510] font-bold flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Select any level above to start playing instantly without spending coins.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
