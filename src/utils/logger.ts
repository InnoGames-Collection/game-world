/**
 * Structured Enterprise Logger for GAMEON TELE
 * Provides standardized log levels, context tagging, and safe output in production.
 */

import { appConfig } from "../config/appConfig";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// In production, suppress debug messages by default
const CURRENT_MIN_LEVEL: LogLevel = appConfig.env === "production" ? "info" : "debug";

class Logger {
  private tag: string;

  constructor(tag: string = "App") {
    this.tag = tag;
  }

  public createChild(subTag: string): Logger {
    return new Logger(`${this.tag}:${subTag}`);
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[CURRENT_MIN_LEVEL];
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.tag}] ${message}`;
  }

  public debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message), ...args);
    }
  }

  public info(message: string, ...args: unknown[]): void {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message), ...args);
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message), ...args);
    }
  }

  public error(message: string, error?: unknown, ...args: unknown[]): void {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message), error, ...args);
    }
  }
}

export const logger = new Logger("GAMEON");
export const createLogger = (tag: string) => new Logger(tag);
