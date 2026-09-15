import React, { useState, useMemo } from 'react';
import { Trophy, Medal, Award, Star, X, Users, ArrowLeft } from 'lucide-react';
import { GameConfig } from './types';
import { GameLeaderboardService } from '../../services/gameLeaderboardService';
import { UserProfile } from '../../types';

interface GameLeaderboardModalProps {
  gameConfig: GameConfig;
  profile?: UserProfile;
  onClose: () => void;
}

export const GameLeaderboardModal: React.FC<GameLeaderboardModalProps> = ({
  gameConfig,
  profile,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL_TIME' | 'TODAY'>('ALL_TIME');

  const leaderboardData = useMemo(() => {
    return GameLeaderboardService.getLeaderboardForGame(gameConfig.gameId, profile);
  }, [gameConfig.gameId, profile]);

  const entries = leaderboardData?.entries || [];
  const userRank = leaderboardData?.userRank || 84;
  const userScore = leaderboardData?.userScore || 0;
  const isUserInTopList = entries.some((e) => e.isCurrentUser);

  return (
    <div
      id="game-leaderboard-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-white/15 shadow-2xl text-white overflow-hidden">
        {/* Header with Back/Close */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-400">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-black tracking-widest uppercase">LEADERBOARD</span>
            </div>
            <h3 className="text-base font-black text-white">{gameConfig.title}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white border border-white/15 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pt-3 pb-2 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('ALL_TIME')}
            className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border ${
              activeTab === 'ALL_TIME'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            All-Time Champions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TODAY')}
            className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border ${
              activeTab === 'TODAY'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            Daily Tournament
          </button>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar">
          {entries.map((entry) => {
            const isTop3 = entry.rank <= 3;
            const rankBadge =
              entry.rank === 1 ? (
                <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
                  🥇
                </div>
              ) : entry.rank === 2 ? (
                <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
                  🥈
                </div>
              ) : entry.rank === 3 ? (
                <div className="w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center font-black text-xs shadow-md">
                  🥉
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-white/10 text-slate-300 flex items-center justify-center font-bold text-xs">
                  {entry.rank}
                </div>
              );

            return (
              <div
                key={entry.rank + entry.playerName}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  entry.isCurrentUser
                    ? 'bg-amber-500/15 border-amber-400/50 shadow-lg shadow-amber-500/10'
                    : isTop3
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {rankBadge}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">
                        {entry.isCurrentUser ? 'You (Current Player)' : entry.playerName}
                      </span>
                      {entry.isCurrentUser && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{entry.playerMasked}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-amber-300 font-mono">
                    {entry.score.toLocaleString()} <span className="text-[10px] text-slate-300">{gameConfig.scoreLabel}</span>
                  </div>
                  {entry.rewardText && (
                    <span className="text-[10px] font-semibold text-emerald-400">
                      🏆 {entry.rewardText}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky User Position if outside top list or summary */}
        <div className="p-4 bg-slate-950 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-xs">
              #{userRank}
            </div>
            <div>
              <div className="text-xs font-bold text-white">Your Best Ranking</div>
              <div className="text-[11px] text-slate-400">
                {userScore > 0 ? `${userScore.toLocaleString()} ${gameConfig.scoreLabel}` : 'Play to set your first score!'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold uppercase tracking-wider text-white border border-white/15 transition-all cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
