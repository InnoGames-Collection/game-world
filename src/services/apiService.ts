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

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('goplay_access_token');
    }
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
   * Authenticate via Telebirr Game Center and load real PostgreSQL UserProfile
   */
  async loginWithTelebirr(phoneNumber?: string, token?: string): Promise<UserProfile | null> {
    const res = await this.request<{
      success: boolean;
      profile: UserProfile;
      tokens?: { accessToken: string; refreshToken: string };
    }>('/auth/telebirr-login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, token }),
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
    const res = await this.request<{ success: boolean; profile: UserProfile }>('/auth/me');
    if (res?.success && res.profile) {
      return res.profile;
    }
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
   * Enter a tournament (deducts 2 coins on backend, grants tournament play attempt)
   */
  async enterTournament(tournamentId: string): Promise<{ success: boolean; message: string; attemptsLeft: number } | null> {
    return this.request<{ success: boolean; message: string; attemptsLeft: number }>(`/tournaments/${tournamentId}/enter`, {
      method: 'POST',
    });
  }

  /**
   * Submit authoritative game score with anti-cheat round token
   */
  async submitScore(
    gameId: string,
    rawScore: number,
    durationSeconds: number,
    tournamentId?: string
  ): Promise<{ success: boolean; score?: number; message?: string; updatedProfile?: UserProfile } | null> {
    // 1. Request server round token
    const sessionRes = await this.request<{ token: string }>('/game/session/start', {
      method: 'POST',
      body: JSON.stringify({ gameId, tournamentId }),
    });

    if (!sessionRes?.token) {
      console.error('[ApiService] Failed to obtain authoritative game session token from server');
      return null;
    }

    // 2. Submit validated score with server token
    return this.request<{ success: boolean; score?: number; message?: string; updatedProfile?: UserProfile }>(
      '/game/session/submit',
      {
        method: 'POST',
        body: JSON.stringify({
          gameId,
          rawScore,
          durationSeconds: Math.max(durationSeconds, 2),
          token: sessionRes.token,
          tournamentId,
        }),
      }
    );
  }

  /**
   * Purchase GoPlay Coins via Telebirr (10 coins for 10 ETB, 30 for 30 ETB, 50 for 50 ETB)
   */
  async buyCoins(packageId: 'COIN_PACK_10' | 'COIN_PACK_30' | 'COIN_PACK_50' = 'COIN_PACK_10'): Promise<{ success: boolean; checkoutUrl?: string; message?: string }> {
    const res = await this.request<{
      status: string;
      checkoutUrl?: string;
      message: string;
    }>('/payments/process', {
      method: 'POST',
      body: JSON.stringify({
        packageId,
        itemType: 'COIN_PACK',
      }),
    });

    return {
      success: res?.status === 'SUCCESS' || res?.status === 'PENDING',
      checkoutUrl: res?.checkoutUrl,
      message: res?.message,
    };
  }

  /**
   * Activate VIP On-Demand Subscription via Telebirr (Daily 10 ETB, Weekly 25 ETB, Monthly 50 ETB)
   */
  async activateSubscription(plan: 'daily' | 'weekly' | 'monthly'): Promise<{ success: boolean; checkoutUrl?: string; message?: string }> {
    const res = await this.request<{
      status: string;
      checkoutUrl?: string;
      message: string;
    }>('/payments/process', {
      method: 'POST',
      body: JSON.stringify({
        itemType: 'VIP_SUBSCRIPTION',
        plan,
      }),
    });

    return {
      success: res?.status === 'SUCCESS' || res?.status === 'PENDING',
      checkoutUrl: res?.checkoutUrl,
      message: res?.message,
    };
  }
}

export const apiService = new ApiService();
