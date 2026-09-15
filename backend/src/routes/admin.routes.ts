import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../middleware/auth.js';
import { query } from '../config/database.js';

export async function adminRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAdmin);

  // System Metrics
  fastify.get('/metrics', async (request, reply) => {
    const userCount = await query('SELECT COUNT(*) FROM profiles');
    const matchesCount = await query('SELECT COALESCE(SUM(matches_played), 0) as total FROM profiles');
    const ordersCount = await query(`SELECT COUNT(*) as total, COALESCE(SUM(amount_etb), 0) as vol FROM payment_orders WHERE status = 'SUCCESS'`);
    const tourneyCount = await query(`SELECT COUNT(*) FROM tournaments WHERE state = 'live'`);
    const claimRes = await query(`SELECT COUNT(*) as cnt, COALESCE(SUM(reward_etb), 0) as total_disbursed FROM reward_transactions WHERE status = 'DISBURSED'`);

    return reply.send({
      totalUsers: parseInt(userCount.rows[0].count, 10),
      totalMatchesPlayed: parseInt(matchesCount.rows[0].total, 10),
      totalPaymentVolumeETB: parseFloat(ordersCount.rows[0].vol),
      successfulOrders: parseInt(ordersCount.rows[0].total, 10),
      activeTournaments: parseInt(tourneyCount.rows[0].count, 10),
      disbursedPrizesETB: parseFloat(claimRes.rows[0].total_disbursed),
      disbursedPrizesCount: parseInt(claimRes.rows[0].cnt, 10),
    });
  });

  // User Management
  fastify.get('/users', async (request, reply) => {
    const { search, limit = 50, offset = 0 } = request.query as any;
    let sql = `SELECT id, phone, phone_local, display_name, role, coins, xp, level, energy,
                      telebirr_linked, telebirr_balance, matches_played, created_at
                 FROM profiles`;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` WHERE phone ILIKE $1 OR display_name ILIKE $1`;
    }

    params.push(limit, offset);
    sql += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await query(sql, params);
    return reply.send(res.rows);
  });

  // Adjust User Economy
  fastify.put('/users/:id/adjust', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { coinDelta, energyDelta, role } = request.body as any;

    if (coinDelta) {
      await query('SELECT apply_coins($1, $2, $3, $4)', [id, coinDelta, 'Admin Manual Adjustment', 'ADMIN_ADJUST']);
    }
    if (energyDelta) {
      await query('SELECT apply_energy($1, $2, $3, $4)', [id, energyDelta, 'DAILY_REWARD', 'Admin Energy Grant']);
    }
    if (role && (role === 'admin' || role === 'player')) {
      await query('UPDATE profiles SET role = $1 WHERE id = $2', [role, id]);
    }

    return reply.send({ success: true, message: 'User updated successfully' });
  });

  // List all tournaments
  fastify.get('/tournaments', async (request, reply) => {
    const res = await query('SELECT * FROM tournaments ORDER BY starts_at DESC');
    return reply.send(res.rows);
  });

  // Create Tournament
  fastify.post('/tournaments', async (request, reply) => {
    const b = request.body as any;
    await query(
      `INSERT INTO tournaments (
         id, game_id, title, title_am, cycle, type, entry_fee_coins, entry_fee_energy,
         prize_model, prize_pool_etb, prize_pool_coins, prize_tiers, banner_image,
         sponsor, entry_requirement, starts_at, ends_at, state
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [
        b.id, b.gameId, b.title, b.titleAm || b.title, b.cycle || 'weekly', b.type || 'free',
        b.entryFeeCoins || 0, b.entryFeeEnergy || 1, b.prizeModel || 'sponsored',
        b.prizePoolETB || 10000, b.prizePoolCoins || 50000, JSON.stringify(b.prizeTiers || []),
        b.bannerImage || '', b.sponsor || 'EthioTelecom', b.entryRequirement || 'Open to All',
        b.startsAt || new Date(), b.endsAt || new Date(Date.now() + 7 * 86400000), b.state || 'live'
      ]
    );
    return reply.send({ success: true, message: 'Tournament created' });
  });

  // Settle Tournament
  fastify.post('/tournaments/:id/settle', async (request, reply) => {
    const { id } = request.params as { id: string };
    await query(`UPDATE tournaments SET state = 'settled' WHERE id = $1`, [id]);
    return reply.send({ success: true, message: `Tournament ${id} marked as settled` });
  });

  // Game Scoring Rules
  fastify.get('/game-rules', async (request, reply) => {
    const res = await query('SELECT * FROM game_scoring_rules ORDER BY game_id ASC');
    return reply.send(res.rows);
  });

  fastify.put('/game-rules/:gameId', async (request, reply) => {
    const { gameId } = request.params as { gameId: string };
    const b = request.body as any;
    await query(
      `UPDATE game_scoring_rules
          SET max_score = COALESCE($1, max_score),
              max_score_per_second = COALESCE($2, max_score_per_second)
        WHERE game_id = $3`,
      [b.maxScore, b.maxScorePerSecond, gameId]
    );
    return reply.send({ success: true, message: 'Scoring rules updated' });
  });

  // Audit Logs
  fastify.get('/logs/audit', async (request, reply) => {
    const ledgers = await query('SELECT * FROM wallet_ledger ORDER BY created_at DESC LIMIT 20');
    const orders = await query('SELECT * FROM payment_orders ORDER BY created_at DESC LIMIT 20');
    const rewards = await query('SELECT * FROM reward_transactions ORDER BY created_at DESC LIMIT 20');

    return reply.send({
      recentLedger: ledgers.rows,
      recentOrders: orders.rows,
      recentRewards: rewards.rows,
    });
  });
}
