import { prisma } from "@/lib/prisma";
import {
  DEFAULT_VAT_RATE,
  DEFAULT_CANCELLATION_WINDOW_HOURS,
} from "@/lib/constants";

/**
 * System settings are stored as key/value rows with sensible code defaults so
 * the app always works even before an admin configures anything. This keeps
 * dashboard/business values out of hard-coded frontend components.
 */

export interface PlatformSettings {
  companyName: string;
  companyTagline: string;
  supportEmail: string;
  supportPhone: string;
  companyAddress: string;
  currency: string;
  vatRate: number;
  cancellationWindowHours: number;
  slotCapacityPerWindow: number;
  bookingLeadTimeHours: number;
  serviceAreas: string[];
  announcementEnabled: boolean;
}

const DEFAULTS: PlatformSettings = {
  companyName: "AYAN",
  companyTagline: "Everything Managed. One Smart Platform.",
  supportEmail: "support@ayan.example.com",
  supportPhone: "0800 000 0000",
  companyAddress: "1 AYAN House, London, United Kingdom",
  currency: "GBP",
  vatRate: DEFAULT_VAT_RATE,
  cancellationWindowHours: DEFAULT_CANCELLATION_WINDOW_HOURS,
  slotCapacityPerWindow: 3,
  bookingLeadTimeHours: 4,
  serviceAreas: [],
  announcementEnabled: true,
};

/** Read settings from the database, merged over defaults. */
export async function getSettings(): Promise<PlatformSettings> {
  try {
    const rows = await prisma.systemSetting.findMany();
    const map = new Map(rows.map((r) => [r.key, r.value]));
    const num = (key: "vatRate" | "cancellationWindowHours" | "slotCapacityPerWindow" | "bookingLeadTimeHours") => {
      const raw = map.get(key);
      const parsed = raw != null ? Number(raw) : NaN;
      return Number.isFinite(parsed) ? parsed : DEFAULTS[key];
    };
    return {
      companyName: map.get("companyName") ?? DEFAULTS.companyName,
      companyTagline: map.get("companyTagline") ?? DEFAULTS.companyTagline,
      supportEmail: map.get("supportEmail") ?? DEFAULTS.supportEmail,
      supportPhone: map.get("supportPhone") ?? DEFAULTS.supportPhone,
      companyAddress: map.get("companyAddress") ?? DEFAULTS.companyAddress,
      currency: map.get("currency") ?? DEFAULTS.currency,
      vatRate: num("vatRate"),
      cancellationWindowHours: num("cancellationWindowHours"),
      slotCapacityPerWindow: num("slotCapacityPerWindow"),
      bookingLeadTimeHours: num("bookingLeadTimeHours"),
      serviceAreas: map.get("serviceAreas")
        ? map.get("serviceAreas")!.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      announcementEnabled:
        (map.get("announcementEnabled") ?? "true") === "true",
    };
  } catch {
    // If the database is unavailable, fall back to defaults so the public site
    // still renders. Dashboard pages that require live data will surface their
    // own errors.
    return { ...DEFAULTS };
  }
}

/** Persist a single setting (upsert). */
export async function setSetting(key: string, value: string, group = "general") {
  return prisma.systemSetting.upsert({
    where: { key },
    update: { value, group },
    create: { key, value, group },
  });
}

export const DEFAULT_SETTINGS = DEFAULTS;
