/**
 * Application Configuration for GAMEON TELE (telebirr Game Center)
 * Production Configuration
 */

export interface AppConfig {
  /** Application environment name */
  env: "development" | "staging" | "production";
  /** Flag to determine whether mock data is allowed - strictly false in production */
  isDemoMode: boolean;
  /** Telebirr Direct Connect base API URL */
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
  isDemoMode: false,
  telebirrApiUrl: import.meta.env.VITE_TELEBIRR_API_URL || "https://telebirr.et",
  energyRefillIntervalMs: Number(import.meta.env.VITE_ENERGY_INTERVAL_MS) || 10 * 60 * 1000,
  energyCheckIntervalMs: 15 * 1000,
  toastTimeoutMs: 4000,
  version: "1.0.0",
});
