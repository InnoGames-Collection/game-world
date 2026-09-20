/**
 * GameON Tele - Official Weekly Tournament Service
 * 
 * Central Tournament Logic & Configuration Engine:
 * - Weekly tournament cycle with live countdown timer
 * - Admin-configurable game selection (default: crazy-colors, fruit-slice, helix-jump, pop-piano)
 * - Individual game score retention (no score normalization or modification)
 * - Overall Tournament Best Score = MAX(score across active tournament games)
 * - Deterministic tie handling (Score -> Achievement Timestamp)
 * - Top 10 leaderboard with masked MSISDNs, Ethiopian names, Best Score, and originating game
 * - Separation between Game Scores, Tournament Rankings, and Prize distribution
 */

import { UserProfile } from '../types/index';
import { GameCatalog, CatalogGame } from './gameCatalog';
import { GameLeaderboardService } from './gameLeaderboardService';

export interface TournamentPrize {
  rank: number;
  rankLabel: string;
  rewardText: string;
  etbAmount?: number;
  coinsAmount?: number;
}

export interface WeeklyTournamentConfig {
  id: string;
  title: string;
  subtitle: string;
  frequency: 'weekly';
  sponsor: string;
  /** Admin-configurable selected games (Default: crazy-colors, fruit-slice, helix-jump, pop-piano) */
  selectedGameIds: string[];
  startDate: string;
  endDate: string;
  prizes: TournamentPrize[];
}

export interface OverallTournamentEntry {
  rank: number;
  playerId: string;
  playerName: string;
  playerMasked: string;
  bestScore: number;
  bestGameId: string;
  bestGameTitle: string;
  achievementTimestamp: number;
  rewardText?: string;
  isCurrentUser?: boolean;
  gameScores: Record<string, number>;
}

export interface TournamentSummaryData {
  config: WeeklyTournamentConfig;
  participatingGames: CatalogGame[];
  topEntries: OverallTournamentEntry[];
  currentUserBestScore: number;
  currentUserBestGame: CatalogGame | null;
  currentUserRank: number;
  currentUserScores: Record<string, number>;
  totalParticipants: number;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    formatted: string;
  };
}

// Default Weekly Tournament Configuration (Admin-configurable)
export const DEFAULT_WEEKLY_TOURNAMENT: WeeklyTournamentConfig = {
  id: 'weekly_championship_cup',
  title: 'GoPlay Weekly Championship',
  subtitle: '4 Featured Games • Best Score Tournament',
  frequency: 'weekly',
  sponsor: 'telebirr & EthioTelecom',
  selectedGameIds: ['crazy-colors', 'fruit-slice', 'helix-jump', 'pop-piano'],
  startDate: 'Monday, 00:00 EAT',
  endDate: 'Sunday, 23:59 EAT',
  prizes: [
    { rank: 1, rankLabel: '1st Place', rewardText: '5,000 ETB Cash + 2,000 Coins', etbAmount: 5000, coinsAmount: 2000 },
    { rank: 2, rankLabel: '2nd Place', rewardText: '3,000 ETB Cash + 1,000 Coins', etbAmount: 3000, coinsAmount: 1000 },
    { rank: 3, rankLabel: '3rd Place', rewardText: '1,500 ETB Cash + 500 Coins', etbAmount: 1500, coinsAmount: 500 },
    { rank: 4, rankLabel: '4th - 10th Place', rewardText: '300 ETB Airtime + 250 Coins', etbAmount: 300, coinsAmount: 250 },
  ],
};

// Realistic Seed Competitors with authentic Ethiopian profiles & multi-game performance
interface SeedCompetitor {
  id: string;
  name: string;
  phone: string;
  // Deterministic scores for each game
  scores: Record<string, number>;
  timestampOffsetHours: number; // For tie breaking
}

