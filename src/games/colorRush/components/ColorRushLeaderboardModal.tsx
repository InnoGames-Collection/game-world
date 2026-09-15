/**
 * Color Rush - Championship Leaderboard Modal
 * 
 * Supports GLOBAL, WEEKLY, MONTHLY, and MY RANK tabs.
 * Highlights player entry and pins a sticky bottom bar with current rank.
 */

import React, { useState } from 'react';
import { 
  Trophy, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Flame, 
  Target, 
  Zap, 
  ShieldCheck,
  Award
} from 'lucide-react';
import { ColorRushProgression, LeaderboardEntry } from '../types';
import { getLeaderboardData, LeaderboardTab } from '../leaderboard';
import { ColorRushAudio } from '../colorRushAudio';

interface ColorRushLeaderboardModalProps {
  progression: ColorRushProgression;
  playerName: string;
  playerAvatar: string;
  onBack: () => void;
}

export const ColorRushLeaderboardModal: React.FC<ColorRushLeaderboardModalProps> = ({
  progression,
  playerName,
  playerAvatar,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('GLOBAL');

  // Compute best score across levels
  const allBests = Object.values(progression.levelBestScores) as number[];
  const playerHighestBest = allBests.length > 0 ? Math.max(...allBests) : 0;

  const { entries, playerEntry, playerRank, totalCompetitors } = getLeaderboardData({
    tab: activeTab,
    playerName,
    playerAvatar,
    playerScore: progression.totalCumulativeScore,
    playerHighestLevel: progression.currentUnlockedLevel,
    playerBestScore: playerHighestBest,
    playerStreak: progression.highestStreak,
  });

  const handleTabChange = (tab: LeaderboardTab) => {
    ColorRushAudio.playTap();
    setActiveTab(tab);
  };

  return (
    <div 
      className="relative w-full max-w-md mx-auto flex flex-col items-center select-none rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl min-h-[640px] max-h-[92vh] font-['Plus_Jakarta_Sans',sans-serif] text-slate-100"
      style={{
        background: 'radial-gradient(circle at 50% 10%, #171e38 0%, #080f24 50%, #030612 100%)',
      }}
    >
      {/* HEADER */}
      <div className="w-full bg-[#0d1633]/95 backdrop-blur-md px-4 py-3 border-b border-[#1b2b5c] flex items-center justify-between gap-2 z-20 shrink-0">
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
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-white tracking-tight">
              Leaderboard
            </h2>
          </div>
        </div>

        <div className="text-[11px] font-mono font-bold text-amber-400">
          Rank #{playerRank}
        </div>
      </div>

      {/* 4 TABS: GLOBAL, WEEKLY, MONTHLY, MY RANK */}
      <div className="w-full px-3 pt-3 pb-2 z-10 shrink-0">
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
          {(['GLOBAL', 'WEEKLY', 'MONTHLY', 'MY_RANK'] as LeaderboardTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === 'MY_RANK' ? 'MY RANK' : tab;
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SCROLLABLE LEADERBOARD TABLE */}
      <div className="relative w-full flex-1 overflow-y-auto px-3 pb-24 space-y-1.5 z-10">
        
        {/* Table Header */}
        <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60">
          <div className="w-10 text-center">Rank</div>
          <div className="flex-1 text-left pl-2">Player</div>
          <div className="w-16 text-center">Lvl / Best</div>
          <div className="w-20 text-right pr-1">Total Score</div>
        </div>

        {entries.map((entry) => {
          const isMe = entry.isPlayer;
          const isTop3 = entry.rank <= 3;

          let rankBadgeBg = 'bg-slate-800 text-slate-300';
          if (entry.rank === 1) rankBadgeBg = 'bg-amber-400 text-slate-950 font-black shadow-amber-500/30';
          if (entry.rank === 2) rankBadgeBg = 'bg-slate-300 text-slate-950 font-black';
          if (entry.rank === 3) rankBadgeBg = 'bg-amber-600 text-white font-black';

          return (
            <div
              key={`${entry.id}_${entry.rank}`}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                isMe
                  ? 'bg-gradient-to-r from-cyan-950/80 via-[#0a2f59]/90 to-cyan-950/80 border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                  : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80'
              }`}
            >
              {/* Rank & Movement */}
              <div className="flex items-center gap-1.5 w-10 justify-center shrink-0">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold ${rankBadgeBg}`}>
                  {entry.rank}
                </div>
                <div className="flex flex-col items-center">
                  {entry.movement === 'up' && (
                    <span className="text-[9px] text-emerald-400 flex items-center leading-none font-bold">
                      <TrendingUp className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {entry.movement === 'down' && (
                    <span className="text-[9px] text-rose-400 flex items-center leading-none font-bold">
                      <TrendingDown className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {entry.movement === 'same' && (
                    <span className="text-[9px] text-slate-500 flex items-center leading-none">
                      <Minus className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-2 flex-1 min-w-0 pl-1.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shrink-0">
                  {entry.avatar}
                </div>
                <div className="flex flex-col min-w-0 leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-black truncate ${isMe ? 'text-cyan-300' : 'text-white'}`}>
                      {entry.name}
                    </span>
                    {isMe && (
                      <span className="px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[8px] font-black uppercase">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 text-amber-500" />
                      {entry.streak}x streak
                    </span>
                  </div>
                </div>
              </div>

              {/* Level & Single Best */}
              <div className="w-16 text-center text-[11px] font-mono leading-tight shrink-0">
                <div className="text-slate-300 font-bold">Lvl {entry.highestLevel}</div>
                <div className="text-[9px] text-slate-400">Best {entry.bestScore}</div>
              </div>

              {/* Cumulative Total Score */}
              <div className="w-20 text-right shrink-0">
                <div className={`text-sm font-black font-mono tabular-nums ${isMe ? 'text-cyan-300' : isTop3 ? 'text-amber-400' : 'text-white'}`}>
                  {entry.totalScore.toLocaleString()}
                </div>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                  PTS
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* STICKY BOTTOM CARD: CURRENT PLAYER'S POSITION ALWAYS VISIBLE */}
      <div className="absolute bottom-0 inset-x-0 bg-[#051c3d]/95 backdrop-blur-md p-3 border-t-2 border-cyan-500/40 shadow-2xl flex items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono font-black text-sm shrink-0">
            #{playerRank}
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-xs font-black text-white truncate">
              {playerName || 'Your Standing'}
            </span>
            <span className="text-[10px] text-slate-300 font-medium">
              Top {Math.max(1, Math.round((playerRank / totalCompetitors) * 100))}% of players
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-black font-mono text-cyan-300 tabular-nums">
              {progression.totalCumulativeScore.toLocaleString()} PTS
            </div>
            <div className="text-[9px] text-slate-400 font-bold uppercase">
              Career Total
            </div>
          </div>
          <button
            onClick={() => {
              ColorRushAudio.playTap();
              onBack();
            }}
            className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0"
          >
            Play
          </button>
        </div>
      </div>
    </div>
  );
};
