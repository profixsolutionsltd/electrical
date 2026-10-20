"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Icons } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/**
 * Lightweight toast notification system. Provides success/error/info feedback
 * for form submissions and actions without a third-party dependency.
 */

type ToastTone = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = ++counter;
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => remove(id), 5000);
    },
    [remove],
  );

  const value: ToastContextValue = {
    toast,
    success: (title, description) => toast({ tone: "success", title, description }),
    error: (title, description) => toast({ tone: "error", title, description }),
    info: (title, description) => toast({ tone: "info", title, description }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const toneStyles: Record<ToastTone, string> = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
    info: "border-brand-200 bg-brand-50 text-brand-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  };
  const iconTone: Record<ToastTone, string> = {
    success: "text-emerald-600",
    error: "text-red-600",
    info: "text-brand-600",
    warning: "text-amber-600",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lift animate-slide-in-right",
        "bg-[rgb(var(--ayan-card))]",
        toneStyles[toast.tone],
      )}
      role="status"
    >
      <span className={cn("mt-0.5", iconTone[toast.tone])}>
        {toast.tone === "success" ? (
          <Icons.checkCircle className="h-5 w-5" />
        ) : toast.tone === "error" ? (
          <Icons.alert className="h-5 w-5" />
        ) : (
          <Icons.info className="h-5 w-5" />
        )}
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-sm opacity-80">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="rounded-md p-1 opacity-60 hover:opacity-100"
        aria-label="Dismiss notification"
      >
        <Icons.close className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
