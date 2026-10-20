import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { calculateTotals, type PriceableLine } from "@/lib/pricing";
import { generateBookingReference } from "@/lib/reference";
import { generateSlots, slotKey, TIME_WINDOWS, type Slot, type TimeWindow } from "@/lib/slots";
import { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_METHOD, ROLES } from "@/lib/constants";
import { hashPassword } from "@/lib/auth";
import { randomToken } from "@/lib/google";
import {
  parseServiceQuestions,
  priceWithAnswers,
  validateServiceAnswers,
  type ServiceAnswers,
  type ServiceQuestion,
} from "@/lib/service-questions";
import { computeDiscount, normaliseCode } from "@/lib/discounts";
import { getSettings } from "./settings";
import { sendBookingConfirmation, createNotification } from "@/lib/email";

/**
 * Booking business logic. All price calculation and availability checks happen
 * on the server — the client is never trusted for totals or slot availability.
 */

export interface BookingLineInput {
  serviceId: string;
  quantity?: number;
  /** Answers to the service's property questions. */
  answers?: ServiceAnswers;
}

export interface CreateBookingInput {
  /** Set when the customer is signed in. Guests are given an account below. */
  customerId?: string;
  serviceLines: BookingLineInput[];
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  scheduledDate: string; // YYYY-MM-DD
  timeWindow: TimeWindow;
  notes?: string;
  paymentMethod: "PAY_LATER" | "CARD";
  propertyId?: string;
  propertyType?: string;
  bedrooms?: number;
  discountCode?: string;
  /** Free-text access notes captured in the journey. */
  accessNotes?: string;
}

export interface PricedItem {
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  vatApplicable: boolean;
  lineTotal: number;
  answers: ServiceAnswers;
  adjustments: { label: string; amount: number }[];
}

/**
 * Compute the price breakdown for a set of services (server-authoritative).
 *
 * Service prices are read from the database, the customer's answers to the
 * service's property questions are applied, and any discount code is
 * validated against the live database. Nothing here trusts the browser.
 */
export async function priceBooking(
  serviceLines: BookingLineInput[],
  options: { discountCode?: string } = {},
) {
  const ids = serviceLines.map((l) => l.serviceId);
  const services = await prisma.service.findMany({
    where: { id: { in: ids }, published: true },
    select: {
      id: true,
      name: true,
      priceFrom: true,
      vatApplicable: true,
      durationMinutes: true,
      questions: true,
    },
  });

  const serviceMap = new Map(services.map((s) => [s.id, s]));
  const lines: PriceableLine[] = [];
  const items: PricedItem[] = [];

  for (const line of serviceLines) {
    const service = serviceMap.get(line.serviceId);
    if (!service) continue;
    const quantity = Math.max(1, Math.floor(line.quantity ?? 1));
    const answers = line.answers ?? {};
    const questions = parseServiceQuestions(service.questions);
    const { total, adjustments } = priceWithAnswers(service.priceFrom, questions, answers);

    lines.push({ unitPrice: total, quantity, vatApplicable: service.vatApplicable });
    items.push({
      serviceId: service.id,
      serviceName: service.name,
      quantity,
      unitPrice: total,
      vatApplicable: service.vatApplicable,
      lineTotal: total * quantity,
      answers,
      adjustments: adjustments.map((a) => ({ label: a.label, amount: a.amount })),
    });
  }

  const settings = await getSettings();
  const baseTotals = calculateTotals(lines, {
    vatRate: settings.vatRate,
    currency: settings.currency,
  });

  const discountResult = options.discountCode
    ? await resolveDiscount(options.discountCode, baseTotals.subtotal)
    : { valid: false, amount: 0, reason: undefined, code: undefined };

  const totals = {
    ...baseTotals,
    discount: discountResult.valid ? discountResult.amount : 0,
    total: Math.max(
      0,
      baseTotals.total - (discountResult.valid ? discountResult.amount : 0),
    ),
  };

  const totalDuration = items.reduce(
    (sum, item) => {
      const s = serviceMap.get(item.serviceId);
      return sum + (s ? s.durationMinutes * item.quantity : 0);
    },
    0,
  );

  return {
    items,
    totals,
    totalDuration,
    services,
    discount: discountResult,
  };
}

/**
 * Look up a discount code and work out what it is worth for this basket.
 * Codes are normalised, checked for validity, expiry and usage limits.
 */
export async function resolveDiscount(code: string, subtotal: number) {
  const normalised = normaliseCode(code);
  if (!normalised) {
    return { valid: false, amount: 0, reason: "Enter a discount code", code: normalised };
  }

  const record = await prisma.discountCode.findUnique({ where: { code: normalised } });
  if (!record) {
    return { valid: false, amount: 0, reason: "That code isn't valid", code: normalised };
  }
  if (!record.active) {
    return { valid: false, amount: 0, reason: "That code is no longer active", code: normalised };
  }
  const now = new Date();
  if (record.startsAt && record.startsAt > now) {
    return { valid: false, amount: 0, reason: "That code isn't active yet", code: normalised };
  }
  if (record.endsAt && record.endsAt < now) {
    return { valid: false, amount: 0, reason: "That code has expired", code: normalised };
  }
  if (record.maxUses !== null && record.usedCount >= record.maxUses) {
    return { valid: false, amount: 0, reason: "That code has been fully used", code: normalised };
  }

  const result = computeDiscount(
    { type: record.type === "FIXED" ? "FIXED" : "PERCENT", value: record.value, minSubtotal: record.minSubtotal },
    subtotal,
  );

  if (!result.valid) {
    return { valid: false, amount: 0, reason: result.reason, code: normalised };
  }

  return { valid: true, amount: result.amount, reason: undefined, code: normalised };
}

