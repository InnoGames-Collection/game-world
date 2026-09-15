import React, { useState } from 'react';
import { Play, Trophy, RotateCcw, BookOpen, Settings, Home, AlertCircle, X } from 'lucide-react';
import { GameConfig } from './types';

interface GamePauseMenuProps {
  gameConfig: GameConfig;
  score?: number;
  level?: number;
  onResume: () => void;
  onLeaderboard: () => void;
  onRestart?: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
  onExitToMenu: () => void;
}

export const GamePauseMenu: React.FC<GamePauseMenuProps> = ({
  gameConfig,
  score,
  level,
  onResume,
  onLeaderboard,
  onRestart,
  onHowToPlay,
  onSettings,
  onExitToMenu,
}) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  return (
    <div
      id="game-pause-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/15 p-6 shadow-2xl text-white">
        {/* Header Close button */}
        <button
          onClick={onResume}
          aria-label="Resume game"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 shadow-inner mb-3 text-3xl">
            {gameConfig.theme.iconEmoji}
          </div>
          <h2 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 uppercase">
            Game Paused
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            {gameConfig.title} • {gameConfig.titleAmharic}
          </p>

          {/* Current Score / Level badges if present */}
          {(score !== undefined || level !== undefined) && (
            <div className="flex items-center justify-center gap-3 mt-3">
              {score !== undefined && (
                <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-amber-300">
                  Current: <span className="font-black text-white">{score.toLocaleString()}</span> {gameConfig.scoreLabel}
                </div>
              )}
              {level !== undefined && (
                <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-sky-300">
                  Level: <span className="font-black text-white">{level}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirmation Modal View if Exit is tapped */}
        {showExitConfirm ? (
          <div className="space-y-4 py-2 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Exit to Game Menu?</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Your current match progress will be lost. Are you sure you want to return to the menu?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 font-bold text-xs uppercase tracking-wider text-white border border-white/15 transition-all cursor-pointer"
              >
                Keep Playing
              </button>
              <button
                type="button"
                onClick={onExitToMenu}
                className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                Exit to Menu
              </button>
            </div>
          </div>
        ) : (
          /* Normal Pause Menu Action List */
          <div className="space-y-2.5">
            {/* RESUME */}
            <button
              type="button"
              onClick={onResume}
              className={`w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r ${gameConfig.theme.primaryGradient} hover:brightness-110 active:scale-98 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Game</span>
            </button>

            {/* LEADERBOARD */}
            <button
              type="button"
              onClick={onLeaderboard}
              className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-98 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard</span>
            </button>

            {/* RESTART */}
            {onRestart && (
              <button
                type="button"
                onClick={onRestart}
                className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-98 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <span>Restart Level</span>
              </button>
            )}

            {/* Secondary 2-col row: HOW TO PLAY & SETTINGS */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onHowToPlay}
                className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-98 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rules</span>
              </button>
              <button
                type="button"
                onClick={onSettings}
                className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-98 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-300" />
                <span>Settings</span>
              </button>
            </div>

            {/* EXIT TO MENU */}
            <button
              type="button"
              onClick={() => setShowExitConfirm(true)}
              className="w-full py-3 px-4 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-300 active:scale-98 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-red-500/30 transition-all cursor-pointer mt-1"
            >
              <Home className="w-4 h-4" />
              <span>Exit to Menu</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
