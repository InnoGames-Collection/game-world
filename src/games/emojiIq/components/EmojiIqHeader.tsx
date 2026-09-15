/**
 * EMOJI IQ — Game Header
 * Header with Coins, Lives, Hints, Sound toggle, and Settings.
 */

import React from 'react';
import { Settings, Volume2, VolumeX, Lightbulb, Plus, Heart } from 'lucide-react';
import { EMOJI_IQ_COLORS } from '../colors';
import { emojiIqAudio } from '../emojiIqAudio';

interface EmojiIqHeaderProps {
  coins: number;
  lives: number;
  maxLives?: number;
  availableHints: number;
  onOpenStore: () => void;
  onOpenSettings: () => void;
  onUseHint?: () => void;
  showHintButton?: boolean;
  hintsDisabled?: boolean;
}

export const EmojiIqHeader: React.FC<EmojiIqHeaderProps> = ({
  coins,
  lives,
  maxLives = 3,
  availableHints,
  onOpenStore,
  onOpenSettings,
  onUseHint,
  showHintButton = false,
  hintsDisabled = false,
}) => {
  const [sfxOn, setSfxOn] = React.useState<boolean>(emojiIqAudio.sfxEnabled);

  const handleToggleSound = () => {
    const nextState = emojiIqAudio.toggleSfx();
    setSfxOn(nextState);
  };

  return (
    <header className="w-full max-w-md mx-auto flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 z-20 select-none">
      {/* Coins Badge (Clickable to open store) */}
      <button
        onClick={() => {
          emojiIqAudio.playPop();
          onOpenStore();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border shadow-sm hover:scale-105 active:scale-95 transition-transform"
        style={{
          borderColor: 'rgba(255, 183, 3, 0.4)',
          boxShadow: '0 2px 8px rgba(255, 183, 3, 0.2)',
        }}
        title="Coin Balance — Tap to Visit Store"
      >
        <span className="text-base sm:text-lg">🪙</span>
        <span
          className="font-black text-xs sm:text-sm font-mono tracking-tight"
          style={{ color: EMOJI_IQ_COLORS.textPrimary }}
        >
          {coins.toLocaleString()}
        </span>
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-black"
          style={{ backgroundColor: EMOJI_IQ_COLORS.accent }}
        >
          <Plus className="w-3 h-3 text-[#241F3D] stroke-[3]" />
        </div>
      </button>

      {/* Center: Lives Hearts */}
      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-[#6C5CE7]/15 shadow-sm">
        {Array.from({ length: maxLives }).map((_, idx) => {
          const isAlive = idx < lives;
          return (
            <Heart
              key={idx}
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                isAlive
                  ? 'fill-[#FF5A67] text-[#FF5A67] scale-100'
                  : 'fill-slate-200 text-slate-300 scale-90'
              }`}
            />
          );
        })}
      </div>

      {/* Right Controls: Hint, Sound, Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Hint Button (during gameplay) */}
        {showHintButton && (
          <button
            onClick={onUseHint}
            disabled={hintsDisabled}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black shadow-sm transition-all ${
              hintsDisabled
                ? 'opacity-40 bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white hover:scale-105 active:scale-95 text-[#241F3D] border border-[#FFB703]'
            }`}
            title="Use Hint"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#FFB703] fill-[#FFB703]" />
            <span className="font-mono text-xs">{availableHints}</span>
          </button>
        )}

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className="w-8 h-8 rounded-full bg-white border border-[#6C5CE7]/20 flex items-center justify-center text-[#241F3D] hover:scale-105 active:scale-95 transition-transform shadow-sm"
          title={sfxOn ? 'Mute Sound' : 'Enable Sound'}
        >
          {sfxOn ? (
            <Volume2 className="w-4 h-4 text-[#6C5CE7]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#6B6780]" />
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => {
            emojiIqAudio.playPop();
            onOpenSettings();
          }}
          className="w-8 h-8 rounded-full bg-white border border-[#6C5CE7]/20 flex items-center justify-center text-[#241F3D] hover:scale-105 active:scale-95 transition-transform shadow-sm"
          title="Game Settings"
        >
          <Settings className="w-4 h-4 text-[#6C5CE7]" />
        </button>
      </div>
    </header>
  );
};
