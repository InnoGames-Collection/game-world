import React, { useMemo } from 'react';
import { ArrowLeft, Trophy, Medal, Crown, Star } from 'lucide-react';
import { PlayerProgress } from '../types';
import { 
  getCandyLeaderboard, 
  getTotalCampaignScore, 
  getTotalStarsEarned 
} from '../levelStorage';

interface CandyLeaderboardProps {
  progress: PlayerProgress;
  playerMsisdn?: string;
  onBack: () => void;
}

export const CandyLeaderboard: React.FC<CandyLeaderboardProps> = ({
  progress,
  playerMsisdn = '251911598830',
  onBack,
}) => {
  const totalScore = getTotalCampaignScore(progress);
  const totalStars = getTotalStarsEarned(progress);
  const currentLevel = progress.unlockedLevel || 1;

  const { list, userRank, userEntry } = useMemo(() => {
    return getCandyLeaderboard(playerMsisdn, totalScore, currentLevel, totalStars);
  }, [playerMsisdn, totalScore, currentLevel, totalStars]);

  return (
    <div
      id="candy-leaderboard-screen"
      className="relative w-full max-w-md mx-auto h-[640px] sm:h-[680px] rounded-3xl overflow-hidden shadow-2xl flex flex-col p-4 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif] border-2 border-pink-500/40 select-none text-white animate-in fade-in"
      style={{
        background: 'radial-gradient(circle at 50% 15%, #3b0764 0%, #1e1035 45%, #0a0614 100%)',
      }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <button
          id="candy-leaderboard-back-btn"
          type="button"
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white/90 border border-white/15 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-300">
            <Trophy className="w-4 h-4 fill-amber-300" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              LEADERBOARD
            </h2>
          </div>
          <span className="text-[10px] text-pink-300 font-bold uppercase tracking-wide">
            CANDY CRUSH CHAMPIONS
          </span>
        </div>

        <div className="min-w-[44px] flex justify-end">
          <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-xs">
            #{userRank}
          </div>
        </div>
      </div>

      {/* TABLE HEADER COLUMNS */}
      <div className="grid grid-cols-12 gap-1 py-2 px-3 text-[10px] font-black uppercase text-pink-300/80 tracking-wider shrink-0 border-b border-white/5 mt-1">
        <span className="col-span-2 text-center">RANK</span>
        <span className="col-span-4">PLAYER</span>
        <span className="col-span-3 text-right">SCORE</span>
        <span className="col-span-3 text-right">LEVEL</span>
      </div>

      {/* SCROLLABLE LEADERBOARD ROWS */}
      <div className="flex-1 overflow-y-auto pr-1 py-1 space-y-1.5 scrollbar-thin">
        {list.map((entry) => {
          const isTop1 = entry.rank === 1;
          const isTop2 = entry.rank === 2;
          const isTop3 = entry.rank === 3;

          let rankBadge = (
            <span className="font-mono font-bold text-xs text-slate-400">
              #{entry.rank}
            </span>
          );

          if (isTop1) {
            rankBadge = (
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 font-black text-xs flex items-center justify-center shadow-md mx-auto">
                <Crown className="w-3.5 h-3.5 fill-current" />
              </div>
            );
          } else if (isTop2) {
            rankBadge = (
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md mx-auto">
                2
              </div>
            );
          } else if (isTop3) {
            rankBadge = (
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-md mx-auto">
                3
              </div>
            );
          }

          return (
            <div
              key={`${entry.msisdnMasked}-${entry.rank}`}
              className={`grid grid-cols-12 gap-1 items-center p-2.5 rounded-xl transition-all ${
                entry.isPlayer
                  ? 'bg-gradient-to-r from-pink-600/40 via-purple-600/40 to-amber-600/30 border-2 border-pink-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                  : 'bg-white/[0.04] border border-white/5 hover:bg-white/[0.08]'
              }`}
            >
              {/* Rank */}
              <div className="col-span-2 flex items-center justify-center">
                {rankBadge}
              </div>

              {/* Masked MSISDN */}
              <div className="col-span-4 flex items-center gap-1.5 min-w-0">
                <span className="font-mono text-xs font-bold tracking-tight text-slate-200 truncate">
                  {entry.msisdnMasked}
                </span>
                {entry.isPlayer && (
                  <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[8px] font-black uppercase tracking-wider shrink-0">
                    YOU
                  </span>
                )}
              </div>

              {/* Score */}
              <div className="col-span-3 text-right">
                <span className="font-mono text-xs font-black text-amber-300">
                  {entry.score.toLocaleString()}
                </span>
              </div>

              {/* Level & Stars */}
              <div className="col-span-3 text-right flex items-center justify-end gap-1">
                <span className="text-xs font-bold text-pink-200 font-mono">
                  Lvl {entry.level}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FIXED "YOUR RANK" BOTTOM CARD */}
      <div
        id="candy-fixed-your-rank"
        className="mt-2 p-3 rounded-2xl bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-amber-500/20 border-2 border-pink-400/80 backdrop-blur-md shadow-xl shrink-0"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-pink-500/30 border border-pink-400 flex flex-col items-center justify-center">
              <span className="text-[8px] font-black uppercase text-pink-200 leading-none">RANK</span>
              <span className="text-sm font-black text-amber-300 font-mono leading-none mt-0.5">
                #{userRank}
              </span>
            </div>

            <div className="text-left">
              <div className="text-[9px] font-black text-pink-300 uppercase tracking-wider">
                YOUR PERFORMANCE
              </div>
              <div className="text-xs font-mono font-bold text-white">
                {userEntry.msisdnMasked}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-black text-amber-300 font-mono">
              {userEntry.score.toLocaleString()} PTS
            </div>
            <div className="text-[10px] text-slate-300 font-bold">
              Level {userEntry.level} • {userEntry.stars} Stars
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
