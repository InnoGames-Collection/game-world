import React from 'react';
import { ArrowLeft, Award, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { MemoryMatchStorageData } from '../types';

interface AchievementsModalProps {
  storage: MemoryMatchStorageData;
  onBack: () => void;
}

interface AchievementDef {
  id: string;
  title: string;
  category: 'MEMORY' | 'ACCURACY' | 'SPEED' | 'COMBO' | 'LEVELS' | 'SCORE';
  description: string;
  xpPoints: number;
}

const ALL_ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_match',
    title: 'First Discovery',
    category: 'MEMORY',
    description: 'Find your first matching pair in the tournament.',
    xpPoints: 20,
  },
  {
    id: 'perfect_recall',
    title: 'Flawless Mind',
    category: 'ACCURACY',
    description: 'Complete any level with zero mistakes.',
    xpPoints: 50,
  },
  {
    id: 'speed_demon',
    title: 'Speed Prodigy',
    category: 'SPEED',
    description: 'Conquer any active stage in 20 seconds or less.',
    xpPoints: 40,
  },
  {
    id: 'combo_master',
    title: 'Combo Maestro',
    category: 'COMBO',
    description: 'Achieve an unbroken 4x or higher match streak.',
    xpPoints: 35,
  },
  {
    id: 'century_scorer',
    title: 'Century Marksman',
    category: 'SCORE',
    description: 'Score 180 or more points on a single competitive stage.',
    xpPoints: 45,
  },
  {
    id: 'halfway_champion',
    title: 'Colosseum Veteran',
    category: 'LEVELS',
    description: 'Successfully complete Level 20 of the tournament.',
    xpPoints: 75,
  },
  {
    id: 'grand_master',
    title: 'Grand Tournament Master',
    category: 'SCORE',
    description: 'Accumulate over 2,000 cumulative tournament points.',
    xpPoints: 100,
  },
  {
    id: 'cognitive_titan',
    title: 'Cognitive Titan',
    category: 'LEVELS',
    description: 'Conquer all 40 levels of the Memory Match tournament.',
    xpPoints: 250,
  },
];

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ storage, onBack }) => {
  const unlockedIds = new Set(storage.achievements || []);
  const unlockedCount = ALL_ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id)).length;

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
          <span className="text-xs font-black text-white uppercase tracking-wider">ACHIEVEMENTS</span>
          <span className="text-[10px] text-purple-400 font-bold">
            {unlockedCount} / {ALL_ACHIEVEMENTS.length} Unlocked
          </span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 space-y-2 py-3">
        {ALL_ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlockedIds.has(ach.id);

          return (
            <div
              key={ach.id}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                isUnlocked
                  ? 'bg-[#071D2F] border-purple-500/50 shadow-md'
                  : 'bg-[#040E1A]/60 border-white/5 opacity-60'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl ${
                  isUnlocked ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isUnlocked ? <Award className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white truncate">{ach.title}</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 uppercase">
                    {ach.category}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-snug mt-0.5">
                  {ach.description}
                </p>
              </div>

              <div className="shrink-0 text-right">
                {isUnlocked ? (
                  <span className="text-[10px] font-black text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>+{ach.xpPoints}</span>
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-slate-500 font-mono">
                    +{ach.xpPoints}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
