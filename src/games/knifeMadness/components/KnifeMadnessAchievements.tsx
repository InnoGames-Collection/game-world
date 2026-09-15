/**
 * KNIFE MADNESS - Achievements Screen
 * 12 verified milestone achievements calculated directly from player career progress.
 */

import React from 'react';
import { ArrowLeft, Award, CheckCircle2, Lock, Star, Sparkles, Flame } from 'lucide-react';
import { KnifeMadnessCareerProgress } from '../types';

interface KnifeMadnessAchievementsProps {
  career: KnifeMadnessCareerProgress;
  onBack: () => void;
}

interface AchievementDef {
  id: string;
  title: string;
  desc: string;
  icon: string;
  isUnlocked: (career: KnifeMadnessCareerProgress) => boolean;
  progressText: (career: KnifeMadnessCareerProgress) => string;
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_throw',
    title: 'First Blood',
    desc: 'Successfully embed your first knife into a target.',
    icon: '🗡️',
    isUnlocked: (c) => c.totalHits > 0,
    progressText: (c) => `${Math.min(1, c.totalHits)} / 1`,
  },
  {
    id: 'stage_1',
    title: 'Timber Striker',
    desc: 'Complete Stage 1 and shatter the first target.',
    icon: '🪵',
    isUnlocked: (c) => c.levelsCompleted >= 1,
    progressText: (c) => `${Math.min(1, c.levelsCompleted)} / 1`,
  },
  {
    id: 'fruit_slicer',
    title: 'Fruit Slicer',
    desc: 'Slice 5 bonus fruits on targets.',
    icon: '🍎',
    isUnlocked: (c) => c.totalFruitsSliced >= 5,
    progressText: (c) => `${Math.min(5, c.totalFruitsSliced)} / 5`,
  },
  {
    id: 'fruit_master',
    title: 'Fruit Master',
    desc: 'Slice 20 bonus fruits across stages.',
    icon: '🍊',
    isUnlocked: (c) => c.totalFruitsSliced >= 20,
    progressText: (c) => `${Math.min(20, c.totalFruitsSliced)} / 20`,
  },
  {
    id: 'precision_striker',
    title: 'Precision Striker',
    desc: 'Achieve a precision gap tighter than 12° without touching.',
    icon: '🎯',
    isUnlocked: (c) => c.bestPrecisionDeg > 0 && c.bestPrecisionDeg <= 12,
    progressText: (c) => (c.bestPrecisionDeg > 0 && c.bestPrecisionDeg < 90 ? `${c.bestPrecisionDeg.toFixed(1)}°` : '—'),
  },
  {
    id: 'combo_prodigy',
    title: 'Combo Prodigy',
    desc: 'Execute 5 consecutive successful throws.',
    icon: '⚡',
    isUnlocked: (c) => c.bestCombo >= 5,
    progressText: (c) => `${Math.min(5, c.bestCombo)} / 5`,
  },
  {
    id: 'boss_slayer',
    title: 'Boss Hunter',
    desc: 'Defeat the first Boss Target at Stage 5.',
    icon: '👑',
    isUnlocked: (c) => (c.levelRecords[5]?.completed || false),
    progressText: (c) => (c.levelRecords[5]?.completed ? 'Completed' : 'Pending'),
  },
  {
    id: 'stage_10',
    title: 'Hardwood Veteran',
    desc: 'Conquer Stage 10 and defeat the Second Boss.',
    icon: '🛡️',
    isUnlocked: (c) => (c.levelRecords[10]?.completed || false),
    progressText: (c) => `${Math.min(10, c.levelsCompleted)} / 10`,
  },
  {
    id: 'combo_king',
    title: 'Combo King',
    desc: 'Achieve an unbroken 8+ knife combo streak.',
    icon: '🔥',
    isUnlocked: (c) => c.bestCombo >= 8,
    progressText: (c) => `${Math.min(8, c.bestCombo)} / 8`,
  },
  {
    id: 'halfway_hero',
    title: 'Halfway Hero',
    desc: 'Clear 20 stages in the tournament.',
    icon: '🏆',
    isUnlocked: (c) => c.levelsCompleted >= 20,
    progressText: (c) => `${Math.min(20, c.levelsCompleted)} / 20`,
  },
  {
    id: 'heavy_armor',
    title: 'Armor Piercer',
    desc: 'Conquer Stage 30 in Heavy Armor territory.',
    icon: '⚙️',
    isUnlocked: (c) => (c.levelRecords[30]?.completed || false),
    progressText: (c) => `${Math.min(30, c.levelsCompleted)} / 30`,
  },
  {
    id: 'grandmaster',
    title: 'Tournament Grandmaster',
    desc: 'Complete all 40 progressive stages of Knife Madness.',
    icon: '🌟',
    isUnlocked: (c) => c.levelsCompleted >= 40,
    progressText: (c) => `${c.levelsCompleted} / 40`,
  },
];

export const KnifeMadnessAchievements: React.FC<KnifeMadnessAchievementsProps> = ({
  career,
  onBack,
}) => {
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.isUnlocked(career)).length;

  return (
    <div
      id="knife-madness-achievements"
      className="relative w-full h-full max-w-md mx-auto flex flex-col p-4 bg-[#050e1d] text-white select-none overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          id="btn-achievements-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Menu</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-black uppercase tracking-wider text-amber-300">
            Achievements
          </h2>
          <p className="text-[10px] text-slate-400">Career Milestones</p>
        </div>

        <div className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800">
          {unlockedCount} / {ACHIEVEMENTS.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="my-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="flex justify-between text-xs font-bold mb-1.5">
          <span className="text-slate-300">Completion Progress</span>
          <span className="text-amber-400">
            {Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
            style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 space-y-2 mb-3">
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = ach.isUnlocked(career);

          return (
            <div
              key={ach.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                unlocked
                  ? 'bg-slate-900/90 border-amber-500/40 shadow-sm'
                  : 'bg-slate-950/60 border-slate-900 text-slate-500 opacity-75'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                    unlocked ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-slate-900'
                  }`}
                >
                  {ach.icon}
                </div>
                <div>
                  <div
                    className={`text-xs font-black uppercase ${
                      unlocked ? 'text-amber-300' : 'text-slate-400'
                    }`}
                  >
                    {ach.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 max-w-[210px] leading-tight">
                    {ach.desc}
                  </div>
                </div>
              </div>

              <div className="text-right">
                {unlocked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />
                ) : (
                  <div className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {ach.progressText(career)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
