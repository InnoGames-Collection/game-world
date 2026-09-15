/**
 * TelePlay Shared Game Overlays
 * Handles:
 * - Pause Modal (Resume, Restart, Sound Toggle, Exit)
 * - Level Complete Modal (Stars, Score bonus, Next Level)
 * - Game Over Screen (Final Score, Best Score, Play Again, Exit)
 * - Combo Animation Banner
 */

import React from 'react';
import { GameEngineState } from './types';
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Trophy, 
  Star, 
  Sparkles, 
  Flame, 
  Zap, 
  Award,
  ChevronRight
} from 'lucide-react';

interface GameOverlayProps {
  engineState: GameEngineState;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
  onNextLevel: () => void;
  onToggleMute: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  engineState,
  onResume,
  onRestart,
  onExit,
  onNextLevel,
  onToggleMute,
}) => {
  const {
    status,
    score,
    highScore,
    level,
    targetScore,
    movesRemaining,
    stars,
    isAudioMuted,
    activeComboEvent,
  } = engineState;

  const isNewRecord = score > 0 && score >= highScore;

  return (
    <>
      {/* 1. Dynamic Floating Combo Shoutout Banner */}
      {activeComboEvent && status === 'playing' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in zoom-in-75 fade-in duration-200">
          <div className="flex flex-col items-center">
            <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-slate-950 font-black text-lg sm:text-xl tracking-wider uppercase shadow-2xl shadow-orange-500/40 border-2 border-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white animate-spin" />
              <span>{activeComboEvent.message}</span>
              <span className="text-xs bg-slate-950 text-amber-300 px-2 py-0.5 rounded-lg ml-1 font-mono">
                +{activeComboEvent.points}
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-amber-300 mt-1 drop-shadow-md">
              Combo Cascade x{activeComboEvent.multiplier}!
            </div>
          </div>
        </div>
      )}

      {/* 2. PAUSE MODAL */}
      {status === 'paused' && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-gradient-to-b from-[#0B3B70] to-[#05234A] rounded-3xl p-6 border-2 border-[#70C922]/50 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#70C922]/20 border border-[#70C922]/40 mx-auto flex items-center justify-center text-[#70C922]">
              <Play className="w-7 h-7 fill-current ml-0.5" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">Game Paused</h3>
              <p className="text-xs text-slate-300">Level {level} • Score: {score.toLocaleString()}</p>
            </div>

            <div className="space-y-2.5 pt-2">
              {/* Resume Button */}
              <button
                id="pause-resume-button"
                onClick={onResume}
                className="w-full py-3.5 rounded-2xl bg-[#70C922] text-[#05234A] font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#70C922]/25 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>RESUME GAME</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={onToggleMute}
                className="w-full py-3 rounded-2xl bg-slate-900/90 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2"
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#70C922]" />}
                <span>Sound: {isAudioMuted ? 'Muted' : 'Enabled'}</span>
              </button>

              {/* Restart Level */}
              <button
                id="pause-restart-button"
                onClick={onRestart}
                className="w-full py-3 rounded-2xl bg-slate-900/90 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Restart Game</span>
              </button>

              {/* Exit to Hub */}
              <button
                id="pause-exit-button"
                onClick={onExit}
                className="w-full py-2.5 rounded-2xl text-slate-400 hover:text-white font-semibold text-xs transition-colors"
              >
                Exit to Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. LEVEL COMPLETE MODAL */}
      {status === 'level-complete' && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#0B3B70] to-[#05234A] rounded-3xl p-6 border-2 border-[#70C922] shadow-2xl text-center space-y-4">
            {/* Victory Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#70C922]/20 border border-[#70C922]/60 text-[#70C922] text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Target Achieved!</span>
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">Level {level} Complete!</h3>
              <p className="text-xs text-slate-300 mt-1">Fantastic matching skills!</p>
            </div>

            {/* Stars Earned */}
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                    s <= Math.max(1, stars)
                      ? 'bg-amber-400/20 border-amber-400 text-amber-400 scale-110 shadow-lg shadow-amber-400/30 animate-bounce'
                      : 'bg-slate-900 border-slate-800 text-slate-700'
                  }`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </div>
              ))}
            </div>

            {/* Level Stats Summary */}
            <div className="grid grid-cols-2 gap-3 bg-[#02142B] p-3.5 rounded-2xl border border-[#0B3B70] text-left">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Score</div>
                <div className="text-lg font-black font-mono text-white">{score.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Remaining Moves</div>
                <div className="text-lg font-black font-mono text-[#70C922]">+{movesRemaining} Moves</div>
              </div>
            </div>

            {/* Next Level Button */}
            <button
              id="next-level-button"
              onClick={onNextLevel}
              className="w-full py-4 rounded-2xl bg-[#70C922] text-[#05234A] font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-[#70C922]/30 flex items-center justify-center gap-2"
            >
              <span>NEXT LEVEL</span>
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* 4. GAME OVER MODAL (Turn limit reached) */}
      {status === 'game-over' && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#0B3B70] to-[#05234A] rounded-3xl p-6 border-2 border-red-500/50 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 mx-auto flex items-center justify-center text-red-400">
              <Trophy className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">Out of Moves!</h3>
              <p className="text-xs text-slate-300 mt-1">Match session concluded.</p>
            </div>

            {isNewRecord && (
              <div className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-black text-xs uppercase tracking-wider animate-pulse flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Personal High Score!</span>
              </div>
            )}

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-3 bg-[#02142B] p-4 rounded-2xl border border-[#0B3B70] text-left">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Final Score</div>
                <div className="text-xl font-black font-mono text-white">{score.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Best Score</div>
                <div className="text-xl font-black font-mono text-amber-400">{highScore.toLocaleString()}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                id="gameover-play-again-button"
                onClick={onRestart}
                className="w-full py-4 rounded-2xl bg-[#70C922] text-[#05234A] font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-[#70C922]/25 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 stroke-[3]" />
                <span>PLAY AGAIN</span>
              </button>

              <button
                id="gameover-exit-button"
                onClick={onExit}
                className="w-full py-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs"
              >
                Exit Game
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
