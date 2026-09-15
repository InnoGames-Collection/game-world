import { FastifyInstance } from 'fastify';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { tournamentService } from '../services/tournamentService.js';

export async function tournamentRoutes(fastify: FastifyInstance) {
  // List all tournaments (public / optional auth)
  fastify.get('/', { preHandler: [optionalAuth] }, async (request, reply) => {
    const userId = request.user?.userId;
    const tourneys = await tournamentService.getTournaments(userId);
    return reply.send(tourneys);
  });

  // Enter a tournament
  fastify.post('/:id/enter', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = request.user!.userId;
    const { id } = request.params as { id: string };

    const result = await tournamentService.enterTournament(userId, id);
    if (!result.success) {
      return reply.status(400).send(result);
    }
    return reply.send(result);
  });
}
