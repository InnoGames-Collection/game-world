/**
 * Crazy Colors Game Over Modal
 * Triggered on fatal color collision or falling out of bounds.
 * Shows Level, Final Score, Best Score, and quick RETRY action.
 */

import React from 'react';
import { RotateCcw, Grid, Home, Trophy, AlertTriangle } from 'lucide-react';
import { crazyColorsAudio } from '../audioEngine';

interface GameOverModalProps {
  levelId: number;
  score: number;
  bestScore: number;
  totalCompetitiveScore?: number;
  onRetry: () => void;
  onOpenLevels: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  levelId,
  score,
  bestScore,
  totalCompetitiveScore,
  onRetry,
  onOpenLevels,
  onHome,
}) => {
  const isNewRecord = score > 0 && score >= bestScore;

  return (
    <div
      id="crazy-colors-gameover-modal"
      className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white select-none animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xs bg-[#242424] border border-red-500/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(255,0,140,0.3)] flex flex-col items-center text-center">
        {/* Warning Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-red-500/20 border border-pink-500/40 flex items-center justify-center mb-3 text-pink-400 drop-shadow-[0_0_12px_rgba(255,0,140,0.6)]">
          <AlertTriangle className="w-7 h-7" />
        </div>

        {/* Title */}
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-pink-400">
          LEVEL {levelId}
        </span>
        <h2 className="text-3xl font-black tracking-tight text-white mt-0.5 drop-shadow-[0_0_10px_rgba(255,0,140,0.5)]">
          GAME OVER
        </h2>
        <p className="text-xs text-white/50 mt-1 mb-5">Color mismatch or boundary breach</p>

        {/* Scores Board */}
        <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-3.5 mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white/60">YOUR SCORE</span>
            <span className="font-black text-lg text-white font-mono">{score.toLocaleString()}</span>
          </div>

          {totalCompetitiveScore !== undefined && (
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/10">
              <span className="font-semibold text-cyan-300/90 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                TOTAL COMPETITIVE
              </span>
              <span className="font-black text-sm text-cyan-300 font-mono">
                {totalCompetitiveScore.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/10">
            <span className="font-semibold text-white/60 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              LEVEL RECORD
            </span>
            <span className="font-bold text-sm text-yellow-300 font-mono">
              {bestScore.toLocaleString()}
            </span>
          </div>

          {isNewRecord && (
            <div className="text-[10px] font-black text-center text-emerald-400 uppercase tracking-widest pt-1">
              ★ NEW HIGH SCORE! ★
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Retry Button */}
          <button
            id="crazy-colors-gameover-retry-btn"
            type="button"
            onClick={() => {
              crazyColorsAudio.playButton();
              onRetry();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF008C] via-[#7A00FF] to-[#00D9FF] text-white font-black text-base tracking-wider shadow-[0_0_20px_rgba(255,0,140,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5 text-white" />
            <span>TRY AGAIN</span>
          </button>

          {/* Level Select */}
          <button
            id="crazy-colors-gameover-levels-btn"
            type="button"
            onClick={() => {
              crazyColorsAudio.playButton();
              onOpenLevels();
            }}
            className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-semibold text-sm border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Grid className="w-4 h-4 text-cyan-300" />
            <span>SELECT LEVEL</span>
          </button>

          {/* Menu */}
          <button
            id="crazy-colors-gameover-home-btn"
            type="button"
            onClick={() => {
              crazyColorsAudio.playButton();
              onHome();
            }}
            className="w-full py-2 px-4 text-xs font-bold text-white/40 hover:text-white/80 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Exit to Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
