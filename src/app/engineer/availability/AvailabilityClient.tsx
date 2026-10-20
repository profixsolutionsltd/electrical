"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAvailability } from "../actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";

const DAYS = [
  { weekday: 1, label: "Monday" },
  { weekday: 2, label: "Tuesday" },
  { weekday: 3, label: "Wednesday" },
  { weekday: 4, label: "Thursday" },
  { weekday: 5, label: "Friday" },
  { weekday: 6, label: "Saturday" },
  { weekday: 0, label: "Sunday" },
];

export interface AvailabilitySlot {
  weekday: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

export function AvailabilityClient({ initialSlots }: { initialSlots: AvailabilitySlot[] }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [schedule, setSchedule] = useState(() => {
    return DAYS.map((d) => {
      const existing = initialSlots.find((s) => s.weekday === d.weekday);
      return {
        weekday: d.weekday,
        label: d.label,
        active: existing ? existing.active : d.weekday >= 1 && d.weekday <= 5,
        startTime: existing ? existing.startTime : "09:00",
        endTime: existing ? existing.endTime : "17:00",
      };
    });
  });

  const toggleDay = (weekday: number) => {
    setSchedule((prev) =>
      prev.map((s) => (s.weekday === weekday ? { ...s, active: !s.active } : s))
    );
  };

  const updateTime = (weekday: number, field: "startTime" | "endTime", value: string) => {
    setSchedule((prev) =>
      prev.map((s) => (s.weekday === weekday ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async () => {
    setLoading(true);
    const entries = schedule.map((s) => ({
      weekday: s.weekday,
      startTime: s.startTime,
      endTime: s.endTime,
      active: s.active,
    }));

    const result = await updateAvailability(entries);
    setLoading(false);

    if (result.ok) {
      toast.success("Schedule updated", result.message);
      router.refresh();
    } else {
      toast.error("Save failed", result.message);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Weekly Working Hours</h2>
        <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">
          Configure the days and times you are available to receive assignments.
        </p>
      </div>

      <div className="space-y-4">
        {schedule.map((day) => (
          <div
            key={day.weekday}
            className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between transition-colors ${
              day.active
                ? "border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))]"
                : "border-dashed border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))]/50 opacity-70"
            }`}
          >
            <div className="flex items-center gap-3 w-36">
              <input
                type="checkbox"
                id={`day-${day.weekday}`}
                checked={day.active}
                onChange={() => toggleDay(day.weekday)}
                className="h-4 w-4 rounded border-[rgb(var(--ayan-border))] text-brand-600 focus:ring-brand-500"
              />
              <label
                htmlFor={`day-${day.weekday}`}
                className="cursor-pointer text-sm font-medium text-[rgb(var(--ayan-text))]"
              >
                {day.label}
              </label>
            </div>

            {day.active ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={day.startTime}
                  onChange={(e) => updateTime(day.weekday, "startTime", e.target.value)}
                  className="rounded-lg border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-1.5 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
                />
                <span className="text-xs text-[rgb(var(--ayan-muted))]">to</span>
                <input
                  type="time"
                  value={day.endTime}
                  onChange={(e) => updateTime(day.weekday, "endTime", e.target.value)}
                  className="rounded-lg border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-1.5 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
                />
              </div>
            ) : (
              <span className="text-sm italic text-[rgb(var(--ayan-muted))]">Unavailable</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} loading={loading}>
          Save Availability
        </Button>
      </div>
    </Card>
  );
}
