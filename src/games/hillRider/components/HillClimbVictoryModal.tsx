import React from 'react';
import { Trophy, Star, ArrowRight, RotateCcw, Grid, Home, Coins, CheckCircle, Clock } from 'lucide-react';
import { HillClimbLevelConfig } from '../types';

interface HillClimbVictoryModalProps {
  levelConfig: HillClimbLevelConfig;
  score: number;
  timeSeconds: number;
  stars: number;
  isNewBest: boolean;
  bestScore: number;
  unlockedNext: boolean;
  coinsEarned: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenLevels: () => void;
  onOpenMenu: () => void;
}

export const HillClimbVictoryModal: React.FC<HillClimbVictoryModalProps> = ({
  levelConfig,
  score,
  timeSeconds,
  stars,
  isNewBest,
  bestScore,
  unlockedNext,
  coinsEarned,
  onNextLevel,
  onReplay,
  onOpenLevels,
  onOpenMenu,
}) => {
  const hasNext = levelConfig.levelNumber < 40;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0e2744] via-[#071627] to-[#030b14] border-2 border-cyan-400/50 p-5 sm:p-6 text-white text-center shadow-[0_15px_50px_rgba(22,136,201,0.4)] overflow-hidden">
        {/* Victory Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#8BCB3D]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Victory Icon / Trophy Badge */}
        <div className="relative z-10 mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8BCB3D] to-[#1688C9] border-2 border-white/50 flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
          <Trophy className="w-9 h-9 text-white drop-shadow-md" />
        </div>

        {/* Title */}
        <div className="relative z-10 mt-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#8BCB3D]">
            STAGE CONQUERED • ደረጃውን አጠናቀዋል
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            LEVEL {levelConfig.levelNumber} COMPLETE!
          </h2>
          <div className="text-xs text-cyan-300 font-bold">{levelConfig.name}</div>
        </div>

        {/* Stars Display */}
        <div className="relative z-10 flex items-center justify-center gap-2 my-3.5">
          {[1, 2, 3].map((s) => (
            <div
              key={`star-result-${s}`}
              className={`p-2 rounded-2xl border transition-all ${
                s <= stars
                  ? 'bg-amber-400/20 border-amber-400 text-amber-400 scale-110 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                  : 'bg-slate-800/40 border-slate-700 text-slate-600'
              }`}
            >
              <Star className={`w-6 h-6 ${s <= stars ? 'fill-amber-400' : ''}`} />
            </div>
          ))}
        </div>

        {/* Score & Best */}
        <div className="relative z-10 p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 mb-3 space-y-2">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">SCORE ACHIEVED</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#8BCB3D]">
              {score} <span className="text-xs font-sans text-slate-400">PTS</span>
            </div>
            {isNewBest && (
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                ★ NEW BEST SCORE!
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{timeSeconds.toFixed(1)}s</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-amber-300 font-mono font-bold">
              <Coins className="w-3.5 h-3.5 fill-amber-400" />
              <span>+{coinsEarned} Gold</span>
            </div>
          </div>
        </div>

        {/* Unlocked Next Notification */}
        {unlockedNext && hasNext && (
          <div className="relative z-10 mb-3 py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/40 text-[11px] font-bold text-emerald-300 flex items-center justify-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Level {levelConfig.levelNumber + 1} Unlocked!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="relative z-10 space-y-2">
          {hasNext ? (
            <button
              type="button"
              onClick={onNextLevel}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#8BCB3D] to-[#6ca32e] hover:brightness-110 active:scale-95 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(139,203,61,0.4)] border-2 border-white/30 transition-all cursor-pointer"
            >
              <span>NEXT LEVEL ({levelConfig.levelNumber + 1})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="py-2.5 px-3 rounded-xl bg-amber-400/20 border border-amber-400 text-amber-300 font-black text-xs uppercase">
              🏆 ALL 40 LEVELS COMPLETED! MASTER OF THE MOUNTAIN!
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onReplay}
              className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-600 text-white font-bold text-xs uppercase flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RETRY</span>
            </button>

            <button
              type="button"
              onClick={onOpenLevels}
              className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-600 text-white font-bold text-xs uppercase flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5 text-cyan-400" />
              <span>LEVELS</span>
            </button>

            <button
              type="button"
              onClick={onOpenMenu}
              className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-600 text-white font-bold text-xs uppercase flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-slate-300" />
              <span>MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
