import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Smartphone, Gauge, Sliders, ShieldCheck } from 'lucide-react';
import { HillClimbStorage } from '../levelStorage';
import { HillClimbSettingsState } from '../types';

interface HillClimbSettingsProps {
  onClose: () => void;
}

export const HillClimbSettings: React.FC<HillClimbSettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<HillClimbSettingsState>(HillClimbStorage.getSettings());

  const handleToggle = (key: keyof HillClimbSettingsState) => {
    const updated = HillClimbStorage.saveSettings({ [key]: !settings[key] });
    setSettings(updated);
  };

  return (
    <div
      id="hill-climb-settings-view"
      className="relative w-full h-full min-h-[580px] flex flex-col p-3.5 sm:p-5 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#07172b] via-[#040e1c] to-[#02070e] text-white overflow-y-auto"
    >
      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to Menu"
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span>Settings</span>
          </h2>
          <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest">
            Audio, Controls & Physics
          </p>
        </div>

        <div className="w-11 h-11" />
      </header>

      {/* SETTINGS CARD */}
      <div className="relative z-10 my-auto max-w-md w-full mx-auto space-y-3 py-4">
        {/* Sound Effects Toggle */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-sm font-bold text-white">Sound Effects (SFX)</div>
              <div className="text-[11px] text-slate-400">Crash, landing, coin & fuel pickup audio</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('soundEnabled')}
            className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
              settings.soundEnabled ? 'bg-[#8BCB3D]' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Engine Sound Simulation Toggle */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8BCB3D]/20 border border-[#8BCB3D]/40 flex items-center justify-center text-[#8BCB3D]">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Dynamic Engine Audio</div>
              <div className="text-[11px] text-slate-400">Synthesized 4-cylinder RPM motor sound</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('engineSound')}
            className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
              settings.engineSound ? 'bg-[#8BCB3D]' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.engineSound ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Vibration / Haptics Toggle */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Haptic Vibration</div>
              <div className="text-[11px] text-slate-400">Vibrate on hard landing or chassis impact</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('vibration')}
            className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
              settings.vibration ? 'bg-[#8BCB3D]' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.vibration ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Driving Advice Callout */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1688C9]/15 to-transparent border border-cyan-500/30 text-xs text-slate-300 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-0.5">Highland Driving Tip:</span>
            Never hold Gas continuously over hill crests. Tap Brake in mid-air to level the nose forward and land on the downslope to conserve momentum!
          </div>
        </div>
      </div>

      {/* SAVE & CLOSE BUTTON */}
      <div className="relative z-10 w-full max-w-md mx-auto pt-2">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white font-bold text-sm uppercase tracking-wider transition-all cursor-pointer border border-white/20"
        >
          Close & Save
        </button>
      </div>
    </div>
  );
};
