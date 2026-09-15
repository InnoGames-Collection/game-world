import React, { useMemo } from 'react';
import { BarChart2, Flame, Trophy, Clock, Play, Calendar, X, ArrowLeft } from 'lucide-react';
import { GameConfig } from './types';
import { GameLeaderboardService } from '../../services/gameLeaderboardService';
import { UserProfile } from '../../types';

interface GameStatisticsModalProps {
  gameConfig: GameConfig;
  profile?: UserProfile;
  onClose: () => void;
}

export const GameStatisticsModal: React.FC<GameStatisticsModalProps> = ({
  gameConfig,
  profile,
  onClose,
}) => {
  const stats = useMemo(() => {
    return GameLeaderboardService.getUserStats(gameConfig.gameId, profile);
  }, [gameConfig.gameId, profile]);

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  const formattedLastPlayed = useMemo(() => {
    if (!stats.lastPlayedTimestamp) return 'Today';
    const date = new Date(stats.lastPlayedTimestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }, [stats.lastPlayedTimestamp]);

  return (
    <div
      id="game-statistics-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="relative w-full max-w-md flex flex-col rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-white/15 shadow-2xl text-white overflow-hidden">
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
            <div className="flex items-center justify-center gap-1.5 text-purple-400">
              <BarChart2 className="w-4 h-4" />
              <span className="text-xs font-black tracking-widest uppercase">STATISTICS</span>
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
        <div className="p-4 space-y-3">
          {/* Main Hero Stat: Best Score */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-center">
            <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4" />
              <span>Personal Best Score</span>
            </div>
            <div className="text-3xl font-black text-white font-mono">
              {stats.bestScore.toLocaleString()} <span className="text-sm font-bold text-amber-300">{gameConfig.scoreLabel}</span>
            </div>
          </div>

          {/* 2x2 Grid of Real Stored Stats */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Matches</span>
              </div>
              <div className="text-lg font-black text-white">{stats.matchesPlayed}</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Highest Level</span>
              </div>
              <div className="text-lg font-black text-white">
                {gameConfig.hasLevels ? `Level ${stats.bestLevel}` : 'Standard'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Play Time</span>
              </div>
              <div className="text-lg font-black text-white">{formatMinutes(stats.totalPlaytimeSeconds)}</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Last Match</span>
              </div>
              <div className="text-xs font-bold text-slate-200 pt-1">{formattedLastPlayed}</div>
            </div>
          </div>
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
