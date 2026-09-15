import React, { useMemo } from 'react';
import { ArrowLeft, Trophy, Crown, Medal } from 'lucide-react';
import { maskMsisdn } from '../utils/msisdn';
import { MotoLeaderboardEntry } from '../types';

interface MotoRaceLeaderboardProps {
  userScore: number;
  userLevel: number;
  userRawMsisdn: string;
  userRankString: string;
  onBack: () => void;
}

// Canonical Moto Race Championship Competitors Seed Data
const SEED_COMPETITORS: { rawMsisdn: string; score: number; level: number }[] = [
  { rawMsisdn: '251911598830', score: 18920, level: 40 }, // #1
  { rawMsisdn: '251912849142', score: 18745, level: 39 }, // #2
  { rawMsisdn: '251913928117', score: 18520, level: 38 }, // #3
  { rawMsisdn: '251914582983', score: 18150, level: 37 }, // #4
  { rawMsisdn: '251915938451', score: 17890, level: 36 }, // #5
  { rawMsisdn: '251916382964', score: 17420, level: 35 }, // #6
  { rawMsisdn: '251917281929', score: 16980, level: 34 }, // #7
  { rawMsisdn: '251918392195', score: 16450, level: 32 }, // #8
  { rawMsisdn: '251919482112', score: 15890, level: 30 }, // #9
  { rawMsisdn: '251910293876', score: 15200, level: 28 }, // #10
];

