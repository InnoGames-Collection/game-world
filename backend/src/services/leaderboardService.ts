import { query } from '../config/database.js';
import { cache } from '../config/cache.js';
import { LeaderboardEntry } from '../types/domain.js';

export const WEEKLY_GAME_IDS = ['candy-blast', 'color-rush', 'world-legends'];
export const MONTHLY_GAME_IDS = ['pop-piano', 'hill-rider', 'archery-strike'];

const PERIOD_REWARDS: Record<string, (rank: number) => string> = {
  weekly: (r) => {
    const rewards: Record<number, string> = {
      1: '50K ETB',
      2: '40K ETB',
      3: '35K ETB',
      4: '30K ETB',
      5: '25K ETB',
      6: '20K ETB',
      7: '15K ETB',
      8: '10K ETB',
      9: '5K ETB',
      10: '3K ETB',
    };
    return rewards[r] || '1K ETB';
  },
  monthly: (r) => {
    const rewards: Record<number, string> = {
      1: '50K ETB',
      2: '40K ETB',
      3: '35K ETB',
      4: '30K ETB',
      5: '25K ETB',
      6: '20K ETB',
      7: '15K ETB',
      8: '10K ETB',
      9: '5K ETB',
      10: '3K ETB',
    };
    return rewards[r] || '1K ETB';
  },
};

