/**
 * EMOJI IQ — Feedback Modals
 * Recreates the exact popups from the reference video:
 * - Correct: Sunglasses face 😎 "You are doing great" [ Continue ]
 * - Incorrect: Neutral face 😐 "Incorrect answer! Don't give up, try again!" [ OK ]
 * - Time Out: ⏰ "Time's up! Think faster on the next one!" [ OK ]
 * - No Lives: 💔 "No Lives" modal with continue option
 * - Level Clear: 🤩 "LEVEL CLEAR!" celebration with stats and [ Next Level ]
 */

import React from 'react';
import { EMOJI_IQ_COLORS } from '../colors';
import { TournamentScoreCalculation, EmojiIqLevelConfig } from '../types';
import { Trophy, ArrowRight, RotateCcw, Home, Sparkles, Flame, CheckCircle, XCircle } from 'lucide-react';
import { emojiIqAudio } from '../emojiIqAudio';

export type FeedbackType = 'CORRECT' | 'INCORRECT' | 'TIME_OUT' | 'NO_LIVES' | 'LEVEL_CLEAR';

interface EmojiIqFeedbackModalProps {
  type: FeedbackType;
  levelConfig: EmojiIqLevelConfig;
  lastScoreCalc?: TournamentScoreCalculation | null;
  levelScore: number;
  totalScore: number;
  accuracy: number;
  bestCombo: number;
  perfectCount: number;
  coinsWon: number;
  remainingLives: number;
  explanation?: string;
  onAdvance: () => void;
  onOpenLeaderboard: () => void;
  onGoHome: () => void;
  onUseCoinsForLives: () => void;
  playerCoins: number;
}

