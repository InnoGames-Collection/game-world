import { FastifyInstance } from 'fastify';
import { telebirrService } from '../services/telebirrService.js';

export async function webhookRoutes(fastify: FastifyInstance) {
  // TeleBirr C2B payment notification callback
  fastify.post('/telebirr/callback', async (request, reply) => {
    const payload = request.body as any;
    const result = await telebirrService.handleCallback(payload);
    return reply.send(result);
  });
}
