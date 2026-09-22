import { FastifyRequest, FastifyReply } from 'fastify';
import { cache } from '../config/cache.js';
import { env } from '../config/env.js';

export function createRateLimiter(limit: number, windowSeconds: number = 60, prefix: string = 'rl') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const ip = request.ip || '127.0.0.1';
    const userId = request.user?.userId || '';
    const key = `${prefix}:${userId || ip}`;

    const currentCount = await cache.incr(key, windowSeconds);

    reply.header('X-RateLimit-Limit', limit);
    reply.header('X-RateLimit-Remaining', Math.max(0, limit - currentCount));

    if (currentCount > limit) {
      return reply.status(429).send({
        success: false,
        message: `Too many requests. Limit is ${limit} requests per ${windowSeconds} seconds. Please slow down.`,
      });
    }
  };
}

export const generalRateLimiter = createRateLimiter(env.RATE_LIMIT_GENERAL, 60, 'rl_general');
export const authRateLimiter = createRateLimiter(20, 60, 'rl_auth');
