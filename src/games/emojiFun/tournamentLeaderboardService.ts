/**
 * Emoji Fun — Tournament Leaderboard & Persistent Stats Service
 */

import { TournamentLeaderboardEntry, PlayerStats } from './types';

const STORAGE_KEY_STATS = 'emojifun_player_stats_v1';
const STORAGE_KEY_LEADERBOARD = 'emojifun_tournament_leaderboard_v1';

const INITIAL_BASE_LEADERBOARD: Omit<TournamentLeaderboardEntry, 'rank'>[] = [
  { id: 'p_1', name: 'Abebe B.', avatarEmoji: '👑', score: 48720, level: 32, bestCombo: 14, accuracy: 96 },
  { id: 'p_2', name: 'Almaz K.', avatarEmoji: '🔥', score: 46350, level: 30, bestCombo: 11, accuracy: 93 },
  { id: 'p_3', name: 'Dawit T.', avatarEmoji: '⚡', score: 44180, level: 29, bestCombo: 12, accuracy: 91 },
  { id: 'p_4', name: 'Selam W.', avatarEmoji: '🌟', score: 41890, level: 27, bestCombo: 10, accuracy: 94 },
  { id: 'p_5', name: 'Yonas M.', avatarEmoji: '🎯', score: 39540, level: 25, bestCombo: 9, accuracy: 89 },
  { id: 'p_6', name: 'Hellen G.', avatarEmoji: '💎', score: 37200, level: 24, bestCombo: 8, accuracy: 92 },
  { id: 'p_7', name: 'Tewodros A.', avatarEmoji: '🦁', score: 35110, level: 23, bestCombo: 9, accuracy: 88 },
  { id: 'p_8', name: 'Meron Z.', avatarEmoji: '🦄', score: 33420, level: 21, bestCombo: 8, accuracy: 90 },
  { id: 'p_9', name: 'Kaleb S.', avatarEmoji: '🚀', score: 31850, level: 20, bestCombo: 7, accuracy: 87 },
  { id: 'p_10', name: 'Rahel E.', avatarEmoji: '🌺', score: 29900, level: 19, bestCombo: 8, accuracy: 91 },
  { id: 'p_11', name: 'Biruk H.', avatarEmoji: '🏆', score: 28450, level: 18, bestCombo: 7, accuracy: 86 },
  { id: 'p_12', name: 'Tigist F.', avatarEmoji: '🍕', score: 26900, level: 17, bestCombo: 6, accuracy: 88 },
  { id: 'p_13', name: 'Natnael D.', avatarEmoji: '🎮', score: 25400, level: 16, bestCombo: 7, accuracy: 85 },
  { id: 'p_14', name: 'Eden V.', avatarEmoji: '🌈', score: 23800, level: 15, bestCombo: 6, accuracy: 89 },
  { id: 'p_15', name: 'Solomon J.', avatarEmoji: '⚽', score: 22100, level: 14, bestCombo: 6, accuracy: 84 },
  { id: 'p_16', name: 'Bethlehem P.', avatarEmoji: '💖', score: 20600, level: 13, bestCombo: 5, accuracy: 87 },
  { id: 'p_17', name: 'Haile G.', avatarEmoji: '🏃', score: 19080, level: 12, bestCombo: 5, accuracy: 83 },
  { id: 'p_18', name: 'Marta B.', avatarEmoji: '🐱', score: 17650, level: 11, bestCombo: 5, accuracy: 85 },
  { id: 'p_19', name: 'Ephrem N.', avatarEmoji: '🎸', score: 16200, level: 10, bestCombo: 4, accuracy: 82 },
  { id: 'p_20', name: 'Hanna L.', avatarEmoji: '✨', score: 14800, level: 9, bestCombo: 4, accuracy: 84 },
  { id: 'p_21', name: 'Robel C.', avatarEmoji: '🕶️', score: 13450, level: 8, bestCombo: 4, accuracy: 81 },
  { id: 'p_22', name: 'Senait R.', avatarEmoji: '🧁', score: 12100, level: 7, bestCombo: 3, accuracy: 83 },
  { id: 'p_23', name: 'Henok Q.', avatarEmoji: '🧩', score: 10800, level: 6, bestCombo: 3, accuracy: 80 },
  { id: 'p_24', name: 'Tsion U.', avatarEmoji: '🍓', score: 9500, level: 5, bestCombo: 3, accuracy: 82 },
  { id: 'p_25', name: 'Girma Y.', avatarEmoji: '🍩', score: 8200, level: 4, bestCombo: 2, accuracy: 78 },
];

