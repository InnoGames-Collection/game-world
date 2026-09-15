/**
 * Candy Juicy - Main Menu Screen
 * Professional, glossy mobile game landing menu before gameplay.
 * Respects existing 3D fruit artwork, tropical theme, and clean mobile responsiveness.
 */

import React from 'react';
import { JuicyMatchSaveData, JuicyAchievementProgress } from './storage';
import { soundManager } from './audioEngine';
import {
  Play,
  Map,
  Trophy,
  HelpCircle,
  Award,
  Zap,
  BarChart2,
  Settings,
  Info,
  Calendar,
  Volume2,
  VolumeX,
  ArrowLeft,
  Star,
  Coins,
  Sparkles,
} from 'lucide-react';

interface MainMenuScreenProps {
  saveData: JuicyMatchSaveData;
  onPlay: () => void;
  onOpenLevels: () => void;
  onOpenLeaderboard: () => void;
  onOpenDailyChallenge: () => void;
  onOpenHowToPlay: () => void;
  onOpenAchievements: () => void;
  onOpenBoosters: () => void;
  onOpenStatistics: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onToggleSound: () => void;
  onExitToPortal: () => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  saveData,
  onPlay,
  onOpenLevels,
  onOpenLeaderboard,
  onOpenDailyChallenge,
  onOpenHowToPlay,
  onOpenAchievements,
  onOpenBoosters,
  onOpenStatistics,
  onOpenSettings,
  onOpenAbout,
  onToggleSound,
  onExitToPortal,
}) => {
  const currentLevel = saveData.highestUnlockedLevel || 1;
  const totalStars = (Object.values(saveData.stars || {}) as number[]).reduce((a, b) => a + (b || 0), 0);
  const unlockedAchievementsCount = (Object.values(saveData.achievements || {}) as JuicyAchievementProgress[]).filter((a) => a.unlocked).length;

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-gradient-to-b from-[#38bdf8] via-[#7dd3fc] to-[#fef08a] overflow-y-auto overflow-x-hidden select-none font-['Plus_Jakarta_Sans',sans-serif] p-3 sm:p-4 text-slate-800">
      {/* Decorative Tropical Palms & Background Glow */}
      <div className="absolute top-0 left-0 text-7xl opacity-20 pointer-events-none filter drop-shadow">🌴</div>
      <div className="absolute top-0 right-0 text-7xl opacity-20 pointer-events-none filter drop-shadow -scale-x-100">🌴</div>
      <div className="absolute bottom-10 left-4 text-5xl opacity-20 pointer-events-none filter drop-shadow">🏖️</div>
      <div className="absolute bottom-12 right-4 text-5xl opacity-20 pointer-events-none filter drop-shadow">🍍</div>

      {/* 1. TOP STATUS BAR (Back to Portal, Coins, Stars, Audio Toggle) */}
      <div className="relative z-20 flex items-center justify-between w-full max-w-md mx-auto pt-1">
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onExitToPortal();
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/80 hover:bg-white text-slate-700 font-black text-xs shadow-md border border-amber-200 active:scale-95 transition-transform cursor-pointer"
          title="Exit to Portal"
        >
          <ArrowLeft className="w-4 h-4 text-amber-600" />
          <span>Exit</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Stars Pill */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-white/90 text-amber-600 text-xs font-black shadow-md border border-amber-300">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{totalStars}</span>
          </div>

          {/* Coins Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/90 text-amber-900 text-xs font-black shadow-md border border-amber-300">
            <Coins className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{saveData.coins.toLocaleString()}</span>
          </div>

          {/* Audio Toggle */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onToggleSound();
            }}
            className="p-2 rounded-2xl bg-white/80 hover:bg-white text-slate-700 shadow-md border border-amber-200 active:scale-95 transition-transform cursor-pointer"
            title="Toggle Sound"
          >
            {saveData.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
          </button>
        </div>
      </div>

      {/* 2. LOGO & HERO SECTION */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-3">
        {/* Animated Glossy Candies Ribbon */}
        <div className="flex items-center gap-2 mb-2 animate-bounce">
          <span className="text-3xl filter drop-shadow">🍓</span>
          <span className="text-4xl filter drop-shadow">🍉</span>
          <span className="text-3xl filter drop-shadow">🍌</span>
          <span className="text-3xl filter drop-shadow">🫐</span>
        </div>

        {/* 3D Glossy Game Title */}
        <div className="relative text-center px-4 py-2">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_8px_rgba(234,88,12,0.8)] [text-shadow:_0_3px_0_#c2410c,_0_6px_12px_rgba(0,0,0,0.3)] uppercase">
            Candy Juicy
          </h1>
          <p className="text-xs sm:text-sm font-extrabold text-amber-900 tracking-wider uppercase mt-0.5 drop-shadow-sm flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 inline" />
            <span>Tropical 40-Level Match-3</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600 inline" />
          </p>
        </div>

        {/* Current Progress Banner */}
        <div className="mt-2 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/90 border border-amber-300 shadow-sm text-xs font-black text-amber-800">
          <span>Stage {currentLevel} of 40</span>
          <span className="text-amber-400">•</span>
          <span>{totalStars} / 120 Stars</span>
        </div>

        {/* PRIMARY ACTION: PLAY BUTTON */}
        <div className="w-full max-w-xs mt-5">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onPlay();
            }}
            className="w-full py-4 px-6 rounded-3xl bg-gradient-to-b from-[#84cc16] via-[#65a30d] to-[#4d7c0f] hover:from-[#a3e635] hover:to-[#65a30d] text-white font-black text-xl tracking-wider uppercase shadow-[0_8px_20px_rgba(101,163,13,0.45)] border-b-4 border-[#365314] active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <Play className="w-7 h-7 fill-current drop-shadow group-hover:scale-110 transition-transform" />
            <span className="drop-shadow-md">PLAY (LVL {currentLevel})</span>
          </button>
        </div>
      </div>

      {/* 3. SECONDARY MENU TILES (2 Columns Grid) */}
      <div className="relative z-10 w-full max-w-md mx-auto grid grid-cols-2 gap-2 sm:gap-2.5 pb-2">
        {/* LEVELS */}
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onOpenLevels();
          }}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 hover:bg-white border-2 border-amber-300 shadow-md text-left active:scale-95 transition-all cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
            <Map className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-slate-800 tracking-wide">LEVELS</div>
            <div className="text-[10px] font-bold text-amber-700 truncate">40 Stages Map</div>
          </div>
        </button>

        {/* LEADERBOARD */}
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onOpenLeaderboard();
          }}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 hover:bg-white border-2 border-amber-400 shadow-md text-left active:scale-95 transition-all cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-amber-800 tracking-wide">LEADERBOARD</div>
            <div className="text-[10px] font-bold text-amber-700 truncate">Top Rankings</div>
          </div>
        </button>

        {/* DAILY CHALLENGE */}
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onOpenDailyChallenge();
          }}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 hover:bg-white border-2 border-pink-300 shadow-md text-left active:scale-95 transition-all cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-slate-800 tracking-wide">DAILY TASK</div>
            <div className="text-[10px] font-bold text-pink-600 truncate">Day {saveData.dailyRewardDay} Bonus</div>
          </div>
        </button>

        {/* ACHIEVEMENTS */}
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onOpenAchievements();
          }}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 hover:bg-white border-2 border-amber-300 shadow-md text-left active:scale-95 transition-all cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-slate-800 tracking-wide">ACHIEVE</div>
            <div className="text-[10px] font-bold text-amber-700 truncate">{unlockedAchievementsCount}/15 Unlocked</div>
          </div>
        </button>

        {/* BOOSTERS */}
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onOpenBoosters();
          }}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 hover:bg-white border-2 border-sky-300 shadow-md text-left active:scale-95 transition-all cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
            <Zap className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-slate-800 tracking-wide">BOOSTERS</div>
            <div className="text-[10px] font-bold text-sky-600 truncate">Inventory & Tools</div>
          </div>
        </button>

        {/* HOW TO PLAY */}
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onOpenHowToPlay();
          }}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 hover:bg-white border-2 border-emerald-300 shadow-md text-left active:scale-95 transition-all cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-slate-800 tracking-wide">HOW TO PLAY</div>
            <div className="text-[10px] font-bold text-emerald-700 truncate">Rules & Combos</div>
          </div>
        </button>

        {/* STATISTICS */}
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onOpenStatistics();
          }}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 hover:bg-white border-2 border-purple-300 shadow-md text-left active:scale-95 transition-all cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-slate-800 tracking-wide">STATISTICS</div>
            <div className="text-[10px] font-bold text-purple-700 truncate">Records & Highs</div>
          </div>
        </button>
      </div>

      {/* 4. BOTTOM UTILITY BAR (Settings, About) */}
      <div className="relative z-10 w-full max-w-md mx-auto flex items-center justify-between pt-1 border-t border-white/40">
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onOpenSettings();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-700 font-bold text-xs shadow-sm cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-600" />
          <span>Settings</span>
        </button>

        <span className="text-[10px] font-bold text-slate-600">v1.2.0 • TelePlay</span>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            onOpenAbout();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-700 font-bold text-xs shadow-sm cursor-pointer"
        >
          <Info className="w-4 h-4 text-slate-600" />
          <span>About</span>
        </button>
      </div>
    </div>
  );
};
