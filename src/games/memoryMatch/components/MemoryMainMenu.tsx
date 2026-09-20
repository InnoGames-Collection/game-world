import React from 'react';
import { 
  Play, 
  Grid3X3, 
  Calendar, 
  HelpCircle, 
  Award, 
  BarChart3, 
  Settings, 
  Info, 
  ArrowLeft,
  Trophy,
  Flame,
  Sparkles,
  Zap
} from 'lucide-react';
import { MemoryMenuView, MemoryMatchStorageData } from '../types';

interface MemoryMainMenuProps {
  storage: MemoryMatchStorageData;
  onNavigate: (view: MemoryMenuView) => void;
  onStartPlay: (level?: number) => void;
  onExit: () => void;
}

export const MemoryMainMenu: React.FC<MemoryMainMenuProps> = ({
  storage,
  onNavigate,
  onStartPlay,
  onExit,
}) => {
  const currentLevel = storage.currentLevel || 1;
  const completedCount = storage.levelsCompleted || 0;
  const cumulativeScore = storage.totalCumulativeScore || 0;

  // Calculate total stars earned out of 120 (40 levels * 3)
  const totalStars = Object.values(storage.stars || {}).reduce((acc: number, s) => acc + (Number(s) || 0), 0);

  return (
    <div className="w-full h-full flex flex-col justify-between items-center text-white px-3 py-4 sm:p-6 overflow-y-auto overscroll-contain select-none font-['Plus_Jakarta_Sans',sans-serif] max-w-md mx-auto">
      
      {/* Top Bar: Return to GoPlay portal */}
      <div className="w-full flex items-center justify-between shrink-0 mb-3">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Exit to Portal</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A7C45]/20 border border-[#0A7C45]/60 text-emerald-300 text-[11px] font-bold">
          <Zap className="w-3 h-3 text-[#FFD54F]" />
          <span>40 TOURNAMENT LEVELS</span>
        </div>
      </div>

      {/* Hero Branding Section */}
      <div className="flex flex-col items-center text-center my-auto py-2">
        {/* Animated Trophy Emblem */}
        <div className="relative mb-3">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#051828] via-[#0A7C45] to-[#00C853] p-0.5 shadow-[0_0_35px_rgba(0,200,83,0.35)] flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-[#071B2D] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-[#FFD54F] drop-shadow-[0_4px_12px_rgba(255,213,79,0.5)] animate-pulse" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#FFD54F] text-[#051828] shadow-md">
            <Flame className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase drop-shadow-md">
          MEMORY MATCH
        </h1>
        <p className="text-xs text-slate-300 max-w-xs mt-1 font-medium leading-relaxed">
          Elite Cognitive Recall Challenge • Speed, Accuracy & Perfect Memory
        </p>

        {/* Live Cumulative Tournament Stats Strip */}
        <div className="w-full grid grid-cols-3 gap-2 mt-4 bg-[#051424]/90 border border-[#0A7C45]/60 rounded-2xl p-2.5 shadow-xl">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">LEVEL</span>
            <span className="text-sm font-black font-mono text-emerald-400">
              {currentLevel} <span className="text-[10px] text-slate-500 font-normal">/ 40</span>
            </span>
          </div>
          <div className="flex flex-col items-center border-x border-white/10 px-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">TOTAL SCORE</span>
            <span className="text-sm font-black font-mono text-[#FFD54F]">
              {cumulativeScore.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">STARS</span>
            <span className="text-sm font-black font-mono text-amber-300">
              {totalStars} <span className="text-[10px] text-slate-500 font-normal">/ 120</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Menu Grid */}
      <div className="w-full flex flex-col gap-2 shrink-0 mt-2">
        {/* 1. PLAY (Primary Action - Continues Tournament) */}
        <button
          onClick={() => onStartPlay(currentLevel)}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#0A7C45] via-[#00C853] to-[#00E676] hover:brightness-110 active:scale-98 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#00C853]/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-emerald-400/40"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{completedCount > 0 ? `CONTINUE LEVEL ${currentLevel}` : 'PLAY GAME'}</span>
        </button>

        {/* 2x4 Grid of Feature Menu Options */}
        <div className="grid grid-cols-2 gap-2">
          {/* LEVELS */}
          <button
            onClick={() => onNavigate('LEVELS')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#071B2D]/85 hover:bg-[#071B2D] border border-white/10 hover:border-emerald-500/50 text-left transition-all cursor-pointer active:scale-97 shadow-md group"
          >
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25">
              <Grid3X3 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white uppercase tracking-wider">LEVELS</div>
              <div className="text-[10px] text-slate-400">All 40 Stages</div>
            </div>
          </button>

          {/* LEADERBOARD */}
          <button
            onClick={() => onNavigate('LEADERBOARD')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#071B2D]/85 hover:bg-[#071B2D] border border-amber-500/40 hover:border-amber-400 text-left transition-all cursor-pointer active:scale-97 shadow-md group"
          >
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 group-hover:bg-amber-500/30">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-300 uppercase tracking-wider">LEADERBOARD</div>
              <div className="text-[10px] text-slate-400">Top Rankings</div>
            </div>
          </button>

          {/* DAILY CHALLENGE */}
          <button
            onClick={() => onNavigate('DAILY')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#071B2D]/85 hover:bg-[#071B2D] border border-white/10 hover:border-amber-500/50 text-left transition-all cursor-pointer active:scale-97 shadow-md group"
          >
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white uppercase tracking-wider">DAILY</div>
              <div className="text-[10px] text-slate-400">Bonus Puzzle</div>
            </div>
          </button>

          {/* HOW TO PLAY */}
          <button
            onClick={() => onNavigate('HOW_TO_PLAY')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#071B2D]/85 hover:bg-[#071B2D] border border-white/10 hover:border-sky-500/50 text-left transition-all cursor-pointer active:scale-97 shadow-md group"
          >
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 group-hover:bg-sky-500/25">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white uppercase tracking-wider">HOW TO PLAY</div>
              <div className="text-[10px] text-slate-400">Rules & Scoring</div>
            </div>
          </button>

          {/* ACHIEVEMENTS */}
          <button
            onClick={() => onNavigate('ACHIEVEMENTS')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#071B2D]/85 hover:bg-[#071B2D] border border-white/10 hover:border-purple-500/50 text-left transition-all cursor-pointer active:scale-97 shadow-md group"
          >
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 group-hover:bg-purple-500/25">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white uppercase tracking-wider">ACHIEVE</div>
              <div className="text-[10px] text-slate-400">{storage.achievements?.length || 0} Badges</div>
            </div>
          </button>

          {/* STATISTICS */}
          <button
            onClick={() => onNavigate('STATS')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#071B2D]/85 hover:bg-[#071B2D] border border-white/10 hover:border-emerald-500/50 text-left transition-all cursor-pointer active:scale-97 shadow-md group"
          >
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white uppercase tracking-wider">STATISTICS</div>
              <div className="text-[10px] text-slate-400">Player Data</div>
            </div>
          </button>

          {/* SETTINGS */}
          <button
            onClick={() => onNavigate('SETTINGS')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#071B2D]/85 hover:bg-[#071B2D] border border-white/10 hover:border-slate-500/50 text-left transition-all cursor-pointer active:scale-97 shadow-md group"
          >
            <div className="p-2 rounded-xl bg-slate-500/15 text-slate-300 group-hover:bg-slate-500/25">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white uppercase tracking-wider">SETTINGS</div>
              <div className="text-[10px] text-slate-400">Sound & Reset</div>
            </div>
          </button>
        </div>

        {/* ABOUT (Compact bar at bottom) */}
        <button
          onClick={() => onNavigate('ABOUT')}
          className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-98 text-slate-400 hover:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>About & Competitive Tournament Info</span>
        </button>
      </div>

    </div>
  );
};
