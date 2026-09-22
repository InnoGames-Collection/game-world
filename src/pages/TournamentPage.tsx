/**
 * GameON Tele - Official Weekly Tournament Page
 * 
 * Strict Tournament Architecture:
 * - Weekly cycle with real-time countdown timer
 * - 4 Featured Tournament Games (Crazy Color, Fruit Ninja, Helix Jump, Pop Piano)
 * - Admin-configurable game selection engine
 * - Individual game score retention
 * - Overall Tournament Best Score = MAX(score across active tournament games)
 * - Deterministic tie handling (Best Score -> Timestamp)
 * - Top 10 overall tournament rankings with Masked MSISDNs, Ethiopian names, Best Score, and originating game
 * - Separation between Game Scores, Tournament Rankings, and Prize distribution
 * - Conforms to official telebirr / GameON Tele design language (#1688C9, #8BCB3D)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, GameDefinition } from '../types';
import { TournamentService, OverallTournamentEntry } from '../services/tournamentService';
import { catalogGameToDefinition } from '../games/registry';
import { GameCard } from '../components/GameCard';
import { 
  Swords, 
  Clock, 
  Play, 
  Star,
  ShieldCheck
} from 'lucide-react';

interface TournamentPageProps {
  profile: UserProfile;
  onPlayGame: (game: GameDefinition) => void;
}

export const TournamentPage: React.FC<TournamentPageProps> = ({
  profile,
  onPlayGame,
}) => {
  // 1. Live Countdown ticker
  const [ticker, setTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Tournament Summary
  const summary = useMemo(() => {
    return TournamentService.getTournamentSummary(profile);
  }, [profile, ticker]);

  const {
    config,
    participatingGames,
    topEntries,
    currentUserBestScore,
    currentUserBestGame,
    currentUserRank,
    currentUserScores,
    totalParticipants,
    timeRemaining,
  } = summary;

  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 select-none">
      <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto px-3 sm:px-4 pt-3 space-y-4">
        
        {/* =========================================================================
            1. TOURNAMENT CHAMPIONSHIP HERO BANNER
           ========================================================================= */}
        <div className="space-y-2.5">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-slate-900">
            <img 
              src="/images/banners/tournament-top-banner.jpeg" 
              alt="GoPlay Tournament Championship" 
              className="w-full h-auto object-cover block"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/banners/1. tournament top Banner.jpeg';
              }}
            />
            {/* Live Status & Countdown Timer floating badge */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8BCB3D] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>WEEKLY LIVE</span>
              </span>

              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-black shadow-md">
                <Clock className="w-3 h-3 text-amber-300" />
                <span>{timeRemaining.formatted}</span>
              </div>
            </div>
          </div>

          {/* Quick Tournament Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-xs flex items-center justify-between gap-2">
            <div>
              <h1 className="text-base sm:text-lg font-black text-[#17202A] leading-tight">
                {config.title}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                4 featured games • Ranked by your single highest score
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Prize</span>
              <span className="text-sm sm:text-base font-black text-[#8BCB3D]">85,000+ ETB</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. PLAYER'S TOURNAMENT STANDING CARD
           ========================================================================= */}
        <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-[#1688C9] text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                {currentUserBestScore > 0 ? `#${currentUserRank}` : '—'}
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <span>Your</span>
                  {currentUserBestScore > 0 && currentUserRank <= 10 && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[8px] font-black">
                      TOP 10
                    </span>
                  )}
                </div>
                <div className="text-sm font-black text-[#17202A] tracking-wider font-mono">
                  {profile.phoneNumber ? `${profile.phoneNumber.slice(0, 3)}*****${profile.phoneNumber.slice(-3)}` : '091*****890'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase">
                Best Score
              </div>
              <div className="text-lg font-black text-[#1688C9] leading-none mt-0.5">
                {currentUserBestScore.toLocaleString()} <span className="text-xs font-semibold text-slate-500">pts</span>
              </div>
              {currentUserBestGame && (
                <div className="text-[10px] font-extrabold text-[#8BCB3D] mt-0.5">
                  via {currentUserBestGame.gameName}
                </div>
              )}
            </div>
          </div>

          {/* 4 Tournament Games Score Chips */}
          <div className="pt-2 border-t border-sky-200/80">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">
              Your Scores
            </div>
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
              {participatingGames.map((game) => {
                const score = currentUserScores[game.gameId] || 0;
                const isBest = currentUserBestScore > 0 && score === currentUserBestScore;

                return (
                  <div
                    key={game.gameId}
                    className={`p-1.5 sm:p-2 rounded-xl border text-center transition-all min-w-0 ${
                      isBest
                        ? 'bg-amber-100/70 border-amber-300 shadow-xs'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="text-[9px] sm:text-[10px] font-extrabold text-slate-700 truncate" title={game.gameName}>
                      {game.gameName}
                    </div>
                    <div className="text-[11px] sm:text-xs font-black text-[#17202A] mt-0.5 leading-tight">
                      {score.toLocaleString()} <span className="text-[8px] sm:text-[9px] font-medium text-slate-400">pts</span>
                    </div>
                    {isBest ? (
                      <span className="inline-block mt-0.5 px-1 py-0.2 rounded bg-amber-500 text-white text-[7px] sm:text-[8px] font-black uppercase tracking-wider">
                        ★ BEST
                      </span>
                    ) : (
                      <span className="inline-block mt-0.5 text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase truncate max-w-full">
                        {score > 0 ? 'Recorded' : 'Not Played'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. FOUR PARTICIPATING TOURNAMENT GAMES (Smart 2-Column Mobile, 4-Col Web)
           ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#17202A] flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-[#1688C9]" />
                <span>Active Tournament Games ({participatingGames.length})</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Play any or all games to set your highest single score
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
            {participatingGames.map((game) => {
              const gameDef = catalogGameToDefinition(game);
              const userScore = currentUserScores[game.gameId] || 0;
              const isBest = currentUserBestScore > 0 && userScore === currentUserBestScore;

              return (
                <GameCard
                  key={game.gameId}
                  game={gameDef}
                  onPlay={onPlayGame}
                  layout="grid"
                  aspectRatio="4/3"
                  hasActiveAccess={true}
                  tournamentBadge={isBest ? '★ YOUR BEST' : '🏆 TOURNAMENT'}
                  userScore={userScore}
                />
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
