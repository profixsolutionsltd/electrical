import { prisma } from "@/lib/prisma";
import {
  BOOKING_STATUS,
  ACTIVE_BOOKING_STATUSES,
  PAYMENT_STATUS,
} from "@/lib/constants";

/**
 * Read-only data access for the customer dashboard. Always scoped to a single
 * customer id so one customer can never see another's data.
 */

export async function getCustomerOverview(customerId: string) {
  const now = new Date();
  const [
    upcoming,
    active,
    completed,
    cancelled,
    pendingPayments,
    recent,
    nextBooking,
    unreadNotifications,
  ] = await Promise.all([
    prisma.booking.count({
      where: {
        customerId,
        status: { in: ACTIVE_BOOKING_STATUSES },
        scheduledAt: { gte: now },
      },
    }),
    prisma.booking.count({
      where: { customerId, status: { in: ACTIVE_BOOKING_STATUSES } },
    }),
    prisma.booking.count({ where: { customerId, status: BOOKING_STATUS.COMPLETED } }),
    prisma.booking.count({ where: { customerId, status: BOOKING_STATUS.CANCELLED } }),
    prisma.booking.count({
      where: { customerId, paymentStatus: { in: [PAYMENT_STATUS.UNPAID, PAYMENT_STATUS.PENDING] }, status: { not: BOOKING_STATUS.CANCELLED } },
    }),
    prisma.booking.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
    prisma.booking.findFirst({
      where: {
        customerId,
        status: { in: ACTIVE_BOOKING_STATUSES },
        scheduledAt: { gte: now },
      },
      orderBy: { scheduledAt: "asc" },
      include: {
        items: true,
        assignedEngineer: { include: { user: { select: { name: true } } } },
      },
    }),
    prisma.notification.count({ where: { userId: customerId, readAt: null } }),
  ]);

  return {
    upcoming,
    active,
    completed,
    cancelled,
    pendingPayments,
    recent,
    nextBooking,
    unreadNotifications,
  };
}

export async function getCustomerBookings(customerId: string) {
  return prisma.booking.findMany({
    where: { customerId },
    orderBy: { scheduledAt: "desc" },
    include: {
      items: { include: { service: true } },
      assignedEngineer: { include: { user: { select: { name: true } } } },
    },
  });
}

export async function getCustomerBooking(customerId: string, bookingId: string) {
  return prisma.booking.findFirst({
    where: { id: bookingId, customerId },
    include: {
      items: { include: { service: true } },
      assignedEngineer: { include: { user: { select: { name: true, email: true } } } },
      invoice: true,
      documents: true,
      timeline: { orderBy: { createdAt: "asc" } },
      property: true,
    },
  });
}

export async function getCustomerProperties(customerId: string) {
  return prisma.property.findMany({
    where: { customerId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function getCustomerInvoices(customerId: string) {
  return prisma.invoice.findMany({
    where: { booking: { customerId } },
    orderBy: { issuedAt: "desc" },
    include: { booking: { select: { reference: true } } },
  });
}

export async function getCustomerDocuments(customerId: string) {
  return prisma.document.findMany({
    where: {
      OR: [
        { ownerUserId: customerId },
        { booking: { customerId } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { booking: { select: { reference: true } } },
  });
}

export async function getCustomerNotifications(customerId: string) {
  return prisma.notification.findMany({
    where: { userId: customerId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getUnreadNotificationCount(customerId: string) {
  return prisma.notification.count({ where: { userId: customerId, readAt: null } });
}
