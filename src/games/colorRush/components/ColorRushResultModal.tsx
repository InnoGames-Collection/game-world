/**
 * Color Rush - Level Results & Rewards Modal
 * 
 * Displays:
 * - Pass/Fail/Perfect outcome
 * - 6-Metric Breakdown (Base, Speed, Streak, Difficulty, Level, Perfect)
 * - Level Score vs Previous Best
 * - Total Cumulative Career Score & Global Rank
 * - Animated Level X+1 Unlocked celebration
 * - NEXT LEVEL, REPLAY, MENU, LEADERBOARD actions
 */

import React, { useEffect } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  Play, 
  Home, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Flame, 
  LockOpen,
  ArrowRight
} from 'lucide-react';
import { LevelScoreBreakdown, ColorRushProgression } from '../types';
import { TOTAL_COLOR_RUSH_LEVELS } from '../levels';
import { ColorRushAudio } from '../colorRushAudio';

interface ColorRushResultModalProps {
  result: LevelScoreBreakdown;
  progression: ColorRushProgression;
  onNextLevel: () => void;
  onReplay: () => void;
  onMenu: () => void;
  onLeaderboard: () => void;
}

export const ColorRushResultModal: React.FC<ColorRushResultModalProps> = ({
  result,
  progression,
  onNextLevel,
  onReplay,
  onMenu,
  onLeaderboard,
}) => {
  const isPassed = result.isPassed;
  const isPerfect = result.isPerfect;
  const hasNextLevel = result.level < TOTAL_COLOR_RUSH_LEVELS;

  useEffect(() => {
    if (isPerfect) {
      ColorRushAudio.playPerfect();
    } else if (isPassed) {
      ColorRushAudio.playLevelComplete();
    } else {
      ColorRushAudio.playWrong();
    }
  }, [isPassed, isPerfect]);

  const estimatedRank = Math.max(
    1, 
    14850 - Math.min(14840, Math.round(result.newCumulativeScore * 1.8))
  );

  return (
    <div 
      className="absolute inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-5 text-center select-none overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
      style={{
        background: isPassed
          ? 'radial-gradient(circle at 50% 15%, #0d386b 0%, #051d3d 55%, #010c1c 100%)'
          : 'radial-gradient(circle at 50% 15%, #3b111a 0%, #1c080d 55%, #080204 100%)',
      }}
    >
      {/* 1. OUTCOME BANNER */}
      <div className="w-full flex flex-col items-center pt-2">
        {isPerfect ? (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border border-amber-400 text-amber-300 text-xs font-black uppercase tracking-widest mb-1 animate-pulse shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>PERFECT MATCH! 100% ACCURACY</span>
          </div>
        ) : isPassed ? (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>LEVEL {result.level} COMPLETED</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-400 text-xs font-black uppercase tracking-wider mb-1">
            <XCircle className="w-4 h-4" />
            <span>LEVEL FAILED (ACCURACY TOO LOW)</span>
          </div>
        )}

        {/* Level Score Hero */}
        <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight my-1 drop-shadow-md">
          {result.totalLevelScore.toLocaleString()}
        </div>
        <div className="text-[11px] text-slate-300 uppercase tracking-widest font-bold">
          LEVEL SCORE
        </div>

        {result.isNewBest && (
          <div className="mt-1 px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider animate-bounce">
            ★ NEW PERSONAL BEST! ★
          </div>
        )}
      </div>

      {/* 2. UNLOCKED REWARD BANNER (When passed and unlocked next level) */}
      {isPassed && hasNextLevel && (
        <div className="w-full max-w-xs my-2 p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-cyan-500/20 border-2 border-cyan-400/60 flex items-center justify-center gap-2 shadow-lg animate-in zoom-in-90">
          <LockOpen className="w-4 h-4 text-cyan-300 animate-bounce" />
          <span className="text-xs font-black text-cyan-200 uppercase tracking-wide">
            LEVEL {result.level + 1} UNLOCKED!
          </span>
        </div>
      )}

      {/* 3. SCORE BREAKDOWN MATRIX */}
      <div className="w-full max-w-xs grid grid-cols-2 gap-2 text-left my-2">
        {/* Base Points */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Base Hits (+1/ea)</div>
          <div className="text-sm font-black font-mono text-white">
            +{result.baseScore} PTS
          </div>
          <div className="text-[9px] text-slate-500 font-mono">
            {result.correctCount}/{result.totalRounds} ({result.accuracy}%)
          </div>
        </div>

        {/* Speed Bonus */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Speed Bonus</div>
          <div className="text-sm font-black font-mono text-cyan-400">
            +{result.speedBonus} PTS
          </div>
          <div className="text-[9px] text-slate-500 font-mono">
            Avg {result.avgReactionMs}ms
          </div>
        </div>

        {/* Streak Bonus */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Streak Bonus</div>
          <div className="text-sm font-black font-mono text-amber-400">
            +{result.streakBonus} PTS
          </div>
          <div className="text-[9px] text-slate-500 font-mono">
            Max {result.maxStreak}x streak
          </div>
        </div>

        {/* Difficulty + Perfect */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[9px] text-slate-400 uppercase font-bold">Difficulty & Perfect</div>
          <div className="text-sm font-black font-mono text-emerald-400">
            +{(result.difficultyBonus + result.levelBonus + result.perfectBonus)} PTS
          </div>
          <div className="text-[9px] text-slate-500 font-mono">
            {isPerfect ? 'Flawless match' : 'Tier bonus'}
          </div>
        </div>
      </div>

      {/* 4. CAREER TOTAL & GLOBAL RANK STANDING */}
      <div className="w-full max-w-xs p-3 rounded-2xl bg-gradient-to-r from-[#07244d] to-[#041938] border border-cyan-500/40 flex items-center justify-between shadow-md mb-2">
        <div className="text-left">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            Total Career Score
          </div>
          <div className="text-base font-black font-mono text-cyan-300">
            {result.newCumulativeScore.toLocaleString()} PTS
          </div>
        </div>

        <div className="text-right">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            Leaderboard Rank
          </div>
          <div className="text-base font-black font-mono text-amber-400">
            #{estimatedRank.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 5. ACTION BUTTONS */}
      <div className="w-full max-w-xs space-y-2 pt-1">
        {isPassed && hasNextLevel ? (
          <button
            id="color-rush-next-level-btn"
            onClick={() => {
              ColorRushAudio.playTap();
              onNextLevel();
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/30 transition-all cursor-pointer"
          >
            <span>NEXT LEVEL ({result.level + 1})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            id="color-rush-replay-btn"
            onClick={() => {
              ColorRushAudio.playTap();
              onReplay();
            }}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REPLAY</span>
          </button>

          <button
            id="color-rush-result-leaderboard-btn"
            onClick={() => {
              ColorRushAudio.playTap();
              onLeaderboard();
            }}
            className="flex-1 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>RANKS</span>
          </button>
        </div>

        <button
          id="color-rush-result-menu-btn"
          onClick={() => {
            ColorRushAudio.playTap();
            onMenu();
          }}
          className="w-full py-2 rounded-xl text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          Return to Menu
        </button>
      </div>
    </div>
  );
};
