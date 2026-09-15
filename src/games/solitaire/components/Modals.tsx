/**
 * Solitaire Modals Suite
 * Includes:
 * - PauseModal
 * - HowToPlayModal
 * - WinModal
 * - FailModal
 * - RestartConfirmModal
 * - DailyChallengeModal
 * - AutoCompleteConfirmModal
 */

import React from 'react';
import { CardGraphic, CardBack } from '../cardRenderer';
import { soundManager } from '../audioEngine';
import {
  Play,
  RotateCcw,
  Home,
  ListOrdered,
  Star,
  Trophy,
  HelpCircle,
  X,
  Sparkles,
  Calendar,
} from 'lucide-react';

/* -------------------------------------------------------------
 * 1. PAUSE MODAL
 * ------------------------------------------------------------- */
export const PauseModal: React.FC<{
  onResume: () => void;
  onRestart: () => void;
  onLeaderboard?: () => void;
  onLevelSelect: () => void;
  onHome: () => void;
}> = ({ onResume, onRestart, onLeaderboard, onLevelSelect, onHome }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xs rounded-2xl bg-gradient-to-b from-[#1b3d22] to-[#0d2212] border-2 border-emerald-400/50 shadow-2xl p-5 text-white flex flex-col items-center gap-3">
        <h2 className="text-xl font-black tracking-wider text-amber-300 uppercase">
          GAME PAUSED
        </h2>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-2" />

        <button
          onClick={() => {
            soundManager.playButton();
            onResume();
          }}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-b from-[#4caf50] to-[#2e7d32] text-white font-black text-sm uppercase tracking-wider shadow border border-emerald-300 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>RESUME</span>
        </button>

        {onLeaderboard && (
          <button
            onClick={() => {
              soundManager.playButton();
              onLeaderboard();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-b from-amber-600 to-amber-800 text-amber-100 font-black text-xs uppercase tracking-wider border border-amber-400/70 shadow active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4 text-yellow-300 fill-current" />
            <span>LEADERBOARD</span>
          </button>
        )}

        <button
          onClick={() => {
            soundManager.playButton();
            onRestart();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-black/40 hover:bg-black/60 text-white font-bold text-xs uppercase tracking-wider border border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>RESTART</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButton();
            onLevelSelect();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-black/40 hover:bg-black/60 text-white font-bold text-xs uppercase tracking-wider border border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <ListOrdered className="w-4 h-4 text-sky-400" />
          <span>LEVEL SELECT</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButton();
            onHome();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-black/40 hover:bg-black/60 text-white font-bold text-xs uppercase tracking-wider border border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4 text-slate-300" />
          <span>HOME</span>
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 2. RESTART CONFIRM MODAL
 * ------------------------------------------------------------- */
export const RestartConfirmModal: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xs rounded-2xl bg-gradient-to-b from-[#2b1810] to-[#170a04] border-2 border-amber-600/50 shadow-2xl p-5 text-white flex flex-col items-center text-center gap-3">
        <RotateCcw className="w-8 h-8 text-amber-400 mb-1 animate-spin-reverse" />
        <h3 className="text-lg font-black text-amber-300 uppercase">RESTART GAME?</h3>
        <p className="text-xs text-amber-100/80">
          Your current moves and points for this deal will be reset.
        </p>

        <div className="flex gap-2 w-full mt-2">
          <button
            onClick={() => {
              soundManager.playButton();
              onCancel();
            }}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              soundManager.playButton();
              onConfirm();
            }}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-b from-amber-500 to-amber-700 text-white text-xs font-black uppercase tracking-wider shadow border border-amber-400 active:scale-95 transition-all"
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 3. WIN MODAL (SOLITAIRE COMPLETE)
 * ------------------------------------------------------------- */
export const WinModal: React.FC<{
  level: number;
  score: number;
  timeSeconds: number;
  moves: number;
  bonus: number;
  stars: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
}> = ({
  level,
  score,
  timeSeconds,
  moves,
  bonus,
  stars,
  onNextLevel,
  onReplay,
  onLevelSelect,
}) => {
  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const totalPoints = score + bonus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200 select-none">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1b5e20] via-[#0f3813] to-[#071d0a] border-4 border-amber-400 shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-6 text-white flex flex-col items-center text-center">
        {/* Confetti / Star Crown */}
        <div className="flex items-center gap-1.5 mb-1 text-amber-300 text-3xl animate-bounce">
          <Star className={`w-8 h-8 ${stars >= 1 ? 'fill-amber-400 text-amber-300' : 'text-slate-600'}`} />
          <Star className={`w-10 h-10 -mt-2 ${stars >= 2 ? 'fill-amber-400 text-amber-300' : 'text-slate-600'}`} />
          <Star className={`w-8 h-8 ${stars >= 3 ? 'fill-amber-400 text-amber-300' : 'text-slate-600'}`} />
        </div>

        <h2 className="text-2xl font-black tracking-wider text-amber-300 uppercase drop-shadow">
          SOLITAIRE COMPLETE!
        </h2>
        <span className="text-xs font-black text-emerald-200 tracking-wide uppercase mb-4">
          Level {level} Conquered
        </span>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2 bg-black/40 rounded-2xl p-3 border border-white/10 mb-5 text-left">
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-400 font-bold uppercase">SCORE</span>
            <span className="text-base font-black font-mono text-white">{score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-400 font-bold uppercase">BONUS</span>
            <span className="text-base font-black font-mono text-amber-300">+{bonus}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-400 font-bold uppercase">TIME</span>
            <span className="text-base font-black font-mono text-white">{timeFormatted}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-400 font-bold uppercase">MOVES</span>
            <span className="text-base font-black font-mono text-white">{moves}</span>
          </div>
          <div className="col-span-2 pt-2 mt-1 border-t border-white/10 flex justify-between items-center">
            <span className="text-xs text-amber-300 font-black uppercase">TOTAL POINTS</span>
            <span className="text-lg font-black font-mono text-emerald-300">{totalPoints}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2">
          {level < 40 ? (
            <button
              onClick={() => {
                soundManager.playButton();
                onNextLevel();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-b from-[#4caf50] to-[#2e7d32] hover:from-[#66bb6a] hover:to-[#388e3c] text-white font-black text-sm uppercase tracking-wider shadow-lg border border-emerald-300 active:scale-95 transition-all"
            >
              NEXT LEVEL →
            </button>
          ) : (
            <div className="py-2 px-3 rounded-xl bg-amber-500/30 text-amber-300 text-xs font-black">
              🏆 ALL 40 LEVELS COMPLETED! MASTER OF SOLITAIRE!
            </div>
          )}

          <div className="flex gap-2 w-full">
            <button
              onClick={() => {
                soundManager.playButton();
                onReplay();
              }}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
            <button
              onClick={() => {
                soundManager.playButton();
                onLevelSelect();
              }}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Levels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 4. FAIL / DEADLOCK MODAL
 * ------------------------------------------------------------- */
export const FailModal: React.FC<{
  reason: 'deadlock' | 'time_out';
  onUndo: () => void;
  onRestart: () => void;
  onLevelSelect: () => void;
}> = ({ reason, onUndo, onRestart, onLevelSelect }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xs rounded-3xl bg-gradient-to-b from-[#2b1212] to-[#140606] border-2 border-rose-500/50 shadow-2xl p-5 text-white flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-rose-900/50 border border-rose-500/60 flex items-center justify-center text-rose-400 mb-1">
          <RotateCcw className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-black text-rose-300 uppercase">
          {reason === 'deadlock' ? 'NO MORE MOVES' : 'TIME EXPIRED'}
        </h3>
        <p className="text-xs text-rose-100/80">
          {reason === 'deadlock'
            ? 'No legal moves remain on the board or in the stock pile.'
            : 'The level timer ran out. Try a more direct solution route!'}
        </p>

        <div className="w-full flex flex-col gap-2 mt-2">
          <button
            onClick={() => {
              soundManager.playUndo();
              onUndo();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-b from-[#374151] to-[#1f2937] text-amber-300 font-black text-xs uppercase tracking-wider shadow border border-slate-600 active:scale-95 transition-all"
          >
            UNDO PREVIOUS MOVE
          </button>
          <button
            onClick={() => {
              soundManager.playButton();
              onRestart();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-b from-rose-600 to-rose-800 text-white font-black text-xs uppercase tracking-wider shadow border border-rose-500 active:scale-95 transition-all"
          >
            RESTART LEVEL
          </button>
          <button
            onClick={() => {
              soundManager.playButton();
              onLevelSelect();
            }}
            className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider"
          >
            Level Select
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 5. HOW TO PLAY MODAL
 * ------------------------------------------------------------- */
export const HowToPlayModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1b3d22] to-[#0d2212] border-2 border-emerald-400/50 shadow-2xl p-5 text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-300" />
            <h3 className="text-lg font-black text-amber-300 uppercase tracking-wider">
              HOW TO PLAY SOLITAIRE
            </h3>
          </div>
          <button
            onClick={() => {
              soundManager.playButton();
              onClose();
            }}
            className="p-1 rounded-lg bg-white/10 text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules with Visual Diagrams */}
        <div className="flex flex-col gap-4 text-xs">
          {/* Rule 1: Alternating Colors */}
          <div className="flex gap-3 items-start bg-black/30 p-3 rounded-xl border border-white/10">
            <div className="flex -space-x-4 shrink-0">
              <div className="w-10 h-14">
                <CardGraphic card={{ id: 'ex1', suit: 'spades', rank: 10, isFaceUp: true }} />
              </div>
              <div className="w-10 h-14 translate-y-3">
                <CardGraphic card={{ id: 'ex2', suit: 'hearts', rank: 9, isFaceUp: true }} />
              </div>
            </div>
            <div>
              <h4 className="font-black text-amber-300 uppercase mb-0.5">1. Build Down Alternating Colors</h4>
              <p className="text-white/80 leading-relaxed">
                In the 7 tableau columns, cards must be stacked in descending order (K, Q, J, 10... down to 2) with alternating red and black suits.
              </p>
            </div>
          </div>

          {/* Rule 2: Foundations Ace to King */}
          <div className="flex gap-3 items-start bg-black/30 p-3 rounded-xl border border-white/10">
            <div className="w-10 h-14 shrink-0">
              <CardGraphic card={{ id: 'ex3', suit: 'hearts', rank: 1, isFaceUp: true }} />
            </div>
            <div>
              <h4 className="font-black text-amber-300 uppercase mb-0.5">2. Four Foundation Piles</h4>
              <p className="text-white/80 leading-relaxed">
                Start foundations with Aces. Build each foundation up by the exact same suit from Ace to King (A, 2, 3... K).
              </p>
            </div>
          </div>

          {/* Rule 3: Kings in Empty Columns */}
          <div className="flex gap-3 items-start bg-black/30 p-3 rounded-xl border border-white/10">
            <div className="w-10 h-14 shrink-0">
              <CardGraphic card={{ id: 'ex4', suit: 'clubs', rank: 13, isFaceUp: true }} />
            </div>
            <div>
              <h4 className="font-black text-amber-300 uppercase mb-0.5">3. Kings Fill Empty Spaces</h4>
              <p className="text-white/80 leading-relaxed">
                Only a King (or a stack headed by a King) can be placed into an empty tableau column.
              </p>
            </div>
          </div>

          {/* Rule 4: Stock & Waste */}
          <div className="flex gap-3 items-start bg-black/30 p-3 rounded-xl border border-white/10">
            <div className="w-10 h-14 shrink-0">
              <CardBack />
            </div>
            <div>
              <h4 className="font-black text-amber-300 uppercase mb-0.5">4. Stock and Draw Modes</h4>
              <p className="text-white/80 leading-relaxed">
                Tap the stock pile to draw cards into the waste pile. In Draw 1 mode, 1 card is drawn. In Draw 3 mode, 3 cards are drawn. Recycle the stock when empty!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playButton();
            onClose();
          }}
          className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-b from-[#4caf50] to-[#2e7d32] text-white font-black text-xs uppercase tracking-wider shadow"
        >
          GOT IT!
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 6. DAILY CHALLENGE MODAL
 * ------------------------------------------------------------- */
export const DailyChallengeModal: React.FC<{
  completedToday: boolean;
  streak: number;
  onPlay: () => void;
  onClose: () => void;
}> = ({ completedToday, streak, onPlay, onClose }) => {
  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#2b1810] via-[#1a0e09] to-[#0f0705] border-2 border-amber-500/50 shadow-2xl p-6 text-white flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex flex-col items-center justify-center overflow-hidden border border-slate-300 mb-2">
          <div className="w-full bg-red-600 text-white text-[9px] font-black uppercase text-center py-0.5">
            SOLITAIRE
          </div>
          <div className="text-slate-900 text-sm font-black">
            ★
          </div>
        </div>

        <h3 className="text-xl font-black text-amber-300 uppercase tracking-wide">
          DAILY CHALLENGE
        </h3>
        <span className="text-xs font-mono text-amber-200/80 mb-3">{todayStr}</span>

        <div className="w-full bg-black/40 rounded-xl p-3 border border-white/10 mb-4 flex items-center justify-between text-xs">
          <span className="text-white/80 font-bold">Daily Win Streak:</span>
          <span className="text-amber-400 font-black flex items-center gap-1">
            🔥 {streak} {streak === 1 ? 'Day' : 'Days'}
          </span>
        </div>

        {completedToday ? (
          <div className="py-2.5 px-4 rounded-xl bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 text-xs font-black mb-4 w-full">
            ✓ You have completed today's challenge!
          </div>
        ) : (
          <p className="text-xs text-amber-100/70 mb-4">
            Test your wits on today's specially generated Solitaire deal. Complete it to extend your streak!
          </p>
        )}

        <div className="w-full flex gap-2">
          <button
            onClick={() => {
              soundManager.playButton();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider"
          >
            Close
          </button>
          <button
            onClick={() => {
              soundManager.playButton();
              onPlay();
            }}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-b from-[#4caf50] to-[#2e7d32] text-white text-xs font-black uppercase tracking-wider shadow border border-emerald-300 active:scale-95 transition-all"
          >
            {completedToday ? 'Replay' : 'Play Today'}
          </button>
        </div>
      </div>
    </div>
  );
};
