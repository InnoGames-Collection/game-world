/**
 * EMOJI IQ — Persistent Tournament Leaderboard & Player Stats Service
 * Completely independent from Emoji Fun.
 */

import { TournamentLeaderboardEntry, EmojiIqPlayerStats } from './types';

const STORAGE_KEY_STATS = 'emoji_iq_player_stats_v1';
const STORAGE_KEY_LEADERBOARD = 'emoji_iq_tournament_leaderboard_v1';

const INITIAL_BASE_LEADERBOARD: Omit<TournamentLeaderboardEntry, 'rank'>[] = [
  { id: 'iq_p1', name: 'Dr. Mind B.', avatarEmoji: '🧠', score: 38400, level: 35, bestCombo: 15, accuracy: 98 },
  { id: 'iq_p2', name: 'Abebe Logic', avatarEmoji: '👑', score: 35120, level: 32, bestCombo: 13, accuracy: 95 },
  { id: 'iq_p3', name: 'Selam Math', avatarEmoji: '⚡', score: 33450, level: 30, bestCombo: 12, accuracy: 94 },
  { id: 'iq_p4', name: 'Kaleb Genius', avatarEmoji: '🚀', score: 31200, level: 28, bestCombo: 11, accuracy: 92 },
  { id: 'iq_p5', name: 'Almaz Stars', avatarEmoji: '🌟', score: 29850, level: 26, bestCombo: 10, accuracy: 93 },
  { id: 'iq_p6', name: 'Dawit Prime', avatarEmoji: '🎯', score: 27900, level: 24, bestCombo: 10, accuracy: 90 },
  { id: 'iq_p7', name: 'Meron Clever', avatarEmoji: '🦄', score: 25800, level: 22, bestCombo: 9, accuracy: 91 },
  { id: 'iq_p8', name: 'Tewodros IQ', avatarEmoji: '🦁', score: 23950, level: 21, bestCombo: 8, accuracy: 89 },
  { id: 'iq_p9', name: 'Hellen Nova', avatarEmoji: '💎', score: 22100, level: 19, bestCombo: 8, accuracy: 92 },
  { id: 'iq_p10', name: 'Biruk Vector', avatarEmoji: '🔥', score: 20450, level: 18, bestCombo: 7, accuracy: 88 },
  { id: 'iq_p11', name: 'Tigist Calc', avatarEmoji: '📐', score: 18900, level: 17, bestCombo: 7, accuracy: 90 },
  { id: 'iq_p12', name: 'Natnael Shift', avatarEmoji: '🎮', score: 17400, level: 15, bestCombo: 6, accuracy: 86 },
  { id: 'iq_p13', name: 'Eden Formula', avatarEmoji: '✨', score: 15850, level: 14, bestCombo: 6, accuracy: 89 },
  { id: 'iq_p14', name: 'Solomon Peak', avatarEmoji: '🏆', score: 14200, level: 13, bestCombo: 5, accuracy: 85 },
  { id: 'iq_p15', name: 'Bethlehem Matrix', avatarEmoji: '🌺', score: 12800, level: 11, bestCombo: 5, accuracy: 87 },
  { id: 'iq_p16', name: 'Haile Delta', avatarEmoji: '🏃', score: 11300, level: 10, bestCombo: 5, accuracy: 84 },
  { id: 'iq_p17', name: 'Marta Theta', avatarEmoji: '🐱', score: 9950, level: 9, bestCombo: 4, accuracy: 86 },
  { id: 'iq_p18', name: 'Ephrem Quick', avatarEmoji: '🎸', score: 8650, level: 8, bestCombo: 4, accuracy: 82 },
  { id: 'iq_p19', name: 'Hanna Alpha', avatarEmoji: '💖', score: 7400, level: 7, bestCombo: 4, accuracy: 84 },
  { id: 'iq_p20', name: 'Robel Sum', avatarEmoji: '🍕', score: 6200, level: 6, bestCombo: 3, accuracy: 81 },
  { id: 'iq_p21', name: 'Senait Pure', avatarEmoji: '🧁', score: 5100, level: 5, bestCombo: 3, accuracy: 83 },
  { id: 'iq_p22', name: 'Henok Sharp', avatarEmoji: '🧩', score: 4050, level: 4, bestCombo: 3, accuracy: 80 },
  { id: 'iq_p23', name: 'Tsion Count', avatarEmoji: '🍓', score: 3050, level: 3, bestCombo: 2, accuracy: 82 },
  { id: 'iq_p24', name: 'Girma Step', avatarEmoji: '🍩', score: 2100, level: 2, bestCombo: 2, accuracy: 79 },
  { id: 'iq_p25', name: 'Kidist First', avatarEmoji: '🌱', score: 1150, level: 1, bestCombo: 1, accuracy: 85 },
];

export const DEFAULT_PLAYER_STATS: EmojiIqPlayerStats = {
  totalTournamentScore: 0,
  currentLevel: 1,
  unlockedLevel: 1,
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  perfectCount: 0,
  bestCombo: 0,
  hintsUsed: 0,
  coins: 50,
  availableHints: 3,
  lives: 3,
  starsByLevel: {},
  highScoreByLevel: {},
};

