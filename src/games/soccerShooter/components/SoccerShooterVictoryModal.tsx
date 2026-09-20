import React from 'react';
import {
  Trophy,
  Star,
  RotateCcw,
  ArrowRight,
  Menu,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Flame,
  Award,
  ChevronRight,
} from 'lucide-react';
import { LevelScoreBreakdown } from '../types';

interface SoccerShooterVictoryModalProps {
  breakdown: LevelScoreBreakdown;
  onNextLevel: () => void;
  onReplay: () => void;
  onMainMenu: () => void;
  hasNextLevel: boolean;
}

export const SoccerShooterVictoryModal: React.FC<SoccerShooterVictoryModalProps> = ({
  breakdown,
  onNextLevel,
  onReplay,
  onMainMenu,
  hasNextLevel,
}) => {
  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'PERFECT':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50',
          label: 'PERFECT CLEAR',
        };
      case 'EXCELLENT':
        return {
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
          label: 'EXCELLENT RUN',
        };
      case 'GREAT':
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-400/50',
          label: 'GREAT EXECUTION',
        };
      default:
        return {
          bg: 'bg-slate-500/20 text-slate-300 border-slate-400/40',
          label: 'STAGE CLEARED',
        };
    }
  };

  const badge = getRatingBadge(breakdown.performanceRating);

  return (
    <div
      id="soccer-shooter-victory-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] select-none"
    >
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0a1e38] via-[#071527] to-[#040c18] border border-cyan-500/30 p-5 shadow-2xl flex flex-col text-center max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* TOP BADGE */}
        <div className="flex items-center justify-center mb-1">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border shadow-sm ${badge.bg}`}
          >
            {badge.label}
          </span>
        </div>

        {/* TITLE */}
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
          Level {breakdown.levelNumber} Complete!
        </h2>
        <p className="text-[11px] font-bold text-cyan-300 uppercase tracking-widest">
          {breakdown.levelName} &bull; {breakdown.difficultyTier}
        </p>

        {/* 3-STAR DISPLAY */}
        <div className="flex items-center justify-center gap-2 my-3">
          {[1, 2, 3].map((starIndex) => {
            const isFilled = starIndex <= breakdown.stars;
            return (
              <div
                key={`victory-star-${starIndex}`}
                className={`transform transition-transform ${
                  starIndex === 2 ? '-translate-y-2 scale-110' : ''
                }`}
              >
                <Star
                  className={`w-10 h-10 ${
                    isFilled
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                      : 'text-slate-700'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* SCORE BANNER */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 mb-3 shadow-inner">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Level Score
          </div>
          <div className="text-3xl font-black text-amber-300 font-mono tracking-tight drop-shadow mt-0.5">
            {breakdown.finalLevelScore} <span className="text-xs text-amber-400 font-normal">PTS</span>
          </div>
          {breakdown.isNewBest && (
            <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase">
              New Personal Best!
            </div>
          )}
          <div className="text-[11px] text-slate-300 mt-1.5 flex items-center justify-center gap-1">
            <span>Career Total:</span>
            <strong className="text-emerald-400 font-mono">
              {breakdown.newCumulativeTotal.toLocaleString()} PTS
            </strong>
          </div>
        </div>

        {/* DETAILED SCORE BREAKDOWN */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs text-slate-300 text-left mb-4">
          <div className="text-[10px] font-black uppercase tracking-wider text-cyan-300 border-b border-white/10 pb-1 flex justify-between">
            <span>Performance Audit</span>
            <span>Points</span>
          </div>

          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Base Pop Score</span>
            <span className="font-mono text-white">+{breakdown.basePopScore}</span>
          </div>

          {breakdown.groupBonus > 0 && (
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Large Cluster Bonus</span>
              <span className="font-mono text-cyan-300">+{breakdown.groupBonus}</span>
            </div>
          )}

          {breakdown.comboBonus > 0 && (
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Streak Combo Bonus</span>
              <span className="font-mono text-rose-300">+{breakdown.comboBonus}</span>
            </div>
          )}

          {breakdown.cascadeBonus > 0 && (
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Cascade Detach Bonus</span>
              <span className="font-mono text-emerald-300">+{breakdown.cascadeBonus}</span>
            </div>
          )}

          {breakdown.dropBonus > 0 && (
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Dropped Clusters</span>
              <span className="font-mono text-cyan-300">+{breakdown.dropBonus}</span>
            </div>
          )}

          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">
              Shots Used ({breakdown.shotsUsed} vs Par {breakdown.parShots})
            </span>
            <span
              className={`font-mono ${
                breakdown.efficiencyBonus >= 0 ? 'text-emerald-300' : 'text-rose-400'
              }`}
            >
              {breakdown.efficiencyBonus >= 0
                ? `+${breakdown.efficiencyBonus}`
                : breakdown.efficiencyBonus}
            </span>
          </div>

          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">
              Time ({breakdown.timeTakenSeconds}s vs Target {breakdown.targetTimeSeconds}s)
            </span>
            <span className="font-mono text-sky-300">+{breakdown.timeBonus}</span>
          </div>

          {breakdown.precisionBonus > 0 && (
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Avg Shot Time ({breakdown.avgShotTime}s)</span>
              <span className="font-mono text-purple-300">+{breakdown.precisionBonus}</span>
            </div>
          )}

          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Difficulty ({breakdown.difficultyTier})</span>
            <span className="font-mono text-amber-300">+{breakdown.difficultyBonus}</span>
          </div>

          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Clear Completion</span>
            <span className="font-mono text-emerald-300">+{breakdown.completionBonus}</span>
          </div>

          {breakdown.missPenalty > 0 && (
            <div className="flex justify-between text-[11px] text-rose-400">
              <span>Fouls / Miss Penalty ({breakdown.missedShots})</span>
              <span className="font-mono">-{breakdown.missPenalty}</span>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-2 mt-auto">
          {hasNextLevel ? (
            <button
              type="button"
              id="btn-victory-next"
              onClick={onNextLevel}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 active:scale-98 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>NEXT LEVEL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black uppercase border border-amber-500/40">
              All 40 Stages Conquered! You are the Master!
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="btn-victory-replay"
              onClick={onReplay}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>

            <button
              type="button"
              id="btn-victory-menu"
              onClick={onMainMenu}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
