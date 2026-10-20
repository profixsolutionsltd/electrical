import { cn, formatMoney, formatDate, formatDateTime, formatTime } from "./utils";

/** Re-export the shared formatters plus domain-specific helpers. */
export { formatMoney, formatDate, formatDateTime, formatTime };

/** Format a duration in minutes into a friendly string, e.g. "45 min", "2 hr". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`;
}

/** Format a VAT rate, trimming a trailing ".0" (20 -> "20%", 17.5 -> "17.5%"). */
export function formatVatRate(rate: number): string {
  return `${Number.isInteger(rate) ? rate : rate.toFixed(1)}%`;
}

/** Conditional className helper re-export for convenience. */
export { cn };
