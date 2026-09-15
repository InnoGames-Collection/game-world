import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from '../config/database.js';
import pino from 'pino';

const logger = pino({ name: 'Migrator' });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  logger.info('Starting PostgreSQL schema migrations');
  const migrationsDir = path.join(__dirname, '../../db/migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    logger.info({ file }, 'Applying migration file');
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    await query(sql);
  }

  logger.info('All migrations successfully applied');
  await pool.end();
}

runMigrations().catch((err) => {
  logger.error({ err }, 'Migration failed');
  process.exit(1);
});
