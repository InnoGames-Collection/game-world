/**
 * Helix Jump Statistics Modal
 * Real-time gameplay statistics tracker.
 */

import React from 'react';
import { X, BarChart3, Trophy, Award, Flame, Skull, Target, Layers } from 'lucide-react';
import { helixAudio } from '../audioEngine';
import { HelixJumpSaveData } from '../types';

interface StatisticsModalProps {
  saveData: HelixJumpSaveData;
  onClose: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({ saveData, onClose }) => {
  const stats = [
    {
      label: 'Highest Level Unlocked',
      value: `Level ${saveData.highestUnlockedLevel} / 40`,
      icon: Layers,
      color: 'text-sky-400 bg-sky-500/20 border-sky-500/30',
    },
    {
      label: 'Total Levels Completed',
      value: `${saveData.levelsCompleted || 0}`,
      icon: Award,
      color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    },
    {
      label: 'Best Run Score',
      value: (saveData.bestScore || 0).toLocaleString(),
      icon: Trophy,
      color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    },
    {
      label: 'Total Score Accumulated',
      value: (saveData.totalScore || 0).toLocaleString(),
      icon: Target,
      color: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    },
    {
      label: 'Best Streak',
      value: `${saveData.bestStreak || 0} levels`,
      icon: Flame,
      color: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
    },
    {
      label: 'Total Games Played',
      value: `${saveData.totalGames || 0}`,
      icon: BarChart3,
      color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    },
    {
      label: 'Total Failures (Red Hits)',
      value: `${saveData.totalFailures || 0}`,
      icon: Skull,
      color: 'text-slate-400 bg-slate-700/30 border-slate-600/30',
    },
  ];

  return (
    <div
      id="helix-statistics-modal"
      className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider leading-none">
                Statistics
              </h2>
              <p className="text-[11px] font-bold text-slate-400 mt-1">
                Lifetime Career Records
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

        {/* Stats Grid */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
          {stats.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${st.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-300">
                    {st.label}
                  </span>
                </div>
                <span className="text-sm font-black text-white">
                  {st.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
