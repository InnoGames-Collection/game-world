import React from 'react';
import { Trophy, X, Medal, User, Zap } from 'lucide-react';
import { EmojiSortingPlayerProgress, EmojiSortingLeaderboardEntry } from '../types';

interface EmojiSortingLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: EmojiSortingPlayerProgress;
  playerName?: string;
}

export const EmojiSortingLeaderboardModal: React.FC<EmojiSortingLeaderboardModalProps> = ({
  isOpen,
  onClose,
  progress,
  playerName = 'You',
}) => {
  if (!isOpen) return null;

  const currentCumulative = progress.totalCumulativeScore || 0;
  const currentLevel = progress.unlockedLevel || 1;

  // Base leaderboard competitors calibrated to our 40-level scoring system
  const defaultCompetitors: Omit<EmojiSortingLeaderboardEntry, 'rank'>[] = [
    { name: 'Kalkidan T.', avatar: '🥳', totalScore: 33200, level: 40, winRate: '99%' },
    { name: 'Abebe B.', avatar: '🦁', totalScore: 30450, level: 40, winRate: '97%' },
    { name: 'Dawit M.', avatar: '😎', totalScore: 26800, level: 36, winRate: '94%' },
    { name: 'Hanna S.', avatar: '🌟', totalScore: 22400, level: 33, winRate: '91%' },
    { name: 'Yared G.', avatar: '🚀', totalScore: 19100, level: 29, winRate: '88%' },
    { name: 'Selam W.', avatar: '💎', totalScore: 15800, level: 25, winRate: '86%' },
    { name: 'Biniyam K.', avatar: '🔥', totalScore: 12600, level: 20, winRate: '83%' },
    { name: 'Meron F.', avatar: '😍', totalScore: 9750, level: 16, winRate: '81%' },
    { name: 'Tewodros A.', avatar: '🤖', totalScore: 6950, level: 12, winRate: '79%' },
  ];

  const allEntries: EmojiSortingLeaderboardEntry[] = [];
  const playerObj: Omit<EmojiSortingLeaderboardEntry, 'rank'> = {
    name: playerName,
    avatar: '🎮',
    totalScore: currentCumulative,
    level: currentLevel,
    winRate: progress.completedLevels.length > 0 ? '88%' : '--',
    isPlayer: true,
  };

  const combined = [...defaultCompetitors, playerObj];
  combined.sort((a, b) => b.totalScore - a.totalScore);

  combined.forEach((entry, idx) => {
    allEntries.push({
      ...entry,
      rank: idx + 1,
    });
  });

  const playerRank = allEntries.find((e) => e.isPlayer)?.rank || combined.length;

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
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                TOURNAMENT LEADERBOARD
              </h2>
              <p className="text-xs text-slate-500">
                Official Emoji Sorting Ball Cumulative Championship Rankings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border border-purple-100 shadow-xs"
            aria-label="Close Leaderboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Rank Highlight Banner */}
        <div className="p-3.5 rounded-2xl bg-white border border-violet-200 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 font-black font-mono flex items-center justify-center border border-violet-200 shadow-xs">
              #{playerRank}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>{playerName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-sans uppercase font-bold">
                  You
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Level {currentLevel} • {progress.completedLevels.length} Cleared
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-base font-black text-amber-600 font-mono">
              {currentCumulative.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">
              Tournament PTS
            </div>
          </div>
        </div>

        {/* Leaderboard Entries List */}
        <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
          {allEntries.map((entry) => {
            const rankBadgeColor =
              entry.rank === 1
                ? 'bg-amber-400 text-slate-950 font-black'
                : entry.rank === 2
                ? 'bg-slate-200 text-slate-800 font-black'
                : entry.rank === 3
                ? 'bg-amber-100 text-amber-800 font-black border border-amber-200'
                : 'bg-slate-100 text-slate-600 font-bold';

            return (
              <div
                key={entry.rank}
                className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between transition-all ${
                  entry.isPlayer
                    ? 'bg-violet-50/90 border-violet-300 shadow-xs'
                    : 'bg-white/85 border-purple-50 hover:bg-white hover:border-purple-100 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono shadow-2xs ${rankBadgeColor}`}
                  >
                    {entry.rank}
                  </div>

                  <div className="text-xl sm:text-2xl">{entry.avatar}</div>

                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{entry.name}</span>
                      {entry.isPlayer && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-600 text-white font-black uppercase">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Level {entry.level} • Win Rate {entry.winRate}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs sm:text-sm font-black text-amber-700 font-mono">
                    {entry.totalScore.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase font-semibold">
                    PTS
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-slate-500 pt-1">
          Rankings update dynamically in real time upon clearing each stage.
        </div>
      </div>
    </div>
  );
};
