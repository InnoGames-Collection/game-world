import React, { useMemo } from 'react';
import { ArrowLeft, Trophy, Crown, Medal } from 'lucide-react';
import { fruitAudio } from '../fruitSliceAudio';
import { maskMsisdn } from '../utils/msisdn';

export interface LeaderboardEntry {
  rank: number;
  rawMsisdn: string;
  score: number;
  isCurrentUser?: boolean;
}

interface FruitNinjaLeaderboardProps {
  userScore: number;
  userRawMsisdn: string;
  userRankString: string;
  onBack: () => void;
}

// Canonical Tournament Competitors Seed Data
const SEED_COMPETITORS: { rawMsisdn: string; score: number }[] = [
  { rawMsisdn: '251911598830', score: 12850 }, // 1    25191*****30    12,850
  { rawMsisdn: '251912849142', score: 12620 }, // 2    25191*****42    12,620
  { rawMsisdn: '251913928117', score: 12410 }, // 3    25191*****17    12,410
  { rawMsisdn: '251914582983', score: 12105 }, // 4    25191*****83    12,105
  { rawMsisdn: '251915938451', score: 11980 }, // 5    25191*****51    11,980
  { rawMsisdn: '251916382964', score: 11720 }, // 6    25191*****64    11,720
  { rawMsisdn: '251917281929', score: 11490 }, // 7    25191*****29    11,490
  { rawMsisdn: '251918392195', score: 11210 }, // 8    25191*****95    11,210
  { rawMsisdn: '251919482112', score: 10950 }, // 9    25191*****12    10,950
  { rawMsisdn: '251910293876', score: 10680 }, // 10   25191*****76    10,680
];

