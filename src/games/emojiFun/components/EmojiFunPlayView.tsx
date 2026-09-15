/**
 * Emoji Fun — Active Gameplay View
 * Recreates the exact look, proportions, diamond dividers, 2x2 answer tiles, and feedback from reference video
 */

import React, { useState, useEffect, useRef } from 'react';
import { EmojiQuestion, EmojiLevelConfig } from '../types';
import { Flame, Sparkles } from 'lucide-react';
import { emojiAudio } from '../emojiAudio';

interface EmojiFunPlayViewProps {
  question: EmojiQuestion;
  levelConfig: EmojiLevelConfig;
  currentQuestionIndex: number; // 0-based
  totalQuestions: number;
  levelScore: number;
  comboCount: number;
  hintsUsedOnCurrentQuestion: number;
  eliminatedOptionIndices: number[]; // indices disabled by hint
  onSelectAnswer: (optionIndex: number, timeRemainingSeconds: number) => void;
  onTimeExpired: () => void;
}

export const EmojiFunPlayView: React.FC<EmojiFunPlayViewProps> = ({
  question,
  levelConfig,
  currentQuestionIndex,
  totalQuestions,
  levelScore,
  comboCount,
  eliminatedOptionIndices,
  onSelectAnswer,
  onTimeExpired,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(question.timeLimitSeconds);
  const [memoryRevealed, setMemoryRevealed] = useState<boolean>(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMemory = question.type === 'EMOJI_MEMORY' && !!question.memoryEmojis;

  // Reset timer on question change
  useEffect(() => {
    setTimeLeft(question.timeLimitSeconds);
    setSelectedIdx(null);

    // If memory question, reveal for 2.4 seconds then hide
    if (isMemory) {
      setMemoryRevealed(true);
      const memTimer = setTimeout(() => {
        setMemoryRevealed(false);
      }, 2400);
      return () => clearTimeout(memTimer);
    } else {
      setMemoryRevealed(false);
    }
  }, [question.id, question.timeLimitSeconds, isMemory]);

  // Main countdown timer interval
  useEffect(() => {
    // If memory is still being revealed, don't count down game timer yet
    if (isMemory && memoryRevealed) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onTimeExpired();
          return 0;
        }
        if (prev <= 4) {
          emojiAudio.playTick();
        }
        return Math.round((prev - 0.1) * 10) / 10;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [question.id, memoryRevealed, isMemory, onTimeExpired]);

  const handleChoose = (index: number) => {
    if (selectedIdx !== null || eliminatedOptionIndices.includes(index)) return;
    setSelectedIdx(index);
    if (timerRef.current) clearInterval(timerRef.current);
    onSelectAnswer(index, timeLeft);
  };

  // Timer bar calculation
  const timerPercent = Math.max(0, Math.min(100, (timeLeft / question.timeLimitSeconds) * 100));
  const timerColor =
    timerPercent > 50
      ? 'from-[#69f0ae] to-[#00e676]'
      : timerPercent > 25
      ? 'from-[#ffd54f] to-[#ffb300]'
      : 'from-[#ff5252] to-[#d50000]';

  // Check if options are long text phrases vs short words/emojis
  const hasLongOptions = question.options.some((opt) => opt.length > 14);

  return (
    <div className="relative w-full flex-1 flex flex-col justify-between items-center px-3 py-2 sm:px-4 sm:py-3 z-10 select-none overflow-hidden">
      {/* Question Title & Counter (e.g. "LEVEL 1  4/10" in stylized video font) */}
      <div className="w-full flex flex-col items-center">
        <h2
          className="text-2xl sm:text-3xl font-black text-white font-['Fredoka',sans-serif] tracking-wide text-center uppercase"
          style={{
            textShadow: '0 3px 6px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)',
          }}
        >
          {levelConfig.title}
        </h2>
        <span
          className="text-xl sm:text-2xl font-black text-white font-['Fredoka',sans-serif] tracking-widest mt-0.5"
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {currentQuestionIndex + 1}/{totalQuestions}
        </span>

        {/* Diamond Accent Line Divider (Straight from Reference Video!) */}
        <div className="w-full max-w-xs flex items-center justify-center my-2 opacity-80">
          <span className="text-white text-xs">◇</span>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-white/80 to-transparent mx-1" />
          <span className="text-white text-xs">◇</span>
        </div>

        {/* Visible Smooth Countdown Timer Bar & Numerical Display */}
        <div className="w-full max-w-xs flex items-center gap-2 px-1">
          <div className="flex-1 h-3.5 bg-white/40 rounded-full p-0.5 shadow-inner backdrop-blur-sm overflow-hidden border border-white/60">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${timerColor} transition-all duration-100 ease-linear shadow`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
          <span
            className={`text-xs font-black min-w-[28px] text-right font-mono ${
              timeLeft <= 3 ? 'text-red-600 font-extrabold animate-ping' : 'text-slate-800'
            }`}
          >
            {Math.ceil(timeLeft)}s
          </span>
        </div>
      </div>

      {/* Center Stage: The Question Prompt & Emoji Puzzle Card */}
      <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center my-auto py-2">
        {/* Question Prompt */}
        <p className="text-sm sm:text-base font-extrabold text-slate-800 text-center px-4 mb-2 bg-white/60 backdrop-blur-sm py-1.5 rounded-2xl shadow-sm border border-white/80">
          {question.prompt}
        </p>

        {/* Big Animated Emoji Presentation Area */}
        <div className="relative min-h-[110px] sm:min-h-[130px] w-full flex items-center justify-center p-3 rounded-3xl bg-white/40 backdrop-blur-md border border-white/70 shadow-sm">
          {isMemory && memoryRevealed ? (
            <div className="flex flex-col items-center animate-in zoom-in duration-200">
              <span className="text-xs font-black text-purple-800 uppercase tracking-wider mb-1 bg-purple-100 px-3 py-0.5 rounded-full animate-pulse">
                👀 MEMORIZE NOW!
              </span>
              <div className="flex flex-wrap items-center justify-center gap-3 py-1">
                {question.memoryEmojis?.map((emo, idx) => (
                  <span
                    key={idx}
                    className="text-4xl sm:text-5xl filter drop-shadow-md animate-bounce"
                    style={{ animationDelay: `${idx * 120}ms`, animationDuration: '1.2s' }}
                  >
                    {emo}
                  </span>
                ))}
              </div>
            </div>
          ) : isMemory && !memoryRevealed ? (
            <div className="flex flex-col items-center py-2 animate-in fade-in">
              <span className="text-5xl sm:text-6xl filter drop-shadow animate-pulse">
                ❓
              </span>
              <span className="text-xs font-bold text-slate-700 mt-1">
                What emoji was in the group?
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-wrap gap-2 text-center">
              <span
                className="text-4xl sm:text-5xl font-black tracking-wide filter drop-shadow-md transition-transform hover:scale-105"
                style={{
                  lineHeight: '1.3',
                }}
              >
                {question.emojiDisplay}
              </span>
            </div>
          )}
        </div>

        {/* Diamond Accent Divider Below Emoji Puzzle */}
        <div className="w-full max-w-xs flex items-center justify-center my-2 opacity-80">
          <span className="text-white text-xs">◇</span>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-white/80 to-transparent mx-1" />
          <span className="text-white text-xs">◇</span>
        </div>
      </div>

      {/* Answer Options: 2x2 Grid or 4 Stacked Tiles */}
      <div
        className={`w-full max-w-sm ${
          hasLongOptions ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-2.5 sm:gap-3'
        } pb-2`}
      >
        {question.options.map((option, idx) => {
          const isEliminated = eliminatedOptionIndices.includes(idx);
          const isSelected = selectedIdx === idx;

          return (
            <button
              key={idx}
              onClick={() => handleChoose(idx)}
              disabled={isEliminated || selectedIdx !== null}
              className={`group relative flex items-center justify-center px-3 py-3 sm:py-3.5 rounded-2xl font-black text-center transition-all ${
                isEliminated
                  ? 'opacity-25 grayscale cursor-not-allowed bg-slate-200 border-b-2 border-slate-300 text-slate-400 line-through'
                  : isSelected
                  ? 'bg-amber-300 border-b-2 border-amber-600 translate-y-1 shadow-inner text-amber-950 scale-98'
                  : 'bg-gradient-to-b from-[#fff2b2] via-[#ffe082] to-[#ffd54f] border-b-[5px] border-[#e5a823] active:border-b-2 active:translate-y-1 shadow-lg hover:brightness-105 text-amber-950'
              }`}
            >
              <span
                className={`font-['Fredoka',sans-serif] tracking-wide leading-snug drop-shadow-sm ${
                  hasLongOptions ? 'text-sm sm:text-base font-bold' : 'text-lg sm:text-xl font-black'
                }`}
              >
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Status Ribbon: Q Progress, Level Score, Active Combo */}
      <div className="w-full max-w-sm flex items-center justify-between bg-white/70 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md border border-white/80 mt-1">
        {/* Level Score */}
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">LEVEL SCORE</span>
          <span className="text-base font-black text-amber-800 leading-tight font-mono">
            {levelScore.toLocaleString()}
          </span>
        </div>

        {/* Combo Badge */}
        {comboCount > 1 ? (
          <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-md animate-bounce">
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>COMBO x{comboCount}</span>
          </div>
        ) : (
          <div className="text-[11px] font-bold text-slate-500">
            Speed + Accuracy = High Score
          </div>
        )}
      </div>
    </div>
  );
};