/** The booking catalogue: categories, services and their property questions. */
export async function getServiceCatalogue() {
  const categories = await prisma.serviceCategory.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: {
      services: {
        where: { published: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          categoryId: true,
          name: true,
          slug: true,
          summary: true,
          priceFrom: true,
          durationMinutes: true,
          featured: true,
          vatApplicable: true,
          questions: true,
        },
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    services: category.services.map((service) => ({
      id: service.id,
      categoryId: service.categoryId,
      name: service.name,
      slug: service.slug,
      summary: service.summary,
      priceFrom: service.priceFrom,
      durationMinutes: service.durationMinutes,
      featured: service.featured,
      vatApplicable: service.vatApplicable,
      questions: parseServiceQuestions(service.questions),
    })),
  }));
}

/**
 * Check whether AYAN covers a postcode. Coverage is driven by the ServiceArea
 * table (admin-managed postcode prefixes).
 */
export async function checkPostcodeCoverage(postcode: string) {
  const normalised = postcode.trim().toUpperCase().replace(/\s+/g, "");
  if (normalised.length < 2) {
    return { covered: false, label: null, message: "Enter a postcode to check coverage" };
  }

  const areas = await prisma.serviceArea.findMany({
    where: { active: true },
    orderBy: { postcodePrefix: "asc" },
  });

  // Longest matching prefix wins so "SW1" beats "S".
  const match = areas
    .filter((area) => normalised.startsWith(area.postcodePrefix.toUpperCase()))
    .sort((a, b) => b.postcodePrefix.length - a.postcodePrefix.length)[0];

  if (!match) {
    return {
      covered: false,
      label: null,
      message:
        "Sorry, we don't cover that postcode yet. Try a nearby area or contact us and we'll see what we can do.",
    };
  }

  return {
    covered: true,
    label: match.label,
    message: `Great news — we cover ${match.label}.`,
  };
}

/**
 * Return the available slots for the next `days` days, accounting for existing
 * bookings and the configured per-window capacity.
 */
export async function getAvailableSlots(days = 14): Promise<Slot[]> {
  const settings = await getSettings();
  const from = new Date();

  const end = new Date(from);
  end.setDate(end.getDate() + days);

  const bookings = await prisma.booking.findMany({
    where: {
      status: { notIn: [BOOKING_STATUS.CANCELLED] },
      scheduledAt: { gte: from, lt: end },
    },
    select: { scheduledAt: true, timeWindow: true },
  });

  const taken: Record<string, number> = {};
  for (const b of bookings) {
    const date = b.scheduledAt.toISOString().slice(0, 10);
    const key = slotKey(date, b.timeWindow as TimeWindow);
    taken[key] = (taken[key] ?? 0) + 1;
  }

  return generateSlots(
    from,
    days,
    { skipWeekends: true, capacityPerWindow: settings.slotCapacityPerWindow },
    taken,
  );
}

/**
 * Create a booking inside a transaction. Re-checks slot availability at write
 * time to prevent double-booking (the client's view may be stale). Generates a
 * unique reference, snapshots prices, writes a timeline event and sends a
 * confirmation notification.
 *
 * Guests are welcome: an account is created for them so the booking can be
 * managed, and a one-time link is returned for setting a password.
 */
