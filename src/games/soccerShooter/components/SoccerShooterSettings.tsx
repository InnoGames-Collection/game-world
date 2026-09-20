import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Smartphone, Palette, RotateCcw } from 'lucide-react';

interface SoccerShooterSettingsProps {
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onResetProgress?: () => void;
  onClose: () => void;
}

export const SoccerShooterSettings: React.FC<SoccerShooterSettingsProps> = ({
  isAudioMuted,
  onToggleAudio,
  onResetProgress,
  onClose,
}) => {
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('teleplay_soccer_shooter_haptics') !== 'false';
    } catch {
      return true;
    }
  });

  const toggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    try {
      localStorage.setItem('teleplay_soccer_shooter_haptics', next.toString());
      if (next && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.(30);
      }
    } catch {}
  };

  return (
    <div
      id="soccer-shooter-settings-view"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#061224] via-[#091b36] to-[#040c18] overflow-y-auto custom-scrollbar"
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
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Settings</h2>
          <p className="text-[11px] text-cyan-300 font-bold uppercase tracking-widest">
            Audio & Gameplay Preferences
          </p>
        </div>

        <div className="w-11 h-11" />
      </header>

      {/* SETTINGS LIST */}
      <main className="relative z-10 flex-1 py-4 space-y-3 overflow-y-auto custom-scrollbar pr-1">
        {/* Audio Toggle */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              {isAudioMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase">Game Audio & SFX</div>
              <div className="text-[10px] text-slate-400">Procedural Web Audio synthesizer</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleAudio}
            className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${
              !isAudioMuted ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-transform shadow-md ${
                !isAudioMuted ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Haptic Feedback */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase">Vibration & Haptics</div>
              <div className="text-[10px] text-slate-400">Tactile impulses on bubble launch & pops</div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleHaptics}
            className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${
              hapticsEnabled ? 'bg-purple-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-transform shadow-md ${
                hapticsEnabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Graphics Shaders */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase">3D Visual Engine</div>
              <div className="text-[10px] text-slate-400">Glossy spherical specular lighting</div>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase border border-cyan-500/30">
            Active 60FPS
          </span>
        </div>

        {/* Reset Option if needed */}
        {onResetProgress && (
          <div className="pt-4">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all Soccer Shooter career progression and scores? This cannot be undone.')) {
                  onResetProgress();
                }
              }}
              className="w-full py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Career Progress</span>
            </button>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          Return to Menu
        </button>
      </footer>
    </div>
  );
};
