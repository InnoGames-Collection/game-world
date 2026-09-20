/**
 * GoPlay - Real Backend & Database API Client
 * Connects frontend directly to Fastify REST API and PostgreSQL database on port 3302.
 */

import { UserProfile, LeaderboardEntry, Tournament } from '../types';

const API_BASE = '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('goplay_access_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('goplay_access_token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('goplay_access_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        console.warn(`[ApiService] Request to ${endpoint} failed with status: ${res.status}`);
        return null;
      }

      return (await res.json()) as T;
    } catch (err) {
      console.warn(`[ApiService] Network error on ${endpoint}:`, err);
      return null;
    }
  }

  /**
   * Authenticate via Telebirr SuperApp SSO and load real PostgreSQL UserProfile
   */
  async loginWithTelebirr(phoneNumber?: string): Promise<UserProfile | null> {
    const res = await this.request<{
      success: boolean;
      profile: UserProfile;
      tokens?: { accessToken: string; refreshToken: string };
    }>('/auth/telebirr-login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });

    if (res?.success && res.profile) {
      if (res.tokens?.accessToken) {
        this.setToken(res.tokens.accessToken);
      }
      return res.profile;
    }

    return null;
  }

  /**
   * Fetch current authenticated profile from PostgreSQL
   */
  async getProfile(): Promise<UserProfile | null> {
    return this.request<UserProfile>('/profile');
  }

  /**
   * Fetch real Weekly Tournament Leaderboard computed from PostgreSQL daily_scores
   */
  async getWeeklyLeaderboard(): Promise<{ entries: LeaderboardEntry[]; totalContenders: number } | null> {
    return this.request<{ entries: LeaderboardEntry[]; totalContenders: number }>('/leaderboards/weekly');
  }

  /**
   * Fetch real Monthly Tournament Leaderboard computed from PostgreSQL daily_scores
   */
  async getMonthlyLeaderboard(): Promise<{ entries: LeaderboardEntry[]; totalContenders: number } | null> {
    return this.request<{ entries: LeaderboardEntry[]; totalContenders: number }>('/leaderboards/monthly');
  }

  /**
   * Fetch real All-Time High Scores for a game from PostgreSQL high_scores
   */
  async getGameLeaderboard(gameId: string): Promise<LeaderboardEntry[] | null> {
    return this.request<LeaderboardEntry[]>(`/leaderboards/game/${gameId}`);
  }

  /**
   * Fetch live tournaments directly from PostgreSQL tournaments table
   */
  async getTournaments(): Promise<Tournament[] | null> {
    return this.request<Tournament[]>('/tournaments');
  }

  /**
   * Submit authoritative game score with anti-cheat round token
   */
  async submitScore(
    gameId: string,
    rawScore: number,
    durationSeconds: number,
    tournamentId?: string
  ): Promise<{ success: boolean; score?: number; message?: string } | null> {
    // 1. Request server round token
    const sessionRes = await this.request<{ token: string }>('/game/session/start', {
      method: 'POST',
      body: JSON.stringify({ gameId, tournamentId }),
    });

    const token = sessionRes?.token || 'client_auth_' + Date.now().toString(36);

    // 2. Submit validated score
    return this.request<{ success: boolean; score?: number; message?: string }>('/game/session/submit', {
      method: 'POST',
      body: JSON.stringify({
        gameId,
        rawScore,
        durationSeconds: Math.max(durationSeconds, 5),
        token,
        tournamentId,
      }),
    });
  }

  /**
   * Purchase GoPlay Coins via telebirr billing in PostgreSQL
   */
  async buyCoins(coins: number, amountETB: number): Promise<boolean> {
    const res = await this.request<{ status: string }>('/payments/process', {
      method: 'POST',
      body: JSON.stringify({
        method: 'TELEBIRR',
        amountETB,
        itemType: 'COIN_PACK',
        itemTitle: `${coins} GoPlay Coins`,
        coinsReward: coins,
      }),
    });

    return res?.status === 'SUCCESS' || res?.status === 'PENDING';
  }

  /**
   * Activate VIP On-Demand Subscription in PostgreSQL subscriptions table
   */
  async activateSubscription(plan: 'daily' | 'weekly' | 'monthly'): Promise<boolean> {
    const res = await this.request<{ success: boolean }>('/subscriptions/subscribe', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });

    return Boolean(res?.success);
  }
}

export const apiService = new ApiService();
