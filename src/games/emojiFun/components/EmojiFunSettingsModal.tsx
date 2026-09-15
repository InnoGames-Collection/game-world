/**
 * Emoji Fun — Settings Modal
 * Replicates the coral card settings menu from reference video (Sound, Music, Controls, Rules)
 */

import React from 'react';
import { X, Volume2, VolumeX, Music, Bell, Globe, HelpCircle } from 'lucide-react';
import { emojiAudio } from '../emojiAudio';

interface EmojiFunSettingsModalProps {
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onHowToPlay: () => void;
  onClose: () => void;
}

export const EmojiFunSettingsModal: React.FC<EmojiFunSettingsModalProps> = ({
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
  onHowToPlay,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      {/* Coral/Salmon Card (Matching Video Styling!) */}
      <div className="relative w-full max-w-xs sm:max-w-sm rounded-3xl bg-gradient-to-b from-[#f87171] via-[#fb7185] to-[#f43f5e] p-5 sm:p-6 shadow-2xl border-4 border-white/70 text-white flex flex-col items-center animate-in zoom-in-95 duration-200">
        {/* Red Circle 'X' Close Button */}
        <button
          onClick={() => {
            emojiAudio.playTap();
            onClose();
          }}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 border-2 border-white shadow-md flex items-center justify-center text-white z-20"
          aria-label="Close"
        >
          <X className="w-5 h-5 font-black" />
        </button>

        {/* Top Smiling Avatar (From Video!) */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#ffe082] to-[#ffca28] border-4 border-white shadow-lg flex items-center justify-center text-4xl mb-2">
          😊
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-center font-['Fredoka',sans-serif] tracking-wider mb-3 text-white drop-shadow">
          SETTINGS
        </h3>

        {/* Setting Toggles List */}
        <div className="w-full space-y-2.5 mb-4">
          {/* Sound Effects */}
          <div className="flex items-center justify-between bg-white/20 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/40">
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-yellow-300" />
              ) : (
                <VolumeX className="w-5 h-5 text-white/50" />
              )}
              <span className="text-sm font-black tracking-wide">Sound SFX</span>
            </div>
            <button
              onClick={() => {
                onToggleSound();
                emojiAudio.playTap();
              }}
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
                soundEnabled ? 'bg-emerald-400' : 'bg-slate-400/60'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Background Music */}
          <div className="flex items-center justify-between bg-white/20 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/40">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-black tracking-wide">Music</span>
            </div>
            <button
              onClick={() => {
                onToggleMusic();
                emojiAudio.playTap();
              }}
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
                musicEnabled ? 'bg-emerald-400' : 'bg-slate-400/60'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                  musicEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Language Info */}
          <div className="flex items-center justify-between bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/40 text-xs">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-200" />
              <span className="font-bold">Language</span>
            </div>
            <span className="font-black bg-white/20 px-2.5 py-0.5 rounded-full">English</span>
          </div>

          {/* How to Play Rules */}
          <button
            onClick={() => {
              emojiAudio.playTap();
              onHowToPlay();
            }}
            className="w-full flex items-center justify-between bg-white/20 hover:bg-white/30 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-black">
              <HelpCircle className="w-5 h-5 text-yellow-300" />
              <span>How To Play & Scoring</span>
            </div>
            <span className="text-xs font-bold bg-white/30 px-2 py-0.5 rounded-lg">Read</span>
          </button>
        </div>

        {/* OK / Home Button */}
        <button
          onClick={() => {
            emojiAudio.playTap();
            onClose();
          }}
          className="w-full py-3 px-6 rounded-2xl bg-gradient-to-b from-[#4fc3f7] via-[#29b6f6] to-[#0288d1] border-b-[5px] border-[#01579b] active:border-b-2 active:translate-y-1 text-white font-black text-lg tracking-wider uppercase font-['Fredoka',sans-serif] shadow-xl hover:brightness-105 transition-all"
        >
          OK
        </button>
      </div>
    </div>
  );
};
