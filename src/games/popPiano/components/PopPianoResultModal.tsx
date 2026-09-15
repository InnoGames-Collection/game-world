import React from 'react';
import {
  Trophy,
  Star,
  Play,
  Grid3X3,
  RotateCcw,
  Sparkles,
  Award,
  Clock,
  Target,
  Flame,
  CheckCircle2,
  Menu,
} from 'lucide-react';
import { ScoreBreakdown } from '../types';

interface PopPianoResultModalProps {
  breakdown: ScoreBreakdown;
  starsEarned: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenLevels: () => void;
  onReturnToMenu: () => void;
}

export const PopPianoResultModal: React.FC<PopPianoResultModalProps> = ({
  breakdown,
  starsEarned,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onOpenLevels,
  onReturnToMenu,
}) => {
  return (
    <div
      id="pop-piano-result-modal-view"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif] select-none animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-gradient-to-b from-[#1C2541] via-[#0B132B] to-[#080E21] border-2 border-cyan-400/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white relative">
        {/* HEADER BADGE */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Level {breakdown.levelNumber} Completed!</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            {breakdown.levelName}
          </h2>
          <p className="text-xs text-cyan-300 font-semibold uppercase tracking-wider">
            {breakdown.tier} Tier Mastery
          </p>

          {/* STARS */}
          <div className="flex items-center justify-center gap-1.5 my-2.5">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-7 h-7 ${
                  s <= starsEarned
                    ? 'text-amber-400 fill-amber-400 drop-shadow-md animate-in zoom-in-50'
                    : 'text-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* NEW BEST NOTIFICATION */}
        {breakdown.isNewBest && (
          <div className="my-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center justify-center gap-1.5 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>NEW PERSONAL LEVEL RECORD!</span>
          </div>
        )}

        {/* LEVEL SCORE & TOTAL SCORE */}
        <div className="grid grid-cols-2 gap-2.5 my-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Level Score</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-0.5">
              +{breakdown.finalScore}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tournament Total</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono mt-0.5">
              {breakdown.newCumulativeTotal.toLocaleString()}
            </div>
          </div>
        </div>

        {/* PERFORMANCE TELEMETRY GRID */}
        <div className="grid grid-cols-4 gap-1.5 text-center my-3 font-mono">
          <div className="bg-black/30 rounded-xl p-1.5 border border-white/5">
            <div className="text-[8px] text-slate-400 uppercase font-sans">Black Tiles</div>
            <div className="text-xs font-extrabold text-cyan-300">
              {breakdown.tilesHit} / {breakdown.targetNotes}
            </div>
          </div>
          <div className="bg-black/30 rounded-xl p-1.5 border border-white/5">
            <div className="text-[8px] text-slate-400 uppercase font-sans">Accuracy</div>
            <div className="text-xs font-extrabold text-emerald-300">
              {breakdown.accuracy}%
            </div>
          </div>
          <div className="bg-black/30 rounded-xl p-1.5 border border-white/5">
            <div className="text-[8px] text-slate-400 uppercase font-sans">Avg Speed</div>
            <div className="text-xs font-extrabold text-teal-300">
              {breakdown.avgReactionMs}ms
            </div>
          </div>
          <div className="bg-black/30 rounded-xl p-1.5 border border-white/5">
            <div className="text-[8px] text-slate-400 uppercase font-sans">Max Streak</div>
            <div className="text-xs font-extrabold text-amber-300">
              {breakdown.maxCombo}x
            </div>
          </div>
        </div>

        {/* FULL SCORE BREAKDOWN ACCORDION */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-3 my-3 text-xs space-y-1 font-mono">
          <div className="flex items-center justify-between text-slate-300 font-sans text-[11px] pb-1 border-b border-white/10">
            <span className="font-bold uppercase tracking-wider text-slate-400">Score Component</span>
            <span className="font-bold uppercase tracking-wider text-slate-400">Points</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-sans">Base Tile Score ({breakdown.tilesHit} × 1):</span>
            <span className="text-white font-bold">+{breakdown.baseScore}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-sans">Speed Bonus (&lt;{breakdown.avgReactionMs}ms avg):</span>
            <span className="text-cyan-300 font-bold">+{breakdown.speedBonus}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-sans">Accuracy Bonus ({breakdown.accuracy}%):</span>
            <span className="text-emerald-300 font-bold">+{breakdown.accuracyBonus}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-sans">Combo & Streak Milestones:</span>
            <span className="text-amber-300 font-bold">+{breakdown.comboBonus + breakdown.streakBonus}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-sans">Precision Bonus ({breakdown.precisionPercent}% Perfect):</span>
            <span className="text-purple-300 font-bold">+{breakdown.precisionBonus}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-sans">Efficiency Bonus ({breakdown.efficiencyPercent}% clean):</span>
            <span className="text-teal-300 font-bold">+{breakdown.efficiencyBonus}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-sans">Difficulty Tier Bonus:</span>
            <span className="text-blue-300 font-bold">+{breakdown.difficultyBonus}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-sans">Level Completion Bonus:</span>
            <span className="text-emerald-400 font-bold">+{breakdown.completionBonus}</span>
          </div>
          {breakdown.penalties > 0 && (
            <div className="flex items-center justify-between text-rose-400">
              <span className="font-sans">Mistakes & Miss Penalties ({breakdown.misses}):</span>
              <span className="font-bold">-{breakdown.penalties}</span>
            </div>
          )}
        </div>

        {/* NEXT LEVEL UNLOCKED NOTIFICATION */}
        {hasNextLevel ? (
          <div className="text-center text-[11px] text-emerald-300 font-bold uppercase tracking-wider mb-3">
            ✓ Level {breakdown.levelNumber + 1} Unlocked in Tournament
          </div>
        ) : (
          <div className="text-center text-[11px] text-amber-300 font-black uppercase tracking-wider mb-3">
            🏆 Grand Master Tournament Champion!
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-2">
          {hasNextLevel ? (
            <button
              type="button"
              onClick={onNextLevel}
              id="pop-piano-btn-next-level"
              className="min-h-[48px] w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Next: Level {breakdown.levelNumber + 1}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onReturnToMenu}
              className="min-h-[48px] w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Trophy className="w-4 h-4" />
              <span>Grand Master Victory Menu</span>
            </button>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onReplay}
              title="Replay Level"
              className="min-h-[44px] py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs font-bold uppercase tracking-wider border border-white/15 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>

            <button
              type="button"
              onClick={onOpenLevels}
              title="40 Levels"
              className="min-h-[44px] py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs font-bold uppercase tracking-wider border border-white/15 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Levels</span>
            </button>

            <button
              type="button"
              onClick={onReturnToMenu}
              title="Main Menu"
              className="min-h-[44px] py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs font-bold uppercase tracking-wider border border-white/15 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
