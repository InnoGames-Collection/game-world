import React, { useMemo } from 'react';
import { Trophy, ArrowLeft, Crown, Medal, User, Zap, Star } from 'lucide-react';
import { UserProfile } from '../../../types';
import { GameLeaderboardService } from '../../../services/gameLeaderboardService';
import { LevelProgress } from '../types';

interface BubbleShooterLeaderboardProps {
  progress: LevelProgress;
  profile?: UserProfile;
  onClose: () => void;
}

export const BubbleShooterLeaderboard: React.FC<BubbleShooterLeaderboardProps> = ({
  progress,
  profile,
  onClose,
}) => {
  // Pull real leaderboard data
  const leaderboardData = useMemo(() => {
    // Record current user's cumulative total score into leaderboard service
    if (progress.totalScore > 0) {
      GameLeaderboardService.recordScore(
        'bubble-shooter',
        progress.totalScore,
        profile?.displayName || 'You',
        progress.highestUnlockedLevel
      );
    }
    return GameLeaderboardService.getLeaderboardForGame('bubble-shooter', profile);
  }, [progress.totalScore, progress.highestUnlockedLevel, profile]);

  const userTotalScore = progress.totalScore || 0;
  const userHighestLevel = progress.highestUnlockedLevel || 1;

  return (
    <div
      id="bubble-shooter-leaderboard-view"
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
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Tournament Leaderboard</span>
          </h2>
          <p className="text-[11px] text-cyan-300 font-bold uppercase tracking-widest">
            Ranked by Total Cumulative Score
          </p>
        </div>

        <div className="w-11 h-11" /> {/* Balancer */}
      </header>

      {/* USER STANDING HIGHLIGHT CARD */}
      <section
        aria-label="Your Standing"
        className="relative z-10 my-4 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-indigo-900/40 border border-cyan-400/40 backdrop-blur-md shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-black">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white uppercase">
                {profile?.displayName || 'Your Profile'} (You)
              </div>
              <div className="text-[10px] text-slate-300 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-cyan-300 font-semibold">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  Level {userHighestLevel}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1 text-amber-300 font-semibold">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {(Object.values(progress.completedLevels || {}) as Array<{ stars: number }>).reduce((acc, c) => acc + (c.stars || 0), 0)} Stars
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Score</div>
            <div className="text-lg font-black text-amber-300 font-mono">
              {userTotalScore > 0 ? userTotalScore.toLocaleString() : '0'} PTS
            </div>
          </div>
        </div>
      </section>

      {/* LEADERBOARD TABLE / LIST */}
      <main className="relative z-10 flex-1 flex flex-col">
        {/* TABLE HEADERS */}
        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-white/10">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-5">Player</div>
          <div className="col-span-2 text-center">Level</div>
          <div className="col-span-3 text-right">Total Score</div>
        </div>

        {/* ENTRIES */}
        <div className="flex-1 space-y-1.5 py-2 overflow-y-auto custom-scrollbar pr-1">
          {leaderboardData?.entries && leaderboardData.entries.length > 0 ? (
            leaderboardData.entries.map((entry) => {
              const isTop1 = entry.rank === 1;
              const isTop2 = entry.rank === 2;
              const isTop3 = entry.rank === 3;
              const isUser = entry.isCurrentUser;

              // Derive realistic highest level from entry score
              const estimatedLevel = Math.min(
                40,
                Math.max(1, Math.round(1 + (entry.score / (leaderboardData.entries[0]?.score || 1000)) * 39))
              );

              return (
                <div
                  key={`rank-${entry.rank}-${entry.playerName}`}
                  className={`grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-xl transition-colors border ${
                    isUser
                      ? 'bg-cyan-500/20 border-cyan-400/50 shadow-md'
                      : isTop1
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : isTop2
                      ? 'bg-slate-300/10 border-slate-300/30'
                      : isTop3
                      ? 'bg-amber-700/10 border-amber-700/30'
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                  }`}
                >
                  {/* RANK */}
                  <div className="col-span-2 flex items-center justify-center font-mono font-black text-sm">
                    {isTop1 ? (
                      <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ) : isTop2 ? (
                      <Medal className="w-5 h-5 text-slate-300" />
                    ) : isTop3 ? (
                      <Medal className="w-5 h-5 text-amber-600" />
                    ) : (
                      <span className="text-slate-400">#{entry.rank}</span>
                    )}
                  </div>

                  {/* PLAYER */}
                  <div className="col-span-5 min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span>{entry.playerName}</span>
                      {isUser && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-300 text-[9px] font-black uppercase">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {entry.playerMasked}
                    </div>
                  </div>

                  {/* HIGHEST LEVEL */}
                  <div className="col-span-2 text-center text-xs font-black text-cyan-300">
                    Lvl {isUser ? userHighestLevel : estimatedLevel}
                  </div>

                  {/* TOTAL SCORE */}
                  <div className="col-span-3 text-right font-mono font-black text-xs text-amber-300">
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs font-medium">
              No tournament scores recorded yet. Complete levels to rank up!
            </div>
          )}
        </div>
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
