import React from 'react';
import { Award, X, CheckCircle, Lock, Trophy } from 'lucide-react';
import { EmojiSortingPlayerProgress, EmojiSortingAchievement } from '../types';

interface EmojiSortingAchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: EmojiSortingPlayerProgress;
}

export const EmojiSortingAchievementsModal: React.FC<EmojiSortingAchievementsModalProps> = ({
  isOpen,
  onClose,
  progress,
}) => {
  if (!isOpen) return null;

  const completedCount = progress.completedLevels?.length || 0;
  const bestMoves = Object.values(progress.bestMoves || {}) as number[];
  const bestTimes = Object.values(progress.levelBestTimes || {}) as number[];

  const achievements: EmojiSortingAchievement[] = [
    {
      id: 'first_sort',
      title: 'First Emoji Match',
      description: 'Complete your first emoji sorting level',
      icon: '😀',
      target: 1,
      current: Math.min(1, completedCount),
      unlocked: completedCount >= 1,
    },
    {
      id: 'tactician',
      title: 'Emoji Prodigy',
      description: 'Solve an emoji level at or under par moves',
      icon: '🎯',
      target: 1,
      current: bestMoves.length > 0 ? 1 : 0,
      unlocked: bestMoves.length > 0,
    },
    {
      id: 'speed_sorter',
      title: 'Lightning Sorter',
      description: 'Clear any level in under 25 seconds',
      icon: '⚡',
      target: 1,
      current: bestTimes.some((t) => t <= 25) ? 1 : 0,
      unlocked: bestTimes.some((t) => t <= 25),
    },
    {
      id: 'hard_tier',
      title: 'Hard Tier Master',
      description: 'Complete all Levels 1 through 5',
      icon: '🥳',
      target: 5,
      current: Math.min(5, completedCount),
      unlocked: completedCount >= 5,
    },
    {
      id: 'very_hard_tier',
      title: 'Safari Connoisseur',
      description: 'Conquer Level 10',
      icon: '🦁',
      target: 10,
      current: Math.min(10, completedCount),
      unlocked: completedCount >= 10,
    },
    {
      id: 'expert_sorter',
      title: 'Cosmic Sorcerer',
      description: 'Reach and complete Level 20',
      icon: '🚀',
      target: 20,
      current: Math.min(20, completedCount),
      unlocked: completedCount >= 20,
    },
    {
      id: 'extreme_mind',
      title: 'Diamond Intellect',
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
    <div
      className="fixed inset-0 z-50 flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif] text-slate-800"
      style={{
        background: `
          radial-gradient(circle at 18% 12%, #FFE8E8 0%, transparent 48%),
          radial-gradient(circle at 82% 16%, #E8F6FF 0%, transparent 45%),
          radial-gradient(circle at 50% 45%, #F7EFFF 0%, transparent 60%),
          radial-gradient(circle at 15% 85%, #E7F9F3 0%, transparent 50%),
          radial-gradient(circle at 85% 88%, #FFE8E8 0%, transparent 45%),
          #FAF7FD
        `,
      }}
    >
      <div className="w-full max-w-lg mx-auto space-y-4 pb-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600 shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                ACHIEVEMENTS
              </h2>
              <p className="text-xs text-slate-500">
                {unlockedCount} / {achievements.length} Badges Unlocked
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border border-purple-100 shadow-xs"
            aria-label="Close Achievements"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Overview Bar */}
        <div className="p-3 rounded-xl bg-white/90 border border-purple-100 shadow-xs space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-700 font-bold">Total Completion</span>
            <span className="text-pink-600 font-mono font-bold">
              {Math.round((unlockedCount / achievements.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-amber-400 transition-all duration-500"
              style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Achievement Badges List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                ach.unlocked
                  ? 'bg-pink-50/80 border-pink-200 shadow-xs'
                  : 'bg-slate-100/60 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shrink-0 border border-purple-100 shadow-2xs">
                  {ach.icon}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{ach.title}</span>
                    {ach.unlocked && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    {ach.description}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                {ach.unlocked ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase border border-emerald-200">
                    Unlocked
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <Lock className="w-3 h-3" />
                    <span>{ach.current}/{ach.target}</span>
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
