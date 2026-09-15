/**
 * KNIFE MADNESS - 40 Level Select Screen
 * Beautiful progressive stage grid with boss indicators, stars, and best scores.
 */

import React, { useState } from 'react';
import { ArrowLeft, Lock, Star, Skull, Crown, ShieldAlert } from 'lucide-react';
import { KNIFE_MADNESS_LEVELS, STAGE_GROUPS } from '../levels';
import { KnifeMadnessCareerProgress } from '../types';

interface KnifeMadnessLevelSelectProps {
  career: KnifeMadnessCareerProgress;
  onSelectLevel: (levelNumber: number) => void;
  onBack: () => void;
}

export const KnifeMadnessLevelSelect: React.FC<KnifeMadnessLevelSelectProps> = ({
  career,
  onSelectLevel,
  onBack,
}) => {
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(0);

  const activeStage = STAGE_GROUPS[selectedStageIndex];
  const stageLevels = KNIFE_MADNESS_LEVELS.filter(
    (l) => l.levelNumber >= activeStage.startLevel && l.levelNumber <= activeStage.endLevel
  );

  return (
    <div
      id="knife-madness-level-select"
      className="relative w-full h-full max-w-md mx-auto flex flex-col p-4 bg-[#050e1d] text-white select-none overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          id="btn-level-select-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Menu</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-black uppercase tracking-wider text-amber-300">
            Select Stage
          </h2>
          <p className="text-[10px] text-slate-400">40 Progressive Levels</p>
        </div>

        <div className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
          {career.levelsCompleted}/40 Done
        </div>
      </div>

      {/* Stage Tab Navigation */}
      <div className="flex gap-1.5 my-3 overflow-x-auto pb-1 no-scrollbar">
        {STAGE_GROUPS.map((sg, idx) => {
          const isSelected = idx === selectedStageIndex;
          const isStageUnlocked = career.unlockedLevel >= sg.startLevel;

          return (
            <button
              key={sg.name}
              onClick={() => setSelectedStageIndex(idx)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : isStageUnlocked
                  ? 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  : 'bg-slate-950 text-slate-400 border border-slate-900'
              }`}
            >
              {!isStageUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
              <span>{sg.name}</span>
            </button>
          );
        })}
      </div>

      {/* Stage Title Banner */}
      <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800 mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-black text-amber-300 uppercase">
            {activeStage.name}: {activeStage.themeLabel}
          </div>
          <div className="text-[10px] text-slate-400">
            Levels {activeStage.startLevel} – {activeStage.endLevel}
          </div>
        </div>
        <div className="text-[10px] font-bold text-sky-400 uppercase bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800">
          Boss: Lv {activeStage.bossLevel}
        </div>
      </div>

      {/* 8 Level Cards for Selected Stage */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        {stageLevels.map((lvl) => {
          const isUnlocked = lvl.levelNumber <= career.unlockedLevel;
          const record = career.levelRecords[lvl.levelNumber];
          const isCompleted = record?.completed;
          const isBoss = lvl.isBoss;

          return (
            <button
              key={lvl.levelNumber}
              disabled={!isUnlocked}
              onClick={() => onSelectLevel(lvl.levelNumber)}
              className={`relative flex flex-col items-center justify-between p-2.5 rounded-2xl border transition active:scale-95 aspect-[4/5] ${
                !isUnlocked
                  ? 'bg-slate-950/80 border-slate-900 text-slate-400 cursor-not-allowed'
                  : isBoss
                  ? 'bg-gradient-to-b from-red-950/60 to-slate-900 border-red-500/70 text-red-200 hover:border-red-400 shadow-[0_4px_16px_rgba(239,68,68,0.2)]'
                  : isCompleted
                  ? 'bg-gradient-to-b from-slate-900 to-emerald-950/30 border-emerald-500/60 text-slate-200 hover:border-emerald-400'
                  : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-amber-400 hover:bg-slate-800'
              }`}
            >
              {/* Level Badge / Icon */}
              <div className="w-full flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">
                  #{lvl.levelNumber}
                </span>
                {isBoss ? (
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ) : isCompleted ? (
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-2.5 h-2.5 ${
                          s <= (record?.stars || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Center Content: Level Number or Lock */}
              <div className="my-auto text-center">
                {!isUnlocked ? (
                  <Lock className="w-5 h-5 text-slate-400 mx-auto" />
                ) : (
                  <div className="text-xl font-black tracking-tight text-white">
                    {lvl.levelNumber}
                  </div>
                )}
              </div>

              {/* Bottom Tag */}
              <div className="w-full text-center">
                {!isUnlocked ? (
                  <span className="text-[9px] font-semibold text-slate-400 uppercase">
                    Locked
                  </span>
                ) : isBoss ? (
                  <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">
                    BOSS
                  </span>
                ) : isCompleted ? (
                  <span className="text-[9px] font-bold text-emerald-400">
                    {record.bestScore} pts
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-amber-400">
                    {lvl.requiredKnives} knives
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Boss Tips Footer */}
      <div className="mt-auto bg-slate-900/40 rounded-xl p-3 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-200">Stage Pro Tip: </span>
          {activeStage.description}. Boss targets feature dynamic reversing rotation and pre-installed obstacles.
        </div>
      </div>
    </div>
  );
};
