/**
 * Achievements / Trophies Modal for Block (Puzzle Block)
 * Real unlock states determined from actual player save data.
 */

import React from 'react';
import { X, Trophy, CheckCircle2, Lock } from 'lucide-react';
import { PuzzleBlockSaveData } from '../types';

interface AchievementsModalProps {
  saveData: PuzzleBlockSaveData;
  onClose: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progressText: string;
  percent: number;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ saveData, onClose }) => {
  const starsList = Object.values(saveData.stars || {}) as number[];
  const completedLevels = starsList.filter((s) => s > 0).length;
  const totalStars = starsList.reduce((a, b) => a + b, 0);
  const totalLines = saveData.totalLinesCleared || 0;
  const totalBlocks = saveData.totalBlocksPlaced || 0;
  const highestScore = saveData.highestScore || 0;

  const achievements: Achievement[] = [
    {
      id: 'first_steps',
      title: 'First Clearance',
      description: 'Complete Level 1 of the campaign',
      unlocked: completedLevels >= 1,
      progressText: completedLevels >= 1 ? '1 / 1' : '0 / 1',
      percent: Math.min(100, (completedLevels / 1) * 100),
    },
    {
      id: 'ten_lines',
      title: 'Line Clearer',
      description: 'Clear 10 total horizontal or vertical lines',
      unlocked: totalLines >= 10,
      progressText: `${Math.min(10, totalLines)} / 10`,
      percent: Math.min(100, (totalLines / 10) * 100),
    },
    {
      id: 'fifty_lines',
      title: 'Grid Master',
      description: 'Clear 50 total lines',
      unlocked: totalLines >= 50,
      progressText: `${Math.min(50, totalLines)} / 50`,
      percent: Math.min(100, (totalLines / 50) * 100),
    },
    {
      id: 'hundred_blocks',
      title: 'Block Enthusiast',
      description: 'Place 100 total polyomino blocks',
      unlocked: totalBlocks >= 100,
      progressText: `${Math.min(100, totalBlocks)} / 100`,
      percent: Math.min(100, (totalBlocks / 100) * 100),
    },
    {
      id: 'score_2000',
      title: 'High Scorer',
      description: 'Achieve a score of 2,000 or higher in a single level',
      unlocked: highestScore >= 2000,
      progressText: `${Math.min(2000, highestScore).toLocaleString()} / 2,000`,
      percent: Math.min(100, (highestScore / 2000) * 100),
    },
    {
      id: 'score_5000',
      title: 'Grandmaster',
      description: 'Achieve a score of 5,000 or higher in a single level',
      unlocked: highestScore >= 5000,
      progressText: `${Math.min(5000, highestScore).toLocaleString()} / 5,000`,
      percent: Math.min(100, (highestScore / 5000) * 100),
    },
    {
      id: 'five_levels',
      title: 'Campaign Climber',
      description: 'Complete 5 campaign levels',
      unlocked: completedLevels >= 5,
      progressText: `${Math.min(5, completedLevels)} / 5`,
      percent: Math.min(100, (completedLevels / 5) * 100),
    },
    {
      id: 'star_collector',
      title: 'Star Collector',
      description: 'Earn 15 total golden stars',
      unlocked: totalStars >= 15,
      progressText: `${Math.min(15, totalStars)} / 15`,
      percent: Math.min(100, (totalStars / 15) * 100),
    },
    {
      id: 'daily_hero',
      title: 'Daily Challenger',
      description: 'Successfully complete a Daily Challenge',
      unlocked: !!saveData.dailyChallengeCompleted,
      progressText: saveData.dailyChallengeCompleted ? '1 / 1' : '0 / 1',
      percent: saveData.dailyChallengeCompleted ? 100 : 0,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#6b2a12] via-[#4e1d0c] to-[#2c0d05] border-2 border-[#d97c38] shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)] p-6 flex flex-col items-center gap-4 text-amber-100 font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow leading-none">
                ACHIEVEMENTS
              </h2>
              <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">
                {unlockedCount} of {achievements.length} Unlocked
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-[#341107] border border-[#6e2e14] text-amber-300 flex items-center justify-center cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Progress Bar */}
        <div className="w-full bg-[#240c06] rounded-full h-2 overflow-hidden border border-[#8a3f20]/60">
          <div
            className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-300"
            style={{ width: `${Math.round((unlockedCount / achievements.length) * 100)}%` }}
          />
        </div>

        {/* List of achievements */}
        <div className="w-full flex flex-col gap-2 max-h-[55vh] overflow-y-auto pr-0.5">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3 rounded-2xl border flex items-center gap-3 shadow-inner ${
                ach.unlocked
                  ? 'bg-[#291007]/90 border-amber-500/60'
                  : 'bg-[#1e0a05]/70 border-[#501c0b]/40 opacity-70'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  ach.unlocked
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-stone-900 border-stone-800 text-stone-600'
                }`}
              >
                {ach.unlocked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 flex flex-col text-left">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black leading-tight ${ach.unlocked ? 'text-amber-200' : 'text-stone-300'}`}>
                    {ach.title}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-400/80">
                    {ach.progressText}
                  </span>
                </div>
                <span className="text-[11px] text-amber-300/70 leading-snug mt-0.5">
                  {ach.description}
                </span>

                {/* Progress bar */}
                {!ach.unlocked && (
                  <div className="w-full bg-stone-900 rounded-full h-1 overflow-hidden mt-1.5 border border-stone-800">
                    <div
                      className="bg-amber-600 h-full"
                      style={{ width: `${ach.percent}%` }}
                    />
                  </div>
                )}
              </div>
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
