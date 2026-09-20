/**
 * Crazy Colors Top HUD Bar
 * Mandatory structure: [ BACK ] [ SCORE ] [ PAUSE ] [ SOUND ]
 * Button-style controls with 44-48dp touch targets, glassmorphism, glowing badges.
 */

import React from 'react';
import { ArrowLeft, Pause, Volume2, VolumeX } from 'lucide-react';
import { crazyColorsAudio } from '../audioEngine';

interface TopHudProps {
  score: number;
  totalCompetitiveScore?: number;
  levelId: number;
  soundEnabled: boolean;
  onBack: () => void;
  onPause: () => void;
  onToggleSound: () => void;
}

export const TopHud: React.FC<TopHudProps> = ({
  score,
  totalCompetitiveScore,
  levelId,
  soundEnabled,
  onBack,
  onPause,
  onToggleSound,
}) => {
  return (
    <header className="w-full max-w-md mx-auto px-3 py-2 flex items-center justify-between gap-2 select-none z-30 pointer-events-auto">
      {/* 1. [ BACK ] BUTTON */}
      <button
        id="crazy-colors-hud-back-btn"
        type="button"
        onClick={() => {
          crazyColorsAudio.playButton();
          onBack();
        }}
        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 shadow-lg backdrop-blur-md text-white transition-all focus:outline-none"
        aria-label="Back to Menu"
      >
        <ArrowLeft className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
      </button>

      {/* 2. [ SCORE ] BUTTON / BADGE */}
      <div
        id="crazy-colors-hud-score-badge"
        className="flex-1 min-h-[44px] px-3.5 py-1.5 flex items-center justify-between rounded-xl bg-black/40 border border-white/15 backdrop-blur-md shadow-inner"
      >
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[10px] font-black uppercase tracking-wider text-white/50">
            LVL {levelId}
          </span>
          <span className="text-[9px] font-bold text-cyan-400 font-mono tracking-tight">
            TOT: {(totalCompetitiveScore || 0).toLocaleString()}
          </span>
        </div>
        <div className="text-right">
          <span className="text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-white font-mono drop-shadow-[0_0_8px_rgba(255,216,0,0.4)]">
            {score.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3. [ PAUSE ] BUTTON */}
      <button
        id="crazy-colors-hud-pause-btn"
        type="button"
        onClick={() => {
          crazyColorsAudio.playButton();
          onPause();
        }}
        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 shadow-lg backdrop-blur-md text-white transition-all focus:outline-none"
        aria-label="Pause Game"
      >
        <Pause className="w-5 h-5 text-amber-300 drop-shadow-[0_0_8px_rgba(255,216,0,0.5)] fill-amber-300/40" />
      </button>

      {/* 4. [ SOUND ] BUTTON */}
      <button
        id="crazy-colors-hud-sound-btn"
        type="button"
        onClick={() => {
          onToggleSound();
        }}
        className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl active:scale-95 border shadow-lg backdrop-blur-md transition-all focus:outline-none ${
          soundEnabled
            ? 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400/40 text-cyan-300'
            : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/40'
        }`}
        aria-label={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
      >
        {soundEnabled ? (
          <Volume2 className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,217,255,0.6)]" />
        ) : (
          <VolumeX className="w-5 h-5 text-white/40" />
        )}
      </button>
    </header>
  );
};
