/**
 * Statistics Modal for Block (Puzzle Block)
 * Displays real player career stats with no fabricated metrics.
 */

import React from 'react';
import { X, BarChart2, Flame, Award, Hash, CheckCircle, Trophy } from 'lucide-react';
import { PuzzleBlockSaveData } from '../types';

interface StatisticsModalProps {
  saveData: PuzzleBlockSaveData;
  onClose: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({ saveData, onClose }) => {
  const starsList = Object.values(saveData.stars || {}) as number[];
  const completedLevels = starsList.filter((s) => s > 0).length;

  const statItems = [
    {
      icon: <Trophy className="w-5 h-5 text-amber-300" />,
      label: 'Highest Score',
      value: (saveData.highestScore || 0).toLocaleString(),
      subtext: 'Single game record',
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      label: 'Levels Completed',
      value: `${completedLevels} / 40`,
      subtext: `${Math.round((completedLevels / 40) * 100)}% campaign progress`,
    },
    {
      icon: <Award className="w-5 h-5 text-cyan-400" />,
      label: 'Total Stars Earned',
      value: `${starsList.reduce((a, b) => a + b, 0)} / 120`,
      subtext: '3-star mastery',
    },
    {
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      label: 'Lines Cleared',
      value: (saveData.totalLinesCleared || 0).toLocaleString(),
      subtext: 'Horizontal & vertical rows',
    },
    {
      icon: <Hash className="w-5 h-5 text-purple-300" />,
      label: 'Blocks Placed',
      value: (saveData.totalBlocksPlaced || 0).toLocaleString(),
      subtext: 'Single cell units',
    },
    {
      icon: <BarChart2 className="w-5 h-5 text-amber-400" />,
      label: 'Games Played',
      value: (saveData.totalGamesPlayed || 0).toLocaleString(),
      subtext: 'Level attempts & sessions',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#6b2a12] via-[#4e1d0c] to-[#2c0d05] border-2 border-[#d97c38] shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)] p-6 flex flex-col items-center gap-4 text-amber-100 font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-amber-300" />
            </div>
            <h2 className="text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow">
              STATISTICS
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-[#341107] border border-[#6e2e14] text-amber-300 flex items-center justify-center cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-0.5">
          {statItems.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-[#240c06]/85 border border-[#8a3f20]/60 flex flex-col items-start shadow-inner"
            >
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 mb-1.5">
                {item.icon}
              </div>
              <span className="text-[11px] font-bold text-amber-300/90 leading-tight">
                {item.label}
              </span>
              <span className="text-base font-black text-amber-100 font-mono mt-0.5">
                {item.value}
              </span>
              <span className="text-[9px] text-amber-400/60 font-medium leading-tight mt-0.5">
                {item.subtext}
              </span>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-b from-[#8a3f20] to-[#501c09] text-amber-100 font-black text-sm border border-[#d97c38] shadow active:scale-95 transition-all flex items-center justify-center cursor-pointer mt-1 hover:brightness-110"
        >
          BACK TO MENU
        </button>
      </div>
    </div>
  );
};
