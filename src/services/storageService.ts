/**
 * Storage Service for TelePlay Ethiopia (GAMEON TELE)
 * Enterprise-grade client-side persistence with in-memory fallback,
 * quota protection, reactive change listeners, and defensive deserialization.
 */

import { UserProfile, LanguageCode, EnergyTransaction, PaymentTransaction } from "../types";
import { appConfig } from "../config/appConfig";
import { createLogger } from "../utils/logger";

const log = createLogger("StorageService");

const DEFAULT_INITIAL_PROFILE: UserProfile = {
  id: 'usr_guest',
  phoneNumber: '',
  displayName: 'telebirr Player',
  avatarId: 'avatar_runner',
  isRegistered: false,
  telebirrLinked: false,
  telebirrBalance: 0,
  coins: 0,
  xp: 0,
  level: 1,
  energy: 5,
  maxEnergy: 5,
  lastEnergyRefillTimestamp: Date.now(),
  hasReceivedInitialCoins: false,
  subscription: {
    plan: 'free',
    isActive: false,
    autoRenew: false,
  },
  streak: {
    current: 1,
    lastClaimedDate: '',
    hasClaimedToday: false,
  },
  highScores: {},
  dailyScores: {},
  achievements: [],
  matchesPlayed: 0,
  trophiesCount: 0,
};

export const STORAGE_KEYS = {
  PROFILE: "teleplay_ethio_profile_v1",
  LANGUAGE: "teleplay_ethio_language_v1",
  AUDIO_ENABLED: "teleplay_ethio_audio_v1",
  HAPTICS_ENABLED: "teleplay_ethio_haptics_v1",
  NOTIFS_ENABLED: "teleplay_ethio_notifs_v1",
  LOW_DATA_MODE: "teleplay_ethio_low_data_v1",
  ENERGY_TXS: "teleplay_ethio_energy_txs_v1",
  COIN_TXS: "teleplay_ethio_coin_txs_v1",
  PAYMENT_TXS: "teleplay_ethio_payment_txs_v1",
} as const;

export interface CoinTransaction {
  id: string;
  type: "INITIAL_SUBSCRIPTION" | "GAME_ENTRY" | "TOURNAMENT_WIN" | "TELEBIRR_PURCHASE";
  amount: number;
  description: string;
  timestamp: string;
}

const INITIAL_COIN_TXS: CoinTransaction[] = [
  {
    id: "CTX_WELCOME_01",
    type: "INITIAL_SUBSCRIPTION",
    amount: 25,
    description: "Initial EthioTelecom Subscription Allocation",
    timestamp: new Date().toISOString(),
  },
];

const INITIAL_ENERGY_TXS: EnergyTransaction[] = [
  {
    transactionId: "ETX_INIT_01",
    type: "DAILY_REGEN",
    amount: 10,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "COMPLETED",
    details: "Initial Daily Energy Pool Refill",
  },
];

/**
 * Resilient Key-Value storage abstraction with memory fallback
 */
class ResilientStorage {
  private memoryFallback: Map<string, string> = new Map();
  private isLocalStorageAvailable: boolean;

  constructor() {
    this.isLocalStorageAvailable = this.testLocalStorage();
    if (!this.isLocalStorageAvailable) {
      log.warn("localStorage is unavailable or restricted; operating with in-memory fallback");
    }
  }

  private testLocalStorage(): boolean {
    try {
      if (typeof window === "undefined" || !window.localStorage) return false;
      const testKey = "__gameon_storage_test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      log.warn("localStorage availability test failed:", e);
      return false;
    }
  }

  public getItem(key: string): string | null {
    if (this.isLocalStorageAvailable) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        log.warn(`Failed to read "${key}" from localStorage, checking memory fallback:`, e);
      }
    }
    return this.memoryFallback.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.memoryFallback.set(key, value);
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        log.warn(`Failed to persist "${key}" to localStorage (quota or security restriction):`, e);
      }
    }
  }

  public removeItem(key: string): void {
    this.memoryFallback.delete(key);
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        log.warn(`Failed to remove "${key}" from localStorage:`, e);
      }
    }
  }

  public clear(): void {
    this.memoryFallback.clear();
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.clear();
      } catch (e) {
        log.warn("Failed to clear localStorage:", e);
      }
    }
  }
}

const safeStorage = new ResilientStorage();

// Storage change subscribers
type StorageListener<T = unknown> = (newValue: T) => void;
const listeners = new Map<string, Set<StorageListener>>();

function emitChange<T>(key: string, data: T) {
  const set = listeners.get(key);
  if (set) {
    set.forEach((fn) => {
      try {
        fn(data);
      } catch (e) {
        log.error(`Subscriber error on key "${key}":`, e);
      }
    });
  }
}

