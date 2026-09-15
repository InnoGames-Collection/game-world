import React from 'react';
import { Award, X, CheckCircle, Lock, Trophy } from 'lucide-react';
import { SortingPlayerProgress, SortingAchievement } from '../types';

interface SortingAchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: SortingPlayerProgress;
}

export const SortingAchievementsModal: React.FC<SortingAchievementsModalProps> = ({
  isOpen,
  onClose,
  progress,
}) => {
  if (!isOpen) return null;

  const completedCount = progress.completedLevels?.length || 0;
  const bestMoves = Object.values(progress.bestMoves || {}) as number[];
  const bestTimes = Object.values(progress.levelBestTimes || {}) as number[];

  const achievements: SortingAchievement[] = [
    {
      id: 'first_sort',
      title: 'First Step',
      description: 'Complete your first sorting level',
      icon: '🧪',
      target: 1,
      current: Math.min(1, completedCount),
      unlocked: completedCount >= 1,
    },
    {
      id: 'tactician',
      title: 'Tactical Mind',
      description: 'Solve a level at or under par moves',
      icon: '🎯',
      target: 1,
      current: bestMoves.length > 0 ? 1 : 0,
      unlocked: bestMoves.length > 0,
    },
    {
      id: 'speed_sorter',
      title: 'Speed Sorter',
      description: 'Clear any level in under 25 seconds',
      icon: '⚡',
      target: 1,
      current: bestTimes.some((t) => t <= 25) ? 1 : 0,
      unlocked: bestTimes.some((t) => t <= 25),
    },
    {
      id: 'hard_tier',
      title: 'Hard Tier Conqueror',
      description: 'Complete all Levels 1 through 5',
      icon: '🛡️',
      target: 5,
      current: Math.min(5, completedCount),
      unlocked: completedCount >= 5,
    },
    {
      id: 'very_hard_tier',
      title: 'Very Hard Master',
      description: 'Conquer Level 10',
      icon: '🔥',
      target: 10,
      current: Math.min(10, completedCount),
      unlocked: completedCount >= 10,
    },
    {
      id: 'expert_sorter',
      title: 'Expert Strategist',
      description: 'Reach and complete Level 20',
      icon: '👑',
      target: 20,
      current: Math.min(20, completedCount),
      unlocked: completedCount >= 20,
    },
    {
      id: 'extreme_mind',
      title: 'Extreme Mind',
      description: 'Reach and complete Level 30',
      icon: '💎',
      target: 30,
      current: Math.min(30, completedCount),
      unlocked: completedCount >= 30,
    },
    {
      id: 'grandmaster',
      title: 'Tournament Grandmaster',
      description: 'Complete all 40 Tournament Levels',
      icon: '🏆',
      target: 40,
      current: completedCount,
      unlocked: completedCount >= 40,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 bg-[#070b16]/95 backdrop-blur-md flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-lg mx-auto space-y-4 pb-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                ACHIEVEMENTS
              </h2>
              <p className="text-xs text-slate-400">
                {unlockedCount} of {achievements.length} Unlocked
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            aria-label="Close Achievements"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Achievement Cards */}
        <div className="space-y-2">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                ach.unlocked
                  ? 'bg-purple-500/10 border-purple-500/30 text-white'
                  : 'bg-white/[0.02] border-white/5 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${
                    ach.unlocked
                      ? 'bg-purple-500/20 border-purple-400/40 text-purple-300'
                      : 'bg-white/5 border-white/10 text-slate-500'
                  }`}
                >
                  {ach.icon}
                </div>

                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{ach.title}</span>
                    {ach.unlocked && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {ach.description}
                  </div>
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                {ach.unlocked ? (
                  <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                    UNLOCKED
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <Lock className="w-3 h-3" />
                    {ach.current} / {ach.target}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
