import { Redis } from 'ioredis';
import { env } from './env.js';
import pino from 'pino';

const logger = pino({ name: 'ValkeyCache' });

class InMemoryCache {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    let expiresAt: number | undefined;
    if (mode === 'EX' && duration) {
      expiresAt = Date.now() + duration * 1000;
    } else if (mode === 'PX' && duration) {
      expiresAt = Date.now() + duration;
    }
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const val = current ? parseInt(current, 10) + 1 : 1;
    this.store.set(key, { value: val.toString() });
    return val;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const item = this.store.get(key);
    if (!item) return 0;
    item.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }
}

let redisClient: Redis | null = null;
let memoryFallback: InMemoryCache | null = null;
let isRedisConnected = false;

try {
  redisClient = new Redis(env.VALKEY_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Valkey connection failed; switching to in-memory cache fallback');
        return null; // Stop retrying
      }
      return Math.min(times * 100, 2000);
    },
    lazyConnect: true,
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    logger.info('Connected to Valkey cache');
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
    logger.warn({ err: err.message }, 'Valkey connection notice; using cache resilience');
  });

  redisClient.connect().catch(() => {
    isRedisConnected = false;
    memoryFallback = new InMemoryCache();
  });
} catch {
  memoryFallback = new InMemoryCache();
}

export const cache = {
  async get(key: string): Promise<string | null> {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.get(key);
      } catch {
        if (!memoryFallback) memoryFallback = new InMemoryCache();
        return await memoryFallback.get(key);
      }
    }
    if (!memoryFallback) memoryFallback = new InMemoryCache();
    return await memoryFallback.get(key);
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (isRedisConnected && redisClient) {
      try {
        if (ttlSeconds) {
          await redisClient.set(key, value, 'EX', ttlSeconds);
        } else {
          await redisClient.set(key, value);
        }
        return;
      } catch {
        if (!memoryFallback) memoryFallback = new InMemoryCache();
        await memoryFallback.set(key, value, ttlSeconds ? 'EX' : undefined, ttlSeconds);
        return;
      }
    }
    if (!memoryFallback) memoryFallback = new InMemoryCache();
    await memoryFallback.set(key, value, ttlSeconds ? 'EX' : undefined, ttlSeconds);
  },

  async del(key: string): Promise<void> {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.del(key);
        return;
      } catch {
        if (!memoryFallback) memoryFallback = new InMemoryCache();
        await memoryFallback.del(key);
        return;
      }
    }
    if (!memoryFallback) memoryFallback = new InMemoryCache();
    await memoryFallback.del(key);
  },

  async incr(key: string, ttlSeconds?: number): Promise<number> {
    let count = 1;
    if (isRedisConnected && redisClient) {
      try {
        count = await redisClient.incr(key);
        if (count === 1 && ttlSeconds) {
          await redisClient.expire(key, ttlSeconds);
        }
        return count;
      } catch {
        if (!memoryFallback) memoryFallback = new InMemoryCache();
      }
    }
    if (!memoryFallback) memoryFallback = new InMemoryCache();
    count = await memoryFallback.incr(key);
    if (count === 1 && ttlSeconds) {
      await memoryFallback.expire(key, ttlSeconds);
    }
    return count;
  }
};
