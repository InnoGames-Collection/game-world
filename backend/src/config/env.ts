import { cleanEnv, str, port, num, bool } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: port({ default: 3302 }),
  ADMIN_PORT: port({ default: 3303 }),
  HOST: str({ default: '0.0.0.0' }),
  DOMAIN: str({ default: 'innopulseplatform.com' }),

  // PostgreSQL
  DATABASE_URL: str({ default: 'postgresql://postgres:postgres@localhost:5432/gameon' }),
  DB_MAX_CONNECTIONS: num({ default: 20 }),

  // Valkey / Redis
  VALKEY_URL: str({ default: 'redis://localhost:6379' }),

  // Security / Auth
  JWT_SECRET: str({ default: 'gameon-tele-super-secret-jwt-key-prod-2026' }),
  JWT_ACCESS_EXPIRES_IN: str({ default: '1h' }),
  JWT_REFRESH_EXPIRES_IN: str({ default: '7d' }),
  GAME_TOKEN_SECRET: str({ default: 'gameon-tele-anti-cheat-round-token-secret-2026' }),
  CRON_SECRET: str({ default: 'gameon-cron-secret-prod-2026' }),

  // Rate Limiting
  RATE_LIMIT_GENERAL: num({ default: 60 }), // 60 req/min

  // TeleBirr Integration
  TELEBIRR_MODE: str({ choices: ['sandbox', 'live'], default: 'live' }),
  TELEBIRR_APP_KEY: str({ default: '' }),
  TELEBIRR_APP_ID: str({ default: '' }),
  TELEBIRR_PUBLIC_KEY: str({ default: '' }),
  TELEBIRR_CHECKOUT_URL: str({ default: 'https://telebirr.et/checkout' }),
  TELEBIRR_NOTIFY_URL: str({ default: 'https://goplay.innopulseplatform.com/api/webhooks/telebirr/callback' }),
  TELEBIRR_RETURN_URL: str({ default: 'https://goplay.innopulseplatform.com/#/profile' }),

  // Brevo Transactional Email & Admin Magic Link Auth
  BREVO_API_KEY: str({ default: '' }),
  BREVO_SENDER_EMAIL: str({ default: 'innospher@gmail.com' }),
  BREVO_SENDER_NAME: str({ default: 'GoPlay Admin Portal' }),
  MAGIC_LINK_SECRET: str({ default: 'goplay-tele-admin-magic-link-secret-2026' }),
  ADMIN_PORTAL_URL: str({ default: 'https://goplay-admin.innopulseplatform.com' })
});
