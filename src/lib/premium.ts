/**
 * Premium tier definition.
 *
 * The Premium plan is a *coming soon* offering: it is fully described so the
 * product can be marketed and collected interest for, but it cannot be bought
 * or subscribed to yet. Launch is controlled by the `premiumStatus` system
 * setting so an administrator can flip it live without a code change.
 *
 * Prices are integer pence, consistent with the rest of the platform.
 */

export const PREMIUM_STATUS = {
  COMING_SOON: "COMING_SOON",
  LIVE: "LIVE",
} as const;

export type PremiumStatus =
  (typeof PREMIUM_STATUS)[keyof typeof PREMIUM_STATUS];

/** System setting keys that drive the Premium tier. */
export const PREMIUM_SETTING_KEYS = {
  status: "premiumStatus",
  launchWindow: "premiumLaunchWindow",
  waitlistOpen: "premiumWaitlistOpen",
} as const;

export interface PremiumPlan {
  id: string;
  name: string;
  tagline: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  features: string[];
  /** Features every customer already has on the Standard plan. */
  standardFeatures: string[];
}

export const STANDARD_PLAN: PremiumPlan = {
  id: "standard",
  name: "Standard",
  tagline: "Everything you need to stay compliant",
  description:
    "Book inspections, track certificates and manage invoices across every property you manage.",
  priceMonthly: 0,
  priceAnnual: 0,
  currency: "GBP",
  features: [
    "Unlimited property records",
    "Book and reschedule inspections",
    "Digital certificates & invoices",
    "Email and phone support",
  ],
  standardFeatures: [],
};

export const PREMIUM_PLAN: PremiumPlan = {
  id: "premium",
  name: "Premium",
  tagline: "One platform for every portfolio",
  description:
    "Premium adds portfolio-wide automation, priority scheduling and dedicated account management for landlords, agents and facilities teams.",
  priceMonthly: 4900,
  priceAnnual: 49000,
  currency: "GBP",
  features: [
    "Everything in Standard",
    "Multi-portfolio dashboard with portfolio-level reporting",
    "Priority same-week appointment slots",
    "Automated compliance expiry reminders & renewal bookings",
    "Bulk booking for an entire portfolio",
    "White-labelled certificates with your own branding",
    "Named account manager and priority support",
    "API access and webhooks for property systems",
  ],
  standardFeatures: STANDARD_PLAN.features,
};

/** All plans shown in the comparison table, cheapest first. */
export const PLANS: PremiumPlan[] = [STANDARD_PLAN, PREMIUM_PLAN];

export function isPremiumLive(status: string | null | undefined): boolean {
  return status === PREMIUM_STATUS.LIVE;
}

export function isPremiumComingSoon(
  status: string | null | undefined,
): boolean {
  return !isPremiumLive(status);
}

/** Human label for the current premium status. */
export function premiumStatusLabel(status: string | null | undefined): string {
  return isPremiumLive(status) ? "Available now" : "Coming soon";
}

/** Format a plan price in pence as a currency string. */
export function formatPlanPrice(
  pence: number,
  currency = "GBP",
  per = "month",
): string {
  const amount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: pence % 100 === 0 ? 0 : 2,
  }).format(pence / 100);
  return pence === 0 ? "Free" : `${amount} / ${per}`;
}
