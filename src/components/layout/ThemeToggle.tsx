"use client";

import { useEffect, useState } from "react";
import { Icons } from "@/components/ui/Icons";
import { useTheme } from "@/components/providers/ThemeProvider";

/** Dark/light mode toggle button. Gated on mount to avoid hydration mismatch. */
export function ThemeToggle() {
  const { resolvedTheme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-9 shrink-0" aria-hidden="true" />;
  }

  return (
    <button
      onClick={toggle}
      className="shrink-0 rounded-lg p-2 text-[rgb(var(--ayan-muted))] hover:bg-[rgb(var(--ayan-surface))] hover:text-[rgb(var(--ayan-text))]"
      aria-label={
        resolvedTheme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
    >
      {resolvedTheme === "dark" ? (
        <Icons.sun className="h-5 w-5" />
      ) : (
        <Icons.moon className="h-5 w-5" />
      )}
    </button>
  );
}
