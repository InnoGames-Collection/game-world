import React from 'react';
import {
  ArrowLeft,
  Info,
  Crown,
  Shield,
  Trophy,
  CheckCircle2,
} from 'lucide-react';

interface DamaAboutProps {
  onBack: () => void;
}

export const DamaAbout: React.FC<DamaAboutProps> = ({ onBack }) => {
  return (
    <div
      id="dama-about-container"
      className="w-full max-w-xl mx-auto flex flex-col h-screen px-3 py-4 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          id="dama-about-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Menu</span>
        </button>

        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-black text-white uppercase tracking-wide">
            About Dama Tournament
          </span>
        </div>

        <div className="w-12" />
      </div>

      {/* About Content */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs text-slate-300 leading-relaxed">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Crown className="w-4 h-4" />
            <span>Ethiopian Dama Tradition</span>
          </div>
          <p>
            Dama (ዳማ) is a cherished traditional draughts variant played across Ethiopia and the Horn of Africa. Combining deep positional strategy with dynamic diagonal captures, Dama demands tactical foresight, sacrificial baits, and flying king maneuvers.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Shield className="w-4 h-4" />
            <span>Tournament Rules & Integrity</span>
          </div>
          <p>
            This official competitive edition features an authoritative 40-level tournament tree with progressive difficulty scaling from Hard to Master.
          </p>
          <p>
            • <strong>Deterministic Scoring:</strong> Random score modifiers are strictly prohibited. Every point is calculated from base values, capture efficiency, piece survival, kings crowned, move count, and match tempo.
          </p>
          <p>
            • <strong>Anti-Score Farming:</strong> Cumulative tournament score equals the sum of personal best scores per level. Repeating a level will never inflate the leaderboard unless the previous record is legitimately broken.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Trophy className="w-4 h-4" />
            <span>Tournament Difficulty Tiers</span>
          </div>
          <div className="space-y-1 pt-1 font-mono text-[11px]">
            <div className="flex justify-between py-0.5 border-b border-slate-800">
              <span className="text-amber-400 font-bold">Levels 1–5:</span>
              <span className="text-slate-300">Hard (Tactical baseline)</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-800">
              <span className="text-orange-400 font-bold">Levels 6–10:</span>
              <span className="text-slate-300">Very Hard (Center control)</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-800">
              <span className="text-rose-400 font-bold">Levels 11–20:</span>
              <span className="text-slate-300">Expert (Multi-capture tactics)</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-800">
              <span className="text-purple-400 font-bold">Levels 21–30:</span>
              <span className="text-slate-300">Expert+ (Endgame positioning)</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-800">
              <span className="text-red-400 font-bold">Levels 31–39:</span>
              <span className="text-slate-300">Extreme (King hunting)</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-yellow-300 font-bold">Level 40:</span>
              <span className="text-slate-300">Master (Grandmaster finale)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
