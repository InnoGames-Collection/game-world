import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Smartphone, Trash2, AlertTriangle, Check, X } from 'lucide-react';
import { MemoryMatchStorageData } from '../types';

interface SettingsModalProps {
  storage: MemoryMatchStorageData;
  onUpdateSettings: (newSettings: Partial<MemoryMatchStorageData>) => void;
  onResetProgress: () => void;
  onBack: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  storage,
  onUpdateSettings,
  onResetProgress,
  onBack,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <div className="w-full h-full flex flex-col text-white px-3 py-3 sm:p-5 overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif] max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Menu</span>
        </button>

        <span className="text-xs font-black text-white uppercase tracking-wider">SETTINGS</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 space-y-4 py-3">
        {/* Audio & Feedback Section */}
        <div className="bg-[#051424]/90 border border-white/10 rounded-2xl p-4 space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            AUDIO & FEEDBACK
          </span>

          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                {storage.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-black text-white">Sound Effects</div>
                <div className="text-[10px] text-slate-400">Card flips, matches, streaks & victories</div>
              </div>
            </div>

            <button
              onClick={() => onUpdateSettings({ soundEnabled: !storage.soundEnabled })}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                storage.soundEnabled ? 'bg-[#00C853]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  storage.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptics Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-white">Tactile Vibration</div>
                <div className="text-[10px] text-slate-400">Light touch feedback on card reveals</div>
              </div>
            </div>

            <button
              onClick={() => onUpdateSettings({ hapticsEnabled: !storage.hapticsEnabled })}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                storage.hapticsEnabled ? 'bg-[#00C853]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  storage.hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Danger Zone: Reset Progress */}
        <div className="bg-[#051424]/90 border border-rose-500/30 rounded-2xl p-4 space-y-3">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
            DANGER ZONE
          </span>

          {!showConfirmReset ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-white">Reset Tournament Progress</div>
                <div className="text-[10px] text-slate-400">
                  Erase scores, unlocked levels, and stats back to Level 1
                </div>
              </div>

              <button
                onClick={() => setShowConfirmReset(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/60 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Are you sure you want to reset all 40 levels?</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-snug">
                This will delete your cumulative tournament score and return you to Level 1. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={() => {
                    setShowConfirmReset(false);
                    onResetProgress();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Reset</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
