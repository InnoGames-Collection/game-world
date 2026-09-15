/**
 * Juicy Match - Persistence Storage Manager
 * Handles level progression (1..40 strictly), stars, high scores, boosters, and audio settings
 */

export interface JuicyStats {
  totalMatches: number;
  totalCombos: number;
  highestCombo: number;
  totalCascades: number;
  boostersUsed: number;
  levelsCompleted: number;
  bestScoreEver: number;
}

export interface JuicyAchievementProgress {
  unlocked: boolean;
  progress: number;
  unlockedAt?: number;
}

export interface JuicyMatchSaveData {
  highestUnlockedLevel: number; // 1 to 40
  stars: Record<number, number>; // level (1..40) -> 1..3
  bestScores: Record<number, number>; // level -> score
  coins: number;
  boosters: {
    hammer: number;
    reshuffle: number;
    row_blast: number;
    rainbow_bomb: number;
  };
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  winStreak: number;
  dailyRewardDay: number; // 1 to 7
  lastDailyClaimTimestamp: number;
  stats: JuicyStats;
  achievements: Record<string, JuicyAchievementProgress>;
}

const STORAGE_KEY = 'teleplay_juicy_match_save_v1';

const DEFAULT_SAVE: JuicyMatchSaveData = {
  highestUnlockedLevel: 1, // Only Level 1 is unlocked initially!
  stars: {},
  bestScores: {},
  coins: 430, // Matches initial coins in video
  boosters: {
    hammer: 3,
    reshuffle: 2,
    row_blast: 2,
    rainbow_bomb: 1,
  },
  soundEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,
  winStreak: 0,
  dailyRewardDay: 1,
  lastDailyClaimTimestamp: 0,
  stats: {
    totalMatches: 0,
    totalCombos: 0,
    highestCombo: 0,
    totalCascades: 0,
    boostersUsed: 0,
    levelsCompleted: 0,
    bestScoreEver: 0,
  },
  achievements: {},
};

export class JuicyStorage {
  public static load(): JuicyMatchSaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SAVE };
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SAVE,
        ...parsed,
        boosters: {
          ...DEFAULT_SAVE.boosters,
          ...(parsed.boosters || {}),
        },
        stats: {
          ...DEFAULT_SAVE.stats,
          ...(parsed.stats || {}),
        },
        achievements: {
          ...DEFAULT_SAVE.achievements,
          ...(parsed.achievements || {}),
        },
        // Guarantee Level 1 minimum and 40 maximum
        highestUnlockedLevel: Math.max(1, Math.min(40, parsed.highestUnlockedLevel || 1)),
      };
    } catch {
      return { ...DEFAULT_SAVE };
    }
  }

  public static save(data: JuicyMatchSaveData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage unavailable
    }
  }

  /**
   * Unlock next level upon completing current level (1 to 40 strictly)
   */
  public static completeLevel(level: number, score: number, stars: number): { nextLevelUnlocked: boolean; winStreak: number } {
    const data = this.load();

    // Update stars and high score
    const prevStars = data.stars[level] || 0;
    if (stars > prevStars) {
      data.stars[level] = stars;
    }

    const prevScore = data.bestScores[level] || 0;
    if (score > prevScore) {
      data.bestScores[level] = score;
    }

    // Win streak tracking
    data.winStreak = (data.winStreak || 0) + 1;

    // Coins reward for completing level
    data.coins = (data.coins || 0) + 50 + (stars * 20);

    // Update cumulative stats
    if (!data.stats) {
      data.stats = {
        totalMatches: 0,
        totalCombos: 0,
        highestCombo: 0,
        totalCascades: 0,
        boostersUsed: 0,
        levelsCompleted: 0,
        bestScoreEver: 0,
      };
    }
    const completedCount = Object.keys(data.stars || {}).filter((k) => (data.stars[Number(k)] || 0) > 0).length;
    data.stats.levelsCompleted = completedCount;
    if (score > data.stats.bestScoreEver) {
      data.stats.bestScoreEver = score;
    }

    // Unlock exactly next level (never exceed 40)
    let nextLevelUnlocked = false;
    if (level === data.highestUnlockedLevel && level < 40) {
      data.highestUnlockedLevel = level + 1;
      nextLevelUnlocked = true;
    }

    this.save(data);
    return { nextLevelUnlocked, winStreak: data.winStreak };
  }

  /**
   * Record level failure (resets win streak)
   */
  public static failLevel(level: number) {
    const data = this.load();
    data.winStreak = 0;
    this.save(data);
  }

  /**
   * Claim daily reward (advances day 1 -> 7, then loops)
   */
  public static claimDailyReward(): { day: number; rewardDesc: string; coinsGained: number } {
    const data = this.load();
    const currentDay = data.dailyRewardDay || 1;
    let coinsGained = 100;
    let rewardDesc = '100 Coins';

    if (currentDay === 1) {
      coinsGained = 200;
      rewardDesc = '200 Coins';
    } else if (currentDay === 2) {
      data.boosters.reshuffle += 2;
      coinsGained = 150;
      rewardDesc = '150 Coins + 2 Shuffles';
    } else if (currentDay === 3) {
      data.boosters.hammer += 2;
      coinsGained = 200;
      rewardDesc = '200 Coins + 2 Hammers';
    } else if (currentDay === 4) {
      data.boosters.row_blast += 2;
      coinsGained = 250;
      rewardDesc = '250 Coins + 2 Row Blasts';
    } else if (currentDay === 5) {
      data.boosters.rainbow_bomb += 1;
      coinsGained = 300;
      rewardDesc = '300 Coins + 1 Rainbow Bomb';
    } else if (currentDay === 6) {
      data.boosters.hammer += 3;
      coinsGained = 350;
      rewardDesc = '350 Coins + 3 Hammers';
    } else if (currentDay === 7) {
      data.boosters.rainbow_bomb += 2;
      data.boosters.row_blast += 2;
      coinsGained = 500;
      rewardDesc = '500 Coins + Super Boosters Pack';
    }

    data.coins += coinsGained;
    data.dailyRewardDay = currentDay >= 7 ? 1 : currentDay + 1;
    data.lastDailyClaimTimestamp = Date.now();
    this.save(data);

    return { day: currentDay, rewardDesc, coinsGained };
  }
}
