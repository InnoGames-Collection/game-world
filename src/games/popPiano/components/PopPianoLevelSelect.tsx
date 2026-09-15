import React from 'react';
import { ArrowLeft, Lock, Star, Trophy, Play, CheckCircle2, Flame, Clock, Target } from 'lucide-react';
import { POP_PIANO_LEVELS } from '../pianoLevelBank';
import { PopPianoProgress } from '../types';

interface PopPianoLevelSelectProps {
  progress: PopPianoProgress;
  onSelectLevel: (levelNum: number) => void;
  onBack: () => void;
}

export const PopPianoLevelSelect: React.FC<PopPianoLevelSelectProps> = ({
  progress,
  onSelectLevel,
  onBack,
}) => {
  const highestUnlocked = Math.max(1, Math.min(40, progress.highestUnlockedLevel || 1));

  return (
    <div
      id="pop-piano-level-select-view"
      className="relative w-full h-full min-h-[600px] flex flex-col p-4 sm:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white overflow-y-auto custom-scrollbar"
    >
      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-[#0B132B]/90 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Menu"
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
            Select Level
          </h2>
          <p className="text-[11px] text-cyan-300 font-bold uppercase tracking-widest">
            {Object.keys(progress.completedLevels).length} / 40 Completed
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black font-mono">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{progress.totalScore.toLocaleString()}</span>
        </div>
      </header>

      {/* TIER ANCHOR GUIDE */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold text-slate-300">
        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">1-5 Hard</span>
        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">6-10 Very Hard</span>
        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">11-20 Expert</span>
        <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30">21-30 Expert+</span>
        <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30">31-39 Extreme</span>
        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">40 Master</span>
      </div>

      {/* 40 LEVELS GRID */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 my-4">
        {POP_PIANO_LEVELS.map((cfg) => {
          const isUnlocked = cfg.level <= highestUnlocked;
          const saveData = progress.completedLevels[cfg.level];
          const isCompleted = Boolean(saveData);

          // Tier color themes
          const getTierBadge = () => {
            switch (cfg.tier) {
              case 'Hard':
                return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
              case 'Very Hard':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
              case 'Expert':
                return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
              case 'Expert+':
                return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
              case 'Extreme':
                return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
              case 'Master':
                return 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse';
              default:
                return 'bg-white/10 text-slate-300 border-white/20';
            }
          };

          return (
            <button
              key={cfg.level}
              type="button"
              disabled={!isUnlocked}
              onClick={() => onSelectLevel(cfg.level)}
              id={`pop-piano-level-card-${cfg.level}`}
              className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                !isUnlocked
                  ? 'bg-black/30 border-white/5 opacity-50 cursor-not-allowed'
                  : isCompleted
                  ? 'bg-white/[0.08] hover:bg-white/[0.14] border-white/20 cursor-pointer shadow-md active:scale-[0.98]'
                  : 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/40 hover:border-emerald-400 cursor-pointer shadow-lg active:scale-[0.98]'
              }`}
            >
              {/* TOP ROW: Level Number, Tier Badge, Stars */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black font-mono text-white">
                    #{cfg.level}
                  </span>
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${getTierBadge()}`}>
                    {cfg.tier}
                  </span>
                </div>

                {/* Status Indicator */}
                {!isUnlocked ? (
                  <Lock className="w-4 h-4 text-slate-500" />
                ) : isCompleted ? (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((starNum) => (
                      <Star
                        key={starNum}
                        className={`w-3.5 h-3.5 ${
                          starNum <= (saveData?.stars || 1)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 uppercase">
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play</span>
                  </span>
                )}
              </div>

              {/* LEVEL NAME & TARGET BLACK TILES */}
              <div className="mb-2">
                <div className="text-xs font-bold text-slate-200 line-clamp-1">{cfg.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Target: <strong className="text-cyan-300 font-semibold">{cfg.targetNotes} Black Tiles</strong> • {cfg.speed} px/s
                </div>
              </div>

              {/* BOTTOM METRICS FOR COMPLETED RUNS */}
              {isCompleted && saveData ? (
                <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-1 text-center font-mono">
                  <div className="bg-black/20 rounded-md py-1 px-0.5">
                    <div className="text-[8px] text-slate-400 uppercase font-sans">Best Score</div>
                    <div className="text-[11px] font-black text-amber-300">
                      {saveData.highScore}
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-md py-1 px-0.5">
                    <div className="text-[8px] text-slate-400 uppercase font-sans">Accuracy</div>
                    <div className="text-[11px] font-black text-emerald-300">
                      {saveData.bestAccuracy}%
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-md py-1 px-0.5">
                    <div className="text-[8px] text-slate-400 uppercase font-sans">Combo</div>
                    <div className="text-[11px] font-black text-cyan-300">
                      {saveData.bestCombo}x
                    </div>
                  </div>
                </div>
              ) : isUnlocked ? (
                <div className="text-[10px] text-emerald-300/80 font-medium italic">
                  Tap to start level challenge
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 font-medium">
                  Complete Level {cfg.level - 1} to unlock
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
