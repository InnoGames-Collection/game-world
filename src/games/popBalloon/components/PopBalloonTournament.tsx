import React from 'react';
import { ArrowLeft, Trophy, Zap, Shield, Users, Calendar, Award, CheckCircle2 } from 'lucide-react';
import { PopBalloonProgress } from '../types';
import { formatMsisdnMasked, calculateGlobalRank } from '../storage';
import { UserProfile } from '../../../types';

interface PopBalloonTournamentProps {
  progress: PopBalloonProgress;
  profile?: UserProfile;
  onBack: () => void;
}

export const PopBalloonTournament: React.FC<PopBalloonTournamentProps> = ({
  progress,
  profile,
  onBack,
}) => {
  const maskedPhone = formatMsisdnMasked(profile?.phoneNumber);
  const globalRank = calculateGlobalRank(progress.totalTournamentScore);
  const completedCount = Object.keys(progress.levelBestScores).length;

  return (
    <div
      id="pop-balloon-tournament-view"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-5 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#070D1E] via-[#0D183A] to-[#070D1E] text-white overflow-y-auto custom-scrollbar"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-[#070D1E]/95 backdrop-blur-md z-20 shrink-0">
        <button
          id="pop-balloon-tournament-back-btn"
          type="button"
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-md"
          title="Back to Menu"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <span>Tournament Status</span>
          </h2>
          <p className="text-[11px] text-blue-300 font-bold uppercase tracking-widest">
            2026 Teleplay Season 1
          </p>
        </div>

        <div className="w-11" />
      </div>

      {/* TOURNAMENT HERO BANNER */}
      <div className="my-3 p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-amber-900/30 border border-purple-500/30 shadow-xl shrink-0">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <div className="text-xs font-black text-purple-300 uppercase tracking-wider">
              Championship Event
            </div>
            <div className="text-lg sm:text-xl font-black text-white">
              Pop Balloon Grand Prix
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-xs uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 text-center">
          <div className="bg-black/30 rounded-xl p-2 border border-white/5">
            <div className="text-[9px] text-slate-400 uppercase font-bold">Participants</div>
            <div className="text-sm sm:text-base font-black text-white font-mono">148,920</div>
          </div>
          <div className="bg-black/30 rounded-xl p-2 border border-white/5">
            <div className="text-[9px] text-slate-400 uppercase font-bold">Season Ends</div>
            <div className="text-sm sm:text-base font-black text-amber-300 font-mono">3D 14H</div>
          </div>
          <div className="bg-black/30 rounded-xl p-2 border border-white/5">
            <div className="text-[9px] text-slate-400 uppercase font-bold">Total Stages</div>
            <div className="text-sm sm:text-base font-black text-blue-400 font-mono">40 Levels</div>
          </div>
        </div>
      </div>

      {/* PLAYER CURRENT STANDING */}
      <div className="mb-3 p-4 rounded-2xl bg-white/5 border border-white/10 shrink-0">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Your Tournament Record
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-black text-white font-mono">{maskedPhone}</div>
            <div className="text-xs text-blue-300 font-medium">
              Stage {progress.unlockedLevel} of 40 • {completedCount} Cleared
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-amber-300 font-mono">
              {progress.totalTournamentScore.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">
              Rank #{globalRank.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* RULES & ANTI-FARMING ASSURANCE */}
      <div className="flex flex-col gap-2.5 flex-1">
        <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/20 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider">
              Anti-Farming Tournament Scoring
            </div>
            <div className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              Each stage contributes only the player's <strong>BEST VALID SCORE</strong>. Replaying a stage will only raise your cumulative total if you surpass your previous personal record for that level.
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-3">
          <Trophy className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider">
              Deterministic Multi-Factor Scoring
            </div>
            <div className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              Scores are calculated based on Base Pops (+1), Continuous Combo multipliers, sub-second Reflex windows, Center Precision accuracy, and progressive Stage Difficulty.
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider">
              Stage 1 Baseline Qualifier
            </div>
            <div className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              Stage 1 requires popping a minimum of <strong>100 balloons</strong> to earn tournament qualification and unlock Stage 2.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
