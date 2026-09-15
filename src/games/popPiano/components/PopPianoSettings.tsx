import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, RotateCcw, AlertTriangle, Check, ShieldCheck } from 'lucide-react';

interface PopPianoSettingsProps {
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onResetProgress: () => void;
  onBack: () => void;
}

export const PopPianoSettings: React.FC<PopPianoSettingsProps> = ({
  isAudioMuted,
  onToggleAudio,
  onResetProgress,
  onBack,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <div
      id="pop-piano-settings-view"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white overflow-y-auto custom-scrollbar"
    >
      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-[#0B132B]/90 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Menu"
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
            Settings
          </h2>
          <p className="text-[11px] text-cyan-300 font-bold uppercase tracking-widest">
            Audio & Data Preferences
          </p>
        </div>

        <div className="w-11" />
      </header>

      {/* SETTINGS OPTIONS */}
      <div className="my-6 max-w-md mx-auto w-full space-y-4">
        {/* AUDIO MUTE TOGGLE */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-cyan-400">
              {isAudioMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-sm font-bold text-white">Acoustic Piano Audio</div>
              <div className="text-[11px] text-slate-400">
                {isAudioMuted ? 'Polyphonic synth muted' : 'Harmonic Web Audio active'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleAudio}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              isAudioMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
          >
            {isAudioMuted ? 'Unmute' : 'Muted'}
          </button>
        </div>

        {/* RESET PROGRESS */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Reset Tournament Progress</div>
                <div className="text-[11px] text-slate-400">
                  Wipe local best scores, stats, & unlocked levels
                </div>
              </div>
            </div>

            {!showConfirmReset ? (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Reset
              </button>
            ) : null}
          </div>

          {/* CONFIRMATION ACCORDION */}
          {showConfirmReset && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-bold mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Are you sure? This cannot be undone.</span>
              </div>
              <p className="text-[11px] text-slate-300 mb-3">
                All 40 levels will reset to Level 1 unlocked, and career statistics will be cleared.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetProgress();
                    setShowConfirmReset(false);
                  }}
                  className="min-h-[44px] flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Confirm Wipe
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="min-h-[44px] flex-1 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
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
