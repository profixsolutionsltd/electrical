import { prisma } from "@/lib/prisma";
import {
  PREMIUM_SETTING_KEYS,
  PREMIUM_STATUS,
  type PremiumStatus,
} from "@/lib/premium";

/**
 * Server-side access to the Premium tier state. The tier ships as
 * "coming soon" and is driven by system settings so an administrator can
 * launch it (or close the waitlist) without touching the codebase.
 */

export interface PremiumState {
  status: PremiumStatus;
  launchWindow: string;
  waitlistOpen: boolean;
  waitlistCount: number;
}

export async function getPremiumState(): Promise<PremiumState> {
  try {
    const [rows, waitlistCount] = await Promise.all([
      prisma.systemSetting.findMany({
        where: {
          key: {
            in: [
              PREMIUM_SETTING_KEYS.status,
              PREMIUM_SETTING_KEYS.launchWindow,
              PREMIUM_SETTING_KEYS.waitlistOpen,
            ],
          },
        },
      }),
      prisma.premiumWaitlist.count(),
    ]);

    const map = new Map(rows.map((r) => [r.key, r.value]));
    const rawStatus = map.get(PREMIUM_SETTING_KEYS.status);

    return {
      status:
        rawStatus === PREMIUM_STATUS.LIVE
          ? PREMIUM_STATUS.LIVE
          : PREMIUM_STATUS.COMING_SOON,
      launchWindow:
        map.get(PREMIUM_SETTING_KEYS.launchWindow) ?? "Later this year",
      waitlistOpen:
        (map.get(PREMIUM_SETTING_KEYS.waitlistOpen) ?? "true") === "true",
      waitlistCount,
    };
  } catch {
    return {
      status: PREMIUM_STATUS.COMING_SOON,
      launchWindow: "Later this year",
      waitlistOpen: true,
      waitlistCount: 0,
    };
  }
}

/** True when the signed-in customer is already on the Premium waitlist. */
export async function isOnPremiumWaitlist(
  email: string,
): Promise<boolean> {
  const entry = await prisma.premiumWaitlist.findFirst({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  return Boolean(entry);
}

/** Add (or refresh) a waitlist entry for an email address. */
export async function addToPremiumWaitlist(params: {
  email: string;
  name?: string | null;
  userId?: string | null;
  source?: string;
}) {
  const email = params.email.trim().toLowerCase();
  const existing = await prisma.premiumWaitlist.findFirst({
    where: { email },
  });

  if (existing) {
    return prisma.premiumWaitlist.update({
      where: { id: existing.id },
      data: { name: params.name ?? existing.name, userId: params.userId ?? existing.userId },
    });
  }

  return prisma.premiumWaitlist.create({
    data: {
      email,
      name: params.name ?? null,
      userId: params.userId ?? null,
      source: params.source ?? "dashboard",
    },
  });
}

/** Waitlist entries for the admin panel, newest first. */
export async function getPremiumWaitlistEntries(limit = 200) {
  return prisma.premiumWaitlist.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true, role: true } } },
  });
}
