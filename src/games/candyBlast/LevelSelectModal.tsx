/**
 * Candy Blast - 40-Level Campaign Map & Level Selection Modal
 * Displays player star ratings (★ ★ ★), high scores, and locked/unlocked status.
 */

import React, { useState } from 'react';
import { CANDY_LEVELS } from './levelBank';
import { PlayerProgress, LevelConfig } from './types';
import { getTotalStarsEarned } from './levelStorage';
import { 
  X, 
  Lock, 
  Star, 
  Trophy, 
  Play, 
  ChevronRight, 
  Sparkles, 
  Target, 
  Layers 
} from 'lucide-react';

interface LevelSelectModalProps {
  currentLevel: number;
  progress: PlayerProgress;
  onSelectLevel: (levelNum: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevel,
  progress,
  onSelectLevel,
  onClose,
}) => {
  const [selectedTier, setSelectedTier] = useState<number>(() => {
    return Math.floor((currentLevel - 1) / 10);
  });

  const totalStars = getTotalStarsEarned(progress);
  const maxStars = 40 * 3;

  const tiers = [
    { index: 0, range: '1–10', title: 'Hard & Hard+', start: 1, end: 10, subtitle: 'Foundations & Frosting' },
    { index: 1, range: '11–20', title: 'Advanced', start: 11, end: 20, subtitle: 'Obstacles & Trenches' },
    { index: 2, range: '21–30', title: 'Very Hard', start: 21, end: 30, subtitle: 'Fortresses & Mazes' },
    { index: 3, range: '31–40', title: 'Expert & Final', start: 31, end: 40, subtitle: 'Cosmic Singularity' },
  ];

  const currentTierData = tiers[selectedTier];
  const tierLevels = CANDY_LEVELS.slice(currentTierData.start - 1, currentTierData.end);

  const getTierBadgeStyle = (tier?: string) => {
    switch (tier) {
      case 'HARD':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'HARD+':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'ADVANCED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'VERY HARD':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'EXPERT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'EXPERT+':
        return 'bg-red-600/20 text-red-300 border-red-500/40';
      case 'FINAL CHALLENGE':
        return 'bg-gradient-to-r from-amber-500/30 to-purple-500/30 text-amber-200 border-amber-400/50 animate-pulse';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/30';
    }
  };

  const getObjectiveSummary = (config: LevelConfig) => {
    return config.objectives.map((obj) => {
      switch (obj.type) {
        case 'clear_jelly':
          return `❄️ ${obj.target} Jellies`;
        case 'clear_blockers':
          return `🪨 ${obj.target} Blocks`;
        case 'collect_candy':
          return `🍬 ${obj.target} ${obj.label || 'Candies'}`;
        case 'create_specials':
          return `⚡ ${obj.target} Specials`;
        case 'combo_specials':
          return `💥 ${obj.target} Combos`;
        case 'score':
          return `★ ${obj.target} pts`;
        default:
          return obj.label || 'Target';
      }
    }).join(' • ');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-center items-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#101b33] to-[#0a0f1d] border border-blue-500/30 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-[#1688C9] via-[#0E5282] to-[#1688C9] text-white flex items-center justify-between border-b border-white/10 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight flex items-center gap-1.5">
                <span>CANDY BLAST CAMPAIGN</span>
              </h2>
              <p className="text-[11px] text-blue-200 font-medium">Conquer 40 Handcrafted Levels</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stars Counter */}
            <div className="px-3 py-1 rounded-full bg-black/30 border border-amber-400/40 flex items-center gap-1.5 text-xs font-bold text-amber-300 shadow-inner">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>{totalStars} / {maxStars}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tier Tabs */}
        <div className="grid grid-cols-4 gap-1 p-2.5 bg-slate-900/90 border-b border-white/5">
          {tiers.map((t) => {
            const isTierUnlocked = progress.unlockedLevel >= t.start;
            const isSelected = selectedTier === t.index;
            return (
              <button
                key={t.index}
                onClick={() => setSelectedTier(t.index)}
                className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#1688C9] to-[#0d5986] text-white font-black shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/40'
                    : isTierUnlocked
                    ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-bold'
                    : 'bg-slate-950/40 text-slate-600 font-medium opacity-60'
                }`}
              >
                <span className="text-xs">{t.range}</span>
                <span className="text-[9px] truncate max-w-full font-medium opacity-80">{t.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Level Cards Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 scrollbar-thin scrollbar-thumb-blue-500/30">
          <div className="text-xs text-blue-300/80 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Tier {selectedTier + 1}: {currentTierData.title}</span>
            <span className="text-[10px] text-slate-400">Levels {currentTierData.range}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {tierLevels.map((lvl) => {
              const isUnlocked = progress.unlockedLevel >= lvl.levelNumber;
              const isCurrent = currentLevel === lvl.levelNumber;
              const record = progress.records[lvl.levelNumber];
              const stars = record?.stars || 0;
              const completed = record?.completed || false;
              const highScore = record?.highScore || 0;

              return (
                <div
                  key={lvl.levelNumber}
                  onClick={() => {
                    if (isUnlocked) {
                      onSelectLevel(lvl.levelNumber);
                      onClose();
                    }
                  }}
                  className={`relative p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-gradient-to-br from-[#1688C9]/35 to-[#00E5FF]/15 border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.25)] ring-2 ring-[#00E5FF]/60 cursor-pointer scale-[1.01]'
                      : isUnlocked
                      ? 'bg-slate-800/70 hover:bg-slate-800 border-white/10 hover:border-blue-400/50 cursor-pointer hover:shadow-md active:scale-98'
                      : 'bg-slate-950/40 border-white/5 opacity-50 cursor-not-allowed select-none'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-md ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-[#8BCB3D] to-[#558B2F] text-white'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isUnlocked ? lvl.levelNumber : <Lock className="w-4 h-4" />}
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white leading-tight">
                            {lvl.name}
                          </span>
                          {lvl.difficultyTier && (
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${getTierBadgeStyle(lvl.difficultyTier)}`}>
                              {lvl.difficultyTier}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-amber-300/90 font-medium">
                          {lvl.moves} Moves
                        </span>
                      </div>
                    </div>

                    {/* Stars Earned */}
                    {isUnlocked && (
                      <div className="flex items-center gap-0.5 bg-black/30 px-1.5 py-0.5 rounded-lg">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              stars >= s
                                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_#FFD54F]'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Objective Summary Pill */}
                  <div className="mt-2 text-[10px] text-slate-300 bg-slate-900/60 px-2 py-1 rounded-lg border border-white/5 truncate">
                    {getObjectiveSummary(lvl)}
                  </div>

                  {/* Footer High Score & Action */}
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <div className="text-slate-400 font-mono">
                      {completed ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Trophy className="w-3 h-3" />
                          <span>Best: {highScore.toLocaleString()}</span>
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-amber-400/90">Ready to play</span>
                      ) : (
                        <span className="text-slate-600">Locked</span>
                      )}
                    </div>

                    {isUnlocked && (
                      <button
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                          isCurrent
                            ? 'bg-[#00E5FF] text-slate-950 shadow-sm'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>{isCurrent ? 'Current' : 'Play'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar: Jump to Highest Unlocked */}
        <div className="px-4 py-3 bg-slate-950/90 border-t border-white/10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400">Furthest Progress:</span>
            <span className="text-xs font-black text-amber-400">Level {progress.unlockedLevel} / 40</span>
          </div>

          <button
            onClick={() => {
              onSelectLevel(progress.unlockedLevel);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BCB3D] to-[#7CB342] hover:brightness-110 text-white text-xs font-black shadow-lg shadow-lime-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Play Level {progress.unlockedLevel}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
