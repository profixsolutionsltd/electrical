/**
 * Appointment slot generation and conflict detection.
 *
 * These helpers are deliberately pure (no database) so they can be reused on
 * the server for real availability and unit-tested in isolation. The server
 * layer combines these with persisted bookings to prevent double-booking.
 */

export type TimeWindow = "MORNING" | "AFTERNOON" | "EVENING";

export const TIME_WINDOWS: { value: TimeWindow; label: string; start: string; end: string }[] = [
  { value: "MORNING", label: "Morning", start: "08:00", end: "12:00" },
  { value: "AFTERNOON", label: "Afternoon", start: "12:00", end: "17:00" },
  { value: "EVENING", label: "Evening", start: "17:00", end: "20:00" },
];

export interface Slot {
  /** ISO date string (YYYY-MM-DD). */
  date: string;
  timeWindow: TimeWindow;
  /** Capacity remaining for this slot. */
  available: number;
}

/** Is a given date a weekend (Sat/Sun)? */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Convert a Date to a YYYY-MM-DD string (local time). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Add days to a date, returning a new Date. */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Set a date to the start of its day (00:00:00.000). */
export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

/**
 * Generate the bookable slots for a range of days.
 *
 * @param from       Start date (inclusive).
 * @param days       Number of days to generate.
 * @param options    Config: skip weekends, per-window capacity, blackout dates.
 * @param taken      Map of "YYYY-MM-DD|WINDOW" -> already booked count.
 */
export function generateSlots(
  from: Date,
  days: number,
  options: {
    skipWeekends?: boolean;
    capacityPerWindow?: number;
    blackoutDates?: string[];
  } = {},
  taken: Record<string, number> = {},
): Slot[] {
  const skipWeekends = options.skipWeekends ?? true;
  const capacity = options.capacityPerWindow ?? 3;
  const blackout = new Set(options.blackoutDates ?? []);
  const slots: Slot[] = [];

  for (let i = 0; i < days; i += 1) {
    const date = addDays(startOfDay(from), i);
    if (skipWeekends && isWeekend(date)) continue;
    const iso = toISODate(date);
    if (blackout.has(iso)) continue;

    for (const win of TIME_WINDOWS) {
      const key = `${iso}|${win.value}`;
      const booked = taken[key] ?? 0;
      const available = Math.max(0, capacity - booked);
      slots.push({ date: iso, timeWindow: win.value, available });
    }
  }

  return slots;
}

/** Build the lookup key used to track booked counts per slot. */
export function slotKey(date: string, timeWindow: TimeWindow): string {
  return `${date}|${timeWindow}`;
}

/**
 * Determine whether a proposed booking conflicts with existing bookings given
 * the per-window capacity. Returns true when the slot is already full.
 */
export function isSlotFull(
  date: string,
  timeWindow: TimeWindow,
  existingBookedCount: number,
  capacity = 3,
): boolean {
  return existingBookedCount >= capacity;
}

/**
 * Can a booking still be cancelled free of charge?
 * A booking is cancellable while it is in the future and outside the paid
 * cancellation window.
 */
export function isCancellable(
  scheduledAt: Date,
  now: Date = new Date(),
  windowHours = 24,
): boolean {
  const hoursUntil = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntil > 0;
}

/** Hours remaining until an appointment (can be negative if past). */
export function hoursUntil(scheduledAt: Date, now: Date = new Date()): number {
  return (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);
}

/** Whether a reschedule is allowed (before the appointment and within policy). */
export function canReschedule(scheduledAt: Date, now: Date = new Date()): boolean {
  return hoursUntil(scheduledAt, now) > 0;
}
