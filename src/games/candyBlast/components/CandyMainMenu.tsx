import React from 'react';
import { 
  Play, 
  Sparkles, 
  Trophy, 
  Map, 
  HelpCircle, 
  Settings, 
  Star, 
  ArrowLeft,
  Award,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import { PlayerProgress } from '../types';
import { getTotalStarsEarned, getTotalCampaignScore, getCompletedLevelsCount } from '../levelStorage';

interface CandyMainMenuProps {
  progress: PlayerProgress;
  onPlayOrContinue: () => void;
  onOpenLevels: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onExitGame: () => void;
  isAudioEnabled?: boolean;
  onToggleAudio?: () => void;
}

export const CandyMainMenu: React.FC<CandyMainMenuProps> = ({
  progress,
  onPlayOrContinue,
  onOpenLevels,
  onOpenLeaderboard,
  onOpenHowToPlay,
  onOpenSettings,
  onExitGame,
  isAudioEnabled = true,
  onToggleAudio,
}) => {
  const completedCount = getCompletedLevelsCount(progress);
  const totalStars = getTotalStarsEarned(progress);
  const totalScore = getTotalCampaignScore(progress);
  const currentLevel = progress.unlockedLevel || 1;
  const hasProgressed = currentLevel > 1 || completedCount > 0;

  return (
    <div
      id="candy-main-menu"
      className="relative w-full max-w-md mx-auto h-[640px] sm:h-[680px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif] border-2 border-pink-500/40 select-none text-white animate-in fade-in"
      style={{
        background: 'radial-gradient(circle at 50% 15%, #3b0764 0%, #1e1035 45%, #0a0614 100%)',
      }}
    >
      {/* CANDY-THEMED BOKEH & SPARKLE ACCENTS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35 z-0">
        <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-pink-500/25 blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-48 h-48 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute -bottom-10 left-1/4 w-40 h-40 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      {/* TOP HEADER BAR */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          id="candy-menu-exit-btn"
          type="button"
          onClick={onExitGame}
          className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white/90 border border-white/15 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-md"
          title="Exit to Game Center"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-xs font-black uppercase tracking-wider shadow-inner">
          <Sparkles className="w-3.5 h-3.5 fill-pink-300" />
          <span>Official Match-3</span>
        </div>

        {onToggleAudio && (
          <button
            id="candy-menu-audio-btn"
            type="button"
            onClick={onToggleAudio}
            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-md"
            title={isAudioEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {isAudioEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
          </button>
        )}
      </div>

      {/* CENTER HERO & TITLE */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-2">
        {/* Animated Sweet Candy Emblem */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 p-1 shadow-[0_10px_30px_rgba(244,63,94,0.4)] flex items-center justify-center animate-bounce duration-1000">
            <div className="w-full h-full rounded-[22px] bg-[#1a082b] flex items-center justify-center text-3xl sm:text-4xl shadow-inner border border-white/20">
              🍬
            </div>
          </div>
          <div className="absolute -top-1 -right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border border-white">
            ★
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          <span>CANDY </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300">
            CRUSH
          </span>
        </h1>
        <p className="text-xs text-pink-200/80 font-semibold tracking-wide mt-1">
          40 Sweet Progressive Campaign Levels
        </p>

        {/* PLAYER PROGRESS HERO CARD */}
        <div
          id="candy-progress-card"
          className="w-full mt-4 p-3.5 rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md shadow-xl"
        >
          <div className="flex items-center justify-between text-xs font-bold text-pink-200/90 pb-2 border-b border-white/10">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>CAMPAIGN PROGRESS</span>
            </span>
            <span className="font-mono text-amber-300">
              {completedCount} / 40 CLEARED
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2.5 text-center">
            <div className="bg-black/30 rounded-xl p-2 border border-white/5">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CURRENT</div>
              <div className="text-base font-black text-pink-300 font-mono">
                LVL {currentLevel}
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-2 border border-white/5">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">STARS</div>
              <div className="text-base font-black text-amber-300 font-mono flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                <span>{totalStars}</span>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-2 border border-white/5">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TOTAL SCORE</div>
              <div className="text-base font-black text-emerald-300 font-mono truncate">
                {totalScore.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION ACTION BUTTONS */}
      <div className="relative z-10 w-full flex flex-col gap-2.5 pt-2">
        {/* PRIMARY PLAY / CONTINUE BUTTON */}
        <button
          id="candy-primary-play-btn"
          type="button"
          onClick={onPlayOrContinue}
          className="min-h-[54px] w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:brightness-110 active:scale-98 text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_8px_25px_rgba(244,63,94,0.45)] border border-pink-300/40 transition-all cursor-pointer"
        >
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
            <Play className="w-4 h-4 fill-white text-white" />
          </div>
          <span>{hasProgressed ? `CONTINUE (LEVEL ${currentLevel})` : 'PLAY (LEVEL 1)'}</span>
        </button>

        {/* SECONDARY MENU BUTTONS GRID */}
        <div className="grid grid-cols-2 gap-2">
          {/* LEVELS BUTTON */}
          <button
            id="candy-menu-levels-btn"
            type="button"
            onClick={onOpenLevels}
            className="min-h-[46px] py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-98 border border-white/15 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Map className="w-4 h-4 text-cyan-300" />
            <span>LEVELS</span>
          </button>

          {/* LEADERBOARD BUTTON */}
          <button
            id="candy-menu-leaderboard-btn"
            type="button"
            onClick={onOpenLeaderboard}
            className="min-h-[46px] py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-98 border border-white/15 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>LEADERBOARD</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* HOW TO PLAY BUTTON */}
          <button
            id="candy-menu-howtoplay-btn"
            type="button"
            onClick={onOpenHowToPlay}
            className="min-h-[44px] py-2 px-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-98 border border-white/10 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-pink-300" />
            <span>HOW TO PLAY</span>
          </button>

          {/* SETTINGS BUTTON */}
          <button
            id="candy-menu-settings-btn"
            type="button"
            onClick={onOpenSettings}
            className="min-h-[44px] py-2 px-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-98 border border-white/10 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-300" />
            <span>SETTINGS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
