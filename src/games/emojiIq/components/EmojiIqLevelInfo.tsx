/**
 * EMOJI IQ — Pre-Game Level Info Screen
 * Displays stage metrics, tournament difficulty, rewards, and allows opening leaderboard BEFORE starting.
 */

import React from 'react';
import { EmojiIqLevelConfig, EmojiIqPlayerStats } from '../types';
import { EMOJI_IQ_COLORS } from '../colors';
import { Trophy, Play, ArrowLeft, Star, Clock, Flame, Heart, Target } from 'lucide-react';
import { emojiIqAudio } from '../emojiIqAudio';

interface EmojiIqLevelInfoProps {
  levelConfig: EmojiIqLevelConfig;
  playerStats: EmojiIqPlayerStats;
  onStartLevel: () => void;
  onOpenLeaderboard: () => void;
  onBack: () => void;
}

export const EmojiIqLevelInfo: React.FC<EmojiIqLevelInfoProps> = ({
  levelConfig,
  playerStats,
  onStartLevel,
  onOpenLeaderboard,
  onBack,
}) => {
  const levelHighScore = playerStats.highScoreByLevel[levelConfig.level] || 0;
  const levelStars = playerStats.starsByLevel[levelConfig.level] || 0;
  const isCompleted = levelHighScore > 0;

  return (
    <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between p-4 select-none">
      {/* Top Bar with Back Button and Stage Title */}
      <div className="w-full flex items-center justify-between mb-2">
        <button
          onClick={() => {
            emojiIqAudio.playPop();
            onBack();
          }}
          className="w-10 h-10 rounded-2xl bg-white border border-[#6C5CE7]/20 flex items-center justify-center text-[#241F3D] hover:scale-105 active:scale-95 transition-transform shadow-sm"
          title="Back to Levels"
        >
          <ArrowLeft className="w-5 h-5 text-[#6C5CE7]" />
        </button>

        <div className="flex flex-col items-center">
          <span
            className="text-xs font-black uppercase tracking-widest"
            style={{ color: EMOJI_IQ_COLORS.primary }}
          >
            EMOJI IQ TOURNAMENT
          </span>
          <h1
            className="text-2xl sm:text-3xl font-black font-['Fredoka',sans-serif] tracking-wide text-center uppercase"
            style={{ color: EMOJI_IQ_COLORS.textPrimary }}
          >
            LEVEL {levelConfig.level < 10 ? `0${levelConfig.level}` : levelConfig.level}
          </h1>
        </div>

        {/* Pre-Game Leaderboard Access Button (Mandated by Section 17 & 18) */}
        <button
          onClick={() => {
            emojiIqAudio.playPop();
            onOpenLeaderboard();
          }}
          className="w-10 h-10 rounded-2xl bg-white border border-[#FFB703]/40 flex items-center justify-center text-[#FFB703] hover:scale-105 active:scale-95 transition-transform shadow-sm"
          title="View Tournament Leaderboard Before Starting"
        >
          <Trophy className="w-5 h-5 fill-[#FFB703]" />
        </button>
      </div>

      {/* Main Info Card */}
      <div
        className="w-full bg-white rounded-3xl p-5 shadow-lg border my-auto flex flex-col items-center"
        style={{
          borderColor: 'rgba(108, 92, 231, 0.15)',
          boxShadow: '0 12px 30px -6px rgba(108, 92, 231, 0.15)',
        }}
      >
        {/* Stage Theme & Subtitle */}
        <span
          className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-1"
          style={{
            backgroundColor: '#F7F5FF',
            color: EMOJI_IQ_COLORS.primary,
            border: '1px solid rgba(108, 92, 231, 0.2)',
          }}
        >
          {levelConfig.theme}
        </span>

        <h2
          className="text-2xl font-black font-['Fredoka',sans-serif] tracking-wide mb-2 text-center"
          style={{ color: EMOJI_IQ_COLORS.textPrimary }}
        >
          {levelConfig.title}
        </h2>

        {/* Difficulty Stars */}
        <div className="flex items-center gap-1.5 mb-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star
              key={idx}
              className={`w-5 h-5 transition-transform ${
                idx < levelConfig.difficultyStars
                  ? 'fill-[#FFB703] text-[#FFB703]'
                  : 'fill-slate-100 text-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Diamond Divider */}
        <div className="w-full max-w-xs flex items-center justify-center mb-4 opacity-60">
          <span className="text-xs text-[#6C5CE7]">◇</span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#6C5CE7] to-transparent mx-2" />
          <span className="text-xs text-[#6C5CE7]">◇</span>
        </div>

        {/* Stage Metrics Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 text-left mb-4">
          {/* Questions */}
          <div className="bg-[#F7F5FF] p-3 rounded-2xl border border-[#6C5CE7]/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#6C5CE7] shadow-sm">
              <Target className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#6B6780] uppercase">QUESTIONS</span>
              <span className="text-sm font-black font-mono text-[#241F3D]">
                {levelConfig.questionCount} Puzzles
              </span>
            </div>
          </div>

          {/* Time Limit */}
          <div className="bg-[#F7F5FF] p-3 rounded-2xl border border-[#6C5CE7]/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#00B8D9] shadow-sm">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#6B6780] uppercase">TIME LIMIT</span>
              <span className="text-sm font-black font-mono text-[#241F3D]">
                {levelConfig.timeLimitSeconds}s / Puzzle
              </span>
            </div>
          </div>

          {/* Best Score */}
          <div className="bg-[#F7F5FF] p-3 rounded-2xl border border-[#6C5CE7]/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#FFB703] shadow-sm">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#6B6780] uppercase">BEST SCORE</span>
              <span className="text-sm font-black font-mono text-[#241F3D]">
                {levelHighScore > 0 ? levelHighScore.toLocaleString() : '---'}
              </span>
            </div>
          </div>

          {/* Target Score */}
          <div className="bg-[#F7F5FF] p-3 rounded-2xl border border-[#6C5CE7]/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#20C997] shadow-sm">
              <Star className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#6B6780] uppercase">TARGET SCORE</span>
              <span className="text-sm font-black font-mono text-[#241F3D]">
                {levelConfig.targetScore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Lives & Reward Banner */}
        <div className="w-full flex items-center justify-between px-3 py-2 rounded-2xl bg-[#F7F5FF] border border-[#6C5CE7]/15">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#6B6780]">Available Lives:</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart key={i} className="w-3.5 h-3.5 fill-[#FF5A67] text-[#FF5A67]" />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-black text-[#FFB703]">
            <span>Reward: +{levelConfig.rewardCoins} 🪙</span>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="w-full flex flex-col gap-2 mt-4">
        <button
          onClick={() => {
            emojiIqAudio.playPop();
            onStartLevel();
          }}
          className="w-full py-4 rounded-2xl text-white font-black text-xl tracking-wide shadow-lg hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          style={{
            backgroundColor: EMOJI_IQ_COLORS.primary,
            boxShadow: '0 6px 20px rgba(108, 92, 231, 0.45)',
          }}
        >
          <Play className="w-6 h-6 fill-white" />
          <span>START LEVEL</span>
        </button>

        {/* View Tournament Leaderboard Before Starting Button */}
        <button
          onClick={() => {
            emojiIqAudio.playPop();
            onOpenLeaderboard();
          }}
          className="w-full py-3 rounded-2xl font-bold text-sm bg-white border border-[#FFB703]/50 text-[#241F3D] shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all"
        >
          <Trophy className="w-4 h-4 text-[#FFB703]" />
          <span>View Standings & Leaderboard</span>
        </button>
      </div>
    </div>
  );
};
