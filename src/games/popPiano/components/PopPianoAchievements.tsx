import React from 'react';
import { ArrowLeft, Award, CheckCircle2, Lock, Zap, Flame, Trophy, Target, Star, ShieldCheck } from 'lucide-react';
import { PopPianoProgress, AchievementDef } from '../types';

interface PopPianoAchievementsProps {
  progress: PopPianoProgress;
  onBack: () => void;
}

export const PopPianoAchievements: React.FC<PopPianoAchievementsProps> = ({
  progress,
  onBack,
}) => {
  const stats = progress.stats;
  const completedCount = Object.keys(progress.completedLevels || {}).length;

  const ACHIEVEMENTS_LIST: AchievementDef[] = [
    {
      id: 'first_100',
      title: 'First 100',
      description: 'Successfully press 100 black tiles across your tournament career.',
      iconName: 'Target',
      isUnlocked: Boolean(progress.achievements['first_100']),
      progressText: `${Math.min(100, stats.totalBlackTilesPressed)} / 100 Tiles`,
    },
    {
      id: 'speed_player',
      title: 'Speed Player',
      description: 'Achieve an average reaction time of 210ms or faster on a level.',
      iconName: 'Zap',
      isUnlocked: Boolean(progress.achievements['speed_player']),
      progressText: stats.averageReactionTimeMs > 0 ? `Best Avg: ${stats.averageReactionTimeMs}ms` : 'Target: <= 210ms',
    },
    {
      id: 'combo_master',
      title: 'Combo Master',
      description: 'Reach a continuous 50+ streak combo in a single match.',
      iconName: 'Flame',
      isUnlocked: Boolean(progress.achievements['combo_master']),
      progressText: `${stats.bestCombo} / 50 Streak`,
    },
    {
      id: 'century_streak',
      title: 'Century Streak',
      description: 'Reach an extraordinary 100+ streak combo in a single match.',
      iconName: 'Flame',
      isUnlocked: Boolean(progress.achievements['century_streak']),
      progressText: `${stats.bestCombo} / 100 Streak`,
    },
    {
      id: 'perfect_run',
      title: 'Flawless Run',
      description: 'Complete any level with 100% accuracy and zero mistakes.',
      iconName: 'Star',
      isUnlocked: Boolean(progress.achievements['perfect_run']),
      progressText: progress.achievements['perfect_run'] ? 'Unlocked' : 'Requires 100% Accuracy & 0 Misses',
    },
    {
      id: 'precision_virtuoso',
      title: 'Precision Virtuoso',
      description: 'Achieve 85% or higher PERFECT judgments on a cleared level.',
      iconName: 'Award',
      isUnlocked: Boolean(progress.achievements['precision_virtuoso']),
      progressText: progress.achievements['precision_virtuoso'] ? 'Unlocked' : 'Target: >= 85% Perfects',
    },
    {
      id: 'hard_tier',
      title: 'Hard Tier Graduate',
      description: 'Conquer the initial gauntlet by completing Level 5.',
      iconName: 'ShieldCheck',
      isUnlocked: Boolean(progress.achievements['hard_tier']),
      progressText: `${Math.min(5, completedCount)} / 5 Levels`,
    },
    {
      id: 'very_hard_tier',
      title: 'Very Hard Master',
      description: 'Break through the advanced ranks by completing Level 10.',
      iconName: 'ShieldCheck',
      isUnlocked: Boolean(progress.achievements['very_hard_tier']),
      progressText: `${Math.min(10, completedCount)} / 10 Levels`,
    },
    {
      id: 'expert_tier',
      title: 'Expert Tier Virtuoso',
      description: 'Reach half-way tournament mastery by completing Level 20.',
      iconName: 'Trophy',
      isUnlocked: Boolean(progress.achievements['expert_tier']),
      progressText: `${Math.min(20, completedCount)} / 20 Levels`,
    },
    {
      id: 'expert_plus_tier',
      title: 'Expert+ Prodigy',
      description: 'Overcome high velocity tempo shifts by completing Level 30.',
      iconName: 'Trophy',
      isUnlocked: Boolean(progress.achievements['expert_plus_tier']),
      progressText: `${Math.min(30, completedCount)} / 30 Levels`,
    },
    {
      id: 'extreme_tier',
      title: 'Extreme Survivor',
      description: 'Reach the pinnacle of difficulty by completing Level 39.',
      iconName: 'Zap',
      isUnlocked: Boolean(progress.achievements['extreme_tier']),
      progressText: `${Math.min(39, completedCount)} / 39 Levels`,
    },
    {
      id: 'grand_master',
      title: 'Grand Master Champion',
      description: 'Conquer Level 40: 320 Black Tiles at 950 px/s ultimate tempo.',
      iconName: 'Trophy',
      isUnlocked: Boolean(progress.achievements['grand_master']),
      progressText: progress.completedLevels[40] ? 'Grand Master Cleared' : 'Level 40 Incomplete',
    },
    {
      id: 'endurance_champion',
      title: 'Endurance Champion',
      description: 'Successfully strike 1,000 total black tiles in career.',
      iconName: 'Target',
      isUnlocked: Boolean(progress.achievements['endurance_champion']),
      progressText: `${Math.min(1000, stats.totalBlackTilesPressed)} / 1,000 Tiles`,
    },
    {
      id: 'tournament_titan',
      title: 'Tournament Titan',
      description: 'Accumulate 5,000+ points in authoritative cumulative score.',
      iconName: 'Trophy',
      isUnlocked: Boolean(progress.achievements['tournament_titan']),
      progressText: `${progress.totalScore.toLocaleString()} / 5,000 PTS`,
    },
  ];

  const unlockedCount = ACHIEVEMENTS_LIST.filter((a) => a.isUnlocked).length;

  return (
    <div
      id="pop-piano-achievements-view"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white overflow-y-auto custom-scrollbar"
    >
      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-[#0B132B]/90 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Menu"
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
            Achievements
          </h2>
          <p className="text-[11px] text-amber-300 font-bold uppercase tracking-widest">
            {unlockedCount} / {ACHIEVEMENTS_LIST.length} Badges Earned
          </p>
        </div>

        <div className="w-11" />
      </header>

      {/* ACHIEVEMENTS GRID */}
      <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto w-full">
        {ACHIEVEMENTS_LIST.map((ach) => (
          <div
            key={ach.id}
            className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
              ach.isUnlocked
                ? 'bg-gradient-to-r from-amber-500/15 via-white/[0.06] to-transparent border-amber-400/40 shadow-md'
                : 'bg-white/5 border-white/10 opacity-70'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                ach.isUnlocked
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-inner'
                  : 'bg-black/30 text-slate-500 border-white/10'
              }`}
            >
              {ach.isUnlocked ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h3 className="text-xs font-black text-white uppercase tracking-wide truncate">
                  {ach.title}
                </h3>
                {ach.isUnlocked && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {ach.description}
              </p>
              <div className="mt-2 text-[10px] font-mono text-cyan-300 font-semibold">
                {ach.progressText}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
