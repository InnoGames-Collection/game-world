import React, { useState } from 'react';
import { ArrowLeft, Trophy, Medal, Award, ChevronDown, User, Star, Coins } from 'lucide-react';
import { HillClimbStorage } from '../levelStorage';
import { HILL_CLIMB_LEVELS } from '../levels';
import { UserProfile } from '../../../types';

interface HillClimbLeaderboardProps {
  profile?: UserProfile;
  initialLevel?: number;
  onClose: () => void;
}

export const HillClimbLeaderboard: React.FC<HillClimbLeaderboardProps> = ({
  profile,
  initialLevel = 1,
  onClose,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(initialLevel);

  const leaderboardData = HillClimbStorage.getLevelLeaderboard(selectedLevel, profile);
  const currentLevelConfig =
    HILL_CLIMB_LEVELS.find((l) => l.levelNumber === selectedLevel) || HILL_CLIMB_LEVELS[0];

  return (
    <div
      id="hill-climb-leaderboard-view"
      className="relative w-full h-full min-h-[580px] flex flex-col p-3.5 sm:p-5 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#07172b] via-[#040e1c] to-[#02070e] text-white overflow-y-auto"
    >
      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to Menu"
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Leaderboard</span>
          </h2>
          <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest">
            Level Rankings & High Scores
          </p>
        </div>

        <div className="w-11 h-11" />
      </header>

      {/* LEVEL PICKER DROPDOWN / SELECTOR */}
      <div className="relative z-10 my-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-[#1688C9]/20 border border-[#1688C9]/40 flex items-center justify-center text-cyan-300 font-black text-sm">
            {selectedLevel}
          </div>
          <div>
            <div className="text-xs font-black text-white">
              Level {selectedLevel}: {currentLevelConfig.name}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {currentLevelConfig.tier} • Target: {currentLevelConfig.targetDistance}m
            </div>
          </div>
        </div>

        {/* Level Dropdown Select */}
        <div className="relative w-full sm:w-48">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(Number(e.target.value))}
            className="w-full appearance-none py-2 px-3 pr-8 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer shadow-inner"
          >
            {HILL_CLIMB_LEVELS.map((lvl) => (
              <option key={lvl.levelNumber} value={lvl.levelNumber}>
                Level {lvl.levelNumber} - {lvl.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* USER STANDING BANNER */}
      <div className="relative z-10 mb-3 p-3 rounded-2xl bg-gradient-to-r from-[#1688C9]/20 via-[#8BCB3D]/15 to-transparent border border-[#1688C9]/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-300 font-black font-mono">
            #{leaderboardData.userRank}
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Your Ranking</div>
            <div className="font-bold text-white">
              {leaderboardData.userScore > 0 ? (
                <span className="text-amber-400 font-mono">{leaderboardData.userScore} PTS</span>
              ) : (
                <span className="text-slate-400">Not played yet</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-400 font-medium">
          Top 10 Global Competitors
        </div>
      </div>

      {/* RANKINGS LIST */}
      <div className="relative z-10 flex-1 space-y-2 overflow-y-auto pr-1">
        {leaderboardData.entries.map((entry) => {
          const isTop3 = entry.rank <= 3;
          return (
            <div
              key={`lb-entry-${entry.rank}`}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between ${
                entry.isCurrentUser
                  ? 'bg-gradient-to-r from-amber-500/20 to-slate-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black font-mono text-xs ${
                    entry.rank === 1
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : entry.rank === 2
                      ? 'bg-slate-300 text-slate-950 shadow-md'
                      : entry.rank === 3
                      ? 'bg-amber-700 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {entry.rank}
                </div>

                {/* Player Name and Masked Phone */}
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{entry.playerName}</span>
                    {entry.isCurrentUser && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400/30 text-amber-300 border border-amber-400/40">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{entry.playerMasked}</div>
                </div>
              </div>

              {/* Score & Reward */}
              <div className="text-right">
                <div className="text-sm sm:text-base font-black font-mono text-[#8BCB3D]">
                  {entry.score} <span className="text-[9px] font-sans font-semibold text-slate-400">PTS</span>
                </div>
                {entry.rewardText && (
                  <div className="text-[10px] text-amber-400 font-bold flex items-center justify-end gap-1">
                    <Coins className="w-2.5 h-2.5 fill-amber-400" />
                    <span>{entry.rewardText}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
