import { env } from "./env";

/**
 * Lightweight in-memory fixed-window rate limiter.
 *
 * Adequate for a single-instance deployment and for protecting login, password
 * reset and other sensitive endpoints. For multi-instance production, back
 * this with Redis (documented in the README). Can be disabled via the
 * RATE_LIMIT_DISABLED env var (e.g. for tests).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check and consume one unit against a limit.
 *
 * @param identifier Unique key (e.g. `login:${email}` or an IP).
 * @param limit      Max requests allowed per window.
 * @param windowMs   Window length in milliseconds.
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  if (env.rateLimit.disabled) {
    return { success: true, remaining: limit, resetAt: Date.now() + windowMs };
  }

  const now = Date.now();
  const existing = buckets.get(identifier);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(identifier, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/** Reset a specific identifier (used in tests). */
export function resetRateLimit(identifier: string): void {
  buckets.delete(identifier);
}

/** Clear all buckets (used in tests). */
export function clearAllRateLimits(): void {
  buckets.clear();
}

/** Pre-tuned limits for sensitive endpoints. */
export const RATE_LIMITS = {
  login: { limit: 8, windowMs: 15 * 60 * 1000 },
  register: { limit: 5, windowMs: 60 * 60 * 1000 },
  forgotPassword: { limit: 5, windowMs: 60 * 60 * 1000 },
  resetPassword: { limit: 5, windowMs: 60 * 60 * 1000 },
  booking: { limit: 20, windowMs: 60 * 60 * 1000 },
  contact: { limit: 5, windowMs: 60 * 60 * 1000 },
} as const;
