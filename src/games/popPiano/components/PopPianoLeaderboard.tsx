import React, { useMemo } from 'react';
import { Trophy, ArrowLeft, User, Zap, Target, Star, Clock, ShieldCheck, Flame } from 'lucide-react';
import { UserProfile } from '../../../types';
import { GameLeaderboardService } from '../../../services/gameLeaderboardService';
import { PopPianoProgress } from '../types';

interface PopPianoLeaderboardProps {
  progress: PopPianoProgress;
  profile?: UserProfile;
  onBack: () => void;
}

export const PopPianoLeaderboard: React.FC<PopPianoLeaderboardProps> = ({
  progress,
  profile,
  onBack,
}) => {
  // Pull real leaderboard data
  const leaderboardResult = useMemo(() => {
    if (progress.totalScore > 0) {
      GameLeaderboardService.recordScore(
        'pop-piano',
        progress.totalScore,
        profile?.displayName || 'You',
        progress.highestUnlockedLevel
      );
    }
    return GameLeaderboardService.getLeaderboardForGame('pop-piano', profile);
  }, [progress.totalScore, progress.highestUnlockedLevel, profile]);

  const completedCount = Object.keys(progress.completedLevels || {}).length;
  const stats = progress.stats;

  return (
    <div
      id="pop-piano-leaderboard-view"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white overflow-y-auto custom-scrollbar"
    >
      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-[#0B132B]/90 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Menu"
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Tournament Leaderboard</span>
          </h2>
          <p className="text-[11px] text-cyan-300 font-bold uppercase tracking-widest">
            Ranked by Cumulative Tournament Score
          </p>
        </div>

        <div className="w-11" />
      </header>

      {/* CURRENT PLAYER STANDING HERO CARD */}
      <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-cyan-500/15 border border-amber-400/30 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-black text-base font-mono">
              #{leaderboardResult.userRank || 1}
            </div>
            <div>
              <div className="text-sm font-black text-white flex items-center gap-1.5">
                <span>{profile?.displayName || 'You (Local Player)'}</span>
                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-bold uppercase">
                  Verified Entry
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-medium">
                Level {progress.highestUnlockedLevel} • {completedCount} / 40 Completed
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-black text-amber-300 font-mono">
              {progress.totalScore.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Total Score
            </div>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-4 gap-2 pt-2.5 text-center font-mono">
          <div className="bg-black/20 rounded-xl p-1.5">
            <div className="text-[8px] text-slate-400 uppercase font-sans">Accuracy</div>
            <div className="text-xs font-bold text-emerald-300">
              {stats.bestAccuracy > 0 ? `${stats.bestAccuracy}%` : '--'}
            </div>
          </div>
          <div className="bg-black/20 rounded-xl p-1.5">
            <div className="text-[8px] text-slate-400 uppercase font-sans">Speed</div>
            <div className="text-xs font-bold text-cyan-300">
              {stats.bestReactionTimeMs > 0 ? `${stats.bestReactionTimeMs}ms` : '--'}
            </div>
          </div>
          <div className="bg-black/20 rounded-xl p-1.5">
            <div className="text-[8px] text-slate-400 uppercase font-sans">Max Streak</div>
            <div className="text-xs font-bold text-amber-300">
              {stats.bestCombo > 0 ? `${stats.bestCombo}x` : '0x'}
            </div>
          </div>
          <div className="bg-black/20 rounded-xl p-1.5">
            <div className="text-[8px] text-slate-400 uppercase font-sans">Black Tiles</div>
            <div className="text-xs font-bold text-purple-300">
              {stats.totalBlackTilesPressed}
            </div>
          </div>
        </div>
      </div>

      {/* TIE-BREAKING PROTOCOL NOTICE */}
      <div className="mb-4 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 leading-relaxed">
        <strong className="text-amber-300 font-semibold">Official Deterministic Tie-Breaking:</strong>
        <span className="text-slate-400"> In case of equal tournament score, ties are broken by: 1. Highest Level Completed, 2. Best Overall Accuracy, 3. Lowest Reaction Time (ms), 4. Highest Max Combo, 5. Lowest Total Mistakes.</span>
      </div>

      {/* LEADERBOARD STANDINGS TABLE */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-md">
        <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
          <span>Rank & Player</span>
          <span>Cumulative Score</span>
        </div>

        <div className="divide-y divide-white/5">
          {leaderboardResult.entries && leaderboardResult.entries.length > 0 ? (
            leaderboardResult.entries.map((entry) => (
              <div
                key={entry.rank}
                className={`px-4 py-3 flex items-center justify-between transition-colors ${
                  entry.isCurrentUser ? 'bg-amber-500/10 border-l-4 border-amber-400' : 'hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs font-mono ${
                      entry.rank === 1
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : entry.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : entry.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {entry.rank}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{entry.playerName}</span>
                      {entry.isCurrentUser && (
                        <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-bold uppercase">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {entry.playerMasked}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-amber-300 font-mono">
                    {entry.score.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">PTS</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400">
              <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No Tournament Records Yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Complete Level 1 (100 black tiles) to enter the official tournament standings!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
