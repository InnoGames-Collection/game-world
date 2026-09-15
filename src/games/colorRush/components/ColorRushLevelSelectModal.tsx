/**
 * Color Rush - 40-Level Locked Progression Selection Map
 * 
 * Displays locked / unlocked / completed states:
 * - Locked: Lock icon, required level, difficulty tier
 * - Completed: Checkmark, 1-3 stars, Best Score
 * - Unlocked Current: Pulsing cyber ring, ready to play
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Lock, 
  CheckCircle2, 
  Star, 
  Play, 
  Zap, 
  Flame, 
  Target,
  ShieldAlert
} from 'lucide-react';
import { ColorRushProgression, DifficultyTier } from '../types';
import { COLOR_RUSH_LEVELS, getDifficultyBadgeColor, calculateStars } from '../levels';
import { ColorRushAudio } from '../colorRushAudio';

interface ColorRushLevelSelectModalProps {
  progression: ColorRushProgression;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

const TIERS: { name: DifficultyTier; label: string; range: [number, number] }[] = [
  { name: 'Beginner', label: 'Tier 1: Beginner', range: [1, 5] },
  { name: 'Novice', label: 'Tier 2: Novice', range: [6, 10] },
  { name: 'Intermediate', label: 'Tier 3: Intermediate', range: [11, 16] },
  { name: 'Advanced', label: 'Tier 4: Advanced', range: [17, 22] },
  { name: 'Expert', label: 'Tier 5: Expert', range: [23, 28] },
  { name: 'Master', label: 'Tier 6: Master', range: [29, 33] },
  { name: 'Grandmaster', label: 'Tier 7: Grandmaster', range: [34, 37] },
  { name: 'Legend', label: 'Tier 8: Legend', range: [38, 40] },
];

export const ColorRushLevelSelectModal: React.FC<ColorRushLevelSelectModalProps> = ({
  progression,
  onSelectLevel,
  onBack,
}) => {
  const [activeTier, setActiveTier] = useState<DifficultyTier>('Beginner');

  const selectedTierConfig = TIERS.find((t) => t.name === activeTier) || TIERS[0];
  const levelsInTier = COLOR_RUSH_LEVELS.filter(
    (l) => l.level >= selectedTierConfig.range[0] && l.level <= selectedTierConfig.range[1]
  );

  const handleLevelClick = (level: number) => {
    if (level > progression.currentUnlockedLevel) {
      ColorRushAudio.playWrong();
      return;
    }
    ColorRushAudio.playTap();
    onSelectLevel(level);
  };

  return (
    <div 
      className="relative w-full max-w-md mx-auto flex flex-col items-center select-none rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl min-h-[640px] max-h-[92vh] font-['Plus_Jakarta_Sans',sans-serif] text-slate-100"
      style={{
        background: 'radial-gradient(circle at 50% 10%, #0c284f 0%, #04142b 50%, #010814 100%)',
      }}
    >
      {/* HEADER */}
      <div className="w-full bg-[#051c3d]/95 backdrop-blur-md px-4 py-3 border-b border-[#0e3b75] flex items-center justify-between gap-2 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              ColorRushAudio.playTap();
              onBack();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700 flex items-center justify-center text-slate-300 transition-all cursor-pointer shrink-0"
            title="Back to Menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-black text-white tracking-tight">
              Championship Levels
            </h2>
            <div className="text-[10px] text-cyan-400 font-bold">
              Unlocked: Level {progression.currentUnlockedLevel} / 40
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-black font-mono text-cyan-300">
            {Object.keys(progression.levelBestScores).length}/40
          </div>
          <div className="text-[8px] text-slate-400 uppercase font-bold">
            Cleared
          </div>
        </div>
      </div>

      {/* TIER TABS SELECTOR (Horizontal scroll for 8 tiers) */}
      <div className="w-full px-3 py-2 z-10 shrink-0 overflow-x-auto no-scrollbar border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 min-w-max pb-1">
          {TIERS.map((tier) => {
            const isActive = activeTier === tier.name;
            const isUnlocked = progression.currentUnlockedLevel >= tier.range[0];

            return (
              <button
                key={tier.name}
                onClick={() => {
                  ColorRushAudio.playTap();
                  setActiveTier(tier.name);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-[1.02]'
                    : isUnlocked
                    ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-900/60 text-slate-500 border border-slate-800/60'
                }`}
              >
                {!isUnlocked && <Lock className="w-3 h-3 text-slate-500" />}
                <span>{tier.name}</span>
                <span className="text-[9px] opacity-75 font-mono">
                  {tier.range[0]}-{tier.range[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SCROLLABLE LEVEL CARDS GRID */}
      <div className="relative w-full flex-1 overflow-y-auto p-4 space-y-3 z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {levelsInTier.map((lvl) => {
            const isUnlocked = lvl.level <= progression.currentUnlockedLevel;
            const isCurrent = lvl.level === progression.currentUnlockedLevel;
            const bestScore = progression.levelBestScores[lvl.level] || 0;
            const isCompleted = bestScore > 0;
            const stars = isCompleted ? calculateStars(bestScore, lvl) : 0;
            const badgeStyle = getDifficultyBadgeColor(lvl.difficulty);

            if (!isUnlocked) {
              // LOCKED LEVEL CARD
              return (
                <div
                  key={lvl.level}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between opacity-60 min-h-[110px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      LEVEL {lvl.level}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>LOCKED</span>
                    </div>
                  </div>

                  <div className="my-1">
                    <div className="text-sm font-bold text-slate-400 truncate">
                      {lvl.title}
                    </div>
                    <div className="text-[10px] text-rose-400/80 font-medium">
                      Complete Level {lvl.level - 1} to unlock
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-600">
                    <span>{lvl.rounds} Rounds • {lvl.optionCount} Colors</span>
                    <span className="font-mono">{lvl.timeLimitMs}ms</span>
                  </div>
                </div>
              );
            }

            // UNLOCKED / COMPLETED LEVEL CARD
            return (
              <button
                key={lvl.level}
                onClick={() => handleLevelClick(lvl.level)}
                className={`p-3.5 rounded-2xl text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[110px] relative overflow-hidden ${
                  isCurrent
                    ? 'bg-gradient-to-b from-[#0e3b75] to-[#061e40] border-2 border-cyan-400 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-400/30'
                    : isCompleted
                    ? 'bg-gradient-to-b from-[#09244a] to-[#04152d] border border-emerald-500/40 hover:border-emerald-400'
                    : 'bg-gradient-to-b from-[#09244a] to-[#04152d] border border-cyan-500/30 hover:border-cyan-400'
                }`}
              >
                {/* Subtle sheen highlight */}
                <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                {/* Card Header: Level Number, Status Badge */}
                <div className="flex items-center justify-between w-full z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-cyan-300">
                      LEVEL {lvl.level}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                      {lvl.difficulty}
                    </span>
                  </div>

                  {isCompleted ? (
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>CLEARED</span>
                    </div>
                  ) : isCurrent ? (
                    <div className="flex items-center gap-1 text-[10px] font-black text-cyan-300 animate-pulse">
                      <Play className="w-3 h-3 fill-cyan-300" />
                      <span>READY</span>
                    </div>
                  ) : null}
                </div>

                {/* Level Title */}
                <div className="my-1.5 z-10">
                  <div className="text-sm font-black text-white truncate">
                    {lvl.title}
                  </div>
                  {isCompleted ? (
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-amber-400 font-black font-mono">
                        Best: {bestScore} PTS
                      </span>
                      {/* Star ratings */}
                      <div className="flex items-center gap-0.5">
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
                    </div>
                  ) : (
                    <div className="text-[10px] text-cyan-300 font-medium">
                      Unlocked • Tap to challenge
                    </div>
                  )}
                </div>

                {/* Card Footer: Specs & Play CTA */}
                <div className="flex items-center justify-between text-[10px] text-slate-300 z-10 pt-1 border-t border-slate-800/60">
                  <span className="font-mono">
                    {lvl.rounds} Rounds • {lvl.optionCount} Colors
                  </span>
                  <div className="flex items-center gap-1 text-cyan-400 font-bold">
                    <span>Play</span>
                    <Play className="w-2.5 h-2.5 fill-cyan-400" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* QUICK FOOTER: CURRENT STAGE & TOTAL CUMULATIVE */}
      <div className="w-full bg-[#051c3d]/95 backdrop-blur-md p-3 border-t border-[#0e3b75] flex items-center justify-between z-20 shrink-0">
        <div className="text-xs text-slate-300 font-medium">
          Career Total: <span className="text-cyan-300 font-black font-mono">{progression.totalCumulativeScore.toLocaleString()} PTS</span>
        </div>
        <button
          onClick={() => {
            ColorRushAudio.playTap();
            onSelectLevel(progression.currentUnlockedLevel);
          }}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          Play Current Level ({progression.currentUnlockedLevel})
        </button>
      </div>
    </div>
  );
};
