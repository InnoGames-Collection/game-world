/**
 * Settings Modal for Block (Puzzle Block)
 * Audio controls, vibration toggles, and safe progress reset.
 */

import React, { useState } from 'react';
import { X, Settings, Volume2, VolumeX, Music, Smartphone, RotateCcw, AlertTriangle } from 'lucide-react';
import { PuzzleBlockSaveData } from '../types';

interface SettingsModalProps {
  saveData: PuzzleBlockSaveData;
  onUpdateSettings: (newSettings: Partial<PuzzleBlockSaveData>) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  saveData,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#6b2a12] via-[#4e1d0c] to-[#2c0d05] border-2 border-[#d97c38] shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)] p-6 flex flex-col items-center gap-4 text-amber-100 font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center">
              <Settings className="w-4 h-4 text-amber-300" />
            </div>
            <h2 className="text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow">
              SETTINGS
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-[#341107] border border-[#6e2e14] text-amber-300 flex items-center justify-center cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Sound Effects Toggle */}
          <div className="p-3 rounded-2xl bg-[#240c06]/85 border border-[#8a3f20]/60 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300">
                {saveData.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-amber-200">Sound Effects</span>
                <span className="text-[10px] text-amber-300/70">Placement & clear sounds</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ soundEnabled: !saveData.soundEnabled })}
              className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer border ${
                saveData.soundEnabled
                  ? 'bg-emerald-600 border-emerald-400 justify-end'
                  : 'bg-stone-800 border-stone-700 justify-start'
              } flex items-center`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>

          {/* Ambient Music Toggle */}
          <div className="p-3 rounded-2xl bg-[#240c06]/85 border border-[#8a3f20]/60 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300">
                <Music className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-amber-200">Ambient Music</span>
                <span className="text-[10px] text-amber-300/70">Calm wooden soundscape</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ musicEnabled: !saveData.musicEnabled })}
              className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer border ${
                saveData.musicEnabled
                  ? 'bg-emerald-600 border-emerald-400 justify-end'
                  : 'bg-stone-800 border-stone-700 justify-start'
              } flex items-center`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>

          {/* Haptic Vibration Toggle */}
          <div className="p-3 rounded-2xl bg-[#240c06]/85 border border-[#8a3f20]/60 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-amber-200">Haptic Feedback</span>
                <span className="text-[10px] text-amber-300/70">Vibration on drop & clears</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ hapticEnabled: !(saveData.hapticEnabled ?? true) })}
              className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer border ${
                (saveData.hapticEnabled ?? true)
                  ? 'bg-emerald-600 border-emerald-400 justify-end'
                  : 'bg-stone-800 border-stone-700 justify-start'
              } flex items-center`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>

          {/* Reset Progress Confirmation Section */}
          <div className="mt-1 p-3 rounded-2xl bg-[#240c06]/85 border border-red-900/50 flex flex-col gap-2">
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-2 px-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-red-900/60"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Level Progress...</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2 animate-in fade-in duration-100">
                <div className="flex items-center gap-1.5 text-xs text-red-300 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Reset all levels, stars & scores?</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onResetProgress();
                      setConfirmReset(false);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-red-700 text-white font-bold text-xs cursor-pointer hover:bg-red-600"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-1.5 rounded-lg bg-stone-800 text-stone-300 font-bold text-xs cursor-pointer hover:bg-stone-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-b from-[#8a3f20] to-[#501c09] text-amber-100 font-black text-sm border border-[#d97c38] shadow active:scale-95 transition-all flex items-center justify-center cursor-pointer mt-1 hover:brightness-110"
        >
          DONE
        </button>
      </div>
    </div>
  );
};
