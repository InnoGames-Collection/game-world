/**
 * Candy Juicy - Achievements Engine & Definitions
 * Strict deduplication: Only fires notification on LOCKED -> UNLOCKED transition.
 */

import { JuicyMatchSaveData } from './storage';

export type AchievementCategory = 'MATCHING' | 'COMBOS' | 'SCORE' | 'LEVELS' | 'SPECIAL';

export interface AchievementDef {
  id: string;
  category: AchievementCategory;
  name: string;
  description: string;
  icon: string;
  target: number;
}

export const ALL_ACHIEVEMENTS: AchievementDef[] = [
  // 1. MATCHING
  {
    id: 'first_match',
    category: 'MATCHING',
    name: 'First Taste',
    description: 'Make your first candy match',
    icon: '🍓',
    target: 1,
  },
  {
    id: 'match_50',
    category: 'MATCHING',
    name: 'Candy Matcher',
    description: 'Make 50 candy matches',
    icon: '🫐',
    target: 50,
  },
  {
    id: 'match_150',
    category: 'MATCHING',
    name: 'Match Legend',
    description: 'Make 150 candy matches',
    icon: '🥝',
    target: 150,
  },

  // 2. COMBOS
  {
    id: 'sweet_combo',
    category: 'COMBOS',
    name: 'Sweet Combo',
    description: 'Match 4 or more candies at once',
    icon: '✨',
    target: 1,
  },
  {
    id: 'cascade_x3',
    category: 'COMBOS',
    name: 'Juice Cascade',
    description: 'Trigger a 3-step automatic cascade',
    icon: '🌊',
    target: 1,
  },
  {
    id: 'combo_10',
    category: 'COMBOS',
    name: 'Combo Master',
    description: 'Trigger 10 combos in total',
    icon: '🔥',
    target: 10,
  },

  // 3. SCORE
  {
    id: 'score_1000',
    category: 'SCORE',
    name: 'Sugar Rush',
    description: 'Score 1,000 points in a single level',
    icon: '⭐',
    target: 1000,
  },
  {
    id: 'score_5000',
    category: 'SCORE',
    name: 'Candy Tycoon',
    description: 'Score 5,000 points in a single level',
    icon: '👑',
    target: 5000,
  },
  {
    id: 'high_score',
    category: 'SCORE',
    name: 'Record Breaker',
    description: 'Beat your personal level high score',
    icon: '🏆',
    target: 1,
  },

  // 4. LEVELS
  {
    id: 'level_1',
    category: 'LEVELS',
    name: 'Island Explorer',
    description: 'Complete Level 1',
    icon: '🌴',
    target: 1,
  },
  {
    id: 'level_5',
    category: 'LEVELS',
    name: 'Tropics Adventurer',
    description: 'Complete 5 levels',
    icon: '🗺️',
    target: 5,
  },
  {
    id: 'level_10',
    category: 'LEVELS',
    name: 'Jungle Master',
    description: 'Complete 10 levels',
    icon: '🧭',
    target: 10,
  },
  {
    id: 'stars_15',
    category: 'LEVELS',
    name: 'Star Collector',
    description: 'Earn 15 Stars across all levels',
    icon: '🌟',
    target: 15,
  },

  // 5. SPECIAL
  {
    id: 'booster_used',
    category: 'SPECIAL',
    name: 'Booster Power',
    description: 'Use any booster tool during play',
    icon: '🔨',
    target: 1,
  },
  {
    id: 'rainbow_blast',
    category: 'SPECIAL',
    name: 'Rainbow Magic',
    description: 'Activate a Rainbow Bomb',
    icon: '🌈',
    target: 1,
  },
];

export interface CheckEventPayload {
  matchCount?: number;
  matchLength?: number;
  cascadeIndex?: number;
  currentLevelScore?: number;
  isNewHighScore?: boolean;
  levelCompleted?: number;
  totalStars?: number;
  boosterUsed?: string;
  specialActivated?: string;
}

/**
 * Check achievements against current save data and an event payload.
 * Returns updated save data and an array of BRAND NEW unlocks (strictly deduplicated).
 */
