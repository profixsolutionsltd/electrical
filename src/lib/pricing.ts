import { DEFAULT_VAT_RATE } from "./constants";

/**
 * Money in AYAN is always handled as integer pence to avoid floating point
 * rounding errors. These helpers centralise all price maths so it can be
 * unit-tested independently of the database.
 */

export interface PriceableLine {
  /** Unit price in pence. */
  unitPrice: number;
  quantity: number;
  /** Whether VAT applies to this line. */
  vatApplicable?: boolean;
}

export interface PriceTotals {
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  discount: number;
  total: number;
  currency: string;
}

/**
 * Calculate the net subtotal (before VAT) for a set of lines.
 * Line total = unitPrice * quantity.
 */
export function calculateSubtotal(lines: PriceableLine[]): number {
  return lines.reduce(
    (sum, line) => sum + line.unitPrice * Math.max(0, line.quantity),
    0,
  );
}

/** Calculate VAT amount on a net amount given a percentage rate. */
export function calculateVat(net: number, vatRate: number): number {
  return Math.round((net * vatRate) / 100);
}

/**
 * Compute the full price breakdown for a set of lines.
 *
 * Only lines flagged vatApplicable contribute to the taxable amount, so a
 * mixed basket (some services zero-rated) is handled correctly.
 */
export function calculateTotals(
  lines: PriceableLine[],
  options: { vatRate?: number; discount?: number; currency?: string } = {},
): PriceTotals {
  const vatRate = options.vatRate ?? DEFAULT_VAT_RATE;
  const discount = Math.max(0, options.discount ?? 0);
  const currency = options.currency ?? "GBP";

  const subtotal = calculateSubtotal(lines);
  const taxable = lines
    .filter((l) => l.vatApplicable !== false)
    .reduce((sum, l) => sum + l.unitPrice * Math.max(0, l.quantity), 0);

  const vatAmount = calculateVat(taxable, vatRate);
  const total = Math.max(0, subtotal + vatAmount - discount);

  return { subtotal, vatRate, vatAmount, discount, total, currency };
}

/** Parse a decimal string like "29.99" into integer pence (2999). */
export function parseMoneyToPence(value: string): number {
  const parsed = Number.parseFloat(value.replace(/[^0-9.\-]/g, ""));
  if (Number.isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

/** Format integer pence as a decimal number (for display in inputs). */
export function penceToDecimal(pence: number): string {
  return (pence / 100).toFixed(2);
}
