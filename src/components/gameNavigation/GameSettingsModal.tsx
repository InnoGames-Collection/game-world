import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Music, Vibrate, RotateCcw, X, ArrowLeft, Check } from 'lucide-react';
import { GameConfig } from './types';

interface GameSettingsModalProps {
  gameConfig: GameConfig;
  onClose: () => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({ gameConfig, onClose }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('teleplay_sound_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('teleplay_music_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('teleplay_haptics_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('teleplay_sound_enabled', next.toString());
  };

  const toggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    localStorage.setItem('teleplay_music_enabled', next.toString());
  };

  const toggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    localStorage.setItem('teleplay_haptics_enabled', next.toString());
  };

  const handleResetProgress = () => {
    try {
      localStorage.removeItem(`teleplay_stats_${gameConfig.gameId}`);
      localStorage.removeItem(`teleplay_lb_${gameConfig.gameId}`);
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        setShowResetConfirm(false);
      }, 1500);
    } catch {
      setShowResetConfirm(false);
    }
  };

  return (
    <div
      id="game-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="relative w-full max-w-md flex flex-col rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-white/15 shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-300">
              <Settings className="w-4 h-4" />
              <span className="text-xs font-black tracking-widest uppercase">SETTINGS</span>
            </div>
            <h3 className="text-base font-black text-white">{gameConfig.title}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white border border-white/15 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings List */}
        <div className="p-4 space-y-3">
          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-red-400" />}
              </div>
              <div>
                <div className="text-sm font-bold text-white">Sound Effects</div>
                <div className="text-[11px] text-slate-400">Game audio and action feedback</div>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-md absolute top-1 ${
                  soundEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Background Music</div>
                <div className="text-[11px] text-slate-400">Ambient tournament soundtrack</div>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleMusic}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                musicEnabled ? 'bg-purple-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-md absolute top-1 ${
                  musicEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Haptics Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Vibrate className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Haptic Feedback</div>
                <div className="text-[11px] text-slate-400">Tactile vibration on taps & pops</div>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleHaptics}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                hapticsEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-md absolute top-1 ${
                  hapticsEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Reset Progress Section */}
          <div className="pt-2">
            {showResetConfirm ? (
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-center space-y-3">
                {resetSuccess ? (
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 py-2">
                    <Check className="w-4 h-4" />
                    <span>Progress Reset Completed!</span>
                  </div>
                ) : (
                  <>
                    <div className="text-xs text-red-200 font-semibold leading-relaxed">
                      Reset local stats and scores for {gameConfig.title}?
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(false)}
                        className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleResetProgress}
                        className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                      >
                        Confirm Reset
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-98 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-red-300 flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Local Stats</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold uppercase tracking-wider text-white border border-white/15 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
