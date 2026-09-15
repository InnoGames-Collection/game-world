/**
 * Helix Jump Level Complete Modal
 */

import React from 'react';
import { Play, RotateCcw, Grid, Star, Award } from 'lucide-react';
import { helixAudio } from '../audioEngine';

interface LevelCompleteModalProps {
  levelId: number;
  score: number;
  bestScore: number;
  starsEarned: number; // 1 to 3
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenLevels: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  levelId,
  score,
  bestScore,
  starsEarned,
  onNextLevel,
  onReplay,
  onOpenLevels,
}) => {
  return (
    <div
      id="helix-level-complete-modal"
      className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="w-full max-w-xs bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 border border-amber-400/40 shadow-2xl flex flex-col items-center text-center">
        {/* Trophy Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mb-3 animate-bounce">
          <Award className="w-9 h-9 stroke-[2.5]" />
        </div>

        <h2 className="text-2xl font-black text-white uppercase tracking-wider">
          Level Complete!
        </h2>
        <p className="text-xs font-bold text-amber-400 mb-3">
          Level {levelId} Conquered
        </p>

        {/* 1-3 Stars */}
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`w-7 h-7 transition-all duration-300 ${
                s <= starsEarned
                  ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                  : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Score & Best Score Grid */}
        <div className="w-full grid grid-cols-2 gap-2 bg-white/5 rounded-2xl p-3 mb-5 border border-white/10">
          <div>
            <div className="text-[10px] font-extrabold uppercase text-slate-400">Score</div>
            <div className="text-xl font-black text-white">{score}</div>
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase text-amber-400">Best</div>
            <div className="text-xl font-black text-amber-300">{bestScore}</div>
          </div>
        </div>

        {/* Unlocked notice */}
        {levelId < 40 && (
          <div className="text-xs font-bold text-emerald-400 mb-4">
            🔓 Level {levelId + 1} is now unlocked!
          </div>
        )}

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {levelId < 40 ? (
            <button
              onClick={() => {
                helixAudio.playButtonClick();
                onNextLevel();
              }}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Next Level {levelId + 1}</span>
            </button>
          ) : null}

          <button
            onClick={() => {
              helixAudio.playButtonClick();
              onReplay();
            }}
            className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform border border-white/10 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay</span>
          </button>

          <button
            onClick={() => {
              helixAudio.playButtonClick();
              onOpenLevels();
            }}
            className="w-full h-12 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-400 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            <span>Level Select</span>
          </button>
        </div>
      </div>
    </div>
  );
};
