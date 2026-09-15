import React from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Lock,
  Trophy,
  Crown,
  Flame,
  Shield,
  Zap,
  Swords,
  Target,
} from 'lucide-react';
import { DamaProgress, DamaAchievementDef, DamaLevelSaveData } from '../types';

interface DamaAchievementsProps {
  progress: DamaProgress;
  onBack: () => void;
}

export const DamaAchievements: React.FC<DamaAchievementsProps> = ({
  progress,
  onBack,
}) => {
  const completedCount = (Object.values(progress.completedLevels) as DamaLevelSaveData[]).filter((l) => l.wins > 0).length;

  const ACHIEVEMENT_LIST: DamaAchievementDef[] = [
    {
      id: 'first_victory',
      title: 'First Victory',
      description: 'Win your first competitive tournament level.',
      isUnlocked: Boolean(progress.achievements['first_victory']),
      progressText: progress.achievements['first_victory'] ? 'Completed' : `${progress.stats.wins}/1 Win`,
    },
    {
      id: 'king_maker',
      title: 'King Maker',
      description: 'Promote a piece to King (Dama) by reaching the back row.',
      isUnlocked: Boolean(progress.achievements['king_maker']),
      progressText: progress.achievements['king_maker'] ? 'Crowned' : `${progress.stats.totalKings}/1 King`,
    },
    {
      id: 'clean_win',
      title: 'Clean Win',
      description: 'Win a match with 0 invalid move attempts.',
      isUnlocked: Boolean(progress.achievements['clean_win']),
      progressText: progress.achievements['clean_win'] ? 'Flawless' : 'Awaiting Clean Game',
    },
    {
      id: 'tactician',
      title: 'Tactician',
      description: 'Achieve at least 80% move efficiency in a victorious match.',
      isUnlocked: Boolean(progress.achievements['tactician']),
      progressText: progress.achievements['tactician'] ? 'Mastered' : 'Awaiting 80%+ Efficiency',
    },
    {
      id: 'win_streak_3',
      title: 'Tactical Momentum',
      description: 'Win 3 tournament levels in an unbroken win streak.',
      isUnlocked: Boolean(progress.achievements['win_streak_3']),
      progressText: progress.achievements['win_streak_3'] ? 'Achieved' : `${progress.stats.bestWinStreak}/3 Streak`,
    },
    {
      id: 'win_streak_5',
      title: 'Grand Champion Streak',
      description: 'Win 5 consecutive tournament levels in a row.',
      isUnlocked: Boolean(progress.achievements['win_streak_5']),
      progressText: progress.achievements['win_streak_5'] ? 'Achieved' : `${progress.stats.bestWinStreak}/5 Streak`,
    },
    {
      id: 'iron_defense',
      title: 'Iron Fortress',
      description: 'Win a match while retaining 8 or more player pieces.',
      isUnlocked: Boolean(progress.achievements['iron_defense']),
      progressText: progress.achievements['iron_defense'] ? 'Fortified' : '8+ Pieces Retained',
    },
    {
      id: 'clean_sweep',
      title: 'Clean Sweep',
      description: 'Capture all 12 opposing computer pieces in a single match.',
      isUnlocked: Boolean(progress.achievements['clean_sweep']),
      progressText: progress.achievements['clean_sweep'] ? 'Annihilation' : '12 Opponent Pieces',
    },
    {
      id: 'hard_tier',
      title: 'Hard Tier Cleared',
      description: 'Complete all Hard Tier levels (Levels 1 to 5).',
      isUnlocked: Boolean(progress.achievements['hard_tier']),
      progressText: progress.achievements['hard_tier'] ? 'Tier 1 Done' : `${Math.min(5, completedCount)}/5 Cleared`,
    },
    {
      id: 'level_10',
      title: 'Level 10 Conqueror',
      description: 'Conquer Level 10 and clear the Very Hard Tier.',
      isUnlocked: Boolean(progress.achievements['level_10']),
      progressText: progress.achievements['level_10'] ? 'Level 10 Done' : `${Math.min(10, completedCount)}/10 Cleared`,
    },
    {
      id: 'level_20',
      title: 'Level 20 Expert',
      description: 'Overcome Level 20 in the Expert Tier.',
      isUnlocked: Boolean(progress.achievements['level_20']),
      progressText: progress.achievements['level_20'] ? 'Level 20 Done' : `${Math.min(20, completedCount)}/20 Cleared`,
    },
    {
      id: 'level_30',
      title: 'Level 30 Master',
      description: 'Conquer Level 30 in the Expert+ Tier.',
      isUnlocked: Boolean(progress.achievements['level_30']),
      progressText: progress.achievements['level_30'] ? 'Level 30 Done' : `${Math.min(30, completedCount)}/30 Cleared`,
    },
    {
      id: 'extreme_tier',
      title: 'Extreme Survivor',
      description: 'Conquer Level 39 and reach the Grandmaster finale.',
      isUnlocked: Boolean(progress.achievements['extreme_tier']),
      progressText: progress.achievements['extreme_tier'] ? 'Level 39 Done' : `${Math.min(39, completedCount)}/39 Cleared`,
    },
    {
      id: 'dama_master',
      title: 'Supreme Dama Master',
      description: 'Triumph over Level 40 and conquer the entire tournament!',
      isUnlocked: Boolean(progress.achievements['dama_master']),
      progressText: progress.achievements['dama_master'] ? 'Tournament Champion' : `${completedCount}/40 Levels`,
    },
  ];

  const unlockedCount = ACHIEVEMENT_LIST.filter((a) => a.isUnlocked).length;

  return (
    <div
      id="dama-achievements-container"
      className="w-full max-w-xl mx-auto flex flex-col h-screen px-3 py-4 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          id="dama-achievements-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Menu</span>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Achievements</span>
          </span>
          <span className="text-[10px] text-amber-400/90 font-mono font-bold">
            {unlockedCount} of {ACHIEVEMENT_LIST.length} Unlocked
          </span>
        </div>

        <div className="w-12" />
      </div>

      {/* List of achievements */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
        {ACHIEVEMENT_LIST.map((ach) => (
          <div
            key={ach.id}
            className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
              ach.isUnlocked
                ? 'bg-slate-900/90 border-amber-500/40 shadow-md'
                : 'bg-slate-950/50 border-slate-800/60 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  ach.isUnlocked
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {ach.isUnlocked ? (
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-500" />
                )}
              </div>

              <div>
                <span
                  className={`text-xs font-bold block ${
                    ach.isUnlocked ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {ach.title}
                </span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  {ach.description}
                </span>
              </div>
            </div>

            <span
              className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md border whitespace-nowrap ${
                ach.isUnlocked
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}
            >
              {ach.progressText}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
