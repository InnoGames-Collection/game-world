import React from 'react';
import {
  ArrowLeft,
  BookOpen,
  Crown,
  Swords,
  Target,
  Shield,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface DamaHowToPlayProps {
  onBack: () => void;
}

export const DamaHowToPlay: React.FC<DamaHowToPlayProps> = ({ onBack }) => {
  return (
    <div
      id="dama-how-to-play-container"
      className="w-full max-w-xl mx-auto flex flex-col h-screen px-3 py-4 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          id="dama-howtoplay-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Menu</span>
        </button>

        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-black text-white uppercase tracking-wide">
            How to Play Dama
          </span>
        </div>

        <div className="w-12" />
      </div>

      {/* Rules Content */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs text-slate-300 leading-relaxed">
        {/* Section 1: Objective & Board */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Target className="w-4 h-4" />
            <span>Objective & Board Setup</span>
          </div>
          <p>
            You control the <strong>Ivory (White)</strong> pieces moving upward from rows 5–7. The Computer opponent controls the <strong>Dark Walnut (Black)</strong> pieces moving downward from rows 0–2.
          </p>
          <p>
            Victory is achieved by capturing all 12 opposing pieces or trapping them so they have no legal moves remaining.
          </p>
        </div>

        {/* Section 2: Moving & Capturing */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Swords className="w-4 h-4" />
            <span>Moves & Mandatory Captures</span>
          </div>
          <p>
            • <strong>Regular Moves:</strong> Tap your piece, then tap an adjacent forward diagonal empty square.
          </p>
          <p>
            • <strong>Captures:</strong> If an enemy piece is adjacent with an empty square directly behind it, you must jump over it to capture.
          </p>
          <p>
            • <strong>Mandatory Rule:</strong> In competitive Dama, captures are mandatory. If a capture exists, you must take it.
          </p>
          <p>
            • <strong>Multi-Jumps:</strong> If another capture is immediately available after landing, your piece continues the chain!
          </p>
        </div>

        {/* Section 3: Kings & Promotion */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Crown className="w-4 h-4" />
            <span>King Crown & Powers</span>
          </div>
          <p>
            Reaching the opponent's back row (Row 0 for player) immediately crowns your piece as a <strong>King (Dama)</strong>.
          </p>
          <p>
            Kings gain the power of flying diagonals: they can move and capture both forward and backward across extended board distances!
          </p>
        </div>

        {/* Section 4: Tournament Scoring & Anti-Farming */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Shield className="w-4 h-4" />
            <span>Competitive Scoring & Progression</span>
          </div>
          <p>
            Every match is evaluated by a deterministic formula:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-300">
            <li><strong>Base Score:</strong> +20 pts on completion.</li>
            <li><strong>Win Bonus:</strong> +25 pts on victory.</li>
            <li><strong>Difficulty Bonus:</strong> +5 to +38 pts scaled to Level 1–40.</li>
            <li><strong>Capture & Survival:</strong> +2 pts per capture, +2 pts per surviving piece.</li>
            <li><strong>Kings Crowned:</strong> +4 pts per king.</li>
            <li><strong>Move Efficiency:</strong> Extra points for winning in fewer moves (&le; 24 moves = +18).</li>
            <li><strong>Time & Tactical Streak:</strong> Steady decisive play and multi-jumps reward bonuses.</li>
            <li><strong>Penalties:</strong> -2 pts per invalid move attempt.</li>
          </ul>
          <p className="pt-1 text-amber-300/90 font-medium">
            <strong>Anti-Farming Guarantee:</strong> Total Tournament Score is strictly the sum of your personal best score across all 40 levels. Replaying a level only updates your total if you exceed your previous high score!
          </p>
        </div>
      </div>
    </div>
  );
};
