"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useBookingStore } from "../booking-store";
import { StepShell } from "./StepShell";
import { Icons } from "@/components/ui/Icons";
import { TIME_WINDOWS, type Slot, type TimeWindow } from "@/lib/slots";
import { fetchAvailability } from "../actions";
import { cn } from "@/lib/utils";

const DAY_FORMAT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** Step 4 — pick a date and an appointment window. */
export function StepDateTime({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { draft, updateDetails } = useBookingStore();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStep, setErrorStep] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAvailability(21);
      setSlots(result);
    } catch {
      setError("We couldn't load availability just now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const dates = useMemo(() => {
    const unique = new Map<string, Slot[]>();
    for (const slot of slots) {
      if (!unique.has(slot.date)) unique.set(slot.date, []);
      unique.get(slot.date)!.push(slot);
    }
    return [...unique.entries()];
  }, [slots]);

  const selectedDate = draft.scheduledDate;
  const windowsForDate = selectedDate
    ? (slots.filter((s) => s.date === selectedDate) ?? [])
    : [];

  const validate = () => {
    if (!draft.scheduledDate) {
      setErrorStep("Choose a date for your visit");
      return;
    }
    if (!draft.timeWindow) {
      setErrorStep("Choose an appointment window");
      return;
    }
    setErrorStep(null);
    onNext();
  };

  return (
    <StepShell
      eyebrow="Step 4 of 6"
      title="Choose a date and time that works for you"
      description="We only show windows that still have an engineer free."
      onBack={onBack}
      onNext={validate}
      loading={loading && slots.length === 0}
      error={errorStep ?? undefined}
    >
      {loading && slots.length === 0 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton h-20 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-3 text-sm font-semibold text-brand-600 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : dates.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[rgb(var(--ayan-border))] p-8 text-center text-sm text-[rgb(var(--ayan-muted))]">
          No appointments are available in the next three weeks. Please try again
          shortly or call us on 020 8000 1234.
        </p>
      ) : (
        <div className="space-y-6">
          {/* Date picker */}
          <div>
            <p className="text-sm font-semibold text-[rgb(var(--ayan-text))]">
              Pick a date
            </p>
            <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-2">
              {dates.map(([date, dateSlots]) => {
                const active = selectedDate === date;
                const available = dateSlots.reduce((sum, s) => sum + s.available, 0);
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      updateDetails({ scheduledDate: date });
                      setErrorStep(null);
                    }}
                    aria-pressed={active}
                    disabled={available === 0}
                    className={cn(
                      "min-w-[6.5rem] shrink-0 rounded-xl border px-4 py-3 text-left transition-colors",
                      active
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-[rgb(var(--ayan-border))] hover:border-brand-300",
                      available === 0 && "cursor-not-allowed opacity-40",
                    )}
                  >
                    <span
                      className={cn(
                        "block text-xs font-medium uppercase tracking-wide",
                        active ? "text-white/80" : "text-[rgb(var(--ayan-muted))]",
                      )}
                    >
                      {new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
                        weekday: "short",
                      })}
                    </span>
                    <span className="mt-0.5 block font-display text-lg font-bold">
                      {new Date(`${date}T12:00:00`).getDate()}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-[11px]",
                        active ? "text-white/80" : "text-[rgb(var(--ayan-muted))]",
                      )}
                    >
                      {available === 0 ? "Full" : `${available} left`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Appointment windows */}
          {selectedDate ? (
            <div>
              <p className="text-sm font-semibold text-[rgb(var(--ayan-text))]">
                Appointment window
              </p>
              <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">
                {DAY_FORMAT.format(new Date(`${selectedDate}T12:00:00`))}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {TIME_WINDOWS.map((window) => {
                  const slot = windowsForDate.find((s) => s.timeWindow === window.value);
                  const available = slot?.available ?? 0;
                  const active = draft.timeWindow === window.value;
                  return (
                    <button
                      key={window.value}
                      type="button"
                      disabled={available === 0}
                      onClick={() => {
                        updateDetails({ timeWindow: window.value as TimeWindow });
                        setErrorStep(null);
                      }}
                      aria-pressed={active}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors",
                        active
                          ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-600 dark:bg-brand-950/30"
                          : "border-[rgb(var(--ayan-border))] hover:border-brand-300",
                        available === 0 && "cursor-not-allowed opacity-40",
                      )}
                    >
                      <span className="block text-sm font-semibold text-[rgb(var(--ayan-text))]">
                        {window.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-[rgb(var(--ayan-muted))]">
                        {window.start} – {window.end}
                      </span>
                      <span className="mt-2 flex items-center gap-1 text-xs font-medium text-[rgb(var(--ayan-muted))]">
                        <Icons.clock className="h-3.5 w-3.5" />
                        {available === 0 ? "Fully booked" : `${available} slot${available === 1 ? "" : "s"} left`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[rgb(var(--ayan-border))] p-6 text-center text-sm text-[rgb(var(--ayan-muted))]">
              Choose a date to see the available appointment windows.
            </p>
          )}
        </div>
      )}
    </StepShell>
  );
}
