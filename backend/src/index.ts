import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { env } from './config/env.js';
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
import { adminRoutes } from './routes/admin.routes.js';
import { adminPortalRoutes } from './admin/adminApp.js';
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
  await fastify.register(helmet, { contentSecurityPolicy: false });
  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Allow localhost, local tunnels, telebirr miniapp webview, and innopulseplatform.com
      if (!origin || origin.includes('innopulseplatform.com') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        cb(null, true);
        return;
      }
      cb(null, true); // Permissive for initial dev & staging
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // 2. Rate Limiting (Default 60 req/min)
  fastify.addHook('preHandler', generalRateLimiter);

  // 3. Healthcheck Probes
  fastify.get('/health', async () => ({ status: 'healthy', timestamp: new Date().toISOString() }));
  fastify.get('/api/v1/health', async () => ({ status: 'healthy', platform: 'GAMEON TELE', version: '1.0.0' }));

  // 4. API Routes
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
  await fastify.register(adminRoutes, { prefix: '/api/admin' });

  // 5. Admin Portal Console
  await fastify.register(adminPortalRoutes);

  // 6. Background Schedulers
  startCronJobs();

  // 7. Start Listening
  try {
    const address = await fastify.listen({ port: env.PORT, host: env.HOST });
    fastify.log.info(`🚀 GAMEON TELE Server running at ${address}`);
    fastify.log.info(`📊 Admin Portal Console available at ${address}/admin`);

    // Dedicated Admin Console listener on ADMIN_PORT (e.g. 3301)
    if (env.ADMIN_PORT && env.ADMIN_PORT !== env.PORT) {
      try {
        const adminApp = Fastify({ logger: false });
        await adminApp.register(cors, { origin: true, credentials: true });
        adminApp.get('/', async (req, reply) => {
          return reply.redirect('/admin');
        });
        adminApp.get('/health', async () => ({ status: 'healthy', service: 'gameon-admin' }));
        await adminApp.register(adminPortalRoutes);
        await adminApp.listen({ port: env.ADMIN_PORT, host: env.HOST });
        fastify.log.info(`📊 Dedicated Admin Portal running on http://${env.HOST}:${env.ADMIN_PORT}`);
      } catch (adminErr: any) {
        fastify.log.warn({ err: adminErr.message }, 'Dedicated admin listener skipped');
      }
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful Shutdown
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, closing server gracefully`);
    await fastify.close();
    process.exit(0);
  });
});

main();
