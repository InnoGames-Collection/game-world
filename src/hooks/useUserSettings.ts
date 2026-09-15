/**
 * Hook for user preferences and localization settings in GAMEON TELE
 */

import { useState, useCallback } from "react";
import { LanguageCode } from "../types";
import { StorageService } from "../services/storageService";
import { TRANSLATIONS } from "../utils/translations";

export function useUserSettings() {
  const [language, setLanguage] = useState<LanguageCode>(() => StorageService.getLanguage());
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => StorageService.getAudioEnabled());
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => StorageService.getHapticsEnabled());
  const [notifsEnabled, setNotifsEnabled] = useState<boolean>(() => StorageService.getNotificationsEnabled());
  const [lowDataMode, setLowDataMode] = useState<boolean>(() => StorageService.getLowDataMode());

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const changeLanguage = useCallback((newLang: LanguageCode) => {
    setLanguage(newLang);
    StorageService.saveLanguage(newLang);
  }, []);

  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => {
      const next = !prev;
      StorageService.saveAudioEnabled(next);
      return next;
    });
  }, []);

  const toggleHaptics = useCallback(() => {
    setHapticsEnabled((prev) => {
      const next = !prev;
      StorageService.saveHapticsEnabled(next);
      return next;
    });
  }, []);

  const toggleNotifs = useCallback(() => {
    setNotifsEnabled((prev) => {
      const next = !prev;
      StorageService.saveNotificationsEnabled(next);
      return next;
    });
  }, []);

  const toggleLowDataMode = useCallback(() => {
    setLowDataMode((prev) => {
      const next = !prev;
      StorageService.saveLowDataMode(next);
      return next;
    });
  }, []);

  return {
    language,
    changeLanguage,
    t,
    audioEnabled,
    toggleAudio,
    hapticsEnabled,
    toggleHaptics,
    notifsEnabled,
    toggleNotifs,
    lowDataMode,
    toggleLowDataMode,
  };
}
