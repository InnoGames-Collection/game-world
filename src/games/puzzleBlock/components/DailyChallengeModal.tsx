/**
 * Daily Challenge Screen / Modal for Block (Puzzle Block)
 * Real date tracking, active goal presentation, and reward status.
 */

import React from 'react';
import { X, Calendar, Trophy, CheckCircle, Clock, Play } from 'lucide-react';
import { PuzzleBlockSaveData } from '../types';

interface DailyChallengeModalProps {
  saveData: PuzzleBlockSaveData;
  onStartChallenge: () => void;
  onClose: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  saveData,
  onStartChallenge,
  onClose,
}) => {
  const todayDateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isCompleted = saveData.dailyChallengeCompleted;
  const targetScore = 2500;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#6b2a12] via-[#4e1d0c] to-[#2c0d05] border-2 border-[#d97c38] shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)] p-6 flex flex-col items-center gap-4 text-amber-100 font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-300" />
            </div>
            <h2 className="text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow">
              DAILY QUEST
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-[#341107] border border-[#6e2e14] text-amber-300 flex items-center justify-center cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date & Refresh Timer */}
        <div className="w-full py-2 px-3 rounded-xl bg-[#240c06]/80 border border-[#8a3f20]/50 flex items-center justify-between text-xs">
          <span className="font-bold text-amber-200">{todayDateStr}</span>
          <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400/80">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Resets in 24h
          </span>
        </div>

        {/* Mission Card */}
        <div className="w-full p-4 rounded-2xl bg-[#240c06]/90 border border-[#8a3f20]/60 flex flex-col items-center text-center gap-3 shadow-inner">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-300" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#e89c62] tracking-wider block">
              TODAY'S OBJECTIVE
            </span>
            <span className="text-xl font-black text-amber-200 font-mono block mt-0.5">
              Score {targetScore.toLocaleString()} Points
            </span>
            <p className="text-xs text-amber-100/80 mt-1 leading-relaxed">
              Place shapes, make multi-line combo clears, and reach {targetScore.toLocaleString()} points on a fresh 10x10 board!
            </p>
          </div>

          {/* Status Indicator */}
          <div className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold ${
            isCompleted 
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
              : 'bg-amber-950/60 border-amber-600/60 text-amber-300'
          }`}>
            {isCompleted ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Completed For Today! Badge Claimed</span>
              </>
            ) : (
              <span>Challenge Available • 100% Empty 10x10 Board</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onStartChallenge}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 text-white font-black text-base shadow-lg border border-emerald-300 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer hover:brightness-110"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>{isCompleted ? 'PLAY CHALLENGE AGAIN' : 'START DAILY QUEST'}</span>
        </button>

        {/* Back */}
        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-b from-[#8a3f20] to-[#501c09] text-amber-200 font-bold text-xs border border-[#d97c38] shadow active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        >
          BACK TO MENU
        </button>
      </div>
    </div>
  );
};
