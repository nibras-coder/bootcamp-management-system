import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Download,
  Smartphone,
  CheckCircle2,
  X,
  Share2,
  PlusSquare,
  MoreVertical,
  Monitor,
  Zap,
  ShieldCheck,
} from "lucide-react";

export default function PWAInstallButton() {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState(
    () => window.deferredPWAInstallPrompt || null
  );
  const [showModal, setShowModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // Check if the app is currently running in standalone (installed) mode
  useEffect(() => {
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
      }
    };

    checkStandalone();
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleMediaChange = (e) => {
      if (e.matches) setIsInstalled(true);
    };
    mediaQuery.addEventListener?.("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener?.("change", handleMediaChange);
    };
  }, []);

  // Listen for prompt events and global triggers
  useEffect(() => {
    const handlePrompt = (e) => {
      e.preventDefault();
      window.deferredPWAInstallPrompt = e;
      setDeferredPrompt(e);
    };

    const handlePromptAvailable = () => {
      if (window.deferredPWAInstallPrompt) {
        setDeferredPrompt(window.deferredPWAInstallPrompt);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setJustInstalled(true);
      setDeferredPrompt(null);
      window.deferredPWAInstallPrompt = null;
      setShowModal(false);
    };

    const handleExternalOpen = () => {
      setShowModal(true);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("pwa-prompt-available", handlePromptAvailable);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("open-pwa-install", handleExternalOpen);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("pwa-prompt-available", handlePromptAvailable);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("open-pwa-install", handleExternalOpen);
    };
  }, []);

  const handleInstallClick = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleTriggerNativeInstall = useCallback(async () => {
    const promptEvent = deferredPrompt || window.deferredPWAInstallPrompt;
    if (!promptEvent) return;

    setInstalling(true);
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setJustInstalled(true);
        setDeferredPrompt(null);
        window.deferredPWAInstallPrompt = null;
        setShowModal(false);
      }
    } catch (err) {
      console.error("PWA install error:", err);
    } finally {
      setInstalling(false);
    }
  }, [deferredPrompt]);

  // Don't render floating pill if already running inside the installed standalone PWA app
  if (isInstalled && !justInstalled) return null;

  // Determine if the current page has a desktop fixed left sidebar
  const isDashboardPage =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/student-dashboard") ||
    location.pathname.startsWith("/mentor-dashboard") ||
    location.pathname.startsWith("/apply") ||
    location.pathname.startsWith("/applications") ||
    [
      "/my-students",
      "/communities",
      "/attendance",
      "/progress",
      "/assignments",
      "/grading",
      "/announcements",
      "/resources",
      "/profile",
      "/settings",
    ].includes(location.pathname);

  // Detect platform/browser for dynamic installation instructions
  const getDevicePlatform = () => {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isFirefox = /Firefox|FxiOS/i.test(ua);
    const isEdge = /Edg/i.test(ua);

    if (isIOS) {
      return {
        type: "ios",
        name: "iOS (iPhone/iPad)",
        icon: Smartphone,
        steps: [
          {
            icon: Share2,
            title: "Tap the Share icon",
            desc: "In Safari's bottom menu bar, tap the Share icon (square with upward arrow).",
          },
          {
            icon: PlusSquare,
            title: "Select 'Add to Home Screen'",
            desc: "Scroll down the share menu options and tap 'Add to Home Screen'.",
          },
          {
            icon: CheckCircle2,
            title: "Confirm 'Add'",
            desc: "Tap 'Add' in the top-right corner. The Bootcamp app will appear on your Home Screen.",
          },
        ],
      };
    }

    if (isAndroid) {
      return {
        type: "android",
        name: "Android",
        icon: Smartphone,
        steps: [
          {
            icon: MoreVertical,
            title: "Open Browser Menu",
            desc: "Tap the three-dots menu icon at the top-right corner of your browser.",
          },
          {
            icon: Download,
            title: "Select 'Install app' or 'Add to Home Screen'",
            desc: "Choose the install or add to home screen option from the list.",
          },
          {
            icon: CheckCircle2,
            title: "Confirm Installation",
            desc: "Tap 'Install' in the prompt to add the application to your device.",
          },
        ],
      };
    }

    if (isFirefox) {
      return {
        type: "firefox",
        name: "Firefox Browser",
        icon: Monitor,
        steps: [
          {
            icon: MoreVertical,
            title: "Open Firefox Menu",
            desc: "Click the three dots or menu button in Firefox.",
          },
          {
            icon: Download,
            title: "Select 'Install' / 'Add to Home Screen'",
            desc: "Click 'Install ASTU MSJ Bootcamp' from the options.",
          },
          {
            icon: CheckCircle2,
            title: "Ready to Launch",
            desc: "Launch directly from your desktop or app menu anytime.",
          },
        ],
      };
    }

    // Default Desktop (Chrome / Edge / Chromium)
    return {
      type: "desktop",
      name: isEdge ? "Microsoft Edge" : "Desktop Browser",
      icon: Monitor,
      steps: [
        {
          icon: Download,
          title: "Click Install Icon in Address Bar",
          desc: "Look for the install computer/arrow icon on the right side of the address bar.",
        },
        {
          icon: CheckCircle2,
          title: "Click 'Install'",
          desc: "Confirm the prompt to install ASTU MSJ Bootcamp as a standalone desktop app.",
        },
        {
          icon: Zap,
          title: "Fast Launch",
          desc: "Open quickly from your Start Menu, Taskbar, or Applications folder.",
        },
      ],
    };
  };

  const platformInfo = getDevicePlatform();
  const hasNativePrompt = Boolean(deferredPrompt || window.deferredPWAInstallPrompt);

  return (
    <>
      {/* ── Fixed Floating Bottom-Left Download App Button ── */}
      <div
        className={`fixed bottom-5 left-5 ${
          isDashboardPage ? "md:left-[260px]" : "md:left-5"
        } z-[9999] flex items-center group transition-all duration-300 pointer-events-auto`}
      >
        <button
          onClick={handleInstallClick}
          type="button"
          id="pwa-download-app-btn"
          aria-label="Download ASTU MSJ Bootcamp App"
          className="relative flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-800 hover:via-teal-700 hover:to-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-full shadow-[0_8px_25px_rgba(13,148,136,0.45)] hover:shadow-[0_12px_32px_rgba(13,148,136,0.65)] border border-white/20 backdrop-blur-md transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
        >
          {/* Subtle glowing ring animation */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>

          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Download size={14} className="text-white group-hover:animate-bounce" />
          </div>

          <span className="font-bold tracking-wide shadow-sm">Download App</span>
        </button>
      </div>

      {/* ── Install Modal / Guide Dialog ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-[#0e1626] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden text-gray-900 dark:text-gray-100"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Background Decorative Glow */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 mb-5">
              <img
                src="/icons/icon-192x192.png"
                alt="ASTU MSJ Bootcamp"
                className="w-14 h-14 rounded-2xl object-cover shadow-md border border-teal-500/20 flex-shrink-0 bg-teal-900"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Install MSJ Bootcamp
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    PWA App
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Install the official ASTU MSJ Bootcamp application on your device for fast access, offline mode, and instant notifications.
                </p>
              </div>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-3 gap-2.5 mb-5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col items-center text-center p-1.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-1.5">
                  <Zap size={16} />
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Instant Load
                </span>
                <span className="text-[10px] text-gray-400">Zero lag startup</span>
              </div>
              <div className="flex flex-col items-center text-center p-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-1.5">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Offline Ready
                </span>
                <span className="text-[10px] text-gray-400">Cached materials</span>
              </div>
              <div className="flex flex-col items-center text-center p-1.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mb-1.5">
                  <Smartphone size={16} />
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Native Feel
                </span>
                <span className="text-[10px] text-gray-400">Full screen view</span>
              </div>
            </div>

            {/* Direct Native Install Button (if browser prompt is ready) */}
            {hasNativePrompt ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleTriggerNativeInstall}
                  disabled={installing}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm shadow-lg shadow-teal-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download size={18} />
                  <span>{installing ? "Installing..." : "Install Now"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            ) : (
              /* Step-by-step instructions tailored to device */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    How to install on {platformInfo.name}
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {platformInfo.steps.map((step, idx) => {
                    const StepIcon = step.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800"
                      >
                        <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <StepIcon size={14} className="text-teal-600 dark:text-teal-400" />
                            {step.title}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    Got It
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
