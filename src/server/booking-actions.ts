"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  BOOKING_STATUS,
  type BookingStatus,
  ACTIVE_BOOKING_STATUSES,
} from "@/lib/constants";
import { canTransition } from "@/lib/booking";
import { canReschedule, isCancellable, TIME_WINDOWS, type TimeWindow } from "@/lib/slots";
import { getSettings } from "./settings";
import { logAudit } from "./audit";
import { createNotification, sendBookingReminder } from "@/lib/email";
import { revalidatePath } from "next/cache";

/**
 * Booking status transitions, rescheduling and cancellation. Enforces the
 * allowed-transition matrix on the server regardless of who calls it.
 */

export interface ActionResult {
  ok: boolean;
  message: string;
}

async function loadOwnedBooking(bookingId: string) {
  const session = await getSession();
  if (!session) return { session: null, booking: null };
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: session.sub },
  });
  return { session, booking };
}

/** Customer cancels their own booking (subject to policy). */
export async function cancelBooking(bookingId: string, reason?: string): Promise<ActionResult> {
  const { session, booking } = await loadOwnedBooking(bookingId);
  if (!session || !booking) return { ok: false, message: "Booking not found." };

  if (booking.status === BOOKING_STATUS.CANCELLED || booking.status === BOOKING_STATUS.COMPLETED) {
    return { ok: false, message: "This booking can no longer be cancelled." };
  }
  if (!isCancellable(booking.scheduledAt, new Date(), 0)) {
    return { ok: false, message: "This appointment is in the past and cannot be cancelled." };
  }

  await applyStatusChange(bookingId, BOOKING_STATUS.CANCELLED, {
    message: `Booking cancelled${reason ? `: ${reason}` : ""}`,
    actorId: session.sub,
    cancellationReason: reason,
  });

  await createNotification({
    userId: session.sub,
    type: "WARNING",
    title: "Booking cancelled",
    body: `Your booking ${booking.reference} has been cancelled.`,
    link: `/dashboard/bookings/${bookingId}`,
  });

  revalidatePath("/dashboard/bookings");
  revalidatePath(`/dashboard/bookings/${bookingId}`);
  return { ok: true, message: "Your booking has been cancelled." };
}

/** Customer reschedules their own booking to a new date/window. */
export async function rescheduleBooking(
  bookingId: string,
  scheduledDate: string,
  timeWindow: TimeWindow,
): Promise<ActionResult> {
  const { session, booking } = await loadOwnedBooking(bookingId);
  if (!session || !booking) return { ok: false, message: "Booking not found." };
  if (!canReschedule(booking.scheduledAt)) {
    return { ok: false, message: "This appointment can no longer be rescheduled." };
  }
  if (!ACTIVE_BOOKING_STATUSES.includes(booking.status as BookingStatus)) {
    return { ok: false, message: "Only active bookings can be rescheduled." };
  }

  const settings = await getSettings();
  const windowDef = TIME_WINDOWS.find((w) => w.value === timeWindow) ?? TIME_WINDOWS[0];
  const scheduledAt = new Date(`${scheduledDate}T${windowDef.start}:00`);

  const dayStart = new Date(`${scheduledDate}T00:00:00`);
  const dayEnd = new Date(`${scheduledDate}T23:59:59`);
  const count = await prisma.booking.count({
    where: {
      id: { not: bookingId },
      status: { notIn: [BOOKING_STATUS.CANCELLED] },
      timeWindow,
      scheduledAt: { gte: dayStart, lte: dayEnd },
    },
  });
  if (count >= settings.slotCapacityPerWindow) {
    return { ok: false, message: "That slot is now full. Please choose another time." };
  }

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: {
        scheduledAt,
        timeWindow,
        rescheduleCount: { increment: 1 },
        status: BOOKING_STATUS.PENDING,
        confirmedAt: null,
      },
    }),
    prisma.bookingEvent.create({
      data: {
        bookingId,
        type: "STATUS_CHANGE",
        message: `Rescheduled to ${scheduledDate} (${windowDef.label})`,
        actorId: session.sub,
      },
    }),
  ]);

  await sendBookingReminder({
    to: booking.contactEmail,
    name: booking.contactName,
    reference: booking.reference,
    when: `${scheduledDate} (${windowDef.label})`,
  });

  revalidatePath("/dashboard/bookings");
  revalidatePath(`/dashboard/bookings/${bookingId}`);
  return { ok: true, message: "Your appointment has been rescheduled." };
}

/**
 * Internal helper to apply a status change and record it in the timeline.
 * Enforces the allowed-transition matrix regardless of caller.
 */
async function applyStatusChange(
  bookingId: string,
  to: BookingStatus,
  options: { message: string; actorId?: string; cancellationReason?: string; ip?: string },
) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");

  const from = booking.status as BookingStatus;
  if (from !== to && !canTransition(from, to)) {
    throw new Error(`Cannot change status from ${from} to ${to}`);
  }

  const data: Record<string, unknown> = { status: to };
  if (to === BOOKING_STATUS.CONFIRMED) data.confirmedAt = new Date();
  if (to === BOOKING_STATUS.COMPLETED) data.completedAt = new Date();
  if (to === BOOKING_STATUS.CANCELLED) {
    data.cancelledAt = new Date();
    if (options.cancellationReason) data.cancellationReason = options.cancellationReason;
  }

  await prisma.booking.update({ where: { id: bookingId }, data });
  await prisma.bookingEvent.create({
    data: { bookingId, type: "STATUS_CHANGE", message: options.message, actorId: options.actorId },
  });
  await logAudit({
    actorId: options.actorId,
    action: `BOOKING_${to}`,
    entity: "Booking",
    entityId: bookingId,
    ip: options.ip,
  });
}

