/**
 * Candy Juicy - In-Game Metagame Modals
 * How To Play, Achievements, Boosters, Statistics, Settings, About, and Daily Challenge
 */

import React, { useState } from 'react';
import { JuicyMatchSaveData, JuicyStorage, JuicyAchievementProgress } from './storage';
import { ALL_ACHIEVEMENTS, AchievementCategory } from './achievements';
import { soundManager } from './audioEngine';
import {
  X,
  Star,
  Trophy,
  Zap,
  HelpCircle,
  BarChart2,
  Settings,
  Info,
  Volume2,
  VolumeX,
  Music,
  Smartphone,
  CheckCircle2,
  Lock,
  Gift,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

/* =========================================================================
   1. HOW TO PLAY MODAL (11 Core Topics)
   ========================================================================= */
interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'specials' | 'objectives' | 'rules'>('basics');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 flex items-center justify-between text-white border-b-2 border-emerald-400">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            <h2 className="text-lg font-black tracking-wide drop-shadow">HOW TO PLAY</h2>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white active:scale-90 transition-transform cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-black">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('basics');
            }}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'basics' ? 'border-emerald-500 text-emerald-700 bg-white' : 'border-transparent text-slate-500'
            }`}
          >
            Basics
          </button>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('specials');
            }}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'specials' ? 'border-emerald-500 text-emerald-700 bg-white' : 'border-transparent text-slate-500'
            }`}
          >
            Specials
          </button>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('objectives');
            }}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'objectives' ? 'border-emerald-500 text-emerald-700 bg-white' : 'border-transparent text-slate-500'
            }`}
          >
            Objectives
          </button>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('rules');
            }}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'rules' ? 'border-emerald-500 text-emerald-700 bg-white' : 'border-transparent text-slate-500'
            }`}
          >
            Scoring
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-slate-700 text-xs leading-relaxed">
          {activeTab === 'basics' && (
            <>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <h3 className="font-black text-sm text-emerald-900 mb-1 flex items-center gap-1.5">
                  <span>🎯</span> Objective
                </h3>
                <p>
                  Clear level goals within the move limit! Swap adjacent candies horizontally or vertically to create matches of 3 or more of the same fruit.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <h3 className="font-black text-sm text-amber-900 mb-1 flex items-center gap-1.5">
                  <span>🍓</span> Match 3 Candies
                </h3>
                <p>
                  Matching 3 identical candies in a row or column pops them, awards points, and drops new fruits into the grid.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                <h3 className="font-black text-sm text-blue-900 mb-1 flex items-center gap-1.5">
                  <span>🌊</span> Cascades & Gravity
                </h3>
                <p>
                  When matched candies disappear, gravity causes new candies to fall from above. If falling candies form new matches, automatic cascades are triggered with escalating combo multipliers!
                </p>
              </div>
            </>
          )}

          {activeTab === 'specials' && (
            <>
              <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200">
                <h3 className="font-black text-sm text-orange-900 mb-1 flex items-center gap-1.5">
                  <span>⚡</span> Match 4: Striped Candy
                </h3>
                <p>
                  Match 4 candies in a straight line to create a Striped Candy. When matched, it blasts and clears an entire horizontal row or vertical column!
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                <h3 className="font-black text-sm text-purple-900 mb-1 flex items-center gap-1.5">
                  <span>🌈</span> Match 5: Rainbow Bomb
                </h3>
                <p>
                  Match 5 candies in a line to create a Rainbow Bomb. Swapping it with any candy clears EVERY candy of that color across the entire board!
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-pink-50 border border-pink-200">
                <h3 className="font-black text-sm text-pink-900 mb-1 flex items-center gap-1.5">
                  <span>💥</span> Special Combos
                </h3>
                <p>
                  Swapping two special candies together (e.g. Striped + Rainbow or Striped + Bomb) triggers massive board-clearing chain reactions.
                </p>
              </div>
            </>
          )}

          {activeTab === 'objectives' && (
            <>
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                <h3 className="font-black text-sm text-rose-900 mb-1 flex items-center gap-1.5">
                  <span>🍉</span> Fruit Collection
                </h3>
                <p>
                  Collect the designated quota of specific fruits (e.g., 15 Strawberries, 12 Kiwis) by matching them on the board.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-200">
                <h3 className="font-black text-sm text-cyan-900 mb-1 flex items-center gap-1.5">
                  <span>🍹</span> Juice Puddles
                </h3>
                <p>
                  Juice puddles coat the floor of certain tiles. Make matches directly over the puddles to clean and collect them!
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <h3 className="font-black text-sm text-amber-900 mb-1 flex items-center gap-1.5">
                  <span>📦</span> Wooden Crates & Chests
                </h3>
                <p>
                  Crates block tiles. Match candies adjacent to wooden crates to chip away and destroy them. Open golden chests for bonus coins!
                </p>
              </div>
            </>
          )}

          {activeTab === 'rules' && (
            <>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <h3 className="font-black text-sm text-amber-900 mb-1 flex items-center gap-1.5">
                  <span>⭐</span> Score & Star Thresholds
                </h3>
                <p>
                  Each candy matched yields 30 base points multiplied by the cascade index. Earn 1, 2, or 3 stars by surpassing the level score milestones!
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                <h3 className="font-black text-sm text-rose-900 mb-1 flex items-center gap-1.5">
                  <span>⚠️</span> Fail Condition
                </h3>
                <p>
                  If you run out of moves (0 moves remaining) before completing all level objectives, the level fails. You can retry with full lives anytime!
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-md active:scale-95 transition-transform cursor-pointer"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. ACHIEVEMENTS MODAL (5 Categories, Real Persistence)
   ========================================================================= */
interface AchievementsModalProps {
  saveData: JuicyMatchSaveData;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ saveData, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'ALL'>('ALL');

  const filteredAchievements = ALL_ACHIEVEMENTS.filter(
    (a) => selectedCategory === 'ALL' || a.category === selectedCategory
  );

  const unlockedCount = (Object.values(saveData.achievements || {}) as JuicyAchievementProgress[]).filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 flex items-center justify-between text-white border-b-2 border-amber-400">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-200" />
            <div>
              <h2 className="text-lg font-black tracking-wide drop-shadow">ACHIEVEMENTS</h2>
              <p className="text-[10px] font-bold text-amber-100">{unlockedCount} / {ALL_ACHIEVEMENTS.length} Unlocked</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white active:scale-90 transition-transform cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-[11px] font-black no-scrollbar">
          {(['ALL', 'MATCHING', 'COMBOS', 'SCORE', 'LEVELS', 'SPECIAL'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundManager.playButtonClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Achievements List */}
        <div className="p-3 overflow-y-auto space-y-2.5">
          {filteredAchievements.map((item) => {
            const progressObj = saveData.achievements?.[item.id];
            const isUnlocked = !!progressObj?.unlocked;
            const currentVal = Math.min(item.target, progressObj?.progress || 0);
            const percent = Math.min(100, Math.round((currentVal / item.target) * 100));

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                    : 'bg-slate-50/80 border-slate-200 opacity-85'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 ${
                    isUnlocked ? 'bg-amber-200 text-amber-900 border border-amber-300' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isUnlocked ? item.icon : <Lock className="w-5 h-5 text-slate-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className={`text-xs font-black truncate ${isUnlocked ? 'text-amber-950' : 'text-slate-700'}`}>
                      {item.name}
                    </h4>
                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 shrink-0">
                        {currentVal} / {item.target}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-tight mb-1.5">{item.description}</p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isUnlocked ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-200 text-slate-700 font-black text-xs hover:bg-slate-300 transition-colors cursor-pointer"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. BOOSTERS MODAL (Inventory & Instructions)
   ========================================================================= */
interface BoostersModalProps {
  saveData: JuicyMatchSaveData;
  onClose: () => void;
}

export const BoostersModal: React.FC<BoostersModalProps> = ({ saveData, onClose }) => {
  const boostersList = [
    {
      id: 'hammer',
      name: 'Smash Hammer',
      icon: '🔨',
      count: saveData.boosters.hammer,
      desc: 'Destroys any single tile, fruit, crate, or obstacle on the board without using a turn move.',
      usage: 'Tap the Hammer booster icon, then tap the target candy or crate you want to smash.',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'reshuffle',
      name: 'Board Shuffle',
      icon: '🔄',
      count: saveData.boosters.reshuffle,
      desc: 'Completely rearranges all fruits on the board to generate fresh matching opportunities.',
      usage: 'Tap the Shuffle icon to instantly stir and rearrange all active candies.',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      id: 'row_blast',
      name: 'Row Rocket',
      icon: '🚀',
      count: saveData.boosters.row_blast,
      desc: 'Blasts through an entire horizontal row, clearing all obstacles and fruits instantly.',
      usage: 'Tap the Row Rocket icon, then tap any tile in the row you wish to vaporize.',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    },
    {
      id: 'rainbow_bomb',
      name: 'Rainbow Bomb',
      icon: '🌈',
      count: saveData.boosters.rainbow_bomb,
      desc: 'The ultimate booster! Select any fruit type on the board and clears every single fruit of that color.',
      usage: 'Tap the Rainbow Bomb, then tap the fruit color you want cleared from the whole board.',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-sky-300 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 flex items-center justify-between text-white border-b-2 border-sky-400">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-sky-200" />
            <h2 className="text-lg font-black tracking-wide drop-shadow">POWER BOOSTERS</h2>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white active:scale-90 transition-transform cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Boosters List */}
        <div className="p-3.5 overflow-y-auto space-y-3">
          {boostersList.map((b) => (
            <div key={b.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl filter drop-shadow">{b.icon}</span>
                  <div>
                    <h3 className="font-black text-xs text-slate-800">{b.name}</h3>
                    <span className="text-[10px] font-bold text-slate-500">In Inventory: {b.count}</span>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-xl text-xs font-black border ${b.badgeColor}`}>
                  x{b.count} Available
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-1">{b.desc}</p>
              <div className="text-[10px] font-semibold text-slate-500 bg-white p-2 rounded-xl border border-slate-200">
                <span className="font-black text-slate-700">How to use: </span>
                {b.usage}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-xs shadow-md active:scale-95 transition-transform cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   4. STATISTICS MODAL (Real Saved Numbers)
   ========================================================================= */
interface StatisticsModalProps {
  saveData: JuicyMatchSaveData;
  onClose: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({ saveData, onClose }) => {
  const stats = saveData.stats || {
    totalMatches: 0,
    totalCombos: 0,
    highestCombo: 0,
    totalCascades: 0,
    boostersUsed: 0,
    levelsCompleted: 0,
    bestScoreEver: 0,
  };

  const totalStars = (Object.values(saveData.stars || {}) as number[]).reduce((a, b) => a + (b || 0), 0);
  const completedLevels = Object.keys(saveData.stars || {}).filter((k) => (saveData.stars[Number(k)] || 0) > 0).length;
  const unlockedAchievementsCount = (Object.values(saveData.achievements || {}) as JuicyAchievementProgress[]).filter((a) => a.unlocked).length;

  const statItems = [
    { label: 'Levels Completed', value: `${completedLevels} / 40`, icon: '🏝️' },
    { label: 'Stars Collected', value: `${totalStars} / 120 ★`, icon: '⭐' },
    { label: 'Best Score (Single Level)', value: stats.bestScoreEver.toLocaleString(), icon: '🏆' },
    { label: 'Total Matches Made', value: stats.totalMatches.toLocaleString(), icon: '🍓' },
    { label: 'Combos Triggered', value: stats.totalCombos.toLocaleString(), icon: '✨' },
    { label: 'Highest Cascade Chain', value: `${stats.highestCombo}x Cascade`, icon: '🌊' },
    { label: 'Achievements Unlocked', value: `${unlockedAchievementsCount} / ${ALL_ACHIEVEMENTS.length}`, icon: '🎖️' },
    { label: 'Boosters Activated', value: stats.boostersUsed.toLocaleString(), icon: '🔨' },
    { label: 'Current Win Streak', value: `${saveData.winStreak || 0} Wins`, icon: '🔥' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-purple-300 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 flex items-center justify-between text-white border-b-2 border-purple-400">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-200" />
            <h2 className="text-lg font-black tracking-wide drop-shadow">PLAYER STATISTICS</h2>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white active:scale-90 transition-transform cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="p-3.5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {statItems.map((st, i) => (
            <div key={i} className="p-3 rounded-2xl bg-purple-50/50 border border-purple-200 flex items-center gap-3">
              <span className="text-2xl filter drop-shadow">{st.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide truncate">{st.label}</div>
                <div className="text-sm font-black text-purple-950">{st.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md active:scale-95 transition-transform cursor-pointer"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   5. SETTINGS MODAL (Sound, Music, Haptics)
   ========================================================================= */
interface SettingsModalProps {
  saveData: JuicyMatchSaveData;
  onUpdateSave: (updated: JuicyMatchSaveData) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ saveData, onUpdateSave, onClose }) => {
  const [sound, setSound] = useState(saveData.soundEnabled);
  const [music, setMusic] = useState(saveData.musicEnabled);
  const [haptics, setHaptics] = useState(saveData.hapticsEnabled ?? true);
  const [confirmReset, setConfirmReset] = useState(false);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    soundManager.setMuted(!next);
    const updated = { ...saveData, soundEnabled: next };
    JuicyStorage.save(updated);
    onUpdateSave(updated);
    if (next) soundManager.playSelect();
  };

  const toggleMusic = () => {
    const next = !music;
    setMusic(next);
    if (next) {
      soundManager.startMusic();
    } else {
      soundManager.stopMusic();
    }
    const updated = { ...saveData, musicEnabled: next };
    JuicyStorage.save(updated);
    onUpdateSave(updated);
  };

  const toggleHaptics = () => {
    const next = !haptics;
    setHaptics(next);
    const updated = { ...saveData, hapticsEnabled: next };
    JuicyStorage.save(updated);
    onUpdateSave(updated);
    if (next) soundManager.triggerHaptic('medium');
  };

  const handleResetProgress = () => {
    localStorage.removeItem('teleplay_juicy_match_save_v1');
    const fresh = JuicyStorage.load();
    onUpdateSave(fresh);
    setConfirmReset(false);
    soundManager.playLevelFail();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 flex items-center justify-between text-white border-b-2 border-amber-400">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-black tracking-wide drop-shadow">SETTINGS</h2>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white active:scale-90 transition-transform cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggles */}
        <div className="p-4 space-y-3">
          {/* Sound FX */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                {sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-rose-500" />}
              </div>
              <div>
                <div className="text-xs font-black text-slate-800">Sound Effects</div>
                <div className="text-[10px] text-slate-500">Fruit pops, explosions, cascades</div>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                sound ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                  sound ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Tropical Music */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-800">Background Music</div>
                <div className="text-[10px] text-slate-500">Tropical marimba melodies</div>
              </div>
            </div>
            <button
              onClick={toggleMusic}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                music ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                  music ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Haptic Vibrations */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-800">Haptics & Vibration</div>
                <div className="text-[10px] text-slate-500">Subtle tactile click feedback</div>
              </div>
            </div>
            <button
              onClick={toggleHaptics}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                haptics ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                  haptics ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Reset Confirmation */}
          {confirmReset ? (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
              <p className="text-xs font-black text-rose-700 mb-2">Reset all 40 levels and records?</p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleResetProgress}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs shadow cursor-pointer"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-bold text-xs transition-colors cursor-pointer"
            >
              Reset Saved Progress
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   6. ABOUT MODAL
   ========================================================================= */
interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 flex items-center justify-between text-white border-b-2 border-amber-400">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            <h2 className="text-lg font-black tracking-wide drop-shadow">ABOUT CANDY JUICY</h2>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white active:scale-90 transition-transform cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="text-center py-2">
            <span className="text-4xl filter drop-shadow inline-block animate-bounce">🍓</span>
            <h3 className="text-base font-black text-slate-800 mt-1">Candy Juicy: Tropical Rush</h3>
            <p className="text-[11px] font-bold text-amber-600">Version 1.2.0 • Premium Edition</p>
          </div>

          <p>
            Candy Juicy is a handcrafted 40-level Match-3 tropical puzzle adventure. Explore lush island beaches, collect juicy fruits, wash away juice stains, and shatter wooden crates.
          </p>

          <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
            <div className="font-black text-[11px] text-amber-900">Key Highlights:</div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
              <li>40 progressive handcrafted stages</li>
              <li>Procedural sound design & marimba audio loop</li>
              <li>Special combinations: Striped Candy & Rainbow Bomb</li>
              <li>Persistent achievements & statistics tracking</li>
              <li>100% offline-ready & mobile optimized</li>
            </ul>
          </div>

          <div className="text-[10px] text-center text-slate-400">
            Powered by TelePlay Game Framework
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-200 text-slate-700 font-black text-xs hover:bg-slate-300 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   7. DAILY CHALLENGE MODAL
   ========================================================================= */
interface DailyChallengeModalProps {
  saveData: JuicyMatchSaveData;
  onPlayChallenge: () => void;
  onClose: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  saveData,
  onPlayChallenge,
  onClose,
}) => {
  const currentDay = saveData.dailyRewardDay || 1;
  const rewards = [
    '200 Coins',
    '150 Coins + 2 Shuffles',
    '200 Coins + 2 Hammers',
    '250 Coins + 2 Row Blasts',
    '300 Coins + 1 Rainbow Bomb',
    '350 Coins + 3 Hammers',
    '500 Coins + Super Boosters Pack',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border-4 border-pink-300 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-3 flex items-center justify-between text-white border-b-2 border-pink-400">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-200" />
            <h2 className="text-lg font-black tracking-wide drop-shadow">DAILY CHALLENGE</h2>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white active:scale-90 transition-transform cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="p-3 rounded-2xl bg-pink-50 border border-pink-200 text-center">
            <span className="text-3xl filter drop-shadow">🎁</span>
            <h3 className="font-black text-sm text-pink-900 mt-1">Day {currentDay} Bonus Reward</h3>
            <p className="text-xs font-bold text-pink-700 mt-0.5">{rewards[currentDay - 1]}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 mb-1">Today's Objective</div>
            <p className="text-xs font-bold text-slate-700">
              Clear the current unlocked stage or replay with 3 Stars to claim daily bounty!
            </p>
          </div>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onPlayChallenge();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-sm shadow-md border-b-4 border-pink-800 active:translate-y-0.5 transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Play Today's Challenge</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="w-full py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 transition-colors cursor-pointer"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
