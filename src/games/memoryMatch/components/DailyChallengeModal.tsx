import React from 'react';
import { ArrowLeft, Calendar, Play, Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
import { MemoryMatchStorageData } from '../types';

interface DailyChallengeModalProps {
  storage: MemoryMatchStorageData;
  onPlayDaily: () => void;
  onBack: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  storage,
  onPlayDaily,
  onBack,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isCompletedToday = storage.dailyLastCompletedDate === todayStr;

  return (
    <div className="w-full h-full flex flex-col text-white px-3 py-3 sm:p-5 overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif] max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Menu</span>
        </button>

        <span className="text-xs font-black text-white uppercase tracking-wider">DAILY CHALLENGE</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-center text-center py-4 space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#051828] via-amber-600 to-[#FFD54F] p-0.5 shadow-2xl flex items-center justify-center">
          <div className="w-full h-full rounded-[22px] bg-[#071B2D] flex items-center justify-center">
            <Calendar className="w-10 h-10 text-[#FFD54F] animate-pulse" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3" />
            <span>TODAY: {todayStr}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            THE DAILY LABYRINTH
          </h2>
          <p className="text-xs text-slate-300 max-w-xs mx-auto mt-1 leading-relaxed">
            Unique synchronized daily layout. Everyone plays the exact same card pool today.
          </p>
        </div>

        <div className="w-full bg-[#051424]/90 border border-amber-500/40 rounded-2xl p-3.5 max-w-xs space-y-2 text-left">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold">CARDS</span>
            <span className="text-white font-black font-mono">24 Cards (12 Pairs)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold">TIME LIMIT</span>
            <span className="text-white font-black font-mono">55 Seconds</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold">BONUS MULTIPLIER</span>
            <span className="text-[#FFD54F] font-black font-mono">1.35x Score</span>
          </div>
        </div>

        {isCompletedToday ? (
          <div className="w-full max-w-xs p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider">COMPLETED TODAY!</span>
          </div>
        ) : (
          <button
            onClick={onPlayDaily}
            className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-[#FFD54F] to-amber-500 hover:brightness-110 active:scale-98 text-[#071B2D] font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>PLAY TODAY'S PUZZLE</span>
          </button>
        )}
      </div>
    </div>
  );
};
