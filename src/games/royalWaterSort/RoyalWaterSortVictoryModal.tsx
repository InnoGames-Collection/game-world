import React from 'react';
import { 
  Trophy, 
  Star, 
  ArrowRight, 
  RotateCcw, 
  Trophy as TrophyIcon,
  Crown, 
  Coins, 
  Clock, 
  Zap, 
  ListOrdered 
} from 'lucide-react';
import { LevelScoreBreakdown, LevelConfig } from './types';

interface RoyalWaterSortVictoryModalProps {
  isOpen: boolean;
  levelConfig: LevelConfig;
  scoreBreakdown: LevelScoreBreakdown | null;
  totalLevels: number;
  rewardCoins: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenLevels: () => void;
  onOpenLeaderboard: () => void;
}

export const RoyalWaterSortVictoryModal: React.FC<RoyalWaterSortVictoryModalProps> = ({
  isOpen,
  levelConfig,
  scoreBreakdown,
  totalLevels,
  rewardCoins,
  onNextLevel,
  onReplay,
  onOpenLevels,
  onOpenLeaderboard,
}) => {
  if (!isOpen) return null;

  const baseScore = levelConfig.baseScore ?? 500;
  const effectiveBreakdown: LevelScoreBreakdown = scoreBreakdown || {
    levelNum: levelConfig.levelNum,
    baseScore,
    timeBonus: 0,
    moveBonus: 0,
    hintPenalty: 0,
    extraTubePenalty: 0,
    invalidPenalty: 0,
    finalScore: baseScore,
    isNewBest: false,
    cumulativeTotalScore: baseScore,
    moves: levelConfig.parMoves,
    parMoves: levelConfig.parMoves,
    timeSeconds: 0,
    stars: 3,
  };

  const isFinalLevel = levelConfig.levelNum >= totalLevels;

  return (
    <div className="fixed inset-0 z-50 bg-[#060D20]/90 backdrop-blur-md flex flex-col justify-center items-center p-4 sm:p-6 select-none overflow-y-auto font-sans">
      <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto rounded-3xl bg-gradient-to-b from-[#0F2044] via-[#0A1633] to-[#060E24] border-2 border-amber-400/40 p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] space-y-4 text-center animate-in zoom-in-95 duration-200">
        
        {/* Crown Badge & Celebration Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-[0_0_35px_rgba(245,158,11,0.5)] animate-bounce">
            <div className="w-full h-full rounded-[22px] bg-[#0A1633] flex items-center justify-center text-amber-400">
              <Crown className="w-10 h-10 fill-current text-amber-400" />
            </div>
          </div>
          {effectiveBreakdown.isNewBest && (
            <span className="absolute -top-2 -right-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-lg border border-emerald-300 animate-pulse">
              ★ NEW BEST!
            </span>
          )}
        </div>

        {/* Title & Level Header */}
        <div className="space-y-1">
          <div className="inline-block bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow">
            LEVEL {levelConfig.levelNum} OF {totalLevels}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white italic tracking-wider uppercase drop-shadow">
            {isFinalLevel ? 'CHAMPIONSHIP COMPLETE!' : 'LEVEL CLEAR!'}
          </h2>
          <p className="text-xs text-amber-300 font-bold uppercase tracking-widest">
            {levelConfig.title} • {levelConfig.difficultyLabel}
          </p>
        </div>

        {/* 3-Star Rating Display */}
        <div className="flex items-center justify-center gap-2 py-1">
          {[1, 2, 3].map((starNum) => {
            const isEarned = starNum <= effectiveBreakdown.stars;
            return (
              <div
                key={starNum}
                className={`p-2.5 rounded-2xl border transition-all ${
                  isEarned
                    ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 scale-110 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                    : 'bg-white/5 border-white/10 text-slate-600 scale-95'
                }`}
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 ${
                    isEarned ? 'fill-amber-400 text-amber-300' : 'text-slate-600'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Highlight Level Score Box */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Level Score</div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {effectiveBreakdown.finalScore.toLocaleString()} <span className="text-sm text-amber-400 font-bold">PTS</span>
          </div>
        </div>

        {/* Itemized Score Breakdown Card */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-left text-xs font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 text-slate-400 font-sans">
            <span className="font-bold uppercase tracking-wider text-[10px]">Score Factors</span>
            <span className="text-[10px] text-cyan-300 font-bold font-mono">
              {effectiveBreakdown.moves} Moves • {effectiveBreakdown.timeSeconds}s
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="font-sans">Base Level Clearance</span>
            <span className="text-emerald-400">+{effectiveBreakdown.baseScore.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="font-sans">Speed & Time Bonus</span>
            <span className="text-cyan-400">+{effectiveBreakdown.timeBonus.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="font-sans">Move Efficiency (Par {effectiveBreakdown.parMoves})</span>
            <span className={effectiveBreakdown.moveBonus >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
              {effectiveBreakdown.moveBonus >= 0 ? `+${effectiveBreakdown.moveBonus.toLocaleString()}` : effectiveBreakdown.moveBonus.toLocaleString()}
            </span>
          </div>

          {(effectiveBreakdown.hintPenalty > 0 || effectiveBreakdown.extraTubePenalty > 0 || effectiveBreakdown.invalidPenalty > 0) && (
            <div className="flex justify-between items-center text-rose-300 pt-1 border-t border-white/10">
              <span className="font-sans">Penalties (Hints/Tubes/Errors)</span>
              <span className="text-rose-400">
                -{(effectiveBreakdown.hintPenalty + effectiveBreakdown.extraTubePenalty + effectiveBreakdown.invalidPenalty).toLocaleString()}
              </span>
            </div>
          )}

          {/* Cumulative Tournament Score */}
          <div className="pt-2 border-t border-white/15 flex justify-between items-center font-sans font-black text-sm">
            <span className="text-amber-300 uppercase tracking-wide">Tournament Total</span>
            <span className="text-amber-400 font-mono text-base font-black">
              {effectiveBreakdown.cumulativeTotalScore.toLocaleString()} PTS
            </span>
          </div>
        </div>

        {/* Coins Earned Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 px-3.5 py-1 rounded-full text-xs font-black text-amber-300 shadow">
          <span>🪙</span>
          <span>+{rewardCoins} COINS EARNED</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {!isFinalLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#22C55E] via-[#16A34A] to-[#15803D] hover:brightness-110 active:scale-[0.98] text-white font-black text-base uppercase tracking-wider shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 cursor-pointer border border-green-400"
            >
              <span>NEXT LEVEL</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onOpenLeaderboard}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-[0.98] text-slate-950 font-black text-base uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
            >
              <Crown className="w-5 h-5 fill-current text-slate-950" />
              <span>CHAMPIONSHIP LEADERBOARD</span>
            </button>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onReplay}
              className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
              title="Replay Level"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REPLAY</span>
            </button>

            <button
              onClick={onOpenLevels}
              className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
              title="Level Select"
            >
              <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
              <span>LEVELS</span>
            </button>

            <button
              onClick={onOpenLeaderboard}
              className="py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-400/40 transition-all cursor-pointer"
              title="View Leaderboard"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>RANKS</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