const SEED_COMPETITORS: SeedCompetitor[] = [
  {
    id: 'seed_1',
    name: 'Solomon T.',
    phone: '0911234567',
    scores: { 'fruit-slice': 1280, 'pop-piano': 920, 'crazy-colors': 850, 'helix-jump': 640 },
    timestampOffsetHours: 42,
  },
  {
    id: 'seed_2',
    name: 'Selamawit G.',
    phone: '0922889900',
    scores: { 'crazy-colors': 1210, 'fruit-slice': 950, 'pop-piano': 880, 'helix-jump': 710 },
    timestampOffsetHours: 36,
  },
  {
    id: 'seed_3',
    name: 'Dawit M.',
    phone: '0915667788',
    scores: { 'pop-piano': 1140, 'fruit-slice': 890, 'crazy-colors': 780, 'helix-jump': 600 },
    timestampOffsetHours: 28,
  },
  {
    id: 'seed_4',
    name: 'Bethlehem K.',
    phone: '0933112233',
    scores: { 'helix-jump': 1080, 'pop-piano': 950, 'fruit-slice': 910, 'crazy-colors': 820 },
    timestampOffsetHours: 24,
  },
  {
    id: 'seed_5',
    name: 'Yared A.',
    phone: '0918990011',
    scores: { 'fruit-slice': 1020, 'pop-piano': 740, 'crazy-colors': 690, 'helix-jump': 580 },
    timestampOffsetHours: 20,
  },
  {
    id: 'seed_6',
    name: 'Hiwot T.',
    phone: '0920445566',
    scores: { 'crazy-colors': 980, 'pop-piano': 810, 'fruit-slice': 720, 'helix-jump': 650 },
    timestampOffsetHours: 18,
  },
  {
    id: 'seed_7',
    name: 'Kibrom Z.',
    phone: '0912778899',
    scores: { 'pop-piano': 950, 'fruit-slice': 840, 'crazy-colors': 760, 'helix-jump': 590 },
    timestampOffsetHours: 15,
  },
  {
    id: 'seed_8',
    name: 'Tsion W.',
    phone: '0944332211',
    scores: { 'fruit-slice': 910, 'pop-piano': 830, 'crazy-colors': 640, 'helix-jump': 510 },
    timestampOffsetHours: 12,
  },
  {
    id: 'seed_9',
    name: 'Ephrem B.',
    phone: '0910556677',
    scores: { 'helix-jump': 880, 'fruit-slice': 790, 'crazy-colors': 700, 'pop-piano': 660 },
    timestampOffsetHours: 9,
  },
  {
    id: 'seed_10',
    name: 'Rahel D.',
    phone: '0927889922',
    scores: { 'crazy-colors': 850, 'fruit-slice': 680, 'pop-piano': 720, 'helix-jump': 530 },
    timestampOffsetHours: 6,
  },
  {
    id: 'seed_11',
    name: 'Abel M.',
    phone: '0931445566',
    scores: { 'fruit-slice': 820, 'crazy-colors': 610, 'helix-jump': 490, 'pop-piano': 640 },
    timestampOffsetHours: 4,
  },
  {
    id: 'seed_12',
    name: 'Marta T.',
    phone: '0919223344',
    scores: { 'pop-piano': 790, 'crazy-colors': 580, 'fruit-slice': 620, 'helix-jump': 440 },
    timestampOffsetHours: 2,
  },
];

const maskPhoneNumber = (phone?: string): string => {
  const digits = (phone || '0911428890').replace(/\D/g, '');
  if (digits.length >= 9) {
    const start = digits.slice(0, 3);
    const end = digits.slice(-3);
    return `${start}*****${end}`;
  }
  return '091*****890';
};

