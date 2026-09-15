import React, { useState } from 'react';
import { ArrowLeft, Lock, CheckCircle2, Star, Target, Zap, Play } from 'lucide-react';
import { PopBalloonProgress } from '../types';
import { POP_BALLOON_LEVELS } from '../levelBank';

interface PopBalloonLevelSelectProps {
  progress: PopBalloonProgress;
  onSelectLevel: (levelNum: number) => void;
  onBack: () => void;
}

export const PopBalloonLevelSelect: React.FC<PopBalloonLevelSelectProps> = ({
  progress,
  onSelectLevel,
  onBack,
}) => {
  const [selectedTab, setSelectedTab] = useState<'all' | '1-10' | '11-20' | '21-30' | '31-40'>('all');

  const filteredLevels = POP_BALLOON_LEVELS.filter((lvl) => {
    if (selectedTab === '1-10') return lvl.level >= 1 && lvl.level <= 10;
    if (selectedTab === '11-20') return lvl.level >= 11 && lvl.level <= 20;
    if (selectedTab === '21-30') return lvl.level >= 21 && lvl.level <= 30;
    if (selectedTab === '31-40') return lvl.level >= 31 && lvl.level <= 40;
    return true;
  });

  const completedCount = Object.keys(progress.levelBestScores).length;

  return (
    <div
      id="pop-balloon-level-select"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-5 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#070D1E] via-[#0D183A] to-[#070D1E] text-white overflow-y-auto custom-scrollbar"
    >
      {/* 1. HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-[#070D1E]/95 backdrop-blur-md z-20 shrink-0">
        <button
          id="pop-balloon-levels-back-btn"
          type="button"
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-md"
          title="Back to Menu"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
            Level Progression
          </h2>
          <p className="text-[11px] text-blue-300 font-bold uppercase tracking-widest">
            {completedCount} of 40 Levels Cleared
          </p>
        </div>

        <div className="w-11" />
      </div>

      {/* 2. TAB FILTER BUTTONS */}
      <div className="grid grid-cols-5 gap-1.5 my-3 shrink-0">
        {[
          { id: 'all', label: 'All' },
          { id: '1-10', label: '1-10' },
          { id: '11-20', label: '11-20' },
          { id: '21-30', label: '21-30' },
          { id: '31-40', label: '31-40' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedTab(tab.id as any)}
            className={`min-h-[38px] py-1.5 px-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer border ${
              selectedTab === tab.id
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. 40 LEVELS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-4 flex-1">
        {filteredLevels.map((lvl) => {
          const isUnlocked = lvl.level <= progress.unlockedLevel;
          const bestScore = progress.levelBestScores[lvl.level];
          const isCompleted = bestScore !== undefined && bestScore > 0;
          const details = progress.levelDetails[lvl.level];
          const stars = details?.stars || (isCompleted ? (bestScore >= lvl.targetPops * 2 ? 3 : bestScore >= lvl.targetPops * 1.3 ? 2 : 1) : 0);

          return (
            <button
              key={lvl.level}
              id={`pop-balloon-level-card-${lvl.level}`}
              type="button"
              disabled={!isUnlocked}
              onClick={() => onSelectLevel(lvl.level)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[96px] ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-950/40 via-[#0E2038] to-[#0A162B] border-emerald-500/40 hover:border-emerald-400 cursor-pointer shadow-md'
                  : isUnlocked
                  ? 'bg-gradient-to-r from-blue-950/50 via-[#0F2244] to-[#0A162B] border-blue-500/50 hover:border-blue-400 cursor-pointer shadow-lg ring-1 ring-blue-400/30'
                  : 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm font-mono shrink-0 shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isUnlocked
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? lvl.level : <Lock className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>LEVEL {lvl.level}</span>
                      {isCompleted && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase">
                          Cleared
                        </span>
                      )}
                      {!isCompleted && isUnlocked && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 uppercase">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium line-clamp-1">
                      {lvl.description}
                    </div>
                  </div>
                </div>

                {/* Stars / Lock status */}
                <div className="shrink-0 text-right">
                  {isCompleted ? (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3.5 h-3.5 ${
                            starIdx <= stars
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  ) : !isUnlocked ? (
                    <span className="text-[10px] text-slate-500 font-bold uppercase">
                      Lvl {lvl.level - 1} Req
                    </span>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-blue-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom detail row */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-blue-400" />
                    <span>Goal: {lvl.targetPops} Pops</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span>{lvl.tierMultiplier}x Multiplier</span>
                </div>

                {isCompleted && (
                  <div className="font-mono font-black text-amber-300">
                    Best: {bestScore.toLocaleString()}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
