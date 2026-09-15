import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { economyService } from '../services/economyService.js';

export async function economyRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAuth);

  // Get user coin wallet transaction history
  fastify.get('/transactions', async (request, reply) => {
    const userId = request.user!.userId;
    const txs = await economyService.getWalletTransactions(userId);
    return reply.send(txs);
  });

  // Get user energy transaction history
  fastify.get('/energy-transactions', async (request, reply) => {
    const userId = request.user!.userId;
    const txs = await economyService.getEnergyTransactions(userId);
    return reply.send(txs);
  });

  // Claim daily login streak reward
  fastify.post('/claim-daily', async (request, reply) => {
    const userId = request.user!.userId;
    const result = await economyService.claimDailyStreak(userId);
    return reply.send(result);
  });
}
