import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { subscriptionService } from '../services/subscriptionService.js';
import { SubscriptionPlan } from '../types/domain.js';

export async function subscriptionRoutes(fastify: FastifyInstance) {
  // Get all VIP plans (public)
  fastify.get('/plans', async (request, reply) => {
    return reply.send(subscriptionService.getPlans());
  });

  // Subscribe to VIP plan
  fastify.post('/subscribe', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = request.user!.userId;
    const { plan } = request.body as { plan: SubscriptionPlan };

    const result = await subscriptionService.subscribe(userId, plan);
    if (!result.success) {
      return reply.status(400).send(result);
    }
    return reply.send(result);
  });

  // Cancel auto-renewal
  fastify.post('/cancel', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = request.user!.userId;
    const result = await subscriptionService.cancelSubscription(userId);
    return reply.send(result);
  });
}
