import pg from 'pg';
import { env } from './env.js';
import pino from 'pino';

const logger = pino({ name: 'Database' });

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_MAX_CONNECTIONS,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected PostgreSQL client error');
});

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn({ text, duration, rows: res.rowCount }, 'Slow database query detected');
    }
    return res;
  } catch (err) {
    logger.error({ err, text, params }, 'Database query error');
    throw err;
  }
}

export async function getClient(): Promise<pg.PoolClient> {
  return await pool.connect();
}