export class EmojiIqLeaderboardService {
  public static loadPlayerStats(): EmojiIqPlayerStats {
    try {
      const data = localStorage.getItem(STORAGE_KEY_STATS);
      if (data) {
        return { ...DEFAULT_PLAYER_STATS, ...JSON.parse(data) };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_PLAYER_STATS };
  }

  public static savePlayerStats(stats: EmojiIqPlayerStats) {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch {
      // Fallback
    }
  }

  public static getLeaderboard(playerName: string = 'You', playerStats?: EmojiIqPlayerStats): {
    entries: TournamentLeaderboardEntry[];
    userRank: number;
    userScore: number;
    nextPlayerScore: number | null;
    pointsToNextRank: number;
  } {
    const stats = playerStats || this.loadPlayerStats();
    const userScore = stats.totalTournamentScore;
    const userLevel = stats.unlockedLevel;
    const userBestCombo = stats.bestCombo;
    const userAccuracy =
      stats.totalQuestionsAnswered > 0
        ? Math.round((stats.totalCorrect / stats.totalQuestionsAnswered) * 100)
        : 100;

    const competitors: Omit<TournamentLeaderboardEntry, 'rank'>[] = [...INITIAL_BASE_LEADERBOARD];

    const playerEntry: Omit<TournamentLeaderboardEntry, 'rank'> = {
      id: 'current_user_iq',
      name: `${playerName} (You)`,
      avatarEmoji: '😎',
      score: userScore,
      level: userLevel,
      bestCombo: userBestCombo,
      accuracy: userAccuracy,
      isCurrentUser: true,
    };

    const allEntries = [...competitors, playerEntry].sort((a, b) => b.score - a.score);

    const ranked: TournamentLeaderboardEntry[] = allEntries.map((e, index) => ({
      ...e,
      rank: index + 1,
    }));

    const userIndex = ranked.findIndex((r) => r.isCurrentUser);
    const userRank = userIndex >= 0 ? userIndex + 1 : ranked.length;

    let nextPlayerScore: number | null = null;
    let pointsToNextRank = 0;

    if (userIndex > 0) {
      nextPlayerScore = ranked[userIndex - 1].score;
      pointsToNextRank = Math.max(10, nextPlayerScore - userScore + 10);
    }

    return {
      entries: ranked,
      userRank,
      userScore,
      nextPlayerScore,
      pointsToNextRank,
    };
  }

  public static recordLevelCompletion(
    level: number,
    levelScore: number,
    accuracy: number,
    levelBestCombo: number,
    rewardCoins: number,
    perfectAnswers: number = 0
  ): EmojiIqPlayerStats {
    const stats = this.loadPlayerStats();

    // 1. Accumulate total tournament score
    stats.totalTournamentScore += levelScore;

    // 2. High score for level
    const prevBest = stats.highScoreByLevel[level] || 0;
    if (levelScore > prevBest) {
      stats.highScoreByLevel[level] = levelScore;
    }

    // 3. Stars calculation based on accuracy
    let stars = 1;
    if (accuracy >= 90) stars = 3;
    else if (accuracy >= 70) stars = 2;

    const prevStars = stats.starsByLevel[level] || 0;
    if (stars > prevStars) {
      stats.starsByLevel[level] = stars;
    }

    // 4. Unlock next level (up to 40)
    if (level >= stats.unlockedLevel && level < 40) {
      stats.unlockedLevel = level + 1;
    }

    // 5. Update best combo
    if (levelBestCombo > stats.bestCombo) {
      stats.bestCombo = levelBestCombo;
    }

    // 6. Reward coins
    stats.coins += rewardCoins;

    // 7. Perfect answers
    stats.perfectCount += perfectAnswers;

    // 8. Restore lives to 3 for next level
    stats.lives = 3;

    this.savePlayerStats(stats);
    return stats;
  }

  public static useHint(): boolean {
    const stats = this.loadPlayerStats();
    if (stats.availableHints <= 0) return false;
    stats.availableHints -= 1;
    stats.hintsUsed += 1;
    this.savePlayerStats(stats);
    return true;
  }

  public static buyHints(count: number, cost: number): boolean {
    const stats = this.loadPlayerStats();
    if (stats.coins < cost) return false;
    stats.coins -= cost;
    stats.availableHints += count;
    this.savePlayerStats(stats);
    return true;
  }

  public static buyLives(count: number, cost: number): boolean {
    const stats = this.loadPlayerStats();
    if (stats.coins < cost) return false;
    stats.coins -= cost;
    stats.lives = Math.min(3, stats.lives + count);
    this.savePlayerStats(stats);
    return true;
  }

  public static restoreLivesForCoins(cost: number = 30): boolean {
    const stats = this.loadPlayerStats();
    if (stats.coins < cost) return false;
    stats.coins -= cost;
    stats.lives = 3;
    this.savePlayerStats(stats);
    return true;
  }
}
