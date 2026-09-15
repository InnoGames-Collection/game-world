import React, { useState, useMemo } from 'react';
import { ArrowLeft, Lock, CheckCircle2, Play, Flag, ChevronRight, Gauge, Trophy } from 'lucide-react';
import { MOTO_RACE_LEVELS } from '../motoRaceLevels';
import { MotoLevelRecord } from '../types';

interface MotoRaceLevelSelectProps {
  levelProgress: Record<number, MotoLevelRecord>;
  currentLevelNum: number;
  onSelectLevel: (levelNum: number) => void;
  onBack: () => void;
}

export const MotoRaceLevelSelect: React.FC<MotoRaceLevelSelectProps> = ({
  levelProgress,
  currentLevelNum,
  onSelectLevel,
  onBack,
}) => {
  // Tier tabs for fast, responsive navigation through 40 levels
  const [selectedTier, setSelectedTier] = useState<'all' | '1-10' | '11-20' | '21-30' | '31-40'>('all');

  const filteredLevels = useMemo(() => {
    switch (selectedTier) {
      case '1-10':
        return MOTO_RACE_LEVELS.slice(0, 10);
      case '11-20':
        return MOTO_RACE_LEVELS.slice(10, 20);
      case '21-30':
        return MOTO_RACE_LEVELS.slice(20, 30);
      case '31-40':
        return MOTO_RACE_LEVELS.slice(30, 40);
      case 'all':
      default:
        return MOTO_RACE_LEVELS;
    }
  }, [selectedTier]);

  const completedCount = useMemo(() => {
    return (Object.values(levelProgress) as MotoLevelRecord[]).filter((l) => l.completed).length;
  }, [levelProgress]);

  return (
    <div
      id="moto-race-level-select"
      className="absolute inset-0 z-40 flex flex-col justify-between bg-[#121620] text-white select-none overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 15%, rgba(244, 63, 94, 0.1) 0%, rgba(18, 22, 32, 0.98) 60%, #0d1017 100%)',
      }}
    >
      {/* Top Header */}
      <div
        className="w-full max-w-2xl mx-auto px-4 py-3 flex items-center justify-between border-b border-slate-700/60 bg-slate-950/70 backdrop-blur-md flex-shrink-0"
        style={{ paddingTop: 'max(0.6rem, env(safe-area-inset-top, 0.6rem))' }}
      >
        <button
          id="moto-select-back-btn"
          onClick={onBack}
          className="h-10 px-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700/80 shadow-md transition-all cursor-pointer"
          title="Back to Menu"
          aria-label="Back to Menu"
        >
          <ArrowLeft className="w-4 h-4 text-rose-400 stroke-[2.5]" />
          <span className="text-xs uppercase tracking-wider">Menu</span>
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <Flag className="w-4 h-4 text-rose-400 fill-rose-400/20" />
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
              Select Stage
            </h2>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {completedCount} / 40 Completed
          </span>
        </div>

        <div className="w-16 flex justify-end">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[10px] font-mono font-bold text-amber-400">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>40 LV</span>
          </div>
        </div>
      </div>

      {/* Tier Tabs (All, 1-10, 11-20, 21-30, 31-40) */}
      <div className="w-full max-w-2xl mx-auto px-4 pt-2.5 pb-1 flex-shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {(
            [
              { id: 'all', label: 'All (1-40)' },
              { id: '1-10', label: 'Stage 1-10' },
              { id: '11-20', label: 'Stage 11-20' },
              { id: '21-30', label: 'Stage 21-30' },
              { id: '31-40', label: 'Stage 31-40' },
            ] as const
          ).map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                selectedTier === tier.id
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60 ring-1 ring-rose-400/40'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* 40-Stage Cards Grid */}
      <div className="w-full max-w-2xl mx-auto flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-4">
          {filteredLevels.map((lvl) => {
            const record = levelProgress[lvl.level] || {
              level: lvl.level,
              unlocked: lvl.level === 1,
              completed: false,
              highScore: 0,
            };

            const isCompleted = record.completed;
            const isUnlocked = record.unlocked || lvl.level === 1;
            const isCurrent = lvl.level === currentLevelNum;

            return (
              <div
                key={lvl.level}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(lvl.level);
                  }
                }}
                className={`relative rounded-2xl p-3.5 border transition-all select-none ${
                  isUnlocked ? 'cursor-pointer active:scale-[0.98]' : 'cursor-not-allowed opacity-65'
                } ${
                  isCurrent
                    ? 'bg-gradient-to-r from-[#241722] via-[#211d2a] to-[#1a202c] border-rose-500/90 shadow-lg shadow-rose-950/40 ring-1 ring-rose-400/50'
                    : isCompleted
                    ? 'bg-slate-900/80 hover:bg-slate-850 border-emerald-500/40 shadow-sm'
                    : isUnlocked
                    ? 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80 hover:border-slate-600 shadow-sm'
                    : 'bg-[#10141c]/90 border-slate-800/60'
                }`}
              >
                {/* Card Top Row: Level Number, Title, and State Badge */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-black font-mono text-white">
                      LV {lvl.level}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-100 truncate">
                      {lvl.title}
                    </span>
                  </div>

                  {/* Visual Status Indicator: COMPLETED, AVAILABLE / UNLOCKED, LOCKED */}
                  {isCompleted ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1 flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
                      <span>✓ Completed</span>
                    </span>
                  ) : isUnlocked ? (
                    <span className="px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-500/40 text-[10px] font-black uppercase tracking-wider text-sky-300 flex items-center gap-1 flex-shrink-0">
                      <Play className="w-3 h-3 text-sky-400 fill-current" />
                      <span>🔓 Available</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/40 text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1 flex-shrink-0">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>🔒 Locked</span>
                    </span>
                  )}
                </div>

                {/* Card Bottom Row: Target & Difficulty */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{lvl.targetDistanceMeters}m</span>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono">{lvl.timeLimitSeconds}s</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {record.highScore > 0 && (
                      <span className="font-mono font-bold text-amber-400 text-[10px]">
                        {record.highScore.toLocaleString()} PTS
                      </span>
                    )}
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                      {lvl.difficultyLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div
        className="w-full max-w-2xl mx-auto px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 text-center flex-shrink-0"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' }}
      >
        <p className="text-[10px] font-bold text-slate-400">
          Complete each stage to unlock the next challenge in sequence.
        </p>
      </div>
    </div>
  );
};
