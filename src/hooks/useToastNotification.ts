/**
 * Hook for managing toast notifications in GAMEON TELE
 */

import { useState, useCallback } from "react";
import { ToastMessage } from "../types";
import { appConfig } from "../config/appConfig";

export function useToastNotification() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: ToastMessage["type"], title: string, description?: string) => {
    const id = "toast_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, appConfig.toastTimeoutMs);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    dismissToast,
  };
}
