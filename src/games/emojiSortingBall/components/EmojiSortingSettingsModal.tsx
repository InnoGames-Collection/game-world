import React, { useState } from 'react';
import { Settings, X, Volume2, VolumeX, Smartphone, RotateCcw, AlertTriangle } from 'lucide-react';
import { emojiSortingAudio } from '../emojiSortingAudio';

interface EmojiSortingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetProgress: () => void;
}

export const EmojiSortingSettingsModal: React.FC<EmojiSortingSettingsModalProps> = ({
  isOpen,
  onClose,
  onResetProgress,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(emojiSortingAudio.isAudioEnabled);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    emojiSortingAudio.isAudioEnabled = next;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif] text-slate-800"
      style={{
        background: `
          radial-gradient(circle at 18% 12%, #FFE8E8 0%, transparent 48%),
          radial-gradient(circle at 82% 16%, #E8F6FF 0%, transparent 45%),
          radial-gradient(circle at 50% 45%, #F7EFFF 0%, transparent 60%),
          radial-gradient(circle at 15% 85%, #E7F9F3 0%, transparent 50%),
          radial-gradient(circle at 85% 88%, #FFE8E8 0%, transparent 45%),
          #FAF7FD
        `,
      }}
    >
      <div className="w-full max-w-md mx-auto space-y-4 pb-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                SETTINGS
              </h2>
              <p className="text-xs text-slate-500">Audio & Gameplay Preferences</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border border-purple-100 shadow-xs"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggles */}
        <div className="space-y-2.5">
          {/* Sound FX */}
          <div className="p-3.5 rounded-2xl bg-white/90 border border-purple-100 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Sound Effects</div>
                <div className="text-[11px] text-slate-500">Tactile pops & fanfare synthesis</div>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                soundEnabled ? 'bg-violet-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-1 ${
                  soundEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Haptics */}
          <div className="p-3.5 rounded-2xl bg-white/90 border border-purple-100 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Vibration / Haptics</div>
                <div className="text-[11px] text-slate-500">Tactile tap feedback</div>
              </div>
            </div>
            <button
              onClick={() => setHapticsEnabled(!hapticsEnabled)}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                hapticsEnabled ? 'bg-pink-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-1 ${
                  hapticsEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reset Progress Section */}
        <div className="p-3.5 rounded-2xl bg-red-50/80 border border-red-200 shadow-xs space-y-2">
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-red-50 text-red-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-red-200 shadow-2xs"
            >
              <RotateCcw className="w-4 h-4 text-red-600" />
              <span>Reset Emoji Sorting Progress</span>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-red-700 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>Reset all unlocked levels and scores?</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onResetProgress();
                    setShowConfirmReset(false);
                  }}
                  className="py-2 px-3 rounded-lg bg-red-600 text-white text-xs font-black uppercase cursor-pointer hover:bg-red-700 shadow-xs"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="py-2 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer hover:bg-slate-50 shadow-2xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