export function checkAchievements(
  save: JuicyMatchSaveData,
  event: CheckEventPayload
): { updatedSave: JuicyMatchSaveData; newUnlocks: AchievementDef[] } {
  const updated = { ...save };
  if (!updated.achievements) updated.achievements = {};
  if (!updated.stats) {
    updated.stats = {
      totalMatches: 0,
      totalCombos: 0,
      highestCombo: 0,
      totalCascades: 0,
      boostersUsed: 0,
      levelsCompleted: 0,
      bestScoreEver: 0,
    };
  }

  // Update cumulative stats from event
  if (event.matchCount) {
    updated.stats.totalMatches = (updated.stats.totalMatches || 0) + event.matchCount;
  }
  if (event.cascadeIndex && event.cascadeIndex > 1) {
    updated.stats.totalCascades = (updated.stats.totalCascades || 0) + 1;
    if (event.cascadeIndex > (updated.stats.highestCombo || 0)) {
      updated.stats.highestCombo = event.cascadeIndex;
    }
  }
  if (event.matchLength && event.matchLength >= 4) {
    updated.stats.totalCombos = (updated.stats.totalCombos || 0) + 1;
  }
  if (event.boosterUsed) {
    updated.stats.boostersUsed = (updated.stats.boostersUsed || 0) + 1;
  }
  if (event.currentLevelScore && event.currentLevelScore > (updated.stats.bestScoreEver || 0)) {
    updated.stats.bestScoreEver = event.currentLevelScore;
  }

  const completedLevelCount = Object.keys(updated.stars || {}).filter((k) => (updated.stars[Number(k)] || 0) > 0).length;
  updated.stats.levelsCompleted = completedLevelCount;

  const totalStarsCount = (Object.values(updated.stars || {}) as number[]).reduce((a, b) => a + (b || 0), 0);

  const newUnlocks: AchievementDef[] = [];

  for (const def of ALL_ACHIEVEMENTS) {
    const existing = updated.achievements[def.id];
    // If already unlocked, NEVER notify again (strict deduplication)
    if (existing?.unlocked) continue;

    let currentProgress = existing?.progress || 0;

    switch (def.id) {
      case 'first_match':
        if (updated.stats.totalMatches >= 1) currentProgress = 1;
        break;
      case 'match_50':
        currentProgress = Math.min(def.target, updated.stats.totalMatches);
        break;
      case 'match_150':
        currentProgress = Math.min(def.target, updated.stats.totalMatches);
        break;
      case 'sweet_combo':
        if (event.matchLength && event.matchLength >= 4) currentProgress = 1;
        break;
      case 'cascade_x3':
        if (event.cascadeIndex && event.cascadeIndex >= 3) currentProgress = 1;
        break;
      case 'combo_10':
        currentProgress = Math.min(def.target, updated.stats.totalCombos);
        break;
      case 'score_1000':
        if (event.currentLevelScore) {
          currentProgress = Math.min(def.target, Math.max(currentProgress, event.currentLevelScore));
        }
        break;
      case 'score_5000':
        if (event.currentLevelScore) {
          currentProgress = Math.min(def.target, Math.max(currentProgress, event.currentLevelScore));
        }
        break;
      case 'high_score':
        if (event.isNewHighScore) currentProgress = 1;
        break;
      case 'level_1':
        if ((updated.stars[1] || 0) > 0) currentProgress = 1;
        break;
      case 'level_5':
        currentProgress = Math.min(def.target, completedLevelCount);
        break;
      case 'level_10':
        currentProgress = Math.min(def.target, completedLevelCount);
        break;
      case 'stars_15':
        currentProgress = Math.min(def.target, totalStarsCount);
        break;
      case 'booster_used':
        if (event.boosterUsed || updated.stats.boostersUsed > 0) currentProgress = 1;
        break;
      case 'rainbow_blast':
        if (event.specialActivated === 'rainbow' || event.boosterUsed === 'rainbow_bomb') {
          currentProgress = 1;
        }
        break;
    }

    const isUnlockedNow = currentProgress >= def.target;
    updated.achievements[def.id] = {
      unlocked: isUnlockedNow,
      progress: currentProgress,
      unlockedAt: isUnlockedNow ? Date.now() : existing?.unlockedAt,
    };

    if (isUnlockedNow) {
      newUnlocks.push(def);
    }
  }

  return { updatedSave: updated, newUnlocks };
}
