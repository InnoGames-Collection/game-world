import React from 'react';
import { ArrowLeft, Award, CheckCircle2, Lock, Star, Trophy, Flame, Zap } from 'lucide-react';
import { PopBalloonProgress } from '../types';

interface PopBalloonAchievementsProps {
  progress: PopBalloonProgress;
  onBack: () => void;
}

export const PopBalloonAchievements: React.FC<PopBalloonAchievementsProps> = ({
  progress,
  onBack,
}) => {
  const achievements = [
    {
      id: 'qualifier',
      title: 'Tournament Qualifier',
      description: 'Clear Stage 1 with 100 minimum balloon pops',
      icon: '🎯',
      unlocked: progress.unlockedLevel > 1 || (progress.levelBestScores[1] && progress.levelBestScores[1] > 0),
      progressText: progress.unlockedLevel > 1 ? 'Completed' : 'Stage 1 Needed',
    },
    {
      id: 'century',
      title: 'Century Club',
      description: 'Pop at least 100 total balloons in tournament matches',
      icon: '🎈',
      unlocked: progress.totalBalloonsPoppedAllTime >= 100,
      progressText: `${Math.min(100, progress.totalBalloonsPoppedAllTime)} / 100 Pops`,
    },
    {
      id: 'combo',
      title: 'Combo Maestro',
      description: 'Achieve a 15x or higher continuous combo chain',
      icon: '🔥',
      unlocked: progress.bestComboAllTime >= 15,
      progressText: `Best: ${progress.bestComboAllTime}x / 15x`,
    },
    {
      id: 'reflex',
      title: 'Lightning Reflexes',
      description: 'Complete a stage with average reflex under 400ms',
      icon: '⚡',
      unlocked: progress.bestReactionMs <= 400 && Object.keys(progress.levelBestScores).length > 0,
      progressText: `${progress.bestReactionMs}ms reflex`,
    },
    {
      id: 'halfway',
      title: 'Midway Champion',
      description: 'Unlock and clear Stage 20 of the championship',
      icon: '🏆',
      unlocked: progress.unlockedLevel > 20,
      progressText: `Stage ${Math.min(20, progress.unlockedLevel)} / 20`,
    },
    {
      id: 'grandmaster',
      title: 'Grandmaster of Air',
      description: 'Conquer all 40 progressive tournament stages',
      icon: '👑',
      unlocked: progress.unlockedLevel >= 40 && progress.levelBestScores[40] !== undefined,
      progressText: `${Object.keys(progress.levelBestScores).length} / 40 Completed`,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div
      id="pop-balloon-achievements-view"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-5 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#070D1E] via-[#0D183A] to-[#070D1E] text-white overflow-y-auto custom-scrollbar"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-[#070D1E]/95 backdrop-blur-md z-20 shrink-0">
        <button
          id="pop-balloon-achievements-back-btn"
          type="button"
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-md"
          title="Back to Menu"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-rose-400" />
            <span>Badges & Honors</span>
          </h2>
          <p className="text-[11px] text-blue-300 font-bold uppercase tracking-widest">
            {unlockedCount} of {achievements.length} Unlocked
          </p>
        </div>

        <div className="w-11" />
      </div>

      {/* ACHIEVEMENTS LIST */}
      <div className="flex flex-col gap-2.5 my-3 flex-1">
        {achievements.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
              item.unlocked
                ? 'bg-gradient-to-r from-amber-950/30 via-[#0F1E3C] to-[#0A1428] border-amber-500/40 shadow-md'
                : 'bg-white/5 border-white/5 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${
                  item.unlocked
                    ? 'bg-amber-500/20 border-amber-400/40'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                {item.icon}
              </div>
              <div>
                <div className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>{item.title}</span>
                  {item.unlocked && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  {item.description}
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  item.unlocked
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-white/10 text-slate-400 border border-white/10'
                }`}
              >
                {item.progressText}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
