"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import {
  checkPostcodeCoverage,
  createBooking,
  getAvailableSlots,
  priceBooking,
} from "@/server/bookings";
import type { ServiceAnswers } from "@/lib/service-questions";

/**
 * Server actions backing the booking journey. Every price, every availability
 * check and every validation happens here — the browser only ever asks.
 */

export interface QuoteLine {
  serviceId: string;
  answers?: ServiceAnswers;
}

export interface BookingQuote {
  items: {
    serviceId: string;
    serviceName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    adjustments: { label: string; amount: number }[];
  }[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  discount: number;
  discountCode: string | null;
  discountError: string | null;
  total: number;
  currency: string;
  durationMinutes: number;
}

/** Server-side price preview used by the summary panel and review step. */
export async function quoteBooking(
  lines: QuoteLine[],
  discountCode?: string,
): Promise<BookingQuote> {
  const { items, totals, totalDuration, discount } = await priceBooking(lines, {
    discountCode: discountCode?.trim() ? discountCode : undefined,
  });

  return {
    items: items.map((item) => ({
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      adjustments: item.adjustments,
    })),
    subtotal: totals.subtotal,
    vatRate: totals.vatRate,
    vatAmount: totals.vatAmount,
    discount: totals.discount,
    discountCode: discount.valid ? (discount.code ?? null) : null,
    discountError: discount.valid ? null : (discount.reason ?? null),
    total: totals.total,
    currency: totals.currency,
    durationMinutes: totalDuration,
  };
}

/** Check whether AYAN covers a postcode before the customer continues. */
export async function checkCoverageAction(postcode: string) {
  return checkPostcodeCoverage(postcode);
}

/** Real availability straight from the database (never a simulation). */
export async function fetchAvailability(days = 21) {
  return getAvailableSlots(days);
}

export interface SubmitBookingPayload {
  lines: QuoteLine[];
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  propertyType?: string;
  bedrooms?: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  scheduledDate: string;
  timeWindow: "MORNING" | "AFTERNOON" | "EVENING";
  notes?: string;
  accessNotes?: string;
  paymentMethod: "PAY_LATER" | "CARD";
  discountCode?: string;
}

export type SubmitBookingResult =
  | {
      ok: true;
      bookingId: string;
      reference: string;
      accountCreated: boolean;
      setPasswordToken: string | null;
    }
  | { ok: false; error: string };

/**
 * Create the booking. Signed-in customers keep their account; guests get an
 * account created for them plus a one-time link to set a password.
 */
export async function submitBooking(
  payload: SubmitBookingPayload,
): Promise<SubmitBookingResult> {
  const session = await getSession();

  const identifier = session
    ? `booking:${session.sub}`
    : `booking:guest:${payload.contactEmail.toLowerCase()}`;

  const limit = rateLimit(identifier, RATE_LIMITS.booking.limit, RATE_LIMITS.booking.windowMs);
  if (!limit.success) {
    return { ok: false, error: "You're creating bookings very quickly. Please wait a moment." };
  }

  if (!payload.lines.length) {
    return { ok: false, error: "Select at least one service to continue." };
  }

  const result = await createBooking({
    customerId: session?.sub,
    serviceLines: payload.lines.map((line) => ({
      serviceId: line.serviceId,
      quantity: 1,
      answers: line.answers ?? {},
    })),
    addressLine1: payload.addressLine1,
    addressLine2: payload.addressLine2 || undefined,
    city: payload.city,
    postcode: payload.postcode,
    propertyType: payload.propertyType || undefined,
    bedrooms: payload.bedrooms ? Number(payload.bedrooms) : undefined,
    contactName: payload.contactName,
    contactPhone: payload.contactPhone,
    contactEmail: payload.contactEmail,
    scheduledDate: payload.scheduledDate,
    timeWindow: payload.timeWindow,
    notes: payload.notes || undefined,
    accessNotes: payload.accessNotes || undefined,
    paymentMethod: payload.paymentMethod,
    discountCode: payload.discountCode || undefined,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");

  return {
    ok: true,
    bookingId: result.booking.id,
    reference: result.booking.reference,
    accountCreated: result.accountCreated,
    setPasswordToken: result.setPasswordToken ?? null,
  };
}