export const EmojiIqFeedbackModal: React.FC<EmojiIqFeedbackModalProps> = ({
  type,
  levelConfig,
  lastScoreCalc,
  levelScore,
  totalScore,
  accuracy,
  bestCombo,
  perfectCount,
  coinsWon,
  remainingLives,
  explanation,
  onAdvance,
  onOpenLeaderboard,
  onGoHome,
  onUseCoinsForLives,
  playerCoins,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border-2"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor:
            type === 'CORRECT'
              ? EMOJI_IQ_COLORS.success
              : type === 'LEVEL_CLEAR'
              ? EMOJI_IQ_COLORS.primary
              : type === 'NO_LIVES'
              ? EMOJI_IQ_COLORS.error
              : 'rgba(108, 92, 231, 0.2)',
        }}
      >
        {/* 1. CORRECT MODAL (Reference Video: Sunglasses Face 😎) */}
        {type === 'CORRECT' && (
          <>
            <div className="text-6xl sm:text-7xl mb-2 filter drop-shadow-md animate-bounce">
              {lastScoreCalc?.isPerfect ? '🤩' : '😎'}
            </div>

            {lastScoreCalc?.isPerfect ? (
              <span
                className="px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-1 shadow-sm animate-pulse"
                style={{
                  backgroundColor: EMOJI_IQ_COLORS.accent,
                  color: EMOJI_IQ_COLORS.bgDark,
                }}
              >
                ⭐ PERFECT CALCULATION!
              </span>
            ) : (
              <span
                className="text-xs font-black tracking-widest uppercase mb-1"
                style={{ color: EMOJI_IQ_COLORS.success }}
              >
                EXACT LOGIC!
              </span>
            )}

            <h3
              className="text-2xl sm:text-3xl font-black font-['Fredoka',sans-serif] tracking-wide mb-1"
              style={{ color: EMOJI_IQ_COLORS.textPrimary }}
            >
              You are doing great!
            </h3>

            {/* Score pill */}
            {lastScoreCalc && (
              <div className="flex items-center gap-2 my-2 px-4 py-1.5 rounded-full bg-[#F7F5FF] border border-[#6C5CE7]/20">
                <span className="text-sm font-bold" style={{ color: EMOJI_IQ_COLORS.textSecondary }}>
                  Points:
                </span>
                <span className="text-lg font-black font-mono" style={{ color: EMOJI_IQ_COLORS.primary }}>
                  +{lastScoreCalc.totalPointsAwarded}
                </span>
                {lastScoreCalc.comboMultiplier > 1 && (
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: EMOJI_IQ_COLORS.accent, color: EMOJI_IQ_COLORS.bgDark }}
                  >
                    x{lastScoreCalc.comboMultiplier}
                  </span>
                )}
              </div>
            )}

            {explanation && (
              <p
                className="text-xs sm:text-sm font-medium my-2 px-2 leading-relaxed"
                style={{ color: EMOJI_IQ_COLORS.textSecondary }}
              >
                {explanation}
              </p>
            )}

            <button
              onClick={() => {
                emojiIqAudio.playPop();
                onAdvance();
              }}
              className="w-full mt-3 py-3.5 rounded-2xl text-white font-black text-lg shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: EMOJI_IQ_COLORS.success,
                boxShadow: '0 4px 14px rgba(32, 201, 151, 0.4)',
              }}
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* 2. INCORRECT MODAL (Reference Video: Neutral Face 😐) */}
        {type === 'INCORRECT' && (
          <>
            <div className="text-6xl sm:text-7xl mb-2 filter drop-shadow-md">😐</div>

            <span
              className="text-xs font-black tracking-widest uppercase mb-1"
              style={{ color: EMOJI_IQ_COLORS.error }}
            >
              CALCULATION MISMATCH
            </span>

            <h3
              className="text-xl sm:text-2xl font-black font-['Fredoka',sans-serif] tracking-wide mb-1"
              style={{ color: EMOJI_IQ_COLORS.textPrimary }}
            >
              Incorrect answer!
            </h3>

            <p
              className="text-sm font-bold mb-3"
              style={{ color: EMOJI_IQ_COLORS.textSecondary }}
            >
              Don't give up, try again!
            </p>

            {explanation && (
              <div className="w-full p-2.5 rounded-xl bg-[#F7F5FF] border border-[#6C5CE7]/15 text-xs text-left mb-3">
                <span className="font-bold text-[#6C5CE7]">Solution: </span>
                <span className="text-[#241F3D]">{explanation}</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs font-bold text-[#FF5A67] mb-3">
              <span>-1 Life</span>
              <span>•</span>
              <span>{remainingLives} remaining</span>
            </div>

            <button
              onClick={() => {
                emojiIqAudio.playPop();
                onAdvance();
              }}
              className="w-full py-3.5 rounded-2xl text-white font-black text-lg shadow-md hover:brightness-105 active:scale-95 transition-all"
              style={{
                backgroundColor: EMOJI_IQ_COLORS.primary,
                boxShadow: '0 4px 14px rgba(108, 92, 231, 0.4)',
              }}
            >
              OK
            </button>
          </>
        )}

        {/* 3. TIME OUT MODAL */}
        {type === 'TIME_OUT' && (
          <>
            <div className="text-6xl sm:text-7xl mb-2 filter drop-shadow-md">⏰</div>

            <span
              className="text-xs font-black tracking-widest uppercase mb-1"
              style={{ color: EMOJI_IQ_COLORS.error }}
            >
              TIME EXPIRED
            </span>

            <h3
              className="text-xl sm:text-2xl font-black font-['Fredoka',sans-serif] tracking-wide mb-1"
              style={{ color: EMOJI_IQ_COLORS.textPrimary }}
            >
              Time's up!
            </h3>

            <p
              className="text-sm font-bold mb-3"
              style={{ color: EMOJI_IQ_COLORS.textSecondary }}
            >
              Think faster on the next equation!
            </p>

            {explanation && (
              <div className="w-full p-2.5 rounded-xl bg-[#F7F5FF] border border-[#6C5CE7]/15 text-xs text-left mb-3">
                <span className="font-bold text-[#6C5CE7]">Solution: </span>
                <span className="text-[#241F3D]">{explanation}</span>
              </div>
            )}

            <button
              onClick={() => {
                emojiIqAudio.playPop();
                onAdvance();
              }}
              className="w-full py-3.5 rounded-2xl text-white font-black text-lg shadow-md hover:brightness-105 active:scale-95 transition-all"
              style={{
                backgroundColor: EMOJI_IQ_COLORS.primary,
                boxShadow: '0 4px 14px rgba(108, 92, 231, 0.4)',
              }}
            >
              OK
            </button>
          </>
        )}

        {/* 4. NO LIVES MODAL */}
        {type === 'NO_LIVES' && (
          <>
            <div className="text-6xl sm:text-7xl mb-2 filter drop-shadow-md animate-pulse">💔</div>

            <span
              className="text-xs font-black tracking-widest uppercase mb-1"
              style={{ color: EMOJI_IQ_COLORS.error }}
            >
              ALL LIVES DEPLETED
            </span>

            <h3
              className="text-2xl sm:text-3xl font-black font-['Fredoka',sans-serif] tracking-wide mb-2"
              style={{ color: EMOJI_IQ_COLORS.textPrimary }}
            >
              No Lives Left!
            </h3>

            <p
              className="text-xs sm:text-sm font-medium mb-4"
              style={{ color: EMOJI_IQ_COLORS.textSecondary }}
            >
              Replenish your hearts with tournament coins to continue this stage, or restart from the beginning!
            </p>

            <div className="w-full flex flex-col gap-2">
              <button
                onClick={() => {
                  emojiIqAudio.playPop();
                  onUseCoinsForLives();
                }}
                disabled={playerCoins < 30}
                className={`w-full py-3.5 rounded-2xl font-black text-base shadow-md flex items-center justify-center gap-2 transition-all ${
                  playerCoins >= 30
                    ? 'text-white hover:brightness-105 active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: playerCoins >= 30 ? EMOJI_IQ_COLORS.success : undefined,
                  boxShadow: playerCoins >= 30 ? '0 4px 14px rgba(32, 201, 151, 0.4)' : undefined,
                }}
              >
                <span>Continue (30 🪙)</span>
              </button>

              <button
                onClick={() => {
                  emojiIqAudio.playPop();
                  onAdvance();
                }}
                className="w-full py-3 rounded-2xl font-black text-sm border-2 transition-all hover:bg-slate-50"
                style={{
                  borderColor: 'rgba(108, 92, 231, 0.2)',
                  color: EMOJI_IQ_COLORS.textPrimary,
                }}
              >
                Restart Level
              </button>
            </div>
          </>
        )}

        {/* 5. LEVEL CLEAR CELEBRATION (Reference Video: Star-Struck Face 🤩) */}
        {type === 'LEVEL_CLEAR' && (
          <>
            <div className="text-6xl sm:text-7xl mb-1 filter drop-shadow-lg animate-bounce">🤩</div>

            <div className="flex items-center gap-1 my-1">
              <span className="text-2xl">🎉</span>
              <h3
                className="text-2xl sm:text-3xl font-black font-['Fredoka',sans-serif] tracking-wider uppercase"
                style={{ color: EMOJI_IQ_COLORS.primary }}
              >
                LEVEL CLEAR!
              </h3>
              <span className="text-2xl">🎉</span>
            </div>

            <p className="text-xs font-bold mb-3" style={{ color: EMOJI_IQ_COLORS.textSecondary }}>
              Stage {levelConfig.level}: {levelConfig.title}
            </p>

            {/* Performance Stats Grid */}
            <div className="w-full grid grid-cols-2 gap-2 my-2 text-left">
              <div className="bg-[#F7F5FF] p-2.5 rounded-2xl border border-[#6C5CE7]/15 flex flex-col">
                <span className="text-[10px] font-bold text-[#6B6780] uppercase">Stage Score</span>
                <span className="text-lg font-black font-mono text-[#6C5CE7]">
                  +{levelScore.toLocaleString()}
                </span>
              </div>

              <div className="bg-[#F7F5FF] p-2.5 rounded-2xl border border-[#6C5CE7]/15 flex flex-col">
                <span className="text-[10px] font-bold text-[#6B6780] uppercase">Total Tournament</span>
                <span className="text-lg font-black font-mono text-[#241F3D]">
                  {totalScore.toLocaleString()}
                </span>
              </div>

              <div className="bg-[#F7F5FF] p-2.5 rounded-2xl border border-[#6C5CE7]/15 flex flex-col">
                <span className="text-[10px] font-bold text-[#6B6780] uppercase">Accuracy</span>
                <span className="text-lg font-black font-mono text-[#20C997]">
                  {accuracy}%
                </span>
              </div>

              <div className="bg-[#F7F5FF] p-2.5 rounded-2xl border border-[#6C5CE7]/15 flex flex-col">
                <span className="text-[10px] font-bold text-[#6B6780] uppercase">Coins Earned</span>
                <span className="text-lg font-black font-mono text-[#FFB703] flex items-center gap-1">
                  +{coinsWon} 🪙
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2 mt-3">
              <button
                onClick={() => {
                  emojiIqAudio.playPop();
                  onAdvance();
                }}
                className="w-full py-3.5 rounded-2xl text-white font-black text-lg shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: EMOJI_IQ_COLORS.primary,
                  boxShadow: '0 4px 16px rgba(108, 92, 231, 0.4)',
                }}
              >
                <span>Next Level</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="w-full grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    emojiIqAudio.playPop();
                    onOpenLeaderboard();
                  }}
                  className="py-2.5 rounded-xl font-bold text-xs border flex items-center justify-center gap-1 bg-white hover:bg-slate-50 transition-all"
                  style={{
                    borderColor: 'rgba(108, 92, 231, 0.2)',
                    color: EMOJI_IQ_COLORS.textPrimary,
                  }}
                >
                  <Trophy className="w-3.5 h-3.5 text-[#FFB703]" />
                  <span>Leaderboard</span>
                </button>

                <button
                  onClick={() => {
                    emojiIqAudio.playPop();
                    onGoHome();
                  }}
                  className="py-2.5 rounded-xl font-bold text-xs border flex items-center justify-center gap-1 bg-white hover:bg-slate-50 transition-all"
                  style={{
                    borderColor: 'rgba(108, 92, 231, 0.2)',
                    color: EMOJI_IQ_COLORS.textPrimary,
                  }}
                >
                  <Home className="w-3.5 h-3.5 text-[#6C5CE7]" />
                  <span>Home</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
