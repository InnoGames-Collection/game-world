/**
 * Color Rush - Daily Challenge Modal (Chroma Blitz)
 */

import React from 'react';
import { 
  Calendar, 
  ArrowLeft, 
  Play, 
  Zap, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  Clock,
  Sparkles
} from 'lucide-react';
import { ColorRushProgression } from '../types';
import { getDailyChallengeConfig, getTodayDateString } from '../dailyChallenge';
import { ColorRushAudio } from '../colorRushAudio';

interface ColorRushDailyChallengeModalProps {
  progression: ColorRushProgression;
  onStartDaily: () => void;
  onBack: () => void;
}

export const ColorRushDailyChallengeModal: React.FC<ColorRushDailyChallengeModalProps> = ({
  progression,
  onStartDaily,
  onBack,
}) => {
  const todayStr = getTodayDateString();
  const dailyConfig = getDailyChallengeConfig(todayStr);
  const dailyStatus = progression.dailyChallenge;
  const isCompleted = dailyStatus && dailyStatus.date === todayStr && dailyStatus.completed;

  return (
    <div 
      className="relative w-full max-w-md mx-auto flex flex-col items-center select-none rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl min-h-[600px] font-['Plus_Jakarta_Sans',sans-serif] text-slate-100"
      style={{
        background: 'radial-gradient(circle at 50% 15%, #0d291e 0%, #05140e 50%, #010805 100%)',
      }}
    >
      {/* HEADER */}
      <div className="w-full bg-[#072118]/95 backdrop-blur-md px-4 py-3 border-b border-[#124231] flex items-center justify-between gap-2 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              ColorRushAudio.playTap();
              onBack();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700 flex items-center justify-center text-slate-300 transition-all cursor-pointer shrink-0"
            title="Back to Menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-white tracking-tight">
              Daily Challenge
            </h2>
          </div>
        </div>

        <div className="text-[11px] font-mono text-emerald-400 font-bold">
          {todayStr}
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-between p-5 z-10 space-y-4">
        
        {/* HERO CARD */}
        <div className="w-full rounded-2xl bg-gradient-to-b from-[#0e3b2b]/90 via-[#07241a]/90 to-[#02120c] border-2 border-emerald-500/50 p-5 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today's Tournament Modifier</span>
          </div>

          <h3 className="text-2xl font-black text-white tracking-tight mb-1">
            {dailyConfig.title}
          </h3>

          <p className="text-xs text-slate-300 mb-4 max-w-xs leading-relaxed">
            {dailyConfig.description}
          </p>

          {/* Metric Specifications */}
          <div className="grid grid-cols-3 gap-2 w-full mb-2">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[9px] text-slate-400 font-bold uppercase">Rounds</div>
              <div className="text-sm font-black font-mono text-cyan-400">{dailyConfig.rounds}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[9px] text-slate-400 font-bold uppercase">Colors</div>
              <div className="text-sm font-black font-mono text-emerald-400">{dailyConfig.optionCount} Grid</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[9px] text-slate-400 font-bold uppercase">Timer</div>
              <div className="text-sm font-black font-mono text-amber-400">{(dailyConfig.timeLimitMs / 1000).toFixed(1)}s</div>
            </div>
          </div>
        </div>

        {/* STATUS / PREVIOUS RESULT */}
        {isCompleted ? (
          <div className="w-full p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-black text-white">Daily Cleared!</div>
                <div className="text-[11px] text-emerald-300 font-mono">
                  Score: {dailyStatus.score} PTS • Streak: {dailyStatus.bestStreak}x
                </div>
              </div>
            </div>
            <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase">
              DONE
            </span>
          </div>
        ) : (
          <div className="w-full p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="text-xs text-slate-300 mb-1">
              Conquer today's challenge to earn tournament bonus points!
            </div>
            <div className="text-[10px] text-slate-400">
              New challenge refreshes every 24 hours at midnight.
            </div>
          </div>
        )}

        {/* CTA ACTIONS */}
        <div className="w-full space-y-2.5 pt-2">
          <button
            onClick={() => {
              ColorRushAudio.playTap();
              onStartDaily();
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>{isCompleted ? 'REPLAY DAILY CHALLENGE' : 'START DAILY CHALLENGE'}</span>
          </button>

          <button
            onClick={() => {
              ColorRushAudio.playTap();
              onBack();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Back to Menu
          </button>
        </div>

      </div>
    </div>
  );
};
