/**
 * EMOJI IQ — 40-Level Grid Selection Screen
 * Displays stages 1 through 40 with locked/unlocked states, stars, and level high scores.
 */

import React from 'react';
import { EMOJI_IQ_LEVELS } from '../questionDatabase';
import { EmojiIqPlayerStats } from '../types';
import { EMOJI_IQ_COLORS } from '../colors';
import { ArrowLeft, Lock, Star, Trophy, Sparkles } from 'lucide-react';
import { emojiIqAudio } from '../emojiIqAudio';

interface EmojiIqLevelSelectProps {
  playerStats: EmojiIqPlayerStats;
  onSelectLevel: (levelNumber: number) => void;
  onBack: () => void;
  onOpenLeaderboard: () => void;
}

export const EmojiIqLevelSelect: React.FC<EmojiIqLevelSelectProps> = ({
  playerStats,
  onSelectLevel,
  onBack,
  onOpenLeaderboard,
}) => {
  const totalStars = Object.values(playerStats.starsByLevel).reduce((acc: number, val) => acc + (Number(val) || 0), 0);

  return (
    <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between p-3 sm:p-4 select-none overflow-hidden">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-3">
        <button
          onClick={() => {
            emojiIqAudio.playPop();
            onBack();
          }}
          className="w-10 h-10 rounded-2xl bg-white border border-[#6C5CE7]/20 flex items-center justify-center text-[#241F3D] hover:scale-105 active:scale-95 transition-transform shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-[#6C5CE7]" />
        </button>

        <div className="flex flex-col items-center">
          <h1
            className="text-xl sm:text-2xl font-black font-['Fredoka',sans-serif] tracking-wide uppercase"
            style={{ color: EMOJI_IQ_COLORS.textPrimary }}
          >
            SELECT LEVEL
          </h1>
          <span className="text-xs font-bold text-[#6B6780]">
            Unlocked: {playerStats.unlockedLevel}/40
          </span>
        </div>

        {/* Stars pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#FFB703]/30 shadow-sm">
          <Star className="w-4 h-4 fill-[#FFB703] text-[#FFB703]" />
          <span className="font-black text-xs sm:text-sm font-mono text-[#241F3D]">
            {totalStars}
          </span>
        </div>
      </div>

      {/* 40 Levels Scrollable Grid */}
      <div className="flex-1 w-full overflow-y-auto pr-1 grid grid-cols-4 sm:grid-cols-5 gap-2.5 sm:gap-3 py-2">
        {EMOJI_IQ_LEVELS.map((cfg) => {
          const isUnlocked = cfg.level <= playerStats.unlockedLevel;
          const stars = playerStats.starsByLevel[cfg.level] || 0;
          const isCurrent = cfg.level === playerStats.unlockedLevel;

          return (
            <button
              key={cfg.level}
              onClick={() => {
                if (isUnlocked) {
                  emojiIqAudio.playPop();
                  onSelectLevel(cfg.level);
                }
              }}
              disabled={!isUnlocked}
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-1 transition-all ${
                !isUnlocked
                  ? 'bg-slate-100/80 border border-slate-200 text-slate-400 cursor-not-allowed'
                  : isCurrent
                  ? 'bg-gradient-to-br from-[#6C5CE7] to-[#4834d4] text-white shadow-lg border-2 border-[#FFB703] scale-105 animate-pulse'
                  : 'bg-white border-2 border-[#6C5CE7]/20 hover:border-[#6C5CE7] text-[#241F3D] shadow-sm hover:scale-105 active:scale-95'
              }`}
            >
              {!isUnlocked ? (
                <Lock className="w-4 h-4 text-slate-400" />
              ) : (
                <>
                  <span
                    className={`font-black font-mono leading-none ${
                      isCurrent ? 'text-xl text-white' : 'text-lg text-[#241F3D]'
                    }`}
                  >
                    {cfg.level}
                  </span>

                  {/* Stars indicators */}
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-2.5 h-2.5 ${
                          i < stars
                            ? 'fill-[#FFB703] text-[#FFB703]'
                            : isCurrent
                            ? 'fill-white/30 text-white/30'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom bar with Leaderboard Shortcut */}
      <div className="w-full pt-3">
        <button
          onClick={() => {
            emojiIqAudio.playPop();
            onOpenLeaderboard();
          }}
          className="w-full py-3 rounded-2xl bg-white border border-[#FFB703]/50 text-[#241F3D] shadow-sm font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
        >
          <Trophy className="w-4 h-4 text-[#FFB703]" />
          <span>Tournament Standings</span>
        </button>
      </div>
    </div>
  );
};
