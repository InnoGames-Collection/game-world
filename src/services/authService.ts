/**
 * EthioTelecom Authentication Service (Enterprise Edition)
 * Supports Mobile Station International Subscriber Directory Number (MSISDN) login,
 * SMS OTP verification, pluggable authentication adapters, and TeleBirr Direct Connect.
 */

import { UserProfile } from "../types";
import { StorageService } from "./storageService";
import { appConfig } from "../config/appConfig";
import { createLogger } from "../utils/logger";

const log = createLogger("AuthService");

export interface AuthResponse {
  success: boolean;
  message: string;
  profile?: UserProfile;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  demoOtp: string;
}

export interface IAuthProvider {
  requestOtp(phoneNumber: string): Promise<RequestOtpResponse>;
  verifyOtp(phoneNumber: string, otp: string): Promise<AuthResponse>;
  loginWithTeleBirr(): Promise<AuthResponse>;
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
 * Default Simulated Auth Provider with configuration-aware demo OTP gating
 */
class SimulatedAuthProvider implements IAuthProvider {
  async requestOtp(phoneNumber: string): Promise<RequestOtpResponse> {
    const { isValid, normalized } = normalizeEthiopianPhone(phoneNumber);
    if (!isValid) {
      log.warn(`Invalid Ethiopian phone number provided: ${phoneNumber}`);
      return {
        success: false,
        message: "Please enter a valid EthioTelecom phone number starting with 09 or 07.",
        demoOtp: "",
      };
    }

    const demoOtp = appConfig.isDemoMode ? appConfig.demoOtp : "";
    const msg = appConfig.isDemoMode
      ? `SMS Verification code sent to ${normalized}. [Demo OTP: ${demoOtp}]`
      : `SMS Verification code sent to ${normalized}.`;

    log.info(`OTP requested for ${normalized}`);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: msg,
          demoOtp,
        });
      }, 400);
    });
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<AuthResponse> {
    const trimmedOtp = otp.trim();
    const { normalized } = normalizeEthiopianPhone(phoneNumber);

    const isMatch = appConfig.isDemoMode
      ? trimmedOtp === appConfig.demoOtp || trimmedOtp === "123456"
      : trimmedOtp.length === 6;

    if (!isMatch) {
      log.warn(`OTP verification failed for ${phoneNumber}`);
      return {
        success: false,
        message: appConfig.isDemoMode
          ? `Invalid 6-digit verification code. Please use demo code ${appConfig.demoOtp}.`
          : "Invalid 6-digit verification code. Please check your SMS and try again.",
      };
    }

    const current = StorageService.getProfile();
    const updated: UserProfile = {
      ...current,
      phoneNumber: normalized || "0912345678",
      isRegistered: true,
      telebirrLinked: true,
    };

    StorageService.saveProfile(updated);
    log.info(`User ${updated.id} successfully authenticated with ${updated.phoneNumber}`);

    return {
      success: true,
      message: "Successfully authenticated with EthioTelecom.",
      profile: updated,
    };
  }

  async loginWithTeleBirr(): Promise<AuthResponse> {
    const current = StorageService.getProfile();
    const updated: UserProfile = {
      ...current,
      phoneNumber: current.phoneNumber || "0911428890",
      displayName: current.displayName || "EthioTelecom Gamer",
      isRegistered: true,
      telebirrLinked: true,
      telebirrBalance: Math.max(current.telebirrBalance, 250),
    };

    StorageService.saveProfile(updated);
    log.info(`User authenticated via TeleBirr Direct Connect: ${updated.id}`);

    return {
      success: true,
      message: "Connected with TeleBirr SuperApp successfully.",
      profile: updated,
    };
  }

  signOut(): UserProfile {
    log.info("User signed out");
    return StorageService.clearSession();
  }
}

// Active provider instance (pluggable for live production Telebirr REST API)
let activeProvider: IAuthProvider = new SimulatedAuthProvider();

export const AuthService = {
  setProvider(provider: IAuthProvider): void {
    activeProvider = provider;
  },

  requestOtp(phoneNumber: string): Promise<RequestOtpResponse> {
    return activeProvider.requestOtp(phoneNumber);
  },

  verifyOtp(phoneNumber: string, otp: string): Promise<AuthResponse> {
    return activeProvider.verifyOtp(phoneNumber, otp);
  },

  loginWithTeleBirr(): Promise<AuthResponse> {
    return activeProvider.loginWithTeleBirr();
  },

  signOut(): UserProfile {
    return activeProvider.signOut();
  },
};
