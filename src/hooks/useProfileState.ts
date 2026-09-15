/**
 * Hook for managing UserProfile and Energy recharge lifecycle in GAMEON TELE
 */

import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "../types";
import { StorageService } from "../services/storageService";
import { appConfig } from "../config/appConfig";

export function useProfileState() {
  const [profile, setProfileState] = useState<UserProfile>(() => StorageService.getProfile());

  const setProfile = useCallback((updater: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    setProfileState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      StorageService.saveProfile(next);
      return next;
    });
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
