import React, { useMemo } from 'react';
import { Award, CheckCircle, Lock, X, ArrowLeft } from 'lucide-react';
import { GameConfig } from './types';
import { GameLeaderboardService } from '../../services/gameLeaderboardService';
import { UserProfile } from '../../types';

interface GameAchievementsModalProps {
  gameConfig: GameConfig;
  profile?: UserProfile;
  onClose: () => void;
}

export const GameAchievementsModal: React.FC<GameAchievementsModalProps> = ({
  gameConfig,
  profile,
  onClose,
}) => {
  const stats = useMemo(() => {
    return GameLeaderboardService.getUserStats(gameConfig.gameId, profile);
  }, [gameConfig.gameId, profile]);

  const { achievements } = gameConfig;

  return (
    <div
      id="game-achievements-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-white/15 shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-400">
              <Award className="w-4 h-4" />
              <span className="text-xs font-black tracking-widest uppercase">ACHIEVEMENTS</span>
            </div>
            <h3 className="text-base font-black text-white">{gameConfig.title}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white border border-white/15 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
          {achievements.map((ach) => {
            // Determine progress
            let currentProg = 0;
            if (ach.id.includes('play') || ach.id.includes('first')) {
              currentProg = Math.min(ach.maxProgress, stats.matchesPlayed);
            } else if (ach.id.includes('score') || ach.id.includes('400')) {
              currentProg = Math.min(ach.maxProgress, stats.bestScore);
            } else if (ach.id.includes('level') || ach.id.includes('stage')) {
              currentProg = Math.min(ach.maxProgress, stats.bestLevel);
            } else {
              currentProg = Math.min(ach.maxProgress, stats.matchesPlayed > 0 ? 1 : 0);
            }

            const isUnlocked = currentProg >= ach.maxProgress;
            const percent = Math.min(100, Math.round((currentProg / ach.maxProgress) * 100));

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-amber-500/10 border-amber-400/40'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                      isUnlocked
                        ? 'bg-amber-500/20 border-amber-400/50 shadow-md'
                        : 'bg-white/5 border-white/10 grayscale opacity-60'
                    }`}
                  >
                    {ach.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white truncate">{ach.title}</h4>
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Unlocked</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <Lock className="w-3 h-3" />
                          <span>{percent}%</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 mt-0.5 leading-snug">{ach.desc}</p>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden mt-2 border border-white/5">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isUnlocked ? 'bg-amber-400' : 'bg-white/30'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold uppercase tracking-wider text-white border border-white/15 transition-all cursor-pointer"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
