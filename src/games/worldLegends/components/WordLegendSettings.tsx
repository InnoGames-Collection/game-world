import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, RotateCcw, AlertTriangle, Check, Smartphone, Music } from 'lucide-react';
import { WorldLegendsProgress, resetWorldLegendsProgress } from '../worldLegendsStorage';

const WOOD_MATERIAL = {
  hud: {
    background: 'linear-gradient(180deg, #f5d499 0%, #e0b06b 50%, #c98e40 100%)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 3px 6px rgba(0,0,0,0.35)',
  },
  tileOrButton: {
    background: 'linear-gradient(180deg, #fff2db 0%, #f6ce8e 45%, #e2a652 100%)',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.9), 0 3px 0 #915a1a, 0 5px 8px rgba(0,0,0,0.4)',
  },
  modalCard: {
    background: 'linear-gradient(180deg, #fce09d 0%, #f3c275 50%, #df9533 100%)',
    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 10px 25px rgba(0,0,0,0.6)',
  },
};

interface WordLegendSettingsProps {
  progress: WorldLegendsProgress;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onProgressReset: (resetProgress: WorldLegendsProgress) => void;
  onBack: () => void;
}

export const WordLegendSettings: React.FC<WordLegendSettingsProps> = ({
  progress,
  isAudioEnabled,
  onToggleAudio,
  onProgressReset,
  onBack,
}) => {
  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('world_legends_music_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('world_legends_vibration_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  const toggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    try {
      localStorage.setItem('world_legends_music_enabled', String(next));
    } catch {
      // ignore
    }
  };

  const toggleVibration = () => {
    const next = !vibrationEnabled;
    setVibrationEnabled(next);
    try {
      localStorage.setItem('world_legends_vibration_enabled', String(next));
    } catch {
      // ignore
    }
  };

  const handleConfirmReset = () => {
    const resetProg = resetWorldLegendsProgress();
    onProgressReset(resetProg);
    setShowResetConfirm(false);
    setResetSuccessMessage('Campaign progress reset to Level 1');
    setTimeout(() => setResetSuccessMessage(null), 3000);
  };

  return (
    <div 
      className="relative w-full max-w-md mx-auto h-[600px] sm:h-[650px] rounded-3xl overflow-hidden flex flex-col select-none touch-none shadow-2xl border-4 border-[#b37324] font-['Plus_Jakarta_Sans',sans-serif]"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), inset 0 0 0 2px #f1bc68, inset 0 0 25px rgba(0,0,0,0.4)',
        background: 'linear-gradient(180deg, #1e0e06 0%, #112815 50%, #0a170c 100%)',
      }}
    >
      {/* Top Header */}
      <div 
        className="w-full px-4 py-3 flex items-center justify-between border-b-2 border-[#b37324] shrink-0"
        style={WOOD_MATERIAL.hud}
      >
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl text-[#22140a] flex items-center gap-1.5 font-bold text-xs border border-[#c98833] active:scale-95 transition-all cursor-pointer shadow-sm"
          style={WOOD_MATERIAL.tileOrButton}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK</span>
        </button>

        <h2 className="text-base font-black text-[#22140a] uppercase tracking-wider font-serif">
          SETTINGS
        </h2>

        <div className="w-16" />
      </div>

      {/* Main Settings Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {resetSuccessMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold text-center animate-in fade-in flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>{resetSuccessMessage}</span>
          </div>
        )}

        {/* Audio & Haptic Controls Section */}
        <div 
          className="rounded-2xl p-4 border border-[#b37324] shadow-md space-y-3"
          style={WOOD_MATERIAL.modalCard}
        >
          <div className="text-[10px] font-bold text-[#5c3510] uppercase tracking-wider border-b border-[#b37324]/30 pb-1.5">
            AUDIO & HAPTICS
          </div>

          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#22140a] border border-[#c98833]"
                style={WOOD_MATERIAL.tileOrButton}
              >
                {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-black text-[#22140a]">Sound Effects</div>
                <div className="text-[10px] text-[#5c3510]">Tactile clicks, word fanfare</div>
              </div>
            </div>

            <button
              onClick={onToggleAudio}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer border ${
                isAudioEnabled ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-700 border-slate-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-sm ${
                  isAudioEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Background Ambient Music Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-[#b37324]/20">
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#22140a] border border-[#c98833]"
                style={WOOD_MATERIAL.tileOrButton}
              >
                <Music className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-[#22140a]">Background Music</div>
                <div className="text-[10px] text-[#5c3510]">Subtle acoustic atmosphere</div>
              </div>
            </div>

            <button
              onClick={toggleMusic}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer border ${
                musicEnabled ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-700 border-slate-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-sm ${
                  musicEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Device Haptic Vibration Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-[#b37324]/20">
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#22140a] border border-[#c98833]"
                style={WOOD_MATERIAL.tileOrButton}
              >
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-[#22140a]">Haptic Vibration</div>
                <div className="text-[10px] text-[#5c3510]">Tactile buzz on word found</div>
              </div>
            </div>

            <button
              onClick={toggleVibration}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer border ${
                vibrationEnabled ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-700 border-slate-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-sm ${
                  vibrationEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Current Campaign Info */}
        <div 
          className="rounded-2xl p-4 border border-[#b37324] shadow-md space-y-2"
          style={WOOD_MATERIAL.modalCard}
        >
          <div className="text-[10px] font-bold text-[#5c3510] uppercase tracking-wider border-b border-[#b37324]/30 pb-1.5">
            CAMPAIGN STATUS
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#5c3510] font-bold">Highest Level Unlocked:</span>
            <span className="font-black text-[#22140a] font-mono">Level {progress.unlockedLevel} / 40</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#5c3510] font-bold">Tournament Stars:</span>
            <span className="font-black text-[#22140a] font-mono">{progress.totalStars} ⭐</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#5c3510] font-bold">Words Found in Career:</span>
            <span className="font-black text-[#22140a] font-mono">{progress.wordsFoundCount}</span>
          </div>
        </div>

        {/* Danger Zone: Reset Campaign */}
        <div className="pt-2">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-3 rounded-xl bg-rose-950/40 hover:bg-rose-950/60 text-rose-300 border border-rose-800/60 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Campaign Progress</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-700 text-left space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5 text-rose-300">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <div className="text-xs font-black text-white">Reset all 40 levels?</div>
                  <div className="text-[10px] text-rose-200 mt-0.5">
                    This will relock levels 2–40, reset your stars to 0, and clear high scores. This cannot be undone.
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmReset}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-slate-700"
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
