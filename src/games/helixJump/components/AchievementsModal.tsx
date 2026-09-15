/**
 * Helix Jump Achievements Modal
 * Displays player achievements with real unlocked state tracking.
 */

import React from 'react';
import { X, Trophy, Flag, Zap, Shield, Award, Crown, CheckCircle2, Lock } from 'lucide-react';
import { helixAudio } from '../audioEngine';
import { HELIX_ACHIEVEMENTS } from '../constants';
import { HelixJumpSaveData } from '../types';

interface AchievementsModalProps {
  saveData: HelixJumpSaveData;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Flag,
  Trophy,
  Zap,
  Shield,
  Award,
  Crown,
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ saveData, onClose }) => {
  const unlockedIds = new Set(saveData.achievements || []);

  return (
    <div
      id="helix-achievements-modal"
      className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider leading-none">
                Achievements
              </h2>
              <p className="text-[11px] font-bold text-slate-400 mt-1">
                {unlockedIds.size} of {HELIX_ACHIEVEMENTS.length} Unlocked
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              helixAudio.playButtonClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Achievements List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
          {HELIX_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlockedIds.has(ach.id);
            const IconComponent = ICON_MAP[ach.icon] || Trophy;

            return (
              <div
                key={ach.id}
                className={`p-3 rounded-2xl border flex items-start gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-100'
                    : 'bg-white/5 border-white/10 text-slate-400 opacity-70'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isUnlocked ? (
                    <IconComponent className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-black ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>
                      {ach.title}
                    </span>
                    {isUnlocked && (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Done
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
