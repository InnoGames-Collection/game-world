/**
 * Emoji Fun — Tournament Leaderboard Modal
 * Shows full ranking, skill metrics, and points gap to next competitor
 */

import React from 'react';
import { TournamentLeaderboardEntry } from '../types';
import { Trophy, X, Flame, Target, Award, ArrowUpRight } from 'lucide-react';
import { emojiAudio } from '../emojiAudio';

interface EmojiFunLeaderboardModalProps {
  entries: TournamentLeaderboardEntry[];
  userRank: number;
  userScore: number;
  nextPlayerScore: number | null;
  pointsToNextRank: number;
  onClose: () => void;
}

export const EmojiFunLeaderboardModal: React.FC<EmojiFunLeaderboardModalProps> = ({
  entries,
  userRank,
  userScore,
  nextPlayerScore,
  pointsToNextRank,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md max-h-[90vh] rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl border-4 border-purple-300 text-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner text-xl">
              🏆
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-['Fredoka',sans-serif] tracking-wider uppercase leading-none">
                EMOJI FUN
              </h2>
              <p className="text-[11px] font-bold text-pink-200 tracking-wider uppercase mt-0.5">
                Official Tournament Leaderboard
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              emojiAudio.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Motivational Rank Gap Card (Section 23) */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 mx-3 mt-3 rounded-2xl text-white shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-100 block">
              YOUR TOURNAMENT STANDING
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black font-['Fredoka',sans-serif]">
                Rank #{userRank}
              </span>
              <span className="text-xs font-bold text-amber-100">
                ({userScore.toLocaleString()} pts)
              </span>
            </div>
          </div>

          {nextPlayerScore !== null && pointsToNextRank > 0 ? (
            <div className="bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-xl text-right">
              <span className="text-[10px] font-bold block text-white/90">NEXT RANK GAP</span>
              <span className="text-xs font-black text-yellow-200">
                Need {pointsToNextRank.toLocaleString()} pts!
              </span>
            </div>
          ) : (
            <div className="bg-white/25 px-3 py-1 rounded-xl text-xs font-black text-yellow-200">
              👑 Tournament Leader!
            </div>
          )}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-1 px-4 py-2 mt-2 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
          <span className="col-span-2 text-center">Rank</span>
          <span className="col-span-4">Player</span>
          <span className="col-span-3 text-right">Score</span>
          <span className="col-span-3 text-right">Combo/Acc</span>
        </div>

        {/* Scrollable Leaderboard List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 divide-y divide-slate-100">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`grid grid-cols-12 gap-1 items-center py-2 px-2 rounded-xl transition-all ${
                entry.isCurrentUser
                  ? 'bg-purple-100/90 font-black border border-purple-300 shadow-sm'
                  : 'hover:bg-slate-50'
              }`}
            >
              {/* Rank Badge */}
              <div className="col-span-2 flex items-center justify-center">
                {entry.rank === 1 ? (
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-xs font-black shadow-sm">
                    🥇
                  </span>
                ) : entry.rank === 2 ? (
                  <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center text-xs font-black shadow-sm">
                    🥈
                  </span>
                ) : entry.rank === 3 ? (
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-black shadow-sm">
                    🥉
                  </span>
                ) : (
                  <span className="text-xs font-extrabold text-slate-500">{entry.rank}</span>
                )}
              </div>

              {/* Player Name & Avatar */}
              <div className="col-span-4 flex items-center gap-1.5 overflow-hidden">
                <span className="text-base">{entry.avatarEmoji}</span>
                <div className="truncate">
                  <span className="text-xs font-bold truncate block text-slate-800">
                    {entry.name}
                  </span>
                  <span className="text-[10px] text-purple-700 font-semibold">
                    Lv {entry.level}
                  </span>
                </div>
              </div>

              {/* Tournament Score */}
              <div className="col-span-3 text-right">
                <span className="text-xs sm:text-sm font-black font-mono text-amber-700 block">
                  {entry.score.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">pts</span>
              </div>

              {/* Combo & Accuracy */}
              <div className="col-span-3 text-right">
                <div className="flex items-center justify-end gap-1 text-[11px] font-extrabold text-orange-600">
                  <Flame className="w-3 h-3 fill-current" />
                  <span>x{entry.bestCombo}</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold">
                  {entry.accuracy}% acc
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Close Button */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <button
            onClick={() => {
              emojiAudio.playTap();
              onClose();
            }}
            className="w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-black text-sm tracking-wider uppercase shadow-md transition-all"
          >
            Close Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};
