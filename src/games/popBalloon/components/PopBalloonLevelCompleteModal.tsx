import React from 'react';
import { Trophy, ArrowRight, RotateCcw, Home, Sparkles, Star, ShieldCheck, Flame } from 'lucide-react';
import { LevelScoreBreakdown } from '../types';

interface PopBalloonLevelCompleteModalProps {
  result: LevelScoreBreakdown;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onMainMenu: () => void;
}

export const PopBalloonLevelCompleteModal: React.FC<PopBalloonLevelCompleteModalProps> = ({
  result,
  onNextLevel,
  onReplayLevel,
  onMainMenu,
}) => {
  return (
    <div
      id="pop-balloon-level-complete-modal"
      className="absolute inset-0 z-50 bg-[#070D1E]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-in fade-in zoom-in-95 font-['Plus_Jakarta_Sans',sans-serif] overflow-y-auto"
    >
      <div className="w-full max-w-sm bg-gradient-to-b from-[#101D3D] via-[#0D1836] to-[#080E24] border border-amber-400/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white relative overflow-hidden">
        {/* Top celebratory badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 mx-auto flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 mb-3 animate-bounce [animation-iteration-count:3]">
          <Trophy className="w-9 h-9 fill-slate-950" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
          STAGE {result.level} CLEARED!
        </h2>
        <p className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-4">
          Mastery & Precision
        </p>

        {result.nextLevelUnlocked && result.level < 40 && (
          <div className="mb-4 px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 font-black text-xs flex items-center justify-center gap-1.5 animate-pulse">
            <span>🔓 STAGE {result.level + 1} UNLOCKED!</span>
          </div>
        )}

        {result.isNewBest && (
          <div className="mb-3 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-xs flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEW STAGE PERSONAL BEST!</span>
          </div>
        )}

        {/* DETAILED SCORE BREAKDOWN CARD */}
        <div className="w-full bg-black/40 rounded-2xl p-3.5 mb-4 border border-white/10 text-left space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-sans font-bold text-slate-400">Balloons Popped</span>
            <span className="font-black text-white text-sm">{result.balloonsPopped}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-sans font-bold text-slate-400">Base Score (+1 each)</span>
            <span className="font-black text-blue-300">+{result.baseScore}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-sans font-bold text-slate-400">Combo Bonus</span>
            <span className="font-black text-rose-300">+{result.comboBonus}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-sans font-bold text-slate-400">Performance & Reflex</span>
            <span className="font-black text-cyan-300">+{result.performanceBonus}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-sans font-bold text-slate-400">Stage Multiplier Bonus</span>
            <span className="font-black text-purple-300">+{result.difficultyBonus}</span>
          </div>

          <div className="h-px bg-white/10 my-1" />

          <div className="flex items-center justify-between">
            <span className="font-sans font-black text-amber-300 text-sm uppercase">Stage Score</span>
            <span className="font-black text-amber-300 text-lg sm:text-xl font-mono">
              {result.levelScore.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5 text-slate-300">
            <span className="font-sans font-bold text-slate-400">Total Tournament Score</span>
            <span className="font-black text-white font-mono">{result.totalTournamentScore.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-sans font-bold text-slate-400">Global Rank</span>
            <span className="font-black text-amber-400 font-mono">#{result.globalRank.toLocaleString()}</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-2 w-full">
          {result.level < 40 ? (
            <button
              id="pop-balloon-modal-next-btn"
              type="button"
              onClick={onNextLevel}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 active:scale-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              <span>NEXT STAGE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="py-2 text-amber-300 font-black text-sm">
              👑 ALL 40 TOURNAMENT STAGES CLEARED!
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              id="pop-balloon-modal-replay-btn"
              type="button"
              onClick={onReplayLevel}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REPLAY</span>
            </button>
            <button
              id="pop-balloon-modal-menu-btn"
              type="button"
              onClick={onMainMenu}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/10"
            >
              <Home className="w-3.5 h-3.5" />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
