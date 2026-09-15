/**
 * Podium Top 3 Champions Visualization Component
 * Renders Rank 1 (Center Gold), Rank 2 (Left Silver), Rank 3 (Right Bronze)
 * with pedestals, crowns, masked MSISDNs, scores, and prize tags.
 */

import React from 'react';
import { LeaderboardEntry } from '../types';
import { Crown, Trophy, Medal, Sparkles, MapPin } from 'lucide-react';

interface PodiumTopThreeProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export const PodiumTopThree: React.FC<PodiumTopThreeProps> = ({
  entries,
  currentUserId,
}) => {
  if (entries.length < 3) return null;

  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  return (
    <div id="competitive-podium" className="relative pt-6 pb-2 px-2">
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto">
        {/* ========================================================================= */}
        {/* RANK 2: SILVER PEDESTAL (LEFT) */}
        {/* ========================================================================= */}
        <div
          id="podium-rank-2"
          className="flex flex-col items-center text-center order-1 group"
        >
          {/* Avatar & Rank Token */}
          <div className="relative mb-2">
            <div
              className={`w-13 h-13 sm:w-15 sm:h-15 rounded-xl p-1 bg-slate-200 border border-slate-300 flex items-center justify-center ${
                second.userId === currentUserId ? 'ring-3 ring-[#78BE20]' : ''
              }`}
            >
              <div className="w-full h-full rounded-lg bg-white flex items-center justify-center text-slate-700 font-black text-base">
                <Medal className="w-6 h-6 text-slate-400" />
              </div>
            </div>
            {/* Rank 2 Badge */}
            <span className="absolute -bottom-1.5 -right-1 w-5 h-5 rounded-full bg-slate-300 text-slate-900 font-black text-[11px] flex items-center justify-center border-2 border-white shadow-sm">
              2
            </span>
          </div>

          {/* Player Info */}
          <div className="w-full px-1 mb-2">
            <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {second.displayName}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {second.phoneNumberMasked}
            </div>
            <div className="text-xs sm:text-sm font-black text-[#0057A8] font-mono mt-0.5">
              {second.score.toLocaleString()} <span className="text-[10px] text-slate-500 font-sans">pts</span>
            </div>
            {second.reward && (
              <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px] font-bold text-slate-700 truncate max-w-full">
                🎁 {second.reward}
              </div>
            )}
          </div>

          {/* Pedestal Step */}
          <div className="w-full h-20 sm:h-24 rounded-t-xl bg-slate-100 border-t-2 border-x border-slate-300 flex flex-col items-center justify-center p-2">
            <div className="text-slate-500 font-black text-lg sm:text-xl font-mono">
              2ND
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5 font-medium">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{second.region}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RANK 1: GOLD PEDESTAL (CENTER - ELEVATED) */}
        {/* ========================================================================= */}
        <div
          id="podium-rank-1"
          className="flex flex-col items-center text-center order-2 -mt-6 group"
        >
          {/* Crown & Avatar */}
          <div className="relative mb-2">
            <div className="absolute -top-5 inset-x-0 flex justify-center">
              <Crown className="w-6 h-6 text-amber-500 fill-amber-500" />
            </div>

            <div
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-xl p-1 bg-amber-100 border-2 border-amber-400 flex items-center justify-center ${
                first.userId === currentUserId ? 'ring-3 ring-[#78BE20]' : ''
              }`}
            >
              <div className="w-full h-full rounded-lg bg-[#0057A8] flex items-center justify-center text-amber-300">
                <Trophy className="w-7 h-7 text-amber-300" />
              </div>
            </div>

            {/* Rank 1 Badge */}
            <span className="absolute -bottom-1.5 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-white shadow-sm">
              1
            </span>
          </div>

          {/* Player Info */}
          <div className="w-full px-1 mb-2">
            <div className="text-sm font-black text-slate-900 truncate flex items-center justify-center gap-1">
              <span>{first.displayName}</span>
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {first.phoneNumberMasked}
            </div>
            <div className="text-sm sm:text-base font-black text-[#0057A8] font-mono mt-0.5">
              {first.score.toLocaleString()} <span className="text-[10px] text-slate-500 font-sans">pts</span>
            </div>
            {first.reward && (
              <div className="mt-1 inline-block px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-[10px] font-extrabold text-amber-800 truncate max-w-full">
                🏆 {first.reward}
              </div>
            )}
          </div>

          {/* Pedestal Step (Tallest) */}
          <div className="w-full h-28 sm:h-32 rounded-t-xl bg-[#0057A8] text-white border-t-2 border-x border-[#004080] flex flex-col items-center justify-center p-2 shadow-md">
            <div className="text-amber-300 font-black text-xl sm:text-2xl font-mono">
              1ST
            </div>
            <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-0.5 mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>{first.region}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RANK 3: BRONZE PEDESTAL (RIGHT) */}
        {/* ========================================================================= */}
        <div
          id="podium-rank-3"
          className="flex flex-col items-center text-center order-3 group"
        >
          {/* Avatar & Rank Token */}
          <div className="relative mb-2">
            <div
              className={`w-13 h-13 sm:w-15 sm:h-15 rounded-xl p-1 bg-amber-100 border border-amber-300 flex items-center justify-center ${
                third.userId === currentUserId ? 'ring-3 ring-[#78BE20]' : ''
              }`}
            >
              <div className="w-full h-full rounded-lg bg-white flex items-center justify-center text-amber-800 font-black text-base">
                <Medal className="w-6 h-6 text-amber-700" />
              </div>
            </div>
            {/* Rank 3 Badge */}
            <span className="absolute -bottom-1.5 -right-1 w-5 h-5 rounded-full bg-amber-700 text-white font-black text-[11px] flex items-center justify-center border-2 border-white shadow-sm">
              3
            </span>
          </div>

          {/* Player Info */}
          <div className="w-full px-1 mb-2">
            <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {third.displayName}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {third.phoneNumberMasked}
            </div>
            <div className="text-xs sm:text-sm font-black text-[#0057A8] font-mono mt-0.5">
              {third.score.toLocaleString()} <span className="text-[10px] text-slate-500 font-sans">pts</span>
            </div>
            {third.reward && (
              <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-[9px] font-bold text-amber-800 truncate max-w-full">
                🎁 {third.reward}
              </div>
            )}
          </div>

          {/* Pedestal Step */}
          <div className="w-full h-16 sm:h-20 rounded-t-xl bg-slate-100 border-t-2 border-x border-slate-300 flex flex-col items-center justify-center p-2">
            <div className="text-amber-800 font-black text-base sm:text-lg font-mono">
              3RD
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5 font-medium">
              <MapPin className="w-3 h-3 text-amber-700" />
              <span>{third.region}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