export const leaderboardService = {
  /**
   * Get Weekly Leaderboard (Calculated across last 7 calendar days daily bests / 7)
   */
  async getWeeklyLeaderboard(userId?: string): Promise<{
    entries: LeaderboardEntry[];
    userRank: number | null;
    userTotalPoints: number;
    totalContenders: number;
  }> {
    const cacheKey = 'lb:weekly:top10';
    const cached = await cache.get(cacheKey);

    let entries: LeaderboardEntry[] = [];
    if (cached) {
      entries = JSON.parse(cached);
    } else {
      const rows = await query(`SELECT * FROM compute_weekly_leaderboard($1) LIMIT 10`, [WEEKLY_GAME_IDS]);

      entries = rows.rows.map((row: any, idx: number) => {
        const rank = idx + 1;
        return {
          id: `lb_weekly_${rank}`,
          rank,
          userId: row.user_id,
          displayName: row.display_name || 'Player',
          phoneNumberMasked: row.phone_masked,
          avatarId: row.avatar_id || 'avatar_runner',
          score: parseFloat(row.avg_score) || 0,
          gameId: 'weekly-tourney',
          gameTitle: 'Weekly Tournament',
          reward: PERIOD_REWARDS.weekly(rank),
          isVip: true,
          region: 'EthioTelecom Network',
          timestamp: 'Verified',
        };
      });

      await cache.set(cacheKey, JSON.stringify(entries), 60); // 60s cache
    }

    let userRank: number | null = null;
    let userTotalPoints = 0;

    if (userId) {
      // Find if user is in top 10
      const match = entries.find((e) => e.userId === userId);
      if (match) {
        userRank = match.rank;
        userTotalPoints = match.score;
        match.displayName = 'YOU';
      } else {
        // Calculate user score specifically
        const userRow = await query(
          `SELECT ROUND(COALESCE(SUM(best_score), 0)::NUMERIC / 7, 1) as avg_score
             FROM daily_scores
            WHERE user_id = $1 AND game_id = ANY($2) AND score_date >= CURRENT_DATE - INTERVAL '7 days'`,
          [userId, WEEKLY_GAME_IDS]
        );
        userTotalPoints = parseFloat(userRow.rows[0]?.avg_score) || 0;
        if (userTotalPoints > 0) {
          const rankRes = await query(
            `SELECT COUNT(*) + 1 as rank FROM (
               SELECT user_id, SUM(best_score) / 7 as avg_score
                 FROM daily_scores
                WHERE game_id = ANY($1) AND score_date >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY user_id
               HAVING (SUM(best_score) / 7) > $2
             ) t`,
            [WEEKLY_GAME_IDS, userTotalPoints]
          );
          userRank = parseInt(rankRes.rows[0]?.rank, 10) || 15;
        }
      }
    }

    return {
      entries,
      userRank,
      userTotalPoints,
      totalContenders: 14890,
    };
  },

  /**
   * Get Monthly Leaderboard (Calculated across last 30 calendar days daily bests / 30)
   */
  async getMonthlyLeaderboard(userId?: string): Promise<{
    entries: LeaderboardEntry[];
    userRank: number | null;
    userTotalPoints: number;
    totalContenders: number;
  }> {
    const cacheKey = 'lb:monthly:top10';
    const cached = await cache.get(cacheKey);

    let entries: LeaderboardEntry[] = [];
    if (cached) {
      entries = JSON.parse(cached);
    } else {
      const rows = await query(`SELECT * FROM compute_monthly_leaderboard($1) LIMIT 10`, [MONTHLY_GAME_IDS]);

      entries = rows.rows.map((row: any, idx: number) => {
        const rank = idx + 1;
        return {
          id: `lb_monthly_${rank}`,
          rank,
          userId: row.user_id,
          displayName: row.display_name || 'Player',
          phoneNumberMasked: row.phone_masked,
          avatarId: row.avatar_id || 'avatar_runner',
          score: parseFloat(row.avg_score) || 0,
          gameId: 'monthly-championship',
          gameTitle: 'Monthly Championship',
          reward: PERIOD_REWARDS.monthly(rank),
          isVip: true,
          region: 'EthioTelecom Network',
          timestamp: 'Verified',
        };
      });

      await cache.set(cacheKey, JSON.stringify(entries), 120); // 120s cache
    }

    let userRank: number | null = null;
    let userTotalPoints = 0;

    if (userId) {
      const match = entries.find((e) => e.userId === userId);
      if (match) {
        userRank = match.rank;
        userTotalPoints = match.score;
        match.displayName = 'YOU';
      } else {
        const userRow = await query(
          `SELECT ROUND(COALESCE(SUM(best_score), 0)::NUMERIC / 30, 1) as avg_score
             FROM daily_scores
            WHERE user_id = $1 AND game_id = ANY($2) AND score_date >= CURRENT_DATE - INTERVAL '30 days'`,
          [userId, MONTHLY_GAME_IDS]
        );
        userTotalPoints = parseFloat(userRow.rows[0]?.avg_score) || 0;
        if (userTotalPoints > 0) {
          const rankRes = await query(
            `SELECT COUNT(*) + 1 as rank FROM (
               SELECT user_id, SUM(best_score) / 30 as avg_score
                 FROM daily_scores
                WHERE game_id = ANY($1) AND score_date >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY user_id
               HAVING (SUM(best_score) / 30) > $2
             ) t`,
            [MONTHLY_GAME_IDS, userTotalPoints]
          );
          userRank = parseInt(rankRes.rows[0]?.rank, 10) || 28;
        }
      }
    }

    return {
      entries,
      userRank,
      userTotalPoints,
      totalContenders: 28900,
    };
  },

  /**
   * Get single game all-time top 10
   */
  async getGameLeaderboard(gameId: string): Promise<LeaderboardEntry[]> {
    const res = await query(
      `SELECT hs.best_score, hs.updated_at, p.id AS user_id, p.display_name, p.avatar_id,
              '0' || SUBSTRING(p.phone FROM 5 FOR 3) || '*****' || RIGHT(p.phone, 3) AS phone_masked
         FROM high_scores hs
         JOIN profiles p ON p.id = hs.user_id
        WHERE hs.game_id = $1
        ORDER BY hs.best_score DESC, hs.updated_at ASC
        LIMIT 10`,
      [gameId]
    );

    return res.rows.map((r: any, idx: number) => ({
      id: `lb_${gameId}_${idx + 1}`,
      rank: idx + 1,
      userId: r.user_id,
      displayName: r.display_name,
      phoneNumberMasked: r.phone_masked,
      avatarId: r.avatar_id,
      score: r.best_score,
      gameId,
      gameTitle: gameId,
      isVip: true,
      region: 'EthioTelecom Network',
      timestamp: new Date(r.updated_at).toLocaleDateString(),
    }));
  },
};
