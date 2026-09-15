import cron from 'node-cron';
import { query } from '../config/database.js';
import pino from 'pino';

const logger = pino({ name: 'CronScheduler' });

export function startCronJobs() {
  logger.info('Initializing background cron scheduler');

  // Check tournament settlements every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      const res = await query(
        `UPDATE tournaments
            SET state = 'settled'
          WHERE state = 'live' AND ends_at <= NOW()
          RETURNING id`
      );
      if (res.rowCount && res.rowCount > 0) {
        logger.info({ settledCount: res.rowCount, ids: res.rows.map(r => r.id) }, 'Periodic tournament settlement executed');
      }
    } catch (err: any) {
      logger.error({ err: err.message }, 'Error settling expired tournaments');
    }
  });

  // Expire old anti-cheat nonces (> 24h) every night at 02:00
  cron.schedule('0 2 * * *', async () => {
    try {
      const res = await query(`DELETE FROM used_nonces WHERE used_at < NOW() - INTERVAL '24 hours'`);
      logger.info({ cleanedRows: res.rowCount }, 'Expired anti-cheat nonces pruned');
    } catch (err: any) {
      logger.error({ err: err.message }, 'Error pruning old nonces');
    }
  });
}
