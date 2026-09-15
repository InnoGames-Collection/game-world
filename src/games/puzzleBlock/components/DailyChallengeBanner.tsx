/**
 * Daily Challenge Banner / Modal for Puzzle Block
 */

import React from 'react';
import { Calendar, Clock, Trophy, X } from 'lucide-react';

interface DailyChallengeProps {
  score: number;
  completed: boolean;
  onDismiss: () => void;
  targetScore?: number;
}

export const DailyChallengeBanner: React.FC<DailyChallengeProps> = ({
  score,
  completed,
  onDismiss,
  targetScore = 2500,
}) => {
  const progress = Math.min(1, score / targetScore);

  return (
    <div className="w-full max-w-md mx-auto px-3 mb-1 animate-in slide-in-from-top-2 duration-200">
      <div className="relative rounded-xl bg-gradient-to-r from-[#5a210d] via-[#451808] to-[#300f05] border border-amber-500/70 p-2.5 shadow-md flex items-center justify-between gap-2 text-amber-100">
        
        {/* Left Icon */}
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center shrink-0">
          <Calendar className="w-4 h-4 text-amber-300" />
        </div>

        {/* Challenge Text & Progress */}
        <div className="flex-1 flex flex-col text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-300 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" /> DAILY CHALLENGE
            </span>
            <span className="text-[9px] text-amber-300/70 font-mono flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" /> 24h
            </span>
          </div>
          <span className="text-[11px] font-semibold text-amber-100/90 leading-tight">
            Score {targetScore.toLocaleString()} or more in a level
          </span>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-stone-900 overflow-hidden mt-1 border border-amber-900/60">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="w-6 h-6 rounded-full bg-[#3d160b] text-amber-300/80 flex items-center justify-center hover:text-amber-100 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
