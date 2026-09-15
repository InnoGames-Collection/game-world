import React from 'react';
import { ArrowLeft, HelpCircle, Zap, AlertTriangle, Target, Flame, Trophy, ShieldAlert } from 'lucide-react';

interface PopBalloonHowToPlayProps {
  onBack: () => void;
}

export const PopBalloonHowToPlay: React.FC<PopBalloonHowToPlayProps> = ({ onBack }) => {
  return (
    <div
      id="pop-balloon-how-to-play-view"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-5 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#070D1E] via-[#0D183A] to-[#070D1E] text-white overflow-y-auto custom-scrollbar"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-[#070D1E]/95 backdrop-blur-md z-20 shrink-0">
        <button
          id="pop-balloon-help-back-btn"
          type="button"
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-md"
          title="Back to Menu"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span>Tournament Rules</span>
          </h2>
          <p className="text-[11px] text-blue-300 font-bold uppercase tracking-widest">
            Pop Balloon Championship Guide
          </p>
        </div>

        <div className="w-11" />
      </div>

      {/* RULES LIST */}
      <div className="flex flex-col gap-3 my-3 flex-1">
        {/* 1. FATAL FAILURES */}
        <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30">
          <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Instant Game Over Triggers</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li>
              <strong>Tapping empty white space:</strong> You must accurately tap the balloon entity. Touching blank space ends your run immediately.
            </li>
            <li>
              <strong>Balloon touches bottom:</strong> If any falling balloon reaches the floor line, the match terminates immediately.
            </li>
          </ul>
        </div>

        {/* 2. SCORING MECHANICS */}
        <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30">
          <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase mb-2">
            <Trophy className="w-4 h-4 text-blue-400" />
            <span>Multi-Factor Tournament Scoring</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <div className="font-bold text-white mb-0.5">+1 Base Points</div>
              <div className="text-[11px] text-slate-400">Awarded for every correctly popped balloon.</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <div className="font-bold text-amber-300 mb-0.5">Combo Multiplier</div>
              <div className="text-[11px] text-slate-400">Streak uninterrupted pops for up to 1.35x bonus.</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <div className="font-bold text-cyan-300 mb-0.5">Sub-Second Reflex</div>
              <div className="text-[11px] text-slate-400">Pops within 0.5s of spawn yield extra speed points.</div>
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <div className="font-bold text-purple-300 mb-0.5">Center Precision</div>
              <div className="text-[11px] text-slate-400">Tapping near the bullseye center awards precision points.</div>
            </div>
          </div>
        </div>

        {/* 3. LEVEL OBJECTIVES */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-white font-black text-xs uppercase mb-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Stage Objectives</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Watch the top HUD for the current level requirement:
          </p>
          <ul className="text-xs text-slate-300 space-y-1 mt-1 list-disc list-inside">
            <li><strong>Stage 1:</strong> Pop 100 Balloons to pass baseline qualifier.</li>
            <li><strong>Color Targets:</strong> Triage and pop specific colors (e.g., Red, Blue).</li>
            <li><strong>Combo Challenges:</strong> Maintain unbroken streaks to satisfy combo quotas.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
