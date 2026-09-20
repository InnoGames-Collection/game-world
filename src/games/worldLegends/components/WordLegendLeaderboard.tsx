import React, { useMemo } from 'react';
import { ArrowLeft, Trophy, Crown } from 'lucide-react';
import { 
  WorldLegendsProgress, 
  getWorldLegendsLeaderboard 
} from '../worldLegendsStorage';

const WOOD_MATERIAL = {
  hud: {
    background: 'linear-gradient(180deg, #f5d499 0%, #e0b06b 50%, #c98e40 100%)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 3px 6px rgba(0,0,0,0.35)',
  },
  tileOrButton: {
    background: 'linear-gradient(180deg, #fff2db 0%, #f6ce8e 45%, #e2a652 100%)',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.9), 0 3px 0 #915a1a, 0 5px 8px rgba(0,0,0,0.4)',
  },
  playerRow: {
    background: 'linear-gradient(180deg, #ffe082 0%, #ffb300 45%, #e65100 100%)',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.9), 0 3px 0 #8c2d00, 0 0 14px rgba(255,179,0,0.4)',
  },
};

interface WordLegendLeaderboardProps {
  progress: WorldLegendsProgress;
  playerMsisdn?: string;
  onBack: () => void;
}

export const WordLegendLeaderboard: React.FC<WordLegendLeaderboardProps> = ({
  progress,
  playerMsisdn = '251911598830',
  onBack,
}) => {
  const totalScore = progress.totalScore || 0;
  const currentLevel = progress.unlockedLevel || 1;

  const { list, userRank, userEntry } = useMemo(() => {
    return getWorldLegendsLeaderboard(playerMsisdn, totalScore, currentLevel);
  }, [playerMsisdn, totalScore, currentLevel]);

  return (
    <div
      id="word-legend-leaderboard-screen"
      className="relative w-full max-w-md mx-auto h-[600px] sm:h-[650px] rounded-3xl overflow-hidden shadow-2xl flex flex-col p-4 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif] border-4 border-[#b37324] select-none text-[#22140a] animate-in fade-in"
      style={{
        background: 'radial-gradient(circle at 50% 20%, #2e1809 0%, #170d05 60%, #0c0702 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), inset 0 0 0 2px #f1bc68, inset 0 0 25px rgba(0,0,0,0.5)',
      }}
    >
      {/* TOP HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-[#b37324]/40 shrink-0">
        <button
          id="word-leaderboard-back-btn"
          type="button"
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl text-[#22140a] flex items-center gap-1.5 font-black text-xs border border-[#c98833] active:translate-y-0.5 transition-all cursor-pointer shadow-md"
          style={WOOD_MATERIAL.tileOrButton}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-[#ffba42]">
            <Trophy className="w-4 h-4 fill-[#ffba42]" />
            <h2 className="text-base font-black text-[#f7e0b5] uppercase tracking-wider">
              LEADERBOARD
            </h2>
          </div>
          <span className="text-[10px] text-[#e0b06b] font-bold uppercase tracking-wide">
            WORD LEGEND MASTERS
          </span>
        </div>

        <div className="min-w-[44px] flex justify-end">
          <div 
            className="w-9 h-9 rounded-xl border border-[#b37324] flex items-center justify-center text-[#22140a] font-black text-xs shadow-md"
            style={WOOD_MATERIAL.hud}
          >
            #{userRank}
          </div>
        </div>
      </div>

      {/* TABLE HEADER COLUMNS */}
      <div className="grid grid-cols-12 gap-1 py-2 px-3 text-[10px] font-black uppercase text-[#e0b06b] tracking-wider shrink-0 border-b border-white/5 mt-1">
        <span className="col-span-2 text-center">RANK</span>
        <span className="col-span-4">PLAYER</span>
        <span className="col-span-3 text-right">SCORE</span>
        <span className="col-span-3 text-right">LEVEL</span>
      </div>

      {/* SCROLLABLE LEADERBOARD ROWS */}
      <div className="flex-1 overflow-y-auto pr-1 py-1 space-y-1.5 scrollbar-thin">
        {list.map((entry) => {
          const isTop1 = entry.rank === 1;
          const isTop2 = entry.rank === 2;
          const isTop3 = entry.rank === 3;

          let rankBadge = (
            <span className="font-mono font-bold text-xs text-[#c7a47b]">
              #{entry.rank}
            </span>
          );

          if (isTop1) {
            rankBadge = (
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-[#22140a] font-black text-xs flex items-center justify-center shadow-md mx-auto">
                <Crown className="w-3.5 h-3.5 fill-current" />
              </div>
            );
          } else if (isTop2) {
            rankBadge = (
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-200 to-slate-400 text-[#22140a] font-black text-xs flex items-center justify-center shadow-md mx-auto">
                2
              </div>
            );
          } else if (isTop3) {
            rankBadge = (
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-md mx-auto">
                3
              </div>
            );
          }

          return (
            <div
              key={`${entry.msisdnMasked}-${entry.rank}`}
              style={entry.isPlayer ? WOOD_MATERIAL.playerRow : undefined}
              className={`grid grid-cols-12 gap-1 items-center p-2.5 rounded-xl transition-all ${
                entry.isPlayer
                  ? 'text-[#22140a] border border-[#8c2d00]'
                  : 'bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] text-slate-200'
              }`}
            >
              {/* Rank */}
              <div className="col-span-2 flex items-center justify-center">
                {rankBadge}
              </div>

              {/* Masked MSISDN */}
              <div className="col-span-4 flex items-center gap-1.5 min-w-0">
                <span className={`font-mono text-xs font-bold tracking-tight truncate ${
                  entry.isPlayer ? 'text-[#22140a]' : 'text-slate-200'
                }`}>
                  {entry.msisdnMasked}
                </span>
                {entry.isPlayer && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#3d2008] text-amber-200 text-[8px] font-black uppercase tracking-wider shrink-0">
                    YOU
                  </span>
                )}
              </div>

              {/* Score */}
              <div className="col-span-3 text-right">
                <span className={`font-mono text-xs font-black ${
                  entry.isPlayer ? 'text-[#3d2008]' : 'text-[#f5d499]'
                }`}>
                  {entry.score.toLocaleString()}
                </span>
              </div>

              {/* Level */}
              <div className="col-span-3 text-right">
                <span className={`text-xs font-bold font-mono ${
                  entry.isPlayer ? 'text-[#3d2008]' : 'text-[#c7a47b]'
                }`}>
                  Lvl {entry.level}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FIXED "YOUR RANK" BOTTOM CARD */}
      <div
        id="word-fixed-your-rank"
        className="mt-2 p-3 rounded-2xl border-2 border-[#b37324] shadow-xl shrink-0"
        style={WOOD_MATERIAL.hud}
      >
        <div className="flex items-center justify-between text-[#22140a]">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-xl border border-[#c98833] flex flex-col items-center justify-center"
              style={WOOD_MATERIAL.tileOrButton}
            >
              <span className="text-[8px] font-black uppercase text-[#6b3e15] leading-none">RANK</span>
              <span className="text-sm font-black text-[#8c3204] font-mono leading-none mt-0.5">
                #{userRank}
              </span>
            </div>

            <div className="text-left">
              <div className="text-[9px] font-black text-[#6b3e15] uppercase tracking-wider">
                YOUR PERFORMANCE
              </div>
              <div className="text-xs font-mono font-bold text-[#2a1708]">
                {userEntry.msisdnMasked}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-black text-[#8c3204] font-mono">
              {userEntry.score.toLocaleString()} PTS
            </div>
            <div className="text-[10px] text-[#4d290b] font-bold">
              Level {userEntry.level} • {progress.completedLevels.length} Solved
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