export const TournamentService = {
  /**
   * Retrieves active tournament configuration.
   * Allows admin customization via localStorage override if set.
   */
  getActiveConfig(): WeeklyTournamentConfig {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('gameon_tournament_config');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.selectedGameIds) && parsed.selectedGameIds.length > 0) {
            return { ...DEFAULT_WEEKLY_TOURNAMENT, ...parsed };
          }
        }
      } catch {}
    }
    return DEFAULT_WEEKLY_TOURNAMENT;
  },

  /**
   * Admin configuration setter for tournament games.
   */
  setActiveTournamentGames(gameIds: string[]): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getActiveConfig();
      const updated: WeeklyTournamentConfig = {
        ...current,
        selectedGameIds: gameIds,
      };
      localStorage.setItem('gameon_tournament_config', JSON.stringify(updated));
    } catch {}
  },

  /**
   * Returns list of currently active tournament game IDs (default 4 games).
   */
  getActiveTournamentGameIds(): string[] {
    return this.getActiveConfig().selectedGameIds;
  },

  /**
   * Returns CatalogGame definitions for the active tournament games.
   */
  getActiveTournamentGames(): CatalogGame[] {
    const ids = this.getActiveTournamentGameIds();
    return ids
      .map((id) => GameCatalog.getById(id))
      .filter((g): g is CatalogGame => Boolean(g));
  },

  /**
   * Computes time remaining in the current weekly cycle (ends Sunday 23:59:59 EAT)
   */
  getTimeRemaining(): { days: number; hours: number; minutes: number; seconds: number; formatted: string } {
    const now = new Date();
    const currentDay = now.getUTCDay(); // 0 is Sunday
    // Calculate days until next Sunday 23:59:59
    const daysUntilSunday = (7 - currentDay) % 7;
    const endOfWeek = new Date(now);
    endOfWeek.setUTCDate(now.getUTCDate() + daysUntilSunday);
    endOfWeek.setUTCHours(23, 59, 59, 999);

    const diffMs = Math.max(0, endOfWeek.getTime() - now.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);

    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formatted = `${days}d ${hours}h ${minutes}m left`;

    return { days, hours, minutes, seconds, formatted };
  },

  /**
   * Extracts user's score in a specific tournament game.
   */
  getUserScoreForGame(gameId: string, profile?: UserProfile): number {
    const stats = GameLeaderboardService.getUserStats(gameId, profile);
    const profileScore = profile?.highScores?.[gameId] || 0;
    return Math.max(stats.bestScore, profileScore);
  },

  /**
   * Retrieves full tournament summary, ranking table, and current user standing.
   */
  getTournamentSummary(profile?: UserProfile): TournamentSummaryData {
    const config = this.getActiveConfig();
    const participatingGames = this.getActiveTournamentGames();
    const gameMap = new Map<string, CatalogGame>(participatingGames.map((g) => [g.gameId, g]));

    // 1. Gather Current User Scores across the participating tournament games
    const currentUserScores: Record<string, number> = {};
    let currentUserBestScore = 0;
    let currentUserBestGameId = '';

    participatingGames.forEach((game) => {
      const score = this.getUserScoreForGame(game.gameId, profile);
      currentUserScores[game.gameId] = score;
      if (score > currentUserBestScore) {
        currentUserBestScore = score;
        currentUserBestGameId = game.gameId;
      }
    });

    const currentUserBestGame: CatalogGame | null = currentUserBestGameId
      ? gameMap.get(currentUserBestGameId) || null
      : null;

    // 2. Build entries for seed competitors
    const baseTimestamp = Date.now();
    const entries: OverallTournamentEntry[] = SEED_COMPETITORS.map((seed) => {
      // Find seed's best score across active tournament games
      let bestScore = 0;
      let bestGameId = participatingGames[0]?.gameId || '';

      participatingGames.forEach((g) => {
        const score = seed.scores[g.gameId] || 0;
        if (score > bestScore) {
          bestScore = score;
          bestGameId = g.gameId;
        }
      });

      const bestGame = gameMap.get(bestGameId);
      const achievementTimestamp = baseTimestamp - (seed.timestampOffsetHours * 3600 * 1000);

      return {
        rank: 0,
        playerId: seed.id,
        playerName: seed.name,
        playerMasked: maskPhoneNumber(seed.phone),
        bestScore,
        bestGameId,
        bestGameTitle: bestGame?.gameName || 'Game',
        achievementTimestamp,
        isCurrentUser: false,
        gameScores: { ...seed.scores },
      };
    });

    // 3. User's entry if they have played any tournament game
    let currentUserRank = 84;
    const userEntry: OverallTournamentEntry | null = currentUserBestScore > 0 ? {
      rank: 0,
      playerId: profile?.id || 'current_user',
      playerName: profile?.displayName || 'You',
      playerMasked: maskPhoneNumber(profile?.phoneNumber),
      bestScore: currentUserBestScore,
      bestGameId: currentUserBestGameId,
      bestGameTitle: currentUserBestGame?.gameName || 'Featured Game',
      achievementTimestamp: Date.now() - 180000, // Recent
      isCurrentUser: true,
      gameScores: { ...currentUserScores },
    } : null;

    // 4. Combine and Sort using deterministic tie-break:
    // Rule: Higher bestScore first; if equal, earlier achievement timestamp
    const allCandidates = [...entries];
    if (userEntry) {
      allCandidates.push(userEntry);
    }

    allCandidates.sort((a, b) => {
      if (b.bestScore !== a.bestScore) {
        return b.bestScore - a.bestScore;
      }
      return a.achievementTimestamp - b.achievementTimestamp;
    });

    // Assign 1-indexed ranks
    allCandidates.forEach((item, index) => {
      item.rank = index + 1;
      if (item.isCurrentUser) {
        currentUserRank = item.rank;
      }

      // Assign prize label according to rank
      if (item.rank === 1) item.rewardText = '5,000 ETB + 2,000 Coins';
      else if (item.rank === 2) item.rewardText = '3,000 ETB + 1,000 Coins';
      else if (item.rank === 3) item.rewardText = '1,500 ETB + 500 Coins';
      else if (item.rank <= 10) item.rewardText = '300 ETB + 250 Coins';
    });

    const topEntries = allCandidates.slice(0, 10);

    return {
      config,
      participatingGames,
      topEntries,
      currentUserBestScore,
      currentUserBestGame,
      currentUserRank: currentUserBestScore > 0 ? currentUserRank : 84,
      currentUserScores,
      totalParticipants: 3420 + (participatingGames.length * 280),
      timeRemaining: this.getTimeRemaining(),
    };
  },
};
