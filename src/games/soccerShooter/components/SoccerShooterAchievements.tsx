import React from 'react';
import { ArrowLeft, Award, CheckCircle2, Lock } from 'lucide-react';
import { LevelProgress } from '../types';

interface SoccerShooterAchievementsProps {
  progress: LevelProgress;
  onClose: () => void;
}

interface AchievementDef {
  id: string;
  title: string;
  desc: string;
  icon: string;
  isUnlocked: (prog: LevelProgress) => boolean;
  getProgress: (prog: LevelProgress) => { current: number; max: number };
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_pop',
    title: 'First Impact',
    desc: 'Clear your first bubble cluster in Level 1',
    icon: '🎯',
    isUnlocked: (p) => Object.keys(p.completedLevels || {}).length >= 1,
    getProgress: (p) => ({
      current: Math.min(1, Object.keys(p.completedLevels || {}).length),
      max: 1,
    }),
  },
  {
    id: 'combo_master',
    title: 'Combo Striker',
    desc: 'Reach a consecutive match combo of 4x or higher',
    icon: '🔥',
    isUnlocked: (p) => (p.stats?.bestCombo || 0) >= 4,
    getProgress: (p) => ({
      current: Math.min(4, p.stats?.bestCombo || 0),
      max: 4,
    }),
  },
  {
    id: 'hard_tier',
    title: 'Hard Tier Conquered',
    desc: 'Complete all Hard stages (Levels 1 to 5)',
    icon: '⚡',
    isUnlocked: (p) => (p.highestUnlockedLevel || 1) > 5,
    getProgress: (p) => ({
      current: Math.min(5, Object.keys(p.completedLevels || {}).filter((k) => Number(k) <= 5).length),
      max: 5,
    }),
  },
  {
    id: 'flawless_clear',
    title: 'Flawless Marksman',
    desc: 'Earn a PERFECT rating on any stage with 0 missed shots',
    icon: '⭐',
    isUnlocked: (p) => (p.stats?.perfectLevelsCount || 0) >= 1,
    getProgress: (p) => ({
      current: Math.min(1, p.stats?.perfectLevelsCount || 0),
      max: 1,
    }),
  },
  {
    id: 'expert_tier',
    title: 'Expert Tier Veteran',
    desc: 'Clear Level 20 and reach Expert+ stages',
    icon: '🏆',
    isUnlocked: (p) => (p.highestUnlockedLevel || 1) > 20,
    getProgress: (p) => ({
      current: Math.min(20, p.highestUnlockedLevel || 1),
      max: 20,
    }),
  },
  {
    id: 'grand_master',
    title: 'Master of Bubbles',
    desc: 'Complete all 40 progressive tournament stages',
    icon: '👑',
    isUnlocked: (p) => Object.keys(p.completedLevels || {}).length >= 40,
    getProgress: (p) => ({
      current: Math.min(40, Object.keys(p.completedLevels || {}).length),
      max: 40,
    }),
  },
];

export const SoccerShooterAchievements: React.FC<SoccerShooterAchievementsProps> = ({
  progress,
  onClose,
}) => {
  return (
    <div
      id="soccer-shooter-achievements-view"
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
            <Award className="w-5 h-5 text-emerald-400" />
            <span>Badges & Honors</span>
          </h2>
          <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest">
            Career Milestones
          </p>
        </div>

        <div className="w-11 h-11" />
      </header>

      {/* ACHIEVEMENTS LIST */}
      <main className="relative z-10 flex-1 py-3 space-y-2.5 overflow-y-auto custom-scrollbar pr-1">
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = ach.isUnlocked(progress);
          const prog = ach.getProgress(progress);
          const percent = Math.min(100, Math.round((prog.current / prog.max) * 100));

          return (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border transition-colors flex items-center gap-3.5 ${
                unlocked
                  ? 'bg-emerald-950/25 border-emerald-500/40 shadow-sm'
                  : 'bg-white/[0.04] border-white/10 opacity-70'
              }`}
            >
              {/* Badge Icon */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
                  unlocked
                    ? 'bg-emerald-500/20 border-emerald-400/40'
                    : 'bg-slate-800/60 border-white/10'
                }`}
              >
                {unlocked ? ach.icon : <Lock className="w-5 h-5 text-slate-500" />}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-white uppercase truncate">
                    {ach.title}
                  </h3>
                  {unlocked ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {prog.current} / {prog.max}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  {ach.desc}
                </p>

                {/* Progress Bar */}
                {!unlocked && (
                  <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
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