export const MotoRaceLeaderboard: React.FC<MotoRaceLeaderboardProps> = ({
  userScore,
  userLevel,
  userRawMsisdn,
  userRankString,
  onBack,
}) => {
  // Compile entries incorporating the player's legitimate current tournament score
  const { topEntries, calculatedUserRank } = useMemo(() => {
    const list: { rawMsisdn: string; score: number; level: number; isCurrentUser?: boolean }[] = [
      ...SEED_COMPETITORS,
    ];

    let rank = 2481;

    if (userScore > 0) {
      let inserted = false;
      for (let i = 0; i < list.length; i++) {
        if (userScore >= list[i].score) {
          list.splice(i, 0, {
            rawMsisdn: userRawMsisdn,
            score: userScore,
            level: userLevel,
            isCurrentUser: true,
          });
          rank = i + 1;
          inserted = true;
          break;
        }
      }

      if (!inserted) {
        // Below top 10: compute realistic rank based on score difference to 15,200
        const deficit = 15200 - userScore;
        rank = Math.min(2481, Math.max(11, Math.round(11 + (deficit / 15200) * 2470)));
      }
    }

    const rankedList: MotoLeaderboardEntry[] = list.slice(0, 10).map((item, idx) => ({
      rank: idx + 1,
      rawMsisdn: item.rawMsisdn,
      score: item.score,
      level: item.level,
      isCurrentUser: !!item.isCurrentUser,
    }));

    return {
      topEntries: rankedList,
      calculatedUserRank: `#${rank.toLocaleString()}`,
    };
  }, [userScore, userLevel, userRawMsisdn]);

  const effectiveUserRank = userScore > 0 ? calculatedUserRank : userRankString;
  const userMaskedMsisdn = maskMsisdn(userRawMsisdn);

  return (
    <div
      id="moto-race-leaderboard-screen"
      className="absolute inset-0 z-40 flex flex-col justify-between bg-[#141820] text-white select-none overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 10%, rgba(244, 63, 94, 0.12) 0%, rgba(20, 24, 32, 0.98) 50%, #0d1017 100%)',
      }}
    >
      {/* Top Header */}
      <div
        className="w-full max-w-xl mx-auto px-4 py-3 flex items-center justify-between border-b border-slate-700/60 bg-slate-950/70 backdrop-blur-md flex-shrink-0"
        style={{ paddingTop: 'max(0.6rem, env(safe-area-inset-top, 0.6rem))' }}
      >
        <button
          id="moto-lb-back-btn"
          onClick={onBack}
          className="h-10 px-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700/80 shadow-md transition-all cursor-pointer"
          title="Back to Menu"
          aria-label="Back to Menu"
        >
          <ArrowLeft className="w-4 h-4 text-rose-400 stroke-[2.5]" />
          <span className="text-xs uppercase tracking-wider">Menu</span>
        </button>

        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
            Leaderboard
          </h2>
        </div>

        <div className="w-16 flex justify-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Top 10
          </span>
        </div>
      </div>

      {/* Main Content Area: Table Column Headers & Scrollable Rankings */}
      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col min-h-0 px-3 sm:px-4 py-2 overflow-hidden">
        {/* Table Column Headers */}
        <div className="grid grid-cols-12 px-3 py-2 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-700/60 mb-1 flex-shrink-0">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-5 pl-1">Player</div>
          <div className="col-span-3 text-right pr-2">Score</div>
          <div className="col-span-2 text-center">Level</div>
        </div>

        {/* Scrollable Ranking Rows */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar pb-2">
          {topEntries.map((entry) => {
            const isTop1 = entry.rank === 1;
            const isTop2 = entry.rank === 2;
            const isTop3 = entry.rank === 3;
            const isCurrentUser = entry.isCurrentUser;
            const maskedPhone = maskMsisdn(entry.rawMsisdn);

            return (
              <div
                key={entry.rank}
                className={`grid grid-cols-12 items-center px-3 py-2.5 rounded-xl transition-all ${
                  isCurrentUser
                    ? 'bg-rose-600/25 border-2 border-rose-400 shadow-lg shadow-rose-950/60 ring-1 ring-rose-400/40'
                    : isTop1
                    ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/15 border border-amber-400/60 shadow-md shadow-black/40'
                    : isTop2
                    ? 'bg-gradient-to-r from-slate-400/15 via-slate-300/10 to-slate-400/15 border border-slate-300/40 shadow-sm'
                    : isTop3
                    ? 'bg-gradient-to-r from-orange-700/20 via-orange-600/10 to-orange-700/15 border border-orange-600/40 shadow-sm'
                    : 'bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/60'
                }`}
              >
                {/* RANK Column */}
                <div className="col-span-2 flex items-center justify-center">
                  {isTop1 ? (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                      <Crown className="w-3.5 h-3.5 fill-current" />
                    </div>
                  ) : isTop2 ? (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                      <Medal className="w-3.5 h-3.5 fill-current" />
                    </div>
                  ) : isTop3 ? (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                      <Medal className="w-3.5 h-3.5 fill-current" />
                    </div>
                  ) : (
                    <span className="text-xs sm:text-sm font-black font-mono text-slate-400">
                      #{entry.rank}
                    </span>
                  )}
                </div>

                {/* PLAYER Column (Always Masked MSISDN) */}
                <div className="col-span-5 pl-1 flex items-center gap-1.5 min-w-0">
                  <span
                    className={`font-mono font-bold text-xs sm:text-sm tracking-tight truncate ${
                      isCurrentUser
                        ? 'text-rose-200 font-black'
                        : isTop1
                        ? 'text-amber-100 font-extrabold'
                        : 'text-slate-200'
                    }`}
                  >
                    {maskedPhone}
                  </span>
                  {isCurrentUser && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white font-black text-[9px] uppercase tracking-wider flex-shrink-0">
                      You
                    </span>
                  )}
                </div>

                {/* SCORE Column */}
                <div className="col-span-3 text-right pr-2">
                  <span
                    className={`font-mono font-black text-xs sm:text-sm tracking-tight ${
                      isCurrentUser
                        ? 'text-rose-300'
                        : isTop1
                        ? 'text-amber-300'
                        : isTop2
                        ? 'text-slate-200'
                        : isTop3
                        ? 'text-orange-300'
                        : 'text-white'
                    }`}
                  >
                    {entry.score.toLocaleString()}
                  </span>
                </div>

                {/* LEVEL Column */}
                <div className="col-span-2 text-center">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[10px] sm:text-xs font-mono font-bold text-slate-300">
                    LV {entry.level}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================
          FIXED "YOUR RANK" SECTION AT THE BOTTOM (Strict Specification #6)
         =================================================================== */}
      <div
        id="moto-your-rank-section"
        className="w-full border-t border-slate-700/80 bg-gradient-to-b from-[#1c222e] to-[#0f131a] px-4 py-3 sm:py-3.5 shadow-2xl flex-shrink-0 z-10"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}
      >
        <div className="w-full max-w-xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Your Rank Label & Rank # */}
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
              Your Rank
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-amber-400 tracking-tight leading-tight">
              {effectiveUserRank}
            </span>
          </div>

          {/* Middle: Masked MSISDN & Level */}
          <div className="flex flex-col items-center px-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Player ID
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-mono font-black text-rose-200 tracking-tight">
                {userMaskedMsisdn}
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                LV {userLevel}
              </span>
            </div>
          </div>

          {/* Right: User Score with POINTS */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
              Points
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-white tracking-tight leading-tight">
              {userScore.toLocaleString()}{' '}
              <span className="text-[10px] sm:text-xs text-rose-400 font-bold">PTS</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
