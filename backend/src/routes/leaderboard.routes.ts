import { FastifyInstance } from 'fastify';
import { optionalAuth } from '../middleware/auth.js';
import { leaderboardService } from '../services/leaderboardService.js';

export async function leaderboardRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', optionalAuth);

  // Weekly Leaderboard (7-day calendar average)
  fastify.get('/weekly', async (request, reply) => {
    const userId = request.user?.userId;
    const result = await leaderboardService.getWeeklyLeaderboard(userId);
    return reply.send(result);
  });

  // Monthly Leaderboard (30-day calendar average)
  fastify.get('/monthly', async (request, reply) => {
    const userId = request.user?.userId;
    const result = await leaderboardService.getMonthlyLeaderboard(userId);
    return reply.send(result);
  });

  // Game specific all-time high scores leaderboard
  fastify.get('/game/:gameId', async (request, reply) => {
    const { gameId } = request.params as { gameId: string };
    const entries = await leaderboardService.getGameLeaderboard(gameId);
    return reply.send(entries);
  });
}
