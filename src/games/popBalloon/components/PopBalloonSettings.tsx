import React, { useState } from 'react';
import { ArrowLeft, Settings, Volume2, VolumeX, RotateCcw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { PopBalloonProgress } from '../types';
import { INITIAL_PROGRESS, savePopBalloonProgress } from '../storage';

interface PopBalloonSettingsProps {
  isSoundOn: boolean;
  onToggleSound: () => void;
  progress: PopBalloonProgress;
  onResetProgress: () => void;
  onBack: () => void;
}

export const PopBalloonSettings: React.FC<PopBalloonSettingsProps> = ({
  isSoundOn,
  onToggleSound,
  progress,
  onResetProgress,
  onBack,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleConfirmReset = () => {
    savePopBalloonProgress(INITIAL_PROGRESS);
    onResetProgress();
    setShowConfirmReset(false);
  };

  return (
    <div
      id="pop-balloon-settings-view"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-5 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#070D1E] via-[#0D183A] to-[#070D1E] text-white overflow-y-auto custom-scrollbar"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-[#070D1E]/95 backdrop-blur-md z-20 shrink-0">
        <button
          id="pop-balloon-settings-back-btn"
          type="button"
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-md"
          title="Back to Menu"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <Settings className="w-5 h-5 text-slate-300" />
            <span>Settings</span>
          </h2>
          <p className="text-[11px] text-blue-300 font-bold uppercase tracking-widest">
            Pop Balloon Preferences
          </p>
        </div>

        <div className="w-11" />
      </div>

      {/* SETTINGS OPTIONS */}
      <div className="flex flex-col gap-3 my-4 flex-1">
        {/* SOUND FX */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              {isSoundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-sm font-black text-white">Audio & Sound FX</div>
              <div className="text-xs text-slate-400">Pops, beeps, fanfare and alerts</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${
              isSoundOn ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md absolute top-1 ${
                isSoundOn ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* RESET PROGRESS */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-white">Reset Tournament Progress</div>
              <div className="text-xs text-slate-400">Clear unlocked stages & level scores</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmReset(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs border border-rose-500/40 cursor-pointer transition-all active:scale-95"
          >
            Reset
          </button>
        </div>

        {/* CONFIRM RESET MODAL */}
        {showConfirmReset && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center animate-in zoom-in-95">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <div className="text-sm font-black text-white mb-1">Confirm Progress Reset?</div>
            <div className="text-xs text-slate-300 mb-3">
              This will reset all 40 unlocked stages and your cumulative tournament score to zero.
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-slate-500 pb-2">
        Pop Balloon v2.0 • 2026 Teleplay Tournament Edition
      </div>
    </div>
  );
};
