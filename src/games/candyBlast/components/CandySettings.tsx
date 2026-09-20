import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Music, Smartphone, RotateCcw, AlertTriangle, Check, ShieldCheck } from 'lucide-react';
import { PlayerProgress } from '../types';
import { resetPlayerProgress } from '../levelStorage';

interface CandySettingsProps {
  progress: PlayerProgress;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onProgressReset: (newProgress: PlayerProgress) => void;
  onBack: () => void;
}

export const CandySettings: React.FC<CandySettingsProps> = ({
  progress,
  isAudioEnabled,
  onToggleAudio,
  onProgressReset,
  onBack,
}) => {
  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('candy_crush_music_pref');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('candy_crush_vibrate_pref');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const toggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    try {
      localStorage.setItem('candy_crush_music_pref', String(next));
    } catch {
      // ignore
    }
  };

  const toggleVibration = () => {
    const next = !vibrationEnabled;
    setVibrationEnabled(next);
    try {
      localStorage.setItem('candy_crush_vibrate_pref', String(next));
      if (next && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch {
      // ignore
    }
  };

  const handleConfirmReset = () => {
    const fresh = resetPlayerProgress();
    onProgressReset(fresh);
    setShowResetConfirm(false);
  };

  return (
    <div
      id="candy-settings-screen"
      className="relative w-full max-w-md mx-auto h-[640px] sm:h-[680px] rounded-3xl overflow-hidden shadow-2xl flex flex-col p-4 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif] border-2 border-pink-500/40 select-none text-white animate-in fade-in"
      style={{
        background: 'radial-gradient(circle at 50% 15%, #3b0764 0%, #1e1035 45%, #0a0614 100%)',
      }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <button
          id="candy-settings-back-btn"
          type="button"
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white/90 border border-white/15 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-black text-white uppercase tracking-wider">
            SETTINGS
          </h2>
          <span className="text-[10px] text-pink-300 font-bold uppercase tracking-wide">
            GAME PREFERENCES
          </span>
        </div>

        <div className="w-[44px]" />
      </div>

      {/* SETTINGS OPTIONS */}
      <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-3 scrollbar-thin">
        {/* Sound Effects Toggle */}
        <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300">
              {isAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
            </div>
            <div>
              <div className="text-xs font-black text-white uppercase tracking-wide">
                SOUND EFFECTS
              </div>
              <p className="text-[11px] text-slate-300">
                Match pops, sugar blasts & cascades
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleAudio}
            className={`min-w-[48px] min-h-[32px] px-3 rounded-full text-xs font-black transition-all cursor-pointer border ${
              isAudioEnabled
                ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md'
                : 'bg-white/10 border-white/20 text-slate-400'
            }`}
          >
            {isAudioEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Music Toggle */}
        <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white uppercase tracking-wide">
                BACKGROUND JINGLES
              </div>
              <p className="text-[11px] text-slate-300">
                Level melodies & ambient celebration
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleMusic}
            className={`min-w-[48px] min-h-[32px] px-3 rounded-full text-xs font-black transition-all cursor-pointer border ${
              musicEnabled
                ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md'
                : 'bg-white/10 border-white/20 text-slate-400'
            }`}
          >
            {musicEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Tactile Haptic Vibration Toggle */}
        <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white uppercase tracking-wide">
                HAPTIC FEEDBACK
              </div>
              <p className="text-[11px] text-slate-300">
                Subtle vibration on special candy blasts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleVibration}
            className={`min-w-[48px] min-h-[32px] px-3 rounded-full text-xs font-black transition-all cursor-pointer border ${
              vibrationEnabled
                ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md'
                : 'bg-white/10 border-white/20 text-slate-400'
            }`}
          >
            {vibrationEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Security & Free Play Guarantee */}
        <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-400/30 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-pink-300 shrink-0" />
          <p className="text-[11px] text-pink-200 leading-snug">
            Free Arcade Match: All 40 levels are free to unlock without any coin payment or entry fee.
          </p>
        </div>

        {/* Reset Progress Section */}
        <div className="pt-2">
          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="w-full min-h-[44px] py-2.5 px-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Campaign Progress</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/60 space-y-2.5 text-center animate-in fade-in">
              <div className="flex items-center justify-center gap-1.5 text-rose-300 text-xs font-black uppercase">
                <AlertTriangle className="w-4 h-4" />
                <span>Reset to Level 1?</span>
              </div>
              <p className="text-[11px] text-slate-300">
                This will reset your campaign progress to Level 1.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="flex-1 min-h-[38px] py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase cursor-pointer"
                >
                  Yes, Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 min-h-[38px] py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs uppercase cursor-pointer"
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
