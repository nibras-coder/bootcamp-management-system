import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);

  const showToast = useCallback((type, message, title) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, type, message, title }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const toast = {
    success: (msg, title) => showToast("success", msg, title),
    error: (msg, title) => showToast("error", msg, title),
    warning: (msg, title) => showToast("warning", msg, title),
    info: (msg, title) => showToast("info", msg, title),
  };

  const confirm = useCallback(({ title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    return new Promise((resolve) => {
      setConfirmModal({
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          setConfirmModal(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmModal(null);
          resolve(false);
        },
      });
    });
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[999999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-3">
        {toasts.map((t) => {
          const typeStyles = {
            success: {
              border: "border-teal-500/30",
              bg: "bg-white dark:bg-[#0a0a0a]",
              icon: <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />,
              accent: "bg-teal-500",
            },
            error: {
              border: "border-red-500/30",
              bg: "bg-white dark:bg-[#0a0a0a]",
              icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />,
              accent: "bg-red-500",
            },
            warning: {
              border: "border-amber-500/30",
              bg: "bg-white dark:bg-[#0a0a0a]",
              icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
              accent: "bg-amber-500",
            },
            info: {
              border: "border-blue-500/30",
              bg: "bg-white dark:bg-[#0a0a0a]",
              icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />,
              accent: "bg-blue-500",
            },
          };

          const current = typeStyles[t.type] || typeStyles.info;

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-3 duration-200 ${current.bg} ${current.border}`}
            >
              {current.icon}
              <div className="flex-1 min-w-0 pr-2">
                {t.title && (
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight mb-1">
                    {t.title}
                  </h4>
                )}
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                  {t.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal Popup */}
      {confirmModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  confirmModal.type === "danger"
                    ? "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400"
                    : "bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400"
                }`}
              >
                {confirmModal.type === "danger" ? (
                  <AlertTriangle size={20} />
                ) : (
                  <Info size={20} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {confirmModal.title || "Confirm Action"}
                </h3>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={confirmModal.onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                {confirmModal.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors ${
                  confirmModal.type === "danger"
                    ? "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20"
                    : "bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20"
                }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback safe dummy
    return {
      toast: {
        success: (msg) => console.log(msg),
        error: (msg) => console.error(msg),
        warning: (msg) => console.warn(msg),
        info: (msg) => console.info(msg),
      },
      confirm: async () => true,
    };
  }
  return context;
}
