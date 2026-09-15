/**
 * Application Configuration for GAMEON TELE (TelePlay Ethiopia)
 * Provides centralized environment variable parsing, demo mode gating,
 * and default configuration parameters for production and local environments.
 */

export interface AppConfig {
  /** Application environment name */
  env: "development" | "staging" | "production";
  /** Flag to determine whether mock data and demo OTPs are allowed */
  isDemoMode: boolean;
  /** Fixed demo OTP used for development/testing */
  demoOtp: string;
  /** Telebirr Direct Connect base API URL (if connected to live backend) */
  telebirrApiUrl: string;
  /** Energy recharge interval in milliseconds (default: 10 minutes) */
  energyRefillIntervalMs: number;
  /** Energy recharge check interval for timer in milliseconds (default: 15 seconds) */
  energyCheckIntervalMs: number;
  /** Toast auto-dismiss timeout in milliseconds */
  toastTimeoutMs: number;
  /** App version */
  version: string;
}

const isDev = import.meta.env.DEV ?? false;
const envMode = (import.meta.env.MODE || (isDev ? "development" : "production")) as AppConfig["env"];

export const appConfig: AppConfig = Object.freeze({
  env: envMode,
  isDemoMode: import.meta.env.VITE_ENABLE_DEMO_MODE !== "false",
  demoOtp: import.meta.env.VITE_DEMO_OTP || "123456",
  telebirrApiUrl: import.meta.env.VITE_TELEBIRR_API_URL || "https://api.telebirr.et/v1",
  energyRefillIntervalMs: Number(import.meta.env.VITE_ENERGY_INTERVAL_MS) || 10 * 60 * 1000,
  energyCheckIntervalMs: 15 * 1000,
  toastTimeoutMs: 4000,
  version: "1.0.0",
});
