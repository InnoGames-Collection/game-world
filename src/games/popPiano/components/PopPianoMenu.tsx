import React, { useMemo } from 'react';
import {
  Play,
  Grid3X3,
  Trophy,
  HelpCircle,
  Award,
  BarChart2,
  Settings,
  Info,
  ArrowLeft,
  Volume2,
  VolumeX,
  Music,
  Zap,
  Target,
  Flame,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { PopPianoProgress, LevelSaveData } from '../types';
import { UserProfile } from '../../../types';

interface PopPianoMenuProps {
  progress: PopPianoProgress;
  profile?: UserProfile;
  currentLevelNumber?: number;
  isAudioMuted?: boolean;
  onToggleAudio?: () => void;
  onPlay: () => void;
  onOpenLevels: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  onOpenAchievements: () => void;
  onOpenStatistics: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onExit: () => void;
}

export const PopPianoMenu: React.FC<PopPianoMenuProps> = ({
  progress,
  profile,
  currentLevelNumber,
  isAudioMuted = false,
  onToggleAudio,
  onPlay,
  onOpenLevels,
  onOpenLeaderboard,
  onOpenHowToPlay,
  onOpenAchievements,
  onOpenStatistics,
  onOpenSettings,
  onOpenAbout,
  onExit,
}) => {
  // Aggregate real stats strictly from stored progress
  const displayStats = useMemo(() => {
    const completedEntries = Object.entries(progress.completedLevels || {}) as Array<[string, LevelSaveData]>;
    const levelsCompletedCount = completedEntries.length;
    let bestLevelScore = 0;

    completedEntries.forEach(([, data]) => {
      if (data.highScore > bestLevelScore) {
        bestLevelScore = data.highScore;
      }
    });

    const activeCurrentLevel = currentLevelNumber || Math.min(40, progress.highestUnlockedLevel || 1);
    const stats = progress.stats;

    return {
      currentLevel: activeCurrentLevel,
      highestUnlockedLevel: Math.min(40, progress.highestUnlockedLevel || 1),
      totalScore: progress.totalScore || 0,
      bestLevelScore,
      levelsCompleted: levelsCompletedCount,
      bestAccuracy: stats.bestAccuracy || (levelsCompletedCount > 0 ? 100 : 0),
      bestStreak: stats.bestCombo || 0,
      bestSpeedMs: stats.bestReactionTimeMs || 0,
      totalBlackTilesPressed: stats.totalBlackTilesPressed || 0,
    };
  }, [progress, currentLevelNumber]);

  return (
    <div
      id="pop-piano-main-menu-view"
      className="relative w-full h-full min-h-[620px] flex flex-col justify-between p-4 sm:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white overflow-y-auto custom-scrollbar"
    >
      {/* BACKGROUND PIANO KEYS ACCENT PATTERN */}
      <div className="absolute inset-0 pointer-events-none opacity-5 flex justify-around">
        <div className="w-12 h-full bg-white border-r border-black/40" />
        <div className="w-12 h-full bg-white border-r border-black/40" />
        <div className="w-12 h-full bg-white border-r border-black/40" />
        <div className="w-12 h-full bg-white border-r border-black/40" />
      </div>

      {/* TOP HEADER CONTROLS */}
      <header className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
        <button
          type="button"
          onClick={onExit}
          aria-label="Exit to TelePlay Hub"
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Branding & Status */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-300 tracking-wider uppercase">
            <Music className="w-3.5 h-3.5" />
            <span>Tournament Edition</span>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold">
            {profile?.displayName ? `Player: ${profile.displayName}` : 'Acoustic Piano Circuit'}
          </p>
        </div>

        {/* Audio Mute Toggle */}
        <button
          type="button"
          onClick={onToggleAudio}
          aria-label={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
          className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl border shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm active:scale-95 ${
            isAudioMuted
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
          }`}
        >
          {isAudioMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </header>

      {/* CENTER HERO & TITLE */}
      <div className="relative z-10 flex flex-col items-center justify-center py-4 text-center">
        {/* Animated Piano Keys Icon Badge */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#1E293B] via-[#0F172A] to-[#334155] border-2 border-cyan-400/40 shadow-2xl flex items-center justify-center relative overflow-hidden">
            {/* Visual Mini 4-Lane Keys */}
            <div className="flex h-12 w-14 gap-1 items-end justify-center">
              <div className="w-2.5 h-10 bg-white rounded-b-sm shadow-sm" />
              <div className="w-2.5 h-7 bg-black rounded-b-sm shadow-inner border border-white/20" />
              <div className="w-2.5 h-10 bg-white rounded-b-sm shadow-sm" />
              <div className="w-2.5 h-7 bg-black rounded-b-sm shadow-inner border border-white/20" />
            </div>
            <div className="absolute top-1 right-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-md">
          POP PIANO
        </h1>
        <p className="text-xs text-slate-300 max-w-xs mt-1 font-medium leading-relaxed">
          40-Level Competitive Tournament. Level 1 requires 100 black tiles. Deterministic scoring.
        </p>

        {/* PRIMARY PROGRESS SUMMARY CARD */}
        <div className="w-full max-w-sm mt-4 bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tournament Total</span>
              <div className="text-2xl font-black text-amber-300 font-mono tracking-tight">
                {displayStats.totalScore.toLocaleString()} <span className="text-xs font-semibold text-amber-400/80">PTS</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Progression</span>
              <div className="text-sm font-black text-cyan-300 font-mono">
                Level {displayStats.currentLevel} <span className="text-xs text-slate-400 font-normal">/ 40</span>
              </div>
            </div>
          </div>

          {/* 6 Real Tournament Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2.5 text-center">
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <div className="text-[9px] text-slate-400 uppercase font-bold flex items-center justify-center gap-1">
                <Target className="w-2.5 h-2.5 text-emerald-400" />
                <span>Accuracy</span>
              </div>
              <div className="text-xs font-extrabold text-white mt-0.5 font-mono">
                {displayStats.bestAccuracy > 0 ? `${displayStats.bestAccuracy}%` : '--'}
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <div className="text-[9px] text-slate-400 uppercase font-bold flex items-center justify-center gap-1">
                <Flame className="w-2.5 h-2.5 text-amber-400" />
                <span>Streak</span>
              </div>
              <div className="text-xs font-extrabold text-white mt-0.5 font-mono">
                {displayStats.bestStreak > 0 ? `${displayStats.bestStreak}x` : '0x'}
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <div className="text-[9px] text-slate-400 uppercase font-bold flex items-center justify-center gap-1">
                <Clock className="w-2.5 h-2.5 text-cyan-400" />
                <span>Speed</span>
              </div>
              <div className="text-xs font-extrabold text-white mt-0.5 font-mono">
                {displayStats.bestSpeedMs > 0 ? `${displayStats.bestSpeedMs}ms` : '--'}
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Best Level</div>
              <div className="text-xs font-extrabold text-amber-200 mt-0.5 font-mono">
                {displayStats.bestLevelScore > 0 ? `${displayStats.bestLevelScore} pts` : '--'}
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Completed</div>
              <div className="text-xs font-extrabold text-emerald-300 mt-0.5 font-mono">
                {displayStats.levelsCompleted} <span className="text-[10px] text-slate-400 font-normal">/ 40</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Black Tiles</div>
              <div className="text-xs font-extrabold text-cyan-300 mt-0.5 font-mono">
                {displayStats.totalBlackTilesPressed.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MENU NAVIGATION ACTIONS */}
      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col gap-2.5 pb-2">
        {/* PRIMARY PLAY BUTTON */}
        <button
          type="button"
          onClick={onPlay}
          id="pop-piano-btn-play"
          className="min-h-[50px] w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-white font-black text-base uppercase tracking-wider shadow-lg shadow-emerald-500/25 border border-emerald-300/30 flex items-center justify-center gap-2.5 cursor-pointer transition-all"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Play Level {displayStats.currentLevel}</span>
        </button>

        {/* SECONDARY ACTION GRID (LEVELS & LEADERBOARD) */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onOpenLevels}
            id="pop-piano-btn-levels"
            className="min-h-[46px] py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider border border-white/15 shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Grid3X3 className="w-4 h-4 text-cyan-400" />
            <span>40 Levels</span>
          </button>

          <button
            type="button"
            onClick={onOpenLeaderboard}
            id="pop-piano-btn-leaderboard"
            className="min-h-[46px] py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider border border-white/15 shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Leaderboard</span>
          </button>
        </div>

        {/* TERTIARY UTILITY GRID (ACHIEVEMENTS, STATS, HOW TO PLAY, SETTINGS) */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <button
            type="button"
            onClick={onOpenAchievements}
            title="Achievements"
            className="min-h-[44px] flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-all cursor-pointer active:scale-95"
          >
            <Award className="w-4 h-4 text-amber-300 mb-0.5" />
            <span className="text-[10px] font-semibold">Badges</span>
          </button>

          <button
            type="button"
            onClick={onOpenStatistics}
            title="Statistics"
            className="min-h-[44px] flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-all cursor-pointer active:scale-95"
          >
            <BarChart2 className="w-4 h-4 text-blue-400 mb-0.5" />
            <span className="text-[10px] font-semibold">Stats</span>
          </button>

          <button
            type="button"
            onClick={onOpenHowToPlay}
            title="How To Play"
            className="min-h-[44px] flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-all cursor-pointer active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400 mb-0.5" />
            <span className="text-[10px] font-semibold">Guide</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            title="Settings"
            className="min-h-[44px] flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-all cursor-pointer active:scale-95"
          >
            <Settings className="w-4 h-4 text-purple-400 mb-0.5" />
            <span className="text-[10px] font-semibold">Options</span>
          </button>
        </div>

        {/* ABOUT LINK */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onOpenAbout}
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer py-1 px-2"
          >
            <Info className="w-3.5 h-3.5" />
            <span>About Pop Piano Tournament & Rules</span>
          </button>
        </div>
      </div>
    </div>
  );
};
