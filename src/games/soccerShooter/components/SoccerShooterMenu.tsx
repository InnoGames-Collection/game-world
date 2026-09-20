import React, { useMemo, useRef, useEffect } from 'react';
import {
  Play,
  Trophy,
  Grid3X3,
  HelpCircle,
  Award,
  BarChart2,
  Settings,
  Info,
  ArrowLeft,
  Volume2,
  VolumeX,
  Flame,
  Star,
  Clock,
  Target,
  Zap,
} from 'lucide-react';
import { LevelProgress, LevelSaveData } from '../types';
import { UserProfile } from '../../../types';
import { renderCountryFlagBall } from '../countryFlagBallRenderer';

interface SoccerShooterMenuProps {
  progress: LevelProgress;
  profile?: UserProfile;
  currentLevelNumber?: number;
  isAudioMuted?: boolean;
  onToggleAudio?: () => void;
  onPlay?: () => void;
  onPlayLevel?: (lvl: number) => void;
  onOpenLevels: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  onOpenAchievements: () => void;
  onOpenStatistics: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onExit: () => void;
}

const MenuBallMascot: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Left: Brazil (YELLOW)
    renderCountryFlagBall(ctx, 36, 42, 22, 'YELLOW', -0.2);
    // Right: Argentina (BLUE)
    renderCountryFlagBall(ctx, 116, 42, 22, 'BLUE', 0.2);
    // Center Hero: Ethiopia (GREEN)
    renderCountryFlagBall(ctx, 76, 36, 28, 'GREEN', 0);
  }, []);

  return (
    <div className="relative mb-3 flex items-center justify-center">
      <div className="absolute -inset-4 rounded-full blur-2xl opacity-40 bg-cyan-400" />
      <canvas
        ref={canvasRef}
        width={152}
        height={76}
        className="w-[152px] h-[76px] drop-shadow-2xl relative z-10"
      />
    </div>
  );
};