export const FruitNinjaLeaderboard: React.FC<FruitNinjaLeaderboardProps> = ({
  userScore,
  userRawMsisdn,
  userRankString,
  onBack,
}) => {
  const handleBackClick = () => {
    fruitAudio.playButtonClick();
    onBack();
  };

  // Compile entries incorporating the player's legitimate current tournament score
  const { topEntries, isUserInTop10, calculatedUserRank } = useMemo(() => {
    const list: { rawMsisdn: string; score: number; isCurrentUser?: boolean }[] = [
      ...SEED_COMPETITORS,
    ];

    let rank = 2481;
    let inTop10 = false;

    if (userScore > 0) {
      // Find insertion point
      let inserted = false;
      for (let i = 0; i < list.length; i++) {
        if (userScore >= list[i].score) {
          list.splice(i, 0, {
            rawMsisdn: userRawMsisdn,
            score: userScore,
            isCurrentUser: true,
          });
          rank = i + 1;
          inserted = true;
          inTop10 = rank <= 10;
          break;
        }
      }

      if (!inserted) {
        // Below top 10
        // Scaled rank based on distance to 10,680
        const deficit = 10680 - userScore;
        rank = Math.min(2481, Math.max(11, Math.round(11 + (deficit / 10680) * 2470)));
      }
    }

    const rankedList: LeaderboardEntry[] = list.slice(0, 10).map((item, idx) => ({
      rank: idx + 1,
      rawMsisdn: item.rawMsisdn,
      score: item.score,
      isCurrentUser: !!item.isCurrentUser,
    }));

    return {
      topEntries: rankedList,
      isUserInTop10: inTop10,
      calculatedUserRank: `#${rank.toLocaleString()}`,
    };
  }, [userScore, userRawMsisdn]);

  const effectiveUserRank = userScore > 0 ? calculatedUserRank : userRankString;
  const userMaskedMsisdn = maskMsisdn(userRawMsisdn);

  return (
    <div
      id="fruit-ninja-leaderboard-screen"
      className="absolute inset-0 z-40 flex flex-col justify-between bg-[#120803] text-white select-none overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 10%, rgba(234, 88, 12, 0.15) 0%, rgba(26, 12, 4, 0.98) 50%, #0d0502 100%)',
      }}
    >
      {/* Top Header */}
      <div
        className="w-full max-w-xl mx-auto px-4 py-3 flex items-center justify-between border-b border-amber-500/20 bg-stone-950/60 backdrop-blur-md flex-shrink-0"
        style={{ paddingTop: 'max(0.6rem, env(safe-area-inset-top, 0.6rem))' }}
      >
        <button
          id="fruit-ninja-lb-back-btn"
          onClick={handleBackClick}
          className="h-10 px-3 rounded-xl bg-stone-900/90 hover:bg-stone-800 active:scale-95 text-stone-200 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-amber-500/25 shadow-md transition-all cursor-pointer"
          title="Back to Menu"
          aria-label="Back to Menu"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400 stroke-[2.5]" />
          <span className="text-xs uppercase tracking-wider">Menu</span>
        </button>

        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-amber-300">
            Leaderboard
          </h2>
        </div>

        <div className="w-16 flex justify-end">
          <span className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest">
            Top 10
          </span>
        </div>
      </div>

      {/* Main Content Area: Table Header & Scrollable Rankings */}
      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col min-h-0 px-3 sm:px-4 py-2 overflow-hidden">
        {/* Table Column Headers */}
        <div className="grid grid-cols-12 px-3 py-2 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-400/70 border-b border-amber-500/20 mb-1 flex-shrink-0">
          <div className="col-span-2 sm:col-span-2 text-center">Rank</div>
          <div className="col-span-6 sm:col-span-6 pl-2">Player</div>
          <div className="col-span-4 sm:col-span-4 text-right pr-2">Score</div>
        </div>

        {/* Scrollable Ranking Cards */}
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
                    ? 'bg-amber-500/25 border-2 border-amber-400 shadow-lg shadow-amber-600/30 ring-1 ring-amber-400/40'
                    : isTop1
                    ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/15 border border-amber-400/60 shadow-md shadow-black/40'
                    : isTop2
                    ? 'bg-gradient-to-r from-slate-400/15 via-slate-300/10 to-slate-400/15 border border-slate-300/40 shadow-sm'
                    : isTop3
                    ? 'bg-gradient-to-r from-amber-700/20 via-amber-600/10 to-amber-700/15 border border-amber-600/40 shadow-sm'
                    : 'bg-stone-900/60 border border-stone-800/80 hover:bg-stone-900/80'
                }`}
              >
                {/* RANK Column */}
                <div className="col-span-2 sm:col-span-2 flex items-center justify-center">
                  {isTop1 ? (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-400 text-stone-950 font-black text-xs flex items-center justify-center shadow-md gap-0.5">
                      <Crown className="w-3.5 h-3.5 fill-current" />
                    </div>
                  ) : isTop2 ? (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-400 to-slate-200 text-stone-950 font-black text-xs flex items-center justify-center shadow-md">
                      <Medal className="w-3.5 h-3.5 fill-current" />
                    </div>
                  ) : isTop3 ? (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-700 to-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shadow-md">
                      <Medal className="w-3.5 h-3.5 fill-current" />
                    </div>
                  ) : (
                    <span className="text-xs sm:text-sm font-black font-mono text-stone-400">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* PLAYER Column (Always Masked MSISDN) */}
                <div className="col-span-6 sm:col-span-6 pl-2 flex items-center gap-1.5 min-w-0">
                  <span
                    className={`font-mono font-bold text-xs sm:text-sm tracking-tight truncate ${
                      isCurrentUser
                        ? 'text-amber-200 font-black'
                        : isTop1
                        ? 'text-amber-100 font-extrabold'
                        : 'text-stone-300'
                    }`}
                  >
                    {maskedPhone}
                  </span>
                  {isCurrentUser && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black font-black text-[9px] uppercase tracking-wider flex-shrink-0">
                      You
                    </span>
                  )}
                </div>

                {/* SCORE Column */}
                <div className="col-span-4 sm:col-span-4 text-right pr-2">
                  <span
                    className={`font-mono font-black text-xs sm:text-sm tracking-tight ${
                      isCurrentUser
                        ? 'text-amber-300'
                        : isTop1
                        ? 'text-yellow-300'
                        : isTop2
                        ? 'text-slate-200'
                        : isTop3
                        ? 'text-amber-400'
                        : 'text-white'
                    }`}
                  >
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================
          FIXED "YOUR RANK" SECTION AT THE BOTTOM (Strict Specification #9)
         =================================================================== */}
      <div
        id="fruit-ninja-your-rank-section"
        className="w-full border-t border-amber-500/30 bg-gradient-to-b from-[#221107] to-[#120803] px-4 py-3 sm:py-3.5 shadow-2xl flex-shrink-0 z-10"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}
      >
        <div className="w-full max-w-xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Your Rank Label & Rank # */}
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/90">
              Your Rank
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-amber-400 tracking-tight leading-tight">
              {effectiveUserRank}
            </span>
          </div>

          {/* Middle: Masked MSISDN */}
          <div className="flex flex-col items-center px-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
              Player ID
            </span>
            <span className="text-xs sm:text-sm font-mono font-black text-amber-200 tracking-tight">
              {userMaskedMsisdn}
            </span>
          </div>

          {/* Right: User Score with POINTS */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/90">
              Points
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-white tracking-tight leading-tight">
              {userScore.toLocaleString()}{' '}
              <span className="text-[10px] sm:text-xs text-amber-400 font-bold">PTS</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
