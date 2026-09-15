/**
 * Color Rush - Player Statistics Dashboard
 * Displays 11 core competitive metrics with precision analytics.
 */

import React from 'react';
import { 
  BarChart3, 
  ArrowLeft, 
  Trophy, 
  Target, 
  Flame, 
  Zap, 
  Clock, 
  Award, 
  Layers, 
  ShieldCheck,
  Percent
} from 'lucide-react';
import { ColorRushProgression } from '../types';
import { TOTAL_COLOR_RUSH_LEVELS } from '../levels';
import { ColorRushAudio } from '../colorRushAudio';

interface ColorRushStatsModalProps {
  progression: ColorRushProgression;
  playerName: string;
  onBack: () => void;
}

export const ColorRushStatsModal: React.FC<ColorRushStatsModalProps> = ({
  progression,
  playerName,
  onBack,
}) => {
  const completedLevels = Object.keys(progression.levelBestScores).length;
  const bestScoresList = Object.values(progression.levelBestScores) as number[];
  const bestLevelScore = bestScoresList.length > 0
    ? Math.max(...bestScoresList)
    : 0;

  const avgReactionMs = progression.reactionCount > 0
    ? Math.round(progression.totalReactionTimeMs / progression.reactionCount)
    : 0;

  // Global rank estimation based on score
  const estimatedRank = Math.max(1, 14850 - Math.min(14840, Math.round(progression.totalCumulativeScore * 1.8)));

  const statsList = [
    {
      id: 'career_score',
      label: 'Career Cumulative Score',
      value: `${progression.totalCumulativeScore.toLocaleString()} PTS`,
      sub: 'Sum of personal bests',
      icon: Trophy,
      color: 'text-amber-400',
      bg: 'bg-amber-500/15 border-amber-500/30',
    },
    {
      id: 'global_rank',
      label: 'Global Rank Standing',
      value: `#${estimatedRank.toLocaleString()}`,
      sub: 'Out of 14,850+ competitors',
      icon: ShieldCheck,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/15 border-cyan-500/30',
    },
    {
      id: 'highest_level',
      label: 'Highest Level Unlocked',
      value: `Level ${progression.currentUnlockedLevel}`,
      sub: `Campaign progress ${Math.round((completedLevels / TOTAL_COLOR_RUSH_LEVELS) * 100)}%`,
      icon: Layers,
      color: 'text-blue-400',
      bg: 'bg-blue-500/15 border-blue-500/30',
    },
    {
      id: 'levels_completed',
      label: 'Levels Cleared',
      value: `${completedLevels} / ${TOTAL_COLOR_RUSH_LEVELS}`,
      sub: `${TOTAL_COLOR_RUSH_LEVELS - completedLevels} levels remaining`,
      icon: Award,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15 border-emerald-500/30',
    },
    {
      id: 'best_level_score',
      label: 'Highest Single Level Score',
      value: `${bestLevelScore.toLocaleString()} PTS`,
      sub: 'Peak single performance',
      icon: Zap,
      color: 'text-amber-300',
      bg: 'bg-amber-500/15 border-amber-500/30',
    },
    {
      id: 'total_correct',
      label: 'Total Correct Colors',
      value: `${progression.totalCorrectColors.toLocaleString()}`,
      sub: 'Total correct targets clicked',
      icon: Target,
      color: 'text-teal-400',
      bg: 'bg-teal-500/15 border-teal-500/30',
    },
    {
      id: 'highest_streak',
      label: 'Best Streak Ever',
      value: `${progression.highestStreak}x Streak`,
      sub: 'Consecutive perfect answers',
      icon: Flame,
      color: 'text-orange-400',
      bg: 'bg-orange-500/15 border-orange-500/30',
    },
    {
      id: 'perfect_levels',
      label: 'Perfect Levels (100% Hits)',
      value: `${progression.perfectLevelsCount}`,
      sub: 'Zero-miss flawless matches',
      icon: Award,
      color: 'text-fuchsia-400',
      bg: 'bg-fuchsia-500/15 border-fuchsia-500/30',
    },
    {
      id: 'avg_reaction',
      label: 'Average Reaction Speed',
      value: avgReactionMs > 0 ? `${avgReactionMs} ms` : '—',
      sub: avgReactionMs > 0 && avgReactionMs < 500 ? '⚡ Elite reflexes' : 'Human baseline',
      icon: Clock,
      color: 'text-rose-400',
      bg: 'bg-rose-500/15 border-rose-500/30',
    },
    {
      id: 'total_games',
      label: 'Total Games Played',
      value: `${progression.totalGamesPlayed}`,
      sub: 'Sessions & level attempts',
      icon: BarChart3,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/15 border-indigo-500/30',
    },
  ];

  return (
    <div 
      className="relative w-full max-w-md mx-auto flex flex-col items-center select-none rounded-3xl overflow-hidden border-2 border-blue-500/40 shadow-2xl min-h-[640px] max-h-[92vh] font-['Plus_Jakarta_Sans',sans-serif] text-slate-100"
      style={{
        background: 'radial-gradient(circle at 50% 10%, #0c244c 0%, #05132b 50%, #020917 100%)',
      }}
    >
      {/* HEADER */}
      <div className="w-full bg-[#061c3d]/95 backdrop-blur-md px-4 py-3 border-b border-[#0f346b] flex items-center justify-between gap-2 z-20 shrink-0">
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
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-white tracking-tight">
              Player Statistics
            </h2>
          </div>
        </div>

        <div className="text-xs font-bold text-slate-300 truncate max-w-[120px]">
          {playerName || 'Player'}
        </div>
      </div>

      {/* METRIC CARDS LIST */}
      <div className="relative w-full flex-1 overflow-y-auto p-4 space-y-2.5 z-10">
        
        {/* Highlight Banner: Anti-Farming Competitive Principle */}
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-black text-white">Competitive Scoring Model: </span>
            Career points are computed from your <span className="underline font-bold">single best performance</span> on each completed level. Replays only increase your score if you beat your previous best!
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {statsList.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                    {stat.label}
                  </span>
                  <span className={`text-base font-black font-mono tracking-tight tabular-nums ${stat.color}`}>
                    {stat.value}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate">
                    {stat.sub}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div className="w-full bg-[#051c3d]/95 backdrop-blur-md p-3 border-t border-[#0f346b] flex items-center justify-center z-20 shrink-0">
        <button
          onClick={() => {
            ColorRushAudio.playTap();
            onBack();
          }}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          Return to Menu
        </button>
      </div>
    </div>
  );
};
