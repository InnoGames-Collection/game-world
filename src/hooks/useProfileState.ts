/**
 * Hook for managing UserProfile and Energy recharge lifecycle in GAMEON TELE
 */

import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "../types";
import { StorageService } from "../services/storageService";
import { appConfig } from "../config/appConfig";
import { apiService } from "../services/apiService";

export function useProfileState() {
  const [profile, setProfileState] = useState<UserProfile>(() => StorageService.getProfile());

  const setProfile = useCallback((updater: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    setProfileState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      StorageService.saveProfile(next);
      return next;
    });
  }, []);

  // Synchronize profile with live PostgreSQL database on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const msisdn = params.get('msisdn') || profile.phoneNumber || '0911234567';

      apiService.loginWithTelebirr(msisdn).then((remoteProfile) => {
        if (remoteProfile) {
          setProfileState((prev) => {
            const merged: UserProfile = {
              ...prev,
              ...remoteProfile,
              coins: remoteProfile.coins ?? prev.coins,
              telebirrBalance: remoteProfile.telebirrBalance ?? prev.telebirrBalance,
              energy: remoteProfile.energy ?? prev.energy,
              level: remoteProfile.level ?? prev.level,
              subscription: remoteProfile.subscription ?? prev.subscription,
              highScores: { ...prev.highScores, ...(remoteProfile.highScores || {}) },
            };
            StorageService.saveProfile(merged);
            return merged;
          });
        }
      }).catch(() => null);
    } catch {
      // Graceful fallback to cached state
    }
  }, []);

  // Energy auto-refill interval based on configuration
  useEffect(() => {
    const interval = setInterval(() => {
      setProfileState((curr) => {
        const updated = StorageService.recalculateEnergy(curr);
        return updated;
      });
    }, appConfig.energyCheckIntervalMs);

    return () => clearInterval(interval);
  }, []);

  return {
    profile,
    setProfile,
  };
}
