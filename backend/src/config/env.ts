import { cleanEnv, str, port, num, bool } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: port({ default: 3302 }),
  ADMIN_PORT: port({ default: 3301 }),
  HOST: str({ default: '0.0.0.0' }),
  DOMAIN: str({ default: 'innopulseplatform.com' }),

  // PostgreSQL
  DATABASE_URL: str({ default: 'postgresql://postgres:postgres@localhost:5432/gameon' }),
  DB_MAX_CONNECTIONS: num({ default: 20 }),

  // Valkey / Redis
  VALKEY_URL: str({ default: 'redis://localhost:6379' }),

  // Security / Auth
  JWT_SECRET: str({ default: 'gameon-tele-super-secret-jwt-key-change-in-prod-2026' }),
  JWT_ACCESS_EXPIRES_IN: str({ default: '1h' }),
  JWT_REFRESH_EXPIRES_IN: str({ default: '7d' }),
  GAME_TOKEN_SECRET: str({ default: 'gameon-tele-anti-cheat-round-token-secret-2026' }),
  CRON_SECRET: str({ default: 'gameon-cron-secret-change-in-prod' }),

  // Rate Limiting
  RATE_LIMIT_GENERAL: num({ default: 60 }), // 60 req/min
  RATE_LIMIT_OTP: num({ default: 5 }),      // 5 req/min

  // SMSC / Telecom Partner MT
  SMS_MODE: str({ choices: ['mock', 'gateway', 'portal'], default: 'mock' }),
  SMSC_BASE_URL: str({ default: 'http://168.119.53.26:8484' }),
  SMSC_API_KEY: str({ default: 'sandbox-api-key' }),
  SMSC_SERVICE_ID: num({ default: 4 }),
  SMSC_WEBHOOK_SECRET: str({ default: 'sandbox-webhook-secret' }),
  DEV_OTP_ECHO: bool({ default: true }), // For local/demo testing, returns demoOtp in response

  // TeleBirr
  TELEBIRR_MODE: str({ choices: ['sandbox', 'live'], default: 'sandbox' }),
  TELEBIRR_APP_KEY: str({ default: '' }),
  TELEBIRR_APP_ID: str({ default: '' }),
  TELEBIRR_PUBLIC_KEY: str({ default: '' }),
  TELEBIRR_CHECKOUT_URL: str({ default: 'https://telebirr.et/checkout' }),
  TELEBIRR_NOTIFY_URL: str({ default: 'https://gameon-api.innopulseplatform.com/api/webhooks/telebirr/callback' }),
  TELEBIRR_RETURN_URL: str({ default: 'https://gameon.innopulseplatform.com/#/profile' })
});
