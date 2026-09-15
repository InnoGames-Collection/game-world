import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { gameSessionService } from '../services/gameSessionService.js';
import { query } from '../config/database.js';

export async function gameRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAuth);

  // Check entitlement for a game
  fastify.post('/entitlement/check', async (request, reply) => {
    const userId = request.user!.userId;
    const { gameId } = request.body as { gameId: string };

    const res = await query(
      `SELECT * FROM game_entitlements
        WHERE user_id = $1 AND game_id = $2 AND expires_at > NOW()
        ORDER BY expires_at DESC LIMIT 1`,
      [userId, gameId]
    );

    const hasAccess = res.rowCount !== null && res.rowCount > 0;
    return reply.send({
      hasAccess,
      entitlement: hasAccess ? res.rows[0] : null,
    });
  });

  // Start game session (generates anti-cheat round token)
  fastify.post('/session/start', async (request, reply) => {
    const userId = request.user!.userId;
    const { gameId, tournamentId } = request.body as { gameId: string; tournamentId?: string };

    if (!gameId) {
      return reply.status(400).send({ success: false, message: 'gameId is required' });
    }

    try {
      const session = await gameSessionService.startSession(userId, gameId, tournamentId);

      // Record recent game
      await query(
        `INSERT INTO recent_games (user_id, game_id, played_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id, game_id) DO UPDATE SET played_at = NOW()`,
        [userId, gameId]
      );

      return reply.send(session);
    } catch (err: any) {
      return reply.status(400).send({ success: false, message: err.message });
    }
  });

  // Submit game score (anti-cheat validated, 400 pts cap)
  fastify.post('/session/submit', async (request, reply) => {
    const userId = request.user!.userId;
    const { gameId, rawScore, durationSeconds, token, tournamentId } = request.body as {
      gameId: string;
      rawScore: number;
      durationSeconds: number;
      token?: string;
      tournamentId?: string;
    };

    if (!gameId || rawScore === undefined) {
      return reply.status(400).send({ success: false, message: 'gameId and rawScore are required' });
    }

    try {
      const result = await gameSessionService.submitScore(
        userId,
        gameId,
        rawScore,
        durationSeconds || 10,
        token,
        tournamentId
      );
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ success: false, message: err.message });
    }
  });

  // Get recently played games
  fastify.get('/recent', async (request, reply) => {
    const userId = request.user!.userId;
    const res = await query(
      `SELECT game_id, played_at FROM recent_games
        WHERE user_id = $1
        ORDER BY played_at DESC LIMIT 10`,
      [userId]
    );

    return reply.send(res.rows.map((r: any) => r.game_id));
  });
}
