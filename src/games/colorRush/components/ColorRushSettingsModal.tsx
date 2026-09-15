/**
 * Color Rush - Game Settings & Tournament Rules Guide
 */

import React, { useState } from 'react';
import { 
  Settings, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  HelpCircle, 
  Trash2, 
  ShieldAlert, 
  Check, 
  X,
  Target,
  Zap,
  Flame,
  Award
} from 'lucide-react';
import { ColorRushProgression } from '../types';
import { ColorRushAudio } from '../colorRushAudio';
import { resetProgression } from '../persistence';

interface ColorRushSettingsModalProps {
  progression: ColorRushProgression;
  onUpdateProgression: (p: ColorRushProgression) => void;
  onBack: () => void;
}

export const ColorRushSettingsModal: React.FC<ColorRushSettingsModalProps> = ({
  progression,
  onUpdateProgression,
  onBack,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'RULES'>('SETTINGS');

  const toggleSound = () => {
    const next = !progression.soundEnabled;
    ColorRushAudio.setMuted(!next);
    if (next) ColorRushAudio.playTap();
    onUpdateProgression({
      ...progression,
      soundEnabled: next,
    });
  };

  const toggleHaptics = () => {
    ColorRushAudio.playTap();
    onUpdateProgression({
      ...progression,
      hapticsEnabled: !progression.hapticsEnabled,
    });
  };

  const handleReset = () => {
    ColorRushAudio.playWrong();
    const fresh = resetProgression();
    onUpdateProgression(fresh);
    setConfirmReset(false);
  };

  return (
    <div 
      className="relative w-full max-w-md mx-auto flex flex-col items-center select-none rounded-3xl overflow-hidden border-2 border-slate-700/60 shadow-2xl min-h-[640px] max-h-[92vh] font-['Plus_Jakarta_Sans',sans-serif] text-slate-100"
      style={{
        background: 'radial-gradient(circle at 50% 10%, #171e2e 0%, #0c121e 50%, #04060a 100%)',
      }}
    >
      {/* HEADER */}
      <div className="w-full bg-[#0d1624]/95 backdrop-blur-md px-4 py-3 border-b border-[#1b2b45] flex items-center justify-between gap-2 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              ColorRushAudio.playTap();
              onBack();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700 flex items-center justify-center text-slate-300 transition-all cursor-pointer shrink-0"
            title="Back to Menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-white tracking-tight">
              Settings & Rules
            </h2>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              ColorRushAudio.playTap();
              setActiveTab('SETTINGS');
            }}
            className={`px-2.5 py-1 rounded text-[10px] font-black uppercase cursor-pointer ${
              activeTab === 'SETTINGS' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Config
          </button>
          <button
            onClick={() => {
              ColorRushAudio.playTap();
              setActiveTab('RULES');
            }}
            className={`px-2.5 py-1 rounded text-[10px] font-black uppercase cursor-pointer ${
              activeTab === 'RULES' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Rules
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="relative w-full flex-1 overflow-y-auto p-4 space-y-4 z-10">
        
        {activeTab === 'SETTINGS' ? (
          <>
            {/* Audio Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  {progression.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
                </div>
                <div>
                  <div className="text-xs font-black text-white">Sound Effects</div>
                  <div className="text-[10px] text-slate-400">Zero-latency reaction audio</div>
                </div>
              </div>

              <button
                onClick={toggleSound}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  progression.soundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    progression.soundEnabled ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Haptics Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Vibrate className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">Haptic Vibration</div>
                  <div className="text-[10px] text-slate-400">Tactile touch click responses</div>
                </div>
              </div>

              <button
                onClick={toggleHaptics}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  progression.hapticsEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    progression.hapticsEnabled ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Reset Progress Section */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30">
              <div className="flex items-start gap-3 mb-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-black text-white">Reset Campaign Progress</div>
                  <div className="text-[10px] text-slate-400 leading-relaxed">
                    Resets unlocked levels back to Level 1 and clears cumulative career points. This action is irreversible.
                  </div>
                </div>
              </div>

              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset All Progress</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-rose-300 font-bold text-center">
                    Are you sure? All level completions will be erased.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm Reset</span>
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* TOURNAMENT RULES & SCORING GUIDE */
          <div className="space-y-3 text-left">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase">
                <Target className="w-4 h-4" />
                <span>1. Base Rule</span>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                Every correctly identified color grants <span className="font-bold text-white">+1 Base Point</span>. You always get this point for any correct match regardless of speed.
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase">
                <Zap className="w-4 h-4" />
                <span>2. Speed Bonuses</span>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <div>• <span className="text-amber-300 font-bold">+3 Bonus</span>: Very Fast (reaction &lt; 30% of time)</div>
                <div>• <span className="text-amber-300 font-bold">+2 Bonus</span>: Fast (30% - 60% of time)</div>
                <div>• <span className="text-amber-300 font-bold">+1 Bonus</span>: Normal (60% - 90% of time)</div>
                <div>• <span className="text-slate-400 font-bold">+0 Bonus</span>: Slow (last 10% of time)</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-black uppercase">
                <Flame className="w-4 h-4" />
                <span>3. Streak Multipliers</span>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <div>• <span className="text-orange-300 font-bold">+1 Bonus</span>: 3-4 consecutive correct answers</div>
                <div>• <span className="text-orange-300 font-bold">+2 Bonus</span>: 5-9 streak</div>
                <div>• <span className="text-orange-300 font-bold">+5 Bonus</span>: 10-14 streak</div>
                <div>• <span className="text-orange-300 font-bold">+8 Bonus</span>: 15+ legendary streak</div>
                <div className="text-[10px] text-slate-400 pt-1">Wrong choices or timeouts reset your streak to 0.</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase">
                <Award className="w-4 h-4" />
                <span>4. Anti-Farming Model</span>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                Your cumulative leaderboard score is the <span className="font-bold text-white">sum of your personal best score on each completed level</span>. You cannot endlessly farm easy levels; to climb the leaderboard, push into higher difficulty tiers and perfect your reaction speed!
              </div>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="w-full bg-[#0d1624]/95 backdrop-blur-md p-3 border-t border-[#1b2b45] flex items-center justify-center z-20 shrink-0">
        <button
          onClick={() => {
            ColorRushAudio.playTap();
            onBack();
          }}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};
