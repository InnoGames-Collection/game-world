import { FastifyInstance } from 'fastify';
import { authService } from '../services/authService.js';
import { otpRateLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/auth.js';

export async function authRoutes(fastify: FastifyInstance) {
  // Pre-login check (Portal Subscription Gate)
  fastify.post('/login-gate', async (request, reply) => {
    const { phoneNumber } = request.body as { phoneNumber: string };
    const result = await authService.loginGate(phoneNumber);
    return reply.send(result);
  });

  // Request SMS OTP code
  fastify.post('/request-otp', { preHandler: [otpRateLimiter] }, async (request, reply) => {
    const { phoneNumber } = request.body as { phoneNumber: string };
    if (!phoneNumber) {
      return reply.status(400).send({ success: false, message: 'phoneNumber is required' });
    }
    const result = await authService.requestOtp(phoneNumber);
    return reply.send(result);
  });

  // Verify OTP code
  fastify.post('/verify-otp', async (request, reply) => {
    const { phoneNumber, otp } = request.body as { phoneNumber: string; otp: string };
    if (!phoneNumber || !otp) {
      return reply.status(400).send({ success: false, message: 'phoneNumber and otp are required' });
    }
    const result = await authService.verifyOtp(phoneNumber, otp);
    if (!result.success) {
      return reply.status(400).send(result);
    }
    return reply.send(result);
  });

  // TeleBirr SuperApp Direct Connect Single-Sign-On
  fastify.post('/telebirr-login', async (request, reply) => {
    const body = (request.body || {}) as { phoneNumber?: string };
    const result = await authService.loginWithTeleBirr(body.phoneNumber);
    return reply.send(result);
  });

  // Sign out / invalidate session
  fastify.post('/logout', { preHandler: [requireAuth] }, async (request, reply) => {
    return reply.send({ success: true, message: 'Signed out successfully' });
  });
}
