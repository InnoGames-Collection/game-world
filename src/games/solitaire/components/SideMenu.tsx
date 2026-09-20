/**
 * Solitaire Slide-Out Game Menu
 * Exactly replicates the menu seen in the reference video at 00:27:
 * - HOME
 * - RESTART GAME
 * - NEW GAME
 * - DAILY CHALLENGE
 * - HOW TO PLAY
 * - SOUND ON/OFF
 * - MUSIC ON/OFF
 * - HAND LEFT/RIGHT
 */

import React from 'react';
import {
  Home,
  RotateCcw,
  PlusCircle,
  Calendar,
  HelpCircle,
  Volume2,
  VolumeX,
  Music,
  ArrowLeftRight,
  X,
  Trophy,
} from 'lucide-react';
import { soundManager } from '../audioEngine';

interface SideMenuProps {
  isOpen: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  handMode: 'left' | 'right';
  onClose: () => void;
  onHome: () => void;
  onRestartGame: () => void;
  onNewGame: () => void;
  onLeaderboard?: () => void;
  onDailyChallenge: () => void;
  onHowToPlay: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleHandMode: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  soundEnabled,
  musicEnabled,
  handMode,
  onClose,
  onHome,
  onRestartGame,
  onNewGame,
  onLeaderboard,
  onDailyChallenge,
  onHowToPlay,
  onToggleSound,
  onToggleMusic,
  onToggleHandMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200 select-none">
      {/* Dimmed backdrop */}
      <div
        onClick={() => {
          soundManager.playButton();
          onClose();
        }}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
      />

      {/* Side Menu Drawer from Left (As seen in video) */}
      <div className="relative z-10 w-64 max-w-[80vw] h-full bg-[#120a06]/95 border-r-2 border-[#5d4037] shadow-2xl flex flex-col justify-between p-4 text-white overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">♠</span>
            <span className="font-black text-base tracking-wider text-amber-400 uppercase">
              SOLITAIRE
            </span>
          </div>
          <button
            onClick={() => {
              soundManager.playButton();
              onClose();
            }}
            className="p-1 rounded-lg bg-white/10 text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Items (Exact match with video menu) */}
        <div className="flex flex-col gap-1.5 my-auto py-2">
          {/* HOME */}
          <button
            onClick={() => {
              soundManager.playButton();
              onHome();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-black uppercase tracking-wider border border-white/10 active:scale-98 transition-all"
          >
            <Home className="w-4 h-4 text-emerald-400" />
            <span>HOME</span>
          </button>

          {/* RESTART GAME */}
          <button
            onClick={() => {
              soundManager.playButton();
              onRestartGame();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-black uppercase tracking-wider border border-white/10 active:scale-98 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>RESTART GAME</span>
          </button>

          {/* NEW GAME */}
          <button
            onClick={() => {
              soundManager.playButton();
              onNewGame();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-black uppercase tracking-wider border border-white/10 active:scale-98 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-sky-400" />
            <span>NEW GAME</span>
          </button>

          {/* DAILY CHALLENGE */}
          <button
            onClick={() => {
              soundManager.playButton();
              onDailyChallenge();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-black uppercase tracking-wider border border-white/10 active:scale-98 transition-all"
          >
            <Calendar className="w-4 h-4 text-rose-400" />
            <span>DAILY CHALLENGE</span>
          </button>

          {/* LEADERBOARD */}
          {onLeaderboard && (
            <button
              onClick={() => {
                soundManager.playButton();
                onLeaderboard();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-yellow-600/30 hover:from-amber-600/50 hover:to-yellow-600/50 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-500/40 active:scale-98 transition-all shadow-sm"
            >
              <Trophy className="w-4 h-4 text-yellow-300 fill-current" />
              <span>LEADERBOARD</span>
            </button>
          )}

          <div className="h-px bg-white/10 my-2" />

          {/* HOW TO PLAY */}
          <button
            onClick={() => {
              soundManager.playButton();
              onHowToPlay();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-black uppercase tracking-wider border border-white/10 active:scale-98 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-amber-300" />
            <span>HOW TO PLAY</span>
          </button>

          {/* SOUND ON/OFF */}
          <button
            onClick={() => {
              soundManager.playButton();
              onToggleSound();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-black uppercase tracking-wider border border-white/10 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-rose-400" />
              )}
              <span>SOUND</span>
            </div>
            <span className={`text-[10px] ${soundEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
              {soundEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* MUSIC ON/OFF */}
          <button
            onClick={() => {
              soundManager.playButton();
              onToggleMusic();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-black uppercase tracking-wider border border-white/10 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <Music className={`w-4 h-4 ${musicEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>MUSIC</span>
            </div>
            <span className={`text-[10px] ${musicEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
              {musicEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* HAND LEFT/RIGHT */}
          <button
            onClick={() => {
              soundManager.playButton();
              onToggleHandMode();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-black uppercase tracking-wider border border-white/10 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="w-4 h-4 text-amber-300" />
              <span>HAND</span>
            </div>
            <span className="text-[10px] text-amber-300">
              {handMode === 'left' ? 'LEFT' : 'RIGHT'}
            </span>
          </button>
        </div>

        {/* Bottom copyright / version */}
        <div className="text-center text-[10px] text-white/40 pt-2 border-t border-white/10">
          GoPlay Solitaire • 52-Card Klondike
        </div>
      </div>
    </div>
  );
};
