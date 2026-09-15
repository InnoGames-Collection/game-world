/**
 * Helix Jump Leaderboard Modal
 * Shows top high scores, ranks, levels reached, and player position.
 */

import React, { useState, useMemo } from 'react';
import { X, Trophy, Medal, Crown, Star, ArrowLeft } from 'lucide-react';
import { helixAudio } from '../audioEngine';
import { HelixJumpSaveData, HelixLeaderboardEntry } from '../types';

interface LeaderboardModalProps {
  saveData: HelixJumpSaveData;
  onClose: () => void;
}

// Built-in leaderboard hall of fame base
const DEFAULT_GLOBAL_ENTRIES: HelixLeaderboardEntry[] = [
  { id: '1', playerName: 'HelixMaster99', score: 18450, level: 40, date: 'Today' },
  { id: '2', playerName: 'VortexKing', score: 14200, level: 36, date: 'Today' },
  { id: '3', playerName: 'SkyDropper', score: 11850, level: 31, date: 'Yesterday' },
  { id: '4', playerName: 'ApexSpinner', score: 9400, level: 25, date: '2 days ago' },
  { id: '5', playerName: 'CylinderAce', score: 7650, level: 20, date: '3 days ago' },
  { id: '6', playerName: 'NeonGlider', score: 5800, level: 16, date: '4 days ago' },
  { id: '7', playerName: 'BouncePro', score: 4200, level: 12, date: '5 days ago' },
  { id: '8', playerName: 'GravityDrift', score: 3100, level: 8, date: '1 week ago' },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ saveData, onClose }) => {
  const [tab, setTab] = useState<'ALL' | 'TODAY'>('ALL');

  const entries = useMemo(() => {
    // Add current player's record if they have any score
    const playerBest = saveData.bestScore || 0;
    const playerLevel = saveData.highestUnlockedLevel || 1;

    const list = [...DEFAULT_GLOBAL_ENTRIES];
    if (playerBest > 0) {
      list.push({
        id: 'player',
        playerName: 'You (Player)',
        score: playerBest,
        level: playerLevel,
        date: 'Today',
        isPlayer: true,
      });
    }

    // Sort descending by score
    return list.sort((a, b) => b.score - a.score);
  }, [saveData.bestScore, saveData.highestUnlockedLevel]);

  return (
    <div
      id="helix-leaderboard-modal"
      className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider leading-none">
                Leaderboard
              </h2>
              <p className="text-[11px] font-bold text-slate-400 mt-1">
                Global High Score Rankings
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

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl mb-3 border border-white/10">
          <button
            onClick={() => {
              helixAudio.playButtonClick();
              setTab('ALL');
            }}
            className={`py-1.5 text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${
              tab === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All-Time
          </button>
          <button
            onClick={() => {
              helixAudio.playButtonClick();
              setTab('TODAY');
            }}
            className={`py-1.5 text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${
              tab === 'TODAY'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Today
          </button>
        </div>

        {/* Rankings List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
          {entries.map((entry, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            const isPlayer = entry.isPlayer;

            return (
              <div
                key={entry.id}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  isPlayer
                    ? 'bg-gradient-to-r from-sky-900/60 to-indigo-900/60 border-sky-400/50 shadow-lg shadow-sky-500/20 ring-1 ring-sky-400'
                    : isTop3
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                      rank === 1
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {rank === 1 ? (
                      <Crown className="w-4 h-4 fill-slate-950" />
                    ) : (
                      rank
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-black truncate max-w-[120px] ${
                          isPlayer ? 'text-sky-300 font-extrabold' : 'text-white'
                        }`}
                      >
                        {entry.playerName}
                      </span>
                      {isPlayer && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-sky-500 text-slate-950">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <span>Level {entry.level}</span>
                      <span>•</span>
                      <span>{entry.date}</span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-sm font-black text-amber-300">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    pts
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            helixAudio.playButtonClick();
            onClose();
          }}
          className="mt-3 w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </button>
      </div>
    </div>
  );
};
