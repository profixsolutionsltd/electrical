/**
 * Discount codes.
 *
 * The rules live here as pure functions so they can be unit-tested, while the
 * database lookup and redemption happen on the server. A discount is always
 * re-validated and re-applied server-side during checkout — the browser only
 * ever asks whether a code is valid.
 */

export type DiscountType = "PERCENT" | "FIXED";

export interface DiscountRule {
  type: DiscountType;
  /** PERCENT: 0-100. FIXED: pence. */
  value: number;
  /** Minimum net subtotal (pence) the basket must reach. */
  minSubtotal?: number;
}

export interface DiscountCheck {
  valid: boolean;
  reason?: string;
  amount: number;
}

/** Normalise user input into the canonical code format. */
export function normaliseCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * Work out the discount for a basket.
 * Never returns a negative amount and never discounts more than the subtotal.
 */
export function computeDiscount(
  rule: DiscountRule,
  subtotal: number,
): DiscountCheck {
  const minSubtotal = rule.minSubtotal ?? 0;

  if (minSubtotal > 0 && subtotal < minSubtotal) {
    return {
      valid: false,
      reason: `This code needs a minimum order of £${(minSubtotal / 100).toFixed(2)}`,
      amount: 0,
    };
  }

  let amount = 0;
  if (rule.type === "PERCENT") {
    const percent = Math.min(100, Math.max(0, rule.value));
    amount = Math.round((subtotal * percent) / 100);
  } else {
    amount = Math.max(0, rule.value);
  }

  amount = Math.min(amount, subtotal);

  if (amount <= 0) {
    return { valid: false, reason: "This code does not apply to this booking", amount: 0 };
  }

  return { valid: true, amount };
}