export async function createBooking(input: CreateBookingInput) {
  const settings = await getSettings();

  // Re-price on the server; never trust client totals.
  const { items, totals, discount } = await priceBooking(input.serviceLines, {
    discountCode: input.discountCode,
  });
  if (items.length === 0) {
    return { ok: false as const, error: "No valid services selected." };
  }

  // Coverage check — never book outside the configured service areas.
  const coverage = await checkPostcodeCoverage(input.postcode);
  if (!coverage.covered) {
    return { ok: false as const, error: coverage.message };
  }

  // Validate the customer's answers against the service questions.
  for (const line of input.serviceLines) {
    const service = items.find((i) => i.serviceId === line.serviceId);
    if (!service) continue;
    const questions = await getQuestionsForService(line.serviceId);
    const errors = validateServiceAnswers(questions, line.answers ?? {});
    if (Object.keys(errors).length > 0) {
      return {
        ok: false as const,
        error: "Please answer the property questions before continuing.",
      };
    }
  }

  const windowDef = TIME_WINDOWS.find((w) => w.value === input.timeWindow) ?? TIME_WINDOWS[0];
  const scheduledAt = new Date(`${input.scheduledDate}T${windowDef.start}:00`);

  // Capacity check to prevent over-booking a slot.
  const dayStart = new Date(`${input.scheduledDate}T00:00:00`);
  const dayEnd = new Date(`${input.scheduledDate}T23:59:59`);
  const existingCount = await prisma.booking.count({
    where: {
      status: { notIn: [BOOKING_STATUS.CANCELLED] },
      timeWindow: input.timeWindow,
      scheduledAt: { gte: dayStart, lte: dayEnd },
    },
  });
  if (existingCount >= settings.slotCapacityPerWindow) {
    return { ok: false as const, error: "Sorry, that appointment slot is now full. Please choose another time." };
  }

  // Lead-time guard.
  const leadMs = settings.bookingLeadTimeHours * 60 * 60 * 1000;
  if (scheduledAt.getTime() - Date.now() < leadMs) {
    return { ok: false as const, error: "Please choose an appointment at least a few hours from now." };
  }

  const customer = await resolveCustomer(input);
  if (!customer.ok) {
    return { ok: false as const, error: customer.error };
  }
  const reference = await generateUniqueReference();

  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.booking.create({
      data: {
        reference,
        customerId: customer.customerId,
        propertyId: input.propertyId,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        postcode: input.postcode.toUpperCase(),
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail.toLowerCase(),
        status: BOOKING_STATUS.PENDING,
        scheduledAt,
        timeWindow: input.timeWindow,
        notes: input.notes,
        subtotal: totals.subtotal,
        vatRate: totals.vatRate,
        vatAmount: totals.vatAmount,
        discount: totals.discount,
        discountCode: discount.valid ? discount.code : null,
        total: totals.total,
        currency: totals.currency,
        paymentStatus:
          input.paymentMethod === PAYMENT_METHOD.CARD && env.payments.isConfigured
            ? PAYMENT_STATUS.PENDING
            : PAYMENT_STATUS.UNPAID,
        paymentMethod: input.paymentMethod,
        items: {
          create: items.map((item) => ({
            serviceId: item.serviceId,
            serviceName: item.serviceName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatApplicable: item.vatApplicable,
            lineTotal: item.lineTotal,
            answers: JSON.stringify(item.answers ?? {}),
          })),
        },
        timeline: {
          create: [{ type: "SYSTEM", message: "Booking created", actorId: customer.customerId }],
        },
      },
      include: { items: true },
    });

    await tx.invoice.create({
      data: {
        bookingId: created.id,
        number: `AYN-INV-${reference.replace(/^AYN-/, "")}`,
        subtotal: totals.subtotal,
        vatAmount: totals.vatAmount,
        total: totals.total,
        currency: totals.currency,
        status: "ISSUED",
      },
    });

    if (discount.valid && discount.code) {
      await tx.discountCode.updateMany({
        where: { code: discount.code },
        data: { usedCount: { increment: 1 } },
      });
    }

    return created;
  });

  const when = `${input.scheduledDate} (${windowDef.label})`;
  await sendBookingConfirmation({
    to: input.contactEmail,
    name: input.contactName,
    reference,
    serviceSummary: items.map((i) => i.serviceName).join(", "),
    when,
  });
  await createNotification({
    userId: customer.customerId,
    type: "BOOKING",
    title: "Booking created",
    body: `Your booking ${reference} has been created and is pending confirmation.`,
    link: `/dashboard/bookings/${booking.id}`,
  });

  return {
    ok: true as const,
    booking,
    accountCreated: customer.created,
    setPasswordToken: customer.setPasswordToken,
  };
}

async function getQuestionsForService(serviceId: string): Promise<ServiceQuestion[]> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { questions: true },
  });
  return parseServiceQuestions(service?.questions);
}

/**
 * Resolve the customer account for a booking.
 *
 * - Signed-in customers keep their account.
 * - A guest booking for an unknown email creates a customer account with a
 *   random password and a one-time token so they can set their own.
 * - A guest booking for a known email is attached to that account (they can
 *   sign in to manage it).
 */
async function resolveCustomer(input: CreateBookingInput) {
  if (input.customerId) {
    return {
      ok: true as const,
      customerId: input.customerId,
      created: false,
      setPasswordToken: undefined as string | undefined,
    };
  }

  try {
    const email = input.contactEmail.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return {
        ok: true as const,
        customerId: existing.id,
        created: false,
        setPasswordToken: undefined as string | undefined,
      };
    }

    const passwordHash = await hashPassword(randomToken(32));
    const user = await prisma.user.create({
      data: {
        name: input.contactName.trim(),
        email,
        phone: input.contactPhone,
        role: ROLES.CUSTOMER,
        passwordHash,
        customer: { create: {} },
      },
    });

    const token = randomToken(32);
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      ok: true as const,
      customerId: user.id,
      created: true,
      setPasswordToken: token,
    };
  } catch {
    return {
      ok: false as const,
      error: "We couldn't create your account just now. Please try again.",
    };
  }
}

async function generateUniqueReference(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const ref = generateBookingReference();
    const exists = await prisma.booking.findUnique({ where: { reference: ref }, select: { id: true } });
    if (!exists) return ref;
  }
  throw new Error("Unable to generate a unique booking reference");
}
