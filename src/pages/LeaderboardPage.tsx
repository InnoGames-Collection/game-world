/**
 * GameON Tele - Official Game-Specific Leaderboard & Rankings Page
 * 
 * Strict Architecture:
 * - Leaderboard PER GAME where leaderboardEnabled === true
 * - Zero generic mixing of scores across disparate games
 * - Game selector pills: [ Candy Blast ] [ World Legends ] [ Helix Jump ] ...
 * - Player rank & score in the selected game
 * - Top 10 players with masked MSISDN (e.g. 091*****123) for telebirr customer privacy
 * - Rewards in GameON coins
 */

import React, { useState, useMemo } from 'react';
import { UserProfile, GameDefinition } from '../types';
import { GameLeaderboardService } from '../services/gameLeaderboardService';
import { GameCatalog } from '../services/gameCatalog';
import { catalogGameToDefinition } from '../games/registry';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  Play, 
  Gamepad2, 
  Crown, 
  Medal,
  ChevronRight 
} from 'lucide-react';

interface LeaderboardPageProps {
  profile: UserProfile;
  games?: GameDefinition[];
  onPlayGame?: (game: GameDefinition) => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  profile,
  onPlayGame,
}) => {
  // 1. Get all games that have leaderboards enabled
  const gamesWithLeaderboard = useMemo(() => {
    return GameLeaderboardService.getGamesWithLeaderboards();
  }, []);

  const [selectedGameId, setSelectedGameId] = useState<string>(
    gamesWithLeaderboard[0]?.gameId || 'candy-blast'
  );

  // 2. Fetch specific leaderboard data for the selected game
  const leaderboardData = useMemo(() => {
    return GameLeaderboardService.getLeaderboardForGame(selectedGameId, profile);
  }, [selectedGameId, profile]);

  if (!leaderboardData) {
    return (
      <div className="min-h-screen bg-white text-[#17202A] p-4 text-center">
        <p className="text-sm text-slate-500">No leaderboard available for this game.</p>
      </div>
    );
  }

  const { game, entries, userRank, userScore, totalParticipants } = leaderboardData;
  const gameDef = catalogGameToDefinition(game);

  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 select-none">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 sm:px-4 pt-3 space-y-4">
        
        {/* =========================================================================
            1. GAME SELECTION HORIZONTAL PILLS
           ========================================================================= */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
            Select Game Leaderboard:
          </div>

          <div 
            className="flex gap-2 overflow-x-auto scrollbar-none pb-1 snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {gamesWithLeaderboard.map((g) => {
              const isSelected = selectedGameId === g.gameId;
              return (
                <button
                  key={g.gameId}
                  onClick={() => setSelectedGameId(g.gameId)}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs shrink-0 snap-start transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-[#1688C9] text-white shadow-xs font-black'
                      : 'bg-slate-100 hover:bg-slate-200 text-[#17202A]'
                  }`}
                >
                  {g.gameName}
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            2. SELECTED GAME HEADER & CURRENT USER RANK CARD
           ========================================================================= */}
        <div className="relative rounded-2xl bg-[#1688C9] text-white p-4 shadow-sm overflow-hidden">
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#8BCB3D] text-white text-[9px] font-black uppercase tracking-wider">
                <Trophy className="w-3 h-3" />
                <span>OFFICIAL GAME RANKINGS</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight truncate">
                {game.gameName} Leaderboard
              </h2>
              <p className="text-[11px] text-blue-100">
                Top players win instant GameON coin rewards & TeleBirr bonuses
              </p>
            </div>

            {onPlayGame && (
              <button
                onClick={() => onPlayGame(gameDef)}
                className="py-2 px-3.5 rounded-xl bg-[#8BCB3D] hover:bg-[#7cb934] text-white font-black text-xs transition-transform active:scale-95 shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </button>
            )}
          </div>
        </div>

        {/* User's Current Standing Card */}
        <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1688C9] text-white flex items-center justify-center font-black text-sm shadow-xs">
              #{userRank}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Your Standing
              </div>
              <div className="text-sm font-black text-[#17202A]">
                {profile.displayName || 'You'} ({profile.phoneNumber ? `${profile.phoneNumber.slice(0, 3)}*****${profile.phoneNumber.slice(-3)}` : '091*****890'})
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-500 uppercase">
              High Score
            </div>
            <div className="text-base font-black text-[#1688C9]">
              {userScore.toLocaleString()} pts
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. TOP 10 PLAYERS TABLE (MASKED MSISDNS FOR PRIVACY)
           ========================================================================= */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Top 10 Players • {game.gameName}
            </h3>
            <span className="text-[10px] font-bold text-slate-500">
              {totalParticipants.toLocaleString()} Competitors
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {entries.map((entry) => {
              const isFirst = entry.rank === 1;
              const isSecond = entry.rank === 2;
              const isThird = entry.rank === 3;
              const isUser = entry.isCurrentUser;

              return (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-3 transition-colors ${
                    isUser
                      ? 'bg-sky-50/80 font-black'
                      : isFirst
                      ? 'bg-amber-50/40'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Rank & Player */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 text-center shrink-0">
                      {isFirst && <Crown className="w-5 h-5 text-amber-500 mx-auto fill-amber-500" />}
                      {isSecond && <Medal className="w-5 h-5 text-slate-400 mx-auto fill-slate-300" />}
                      {isThird && <Medal className="w-5 h-5 text-amber-700 mx-auto fill-amber-600" />}
                      {!isFirst && !isSecond && !isThird && (
                        <span className="text-xs font-black text-slate-500">#{entry.rank}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold truncate ${isUser ? 'text-[#1688C9] font-black' : 'text-[#17202A]'}`}>
                          {entry.playerMasked}
                        </span>
                        {isUser && (
                          <span className="px-1.5 py-0.2 rounded-md bg-[#1688C9] text-white text-[8px] font-black">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {entry.playerName}
                      </div>
                    </div>
                  </div>

                  {/* Score & Reward */}
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-[#17202A]">
                      {entry.score.toLocaleString()} <span className="text-[10px] font-medium text-slate-500">pts</span>
                    </div>
                    {entry.rewardText && (
                      <span className="inline-block px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[9px] font-extrabold mt-0.5">
                        🎁 {entry.rewardText}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
