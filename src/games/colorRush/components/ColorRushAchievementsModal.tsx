/**
 * Color Rush - Championship Achievements Modal
 */

import React from 'react';
import { 
  Award, 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Trophy 
} from 'lucide-react';
import { ColorRushProgression } from '../types';
import { evaluateAchievements } from '../achievements';
import { ColorRushAudio } from '../colorRushAudio';

interface ColorRushAchievementsModalProps {
  progression: ColorRushProgression;
  onBack: () => void;
}

export const ColorRushAchievementsModal: React.FC<ColorRushAchievementsModalProps> = ({
  progression,
  onBack,
}) => {
  const { achievements } = evaluateAchievements(progression);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div 
      className="relative w-full max-w-md mx-auto flex flex-col items-center select-none rounded-3xl overflow-hidden border-2 border-violet-500/40 shadow-2xl min-h-[640px] max-h-[92vh] font-['Plus_Jakarta_Sans',sans-serif] text-slate-100"
      style={{
        background: 'radial-gradient(circle at 50% 10%, #171536 0%, #0c0a21 50%, #04030d 100%)',
      }}
    >
      {/* HEADER */}
      <div className="w-full bg-[#100d2b]/95 backdrop-blur-md px-4 py-3 border-b border-[#221c54] flex items-center justify-between gap-2 z-20 shrink-0">
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
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-white tracking-tight">
              Achievements
            </h2>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-black font-mono text-violet-300">
            {unlockedCount} / {achievements.length}
          </div>
          <div className="text-[8px] text-slate-400 uppercase font-bold">
            Unlocked
          </div>
        </div>
      </div>

      {/* OVERALL TROPHY SUMMARY */}
      <div className="w-full px-4 pt-3 z-10 shrink-0">
        <div className="p-3 rounded-2xl bg-violet-950/60 border border-violet-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-400/40 flex items-center justify-center text-violet-300 text-lg shadow-sm">
              🏆
            </div>
            <div>
              <div className="text-xs font-black text-white">Championship Badges</div>
              <div className="text-[10px] text-violet-300 font-medium">
                {unlockedCount === achievements.length 
                  ? 'All 12 Trophies Mastered!' 
                  : `${achievements.length - unlockedCount} trophies waiting to be unlocked`}
              </div>
            </div>
          </div>

          <div className="w-20 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-violet-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((unlockedCount / achievements.length) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* SCROLLABLE LIST OF 12 ACHIEVEMENTS */}
      <div className="relative w-full flex-1 overflow-y-auto p-4 space-y-2.5 z-10">
        {achievements.map((ach) => {
          const percent = Math.min(100, Math.round((ach.progress / ach.target) * 100));

          return (
            <div
              key={ach.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                ach.unlocked
                  ? 'bg-gradient-to-r from-violet-950/70 to-indigo-950/70 border-violet-500/50 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-75'
              }`}
            >
              {/* Icon */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                ach.unlocked
                  ? 'bg-violet-500/20 border-violet-400/50 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                {ach.icon}
              </div>

              {/* Text & Progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-black truncate ${ach.unlocked ? 'text-white' : 'text-slate-300'}`}>
                    {ach.title}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[8px] font-bold text-slate-400 uppercase">
                    {ach.category}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate my-0.5">
                  {ach.description}
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        ach.unlocked ? 'bg-violet-400' : 'bg-cyan-500/60'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 font-bold shrink-0">
                    {ach.progress}/{ach.target}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 text-right">
                {ach.unlocked ? (
                  <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">DONE</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                    <Lock className="w-3.5 h-3.5" />
                    <span>LOCKED</span>
                  </div>
                )}
                <div className="text-[9px] font-mono text-amber-400 font-bold mt-0.5">
                  +{ach.rewardPoints} PTS
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="w-full bg-[#100d2b]/95 backdrop-blur-md p-3 border-t border-[#221c54] flex items-center justify-center z-20 shrink-0">
        <button
          onClick={() => {
            ColorRushAudio.playTap();
            onBack();
          }}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          Return to Menu
        </button>
      </div>
    </div>
  );
};
