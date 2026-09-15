import React, { useState, useMemo } from 'react';
import {
  Play,
  Trophy,
  BookOpen,
  Award,
  BarChart2,
  Settings,
  Info,
  ArrowLeft,
  Volume2,
  VolumeX,
  Flame,
  Star,
  Layers,
} from 'lucide-react';
import { GameConfig } from './types';
import { GameLeaderboardService } from '../../services/gameLeaderboardService';
import { UserProfile } from '../../types';

interface GameMenuProps {
  gameConfig: GameConfig;
  profile?: UserProfile;
  onPlay: () => void;
  onLeaderboard: () => void;
  onHowToPlay: () => void;
  onAchievements: () => void;
  onStatistics: () => void;
  onSettings: () => void;
  onAbout: () => void;
  onExit: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  gameConfig,
  profile,
  onPlay,
  onLeaderboard,
  onHowToPlay,
  onAchievements,
  onStatistics,
  onSettings,
  onAbout,
  onExit,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('teleplay_sound_enabled');
      return saved !== null ? saved === 'false' : false;
    } catch {
      return false;
    }
  });

  const stats = useMemo(() => {
    return GameLeaderboardService.getUserStats(gameConfig.gameId, profile);
  }, [gameConfig.gameId, profile]);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem('teleplay_sound_enabled', (!nextMuted).toString());
  };

  const { theme } = gameConfig;

  return (
    <div
      id={`game-menu-${gameConfig.gameId}`}
      className={`relative w-full h-full min-h-[600px] flex flex-col justify-between p-4 sm:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif] overflow-y-auto custom-scrollbar ${
        theme.bannerBg || 'bg-gradient-to-b from-slate-900 via-slate-950 to-black'
      }`}
    >
      {/* Background Decorative Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[100px] opacity-35"
          style={{ background: theme.accentColor }}
        />
        <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full blur-[80px] opacity-20 bg-blue-600" />
      </div>

      {/* TOP BAR: Portal Back & Audio Toggle */}
      <header className="relative z-10 w-full flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          aria-label="Back to portal"
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Category / Genre Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm backdrop-blur-sm ${
            theme.badgeBg || 'bg-white/10 text-white border-white/20'
          }`}
        >
          {gameConfig.genre}
        </div>

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-red-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-emerald-400" />
          )}
        </button>
      </header>

      {/* CENTER: Game Identity & Hero Presentation */}
      <main className="relative z-10 my-auto py-6 flex flex-col items-center text-center max-w-sm mx-auto w-full">
        {/* Animated Mascot / Icon Sphere */}
        <div className="relative mb-4 group">
          <div
            className="absolute -inset-2 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"
            style={{ background: theme.accentColor }}
          />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-b from-white/20 to-white/5 border-2 border-white/30 shadow-2xl backdrop-blur-md flex items-center justify-center text-5xl sm:text-6xl drop-shadow-lg transform transition-transform group-hover:scale-105">
            {theme.iconEmoji}
          </div>
        </div>

        {/* Title & Amharic Subtitle */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-md">
          {gameConfig.title}
        </h1>
        <p className="text-sm font-black tracking-wider text-amber-300 mt-0.5">
          {gameConfig.titleAmharic}
        </p>

        {/* Short Description */}
        <p className="text-xs text-slate-300 font-medium max-w-xs mt-2.5 leading-relaxed line-clamp-2">
          {gameConfig.tagline || gameConfig.description}
        </p>

        {/* Progression / Personal Best Mini-Card */}
        <div className="mt-5 w-full p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-around shadow-inner">
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Progression</div>
            <div className="text-sm font-black text-white flex items-center justify-center gap-1 mt-0.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>{gameConfig.hasLevels ? `Level ${stats.bestLevel}` : 'Standard'}</span>
            </div>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Best Record</div>
            <div className="text-sm font-black text-amber-300 font-mono flex items-center justify-center gap-1 mt-0.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{stats.bestScore > 0 ? stats.bestScore.toLocaleString() : '---'}</span>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM: Action Controls (Hero PLAY + Secondary Grid) */}
      <footer className="relative z-10 w-full max-w-sm mx-auto space-y-3 pb-2">
        {/* HERO PLAY BUTTON */}
        <button
          type="button"
          onClick={onPlay}
          className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r ${theme.primaryGradient} hover:brightness-110 active:scale-98 text-white font-black text-lg uppercase tracking-wider shadow-xl shadow-black/40 flex items-center justify-center gap-3 border border-white/30 transition-all cursor-pointer`}
        >
          <Play className="w-6 h-6 fill-current text-white drop-shadow" />
          <span>PLAY NOW</span>
        </button>

        {/* SECONDARY ACTION BUTTONS GRID */}
        <div className="grid grid-cols-3 gap-2">
          {/* LEADERBOARD */}
          <button
            type="button"
            onClick={onLeaderboard}
            className="py-3 px-2 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 border border-white/15 transition-all cursor-pointer backdrop-blur-sm shadow-sm"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-[11px]">Leaderboard</span>
          </button>

          {/* HOW TO PLAY */}
          <button
            type="button"
            onClick={onHowToPlay}
            className="py-3 px-2 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 border border-white/15 transition-all cursor-pointer backdrop-blur-sm shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px]">How To Play</span>
          </button>

          {/* ACHIEVEMENTS */}
          <button
            type="button"
            onClick={onAchievements}
            className="py-3 px-2 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 border border-white/15 transition-all cursor-pointer backdrop-blur-sm shadow-sm"
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px]">Badges</span>
          </button>
        </div>

        {/* ROW 2: Statistics, Settings, About */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onStatistics}
            className="py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white font-semibold text-[11px] flex items-center justify-center gap-1 border border-white/10 transition-all cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Stats</span>
          </button>

          <button
            type="button"
            onClick={onSettings}
            className="py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white font-semibold text-[11px] flex items-center justify-center gap-1 border border-white/10 transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={onAbout}
            className="py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white font-semibold text-[11px] flex items-center justify-center gap-1 border border-white/10 transition-all cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>About</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