export const DEFAULT_PLAYER_STATS: PlayerStats = {
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

export class TournamentLeaderboardService {
  public static loadPlayerStats(): PlayerStats {
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

  public static savePlayerStats(stats: PlayerStats) {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch {
      // Fallback
    }
  }

  public static getLeaderboard(playerName: string = 'You', playerStats?: PlayerStats): {
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

    // Build combined list
    const competitors: Omit<TournamentLeaderboardEntry, 'rank'>[] = [...INITIAL_BASE_LEADERBOARD];

    // Insert current player
    const playerEntry: Omit<TournamentLeaderboardEntry, 'rank'> = {
      id: 'current_user',
      name: `${playerName} (You)`,
      avatarEmoji: '😎',
      score: userScore,
      level: userLevel,
      bestCombo: userBestCombo,
      accuracy: userAccuracy,
      isCurrentUser: true,
    };

    const allEntries = [...competitors, playerEntry].sort((a, b) => b.score - a.score);

    // Assign ranks
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
}

class TournamentLeaderboardManager {
  private stats: PlayerStats;

  constructor() {
    this.stats = TournamentLeaderboardService.loadPlayerStats();
  }

  public getPlayerStats(): PlayerStats {
    return this.stats;
  }

  public saveStats() {
    TournamentLeaderboardService.savePlayerStats(this.stats);
  }

  public recordLevelCompletion(
    level: number,
    levelScore: number,
    accuracy: number,
    bestCombo: number,
    coinsWon: number
  ) {
    this.stats.totalTournamentScore += levelScore;
    this.stats.coins += coinsWon;
    this.stats.highScoreByLevel[level] = Math.max(
      this.stats.highScoreByLevel[level] || 0,
      levelScore
    );
    this.stats.bestCombo = Math.max(this.stats.bestCombo, bestCombo);

    if (level >= this.stats.unlockedLevel && this.stats.unlockedLevel < 40) {
      this.stats.unlockedLevel = level + 1;
    }
    this.stats.currentLevel = Math.min(40, level + 1);

    this.saveStats();
  }

  public useHint(): boolean {
    if (this.stats.availableHints > 0) {
      this.stats.availableHints -= 1;
      this.stats.hintsUsed += 1;
      this.saveStats();
      return true;
    }
    return false;
  }

  public addHints(count: number, costCoins: number) {
    this.stats.availableHints += count;
    this.stats.coins = Math.max(0, this.stats.coins - costCoins);
    this.saveStats();
  }

  public addCoins(delta: number) {
    this.stats.coins = Math.max(0, this.stats.coins + delta);
    this.saveStats();
  }

  public getLeaderboard(): TournamentLeaderboardEntry[] {
    return TournamentLeaderboardService.getLeaderboard('You', this.stats).entries;
  }

  public getLeaderboardPreview() {
    const data = TournamentLeaderboardService.getLeaderboard('You', this.stats);
    return {
      entries: data.entries,
      userRank: data.userRank,
      userScore: data.userScore,
      nextPlayerScore: data.nextPlayerScore,
      pointsToNextRank: data.pointsToNextRank,
    };
  }
}

export const tournamentLeaderboardService = new TournamentLeaderboardManager();

