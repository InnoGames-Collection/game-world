/**
 * Emoji Fun — Before Game: Level Information Menu (Section 4)
 * Shows level specs, tournament leaderboard preview, and [ START LEVEL ] button
 */

import React from 'react';
import { EmojiLevelConfig, PlayerStats, TournamentLeaderboardEntry } from '../types';
import { ChevronLeft, ChevronRight, Play, Trophy, ArrowLeft, Star, Heart, Lightbulb, Clock, Target, Flame } from 'lucide-react';
import { emojiAudio } from '../emojiAudio';

interface EmojiFunLevelInfoProps {
  levelConfig: EmojiLevelConfig;
  playerStats: PlayerStats;
  leaderboardPreview: {
    entries: TournamentLeaderboardEntry[];
    userRank: number;
    pointsToNextRank: number;
  };
  onSelectLevel: (level: number) => void;
  onStartLevel: () => void;
  onOpenFullLeaderboard: () => void;
  onBack: () => void;
}

export const EmojiFunLevelInfo: React.FC<EmojiFunLevelInfoProps> = ({
  levelConfig,
  playerStats,
  leaderboardPreview,
  onSelectLevel,
  onStartLevel,
  onOpenFullLeaderboard,
  onBack,
}) => {
  const currentLevel = levelConfig.level;
  const isLocked = currentLevel > playerStats.unlockedLevel;
  const bestLevelScore = playerStats.highScoreByLevel[currentLevel] || 0;
  const starsCount = levelConfig.difficultyStars;

  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-between p-3 sm:p-4 z-10 overflow-y-auto select-none">
      {/* Top Header Card */}
      <div className="w-full max-w-sm flex items-center justify-between bg-white/60 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-md border border-white/80 mb-3">
        <button
          onClick={() => {
            emojiAudio.playTap();
            onBack();
          }}
          className="w-8 h-8 rounded-full bg-white/80 hover:bg-white active:scale-95 flex items-center justify-center text-slate-700 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-purple-900 font-['Fredoka',sans-serif]">
            EMOJI FUN
          </h2>
          <p className="text-[11px] font-bold text-slate-600">Level Briefing & Objective</p>
        </div>

        <button
          onClick={() => {
            emojiAudio.playTap();
            onOpenFullLeaderboard();
          }}
          className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 active:scale-95 flex items-center justify-center text-amber-700 shadow-sm"
          title="Leaderboard"
        >
          <Trophy className="w-4 h-4" />
        </button>
      </div>

      {/* Level Selector Carousel */}
      <div className="w-full max-w-sm flex items-center justify-between bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 p-3.5 rounded-3xl shadow-lg text-white mb-3 border-2 border-white/40">
        <button
          onClick={() => {
            if (currentLevel > 1) {
              emojiAudio.playTap();
              onSelectLevel(currentLevel - 1);
            }
          }}
          disabled={currentLevel <= 1}
          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-pink-200 block">
            LEVEL {currentLevel < 10 ? `0${currentLevel}` : currentLevel} / 40
          </span>
          <span className="text-xl sm:text-2xl font-black font-['Fredoka',sans-serif] tracking-wide">
            {levelConfig.title}
          </span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= starsCount ? 'text-amber-300 fill-amber-300' : 'text-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            if (currentLevel < 40 && currentLevel < playerStats.unlockedLevel + 1) {
              emojiAudio.playTap();
              onSelectLevel(currentLevel + 1);
            }
          }}
          disabled={currentLevel >= 40 || currentLevel >= playerStats.unlockedLevel}
          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Main Level Information Specs Grid */}
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-md rounded-3xl p-3.5 shadow-md border border-white/90 mb-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Difficulty */}
          <div className="bg-purple-50/80 p-2 rounded-2xl border border-purple-100 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">DIFFICULTY</span>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-sm leading-none">
                  {s <= starsCount ? '★' : '☆'}
                </span>
              ))}
              <span className="ml-1 font-bold text-purple-800 text-[11px]">{levelConfig.theme}</span>
            </div>
          </div>

          {/* Questions Count */}
          <div className="bg-blue-50/80 p-2 rounded-2xl border border-blue-100 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">QUESTIONS</span>
            <span className="text-sm font-black text-blue-900 mt-0.5">
              {levelConfig.questionCount} Questions (10+)
            </span>
          </div>

          {/* Target Score */}
          <div className="bg-amber-50/80 p-2 rounded-2xl border border-amber-100 flex flex-col justify-center">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500">
              <Target className="w-3 h-3 text-amber-600" />
              <span>TARGET SCORE</span>
            </div>
            <span className="text-sm font-black text-amber-900 mt-0.5">
              {levelConfig.targetScore.toLocaleString()} pts
            </span>
          </div>

          {/* Current Total Score */}
          <div className="bg-emerald-50/80 p-2 rounded-2xl border border-emerald-100 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">TOTAL SCORE</span>
            <span className="text-sm font-black text-emerald-900 mt-0.5">
              {playerStats.totalTournamentScore.toLocaleString()} pts
            </span>
          </div>

          {/* Best Score */}
          <div className="bg-rose-50/80 p-2 rounded-2xl border border-rose-100 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-slate-500">BEST LEVEL SCORE</span>
            <span className="text-sm font-black text-rose-900 mt-0.5">
              {bestLevelScore > 0 ? `${bestLevelScore.toLocaleString()} pts` : 'Not Played'}
            </span>
          </div>

          {/* Highest Combo */}
          <div className="bg-orange-50/80 p-2 rounded-2xl border border-orange-100 flex flex-col justify-center">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500">
              <Flame className="w-3 h-3 text-orange-600" />
              <span>HIGHEST COMBO</span>
            </div>
            <span className="text-sm font-black text-orange-800 mt-0.5">
              x{Math.max(playerStats.bestCombo, 1)}
            </span>
          </div>

          {/* Time Limit */}
          <div className="bg-cyan-50/80 p-2 rounded-2xl border border-cyan-100 flex flex-col justify-center">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500">
              <Clock className="w-3 h-3 text-cyan-700" />
              <span>TIME LIMIT</span>
            </div>
            <span className="text-sm font-black text-cyan-900 mt-0.5">
              {levelConfig.timeLimitSeconds}s / question
            </span>
          </div>

          {/* Lives & Hints */}
          <div className="bg-pink-50/80 p-2 rounded-2xl border border-pink-100 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">LIVES</span>
                <span className="text-xs">❤️ ❤️ ❤️</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">HINTS</span>
                <span className="text-xs font-black text-amber-600">💡 {playerStats.availableHints}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Player Rank Tag */}
        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-slate-700">YOUR TOURNAMENT RANK:</span>
          </div>
          <span className="text-sm font-black text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full">
            #{leaderboardPreview.userRank}
          </span>
        </div>
      </div>

      {/* Leaderboard Top Players Snippet */}
      <div className="w-full max-w-sm bg-white/70 backdrop-blur-md rounded-2xl p-3 shadow-sm border border-white/80 mb-3">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Top Tournament Players
            </span>
          </div>
          <button
            onClick={() => {
              emojiAudio.playTap();
              onOpenFullLeaderboard();
            }}
            className="text-[11px] font-bold text-purple-700 hover:underline"
          >
            View All
          </button>
        </div>

        <div className="space-y-1">
          {leaderboardPreview.entries.slice(0, 4).map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between text-xs py-1 px-2 rounded-xl transition-colors ${
                entry.isCurrentUser
                  ? 'bg-purple-100 border border-purple-300 font-black text-purple-900'
                  : 'bg-white/50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-4 text-center font-bold text-slate-500 text-[11px]">
                  {entry.rank}
                </span>
                <span className="text-sm">{entry.avatarEmoji}</span>
                <span className="font-bold truncate max-w-[120px]">{entry.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">Lv {entry.level}</span>
                <span className="font-extrabold text-amber-700">{entry.score.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Big Glossy [ START LEVEL ] Button */}
      <div className="w-full max-w-sm pb-2">
        <button
          onClick={() => {
            if (!isLocked) {
              emojiAudio.playTap();
              onStartLevel();
            }
          }}
          disabled={isLocked}
          className={`w-full py-4 px-6 rounded-3xl font-black text-xl sm:text-2xl uppercase tracking-wider font-['Fredoka',sans-serif] shadow-xl flex items-center justify-center gap-3 transition-all ${
            isLocked
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed border-b-4 border-slate-400'
              : 'bg-gradient-to-b from-[#48c6ef] via-[#29b6f6] to-[#0288d1] border-b-[6px] border-[#01579b] text-white active:border-b-2 active:translate-y-1 hover:brightness-105'
          }`}
        >
          <Play className="w-6 h-6 fill-current ml-0.5" />
          <span>{isLocked ? 'Level Locked' : 'Start Level'}</span>
        </button>
      </div>
    </div>
  );
};