export const StorageService = {
  subscribe<T>(key: string, callback: StorageListener<T>): () => void {
    if (!listeners.has(key)) {
      listeners.set(key, new Set());
    }
    const set = listeners.get(key)!;
    set.add(callback as StorageListener);
    return () => {
      set.delete(callback as StorageListener);
    };
  },

  getProfile(): UserProfile {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!stored) {
        this.saveProfile(DEFAULT_INITIAL_PROFILE);
        return DEFAULT_INITIAL_PROFILE;
      }
      const parsed: UserProfile = JSON.parse(stored);
      if (!parsed || typeof parsed !== "object" || !parsed.id) {
        log.warn("Corrupted profile data encountered. Resetting to initial profile.");
        this.saveProfile(DEFAULT_INITIAL_PROFILE);
        return DEFAULT_INITIAL_PROFILE;
      }
      return this.recalculateEnergy(parsed);
    } catch (e) {
      log.error("Error reading profile, returning fallback:", e);
      return DEFAULT_INITIAL_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      safeStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      emitChange(STORAGE_KEYS.PROFILE, profile);
    } catch (e) {
      log.warn("Failed to save profile:", e);
    }
  },

  grantInitialSubscriptionCoins(profile: UserProfile): UserProfile {
    if (profile.hasReceivedInitialCoins) {
      return profile;
    }

    const updated: UserProfile = {
      ...profile,
      coins: profile.coins + 25,
      hasReceivedInitialCoins: true,
    };

    this.saveProfile(updated);

    this.recordCoinTransaction({
      id: "CTX_SUB_" + Date.now().toString(36).toUpperCase(),
      type: "INITIAL_SUBSCRIPTION",
      amount: 25,
      description: "Confirmed Subscription Allocation (25 Coins)",
      timestamp: new Date().toISOString(),
    });

    return updated;
  },

  clearSession(): UserProfile {
    const unauthenticated: UserProfile = {
      id: "usr_guest_" + Math.random().toString(36).substring(2, 7),
      phoneNumber: "",
      displayName: "EthioTelecom Gamer",
      avatarId: "avatar_runner",
      isRegistered: false,
      telebirrLinked: false,
      telebirrBalance: 0,
      coins: 0,
      xp: 0,
      level: 1,
      energy: 5,
      maxEnergy: 5,
      lastEnergyRefillTimestamp: Date.now(),
      hasReceivedInitialCoins: false,
      subscription: {
        plan: "free",
        isActive: false,
        autoRenew: false,
      },
      streak: {
        current: 1,
        lastClaimedDate: "",
        hasClaimedToday: false,
      },
      highScores: {},
      achievements: [],
      matchesPlayed: 0,
      trophiesCount: 0,
    };

    this.saveProfile(unauthenticated);
    return unauthenticated;
  },

  recalculateEnergy(profile: UserProfile): UserProfile {
    // If VIP subscriber, always maintain max energy
    if (profile.subscription?.isActive) {
      return {
        ...profile,
        energy: profile.maxEnergy,
      };
    }

    if (profile.energy >= profile.maxEnergy) {
      return {
        ...profile,
        lastEnergyRefillTimestamp: Date.now(),
      };
    }

    const now = Date.now();
    const elapsed = now - (profile.lastEnergyRefillTimestamp || now);
    const interval = appConfig.energyRefillIntervalMs;
    const refillPoints = Math.floor(elapsed / interval);

    if (refillPoints > 0) {
      const newEnergy = Math.min(profile.maxEnergy, profile.energy + refillPoints);
      const updated: UserProfile = {
        ...profile,
        energy: newEnergy,
        lastEnergyRefillTimestamp:
          newEnergy >= profile.maxEnergy ? now : (profile.lastEnergyRefillTimestamp || now) + refillPoints * interval,
      };
      this.saveProfile(updated);
      return updated;
    }

    return profile;
  },

  getCoinTransactions(): CoinTransaction[] {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.COIN_TXS);
      if (!stored) {
        this.saveCoinTransactions(INITIAL_COIN_TXS);
        return INITIAL_COIN_TXS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_COIN_TXS;
    }
  },

  saveCoinTransactions(txs: CoinTransaction[]): void {
    try {
      safeStorage.setItem(STORAGE_KEYS.COIN_TXS, JSON.stringify(txs));
      emitChange(STORAGE_KEYS.COIN_TXS, txs);
    } catch (e) {
      log.warn("Failed to save coin transactions:", e);
    }
  },

  recordCoinTransaction(tx: CoinTransaction): void {
    const list = this.getCoinTransactions();
    list.unshift(tx);
    this.saveCoinTransactions(list.slice(0, 50));
  },

  resetDemoState(): UserProfile {
    try {
      safeStorage.removeItem(STORAGE_KEYS.PROFILE);
      this.saveProfile(DEFAULT_INITIAL_PROFILE);
      return DEFAULT_INITIAL_PROFILE;
    } catch {
      return DEFAULT_INITIAL_PROFILE;
    }
  },

  getLanguage(): LanguageCode {
    try {
      const lang = safeStorage.getItem(STORAGE_KEYS.LANGUAGE) as LanguageCode;
      return lang === "en" || lang === "am" || lang === "om" ? lang : "en";
    } catch {
      return "en";
    }
  },

  saveLanguage(lang: LanguageCode): void {
    try {
      safeStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
      emitChange(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      log.warn("Failed to save language:", e);
    }
  },

  getAudioEnabled(): boolean {
    return safeStorage.getItem(STORAGE_KEYS.AUDIO_ENABLED) !== "false";
  },

  saveAudioEnabled(enabled: boolean): void {
    safeStorage.setItem(STORAGE_KEYS.AUDIO_ENABLED, enabled ? "true" : "false");
    emitChange(STORAGE_KEYS.AUDIO_ENABLED, enabled);
  },

  getHapticsEnabled(): boolean {
    return safeStorage.getItem(STORAGE_KEYS.HAPTICS_ENABLED) !== "false";
  },

  saveHapticsEnabled(enabled: boolean): void {
    safeStorage.setItem(STORAGE_KEYS.HAPTICS_ENABLED, enabled ? "true" : "false");
    emitChange(STORAGE_KEYS.HAPTICS_ENABLED, enabled);
  },

  getNotificationsEnabled(): boolean {
    return safeStorage.getItem(STORAGE_KEYS.NOTIFS_ENABLED) !== "false";
  },

  saveNotificationsEnabled(enabled: boolean): void {
    safeStorage.setItem(STORAGE_KEYS.NOTIFS_ENABLED, enabled ? "true" : "false");
    emitChange(STORAGE_KEYS.NOTIFS_ENABLED, enabled);
  },

  getLowDataMode(): boolean {
    return safeStorage.getItem(STORAGE_KEYS.LOW_DATA_MODE) === "true";
  },

  saveLowDataMode(enabled: boolean): void {
    safeStorage.setItem(STORAGE_KEYS.LOW_DATA_MODE, enabled ? "true" : "false");
    emitChange(STORAGE_KEYS.LOW_DATA_MODE, enabled);
  },

  getEnergyTransactions(): EnergyTransaction[] {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.ENERGY_TXS);
      if (!stored) {
        this.saveEnergyTransactions(INITIAL_ENERGY_TXS);
        return INITIAL_ENERGY_TXS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_ENERGY_TXS;
    }
  },

  saveEnergyTransactions(txs: EnergyTransaction[]): void {
    try {
      safeStorage.setItem(STORAGE_KEYS.ENERGY_TXS, JSON.stringify(txs));
      emitChange(STORAGE_KEYS.ENERGY_TXS, txs);
    } catch (e) {
      log.warn("Failed to save energy transactions:", e);
    }
  },

  recordEnergyTransaction(tx: EnergyTransaction): void {
    const list = this.getEnergyTransactions();
    list.unshift(tx);
    this.saveEnergyTransactions(list.slice(0, 50));
  },

  getPaymentTransactions(): PaymentTransaction[] {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.PAYMENT_TXS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  savePaymentTransactions(txs: PaymentTransaction[]): void {
    try {
      safeStorage.setItem(STORAGE_KEYS.PAYMENT_TXS, JSON.stringify(txs));
      emitChange(STORAGE_KEYS.PAYMENT_TXS, txs);
    } catch (e) {
      log.warn("Failed to save payment transactions:", e);
    }
  },

  recordPaymentTransaction(tx: PaymentTransaction): void {
    const list = this.getPaymentTransactions();
    const existingIndex = list.findIndex((t) => t.transactionId === tx.transactionId);
    if (existingIndex >= 0) {
      list[existingIndex] = tx;
    } else {
      list.unshift(tx);
    }
    this.savePaymentTransactions(list.slice(0, 50));
  },

  wipeAllData(): UserProfile {
    try {
      safeStorage.clear();
      this.saveProfile(DEFAULT_INITIAL_PROFILE);
      return DEFAULT_INITIAL_PROFILE;
    } catch {
      return DEFAULT_INITIAL_PROFILE;
    }
  },
};
