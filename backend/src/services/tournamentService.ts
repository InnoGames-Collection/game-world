import { query } from '../config/database.js';
import { Tournament, RewardTransaction } from '../types/domain.js';
import { generateIdempotencyKey } from '../utils/crypto.js';
import pino from 'pino';

const logger = pino({ name: 'TournamentService' });

export const TOURNAMENT_FEE_COINS = 2; // 2 coins per play (10 ETB pack = 10 coins = 5 plays)

export const tournamentService = {
  /**
   * Get all live and upcoming tournaments with user state
   */
  async getTournaments(userId?: string): Promise<Tournament[]> {
    const tourneysRes = await query(
      `SELECT * FROM tournaments
        WHERE state IN ('live', 'upcoming', 'settling')
        ORDER BY starts_at ASC`
    );

    const tournaments: Tournament[] = [];

    for (const row of tourneysRes.rows) {
      let hasSubmitted = false;
      let playerScore: number | undefined;
      let playerRank: number | undefined;

      if (userId) {
        const scoreRes = await query(
          `SELECT best, rp FROM scores WHERE tournament_id = $1 AND user_id = $2`,
          [row.id, userId]
        );
        if (scoreRes.rowCount && scoreRes.rowCount > 0) {
          hasSubmitted = true;
          playerScore = parseInt(scoreRes.rows[0].best, 10);

          // Get rank
          const rankRes = await query(
            `SELECT COUNT(*) + 1 AS rank FROM scores
              WHERE tournament_id = $1 AND (rp > $2 OR (rp = $2 AND best > $3))`,
            [row.id, scoreRes.rows[0].rp, playerScore]
          );
          playerRank = parseInt(rankRes.rows[0].rank, 10);
        }
      }

      tournaments.push({
        id: row.id,
        title: row.title,
        gameId: row.game_id,
        gameTitle: row.title,
        cycle: row.cycle,
        bannerImage: row.banner_image || '',
        prizePoolETB: parseFloat(row.prize_pool_etb) || 0,
        prizePoolCoins: parseInt(row.prize_pool_coins, 10) || 0,
        entryFeeEnergy: 0,
        entryRequirement: '2 Coins Per Play (10 ETB Pack = 5 Plays)',
        startDate: new Date(row.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        endDate: new Date(row.ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: row.state === 'live' ? 'Live' : row.state === 'upcoming' ? 'Upcoming' : 'Ended',
        participantsCount: row.participants_count || 0,
        sponsor: row.sponsor || 'telebirr SuperApp',
        playerRank,
        playerScore,
        hasSubmitted,
        prizes: row.prize_tiers || [],
      });
    }

    return tournaments;
  },

  /**
   * Enter a tournament and reserve attempt (2 coins per tournament play)
   */
  async enterTournament(
    userId: string,
    tournamentId: string
  ): Promise<{ success: boolean; message: string; attemptsLeft: number }> {
    const tRes = await query('SELECT * FROM tournaments WHERE id = $1', [tournamentId]);
    if (tRes.rowCount === 0) {
      return { success: false, message: 'Tournament not found', attemptsLeft: 0 };
    }
    const tournament = tRes.rows[0];

    if (tournament.state !== 'live') {
      return { success: false, message: `Tournament is currently ${tournament.state}. Entry closed.`, attemptsLeft: 0 };
    }

    // Check user coin balance (2 coins required per tournament play)
    const pRes = await query(`SELECT coins FROM profiles WHERE id = $1`, [userId]);
    const coins = parseInt(pRes.rows[0]?.coins || '0', 10);

    if (coins < TOURNAMENT_FEE_COINS) {
      return {
        success: false,
        message: `Insufficient coins (${coins}/${TOURNAMENT_FEE_COINS} coins). Purchase 10 coins for 10 ETB via telebirr to play 5 matches!`,
        attemptsLeft: 0,
      };
    }

    // Deduct 2 coins atomically
    await query('SELECT apply_coins($1, $2, $3, $4)', [
      userId,
      -TOURNAMENT_FEE_COINS,
      'Tournament Entry',
      tournamentId,
    ]);

    const entryRes = await query(
      `INSERT INTO tournament_entries (user_id, tournament_id, attempts_left)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, tournament_id) DO UPDATE
         SET attempts_left = tournament_entries.attempts_left + 1
       RETURNING attempts_left`,
      [userId, tournamentId]
    );

    await query(`UPDATE tournaments SET participants_count = participants_count + 1 WHERE id = $1`, [tournamentId]);

    logger.info({ userId, tournamentId }, 'Tournament entered, 2 coins deducted');

    return {
      success: true,
      message: `Entered ${tournament.title}! 2 coins deducted. Play started.`,
      attemptsLeft: entryRes.rows[0].attempts_left,
    };
  },

  /**
   * Submit tournament score with duplicate prevention & idempotency
   */
  async submitScore(
    userId: string,
    tournamentId: string,
    score: number
  ): Promise<{ success: boolean; message: string; transaction?: RewardTransaction }> {
    const tRes = await query('SELECT * FROM tournaments WHERE id = $1', [tournamentId]);
    if (tRes.rowCount === 0) {
      return { success: false, message: 'Tournament not found' };
    }
    const tournament = tRes.rows[0];

    const currentScoreRes = await query(
      `SELECT best, rp FROM scores WHERE tournament_id = $1 AND user_id = $2`,
      [tournamentId, userId]
    );

    const currentBest = currentScoreRes.rows[0]?.best || 0;
    if (currentBest >= score) {
      return {
        success: true,
        message: `Previous best score (${currentBest}) retained.`,
      };
    }

    // Normalized Ranking Points
    const rp = score;

    await query(
      `INSERT INTO scores (user_id, tournament_id, best, plays, rp, updated_at)
       VALUES ($1, $2, $3, 1, $4, NOW())
       ON CONFLICT (user_id, tournament_id) DO UPDATE
         SET best = GREATEST(scores.best, EXCLUDED.best),
             plays = scores.plays + 1,
             rp = GREATEST(scores.rp, EXCLUDED.rp),
             updated_at = NOW()`,
      [userId, tournamentId, score, rp]
    );

    // If top-tier score (>= 350/400), create/update a reward transaction draft
    let transaction: RewardTransaction | undefined;
    if (score >= 350) {
      const pRes = await query('SELECT phone FROM profiles WHERE id = $1', [userId]);
      const phone = pRes.rows[0]?.phone || '+251911000000';
      const msisdnMasked = `0${phone.slice(4, 7)}*****${phone.slice(-3)}`;

      const idempotencyKey = generateIdempotencyKey(['idemp', userId, tournamentId, score]);
      const auditHash = `0x${Buffer.from(idempotencyKey).toString('hex').slice(0, 8).toUpperCase()}`;

      const txId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      const rewardRow = await query(
        `INSERT INTO reward_transactions (
           id, idempotency_key, user_id, msisdn_masked, game_id, game_title,
           tournament_id, score, rank, reward, reward_etb, reward_coins,
           status, verification_source, audit_hash
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'CONFIRMED', 'SERVER_AUTHORITATIVE', $13)
         ON CONFLICT (idempotency_key) DO UPDATE
           SET score = EXCLUDED.score, updated_at = NOW()
         RETURNING *`,
        [
          txId,
          idempotencyKey,
          userId,
          msisdnMasked,
          tournament.game_id,
          tournament.title,
          tournamentId,
          score,
          1,
          '12,500 ETB Cash Prize',
          12500,
          1000,
          auditHash,
        ]
      );

      const r = rewardRow.rows[0];
      transaction = {
        id: r.id,
        idempotencyKey: r.idempotency_key,
        userId: r.user_id,
        msisdnMasked: r.msisdn_masked,
        gameId: r.game_id,
        gameTitle: r.game_title,
        tournamentId: r.tournament_id,
        score: r.score,
        rank: r.rank,
        reward: r.reward,
        rewardETB: parseFloat(r.reward_etb),
        rewardCoins: parseInt(r.reward_coins, 10),
        timestamp: r.created_at,
        status: r.status,
        verificationSource: r.verification_source,
        auditHash: r.audit_hash,
      };
    }

    return {
      success: true,
      message: `Score of ${score} recorded for ${tournament.title}!`,
      transaction,
    };
  },
};
