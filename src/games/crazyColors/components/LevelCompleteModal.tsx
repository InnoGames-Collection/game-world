/**
 * Crazy Colors Level Complete Modal
 * Displays 1-5 animated stars, final score, next unlocked level, and Grandmaster victory screen.
 */

import React from 'react';
import { ArrowRight, RotateCcw, Grid, Star, Trophy, Sparkles, Award } from 'lucide-react';
import { crazyColorsAudio } from '../audioEngine';

interface LevelCompleteModalProps {
  levelId: number;
  score: number;
  bestScore: number;
  starsEarned: number; // 1 to 5
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
  const isFinalLevel = levelId === 40;
  const isNewBest = score >= bestScore;

  return (
    <div
      id="crazy-colors-level-complete-modal"
      className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white select-none animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xs bg-[#242424] border border-yellow-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(255,216,0,0.3)] flex flex-col items-center text-center">
        {/* Celebration Trophy / Crown */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-yellow-500/20 via-amber-500/20 to-pink-500/20 border border-yellow-500/50 flex items-center justify-center mb-3 text-yellow-400 drop-shadow-[0_0_16px_rgba(255,216,0,0.8)] animate-bounce">
          {isFinalLevel ? <Award className="w-9 h-9" /> : <Trophy className="w-8 h-8" />}
        </div>

        {/* Title */}
        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
          LEVEL {levelId} CLEARED
        </span>

        <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-white mt-0.5 drop-shadow-[0_0_12px_rgba(255,216,0,0.5)]">
          {isFinalLevel ? 'GRANDMASTER!' : 'FANTASTIC!'}
        </h2>

        {isFinalLevel ? (
          <p className="text-xs font-bold text-yellow-300/90 mt-1 mb-4">
            🏆 You conquered all 40 levels of Crazy Colors!
          </p>
        ) : (
          <p className="text-xs text-white/60 mt-1 mb-4">Course safely navigated</p>
        )}

        {/* 1 to 5 Stars Showcase */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {[1, 2, 3, 4, 5].map((starIndex) => {
            const hasStar = starIndex <= starsEarned;
            return (
              <div
                key={starIndex}
                className={`transition-all duration-300 transform ${
                  hasStar ? 'scale-110' : 'scale-90 opacity-40'
                }`}
              >
                <Star
                  className={`w-7 h-7 ${
                    hasStar
                      ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(255,216,0,0.9)]'
                      : 'text-white/20'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Score Breakdown Card */}
        <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-3.5 mb-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white/60">LEVEL SCORE</span>
            <span className="font-black text-lg text-white font-mono">{score.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
            <span className="font-semibold text-white/60 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              BEST RECORD
            </span>
            <span className="font-bold text-sm text-yellow-300 font-mono">
              {bestScore.toLocaleString()}
            </span>
          </div>

          {isNewBest && (
            <div className="text-[10px] font-black text-center text-emerald-400 uppercase tracking-widest pt-1">
              ★ NEW PERSONAL BEST! ★
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Next Level Button (if not 40) */}
          {!isFinalLevel && (
            <button
              id="crazy-colors-complete-next-btn"
              type="button"
              onClick={() => {
                crazyColorsAudio.playButton();
                onNextLevel();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF008C] via-[#7A00FF] to-[#00D9FF] text-white font-black text-base tracking-wider shadow-[0_0_20px_rgba(0,217,255,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>NEXT LEVEL {levelId + 1}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          {/* Replay */}
          <button
            id="crazy-colors-complete-replay-btn"
            type="button"
            onClick={() => {
              crazyColorsAudio.playButton();
              onReplay();
            }}
            className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-semibold text-sm border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-amber-300" />
            <span>REPLAY LEVEL</span>
          </button>

          {/* Levels Grid */}
          <button
            id="crazy-colors-complete-levels-btn"
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
        </div>
      </div>
    </div>
  );
};