export const SoccerShooterMenu: React.FC<SoccerShooterMenuProps> = ({
  progress,
  profile,
  currentLevelNumber,
  isAudioMuted = false,
  onToggleAudio,
  onPlay,
  onPlayLevel,
  onOpenLevels,
  onOpenLeaderboard,
  onOpenHowToPlay,
  onOpenAchievements,
  onOpenStatistics,
  onOpenSettings,
  onOpenAbout,
  onExit,
}) => {
  // Aggregate real stats from progress
  const computedStats = useMemo(() => {
    const completedEntries = Object.entries(progress.completedLevels || {}) as Array<[string, LevelSaveData]>;
    const levelsCompletedCount = completedEntries.length;
    let totalStars = 0;
    let bestLevelScore = 0;

    completedEntries.forEach(([, data]) => {
      totalStars += data.stars || 0;
      if (data.highScore > bestLevelScore) {
        bestLevelScore = data.highScore;
      }
    });

    const stats = progress.stats || {
      gamesPlayed: 0,
      levelsCompleted: levelsCompletedCount,
      totalShotsFired: 0,
      totalEffectiveShots: 0,
      totalMissedShots: 0,
      totalBubblesPopped: 0,
      totalBubblesDropped: 0,
      bestCombo: 0,
      bestTimeSeconds: 0,
      perfectLevelsCount: 0,
    };

    const targetLevel = currentLevelNumber || Math.min(40, progress.highestUnlockedLevel || 1);

    return {
      currentLevel: targetLevel,
      bestLevelScore,
      totalScore: progress.totalScore || 0,
      levelsCompleted: levelsCompletedCount,
      bestCombo: stats.bestCombo || 0,
      bestTimeSeconds: stats.bestTimeSeconds || 0,
      starsEarned: totalStars,
    };
  }, [progress, currentLevelNumber]);

  const formatTime = (secs: number) => {
    if (!secs || secs <= 0) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="soccer-shooter-main-menu"
      className="relative w-full h-full min-h-[600px] flex flex-col justify-between p-4 sm:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif] bg-gradient-to-b from-[#061224] via-[#091b36] to-[#040c18] overflow-y-auto custom-scrollbar"
    >
      {/* Background Decorative Lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[110px] opacity-35 bg-cyan-500" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-[90px] opacity-20 bg-blue-600" />
        <div className="absolute top-1/3 left-4 w-48 h-48 rounded-full blur-[80px] opacity-15 bg-amber-500" />
      </div>

      {/* TOP HEADER: Exit to Portal & Sound Toggle */}
      <header className="relative z-10 w-full flex items-center justify-between">
        <button
          type="button"
          id="btn-menu-exit"
          onClick={onExit}
          aria-label="Back to Portal"
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Tournament Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider backdrop-blur-sm shadow-sm">
          <Zap className="w-3.5 h-3.5 text-cyan-400 fill-current" />
          <span>40 Pro Levels</span>
        </div>

        {/* Audio Toggle */}
        <button
          type="button"
          id="btn-menu-audio"
          onClick={onToggleAudio}
          aria-label={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
        >
          {isAudioMuted ? (
            <VolumeX className="w-5 h-5 text-red-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-emerald-400" />
          )}
        </button>
      </header>

      {/* CENTER HERO: Title & Visual Emblem */}
      <main className="relative z-10 my-auto py-4 flex flex-col items-center text-center max-w-md mx-auto w-full">
        {/* 3D Country Flag Soccer Balls Mascot */}
        <MenuBallMascot />

        {/* Main Title & Subtitle */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-md">
          SOCCER SHOOTER
        </h1>
        <p className="text-xs font-black tracking-widest text-cyan-300 uppercase mt-0.5">
          ሶከር ሹተር &bull; PRO ARCADE
        </p>

        {/* REAL STORED GAME DATA BANNER */}
        <section
          aria-label="Player Statistics Overview"
          className="mt-4 w-full p-3.5 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-md shadow-xl text-left"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/90 mb-2 flex items-center justify-between border-b border-white/10 pb-1.5">
            <span>Career Record</span>
            <span className="text-slate-400 font-mono">Real-time Verified</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {/* CURRENT LEVEL */}
            <div className="p-1.5 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Level</div>
              <div className="text-sm font-black text-cyan-300 mt-0.5">
                {computedStats.currentLevel}/40
              </div>
            </div>

            {/* BEST LEVEL SCORE */}
            <div className="p-1.5 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Best Lvl</div>
              <div className="text-sm font-black text-amber-300 font-mono mt-0.5">
                {computedStats.bestLevelScore > 0 ? computedStats.bestLevelScore.toLocaleString() : '---'}
              </div>
            </div>

            {/* TOTAL SCORE */}
            <div className="p-1.5 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Score</div>
              <div className="text-sm font-black text-emerald-300 font-mono mt-0.5">
                {computedStats.totalScore > 0 ? computedStats.totalScore.toLocaleString() : '0'}
              </div>
            </div>

            {/* LEVELS COMPLETED */}
            <div className="p-1.5 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Cleared</div>
              <div className="text-sm font-black text-purple-300 mt-0.5">
                {computedStats.levelsCompleted}
              </div>
            </div>
          </div>

          {/* Secondary stats row: BEST COMBO, BEST TIME, STARS EARNED */}
          <div className="grid grid-cols-3 gap-2 mt-2 text-center pt-2 border-t border-white/5">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-300 font-semibold">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Combo: <strong className="text-white">{computedStats.bestCombo}x</strong></span>
            </div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-300 font-semibold">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Time: <strong className="text-white font-mono">{formatTime(computedStats.bestTimeSeconds)}</strong></span>
            </div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-300 font-semibold">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Stars: <strong className="text-amber-300">{computedStats.starsEarned}</strong></span>
            </div>
          </div>
        </section>
      </main>

      {/* BOTTOM CONTROLS: HERO PLAY + NAVIGATION MATRIX */}
      <footer className="relative z-10 w-full max-w-md mx-auto space-y-2.5 pb-1">
        {/* HERO PLAY BUTTON */}
        <button
          type="button"
          id="btn-menu-play"
          onClick={() => (onPlayLevel ? onPlayLevel(computedStats.currentLevel) : onPlay?.())}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 active:scale-[0.98] text-white font-black text-lg uppercase tracking-wider shadow-xl shadow-cyan-950/50 flex items-center justify-center gap-3 border border-white/30 transition-all cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current text-white drop-shadow" />
          <span>PLAY LEVEL {computedStats.currentLevel}</span>
        </button>

        {/* PRIMARY ACTIONS: LEVELS & LEADERBOARD */}
        <div className="grid grid-cols-2 gap-2">
          {/* LEVELS 1-40 SELECTOR */}
          <button
            type="button"
            id="btn-menu-levels"
            onClick={onOpenLevels}
            className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer backdrop-blur-sm shadow-sm"
          >
            <Grid3X3 className="w-4 h-4 text-cyan-400" />
            <span>40 Levels</span>
          </button>

          {/* LEADERBOARD */}
          <button
            type="button"
            id="btn-menu-leaderboard"
            onClick={onOpenLeaderboard}
            className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer backdrop-blur-sm shadow-sm"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Leaderboard</span>
          </button>
        </div>

        {/* SECONDARY ROW: How To Play, Achievements, Statistics */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            id="btn-menu-how-to-play"
            onClick={onOpenHowToPlay}
            className="py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white font-semibold text-xs flex flex-col items-center justify-center gap-1 border border-white/10 transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px]">How To Play</span>
          </button>

          <button
            type="button"
            id="btn-menu-achievements"
            onClick={onOpenAchievements}
            className="py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white font-semibold text-xs flex flex-col items-center justify-center gap-1 border border-white/10 transition-all cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px]">Badges</span>
          </button>

          <button
            type="button"
            id="btn-menu-statistics"
            onClick={onOpenStatistics}
            className="py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white font-semibold text-xs flex flex-col items-center justify-center gap-1 border border-white/10 transition-all cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px]">Statistics</span>
          </button>
        </div>

        {/* TERTIARY ROW: Settings & About */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            id="btn-menu-settings"
            onClick={onOpenSettings}
            className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-400 hover:text-white font-medium text-[11px] flex items-center justify-center gap-1.5 border border-white/5 transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            id="btn-menu-about"
            onClick={onOpenAbout}
            className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-400 hover:text-white font-medium text-[11px] flex items-center justify-center gap-1.5 border border-white/5 transition-all cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>About</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
