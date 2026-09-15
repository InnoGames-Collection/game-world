/**
 * Emoji Fun — Home Screen
 * Faithful reproduction of reference video layout, proportions, colors, and 3D buttons
 */

import React from 'react';
import { Play, Trophy, ShoppingBag, Settings, HelpCircle, Sparkles } from 'lucide-react';
import { emojiAudio } from '../emojiAudio';

interface EmojiFunHomeProps {
  onPlay: () => void;
  onLeaderboard: () => void;
  onStore: () => void;
  onSettings: () => void;
  onHowToPlay: () => void;
  totalScore: number;
  currentLevel: number;
}

export const EmojiFunHome: React.FC<EmojiFunHomeProps> = ({
  onPlay,
  onLeaderboard,
  onStore,
  onSettings,
  onHowToPlay,
  totalScore,
  currentLevel,
}) => {
  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-between py-6 px-4 z-10 select-none">
      {/* Top Banner / Logo Area */}
      <div className="flex flex-col items-center pt-2 sm:pt-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Thinking Emoji at top of title (Exactly as in reference video!) */}
        <div className="relative mb-2">
          <span className="text-6xl sm:text-7xl filter drop-shadow-lg inline-block animate-bounce" style={{ animationDuration: '3s' }}>
            🤔
          </span>
          <span className="absolute -top-1 -right-2 text-2xl animate-spin" style={{ animationDuration: '6s' }}>
            ✨
          </span>
        </div>

        {/* 3D Stylized Title: EMOJI FUN */}
        <div className="text-center relative">
          <h1
            className="text-5xl sm:text-6xl font-black tracking-wider uppercase font-['Fredoka',sans-serif] leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#ffe066] via-[#ffb703] to-[#fb8500]"
            style={{
              WebkitTextStroke: '2.5px #8c3b00',
              filter: 'drop-shadow(0 6px 0 #5c2400) drop-shadow(0 10px 14px rgba(0,0,0,0.25))',
            }}
          >
            EMOJI FUN
          </h1>
          <p className="text-xs sm:text-sm font-black tracking-widest text-[#6d28d9] uppercase mt-2 bg-white/60 px-3 py-1 rounded-full shadow-sm border border-white/80">
            Tournament Puzzle Arena
          </p>
        </div>

        {/* Current Player Mini Stats Ribbon */}
        <div className="mt-4 flex items-center gap-3 bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/80 shadow-sm">
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-600 font-bold uppercase">Level</span>
            <span className="text-sm font-black text-purple-700">{currentLevel}</span>
          </div>
          <div className="h-3 w-px bg-slate-400/40" />
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-600 font-bold uppercase">Tournament Score</span>
            <span className="text-sm font-black text-amber-600">{totalScore.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Chunky Pill Buttons (Matching reference video proportions & colors) */}
      <div className="w-full max-w-xs flex flex-col gap-3.5 my-auto py-4">
        {/* 1. PLAY BUTTON (Yellow/Orange Glossy with Sunglasses Emoji 😎) */}
        <button
          onClick={() => {
            emojiAudio.playTap();
            onPlay();
          }}
          className="group relative w-full flex items-center justify-between px-5 py-3.5 rounded-3xl bg-gradient-to-b from-[#ffe082] via-[#ffca28] to-[#ffb300] border-b-[6px] border-[#e65100] active:border-b-2 active:translate-y-1 shadow-xl hover:brightness-105 transition-all text-[#4e2700]"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow group-hover:scale-110 transition-transform">
              😎
            </span>
            <span className="text-2xl sm:text-3xl font-black tracking-wider uppercase drop-shadow-sm font-['Fredoka',sans-serif]">
              Play
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center shadow-inner">
            <Play className="w-6 h-6 fill-[#7c2d12] text-[#7c2d12] ml-0.5" />
          </div>
        </button>

        {/* 2. LEADERBOARD BUTTON (Royal Purple/Gold Pill with Trophy 🏆) */}
        <button
          onClick={() => {
            emojiAudio.playTap();
            onLeaderboard();
          }}
          className="group relative w-full flex items-center justify-between px-5 py-3 rounded-3xl bg-gradient-to-b from-[#b388ff] via-[#9575cd] to-[#7e57c2] border-b-[6px] border-[#4527a0] active:border-b-2 active:translate-y-1 shadow-xl hover:brightness-105 transition-all text-white"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow group-hover:scale-110 transition-transform">
              🏆
            </span>
            <span className="text-xl sm:text-2xl font-black tracking-wider uppercase drop-shadow-sm font-['Fredoka',sans-serif]">
              Leaderboard
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center shadow-inner">
            <Trophy className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
        </button>

        {/* 3. STORE BUTTON (Teal/Emerald Pill with Shopping Bag 🛍️) */}
        <button
          onClick={() => {
            emojiAudio.playTap();
            onStore();
          }}
          className="group relative w-full flex items-center justify-between px-5 py-3 rounded-3xl bg-gradient-to-b from-[#80cbc4] via-[#4db6ac] to-[#26a69a] border-b-[6px] border-[#00695c] active:border-b-2 active:translate-y-1 shadow-xl hover:brightness-105 transition-all text-white"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow group-hover:scale-110 transition-transform">
              🛍️
            </span>
            <span className="text-xl sm:text-2xl font-black tracking-wider uppercase drop-shadow-sm font-['Fredoka',sans-serif]">
              Store
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center shadow-inner">
            <span className="text-lg font-black">+</span>
          </div>
        </button>

        {/* 4. SETTINGS BUTTON (Lime/Mint Pill with Smile Emoji 😊) */}
        <button
          onClick={() => {
            emojiAudio.playTap();
            onSettings();
          }}
          className="group relative w-full flex items-center justify-between px-5 py-3 rounded-3xl bg-gradient-to-b from-[#d4e157] via-[#c0ca33] to-[#afb42b] border-b-[6px] border-[#689f38] active:border-b-2 active:translate-y-1 shadow-xl hover:brightness-105 transition-all text-[#2e4c00]"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow group-hover:scale-110 transition-transform">
              😊
            </span>
            <span className="text-xl sm:text-2xl font-black tracking-wider uppercase drop-shadow-sm font-['Fredoka',sans-serif]">
              Setting
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center shadow-inner">
            <Settings className="w-5 h-5 text-[#2e4c00]" />
          </div>
        </button>
      </div>

      {/* Footer Info & How to Play Link */}
      <div className="w-full flex items-center justify-between max-w-xs text-xs text-purple-950 font-bold px-2">
        <button
          onClick={() => {
            emojiAudio.playTap();
            onHowToPlay();
          }}
          className="flex items-center gap-1.5 hover:underline bg-white/40 px-3 py-1 rounded-full shadow-sm"
        >
          <HelpCircle className="w-4 h-4 text-purple-700" />
          <span>How to Play</span>
        </button>

        <span className="opacity-70">40 Levels • 400+ Puzzles</span>
      </div>
    </div>
  );
};
