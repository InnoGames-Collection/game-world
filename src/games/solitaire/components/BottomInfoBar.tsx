/**
 * Solitaire Bottom Information Bar
 * Replicates the authentic bottom bar from the reference video:
 * - Hamburger Menu button (opens side menu)
 * - TIME counter (mm:ss)
 * - BONUS counter (ticking bonus pool based on speed and moves)
 * - POINTS counter
 * - Undo & Hint buttons
 * - Circular "Next" button on the right
 */

import React from 'react';
import { Menu, RotateCcw, Lightbulb, ArrowRight } from 'lucide-react';
import { soundManager } from '../audioEngine';

interface BottomInfoBarProps {
  timeSeconds: number;
  bonus: number;
  points: number;
  moves: number;
  canUndo: boolean;
  onOpenMenu: () => void;
  onUndo: () => void;
  onHint: () => void;
  onNextLevel?: () => void;
  isNextAvailable?: boolean;
}

export const BottomInfoBar: React.FC<BottomInfoBarProps> = ({
  timeSeconds,
  bonus,
  points,
  moves,
  canUndo,
  onOpenMenu,
  onUndo,
  onHint,
  onNextLevel,
  isNextAvailable = false,
}) => {
  // Format seconds to mm:ss
  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="relative z-30 w-full bg-gradient-to-r from-[#1c110a] via-[#2d1b10] to-[#1c110a] border-t-2 border-[#5d4037] px-2 sm:px-4 py-2 shadow-2xl select-none">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1 sm:gap-4">
        {/* Left: Hamburger Menu Button */}
        <button
          id="btn-solitaire-menu"
          onClick={() => {
            soundManager.playButton();
            onOpenMenu();
          }}
          className="min-w-[40px] min-h-[40px] p-2 rounded-lg bg-gradient-to-b from-[#2e7d32] to-[#1b5e20] hover:from-[#388e3c] hover:to-[#2e7d32] text-white shadow-md border border-emerald-400/40 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        {/* Center: TIME, BONUS, POINTS, MOVES stats */}
        <div className="flex items-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-mono font-bold text-amber-200">
          {/* TIME */}
          <div className="flex flex-col sm:flex-row items-center sm:gap-1">
            <span className="text-[9px] sm:text-[10px] uppercase text-amber-400 font-sans tracking-wide">
              TIME
            </span>
            <span className="font-mono text-white text-xs">{timeFormatted}</span>
          </div>

          {/* BONUS */}
          <div className="flex flex-col sm:flex-row items-center sm:gap-1">
            <span className="text-[9px] sm:text-[10px] uppercase text-amber-400 font-sans tracking-wide">
              BONUS
            </span>
            <span className="font-mono text-amber-300 text-xs">{bonus}</span>
          </div>

          {/* POINTS */}
          <div className="flex flex-col sm:flex-row items-center sm:gap-1">
            <span className="text-[9px] sm:text-[10px] uppercase text-amber-400 font-sans tracking-wide">
              POINTS
            </span>
            <span className="font-mono text-emerald-300 text-xs">{points}</span>
          </div>

          {/* MOVES */}
          <div className="hidden xs:flex flex-col sm:flex-row items-center sm:gap-1">
            <span className="text-[9px] sm:text-[10px] uppercase text-amber-400 font-sans tracking-wide">
              MOVES
            </span>
            <span className="font-mono text-white text-xs">{moves}</span>
          </div>
        </div>

        {/* Right Tools: UNDO, HINT, NEXT */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Undo Button */}
          <button
            id="btn-solitaire-undo"
            onClick={() => {
              if (canUndo) {
                soundManager.playUndo();
                onUndo();
              } else {
                soundManager.playInvalid();
              }
            }}
            disabled={!canUndo}
            className={`min-w-[36px] min-h-[36px] p-2 rounded-lg border shadow flex items-center justify-center transition-all ${
              canUndo
                ? 'bg-gradient-to-b from-[#374151] to-[#1f2937] hover:from-[#4b5563] hover:to-[#374151] border-slate-500 text-amber-300 cursor-pointer active:scale-95'
                : 'bg-black/30 border-white/10 text-white/30 cursor-not-allowed'
            }`}
            title="Undo Move"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Hint Button */}
          <button
            id="btn-solitaire-hint"
            onClick={() => {
              soundManager.playButton();
              onHint();
            }}
            className="min-w-[36px] min-h-[36px] p-2 rounded-lg bg-gradient-to-b from-[#374151] to-[#1f2937] hover:from-[#4b5563] hover:to-[#374151] border border-amber-500/40 text-amber-400 shadow active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            title="Hint"
          >
            <Lightbulb className="w-4 h-4" />
          </button>

          {/* Circular Next Button (Seen in video at bottom right) */}
          {isNextAvailable && onNextLevel && (
            <button
              id="btn-solitaire-next"
              onClick={() => {
                soundManager.playButton();
                onNextLevel();
              }}
              className="min-w-[40px] min-h-[40px] px-2 rounded-full bg-gradient-to-b from-[#4caf50] to-[#2e7d32] border-2 border-emerald-300 shadow-lg flex items-center justify-center text-white active:scale-90 transition-transform animate-bounce cursor-pointer"
              title="Next Level"
            >
              <span className="text-[10px] font-black mr-0.5">Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
