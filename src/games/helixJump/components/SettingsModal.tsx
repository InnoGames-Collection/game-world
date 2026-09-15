/**
 * Helix Jump Settings Modal
 * Audio toggles, haptic feedback, and progress reset with confirmation.
 */

import React, { useState } from 'react';
import { X, Settings, Volume2, VolumeX, Music, Smartphone, RotateCcw, AlertTriangle } from 'lucide-react';
import { helixAudio } from '../audioEngine';
import { HelixJumpSaveData } from '../types';

interface SettingsModalProps {
  saveData: HelixJumpSaveData;
  onUpdateSettings: (settings: Partial<HelixJumpSaveData>) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  saveData,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <div
      id="helix-settings-modal"
      className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-700/40 text-slate-300 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider leading-none">
                Settings
              </h2>
              <p className="text-[11px] font-bold text-slate-400 mt-1">
                Audio & Preferences
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              helixAudio.playButtonClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Options */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
          {/* Sound FX */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                {saveData.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-sm font-bold text-white">Sound FX</div>
                <div className="text-[11px] text-slate-400">Bounces, chimes, and impacts</div>
              </div>
            </div>
            <button
              onClick={() => {
                helixAudio.playButtonClick();
                onUpdateSettings({ soundEnabled: !saveData.soundEnabled });
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                saveData.soundEnabled ? 'bg-sky-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Background Ambient Music */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Ambient Synth</div>
                <div className="text-[11px] text-slate-400">Subtle background resonance</div>
              </div>
            </div>
            <button
              onClick={() => {
                helixAudio.playButtonClick();
                onUpdateSettings({ musicEnabled: !saveData.musicEnabled });
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                saveData.musicEnabled ? 'bg-purple-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Haptic Feedback */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Haptic Vibration</div>
                <div className="text-[11px] text-slate-400">Touch pulses on mobile devices</div>
              </div>
            </div>
            <button
              onClick={() => {
                helixAudio.playButtonClick();
                onUpdateSettings({ hapticsEnabled: !saveData.hapticsEnabled });
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                saveData.hapticsEnabled ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Reset Progress Section */}
          <div className="mt-2 pt-3 border-t border-white/10">
            {!showConfirmReset ? (
              <button
                onClick={() => {
                  helixAudio.playButtonClick();
                  setShowConfirmReset(true);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All Progress
              </button>
            ) : (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex flex-col gap-2.5">
                <div className="flex items-start gap-2 text-rose-300">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <p className="text-xs font-bold leading-tight">
                    Are you sure? This will lock all levels back to Level 1 and reset your stars.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => {
                      helixAudio.playButtonClick();
                      setShowConfirmReset(false);
                    }}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      helixAudio.playButtonClick();
                      setShowConfirmReset(false);
                      onResetProgress();
                    }}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-colors cursor-pointer shadow-md shadow-rose-900/40"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
