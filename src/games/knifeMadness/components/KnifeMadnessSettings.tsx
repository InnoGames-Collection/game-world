/**
 * KNIFE MADNESS - Settings Screen
 * Audio controls and data management with confirmation modal.
 */

import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, RotateCcw, AlertTriangle, Check } from 'lucide-react';

interface KnifeMadnessSettingsProps {
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onResetProgress: () => void;
  onBack: () => void;
}

export const KnifeMadnessSettings: React.FC<KnifeMadnessSettingsProps> = ({
  isAudioEnabled,
  onToggleAudio,
  onResetProgress,
  onBack,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleConfirmReset = () => {
    onResetProgress();
    setShowConfirmReset(false);
  };

  return (
    <div
      id="knife-madness-settings"
      className="relative w-full h-full max-w-md mx-auto flex flex-col p-4 bg-[#050e1d] text-white select-none overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          id="btn-settings-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Menu</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-black uppercase tracking-wider text-amber-300">
            Settings
          </h2>
          <p className="text-[10px] text-slate-400">Audio & Data</p>
        </div>

        <div className="w-14" />
      </div>

      {/* Settings Options */}
      <div className="space-y-3 my-4">
        {/* Sound Effects */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              {isAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Sound Effects</div>
              <div className="text-[11px] text-slate-400">Procedural Web Audio synthesis</div>
            </div>
          </div>

          <button
            onClick={onToggleAudio}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
              isAudioEnabled
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {isAudioEnabled ? 'ON' : 'MUTED'}
          </button>
        </div>

        {/* Reset Progress */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Reset Progress</div>
              <div className="text-[11px] text-slate-400">Clear level records and career score</div>
            </div>
          </div>

          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-red-950/60 border border-red-800 text-red-300 hover:bg-red-900 transition active:scale-95"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-red-500/60 rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black uppercase text-red-300 mb-1">
              Reset Career Progress?
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              This will permanently reset your 40-stage progress, cumulative score, and best times. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase transition shadow-lg"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
