"use client";

import Link from "next/link";
import { Icons } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/** Booking journey header with the AYAN logo, help line and an exit link. */
export function WizardHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="border-b border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-bg))]">
      <div className="ayan-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8" />
          <span className="font-display text-lg font-extrabold text-[rgb(var(--ayan-text))]">
            AYAN
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-[rgb(var(--ayan-muted))] md:inline">
            Need help?{" "}
            <a
              href="tel:+442080001234"
              className="font-semibold text-[rgb(var(--ayan-text))] hover:text-brand-600"
            >
              020 8000 1234
            </a>
          </span>
          <Link
            href={signedIn ? "/dashboard" : "/"}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[rgb(var(--ayan-muted))] transition-colors hover:text-brand-600"
          >
            <Icons.arrowLeft className="h-4 w-4" />
            Save &amp; exit
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Step progress indicator, mirroring the reference journey: numbered pills
 * joined by a line, with the completed steps clickable so the customer can go
 * back without losing their answers.
 */
export function StepIndicator({
  current,
  steps,
  onGoTo,
}: {
  current: number;
  steps: { label: string; short: string }[];
  onGoTo: (i: number) => void;
}) {
  return (
    <nav aria-label="Booking progress">
      <ol className="flex items-center">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={s.label}
              className={cn("flex items-center", i < steps.length - 1 && "flex-1")}
            >
              <button
                type="button"
                onClick={() => i < current && onGoTo(i)}
                disabled={i > current}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm font-medium transition-colors",
                  active && "text-brand-700 dark:text-brand-300",
                  done && "text-[rgb(var(--ayan-muted))] hover:text-brand-600",
                  i > current && "text-[rgb(var(--ayan-muted))] opacity-50",
                )}
                aria-current={active ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    active && "bg-brand-600 text-white",
                    done && "bg-emerald-500 text-white group-hover:bg-emerald-600",
                    i > current &&
                      "bg-[rgb(var(--ayan-border))] text-[rgb(var(--ayan-muted))]",
                  )}
                >
                  {done ? <Icons.check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="hidden whitespace-nowrap sm:inline">{s.short}</span>
              </button>
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "mx-1 h-0.5 flex-1 rounded",
                    done ? "bg-emerald-500" : "bg-[rgb(var(--ayan-border))]",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-[rgb(var(--ayan-muted))] sm:hidden">
        Step {current + 1} of {steps.length} — {steps[current]?.label}
      </p>
    </nav>
  );
}

/** Loading skeleton shown while the persisted draft hydrates. */
export function WizardSkeleton() {
  return (
    <div className="ayan-container py-16">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-64 w-full" />
      </div>
    </div>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="wiz-grad" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#2b66e6" />
          <stop offset="100%" stopColor="#163da3" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#wiz-grad)" />
      <path d="M14 33V21.5a3.5 3.5 0 0 1 7 0V33" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M24 33V15" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M24 24.5c0-2 1.6-3.5 3.5-3.5H32" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M32 21v7.5a4 4 0 0 0 4 4" stroke="#8eb8ff" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="14" cy="35.5" r="2" fill="#8eb8ff" />
    </svg>
  );
}
