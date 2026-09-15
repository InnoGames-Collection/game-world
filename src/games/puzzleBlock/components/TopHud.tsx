/**
 * Top Gameplay HUD for Puzzle Block
 * Professional button-based controls: [ BACK ] [ SCORE ] [ PAUSE ] [ SOUND ]
 * Consistent height, corner radius, materials, and 44x44dp touch targets.
 */

import React from 'react';
import { ArrowLeft, Pause, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { LevelDefinition } from '../types';

interface TopHudProps {
  score: number;
  currentLevel: LevelDefinition;
  linesCleared: number;
  soundEnabled: boolean;
  onBack: () => void;
  onPause: () => void;
  onToggleSound: () => void;
  onOpenHelp: () => void;
}

export const TopHud: React.FC<TopHudProps> = ({
  score,
  currentLevel,
  linesCleared,
  soundEnabled,
  onBack,
  onPause,
  onToggleSound,
  onOpenHelp,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-3 pt-2 pb-1.5 flex flex-col gap-1.5 select-none z-30">
      {/* Primary 4-Button HUD Row: [ BACK ] [ SCORE ] [ PAUSE ] [ SOUND ] + HELP */}
      <div className="flex items-center justify-between gap-2 h-11">
        {/* 1. BACK BUTTON */}
        <button
          id="btn-puzzle-back"
          onClick={onBack}
          aria-label="Back to Level Select"
          className="h-11 min-w-[44px] px-3 rounded-xl bg-gradient-to-b from-[#8a3f20] via-[#6e2e14] to-[#4e1d0a] border border-[#d97c38]/80 text-amber-100 flex items-center justify-center shadow-[0_3px_6px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] active:translate-y-0.5 active:brightness-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-amber-200 stroke-[2.5]" />
        </button>

        {/* 2. SCORE PILL DISPLAY */}
        <div
          id="hud-puzzle-score"
          className="h-11 flex-1 px-3 rounded-xl bg-gradient-to-b from-[#4a180d] via-[#351008] to-[#240a04] border border-[#c2672b]/70 flex items-center justify-between shadow-[0_3px_6px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(0,0,0,0.8)]"
        >
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#e89c62]">SCORE</span>
            <span className="text-base font-black text-amber-300 font-mono tracking-tight leading-none">
              {score.toLocaleString()}
            </span>
          </div>
          {/* Objective icon / Target indicator */}
          <div className="flex flex-col items-end text-right">
            <span className="text-[9px] uppercase font-bold text-amber-400/80">TARGET</span>
            <span className="text-xs font-bold text-amber-100/90 font-mono leading-none">
              {currentLevel.targetScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 3. HELP / HOW TO PLAY BUTTON */}
        <button
          id="btn-puzzle-help"
          onClick={onOpenHelp}
          aria-label="How to Play"
          className="h-11 w-11 rounded-xl bg-gradient-to-b from-[#8a3f20] via-[#6e2e14] to-[#4e1d0a] border border-[#d97c38]/80 text-amber-200 flex items-center justify-center shadow-[0_3px_6px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] active:translate-y-0.5 active:brightness-95 transition-all cursor-pointer"
        >
          <HelpCircle className="w-5 h-5 text-amber-200 stroke-[2.5]" />
        </button>

        {/* 4. SOUND TOGGLE BUTTON */}
        <button
          id="btn-puzzle-sound"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          className="h-11 w-11 rounded-xl bg-gradient-to-b from-[#8a3f20] via-[#6e2e14] to-[#4e1d0a] border border-[#d97c38]/80 text-amber-200 flex items-center justify-center shadow-[0_3px_6px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] active:translate-y-0.5 active:brightness-95 transition-all cursor-pointer"
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-amber-300 stroke-[2.5]" />
          ) : (
            <VolumeX className="w-5 h-5 text-stone-400 stroke-[2.5]" />
          )}
        </button>

        {/* 5. PAUSE BUTTON */}
        <button
          id="btn-puzzle-pause"
          onClick={onPause}
          aria-label="Pause Game"
          className="h-11 w-11 rounded-xl bg-gradient-to-b from-[#8a3f20] via-[#6e2e14] to-[#4e1d0a] border border-[#d97c38]/80 text-amber-200 flex items-center justify-center shadow-[0_3px_6px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] active:translate-y-0.5 active:brightness-95 transition-all cursor-pointer"
        >
          <Pause className="w-5 h-5 text-amber-300 fill-amber-300/80 stroke-[2.5]" />
        </button>
      </div>

      {/* Level & Objective Progress Sub-Bar */}
      <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-[#3a140d]/60 border border-[#8a3f20]/40 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-amber-600/60 text-amber-200 font-bold text-[11px] uppercase tracking-wider border border-amber-500/40">
            LVL {currentLevel.id}
          </span>
          <span className="font-semibold text-amber-100/90 text-xs truncate max-w-[130px]">
            {currentLevel.title}
          </span>
        </div>

        {/* Progress Metric: Lines count or Score progress */}
        <div className="flex items-center gap-1.5 text-amber-300 text-xs font-mono font-bold">
          {currentLevel.targetLines ? (
            <span>LINES: {linesCleared} / {currentLevel.targetLines}</span>
          ) : (
            <span>{Math.min(100, Math.round((score / currentLevel.targetScore) * 100))}%</span>
          )}
        </div>
      </div>
    </div>
  );
};
