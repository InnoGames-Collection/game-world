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
import { TournamentService } from '../services/tournamentService';
import { catalogGameToDefinition } from '../games/registry';
import { 
  Trophy, 
  Play, 
  Crown, 
  Medal,
  Swords
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
  // 1. Exactly 5 leaderboard sections:
  // 1. Crazy Color
  // 2. Fruit Ninja
  // 3. Helix Jump
  // 4. Pop Piano
  // 5. Overall Best
  const tournamentGames = useMemo(() => {
    return TournamentService.getActiveTournamentGames();
  }, []);

  const [selectedTab, setSelectedTab] = useState<string>('overall-best');

  // Individual game leaderboard data if a game is selected
  const isOverall = selectedTab === 'overall-best';
  const activeGame = useMemo(() => {
    return tournamentGames.find((g) => g.gameId === selectedTab) || tournamentGames[0];
  }, [tournamentGames, selectedTab]);

  const individualLeaderboardData = useMemo(() => {
    if (isOverall) return null;
    return GameLeaderboardService.getLeaderboardForGame(activeGame.gameId, profile);
  }, [isOverall, activeGame.gameId, profile]);

  // Overall Best leaderboard data
  const overallSummary = useMemo(() => {
    return TournamentService.getTournamentSummary(profile);
  }, [profile]);

  const maskedUserMsisdn = profile.phoneNumber 
    ? `${profile.phoneNumber.slice(0, 3)}*****${profile.phoneNumber.slice(-3)}` 
    : '091*****890';

  const GAME_THEMES: Record<string, { tabSelected: string; tabUnselected: string; cardGradient: string }> = {
    'crazy-colors': {
      tabSelected: 'bg-fuchsia-600 text-white shadow-xs font-black ring-2 ring-fuchsia-400/30',
      tabUnselected: 'bg-fuchsia-50/80 hover:bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-200/60 font-extrabold',
      cardGradient: 'bg-gradient-to-r from-fuchsia-600 to-pink-600',
    },
    'fruit-slice': {
      tabSelected: 'bg-emerald-600 text-white shadow-xs font-black ring-2 ring-emerald-400/30',
      tabUnselected: 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/60 font-extrabold',
      cardGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    },
    'helix-jump': {
      tabSelected: 'bg-sky-600 text-white shadow-xs font-black ring-2 ring-sky-400/30',
      tabUnselected: 'bg-sky-50/80 hover:bg-sky-100 text-sky-900 border border-sky-200/60 font-extrabold',
      cardGradient: 'bg-gradient-to-r from-sky-600 to-cyan-600',
    },
    'pop-piano': {
      tabSelected: 'bg-indigo-600 text-white shadow-xs font-black ring-2 ring-indigo-400/30',
      tabUnselected: 'bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/60 font-extrabold',
      cardGradient: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    },
    'overall-best': {
      tabSelected: 'bg-amber-500 text-white shadow-xs font-black ring-2 ring-amber-400/40',
      tabUnselected: 'bg-amber-100/80 hover:bg-amber-200/80 text-amber-950 font-black border border-amber-300/60',
      cardGradient: 'bg-gradient-to-r from-amber-500 to-amber-600',
    },
  };

  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 select-none">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 sm:px-4 pt-3 space-y-4">
        
        {/* =========================================================================
            1. FIVE LEADERBOARD SELECTION PILLS
               1. Crazy Color  2. Fruit Ninja  3. Helix Jump  4. Pop Piano  5. Overall Best
           ========================================================================= */}
        <div className="space-y-1.5">
          <div 
            className="flex gap-2 overflow-x-auto scrollbar-none pb-1 snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* First 4: Individual Tournament Games */}
            {tournamentGames.map((g) => {
              const isSelected = selectedTab === g.gameId;
              const theme = GAME_THEMES[g.gameId] || GAME_THEMES['helix-jump'];
              return (
                <button
                  key={g.gameId}
                  onClick={() => setSelectedTab(g.gameId)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs shrink-0 snap-start transition-all cursor-pointer active:scale-95 ${
                    isSelected ? theme.tabSelected : theme.tabUnselected
                  }`}
                >
                  {g.gameName}
                </button>
              );
            })}

            {/* Fifth: Overall Best */}
            <button
              onClick={() => setSelectedTab('overall-best')}
              className={`px-3.5 py-1.5 rounded-xl text-xs shrink-0 snap-start transition-all cursor-pointer active:scale-95 flex items-center gap-1 ${
                selectedTab === 'overall-best'
                  ? GAME_THEMES['overall-best'].tabSelected
                  : GAME_THEMES['overall-best'].tabUnselected
              }`}
            >
              <span>★ Overall Best</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. LEADERBOARD CONTENT VIEW
           ========================================================================= */}
        {isOverall ? (
          /* =========================================================================
              VIEW A: OVERALL BEST LEADERBOARD (Top 10 ranked by highest single score)
             ========================================================================= */
          <div className="space-y-4">
            {/* Header Card */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 shadow-sm">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/20 text-white text-[9px] font-black uppercase tracking-wider">
                  <Trophy className="w-3 h-3" />
                  <span>WEEKLY TOURNAMENT SUMMARY</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                  Overall Best Leaderboard
                </h2>
                <p className="text-[11px] text-amber-100">
                  Ranked by each player's highest single score across Crazy Color, Fruit Ninja, Helix Jump, or Pop Piano.
                </p>
              </div>
            </div>

            {/* Current User Standing Card */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  {overallSummary.currentUserBestScore > 0 ? `#${overallSummary.currentUserRank}` : '—'}
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                    Your Overall Best
                  </div>
                  <div className="text-sm font-black text-[#17202A] font-mono tracking-wider">
                    {maskedUserMsisdn}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold text-amber-800 uppercase">
                  Best Score
                </div>
                <div className="text-base font-black text-amber-600">
                  {overallSummary.currentUserBestScore.toLocaleString()} pts
                </div>
                {overallSummary.currentUserBestGame && (
                  <div className="text-[10px] font-extrabold text-[#8BCB3D]">
                    via {overallSummary.currentUserBestGame.gameName}
                  </div>
                )}
              </div>
            </div>

            {/* Overall Best Top 10 Table: Rank | Player | Best Score | Game */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Overall Best • Top 10
                </h3>
                <span className="text-[10px] font-bold text-slate-500">
                  {overallSummary.totalParticipants.toLocaleString()} Players
                </span>
              </div>

              {/* Table Column Headers */}
              <div className="grid grid-cols-12 gap-1 px-3.5 py-2 bg-slate-100/70 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <div className="col-span-2 text-center">Rank</div>
                <div className="col-span-4">Player</div>
                <div className="col-span-3 text-right">Best Score</div>
                <div className="col-span-3 text-right">Game</div>
              </div>

              <div className="divide-y divide-slate-100">
                {overallSummary.topEntries.slice(0, 10).map((entry) => {
                  const isFirst = entry.rank === 1;
                  const isSecond = entry.rank === 2;
                  const isThird = entry.rank === 3;
                  const isUser = entry.isCurrentUser;

                  return (
                    <div
                      key={entry.rank}
                      className={`grid grid-cols-12 gap-1 px-3.5 py-3 items-center transition-colors ${
                        isUser
                          ? 'bg-amber-50 font-black border-l-4 border-l-amber-500'
                          : isFirst
                          ? 'bg-amber-50/40'
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Rank */}
                      <div className="col-span-2 text-center flex items-center justify-center">
                        {isFirst && <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />}
                        {isSecond && <Medal className="w-5 h-5 text-slate-400 fill-slate-300" />}
                        {isThird && <Medal className="w-5 h-5 text-amber-700 fill-amber-600" />}
                        {!isFirst && !isSecond && !isThird && (
                          <span className="text-xs font-black text-slate-500">#{entry.rank}</span>
                        )}
                      </div>

                      {/* Player: Masked MSISDN ONLY */}
                      <div className="col-span-4 min-w-0 pr-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-mono font-bold truncate ${isUser ? 'text-amber-700 font-black' : 'text-[#17202A]'}`}>
                            {entry.playerMasked}
                          </span>
                          {isUser && (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-white text-[8px] font-black shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Best Score */}
                      <div className="col-span-3 text-right">
                        <div className="text-xs font-black text-[#17202A]">
                          {entry.bestScore.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium">pts</div>
                      </div>

                      {/* Game */}
                      <div className="col-span-3 text-right truncate">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[#17202A] text-[10px] font-extrabold truncate max-w-full">
                          {entry.bestGameTitle}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
              VIEW B: INDIVIDUAL GAME LEADERBOARD (Crazy Color, Fruit Ninja, Helix Jump, Pop Piano)
             ========================================================================= */
          individualLeaderboardData && (
            <div className="space-y-4">
              {/* Selected Game Header & Current User Rank Card */}
              <div className={`relative rounded-2xl ${GAME_THEMES[individualLeaderboardData.game.gameId]?.cardGradient || 'bg-[#1688C9]'} text-white p-4 shadow-sm overflow-hidden`}>
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#8BCB3D] text-white text-[9px] font-black uppercase tracking-wider">
                      <Trophy className="w-3 h-3" />
                      <span>TOURNAMENT GAME RANKINGS</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white leading-tight truncate">
                      {individualLeaderboardData.game.gameName} Leaderboard
                    </h2>
                    <p className="text-[11px] text-blue-100">
                      Top 10 single scores recorded in {individualLeaderboardData.game.gameName}.
                    </p>
                  </div>

                  {onPlayGame && (
                    <button
                      onClick={() => onPlayGame(catalogGameToDefinition(individualLeaderboardData.game))}
                      className="py-2 px-3.5 rounded-xl bg-[#8BCB3D] hover:bg-[#7cb934] text-white font-black text-xs transition-transform active:scale-95 shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play</span>
                    </button>
                  )}
                </div>
              </div>

              {/* User's Standing Card */}
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1688C9] text-white flex items-center justify-center font-black text-sm shadow-xs">
                    #{individualLeaderboardData.userRank}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Your Standing in {individualLeaderboardData.game.gameName}
                    </div>
                    <div className="text-sm font-black text-[#17202A] font-mono tracking-wider">
                      {maskedUserMsisdn}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    High Score
                  </div>
                  <div className="text-base font-black text-[#1688C9]">
                    {individualLeaderboardData.userScore.toLocaleString()} pts
                  </div>
                </div>
              </div>

              {/* Top 10 Players Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Top 10 Players • {individualLeaderboardData.game.gameName}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500">
                    {individualLeaderboardData.totalParticipants.toLocaleString()} Competitors
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {individualLeaderboardData.entries.slice(0, 10).map((entry) => {
                    const isFirst = entry.rank === 1;
                    const isSecond = entry.rank === 2;
                    const isThird = entry.rank === 3;
                    const isUser = entry.isCurrentUser;

                    return (
                      <div
                        key={entry.rank}
                        className={`flex items-center justify-between p-3 transition-colors ${
                          isUser
                            ? 'bg-sky-50/80 font-black border-l-4 border-l-[#1688C9]'
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
                              <span className={`text-xs font-mono font-bold truncate ${isUser ? 'text-[#1688C9] font-black' : 'text-[#17202A]'}`}>
                                {entry.playerMasked}
                              </span>
                              {isUser && (
                                <span className="px-1.5 py-0.2 rounded-md bg-[#1688C9] text-white text-[8px] font-black">
                                  YOU
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-[#17202A]">
                            {entry.score.toLocaleString()} <span className="text-[10px] font-medium text-slate-500">pts</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        )}

      </div>
    </div>
  );
};

