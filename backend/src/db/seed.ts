import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from '../config/database.js';
import pino from 'pino';

const logger = pino({ name: 'Seeder' });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeeds() {
  logger.info('Starting database seeding (Option B: Seeded Realistic Contender Baseline)');
  const seedsDir = path.join(__dirname, '../../db/seeds');
  const files = fs.readdirSync(seedsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    logger.info({ file }, 'Applying seed file');
    const sql = fs.readFileSync(path.join(seedsDir, file), 'utf-8');
    await query(sql);
  }

  logger.info('Database seeding completed successfully');
  await pool.end();
}

runSeeds().catch((err) => {
  logger.error({ err }, 'Seeding failed');
  process.exit(1);
});
