/**
 * TelePlay Shared Game Engine HUD
 * Responsive in-game status bar displaying:
 * - Current Score & Target Score progress bar
 * - Moves / Time remaining
 * - Combo Multiplier pill
 * - Level indicator & Star milestones
 * - Sound mute and Pause buttons
 */

import React from 'react';
import { GameEngineState } from './types';
import { 
  Trophy, 
  Volume2, 
  VolumeX, 
  Pause, 
  Star, 
  Zap, 
  Sparkles, 
  Flame,
  Award
} from 'lucide-react';

interface GameHUDProps {
  engineState: GameEngineState;
  gameTitle: string;
  gameTitleAmharic?: string;
  onPause: () => void;
  onToggleMute: () => void;
  isTimed?: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  engineState,
  gameTitle,
  gameTitleAmharic,
  onPause,
  onToggleMute,
  isTimed = false,
}) => {
  const {
    score,
    targetScore,
    level,
    movesRemaining,
    timeRemaining,
    multiplier,
    stars,
    isAudioMuted,
    highScore,
  } = engineState;

  // Calculate target progress percentage
  const progressPct = Math.min(100, Math.round((score / targetScore) * 100));

  return (
    <div className="w-full bg-[#05234A] border-b border-[#0B3B70] px-3 sm:px-4 py-2.5 flex flex-col gap-2 select-none shadow-xl z-20">
      {/* Top Row: Level, Game Title, Control Buttons */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Level Pill */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-[#0B3B70] border border-[#70C922]/40 text-[#70C922] text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <Award className="w-3.5 h-3.5" />
            <span>LVL {level}</span>
          </div>

          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-black text-white leading-tight">{gameTitle}</span>
            {gameTitleAmharic && (
              <span className="text-[10px] text-[#70C922] font-semibold">{gameTitleAmharic}</span>
            )}
          </div>
        </div>

        {/* Center: Moves / Timer Block */}
        <div className="flex items-center gap-3">
          {isTimed ? (
            <div className="px-3 py-1 bg-slate-900/90 rounded-xl border border-slate-700 text-center min-w-[70px]">
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Time</div>
              <div className={`text-base font-black font-mono leading-none ${timeRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {timeRemaining}s
              </div>
            </div>
          ) : (
            <div className="px-3.5 py-1 bg-slate-900/90 rounded-xl border border-[#70C922]/30 text-center min-w-[75px] shadow-inner">
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Moves</div>
              <div className={`text-base font-black font-mono leading-none ${movesRemaining <= 5 ? 'text-amber-400 animate-pulse' : 'text-[#70C922]'}`}>
                {movesRemaining}
              </div>
            </div>
          )}

          {/* Combo Multiplier Pill */}
          {multiplier > 1 && (
            <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-amber-500/20 animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>x{multiplier}</span>
            </div>
          )}
        </div>

        {/* Right: Audio & Pause Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl border transition-all ${
              isAudioMuted
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-slate-900 text-[#70C922] border-[#70C922]/40 hover:bg-[#70C922]/10'
            }`}
            title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            id="game-pause-button"
            onClick={onPause}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-500 transition-colors shadow-sm"
            title="Pause Game"
          >
            <Pause className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Score, Stars & Progress to Target Bar */}
      <div className="flex items-center justify-between gap-3 bg-[#02142B]/80 px-3 py-1.5 rounded-xl border border-[#0B3B70]">
        <div className="flex items-center gap-2">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Score:</div>
          <div className="text-sm font-black font-mono text-white tracking-wide">
            {score.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            / {targetScore.toLocaleString()}
          </div>
        </div>

        {/* Level Progress Bar & Star Milestones */}
        <div className="flex-1 max-w-[160px] sm:max-w-[200px] flex items-center gap-2">
          <div className="relative flex-1 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-[#70C922] to-emerald-400 transition-all duration-300 shadow-sm"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Stars */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((starNum) => (
              <Star
                key={starNum}
                className={`w-3.5 h-3.5 transition-colors ${
                  starNum <= stars
                    ? 'text-amber-400 fill-current filter drop-shadow(0 0 4px rgba(251,191,36,0.6))'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
