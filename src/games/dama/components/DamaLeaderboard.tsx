import React, { useMemo } from 'react';
import {
  Trophy,
  ArrowLeft,
  User,
  Crown,
  CheckCircle2,
  Flame,
  Shield,
} from 'lucide-react';
import { UserProfile } from '../../../types';
import { GameLeaderboardService } from '../../../services/gameLeaderboardService';
import { DamaProgress, DamaLevelSaveData } from '../types';

interface DamaLeaderboardProps {
  progress: DamaProgress;
  profile?: UserProfile;
  onBack: () => void;
}

export const DamaLeaderboard: React.FC<DamaLeaderboardProps> = ({
  progress,
  profile,
  onBack,
}) => {
  const completedCount = (Object.values(progress.completedLevels) as DamaLevelSaveData[]).filter((l) => l.wins > 0).length;
  const totalGames = progress.stats.wins + progress.stats.losses;
  const winRate = totalGames > 0 ? Math.round((progress.stats.wins / totalGames) * 100) : 0;

  // Real leaderboard integration
  const leaderboardResult = useMemo(() => {
    if (progress.totalScore > 0) {
      GameLeaderboardService.recordScore(
        'dama',
        progress.totalScore,
        profile?.displayName || 'You',
        progress.highestUnlockedLevel
      );
    }
    return GameLeaderboardService.getLeaderboardForGame('dama', profile);
  }, [progress.totalScore, progress.highestUnlockedLevel, profile]);

  return (
    <div
      id="dama-leaderboard-container"
      className="w-full max-w-xl mx-auto flex flex-col h-screen px-3 py-4 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          id="dama-leaderboard-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Menu</span>
        </button>

        <div className="flex flex-col items-center text-center">
          <span className="text-sm font-black text-white tracking-wide uppercase flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Tournament Leaderboard</span>
          </span>
          <span className="text-[10px] text-amber-400/90 font-mono font-bold">
            Ranked by Cumulative Score
          </span>
        </div>

        <div className="w-12" />
      </div>

      {/* User's Verified Performance Summary */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/30 rounded-2xl p-3 my-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white">
                  {profile?.displayName || 'You (Current Player)'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-[9px] font-bold">
                  Rank #{leaderboardResult.userRank || 1}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Highest Level: <strong className="text-slate-200">Level {progress.highestUnlockedLevel}</strong> •{' '}
                {completedCount} Cleared
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Score</span>
            <span className="text-lg font-black text-amber-400 font-mono">
              {progress.totalScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Mini stats bar */}
        <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-center text-[10px]">
          <div>
            <span className="text-slate-500 block">Wins</span>
            <span className="font-bold text-emerald-400 font-mono">{progress.stats.wins}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Win Rate</span>
            <span className="font-bold text-cyan-400 font-mono">{winRate}%</span>
          </div>
          <div>
            <span className="text-slate-500 block">Best Level</span>
            <span className="font-bold text-amber-300 font-mono">{progress.stats.bestLevelScore || 0}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Streak</span>
            <span className="font-bold text-amber-400 font-mono flex items-center justify-center gap-0.5">
              <Flame className="w-3 h-3 fill-current text-amber-400" />
              {progress.stats.bestWinStreak}
            </span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
        <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Rank & Player</span>
          <span>Competitive Score</span>
        </div>

        {leaderboardResult.entries.map((entry) => {
          const isUser = entry.isCurrentUser;
          const isTop3 = entry.rank <= 3;

          return (
            <div
              key={entry.rank}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all ${
                isUser
                  ? 'bg-amber-950/40 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-slate-900/70 border-slate-800 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                    entry.rank === 1
                      ? 'bg-amber-400 text-stone-950 shadow-sm'
                      : entry.rank === 2
                      ? 'bg-slate-300 text-stone-950'
                      : entry.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {entry.rank}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold ${
                        isUser ? 'text-amber-300 font-extrabold' : 'text-slate-200'
                      }`}
                    >
                      {entry.playerName}
                    </span>
                    {isUser && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {entry.playerMasked}
                  </span>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-sm font-black text-amber-400">
                  {entry.score.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">PTS</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 text-center text-[10px] text-slate-500">
        Anti-Score Farming Active • Replaying levels only updates score if a higher personal best is achieved
      </div>
    </div>
  );
};
