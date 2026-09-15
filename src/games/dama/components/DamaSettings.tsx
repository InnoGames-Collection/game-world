import React, { useState } from 'react';
import {
  ArrowLeft,
  Settings,
  Volume2,
  VolumeX,
  RotateCcw,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { DamaProgress } from '../types';

interface DamaSettingsProps {
  progress: DamaProgress;
  onToggleAudio: () => void;
  onResetProgress: () => void;
  onBack: () => void;
}

export const DamaSettings: React.FC<DamaSettingsProps> = ({
  progress,
  onToggleAudio,
  onResetProgress,
  onBack,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <div
      id="dama-settings-container"
      className="w-full max-w-xl mx-auto flex flex-col h-screen px-3 py-4 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          id="dama-settings-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Menu</span>
        </button>

        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-black text-white uppercase tracking-wide">
            Settings
          </span>
        </div>

        <div className="w-12" />
      </div>

      {/* Settings list */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {/* Audio Toggle */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {progress.settings.isAudioMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Game Sound Effects</span>
              <span className="text-xs text-slate-400">
                Acoustic wooden piece sliding and capture audio
              </span>
            </div>
          </div>

          <button
            id="dama-settings-audio-toggle-btn"
            onClick={onToggleAudio}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !progress.settings.isAudioMuted
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {!progress.settings.isAudioMuted ? 'ON' : 'MUTED'}
          </button>
        </div>

        {/* Reset Progress */}
        <div className="bg-slate-900/90 border border-red-950/60 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Reset Tournament Progress</span>
              <span className="text-xs text-slate-400">
                Clears unlocked levels, cumulative scores, and records back to Level 1
              </span>
            </div>
          </div>

          {!showConfirmReset ? (
            <button
              id="dama-settings-reset-init-btn"
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 text-red-300 font-bold text-xs transition-all cursor-pointer active:scale-95"
            >
              Reset All Progress
            </button>
          ) : (
            <div className="bg-red-950/60 border border-red-600/60 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-red-200 font-semibold">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Are you sure? This action cannot be undone!</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  id="dama-settings-reset-cancel-btn"
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="dama-settings-reset-confirm-btn"
                  onClick={() => {
                    onResetProgress();
                    setShowConfirmReset(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-black cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
