/**
 * Emoji Fun — Top Bar & In-Game HUD Header
 * Closely reproduces the reference video's top bar proportions and playful styling
 */

import React from 'react';
import { Settings, Lightbulb, X, ArrowLeft } from 'lucide-react';
import { emojiAudio } from '../emojiAudio';

interface EmojiFunHeaderProps {
  coins: number;
  lives?: number;
  hints?: number;
  showLives?: boolean;
  showHints?: boolean;
  onOpenCoins?: () => void;
  onOpenSettings?: () => void;
  onUseHint?: () => void;
  onExit?: () => void;
  onBack?: () => void;
  isAudioOn?: boolean;
}

export const EmojiFunHeader: React.FC<EmojiFunHeaderProps> = ({
  coins,
  lives = 3,
  hints = 3,
  showLives = false,
  showHints = false,
  onOpenCoins,
  onOpenSettings,
  onUseHint,
  onExit,
  onBack,
}) => {
  return (
    <header className="w-full flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 z-30 select-none">
      {/* Left side: Back / Exit or Coins Pill */}
      <div className="flex items-center gap-2">
        {onBack ? (
          <button
            onClick={() => {
              emojiAudio.playTap();
              onBack();
            }}
            className="w-10 h-10 rounded-full bg-white/70 hover:bg-white active:scale-95 shadow-md flex items-center justify-center text-slate-700 transition-all border border-white/50"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : onExit ? (
          <button
            onClick={() => {
              emojiAudio.playTap();
              onExit();
            }}
            className="w-10 h-10 rounded-full bg-white/70 hover:bg-white active:scale-95 shadow-md flex items-center justify-center text-slate-700 transition-all border border-white/50"
            aria-label="Exit Game"
          >
            <X className="w-5 h-5" />
          </button>
        ) : null}

        {/* Coins Pill (Directly from reference: glossy pill with coin and '+' button) */}
        <button
          onClick={() => {
            emojiAudio.playTap();
            onOpenCoins?.();
          }}
          className="flex items-center gap-1.5 bg-[#42a5f5] hover:bg-[#29b6f6] active:scale-95 text-white font-extrabold px-3 py-1.5 rounded-full shadow-md border-2 border-white/80 transition-all"
        >
          <span className="text-base leading-none drop-shadow">🪙</span>
          <span className="text-sm font-black tracking-wide drop-shadow-sm">{coins}</span>
          <span className="w-5 h-5 rounded-full bg-[#66bb6a] text-white flex items-center justify-center text-xs font-black shadow-inner ml-0.5">
            +
          </span>
        </button>
      </div>

      {/* Center: Lives (if active in question mode) */}
      {showLives && (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/40 backdrop-blur-sm rounded-full shadow-sm border border-white/60">
          {[1, 2, 3].map((heartIndex) => (
            <span
              key={heartIndex}
              className={`text-xl transition-transform ${
                heartIndex <= lives
                  ? 'scale-100 filter drop-shadow animate-pulse'
                  : 'scale-90 opacity-25 grayscale'
              }`}
            >
              ❤️
            </span>
          ))}
        </div>
      )}

      {/* Right side: Hint Button + Settings Gear */}
      <div className="flex items-center gap-2">
        {showHints && (
          <button
            onClick={() => {
              emojiAudio.playTap();
              onUseHint?.();
            }}
            className="flex items-center gap-1 bg-white/90 hover:bg-white active:scale-95 text-sky-600 font-bold px-3 py-1.5 rounded-2xl shadow-md border-2 border-[#81d4fa] transition-all"
            title="Use Hint"
          >
            <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="text-xs sm:text-sm font-black text-slate-700">Hint</span>
            <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
              {hints}
            </span>
          </button>
        )}

        {onOpenSettings && (
          <button
            onClick={() => {
              emojiAudio.playTap();
              onOpenSettings();
            }}
            className="w-10 h-10 rounded-full bg-white/70 hover:bg-white active:scale-95 shadow-md flex items-center justify-center text-slate-700 transition-all border border-white/50"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-slate-700" />
          </button>
        )}
      </div>
    </header>
  );
};
