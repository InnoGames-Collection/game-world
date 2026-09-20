import React from 'react';
import { AlertTriangle, RotateCcw, Grid, Home, Flag, Gauge, ShieldAlert } from 'lucide-react';
import { HillClimbLevelConfig, CrashReason } from '../types';

interface HillClimbFailureModalProps {
  levelConfig: HillClimbLevelConfig;
  crashReason: CrashReason | null;
  distance: number;
  score: number;
  bestScore: number;
  onRetry: () => void;
  onOpenLevels: () => void;
  onOpenMenu: () => void;
}

export const HillClimbFailureModal: React.FC<HillClimbFailureModalProps> = ({
  levelConfig,
  crashReason,
  distance,
  score,
  bestScore,
  onRetry,
  onOpenLevels,
  onOpenMenu,
}) => {
  const percentComplete = Math.min(100, Math.round((distance / levelConfig.targetDistance) * 100));

  const getReasonText = (reason: CrashReason | null) => {
    switch (reason) {
      case 'flipped':
        return {
          title: 'VEHICLE FLIPPED OVER',
          desc: 'Roof impacted terrain. Feather throttle on crests and brake mid-air to level pitch!',
        };
      case 'out_of_fuel':
        return {
          title: 'RUN OUT OF FUEL',
          desc: 'Tank empty! Collect red Jerry cans and maintain momentum on downhills.',
        };
      case 'off_road':
        return {
          title: 'LEFT ROAD BOUNDARY',
          desc: 'Steered too far off road into mountain terrain.',
        };
      default:
        return {
          title: 'RUN TERMINATED',
          desc: 'Vehicle destabilized on mountain slope.',
        };
    }
  };

  const reasonInfo = getReasonText(crashReason);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#2b1010] via-[#1a0808] to-[#0d0404] border-2 border-rose-500/50 p-5 sm:p-6 text-white text-center shadow-[0_15px_50px_rgba(239,68,68,0.35)] overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Warning Icon */}
        <div className="relative z-10 mx-auto w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center shadow-lg">
          <AlertTriangle className="w-9 h-9 text-rose-400 drop-shadow-md animate-pulse" />
        </div>

        {/* Title */}
        <div className="relative z-10 mt-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-rose-400">
            CHALLENGE FAILED • አልተሳካም
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            {reasonInfo.title}
          </h2>
          <div className="text-xs text-slate-300 font-medium mt-1">{reasonInfo.desc}</div>
        </div>

        {/* Distance Progress Bar */}
        <div className="relative z-10 my-3.5 p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold uppercase flex items-center gap-1">
              <Flag className="w-3.5 h-3.5 text-cyan-400" />
              Stage Progress
            </span>
            <span className="font-mono font-bold text-white">
              {Math.round(distance)}m / {levelConfig.targetDistance}m ({percentComplete}%)
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-[#8BCB3D] transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
            <span className="text-slate-400">Score Achieved:</span>
            <span className="font-mono font-black text-amber-400">{score} PTS</span>
          </div>
          {bestScore > 0 && (
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Stage Record:</span>
              <span className="font-mono font-bold text-slate-300">{bestScore} PTS</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 space-y-2">
          <button
            type="button"
            onClick={onRetry}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:brightness-110 active:scale-95 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(244,63,94,0.4)] border-2 border-white/30 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RETRY LEVEL {levelConfig.levelNumber}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenLevels}
              className="py-2.5 px-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-600 text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5 text-cyan-400" />
              <span>LEVELS</span>
            </button>

            <button
              type="button"
              onClick={onOpenMenu}
              className="py-2.5 px-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-600 text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-slate-300" />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
