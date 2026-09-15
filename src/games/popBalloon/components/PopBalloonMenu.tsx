import React from 'react';
import {
  Play,
  Trophy,
  Grid,
  BarChart2,
  Award,
  HelpCircle,
  Settings,
  Volume2,
  VolumeX,
  ArrowLeft,
  Flame,
  ShieldCheck,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { PopBalloonProgress, PopBalloonScreenState } from '../types';
import { formatMsisdnMasked, calculateGlobalRank } from '../storage';
import { getPopBalloonLevel } from '../levelBank';
import { UserProfile } from '../../../types';

interface PopBalloonMenuProps {
  progress: PopBalloonProgress;
  profile?: UserProfile;
  onPlayLevel: (levelNum: number) => void;
  onOpenScreen: (screen: PopBalloonScreenState) => void;
  onExit: () => void;
  isSoundOn: boolean;
  onToggleSound: () => void;
}

export const PopBalloonMenu: React.FC<PopBalloonMenuProps> = ({
  progress,
  profile,
  onPlayLevel,
  onOpenScreen,
  onExit,
  isSoundOn,
  onToggleSound,
}) => {
  const currentLevelNum = Math.min(40, Math.max(1, progress.unlockedLevel));
  const currentLevelCfg = getPopBalloonLevel(currentLevelNum);
  const maskedPhone = formatMsisdnMasked(profile?.phoneNumber);
  const globalRank = calculateGlobalRank(progress.totalTournamentScore);
  const bestLevelScore = (Object.values(progress.levelBestScores) as number[]).reduce((max: number, s: number) => Math.max(max, s), 0);
  const completedCount = Object.keys(progress.levelBestScores).length;

  return (
    <div
      id="pop-balloon-main-menu"
      className="relative w-full h-full min-h-[600px] flex flex-col justify-between p-4 sm:p-5 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#070D1E] via-[#0D1936] to-[#060B18] text-white overflow-y-auto custom-scrollbar"
    >
      {/* 1. TOP BAR */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 shrink-0">
        <button
          id="pop-balloon-menu-exit-btn"
          type="button"
          onClick={onExit}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-md"
          title="Exit to Teleplay Hub"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            id="pop-balloon-menu-sound-btn"
            type="button"
            onClick={onToggleSound}
            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-md"
            title={isSoundOn ? 'Mute Audio' : 'Unmute Audio'}
          >
            {isSoundOn ? (
              <Volume2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
          </button>

          <button
            id="pop-balloon-menu-settings-btn"
            type="button"
            onClick={() => onOpenScreen('SETTINGS')}
            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-md"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>

      {/* 2. GAME TITLE & VIBRANT BALLOON MOTIF */}
      <div className="flex flex-col items-center text-center my-3 sm:my-4">
        {/* Floating Balloon Accent Badges */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3.5 h-3.5 rounded-full bg-[#FF3B30] shadow-sm animate-bounce [animation-delay:0ms]" />
          <div className="w-3 h-3 rounded-full bg-[#FF9500] shadow-sm animate-bounce [animation-delay:120ms]" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#FFD60A] shadow-sm animate-bounce [animation-delay:240ms]" />
          <div className="w-3 h-3 rounded-full bg-[#34C759] shadow-sm animate-bounce [animation-delay:360ms]" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#007AFF] shadow-sm animate-bounce [animation-delay:480ms]" />
          <div className="w-3 h-3 rounded-full bg-[#AF52DE] shadow-sm animate-bounce [animation-delay:600ms]" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#FF2D55] shadow-sm animate-bounce [animation-delay:720ms]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none uppercase">
          POP BALLOON
        </h1>
        <div className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>40-LEVEL TOURNAMENT CHAMPIONSHIP</span>
        </div>
      </div>

      {/* 3. TOURNAMENT PLAYER PROFILE HERO CARD */}
      <div
        id="pop-balloon-player-card"
        className="relative p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#121E42] to-[#0A132C] border border-blue-500/30 shadow-xl mb-3"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#007AFF] via-[#34C759] to-[#FFD60A] p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#070D1E] flex items-center justify-center font-black text-white text-base">
                🎈
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-white font-mono">
                  {maskedPhone}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-400/40 text-[9px] font-bold text-blue-300 flex items-center gap-1 uppercase">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Verified
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-medium">
                Level {currentLevelNum} of 40 • {completedCount} Cleared
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Global Rank
            </div>
            <div className="text-base sm:text-lg font-black text-white font-mono">
              #{globalRank.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 3 Metric Badges */}
        <div className="grid grid-cols-3 gap-2 pt-3 text-center">
          <div className="bg-black/30 rounded-xl p-2 border border-white/5">
            <div className="text-[9px] text-slate-400 font-bold uppercase">Tournament Score</div>
            <div className="text-sm sm:text-base font-black text-amber-300 font-mono">
              {progress.totalTournamentScore.toLocaleString()}
            </div>
          </div>
          <div className="bg-black/30 rounded-xl p-2 border border-white/5">
            <div className="text-[9px] text-slate-400 font-bold uppercase">Best Single Run</div>
            <div className="text-sm sm:text-base font-black text-emerald-300 font-mono">
              {bestLevelScore.toLocaleString()}
            </div>
          </div>
          <div className="bg-black/30 rounded-xl p-2 border border-white/5">
            <div className="text-[9px] text-slate-400 font-bold uppercase">Max Combo</div>
            <div className="text-sm sm:text-base font-black text-rose-400 font-mono">
              {progress.bestComboAllTime > 0 ? `${progress.bestComboAllTime}x` : '0x'}
            </div>
          </div>
        </div>
      </div>

      {/* 4. PRIMARY PLAY CTA */}
      <div className="mb-3">
        <button
          id="pop-balloon-play-now-btn"
          type="button"
          onClick={() => onPlayLevel(currentLevelNum)}
          className="w-full min-h-[56px] py-4 px-6 rounded-2xl bg-gradient-to-r from-[#007AFF] via-[#3B82F6] to-[#2563EB] hover:from-blue-500 hover:to-blue-700 active:scale-[0.98] text-white font-black text-lg flex items-center justify-between shadow-xl shadow-blue-600/30 border border-blue-400/50 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Play className="w-6 h-6 fill-white text-white ml-0.5" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs uppercase tracking-wider font-extrabold text-blue-200">
                {currentLevelNum === 1 && completedCount === 0 ? 'START TOURNAMENT' : 'CONTINUE'}
              </div>
              <div className="text-base font-black">
                LEVEL {currentLevelNum}: {currentLevelCfg.description}
              </div>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/80 shrink-0" />
        </button>
      </div>

      {/* 5. SECONDARY ACTION GRID */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <button
          id="pop-balloon-nav-levels"
          type="button"
          onClick={() => onOpenScreen('LEVEL_SELECT')}
          className="min-h-[44px] p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center shadow-md"
        >
          <Grid className="w-5 h-5 text-blue-400" />
          <span className="text-[10px] font-black uppercase tracking-wider">Levels (40)</span>
        </button>

        <button
          id="pop-balloon-nav-leaderboard"
          type="button"
          onClick={() => onOpenScreen('LEADERBOARD')}
          className="min-h-[44px] p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center shadow-md"
        >
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-wider">Leaderboard</span>
        </button>

        <button
          id="pop-balloon-nav-stats"
          type="button"
          onClick={() => onOpenScreen('STATS')}
          className="min-h-[44px] p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center shadow-md"
        >
          <BarChart2 className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-wider">My Stats</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          id="pop-balloon-nav-tournament"
          type="button"
          onClick={() => onOpenScreen('TOURNAMENT')}
          className="min-h-[44px] p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center shadow-md"
        >
          <Zap className="w-5 h-5 text-purple-400" />
          <span className="text-[10px] font-black uppercase tracking-wider">Tournament</span>
        </button>

        <button
          id="pop-balloon-nav-achievements"
          type="button"
          onClick={() => onOpenScreen('ACHIEVEMENTS')}
          className="min-h-[44px] p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center shadow-md"
        >
          <Award className="w-5 h-5 text-rose-400" />
          <span className="text-[10px] font-black uppercase tracking-wider">Badges</span>
        </button>

        <button
          id="pop-balloon-nav-help"
          type="button"
          onClick={() => onOpenScreen('HOW_TO_PLAY')}
          className="min-h-[44px] p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center shadow-md"
        >
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <span className="text-[10px] font-black uppercase tracking-wider">How to Play</span>
        </button>
      </div>

      {/* 6. BOTTOM TOURNAMENT DISCLAIMER */}
      <div className="mt-3 text-center text-[10px] text-slate-400">
        Deterministic Multi-Factor Scoring • 40 Progressive Stages • Anti-Farming System
      </div>
    </div>
  );
};
