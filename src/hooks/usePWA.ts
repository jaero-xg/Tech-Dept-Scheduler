// ==================== PWA HOOK ====================
// Replaces wpa.js — service worker registration + install banner logic

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("[PWA] SW registered:", reg.scope))
          .catch((err) => console.warn("[PWA] SW failed:", err));
      });
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      console.log("[PWA] App installed.");
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const triggerInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log("[PWA] User choice:", outcome);
    setInstallPrompt(null);
  };

  const dismissInstall = () => setInstallPrompt(null);

  return {
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    triggerInstall,
    dismissInstall,
  };
}