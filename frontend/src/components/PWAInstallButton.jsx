import React, { useState, useEffect, useCallback } from "react";

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  // Check if the app is already in standalone mode (installed)
  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }
  }, []);

  // Listen for the beforeinstallprompt event
  useEffect(() => {
    const handler = (e) => {
      // Prevent the default mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful installation
    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setCanInstall(false);
      setShowDialog(false);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstallClick = useCallback(() => {
    if (deferredPrompt) {
      setShowDialog(true);
    } else {
      // Browser doesn't support direct install — show fallback
      setShowFallback(true);
    }
  }, [deferredPrompt]);

  const handleConfirmInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowDialog(false);
  }, [deferredPrompt]);

  const handleCancel = useCallback(() => {
    setShowDialog(false);
  }, []);

  const handleCloseFallback = useCallback(() => {
    setShowFallback(false);
  }, []);

  // Don't render anything if already installed
  if (isInstalled) return null;

  // Detect browser for fallback instructions
  const getBrowserInstructions = () => {
    const ua = navigator.userAgent;
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
      return {
        browser: "Safari",
        steps: [
          'Tap the Share button (square with arrow) at the bottom of the screen',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to confirm',
        ],
      };
    }
    if (/Firefox/i.test(ua)) {
      return {
        browser: "Firefox",
        steps: [
          "Tap the menu button (three dots)",
          'Select "Install" or "Add to Home Screen"',
          "Confirm the installation",
        ],
      };
    }
    return {
      browser: "your browser",
      steps: [
        "Open the browser menu (three dots)",
        'Look for "Install App" or "Add to Home Screen"',
        "Follow the prompts to install",
      ],
    };
  };

  return (
    <>
      {/* ── Fixed Install Button ── */}
      <button
        onClick={handleInstallClick}
        aria-label="Install app"
        id="pwa-install-button"
        className="fixed bottom-8 left-8 z-50 flex items-center gap-3 px-6 py-3.5 bg-teal-600/90 hover:bg-teal-700/90 dark:bg-teal-500/90 dark:hover:bg-teal-600/90 backdrop-blur-md text-white font-semibold rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(13,148,136,0.3)] transition-all duration-300 hover:-translate-y-1 group border border-teal-500/30"
      >
        <span className="text-xl group-hover:scale-110 transition-transform duration-300">📱</span>
        <span>Download App</span>
      </button>

      {/* ── Confirmation Dialog ── */}
      {showDialog && (
        <div className="pwa-dialog-overlay" onClick={handleCancel}>
          <div
            className="pwa-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-dialog-title"
          >
            <div className="pwa-dialog__icon-wrapper">
              <img
                src="/icons/icon-192x192.png"
                alt="ASTU MSJ Bootcamp"
                className="pwa-dialog__app-icon"
              />
            </div>
            <h3 id="pwa-dialog-title" className="pwa-dialog__title">
              Do you want to install the app?
            </h3>
            <p className="pwa-dialog__desc">
              Install ASTU MSJ Bootcamp for quick access, offline support, and a
              native app experience.
            </p>
            <div className="pwa-dialog__actions">
              <button
                className="pwa-dialog__btn pwa-dialog__btn--cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="pwa-dialog__btn pwa-dialog__btn--install"
                onClick={handleConfirmInstall}
              >
                Yes, Install
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fallback Instructions Dialog ── */}
      {showFallback && (
        <div className="pwa-dialog-overlay" onClick={handleCloseFallback}>
          <div
            className="pwa-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-fallback-title"
          >
            <div className="pwa-dialog__icon-wrapper">
              <span className="pwa-dialog__fallback-icon">ℹ️</span>
            </div>
            <h3 id="pwa-fallback-title" className="pwa-dialog__title">
              Install manually
            </h3>
            <p className="pwa-dialog__desc">
              Your browser ({getBrowserInstructions().browser}) requires manual
              installation. Follow these steps:
            </p>
            <ol className="pwa-dialog__steps">
              {getBrowserInstructions().steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <div className="pwa-dialog__actions">
              <button
                className="pwa-dialog__btn pwa-dialog__btn--install"
                onClick={handleCloseFallback}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
