/**
 * telebirr Game Center Authentication Service
 * Authenticates players directly via telebirr Game Center credentials
 */

import { UserProfile } from "../types";
import { StorageService } from "./storageService";
import { apiService } from "./apiService";
import { createLogger } from "../utils/logger";

const log = createLogger("AuthService");

export interface AuthResponse {
  success: boolean;
  message: string;
  profile?: UserProfile;
}

export interface IAuthProvider {
  loginWithTeleBirr(phoneNumber?: string, token?: string): Promise<AuthResponse>;
  signOut(): UserProfile;
}

/**
 * Validates and standardizes Ethiopian phone number (MSISDN)
 * Accepted formats: 0912345678, 0712345678, +251912345678, 251912345678
 */
export function normalizeEthiopianPhone(phone: string): { isValid: boolean; normalized: string } {
  const digits = phone.replace(/\D/g, "");
  
  // Format: 2519xxxxxxxx or 2517xxxxxxxx (12 digits)
  if (digits.length === 12 && (digits.startsWith("2519") || digits.startsWith("2517"))) {
    return { isValid: true, normalized: "0" + digits.slice(3) };
  }
  
  // Format: 09xxxxxxxx or 07xxxxxxxx (10 digits)
  if (digits.length === 10 && (digits.startsWith("09") || digits.startsWith("07"))) {
    return { isValid: true, normalized: digits };
  }
  
  // Format: 9xxxxxxxx or 7xxxxxxxx (9 digits)
  if (digits.length === 9 && (digits.startsWith("9") || digits.startsWith("7"))) {
    return { isValid: true, normalized: "0" + digits };
  }
  
  return { isValid: false, normalized: phone };
}

/**
 * Production TeleBirr Game Center Auth Provider
 * Connects directly to backend API and PostgreSQL
 */
class TelebirrAuthProvider implements IAuthProvider {
  async loginWithTeleBirr(phoneNumber?: string, token?: string): Promise<AuthResponse> {
    log.info(`Authenticating with TeleBirr Game Center: ${phoneNumber || 'Webview Handshake'}`);
    
    // Call real backend API
    const profile = await apiService.loginWithTelebirr(phoneNumber, token);

    if (profile) {
      StorageService.saveProfile(profile);
      log.info(`Player authenticated via telebirr: ${profile.displayName} (${profile.phoneNumber})`);
      return {
        success: true,
        message: 'Successfully authenticated with telebirr Game Center.',
        profile,
      };
    }

    // Fallback: If network offline, read cached profile
    const existing = StorageService.getProfile();
    if (existing && existing.isRegistered) {
      return {
        success: true,
        message: 'Operating with cached telebirr session.',
        profile: existing,
      };
    }

    return {
      success: false,
      message: 'Failed to authenticate with telebirr Game Center. Please reload.',
    };
  }

  signOut(): UserProfile {
    log.info("Player signed out");
    apiService.clearToken();
    return StorageService.clearSession();
  }
}

let activeProvider: IAuthProvider = new TelebirrAuthProvider();

export const AuthService = {
  setProvider(provider: IAuthProvider): void {
    activeProvider = provider;
  },

  loginWithTeleBirr(phoneNumber?: string, token?: string): Promise<AuthResponse> {
    return activeProvider.loginWithTeleBirr(phoneNumber, token);
  },

  signOut(): UserProfile {
    return activeProvider.signOut();
  },
};
