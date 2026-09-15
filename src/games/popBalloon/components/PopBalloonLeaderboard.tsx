import React, { useState, useMemo } from 'react';
import { ArrowLeft, Trophy, ShieldCheck, Flame, Medal, Award, User, RefreshCw } from 'lucide-react';
import { PopBalloonProgress } from '../types';
import { getTournamentLeaderboard, formatMsisdnMasked, calculateGlobalRank } from '../storage';
import { UserProfile } from '../../../types';

interface PopBalloonLeaderboardProps {
  progress: PopBalloonProgress;
  profile?: UserProfile;
  onBack: () => void;
}

export const PopBalloonLeaderboard: React.FC<PopBalloonLeaderboardProps> = ({
  progress,
  profile,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'tournament' | 'global' | 'weekly' | 'my_rank'>('tournament');

  const playerMsisdn = profile?.phoneNumber || '251911598830';
  const maskedPhone = formatMsisdnMasked(playerMsisdn);
  const userRank = calculateGlobalRank(progress.totalTournamentScore);

  const entries = useMemo(() => {
    return getTournamentLeaderboard(
      playerMsisdn,
      progress.totalTournamentScore,
      progress.unlockedLevel
    );
  }, [playerMsisdn, progress.totalTournamentScore, progress.unlockedLevel]);

  return (
    <div
      id="pop-balloon-leaderboard-view"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-5 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#070D1E] via-[#0D183A] to-[#070D1E] text-white overflow-y-auto custom-scrollbar"
    >
      {/* 1. HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-[#070D1E]/95 backdrop-blur-md z-20 shrink-0">
        <button
          id="pop-balloon-leaderboard-back-btn"
          type="button"
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-md"
          title="Back to Menu"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Tournament Leaderboard</span>
          </h2>
          <p className="text-[11px] text-blue-300 font-bold uppercase tracking-widest">
            Ranked by Cumulative Tournament Score
          </p>
        </div>

        <div className="w-11" />
      </div>

      {/* 2. TAB CONTROLS */}
      <div className="grid grid-cols-4 gap-1.5 my-3 shrink-0">
        {[
          { id: 'tournament', label: 'Tournament' },
          { id: 'global', label: 'Global' },
          { id: 'weekly', label: 'Weekly' },
          { id: 'my_rank', label: 'My Rank' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`min-h-[38px] py-1.5 px-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer border ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. STICKY USER STANDING HERO CARD */}
      <div
        id="pop-balloon-user-standing-card"
        className="mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-blue-500/20 to-indigo-500/20 border border-amber-400/40 shadow-xl shrink-0"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-black text-base font-mono">
              #{userRank.toLocaleString()}
            </div>
            <div>
              <div className="text-sm font-black text-white flex items-center gap-1.5">
                <span className="font-mono">{maskedPhone}</span>
                <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-bold uppercase border border-blue-400/30">
                  You
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-medium">
                Level {progress.unlockedLevel} • {Object.keys(progress.levelBestScores).length} of 40 Completed
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg sm:text-xl font-black text-amber-300 font-mono">
              {progress.totalTournamentScore.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Cumulative Score
            </div>
          </div>
        </div>
      </div>

      {/* 4. LEADERBOARD LIST */}
      <div className="flex flex-col gap-2 pb-4 flex-1">
        {entries.map((entry) => {
          const isTop1 = entry.rank === 1;
          const isTop2 = entry.rank === 2;
          const isTop3 = entry.rank === 3;

          return (
            <div
              key={`${entry.msisdnMasked}-${entry.rank}`}
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                entry.isPlayer
                  ? 'bg-blue-900/40 border-blue-400 shadow-md ring-1 ring-blue-400/30'
                  : isTop1
                  ? 'bg-gradient-to-r from-amber-950/40 to-[#0F1B38] border-amber-500/50 shadow-md'
                  : isTop2
                  ? 'bg-gradient-to-r from-slate-900/60 to-[#0F1B38] border-slate-400/40'
                  : isTop3
                  ? 'bg-gradient-to-r from-amber-950/20 to-[#0F1B38] border-amber-700/40'
                  : 'bg-white/5 border-white/5'
              }`}
            >
              {/* Rank & Player Info */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs font-mono shrink-0 ${
                    isTop1
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : isTop2
                      ? 'bg-slate-300 text-slate-950 shadow-xs'
                      : isTop3
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : entry.rank}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-white font-mono">
                      {entry.msisdnMasked}
                    </span>
                    {entry.isPlayer && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/30 text-blue-300 font-bold uppercase">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Stage {entry.level} • {entry.badge}
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-sm sm:text-base font-black text-amber-300 font-mono">
                  {entry.score.toLocaleString()}
                </div>
                <div className="text-[9px] text-slate-400 font-bold uppercase">
                  PTS
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
