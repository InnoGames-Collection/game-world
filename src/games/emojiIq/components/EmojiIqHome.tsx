/**
 * EMOJI IQ — Home Screen (Main Menu)
 * Visual entry point with vibrant tournament branding, quick start, level select, store, and leaderboard shortcuts.
 */

import React from 'react';
import { EmojiIqPlayerStats } from '../types';
import { EMOJI_IQ_COLORS } from '../colors';
import { Play, Grid, Trophy, ShoppingBag, HelpCircle, Star, Flame, Brain } from 'lucide-react';
import { emojiIqAudio } from '../emojiIqAudio';

interface EmojiIqHomeProps {
  playerStats: EmojiIqPlayerStats;
  onPlay: () => void;
  onOpenLevelSelect: () => void;
  onOpenLeaderboard: () => void;
  onOpenStore: () => void;
  onOpenHowToPlay: () => void;
}

export const EmojiIqHome: React.FC<EmojiIqHomeProps> = ({
  playerStats,
  onPlay,
  onOpenLevelSelect,
  onOpenLeaderboard,
  onOpenStore,
  onOpenHowToPlay,
}) => {
  const totalStars = Object.values(playerStats.starsByLevel).reduce((acc: number, val) => acc + (Number(val) || 0), 0);

  return (
    <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between items-center p-4 select-none">
      {/* Top Section: Title & Visual Badge */}
      <div className="w-full flex flex-col items-center mt-2">
        {/* Floating Icons Badge */}
        <div className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white border border-[#6C5CE7]/20 shadow-sm">
          <Brain className="w-4 h-4 text-[#6C5CE7]" />
          <span
            className="text-[11px] font-black uppercase tracking-widest"
            style={{ color: EMOJI_IQ_COLORS.primary }}
          >
            OFFICIAL TOURNAMENT
          </span>
          <span className="text-sm">⚡</span>
        </div>

        {/* Big Game Title */}
        <h1
          className="text-4xl sm:text-5xl font-black font-['Fredoka',sans-serif] tracking-wider uppercase text-center"
          style={{
            color: EMOJI_IQ_COLORS.textPrimary,
            textShadow: '0 4px 12px rgba(108, 92, 231, 0.15)',
          }}
        >
          EMOJI <span style={{ color: EMOJI_IQ_COLORS.primary }}>IQ</span>
        </h1>

        <p
          className="text-xs sm:text-sm font-extrabold tracking-wide uppercase mt-1 text-center"
          style={{ color: EMOJI_IQ_COLORS.textSecondary }}
        >
          Emoji & Number Calculation Challenge
        </p>

        {/* Diamond Divider */}
        <div className="w-full max-w-xs flex items-center justify-center my-3 opacity-70">
          <span className="text-xs text-[#6C5CE7]">◇</span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#6C5CE7] to-transparent mx-2" />
          <span className="text-xs text-[#6C5CE7]">◇</span>
        </div>
      </div>

      {/* Central Visual Stage: Animated Interactive Equation Teaser */}
      <div
        className="w-full bg-white rounded-3xl p-4 sm:p-5 shadow-lg border flex flex-col items-center my-auto transition-transform hover:scale-[1.01]"
        style={{
          borderColor: 'rgba(108, 92, 231, 0.15)',
          boxShadow: '0 12px 28px -6px rgba(108, 92, 231, 0.14)',
        }}
      >
        <div className="w-full flex flex-col gap-2">
          {/* Sample Equation 1 */}
          <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-[#F7F5FF] border border-[#6C5CE7]/10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍎</span>
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-xs shadow-sm">+</span>
              <span className="text-2xl">🍎</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#6B6780]">=</span>
              <span className="font-mono font-black text-base text-[#241F3D]">10</span>
            </div>
          </div>

          {/* Sample Equation 2 */}
          <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-[#F7F5FF] border border-[#6C5CE7]/10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍎</span>
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-xs shadow-sm">+</span>
              <span className="text-2xl">🍌</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#6B6780]">=</span>
              <span className="font-mono font-black text-base text-[#241F3D]">12</span>
            </div>
          </div>

          {/* Sample Target Row */}
          <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-gradient-to-r from-[#6C5CE7]/15 to-[#00B8D9]/15 border-2 border-[#6C5CE7]/40">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍌</span>
              <span className="w-6 h-6 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center font-bold text-xs shadow-sm">×</span>
              <span className="text-2xl">🍎</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#6B6780]">=</span>
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-lg shadow-sm"
                style={{ backgroundColor: EMOJI_IQ_COLORS.accent, color: EMOJI_IQ_COLORS.bgDark }}
              >
                ?
              </span>
            </div>
          </div>
        </div>

        {/* Player Tournament Summary Ribbon */}
        <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#6B6780] uppercase">TOURNAMENT SCORE</span>
            <span className="text-sm sm:text-base font-black font-mono text-[#6C5CE7]">
              {playerStats.totalTournamentScore.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#6B6780] uppercase">STAGE</span>
            <span className="text-sm sm:text-base font-black font-mono text-[#241F3D]">
              {playerStats.unlockedLevel}/40
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#6B6780] uppercase">STARS</span>
            <span className="text-sm sm:text-base font-black font-mono text-[#FFB703] flex items-center justify-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-[#FFB703]" /> {totalStars}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Stack */}
      <div className="w-full flex flex-col gap-2.5 mt-4">
        {/* Main Big Play Button */}
        <button
          onClick={() => {
            emojiIqAudio.playPop();
            onPlay();
          }}
          className="w-full py-4 rounded-2xl text-white font-black text-xl tracking-wide shadow-xl hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          style={{
            backgroundColor: EMOJI_IQ_COLORS.primary,
            boxShadow: '0 8px 24px rgba(108, 92, 231, 0.45)',
          }}
        >
          <Play className="w-6 h-6 fill-white" />
          <span>PLAY LEVEL {playerStats.unlockedLevel}</span>
        </button>

        {/* Grid of Secondary Navigation */}
        <div className="w-full grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              emojiIqAudio.playPop();
              onOpenLevelSelect();
            }}
            className="py-3 px-3 rounded-2xl bg-white border border-[#6C5CE7]/20 shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Grid className="w-4 h-4 text-[#6C5CE7]" />
            <span className="font-bold text-xs sm:text-sm text-[#241F3D]">All 40 Levels</span>
          </button>

          <button
            onClick={() => {
              emojiIqAudio.playPop();
              onOpenLeaderboard();
            }}
            className="py-3 px-3 rounded-2xl bg-white border border-[#FFB703]/40 shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Trophy className="w-4 h-4 text-[#FFB703] fill-[#FFB703]" />
            <span className="font-bold text-xs sm:text-sm text-[#241F3D]">Leaderboard</span>
          </button>
        </div>

        {/* Store & How To Play row */}
        <div className="w-full grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              emojiIqAudio.playPop();
              onOpenStore();
            }}
            className="py-2.5 px-3 rounded-2xl bg-white border border-[#00B8D9]/30 shadow-sm flex items-center justify-center gap-1.5 hover:bg-slate-50 active:scale-95 transition-all text-xs font-bold text-[#241F3D]"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#00B8D9]" />
            <span>Store & Items</span>
          </button>

          <button
            onClick={() => {
              emojiIqAudio.playPop();
              onOpenHowToPlay();
            }}
            className="py-2.5 px-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center gap-1.5 hover:bg-slate-50 active:scale-95 transition-all text-xs font-bold text-[#6B6780]"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Rules & Formulas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
