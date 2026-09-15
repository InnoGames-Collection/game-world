/**
 * Solitaire Opening Screen
 * Replicates the authentic title screen seen in the reference video:
 * - "Daily Solitaire" golden title with card suits
 * - Green felt table with gentle radial lighting
 * - Big Green Play button
 * - Daily Challenge calendar button with star stamp
 * - Level Selection access
 * - Circular "Next" button & hamburger menu
 */

import React from 'react';
import { CardGraphic, CardBack } from '../cardRenderer';
import { soundManager } from '../audioEngine';
import { Play, Calendar, ListOrdered, Volume2, VolumeX, Menu, ArrowRight, ArrowLeft, Trophy } from 'lucide-react';

interface OpeningScreenProps {
  soundEnabled: boolean;
  onPlay: () => void;
  onOpenLevels: () => void;
  onOpenLeaderboard: () => void;
  onOpenDailyChallenge: () => void;
  onOpenModeSelect: () => void;
  onToggleSound: () => void;
  onOpenMenu: () => void;
  onExitPortal: () => void;
  currentLevel: number;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({
  soundEnabled,
  onPlay,
  onOpenLevels,
  onOpenLeaderboard,
  onOpenDailyChallenge,
  onOpenModeSelect,
  onToggleSound,
  onOpenMenu,
  onExitPortal,
  currentLevel,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#004d2a] select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Deep Emerald Green Felt Table with Radial Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, #007a40 0%, #005a30 50%, #00361d 100%)',
        }}
      />
      {/* Subtle fabric noise texture overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '4px 4px',
        }}
      />

      {/* TOP HEADER: Exit to Portal & Sound Toggle */}
      <div className="relative z-20 flex items-center justify-between p-3">
        <button
          onClick={() => {
            soundManager.playButton();
            onExitPortal();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs font-bold shadow-md border border-white/20 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButton();
            onToggleSound();
          }}
          className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white shadow-md border border-white/20 active:scale-95 transition-transform"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
        </button>
      </div>

      {/* CENTER HERO AREA: Title, Decorative Fanned Cards, Big Play Button */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 -mt-6">
        {/* Floating Background Cards Deco */}
        <div className="relative w-48 h-20 mb-3 flex items-center justify-center">
          <div className="absolute -left-6 -top-2 w-16 h-22 -rotate-25 shadow-2xl opacity-90">
            <CardGraphic card={{ id: 'deco1', suit: 'spades', rank: 1, isFaceUp: true }} />
          </div>
          <div className="absolute right-4 -top-3 w-16 h-22 rotate-18 shadow-2xl opacity-90">
            <CardGraphic card={{ id: 'deco2', suit: 'diamonds', rank: 1, isFaceUp: true }} />
          </div>
          <div className="absolute -right-8 top-1 w-14 h-20 rotate-35 shadow-2xl opacity-75">
            <CardBack />
          </div>
        </div>

        {/* Ornate Title "Daily Solitaire" */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex items-center gap-1.5 text-red-500 text-sm drop-shadow mb-1">
            <span className="text-red-400 font-serif text-lg">♥</span>
            <span className="text-white font-serif text-lg">♠</span>
            <span className="text-amber-300 font-serif text-xs font-extrabold tracking-widest uppercase">DAILY</span>
            <span className="text-red-400 font-serif text-lg">♦</span>
            <span className="text-white font-serif text-lg">♣</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-wider text-[#ffd54f] uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] stroke-black">
            SOLITAIRE
          </h1>
          <div className="w-36 h-1 rounded-full bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-1" />
        </div>

        {/* Primary Large Green PLAY Button (As in Video) */}
        <div className="w-full max-w-xs flex flex-col items-center gap-3">
          <button
            onClick={() => {
              soundManager.playButton();
              onPlay();
            }}
            className="w-48 py-3.5 px-6 rounded-2xl bg-gradient-to-b from-[#4caf50] via-[#388e3c] to-[#1b5e20] hover:from-[#66bb6a] hover:to-[#2e7d32] text-white font-black text-xl tracking-wider shadow-[0_8px_24px_rgba(0,0,0,0.5)] border-2 border-[#81c784] active:scale-95 transition-all flex items-center justify-center gap-2 group"
          >
            <Play className="w-6 h-6 fill-white text-white group-hover:scale-110 transition-transform" />
            <span>PLAY</span>
          </button>

          {/* DAILY CHALLENGE Calendar Card Button */}
          <button
            onClick={() => {
              soundManager.playButton();
              onOpenDailyChallenge();
            }}
            className="relative px-5 py-2.5 rounded-xl bg-gradient-to-b from-[#1b5e20]/90 to-[#0d3311]/90 border border-emerald-400/40 shadow-lg flex items-center gap-3 hover:bg-[#1b5e20] active:scale-95 transition-transform"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-white shadow flex flex-col items-center justify-center overflow-hidden border border-slate-300">
                <div className="w-full bg-red-600 text-white text-[8px] font-black uppercase text-center py-0.5">
                  TODAY
                </div>
                <div className="text-slate-800 text-xs font-black">
                  ★
                </div>
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-white text-xs font-black tracking-wide uppercase">
                DAILY CHALLENGE
              </span>
              <span className="text-[10px] text-amber-300 font-semibold">
                Daily Solitaire Puzzle Deal
              </span>
            </div>
          </button>

          {/* 40 LEVELS Button */}
          <button
            onClick={() => {
              soundManager.playButton();
              onOpenLevels();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/30 hover:bg-black/50 border border-white/20 text-white text-xs font-bold active:scale-95 transition-transform"
          >
            <ListOrdered className="w-4 h-4 text-amber-400" />
            <span>Levels (Current: Lvl {currentLevel})</span>
          </button>

          {/* LEADERBOARD Button */}
          <button
            onClick={() => {
              soundManager.playButton();
              onOpenLeaderboard();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 border border-amber-400/60 text-white text-xs font-black active:scale-95 transition-transform shadow-md"
          >
            <Trophy className="w-4 h-4 text-yellow-300 fill-current" />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Floating Circular "Next" Button on Right (Seen in video at 00:00 & 00:03) */}
      <div className="absolute right-4 bottom-14 z-30">
        <button
          onClick={() => {
            soundManager.playButton();
            onPlay();
          }}
          className="w-12 h-12 rounded-full bg-gradient-to-b from-[#4caf50] to-[#2e7d32] border-2 border-emerald-300 shadow-xl flex flex-col items-center justify-center text-white active:scale-90 transition-transform"
        >
          <span className="text-[9px] font-black uppercase leading-tight">Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* BOTTOM INFO / NAVIGATION BAR (Seen in video) */}
      <div className="relative z-20 flex items-center justify-between px-4 py-2 bg-[#1b120c]/90 border-t-2 border-[#5d4037] text-white shadow-2xl">
        {/* Left Green Hamburger Menu Button */}
        <button
          onClick={() => {
            soundManager.playButton();
            onOpenMenu();
          }}
          className="p-2 rounded-lg bg-[#2e7d32] hover:bg-[#388e3c] text-white shadow active:scale-95 transition-transform"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 text-xs font-bold text-amber-200/80">
          <span>KLONDIKE SOLITAIRE</span>
        </div>

        <button
          onClick={() => {
            soundManager.playButton();
            onOpenModeSelect();
          }}
          className="text-xs text-amber-300 hover:text-amber-100 font-black underline underline-offset-2"
        >
          Mode Select
        </button>
      </div>
    </div>
  );
};
