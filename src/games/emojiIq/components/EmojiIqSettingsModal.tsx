/**
 * EMOJI IQ — Settings Modal
 * Audio toggles, Home shortcut, and progress management.
 */

import React, { useState } from 'react';
import { EMOJI_IQ_COLORS } from '../colors';
import { X, Volume2, VolumeX, Music, Home, RotateCcw } from 'lucide-react';
import { emojiIqAudio } from '../emojiIqAudio';

interface EmojiIqSettingsModalProps {
  onGoHome: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const EmojiIqSettingsModal: React.FC<EmojiIqSettingsModalProps> = ({
  onGoHome,
  onResetProgress,
  onClose,
}) => {
  const [sfx, setSfx] = useState(emojiIqAudio.sfxEnabled);
  const [music, setMusic] = useState(emojiIqAudio.musicEnabled);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const toggleSfx = () => {
    const next = emojiIqAudio.toggleSfx();
    setSfx(next);
  };

  const toggleMusic = () => {
    const next = emojiIqAudio.toggleMusic();
    setMusic(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl flex flex-col border-2 border-[#6C5CE7]/30 animate-in zoom-in-95">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h2
            className="text-lg font-black font-['Fredoka',sans-serif] tracking-wide uppercase"
            style={{ color: EMOJI_IQ_COLORS.textPrimary }}
          >
            SETTINGS
          </h2>

          <button
            onClick={() => {
              emojiIqAudio.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#241F3D] hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="w-full flex flex-col gap-3 mb-4">
          {/* SFX Toggle */}
          <div className="p-3 rounded-2xl border border-slate-100 bg-[#F7F5FF] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-[#6C5CE7]" />
              <span className="text-sm font-bold text-[#241F3D]">Sound Effects</span>
            </div>
            <button
              onClick={toggleSfx}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                sfx ? 'bg-[#20C997]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  sfx ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Music Toggle */}
          <div className="p-3 rounded-2xl border border-slate-100 bg-[#F7F5FF] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Music className="w-5 h-5 text-[#00B8D9]" />
              <span className="text-sm font-bold text-[#241F3D]">Background Chimes</span>
            </div>
            <button
              onClick={toggleMusic}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                music ? 'bg-[#20C997]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  music ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Return Home Button */}
          <button
            onClick={() => {
              emojiIqAudio.playPop();
              onGoHome();
              onClose();
            }}
            className="w-full p-3 rounded-2xl border border-[#6C5CE7]/30 bg-white flex items-center justify-center gap-2 font-black text-sm text-[#6C5CE7] hover:bg-[#F7F5FF] transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Main Menu</span>
          </button>
        </div>

        {/* Reset Progress */}
        {showConfirmReset ? (
          <div className="p-3 rounded-2xl border border-[#FF5A67]/30 bg-red-50 flex flex-col items-center gap-2 text-center mb-2">
            <span className="text-xs font-bold text-[#FF5A67]">
              Reset all levels, stars & scores?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onResetProgress();
                  setShowConfirmReset(false);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#FF5A67] text-white text-xs font-black"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="w-full py-2 text-center text-xs font-bold text-slate-400 hover:text-[#FF5A67] transition-colors mb-2"
          >
            Reset Progress
          </button>
        )}

        {/* Close */}
        <button
          onClick={() => {
            emojiIqAudio.playPop();
            onClose();
          }}
          className="w-full py-3 rounded-2xl bg-slate-100 font-bold text-sm text-[#241F3D] hover:bg-slate-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
