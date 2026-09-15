/**
 * Hook for managing modal visibility and legal sheet tabs in GAMEON TELE
 */

import { useState, useCallback } from "react";
import { Tournament } from "../types";

export type LegalModalTab = "terms" | "privacy" | "datasafety" | "delete_account";

export function useModalState() {
  const [isEnergyModalOpen, setIsEnergyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isDailyRewardModalOpen, setIsDailyRewardModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Legal & Privacy modal
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalModalTab>("terms");

  const openLegalModal = useCallback((tab: LegalModalTab = "terms") => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  }, []);

  return {
    isEnergyModalOpen,
    setIsEnergyModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    isDailyRewardModalOpen,
    setIsDailyRewardModalOpen,
    selectedTournament,
    setSelectedTournament,
    isLegalModalOpen,
    setIsLegalModalOpen,
    legalModalTab,
    openLegalModal,
  };
}
