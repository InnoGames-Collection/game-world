/**
 * Color Rush - Championship Achievements Engine
 */

import { AchievementItem, ColorRushProgression } from './types';

export const COLOR_RUSH_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'first_rush',
    title: 'First Rush',
    description: 'Complete Level 1 of Color Rush',
    icon: '🎯',
    category: 'Progression',
    progress: 0,
    target: 1,
    unlocked: false,
    rewardPoints: 50,
  },
  {
    id: 'color_apprentice',
    title: 'Color Apprentice',
    description: 'Complete 5 levels with passing score',
    icon: '🔷',
    category: 'Progression',
    progress: 0,
    target: 5,
    unlocked: false,
    rewardPoints: 100,
  },
  {
    id: 'color_master',
    title: 'Chroma Master',
    description: 'Unlock and conquer Level 10',
    icon: '💎',
    category: 'Progression',
    progress: 0,
    target: 10,
    unlocked: false,
    rewardPoints: 250,
  },
  {
    id: 'color_grandmaster',
    title: 'Grandmaster Iris',
    description: 'Conquer Level 20 in the Advanced tier',
    icon: '👑',
    category: 'Progression',
    progress: 0,
    target: 20,
    unlocked: false,
    rewardPoints: 500,
  },
  {
    id: 'color_legend',
    title: 'Legendary Prism',
    description: 'Conquer Level 30 in the Master tier',
    icon: '🌟',
    category: 'Progression',
    progress: 0,
    target: 30,
    unlocked: false,
    rewardPoints: 1000,
  },
  {
    id: 'color_god',
    title: 'COLOR RUSH GOD',
    description: 'Complete all 40 championship levels',
    icon: '⚡',
    category: 'Progression',
    progress: 0,
    target: 40,
    unlocked: false,
    rewardPoints: 2500,
  },
  {
    id: 'perfect_vision',
    title: 'Perfect Vision',
    description: 'Complete any level with 100% accuracy (zero misses)',
    icon: '👁️',
    category: 'Skill',
    progress: 0,
    target: 1,
    unlocked: false,
    rewardPoints: 150,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Accumulate 10 or more Maximum Speed Bonuses (+3)',
    icon: '⚡',
    category: 'Speed',
    progress: 0,
    target: 10,
    unlocked: false,
    rewardPoints: 200,
  },
  {
    id: 'streak_master',
    title: 'Streak Titan',
    description: 'Achieve an unbroken streak of 12 or more correct colors',
    icon: '🔥',
    category: 'Skill',
    progress: 0,
    target: 12,
    unlocked: false,
    rewardPoints: 300,
  },
  {
    id: 'reflex_god',
    title: 'Reflex God',
    description: 'Achieve an average reaction speed under 450ms across a match',
    icon: '⏱️',
    category: 'Speed',
    progress: 0,
    target: 1,
    unlocked: false,
    rewardPoints: 400,
  },
  {
    id: 'high_scorer',
    title: 'High Scorer',
    description: 'Reach 2,500 total cumulative career score',
    icon: '🏆',
    category: 'Mastery',
    progress: 0,
    target: 2500,
    unlocked: false,
    rewardPoints: 350,
  },
  {
    id: 'daily_devotion',
    title: 'Daily Devotion',
    description: 'Successfully complete a Chroma Blitz Daily Challenge',
    icon: '📅',
    category: 'Mastery',
    progress: 0,
    target: 1,
    unlocked: false,
    rewardPoints: 200,
  },
];

export function evaluateAchievements(progression: ColorRushProgression): {
  achievements: AchievementItem[];
  newlyUnlocked: AchievementItem[];
} {
  const completedCount = Object.keys(progression.levelBestScores).length;
  const newlyUnlocked: AchievementItem[] = [];

  const evaluated = COLOR_RUSH_ACHIEVEMENTS.map((ach) => {
    let currentProgress = 0;
    let isUnlocked = progression.unlockedAchievements.includes(ach.id);

    switch (ach.id) {
      case 'first_rush':
        currentProgress = completedCount >= 1 ? 1 : 0;
        break;
      case 'color_apprentice':
        currentProgress = Math.min(ach.target, completedCount);
        break;
      case 'color_master':
        currentProgress = Math.min(ach.target, completedCount);
        break;
      case 'color_grandmaster':
        currentProgress = Math.min(ach.target, completedCount);
        break;
      case 'color_legend':
        currentProgress = Math.min(ach.target, completedCount);
        break;
      case 'color_god':
        currentProgress = Math.min(ach.target, completedCount);
        break;
      case 'perfect_vision':
        currentProgress = progression.perfectLevelsCount >= 1 ? 1 : 0;
        break;
      case 'speed_demon':
        currentProgress = Math.min(ach.target, progression.totalCorrectColors);
        break;
      case 'streak_master':
        currentProgress = Math.min(ach.target, progression.highestStreak);
        break;
      case 'reflex_god': {
        const avg = progression.reactionCount > 0 
          ? progression.totalReactionTimeMs / progression.reactionCount 
          : 9999;
        currentProgress = avg < 450 && progression.reactionCount >= 5 ? 1 : 0;
        break;
      }
      case 'high_scorer':
        currentProgress = Math.min(ach.target, progression.totalCumulativeScore);
        break;
      case 'daily_devotion':
        currentProgress = progression.dailyChallenge?.completed ? 1 : 0;
        break;
    }

    if (!isUnlocked && currentProgress >= ach.target) {
      isUnlocked = true;
      newlyUnlocked.push({
        ...ach,
        progress: currentProgress,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      });
    }

    return {
      ...ach,
      progress: currentProgress,
      unlocked: isUnlocked,
    };
  });

  return {
    achievements: evaluated,
    newlyUnlocked,
  };
}
