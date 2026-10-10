"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/icon";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

const TYPE_ICON: Record<ToastType, IconName> = {
  success: "check",
  error: "alert",
  info: "info",
};

const TYPE_CLASS: Record<ToastType, string> = {
  success: "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]",
  error: "bg-[#fef2f2] border-[#fecaca] text-[#991b1b]",
  info: "bg-accent-100 border-accent-200 text-accent-800",
};

const ToastContext = React.createContext<
  ((message: string, type?: ToastType) => void) | undefined
>(undefined);

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Flags that we're now running in the browser, where document.body
    // exists as a portal target — a genuine sync with that external fact.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (message: string, type: ToastType = "info") => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {mounted
        ? createPortal(
            <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-full max-w-[340px] pointer-events-none">
              {toasts.map((t) => (
                <div
                  key={t.id}
                  role="status"
                  className={cn(
                    "pointer-events-auto flex items-start gap-2.5 px-4 py-3 border rounded-md shadow-md ins-slide-up",
                    TYPE_CLASS[t.type],
                  )}
                >
                  <Icon
                    name={TYPE_ICON[t.type]}
                    size={16}
                    className="mt-0.5 shrink-0"
                  />
                  <p className="flex-1 text-sm font-medium">{t.message}</p>
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    aria-label="Dismiss"
                    className="shrink-0 opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    <Icon name="x" size={14} />
                  </button>
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
