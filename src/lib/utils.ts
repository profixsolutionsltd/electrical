import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names intelligently (later classes win). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an integer number of pence as a currency string (default GBP). */
export function formatMoney(
  pence: number,
  currency: string = "GBP",
  locale: string = "en-GB",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(pence / 100);
}

/** Format an ISO date (or Date) into a friendly human date. */
export function formatDate(
  value: string | Date,
  locale: string = "en-GB",
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Format an ISO date/time into a friendly human date + time. */
export function formatDateTime(
  value: string | Date,
  locale: string = "en-GB",
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Format just the time portion of a date. */
export function formatTime(
  value: string | Date,
  locale: string = "en-GB",
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Format a date as YYYY-MM-DD in UTC, useful for <input type="date">. */
export function toDateInputValue(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

/** Get initials from a name for avatar fallbacks. */
export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Slugify a string into a URL-safe slug. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Simple UK-ish postcode formatter/normaliser. Uppercases and collapses
 * whitespace. Not a full validation — used for display normalisation only.
 */
export function normalisePostcode(value: string): string {
  return value.toUpperCase().replace(/\s+/g, " ").trim();
}

/** Extract the outward code (e.g. "SW1A" from "SW1A 1AA"). */
export function postcodeOutward(value: string): string {
  const normalised = normalisePostcode(value);
  return normalised.split(" ")[0] ?? normalised;
}

/** Clamp a number between a min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Deterministic pseudo-random from a string, for stable avatar hues etc. */
export function hashHue(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

/** Safe JSON parse that returns a fallback on error. */
export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Build a CSV string from rows. Escapes quotes/commas/newlines. */
export function toCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][],
): string {
  const escape = (cell: string | number | null | undefined) => {
    const str = cell == null ? "" : String(cell);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [headers.map(escape).join(",")];
  for (const row of rows) {
    lines.push(row.map(escape).join(","));
  }
  return lines.join("\n");
}

/** Convert a CSV string to a data: URL for downloading in the browser. */
export function csvDataUrl(csv: string): string {
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}
