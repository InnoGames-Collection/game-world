/**
 * Juicy Match - Tropical Map Level Progression Screen
 * Faithful to the reference video map with winding path, beach landmarks,
 * star nodes 1..40, and daily reward integration.
 */

import React, { useRef, useEffect } from 'react';
import { JuicyMatchSaveData } from './storage';
import { ALL_40_LEVELS } from './levelBank';
import { Lock, Star, Volume2, VolumeX, ArrowLeft, Heart, Coins, Gift } from 'lucide-react';
import { soundManager } from './audioEngine';

interface MapScreenProps {
  saveData: JuicyMatchSaveData;
  onSelectLevel: (level: number) => void;
  onOpenDailyReward: () => void;
  onExitToPortal: () => void;
  onToggleSound: () => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  saveData,
  onSelectLevel,
  onOpenDailyReward,
  onExitToPortal,
  onToggleSound,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentLevel = saveData.highestUnlockedLevel;

  // Auto-scroll to current unlocked level on mount
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = document.getElementById(`map-node-${currentLevel}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLevel]);

  // Total stars earned
  const totalStars = (Object.values(saveData.stars) as number[]).reduce((a, b) => a + (b || 0), 0);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#38bdf8] overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Top Fixed Navigation Bar */}
      <div className="relative z-30 flex items-center justify-between px-3 py-2 bg-white/90 backdrop-blur-md shadow-md border-b-2 border-amber-300">
        {/* Back / Exit Button */}
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onExitToPortal();
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xs shadow-md active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        {/* Center Stats (Lives + Star Rank + Coins) */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Max Lives Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500 text-white text-xs font-black shadow-inner">
            <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span>Max</span>
          </div>

          {/* Level Rank Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-black shadow-inner">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{currentLevel}</span>
          </div>

          {/* Coins Counter */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black shadow-inner">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>{saveData.coins}</span>
          </div>
        </div>

        {/* Right Action Icons (Daily Reward + Sound) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onOpenDailyReward();
            }}
            className="p-2 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-md active:scale-95 transition-transform animate-bounce"
            title="Daily Reward"
          >
            <Gift className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onToggleSound();
            }}
            className="p-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700 shadow-sm active:scale-95 transition-transform"
            title="Toggle Sound"
          >
            {saveData.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
          </button>
        </div>
      </div>

      {/* 2. Scrollable Tropical Map Canvas Area */}
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
        {/* Tropical Beach Visual Background */}
        <div className="relative w-full max-w-md mx-auto min-h-[2400px] bg-gradient-to-b from-[#38bdf8] via-[#7dd3fc] to-[#fed7aa] shadow-2xl overflow-hidden pb-24">
          
          {/* Distant Beach Scenery Decors */}
          {/* Beach Umbrella & Drinks Table */}
          <div className="absolute top-16 left-6 z-10 pointer-events-none opacity-90">
            <div className="text-4xl filter drop-shadow-md">🏖️</div>
          </div>

          {/* Pink Flamingo Float in Ocean */}
          <div className="absolute top-44 right-8 z-10 pointer-events-none animate-pulse">
            <div className="text-4xl filter drop-shadow-md">🦩</div>
          </div>

          {/* Tropical Fruit Basket */}
          <div className="absolute top-[380px] right-6 z-10 pointer-events-none">
            <div className="text-4xl filter drop-shadow-md">🍉</div>
          </div>

          {/* Juice Bar Stand */}
          <div className="absolute top-[680px] left-6 z-10 pointer-events-none">
            <div className="text-4xl filter drop-shadow-md">🍹</div>
          </div>

          {/* Palm Trees */}
          <div className="absolute top-[1020px] right-4 z-10 pointer-events-none">
            <div className="text-5xl filter drop-shadow-md">🌴</div>
          </div>

          {/* Golden Star Chest Milestone along path */}
          <div className="absolute top-[1400px] left-8 z-10 flex flex-col items-center bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-2xl shadow-lg border border-amber-300">
            <div className="text-3xl">🎁</div>
            <span className="text-[11px] font-black text-amber-700">{totalStars}/45 ★</span>
          </div>

          {/* Golden Winding Sandy Path SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 400 2400" preserveAspectRatio="none">
            <path
              d="M 200 120 
                 C 280 180, 320 280, 260 380 
                 C 200 480, 100 520, 140 620 
                 C 180 720, 320 780, 280 900 
                 C 240 1020, 80 1080, 120 1200 
                 C 160 1320, 320 1380, 260 1500 
                 C 200 1620, 90 1700, 150 1820 
                 C 210 1940, 310 2000, 240 2120 
                 C 170 2240, 150 2320, 200 2380"
              fill="none"
              stroke="#fde047"
              strokeWidth="48"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
            <path
              d="M 200 120 
                 C 280 180, 320 280, 260 380 
                 C 200 480, 100 520, 140 620 
                 C 180 720, 320 780, 280 900 
                 C 240 1020, 80 1080, 120 1200 
                 C 160 1320, 320 1380, 260 1500 
                 C 200 1620, 90 1700, 150 1820 
                 C 210 1940, 310 2000, 240 2120 
                 C 170 2240, 150 2320, 200 2380"
              fill="none"
              stroke="#fef08a"
              strokeWidth="40"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* 3. Render 40 Progressive Level Nodes */}
          {ALL_40_LEVELS.map((cfg) => {
            const lvl = cfg.level;
            const isUnlocked = lvl <= saveData.highestUnlockedLevel;
            const isCurrent = lvl === saveData.highestUnlockedLevel;
            const starsEarned = saveData.stars[lvl] || 0;

            // Compute curved node coordinates along winding path
            const progress = (lvl - 1) / 39;
            const yPos = 120 + progress * 2200;
            // Sine wave oscillation for pleasant winding placement
            const xPos = 200 + Math.sin(progress * Math.PI * 5) * 110;

            return (
              <div
                key={lvl}
                id={`map-node-${lvl}`}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer"
                style={{ left: `${xPos}px`, top: `${yPos}px` }}
                onClick={() => {
                  if (isUnlocked) {
                    soundManager.playButtonClick();
                    onSelectLevel(lvl);
                  } else {
                    soundManager.playInvalidSwap();
                  }
                }}
              >
                {/* Active Level Bouncing Hand Indicator (as seen in video!) */}
                {isCurrent && (
                  <div className="absolute -top-10 -right-2 text-2xl animate-bounce drop-shadow-md z-30">
                    👆
                  </div>
                )}

                {/* Level Circle Button */}
                <div
                  className={`relative w-14 h-14 rounded-full flex items-center justify-center font-black text-lg transition-transform active:scale-95 shadow-xl ${
                    isCurrent
                      ? 'bg-gradient-to-b from-amber-300 via-orange-400 to-amber-500 text-white ring-4 ring-amber-300 ring-offset-2 ring-offset-sky-200 animate-pulse'
                      : isUnlocked
                      ? 'bg-gradient-to-b from-emerald-400 to-teal-600 text-white border-2 border-emerald-200'
                      : 'bg-gradient-to-b from-slate-400 to-slate-600 text-slate-300 border-2 border-slate-300'
                  }`}
                >
                  {isUnlocked ? (
                    <span>{lvl}</span>
                  ) : (
                    <Lock className="w-5 h-5 text-slate-200" />
                  )}
                </div>

                {/* Stars container below completed levels */}
                {isUnlocked && starsEarned > 0 && (
                  <div className="flex items-center gap-0.5 mt-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-amber-200">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= starsEarned
                            ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]'
                            : 'text-slate-300 fill-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
