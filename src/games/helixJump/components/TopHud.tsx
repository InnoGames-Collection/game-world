/**
 * Helix Jump Top HUD Component
 * [ BACK ] [ SCORE ] [ PAUSE ] [ SOUND ] button-style layout with >= 48dp touch targets
 * and level progress tracker bar as seen in the reference video.
 */

import React from 'react';
import { ArrowLeft, Pause, Volume2, VolumeX } from 'lucide-react';
import { helixAudio } from '../audioEngine';

interface TopHudProps {
  score: number;
  levelId: number;
  soundEnabled: boolean;
  progressPercent: number; // 0 to 100% of current level rings passed
  onBack: () => void;
  onPause: () => void;
  onToggleSound: () => void;
}

export const TopHud: React.FC<TopHudProps> = ({
  score,
  levelId,
  soundEnabled,
  progressPercent,
  onBack,
  onPause,
  onToggleSound,
}) => {
  return (
    <header
      id="helix-top-hud"
      className="absolute top-0 left-0 right-0 z-30 flex flex-col items-center pointer-events-none pt-[max(0.75rem,env(safe-area-inset-top))] px-3 pb-2 select-none"
    >
      {/* 1. Mandatory Four Top Buttons: [ BACK ] [ SCORE ] [ PAUSE ] [ SOUND ] */}
      <div className="w-full max-w-md flex items-center justify-between pointer-events-auto gap-2">
        {/* BACK BUTTON (Min 48x48dp target) */}
        <button
          id="helix-btn-back"
          onClick={() => {
            helixAudio.playButtonClick();
            onBack();
          }}
          aria-label="Back to Level Select"
          className="w-12 h-12 rounded-2xl bg-white/90 hover:bg-white text-slate-800 shadow-lg shadow-black/10 border border-white/50 flex items-center justify-center transition-transform active:scale-90 cursor-pointer backdrop-blur-md"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* SCORE DISPLAY (Compact, high contrast, prominent pill) */}
        <div
          id="helix-hud-score"
          className="flex-1 max-w-[140px] h-12 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg shadow-black/10 border border-white/50 flex flex-col items-center justify-center px-3"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 leading-none">
            Score
          </span>
          <span className="text-xl font-black text-slate-900 tracking-tight leading-tight">
            {score.toLocaleString()}
          </span>
        </div>

        {/* RIGHT CONTROLS: PAUSE & SOUND */}
        <div className="flex items-center gap-2">
          {/* PAUSE BUTTON (Min 48x48dp target) */}
          <button
            id="helix-btn-pause"
            onClick={() => {
              helixAudio.playButtonClick();
              onPause();
            }}
            aria-label="Pause Game"
            className="w-12 h-12 rounded-2xl bg-white/90 hover:bg-white text-slate-800 shadow-lg shadow-black/10 border border-white/50 flex items-center justify-center transition-transform active:scale-90 cursor-pointer backdrop-blur-md"
          >
            <Pause className="w-5 h-5 fill-slate-800" />
          </button>

          {/* SOUND BUTTON (Min 48x48dp target) */}
          <button
            id="helix-btn-sound"
            onClick={() => {
              helixAudio.playButtonClick();
              onToggleSound();
            }}
            aria-label={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            className={`w-12 h-12 rounded-2xl shadow-lg border flex items-center justify-center transition-transform active:scale-90 cursor-pointer backdrop-blur-md ${
              soundEnabled
                ? 'bg-white/90 text-slate-800 border-white/50'
                : 'bg-rose-500 text-white border-rose-400'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <VolumeX className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Level Progress Tracker (Inspired by the Reference Video: e.g. 2 [=========●===] 3) */}
      <div className="w-full max-w-xs mt-3 flex items-center justify-between gap-3 px-2">
        <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white">
          {levelId}
        </div>

        {/* Progress bar track */}
        <div className="flex-1 h-3 rounded-full bg-black/20 backdrop-blur-sm p-0.5 relative overflow-hidden border border-white/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-150 ease-out"
            style={{ width: `${Math.min(100, Math.max(4, progressPercent))}%` }}
          />
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-700/80 text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white/80">
          {Math.min(40, levelId + 1)}
        </div>
      </div>
    </header>
  );
};
