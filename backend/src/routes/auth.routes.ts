import { FastifyInstance } from 'fastify';
import { authService } from '../services/authService.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/auth.js';

export async function authRoutes(fastify: FastifyInstance) {
  // TeleBirr SuperApp Direct Connect Single-Sign-On
  fastify.post('/telebirr-login', { preHandler: [authRateLimiter] }, async (request, reply) => {
    const body = (request.body || {}) as { phoneNumber?: string; token?: string };
    const result = await authService.loginWithTeleBirr(body.phoneNumber, body.token);
    if (!result.success) {
      return reply.status(400).send(result);
    }
    return reply.send(result);
  });

  // Get current authenticated user profile
  fastify.get('/me', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = request.user!.userId;
    const profile = await authService.getProfile(userId);
    if (!profile) {
      return reply.status(404).send({ success: false, message: 'Profile not found' });
    }
    return reply.send({ success: true, profile });
  });

  // Sign out / invalidate session
  fastify.post('/logout', { preHandler: [requireAuth] }, async (request, reply) => {
    return reply.send({ success: true, message: 'Signed out successfully' });
  });
}
