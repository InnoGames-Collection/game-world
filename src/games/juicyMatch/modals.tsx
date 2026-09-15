/**
 * Juicy Match - Modular In-Game & Metagame Modals
 * Replicates the authentic reference video screens:
 * 1. DailyRewardModal (7-Day tropical rewards, "Cool" button)
 * 2. LevelStartModal (Task targets, boosters, candy awning)
 * 3. WinModal (3 Stars, Trophy score, Coins, Continue)
 * 4. AchievementGiftModal (3 win streak gifts)
 * 5. FailModal (Out of moves, Retry)
 * 6. PauseModal (Resume, Sound toggle, Restart, Level Map)
 */

import React, { useState } from 'react';
import { LevelConfig, LevelObjective } from './types';
import { FruitGraphic, BlockerGraphic, UnderlayGraphic } from './fruitRenderer';
import { soundManager } from './audioEngine';
import { Star, X, Trophy, Coins, RotateCcw, Play, Volume2, VolumeX, Home } from 'lucide-react';

/* =========================================================================
   1. DAILY REWARD MODAL (As seen in the first seconds of the reference video)
   ========================================================================= */
interface DailyRewardModalProps {
  currentDay: number;
  onClaim: () => void;
  onClose: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({ currentDay, onClaim, onClose }) => {
  const days = [
    { day: 1, label: 'Day 1', reward: '200 Coins', icon: '🪙' },
    { day: 2, label: 'Day 2', reward: '3x Pineapple', icon: '🍍' },
    { day: 3, label: 'Day 3', reward: '6x Juice', icon: '🧃' },
    { day: 4, label: 'Day 4', reward: 'Special Drink', icon: '🍹' },
    { day: 5, label: 'Day 5', reward: 'Double Juice', icon: '🥤' },
    { day: 6, label: 'Day 6', reward: 'Fruit Basket', icon: '🍉' },
    { day: 7, label: 'Day 7', reward: 'Mega Treasure', icon: '👑' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden text-center">
        
        {/* Pink Striped Candy Awning Header */}
        <div className="relative bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 py-3 shadow-md border-b-4 border-rose-300">
          <h2 className="text-xl font-black text-white tracking-wide drop-shadow-md">
            Daily Reward!
          </h2>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="absolute right-3 top-3 p-1 rounded-full bg-white/30 text-white hover:bg-white/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Days Reward Grid */}
        <div className="p-4 bg-amber-50/70">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {days.slice(0, 4).map((d) => {
              const isToday = d.day === currentDay;
              return (
                <div
                  key={d.day}
                  className={`flex flex-col items-center p-2 rounded-2xl border-2 transition-all ${
                    isToday
                      ? 'bg-amber-200 border-amber-400 ring-2 ring-amber-400 scale-105 shadow-md'
                      : 'bg-white border-amber-100 shadow-sm'
                  }`}
                >
                  <span className="text-[10px] font-black text-slate-500">{d.label}</span>
                  <span className="text-2xl my-1">{d.icon}</span>
                  {isToday && (
                    <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {days.slice(4, 7).map((d) => {
              const isToday = d.day === currentDay;
              return (
                <div
                  key={d.day}
                  className={`flex flex-col items-center p-2 rounded-2xl border-2 transition-all ${
                    isToday
                      ? 'bg-amber-200 border-amber-400 ring-2 ring-amber-400 scale-105 shadow-md'
                      : 'bg-white border-amber-100 shadow-sm'
                  }`}
                >
                  <span className="text-[10px] font-black text-slate-500">{d.label}</span>
                  <span className="text-2xl my-1">{d.icon}</span>
                  {isToday && (
                    <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 font-medium mb-1">
            Come back tomorrow for more rewards!
          </p>
          <div className="text-xs font-black text-amber-600 mb-4 tracking-wider">
            NEXT REWARD IN: 17:41:14
          </div>

          {/* Large Rounded Green "Cool" Button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClaim();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-b from-lime-400 to-emerald-600 text-white font-black text-base shadow-lg border-b-4 border-emerald-700 active:translate-y-0.5 transition-transform"
          >
            Cool
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. LEVEL START MODAL (Task targets, boosters, green Start button)
   ========================================================================= */
interface LevelStartModalProps {
  config: LevelConfig;
  onStart: () => void;
  onClose: () => void;
}

export const LevelStartModal: React.FC<LevelStartModalProps> = ({ config, onStart, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-xs bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden text-center">
        
        {/* Pink Striped Candy Awning Header */}
        <div className="relative bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 py-3 shadow-md border-b-4 border-rose-300">
          <h2 className="text-2xl font-black text-white tracking-wide drop-shadow-md">
            Level {config.level}
          </h2>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="absolute right-3 top-3 p-1 rounded-full bg-white/30 text-white hover:bg-white/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 bg-amber-50/60">
          {/* 3 Golden Star Frames */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center shadow-inner"
              >
                <Star className="w-6 h-6 text-amber-300 fill-amber-200" />
              </div>
            ))}
          </div>

          {/* Task Objectives Display */}
          <div className="bg-white/90 rounded-2xl p-3 shadow-inner border border-amber-200 mb-4">
            <span className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
              Task
            </span>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {config.objectives.map((obj, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                  {obj.type === 'collect_fruit' && obj.fruitType ? (
                    <FruitGraphic type={obj.fruitType} size={32} />
                  ) : obj.type === 'clear_juice' ? (
                    <div className="w-8 h-8 flex items-center justify-center text-xl">🧃</div>
                  ) : obj.type === 'break_crates' ? (
                    <BlockerGraphic type="crate_1" size={30} />
                  ) : obj.type === 'open_chests' ? (
                    <BlockerGraphic type="chest" size={30} />
                  ) : (
                    <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
                  )}
                  <span className="text-base font-black text-slate-800">x{obj.target}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Boosters Row */}
          <div className="mb-5">
            <span className="block text-[11px] font-bold text-slate-500 mb-2">
              Activate boosters:
            </span>
            <div className="flex items-center justify-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white border-2 border-amber-300 flex items-center justify-center shadow-sm text-lg">
                🔨
              </div>
              <div className="w-11 h-11 rounded-full bg-white border-2 border-amber-300 flex items-center justify-center shadow-sm text-lg">
                🔄
              </div>
              <div className="w-11 h-11 rounded-full bg-white border-2 border-amber-300 flex items-center justify-center shadow-sm text-lg">
                🚀
              </div>
            </div>
          </div>

          {/* Green Rounded "Start" Button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onStart();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-lime-400 to-emerald-600 text-white font-black text-lg shadow-xl border-b-4 border-emerald-700 active:translate-y-0.5 transition-transform"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. WIN MODAL (3 Stars animation, Trophy Score, Coins, Continue)
   ========================================================================= */
interface WinModalProps {
  level: number;
  score: number;
  stars: number;
  coinsEarned: number;
  onContinue: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({ level, score, stars, coinsEarned, onContinue }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-xs bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden text-center">
        
        {/* Pink Striped Header */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 py-3 shadow-md border-b-4 border-rose-300">
          <h2 className="text-2xl font-black text-white tracking-wide drop-shadow-md">
            Level {level}
          </h2>
        </div>

        <div className="p-5 bg-amber-50/70">
          {/* Animated Stars */}
          <div className="flex items-center justify-center gap-3 mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all ${
                  s <= stars
                    ? 'bg-amber-400 border-2 border-yellow-200 scale-110 animate-bounce'
                    : 'bg-slate-200 border-2 border-slate-300'
                }`}
                style={{ animationDelay: `${s * 150}ms` }}
              >
                <Star
                  className={`w-7 h-7 ${
                    s <= stars ? 'text-white fill-white' : 'text-slate-400 fill-slate-300'
                  }`}
                />
              </div>
            ))}
          </div>

          <h3 className="text-xl font-black text-amber-800 mb-3">You win!</h3>

          {/* Trophy & Score Display */}
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-amber-200 flex items-center justify-around mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-7 h-7 text-amber-500" />
              <div className="text-left">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Score</span>
                <span className="text-lg font-black text-slate-800">{score.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Coins className="w-7 h-7 text-amber-500" />
              <div className="text-left">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Reward</span>
                <span className="text-lg font-black text-emerald-600">+{coinsEarned}</span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onContinue();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-lime-400 to-emerald-600 text-white font-black text-lg shadow-xl border-b-4 border-emerald-700 active:translate-y-0.5 transition-transform"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   4. ACHIEVEMENT GIFT MODAL (3 Wins in a row mystery boxes!)
   ========================================================================= */
interface AchievementGiftModalProps {
  onClaim: () => void;
}

export const AchievementGiftModal: React.FC<AchievementGiftModalProps> = ({ onClaim }) => {
  const [openedBox, setOpenedBox] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-xs bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden text-center p-5">
        <h3 className="text-lg font-black text-amber-800 mb-1">Achievement gift!</h3>
        <p className="text-xs font-semibold text-slate-500 mb-4">
          You won three in a row! Choose your reward:
        </p>

        {/* 3 Green Wrapped Gift Boxes */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[1, 2, 3].map((box) => (
            <button
              key={box}
              onClick={() => {
                soundManager.playSpecialCreate();
                setOpenedBox(box);
              }}
              disabled={openedBox !== null}
              className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                openedBox === box
                  ? 'bg-amber-100 border-amber-400 scale-105'
                  : 'bg-emerald-50 border-emerald-300 active:scale-95'
              }`}
            >
              <div className="text-4xl filter drop-shadow mb-1">
                {openedBox === box ? '🎁' : '📦'}
              </div>
              <span className="text-[10px] font-black text-emerald-800">
                {openedBox === box ? '+200 Coins!' : 'Open'}
              </span>
            </button>
          ))}
        </div>

        {openedBox !== null && (
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClaim();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-b from-lime-400 to-emerald-600 text-white font-black text-base shadow-lg border-b-4 border-emerald-700 active:translate-y-0.5 transition-transform"
          >
            Claim
          </button>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   5. FAIL MODAL (Out of Moves, Retry)
   ========================================================================= */
interface FailModalProps {
  level: number;
  objectives: LevelObjective[];
  onRetry: () => void;
  onExitToMap: () => void;
}

export const FailModal: React.FC<FailModalProps> = ({ level, objectives, onRetry, onExitToMap }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-xs bg-white rounded-3xl shadow-2xl border-4 border-rose-300 overflow-hidden text-center">
        
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 py-3 shadow-md border-b-4 border-rose-400">
          <h2 className="text-xl font-black text-white tracking-wide drop-shadow-md">
            Out of Moves!
          </h2>
        </div>

        <div className="p-5 bg-rose-50/50">
          <p className="text-xs text-slate-600 font-medium mb-4">
            You were so close! Don't give up!
          </p>

          <div className="flex items-center justify-center gap-2 mb-5">
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-rose-200">
                <span className="text-xs font-black text-slate-700">
                  {obj.current} / {obj.target}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onRetry();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-lime-400 to-emerald-600 text-white font-black text-base shadow-lg border-b-4 border-emerald-700 active:translate-y-0.5 transition-transform"
            >
              Try Again
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onExitToMap();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Return to Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   6. PAUSE MODAL (Full In-Game Menu)
   ========================================================================= */
interface PauseModalProps {
  soundEnabled: boolean;
  onResume: () => void;
  onRestart: () => void;
  onOpenHowToPlay: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  onExitToMainMenu: () => void;
  onExitToMap: () => void;
  onToggleSound: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  soundEnabled,
  onResume,
  onRestart,
  onOpenHowToPlay,
  onOpenAchievements,
  onOpenSettings,
  onExitToMainMenu,
  onExitToMap,
  onToggleSound,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-xs bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden text-center p-4">
        <h2 className="text-xl font-black text-slate-800 mb-3 tracking-wide">Game Paused</h2>

        <div className="flex flex-col gap-2 mb-3">
          {/* RESUME */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onResume();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-b from-lime-400 to-emerald-600 text-white font-black text-base shadow-md border-b-4 border-emerald-700 active:translate-y-0.5 transition-transform cursor-pointer"
          >
            Resume
          </button>

          {/* RESTART */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onRestart();
            }}
            className="w-full py-2.5 rounded-2xl bg-amber-400 text-amber-950 font-black text-xs shadow-md border-b-4 border-amber-600 active:translate-y-0.5 transition-transform cursor-pointer"
          >
            Restart Level
          </button>

          {/* HOW TO PLAY */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onOpenHowToPlay();
            }}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            How To Play
          </button>

          {/* ACHIEVEMENTS */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onOpenAchievements();
            }}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Achievements
          </button>

          {/* SETTINGS */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onOpenSettings();
            }}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Settings
          </button>

          {/* LEVEL MAP */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onExitToMap();
            }}
            className="w-full py-2 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs hover:bg-sky-100 transition-colors cursor-pointer"
          >
            Level Map (40 Stages)
          </button>

          {/* MAIN MENU */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onExitToMainMenu();
            }}
            className="w-full py-2 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Main Menu
          </button>
        </div>

        {/* Sound toggle shortcut */}
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onToggleSound();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-black shadow-inner cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
          <span>{soundEnabled ? 'Sound ON' : 'Sound OFF'}</span>
        </button>
      </div>
    </div>
  );
};
