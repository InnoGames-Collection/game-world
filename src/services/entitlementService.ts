/**
 * GameON Tele - Customer Entitlement & Access Control Service
 * 
 * Manages game entitlement logic:
 * - FREE: immediate unrestricted access
 * - COIN: access authorized via coin deduction (session pass)
 * - SUBSCRIPTION: access authorized via telebirr balance billing
 * - Tracks expiration and persists state in local client storage.
 */

import { UserProfile, GameEntitlement } from '../types';
import { CatalogGame, GameCatalog } from './gameCatalog';
import { StorageService } from './storageService';

export type { GameEntitlement };

const ENTITLEMENTS_STORAGE_KEY = 'gameon_tele_entitlements_v1';
const RECENTLY_PLAYED_KEY = 'gameon_tele_recent_games_v1';

export const EntitlementService = {
  getEntitlements(): Record<string, GameEntitlement> {
    try {
      const stored = localStorage.getItem(ENTITLEMENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  saveEntitlements(entitlements: Record<string, GameEntitlement>): void {
    try {
      localStorage.setItem(ENTITLEMENTS_STORAGE_KEY, JSON.stringify(entitlements));
    } catch (e) {
      console.warn('[EntitlementService] Failed to save entitlements', e);
    }
  },

  /**
   * Evaluates if the authenticated telebirr customer currently holds valid access
   */
  hasValidAccess(
    game: CatalogGame,
    profile?: UserProfile
  ): { hasAccess: boolean; entitlement?: GameEntitlement; isExpired?: boolean } {
    // 1. FREE games always have instant access
    if (game.isFree || game.accessType === 'FREE') {
      return { hasAccess: true };
    }

    // 2. Global active All-Access subscription covers all games
    if (profile?.subscription?.isActive) {
      if (!profile.subscription.expiresAt || profile.subscription.expiresAt > Date.now()) {
        return { hasAccess: true };
      }
    }

    const entitlements = this.getEntitlements();
    const existing = entitlements[game.gameId];

    if (!existing) {
      return { hasAccess: false };
    }

    // 3. Check expiration for subscription or timed passes
    if (existing.expiresAt) {
      const now = Date.now();
      if (now > existing.expiresAt) {
        return { hasAccess: false, isExpired: true, entitlement: existing };
      }
    }

    return { hasAccess: true, entitlement: existing };
  },

  /**
   * Check access by game or game ID
   */
  checkAccess(
    gameOrId: CatalogGame | string,
    profile?: UserProfile
  ): { hasAccess: boolean; entitlement?: GameEntitlement; isExpired?: boolean } {
    let game: CatalogGame | undefined;
    if (typeof gameOrId === 'string') {
      game = GameCatalog.getById(gameOrId);
    } else {
      game = gameOrId;
    }

    if (!game) {
      return { hasAccess: true }; // Default fallback for unknown game
    }

    return this.hasValidAccess(game, profile);
  },

  /**
   * Authorizes a coin-required game entry
   */
  grantCoinAccess(
    game: CatalogGame,
    profile: UserProfile
  ): { success: boolean; updatedProfile: UserProfile; error?: string; entitlement?: GameEntitlement } {
    const cost = game.coinCost || 10;
    if (profile.coins < cost) {
      return {
        success: false,
        updatedProfile: profile,
        error: `Insufficient coins. You have ${profile.coins} coins, but ${cost} coins are required.`,
      };
    }

    const updatedProfile: UserProfile = {
      ...profile,
      coins: profile.coins - cost,
      matchesPlayed: (profile.matchesPlayed || 0) + 1,
    };
    StorageService.saveProfile(updatedProfile);

    // Record session entitlement (valid for current session / 2 hours)
    const entitlement: GameEntitlement = {
      gameId: game.gameId,
      gameName: game.gameName,
      accessType: 'COIN',
      grantedAt: Date.now(),
      expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2-hour session pass
      transactionRef: 'TB_COIN_' + Date.now().toString(36).toUpperCase(),
    };

    const all = this.getEntitlements();
    all[game.gameId] = entitlement;
    this.saveEntitlements(all);

    this.recordRecentlyPlayed(game.gameId);

    return {
      success: true,
      updatedProfile,
      entitlement,
    };
  },

  /**
   * Authorizes a subscription-based game access via telebirr balance
   */
  grantSubscriptionAccess(
    game: CatalogGame,
    period: 'daily' | 'weekly' | 'monthly',
    priceETB: number,
    profile: UserProfile
  ): { success: boolean; updatedProfile: UserProfile; error?: string; entitlement?: GameEntitlement } {
    if (profile.telebirrBalance < priceETB) {
      return {
        success: false,
        updatedProfile: profile,
        error: `Insufficient telebirr balance. Available: ${profile.telebirrBalance.toFixed(2)} ETB, Required: ${priceETB.toFixed(2)} ETB.`,
      };
    }

    // Calculate duration
    let durationMs = 24 * 60 * 60 * 1000; // daily
    if (period === 'weekly') durationMs = 7 * 24 * 60 * 60 * 1000;
    if (period === 'monthly') durationMs = 30 * 24 * 60 * 60 * 1000;

    const updatedProfile: UserProfile = {
      ...profile,
      telebirrBalance: Math.max(0, profile.telebirrBalance - priceETB),
    };
    StorageService.saveProfile(updatedProfile);

    const entitlement: GameEntitlement = {
      gameId: game.gameId,
      gameName: game.gameName,
      accessType: 'SUBSCRIPTION',
      billingPeriod: period,
      grantedAt: Date.now(),
      expiresAt: Date.now() + durationMs,
      transactionRef: 'TB_SUB_' + Date.now().toString(36).toUpperCase(),
    };

    const all = this.getEntitlements();
    all[game.gameId] = entitlement;
    this.saveEntitlements(all);

    this.recordRecentlyPlayed(game.gameId);

    return {
      success: true,
      updatedProfile,
      entitlement,
    };
  },

  /**
   * Record a game into the user's Recently Played history
   */
  recordRecentlyPlayed(gameId: string): void {
    try {
      const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
      let list: string[] = stored ? JSON.parse(stored) : [];
      list = [gameId, ...list.filter((id) => id !== gameId)].slice(0, 12);
      localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Recently played store error', e);
    }
  },

  recordGamePlayed(gameId: string): void {
    this.recordRecentlyPlayed(gameId);
  },

  getRecentlyPlayedIds(): string[] {
    try {
      const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  getActiveSubscriptionsList(): { entitlement: GameEntitlement; gameId: string; expiresFormatted: string }[] {
    const all: Record<string, GameEntitlement> = this.getEntitlements();
    const now = Date.now();
    const results: { entitlement: GameEntitlement; gameId: string; expiresFormatted: string }[] = [];

    Object.entries(all).forEach(([gameId, ent]) => {
      const typedEnt = ent as GameEntitlement;
      if (typedEnt && typedEnt.accessType === 'SUBSCRIPTION' && typedEnt.expiresAt && typedEnt.expiresAt > now) {
        const remainingHours = Math.ceil((typedEnt.expiresAt - now) / (1000 * 60 * 60));
        let expiresFormatted = `${remainingHours} hours remaining`;
        if (remainingHours > 24) {
          expiresFormatted = `${Math.ceil(remainingHours / 24)} days remaining`;
        }
        results.push({
          entitlement: typedEnt,
          gameId,
          expiresFormatted,
        });
      }
    });

    return results;
  },
};
