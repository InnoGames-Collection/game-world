/**
 * Solitaire Top Game HUD
 * Required Top Controls:
 * [ BACK ] [ SCORE ] [ PAUSE ] [ SOUND ]
 * Features >= 44x44dp tactile touch targets, high contrast, and refined gold/emerald styling.
 */

import React from 'react';
import { ArrowLeft, Pause, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../audioEngine';

interface TopHUDProps {
  score: number;
  level: number;
  soundEnabled: boolean;
  onBack: () => void;
  onPause: () => void;
  onToggleSound: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  score,
  level,
  soundEnabled,
  onBack,
  onPause,
  onToggleSound,
}) => {
  return (
    <div className="relative z-30 w-full flex items-center justify-between px-3 py-2 bg-[#00381e]/85 backdrop-blur-md border-b border-[#006030] shadow-md select-none">
      {/* 1. BACK BUTTON (TOP LEFT) */}
      <button
        id="btn-solitaire-back"
        onClick={() => {
          soundManager.playButton();
          onBack();
        }}
        className="min-w-[44px] min-h-[44px] px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#1b5e20] to-[#0f3813] hover:from-[#2e7d32] hover:to-[#1b5e20] text-white font-black text-xs shadow-md border border-emerald-400/40 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        title="Return to Menu / Levels"
      >
        <ArrowLeft className="w-4 h-4 text-white" />
        <span className="hidden sm:inline">Back</span>
      </button>

      {/* 2. SCORE PILL (WARM GOLD / CREAM DISPLAY) */}
      <div className="flex items-center gap-2">
        {/* Level Indicator Badge */}
        <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/20 text-amber-300 text-[11px] font-black uppercase">
          Lvl {level}
        </div>

        {/* Score Pill */}
        <div
          id="solitaire-score-display"
          className="min-h-[40px] px-4 py-1.5 rounded-full bg-gradient-to-b from-[#fff9c4] via-[#fff59d] to-[#fbc02d] border-2 border-[#f57f17] shadow-md flex items-center gap-1.5 text-slate-900"
        >
          <span className="text-[10px] sm:text-xs font-black tracking-wider text-amber-950 uppercase">
            SCORE
          </span>
          <span className="text-sm sm:text-base font-black font-mono tracking-tight text-[#bf360c]">
            {score.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3. RIGHT BUTTONS: PAUSE & SOUND */}
      <div className="flex items-center gap-2">
        {/* Sound Toggle Button */}
        <button
          id="btn-solitaire-sound"
          onClick={() => {
            soundManager.playButton();
            onToggleSound();
          }}
          className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-gradient-to-b from-[#1b5e20] to-[#0f3813] hover:from-[#2e7d32] hover:to-[#1b5e20] text-white shadow-md border border-emerald-400/40 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-300" />
          ) : (
            <VolumeX className="w-4 h-4 text-rose-400" />
          )}
        </button>

        {/* Pause Button */}
        <button
          id="btn-solitaire-pause"
          onClick={() => {
            soundManager.playButton();
            onPause();
          }}
          className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-gradient-to-b from-[#1b5e20] to-[#0f3813] hover:from-[#2e7d32] hover:to-[#1b5e20] text-white shadow-md border border-emerald-400/40 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          title="Pause Game"
        >
          <Pause className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};
