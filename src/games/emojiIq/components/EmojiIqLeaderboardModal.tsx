/**
 * EMOJI IQ — Tournament Leaderboard Modal
 * Accessible before and after playing. Displays live player rankings, level progress, and score targets.
 */

import React from 'react';
import { EmojiIqLeaderboardService } from '../tournamentLeaderboardService';
import { EmojiIqPlayerStats } from '../types';
import { EMOJI_IQ_COLORS } from '../colors';
import { Trophy, X, Medal, Flame, Star, Target, ArrowUp } from 'lucide-react';
import { emojiIqAudio } from '../emojiIqAudio';

interface EmojiIqLeaderboardModalProps {
  playerStats: EmojiIqPlayerStats;
  onClose: () => void;
}

export const EmojiIqLeaderboardModal: React.FC<EmojiIqLeaderboardModalProps> = ({
  playerStats,
  onClose,
}) => {
  const data = EmojiIqLeaderboardService.getLeaderboard('You', playerStats);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div
        className="w-full max-w-md h-[88vh] max-h-[680px] bg-white rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between border-2 border-[#6C5CE7]/30 animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-[#6C5CE7]/15">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#FFB703]/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[#FFB703] fill-[#FFB703]" />
            </div>
            <div className="flex flex-col">
              <h2
                className="text-lg sm:text-xl font-black font-['Fredoka',sans-serif] tracking-wide uppercase leading-tight"
                style={{ color: EMOJI_IQ_COLORS.textPrimary }}
              >
                TOURNAMENT RANKINGS
              </h2>
              <span className="text-[11px] font-bold text-[#6B6780]">
                Emoji IQ Championship Standings
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              emojiIqAudio.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#241F3D] hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User's Standings Banner */}
        <div className="my-2 p-3 rounded-2xl bg-gradient-to-r from-[#6C5CE7] to-[#00B8D9] text-white shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-xl">
              #{data.userRank}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">YOUR RANK</span>
              <span className="text-base font-black leading-tight">You</span>
              <span className="text-[11px] font-mono opacity-90">Level {playerStats.unlockedLevel}</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs font-bold opacity-80 uppercase tracking-wider">SCORE</span>
            <span className="text-xl font-black font-mono leading-tight">
              {data.userScore.toLocaleString()}
            </span>
            {data.pointsToNextRank > 0 && (
              <span className="text-[10px] font-bold opacity-90 flex items-center gap-0.5">
                <ArrowUp className="w-3 h-3" /> +{data.pointsToNextRank.toLocaleString()} to Rank #{data.userRank - 1}
              </span>
            )}
          </div>
        </div>

        {/* Table of Ranks */}
        <div className="flex-1 w-full overflow-y-auto pr-1 flex flex-col gap-1.5 my-1">
          {data.entries.map((entry) => {
            const isUser = entry.isCurrentUser;

            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-2.5 rounded-2xl transition-all ${
                  isUser
                    ? 'bg-[#F7F5FF] border-2 border-[#6C5CE7] shadow-sm scale-[1.01]'
                    : 'bg-white border border-slate-100 hover:border-[#6C5CE7]/30'
                }`}
              >
                {/* Rank & Player Info */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs font-mono ${
                      entry.rank === 1
                        ? 'bg-[#FFB703] text-black shadow-sm'
                        : entry.rank === 2
                        ? 'bg-slate-300 text-black'
                        : entry.rank === 3
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {entry.rank}
                  </div>

                  <span className="text-xl">{entry.avatarEmoji}</span>

                  <div className="flex flex-col text-left">
                    <span
                      className={`text-xs sm:text-sm font-black truncate max-w-[120px] sm:max-w-[150px] ${
                        isUser ? 'text-[#6C5CE7]' : 'text-[#241F3D]'
                      }`}
                    >
                      {entry.name}
                    </span>
                    <span className="text-[10px] font-bold text-[#6B6780]">
                      Lvl {entry.level} • {entry.accuracy}% Acc • {entry.bestCombo}x Combo
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right font-mono">
                  <span className="text-sm font-black text-[#241F3D]">
                    {entry.score.toLocaleString()}
                  </span>
                  <span className="block text-[9px] font-bold uppercase text-[#6B6780]">PTS</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Button */}
        <button
          onClick={() => {
            emojiIqAudio.playPop();
            onClose();
          }}
          className="w-full mt-2 py-3 rounded-2xl text-white font-black text-base shadow-md hover:brightness-105 active:scale-95 transition-all"
          style={{
            backgroundColor: EMOJI_IQ_COLORS.primary,
            boxShadow: '0 4px 14px rgba(108, 92, 231, 0.3)',
          }}
        >
          Close Standings
        </button>
      </div>
    </div>
  );
};
