import React from 'react';
import { Trophy, X, Medal, User, Zap } from 'lucide-react';
import { SortingPlayerProgress, SortingLeaderboardEntry } from '../types';

interface SortingLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: SortingPlayerProgress;
  playerName?: string;
}

export const SortingLeaderboardModal: React.FC<SortingLeaderboardModalProps> = ({
  isOpen,
  onClose,
  progress,
  playerName = 'You',
}) => {
  if (!isOpen) return null;

  const currentCumulative = progress.totalCumulativeScore || 0;
  const currentLevel = progress.unlockedLevel || 1;

  // Base leaderboard competitors calibrated to our 40-level scoring system
  const defaultCompetitors: Omit<SortingLeaderboardEntry, 'rank'>[] = [
    { name: 'Abebe B.', avatar: '🦁', totalScore: 32450, level: 40, winRate: '98%' },
    { name: 'Kalkidan T.', avatar: '⚡', totalScore: 28900, level: 38, winRate: '95%' },
    { name: 'Dawit M.', avatar: '👑', totalScore: 25400, level: 35, winRate: '92%' },
    { name: 'Hanna S.', avatar: '🌟', totalScore: 21850, level: 32, winRate: '89%' },
    { name: 'Yared G.', avatar: '🦅', totalScore: 18600, level: 28, winRate: '87%' },
    { name: 'Selam W.', avatar: '💎', totalScore: 15300, level: 24, winRate: '85%' },
    { name: 'Biniyam K.', avatar: '🔥', totalScore: 12200, level: 19, winRate: '82%' },
    { name: 'Meron F.', avatar: '🎯', totalScore: 9450, level: 15, winRate: '80%' },
    { name: 'Tewodros A.', avatar: '⚔️', totalScore: 6800, level: 11, winRate: '78%' },
  ];

  // Insert current player dynamically based on score
  const allEntries: SortingLeaderboardEntry[] = [];
  let playerInserted = false;

  const playerObj: Omit<SortingLeaderboardEntry, 'rank'> = {
    name: playerName,
    avatar: '🎮',
    totalScore: currentCumulative,
    level: currentLevel,
    winRate: progress.completedLevels.length > 0 ? '88%' : '--',
    isPlayer: true,
  };

  const combined = [...defaultCompetitors];
  combined.push(playerObj);
  combined.sort((a, b) => b.totalScore - a.totalScore);

  combined.forEach((entry, idx) => {
    allEntries.push({
      ...entry,
      rank: idx + 1,
    });
  });

  const playerRank = allEntries.find((e) => e.isPlayer)?.rank || combined.length;

  return (
    <div className="fixed inset-0 z-50 bg-[#070b16]/95 backdrop-blur-md flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-lg mx-auto space-y-4 pb-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                TOURNAMENT LEADERBOARD
              </h2>
              <p className="text-xs text-slate-400">
                Official Sorting Ball Cumulative Championship Rankings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            aria-label="Close Leaderboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Rank Highlight Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/30 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 font-black font-mono flex items-center justify-center border border-cyan-400/40">
              #{playerRank}
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{playerName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-sans uppercase">
                  You
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Level {currentLevel} • {progress.completedLevels.length} Completed
              </div>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-xs text-slate-400 font-sans uppercase tracking-wider">
              Total Score
            </div>
            <div className="text-base font-black text-amber-300">
              {currentCumulative.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Leaderboard Table List */}
        <div className="space-y-1.5">
          {allEntries.slice(0, 10).map((entry) => {
            const isTop3 = entry.rank <= 3;
            const rankBadgeColor =
              entry.rank === 1
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                : entry.rank === 2
                ? 'bg-slate-300/20 text-slate-200 border-slate-300/40'
                : entry.rank === 3
                ? 'bg-amber-700/20 text-amber-400 border-amber-600/40'
                : 'bg-white/5 text-slate-400 border-white/10';

            return (
              <div
                key={`${entry.rank}-${entry.name}`}
                className={`p-3 rounded-xl flex items-center justify-between transition-all ${
                  entry.isPlayer
                    ? 'bg-cyan-500/15 border-2 border-cyan-400/50 shadow-md scale-[1.01]'
                    : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-black font-mono ${rankBadgeColor}`}
                  >
                    {isTop3 ? (
                      <Medal className="w-3.5 h-3.5" />
                    ) : (
                      entry.rank
                    )}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-2">
                    <span className="text-base">{entry.avatar}</span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>{entry.name}</span>
                        {entry.isPlayer && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500 text-black font-black uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Level {entry.level}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right font-mono">
                  <div className="text-xs font-black text-amber-300">
                    {entry.totalScore.toLocaleString()} PTS
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Win Rate: {entry.winRate}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
