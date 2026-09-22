import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { env } from './config/env.js';
import { pool } from './config/database.js';
import { cache } from './config/cache.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';
import { authRoutes } from './routes/auth.routes.js';
import { profileRoutes } from './routes/profile.routes.js';
import { gameRoutes } from './routes/game.routes.js';
import { economyRoutes } from './routes/economy.routes.js';
import { tournamentRoutes } from './routes/tournament.routes.js';
import { leaderboardRoutes } from './routes/leaderboard.routes.js';
import { paymentRoutes } from './routes/payment.routes.js';
import { subscriptionRoutes } from './routes/subscription.routes.js';
import { rewardRoutes } from './routes/reward.routes.js';
import { webhookRoutes } from './routes/webhook.routes.js';
import { startCronJobs } from './cron/scheduler.js';

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
  },
  trustProxy: true,
});

async function main() {
  // 1. Security Headers & CORS
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
      },
    },
  });

  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Allow localhost, telebirr webviews, and production domain
      if (
        !origin ||
        origin.includes('innopulseplatform.com') ||
        origin.includes('telebirr.et') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        cb(null, true);
        return;
      }
      cb(new Error('Not allowed by CORS policy'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // 2. Rate Limiting (Default 60 req/min)
  fastify.addHook('preHandler', generalRateLimiter);

  // 3. Healthcheck Probes
  fastify.get('/health', async () => ({ status: 'healthy', timestamp: new Date().toISOString() }));
  fastify.get('/api/v1/health', async () => ({ status: 'healthy', platform: 'GoPlay', version: '1.0.0' }));

  // 4. API Routes (Player & Game Center API)
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(profileRoutes, { prefix: '/api/profile' });
  await fastify.register(gameRoutes, { prefix: '/api/game' });
  await fastify.register(economyRoutes, { prefix: '/api/economy' });
  await fastify.register(tournamentRoutes, { prefix: '/api/tournaments' });
  await fastify.register(leaderboardRoutes, { prefix: '/api/leaderboards' });
  await fastify.register(paymentRoutes, { prefix: '/api/payments' });
  await fastify.register(subscriptionRoutes, { prefix: '/api/subscriptions' });
  await fastify.register(rewardRoutes, { prefix: '/api/rewards' });
  await fastify.register(webhookRoutes, { prefix: '/api/webhooks' });

  // 5. Background Schedulers
  startCronJobs();

  // 6. Start Listening
  try {
    const address = await fastify.listen({ port: env.PORT, host: env.HOST });
    fastify.log.info(`🚀 GoPlay Server running at ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful Shutdown
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, closing server gracefully`);
    try {
      await fastify.close();
      await cache.close();
      await pool.end();
      fastify.log.info('Server, cache and database connections successfully closed');
    } catch (err) {
      fastify.log.error({ err }, 'Error during graceful shutdown');
    }
    process.exit(0);
  });
});

main();
