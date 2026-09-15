/**
 * Crazy Colors Main Menu Modal
 * Displays authentic glowing CRAZY COLORS logo, revolving neon rings,
 * and primary actions: PLAY, LEVELS, SOUND, and HOW TO PLAY.
 */

import React from 'react';
import { Play, Grid, HelpCircle, Volume2, VolumeX, Sparkles, Trophy } from 'lucide-react';
import { crazyColorsAudio } from '../audioEngine';
import { CrazyColorsSaveData } from '../types';

interface MenuModalProps {
  saveData: CrazyColorsSaveData;
  onPlay: () => void;
  onOpenLeaderboard: () => void;
  onOpenLevels: () => void;
  onOpenHowToPlay: () => void;
  onToggleSound: () => void;
  onExit: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  saveData,
  onPlay,
  onOpenLeaderboard,
  onOpenLevels,
  onOpenHowToPlay,
  onToggleSound,
  onExit,
}) => {
  const totalStars = Object.values(saveData.stars).reduce((acc: number, cur: number) => acc + cur, 0);

  return (
    <div
      id="crazy-colors-menu-screen"
      className="absolute inset-0 z-40 bg-[#2B2B2B] flex flex-col justify-between items-center p-6 text-white select-none overflow-hidden"
    >
      {/* Background ambient neon glow circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Top Header Controls: Sound toggle & Exit to Hub */}
      <div className="w-full max-w-md flex items-center justify-between z-10">
        <button
          id="crazy-colors-menu-sound-toggle"
          type="button"
          onClick={() => {
            onToggleSound();
          }}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 transition-all focus:outline-none"
          aria-label={saveData.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
        >
          {saveData.soundEnabled ? (
            <Volume2 className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_6px_rgba(0,217,255,0.6)]" />
          ) : (
            <VolumeX className="w-5 h-5 text-white/40" />
          )}
        </button>

        {/* Stars trophy pill */}
        <div className="px-3.5 py-1.5 rounded-full bg-black/40 border border-yellow-500/30 flex items-center gap-1.5 shadow-inner">
          <Trophy className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_8px_rgba(255,216,0,0.6)]" />
          <span className="text-xs font-bold text-yellow-300 font-mono">
            {totalStars} / 200
          </span>
        </div>

        {/* Help / How to play */}
        <button
          id="crazy-colors-menu-help-btn"
          type="button"
          onClick={() => {
            crazyColorsAudio.playButton();
            onOpenHowToPlay();
          }}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 transition-all focus:outline-none"
          aria-label="How to Play"
        >
          <HelpCircle className="w-5 h-5 text-yellow-300" />
        </button>
      </div>

      {/* Center Branding & Hero Animated Logo */}
      <div className="flex flex-col items-center justify-center my-auto z-10">
        {/* Revolving multi-colored neon rings */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#00D9FF] animate-[spin_10s_linear_infinite] drop-shadow-[0_0_12px_rgba(0,217,255,0.7)]" />
          <div className="absolute inset-3 rounded-full border-4 border-[#FF008C] animate-[spin_6s_linear_infinite_reverse] drop-shadow-[0_0_12px_rgba(255,0,140,0.7)]" />
          <div className="absolute inset-6 rounded-full border-4 border-[#FFD800] animate-[spin_4s_linear_infinite] drop-shadow-[0_0_12px_rgba(255,216,0,0.7)]" />
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7A00FF] via-[#FF008C] to-[#00D9FF] shadow-[0_0_20px_rgba(255,0,140,0.8)] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
        </div>

        {/* Title text with vibrant color styling */}
        <div className="text-center space-y-1">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-[0_0_20px_rgba(0,217,255,0.4)] font-['Plus_Jakarta_Sans',sans-serif]">
            <span className="text-[#FF008C] drop-shadow-[0_0_10px_rgba(255,0,140,0.7)]">CRAZY</span>{' '}
            <span className="text-[#00D9FF] drop-shadow-[0_0_10px_rgba(0,217,255,0.7)]">COLORS</span>
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
            40-Level Championship
          </p>
        </div>
      </div>

      {/* Action Buttons: PLAY, LEVELS, EXIT */}
      <div className="w-full max-w-xs flex flex-col gap-3 z-10 mb-4">
        {/* Primary PLAY Button */}
        <button
          id="crazy-colors-menu-play-btn"
          type="button"
          onClick={() => {
            crazyColorsAudio.playButton();
            onPlay();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FF008C] via-[#7A00FF] to-[#00D9FF] text-white font-extrabold text-lg tracking-wider shadow-[0_0_24px_rgba(255,0,140,0.5)] hover:shadow-[0_0_32px_rgba(0,217,255,0.6)] active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/20"
        >
          <Play className="w-6 h-6 fill-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
          <span>PLAY LEVEL {saveData.highestUnlockedLevel}</span>
        </button>

        {/* Leaderboard Button */}
        <button
          id="crazy-colors-menu-leaderboard-btn"
          type="button"
          onClick={() => {
            crazyColorsAudio.playButton();
            onOpenLeaderboard();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 font-bold text-base tracking-wide border border-amber-400/40 backdrop-blur-md transition-all flex items-center justify-center gap-2.5 shadow-lg cursor-pointer"
        >
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>LEADERBOARD</span>
        </button>

        {/* Secondary LEVELS Button */}
        <button
          id="crazy-colors-menu-levels-btn"
          type="button"
          onClick={() => {
            crazyColorsAudio.playButton();
            onOpenLevels();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-base tracking-wide border border-white/15 backdrop-blur-md transition-all flex items-center justify-center gap-2.5 shadow-lg"
        >
          <Grid className="w-5 h-5 text-amber-300" />
          <span>LEVELS (40)</span>
        </button>

        {/* Back to Portal button */}
        <button
          id="crazy-colors-menu-exit-btn"
          type="button"
          onClick={() => {
            crazyColorsAudio.playButton();
            onExit();
          }}
          className="w-full py-2.5 text-center text-xs font-bold text-white/40 hover:text-white/80 transition-colors uppercase tracking-wider"
        >
          Back to Portal
        </button>
      </div>
    </div>
  );
};
