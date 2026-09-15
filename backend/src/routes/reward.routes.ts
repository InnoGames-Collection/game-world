import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { rewardService } from '../services/rewardService.js';

export async function rewardRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAuth);

  // Get user claimable rewards
  fastify.get('/claimable', async (request, reply) => {
    const userId = request.user!.userId;
    const rewards = await rewardService.getClaimableRewards(userId);
    return reply.send(rewards);
  });

  // Idempotently claim tournament reward
  fastify.post('/claim', async (request, reply) => {
    const userId = request.user!.userId;
    const { rewardId } = request.body as { rewardId: string };

    if (!rewardId) {
      return reply.status(400).send({ success: false, message: 'rewardId is required' });
    }

    const result = await rewardService.claimReward(userId, rewardId);
    if (!result.success) {
      return reply.status(400).send(result);
    }
    return reply.send(result);
  });
}
