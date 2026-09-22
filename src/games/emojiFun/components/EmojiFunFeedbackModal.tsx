/**
 * Emoji Fun — Feedback & Level Clear Modals
 * Replicates the exact coral/salmon-red card, yellow smiley, and cyan pill buttons from reference video
 */

import React from 'react';
import { TournamentScoreCalculation } from '../types';
import { X, Trophy, Flame, Coins, Clock, ArrowRight, RotateCcw } from 'lucide-react';
import { emojiAudio } from '../emojiAudio';

interface EmojiFunFeedbackModalProps {
  type: 'CORRECT' | 'INCORRECT' | 'TIME_OUT' | 'NO_LIVES' | 'LEVEL_CLEAR';
  scoreResult?: TournamentScoreCalculation;
  correctAnswerText?: string;
  coinsEarned?: number;
  timeSpentFormatted?: string;
  accuracyPercent?: number;
  levelScore?: number;
  totalTournamentScore?: number;
  perfectCount?: number;
  bestCombo?: number;
  hintsUsed?: number;
  userRank?: number;
  onContinue: () => void;
  onRetry?: () => void;
  onLeaderboard?: () => void;
  onClose?: () => void;
}

export const EmojiFunFeedbackModal: React.FC<EmojiFunFeedbackModalProps> = ({
  type,
  scoreResult,
  correctAnswerText,
  coinsEarned = 10,
  timeSpentFormatted = '00:01:15',
  accuracyPercent = 100,
  levelScore = 0,
  totalTournamentScore = 0,
  perfectCount = 0,
  bestCombo = 1,
  hintsUsed = 0,
  userRank = 1,
  onContinue,
  onRetry,
  onLeaderboard,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      {/* The Coral/Salmon-Red Rounded Card Container (From Reference Video!) */}
      <div className="relative w-full max-w-xs sm:max-w-sm rounded-3xl bg-gradient-to-b from-[#f87171] via-[#fb7185] to-[#f43f5e] p-5 sm:p-6 shadow-2xl border-4 border-white/60 text-white flex flex-col items-center animate-in zoom-in-95 duration-200">
        {/* Red Circle 'X' Close Button in Top-Right (From Reference Video!) */}
        {onClose && (
          <button
            onClick={() => {
              emojiAudio.playTap();
              onClose();
            }}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 border-2 border-white shadow-md flex items-center justify-center text-white z-20"
            aria-label="Close"
          >
            <X className="w-5 h-5 font-black" />
          </button>
        )}

        {/* 1. CORRECT ANSWER MODAL (Sunglasses or Starry Smiley) */}
        {type === 'CORRECT' && (
          <>
            {/* Top Smiley Avatar (Yellow Circle with Sunglasses) */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#ffe082] to-[#ffca28] border-4 border-white shadow-lg flex items-center justify-center text-5xl mb-3 animate-bounce">
              {scoreResult?.isPerfect ? '🤩' : '😎'}
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-center font-['Fredoka',sans-serif] tracking-wide mb-1 text-white drop-shadow">
              {scoreResult?.isPerfect ? 'PERFECT!' : 'You are doing great!'}
            </h3>

            {/* Score Breakdown (Tournament Skill Details) */}
            {scoreResult && (
              <div className="w-full bg-white/20 backdrop-blur-md rounded-2xl p-2.5 my-3 border border-white/40 text-center text-xs sm:text-sm">
                <div className="flex items-center justify-between font-bold py-0.5 border-b border-white/20">
                  <span className="text-white/80">Base Score</span>
                  <span className="font-mono">+{scoreResult.basePoints}</span>
                </div>
                <div className="flex items-center justify-between font-bold py-0.5 border-b border-white/20">
                  <span className="text-white/80">Speed Bonus</span>
                  <span className="text-emerald-200 font-mono">
                    +{scoreResult.speedBonusPercent}% ({scoreResult.speedTier})
                  </span>
                </div>
                {scoreResult.comboCount > 1 && (
                  <div className="flex items-center justify-between font-bold py-0.5 border-b border-white/20 text-amber-200">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-300" /> Combo Multiplier
                    </span>
                    <span className="font-mono">x{scoreResult.comboMultiplier}</span>
                  </div>
                )}
                {scoreResult.isPerfect && (
                  <div className="flex items-center justify-between font-bold py-0.5 border-b border-white/20 text-yellow-200">
                    <span>⭐ Perfect Bonus</span>
                    <span className="font-mono">+{scoreResult.perfectBonusPoints}</span>
                  </div>
                )}
                <div className="flex items-center justify-between font-black text-sm sm:text-base pt-1 text-yellow-300">
                  <span>POINTS WON</span>
                  <span className="font-mono">+{scoreResult.totalPointsAwarded} pts</span>
                </div>
              </div>
            )}

            {/* Glossy Cyan Pill Button: Continue (Directly from Video!) */}
            <button
              onClick={() => {
                emojiAudio.playTap();
                onContinue();
              }}
              className="w-full mt-2 py-3 px-6 rounded-2xl bg-gradient-to-b from-[#4fc3f7] via-[#29b6f6] to-[#0288d1] border-b-[5px] border-[#01579b] active:border-b-2 active:translate-y-1 text-white font-black text-xl tracking-wider uppercase font-['Fredoka',sans-serif] shadow-xl hover:brightness-105 transition-all"
            >
              Continue
            </button>
          </>
        )}

        {/* 2. INCORRECT ANSWER MODAL (Neutral / Thinking Smiley) */}
        {(type === 'INCORRECT' || type === 'TIME_OUT') && (
          <>
            {/* Top Smiley Avatar: Neutral Face 😐 */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#ffe082] to-[#ffca28] border-4 border-white shadow-lg flex items-center justify-center text-5xl mb-3">
              😐
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-center font-['Fredoka',sans-serif] tracking-wide mb-1 text-white drop-shadow">
              {type === 'TIME_OUT' ? "Time's Up!" : 'Incorrect answer!'}
            </h3>

            <p className="text-sm font-bold text-center text-white/90 mb-2">
              Don't give up, keep trying!
            </p>

            {correctAnswerText && (
              <div className="w-full bg-black/20 rounded-2xl p-2.5 my-2 text-center">
                <span className="text-[11px] font-bold uppercase text-amber-200 block">
                  Correct Answer:
                </span>
                <span className="text-sm font-black text-white">{correctAnswerText}</span>
              </div>
            )}

            {/* Glossy Cyan Pill Button: OK */}
            <button
              onClick={() => {
                emojiAudio.playTap();
                onContinue();
              }}
              className="w-full mt-2 py-3 px-6 rounded-2xl bg-gradient-to-b from-[#4fc3f7] via-[#29b6f6] to-[#0288d1] border-b-[5px] border-[#01579b] active:border-b-2 active:translate-y-1 text-white font-black text-xl tracking-wider uppercase font-['Fredoka',sans-serif] shadow-xl hover:brightness-105 transition-all"
            >
              OK
            </button>
          </>
        )}

        {/* 3. NO LIVES MODAL */}
        {type === 'NO_LIVES' && (
          <>
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#f87171] to-[#dc2626] border-4 border-white shadow-lg flex items-center justify-center text-5xl mb-3 animate-pulse">
              💔
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-center font-['Fredoka',sans-serif] tracking-wide mb-1 text-white drop-shadow">
              No Lives
            </h3>

            <p className="text-sm font-bold text-center text-white/90 mb-3">
              You ran out of lives on this level. Refill or try again!
            </p>

            <div className="w-full flex flex-col gap-2.5">
              {onRetry && (
                <button
                  onClick={() => {
                    emojiAudio.playTap();
                    onRetry();
                  }}
                  className="w-full py-3 px-6 rounded-2xl bg-gradient-to-b from-[#ffd54f] via-[#ffca28] to-[#ffb300] border-b-[5px] border-[#e65100] active:border-b-2 active:translate-y-1 text-[#4e2700] font-black text-lg tracking-wider uppercase font-['Fredoka',sans-serif] shadow-xl hover:brightness-105 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Try Level Again</span>
                </button>
              )}

              <button
                onClick={() => {
                  emojiAudio.playTap();
                  onContinue();
                }}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-b from-[#4fc3f7] via-[#29b6f6] to-[#0288d1] border-b-[5px] border-[#01579b] active:border-b-2 active:translate-y-1 text-white font-black text-lg tracking-wider uppercase font-['Fredoka',sans-serif] shadow-xl hover:brightness-105 transition-all"
              >
                Back to Menu
              </button>
            </div>
          </>
        )}

        {/* 4. LEVEL CLEAR MODAL (From Video: LEVEL CLEAR! Coins 10, Time, Next) */}
        {type === 'LEVEL_CLEAR' && (
          <>
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#ffe082] to-[#ffca28] border-4 border-white shadow-lg flex items-center justify-center text-5xl mb-2 animate-bounce">
              🤩
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-center font-['Fredoka',sans-serif] tracking-wider mb-2 text-white drop-shadow">
              LEVEL CLEAR!
            </h3>

            {/* Stats Box (Matching Video Pill Rows) */}
            <div className="w-full bg-white/20 backdrop-blur-md rounded-2xl p-3 my-2 border border-white/40 space-y-1.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between bg-white/20 px-3 py-1.5 rounded-xl font-bold">
                <span className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-300" /> Gold Earned
                </span>
                <span className="font-mono text-amber-300 font-black">+{coinsEarned}</span>
              </div>

              <div className="flex items-center justify-between bg-white/20 px-3 py-1.5 rounded-xl font-bold">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-sky-200" /> Time
                </span>
                <span className="font-mono text-white font-black">{timeSpentFormatted}</span>
              </div>

              <div className="flex items-center justify-between bg-white/20 px-3 py-1.5 rounded-xl font-bold">
                <span className="text-white/90">Level Score</span>
                <span className="font-mono text-yellow-200 font-black">
                  +{levelScore.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between bg-white/20 px-3 py-1.5 rounded-xl font-bold">
                <span className="text-white/90">Total Tournament Score</span>
                <span className="font-mono text-amber-300 font-black">
                  {totalTournamentScore.toLocaleString()} pts
                </span>
              </div>

              <div className="flex items-center justify-between bg-white/20 px-3 py-1.5 rounded-xl font-bold">
                <span className="text-white/90">Accuracy</span>
                <span className="font-mono text-emerald-200 font-black">{accuracyPercent}%</span>
              </div>

              <div className="flex items-center justify-between bg-white/20 px-3 py-1.5 rounded-xl font-bold">
                <span className="text-white/90">Tournament Rank</span>
                <span className="font-mono text-purple-200 font-black">#{userRank}</span>
              </div>
            </div>

            {/* Action Buttons: NEXT LEVEL & LEADERBOARD */}
            <div className="w-full flex flex-col gap-2 mt-2">
              <button
                onClick={() => {
                  emojiAudio.playTap();
                  onContinue();
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-b from-[#4fc3f7] via-[#29b6f6] to-[#0288d1] border-b-[5px] border-[#01579b] active:border-b-2 active:translate-y-1 text-white font-black text-xl tracking-wider uppercase font-['Fredoka',sans-serif] shadow-xl hover:brightness-105 transition-all flex items-center justify-center gap-2"
              >
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {onLeaderboard && (
                <button
                  onClick={() => {
                    emojiAudio.playTap();
                    onLeaderboard();
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white/25 hover:bg-white/35 active:scale-98 text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 border border-white/40"
                >
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span>View Tournament Leaderboard</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
