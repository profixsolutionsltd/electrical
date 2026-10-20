import { prisma } from "@/lib/prisma";
import { BOOKING_STATUS, PAYMENT_STATUS, ROLES, ENGINEER_STATUS } from "@/lib/constants";

export async function getAdminOverviewStats() {
  const [
    totalCustomers,
    totalEngineers,
    pendingEngineers,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    payments,
    recentBookings,
    recentAuditLogs,
    premiumWaitlistCount,
    googleLinkedAccounts,
  ] = await Promise.all([
    prisma.user.count({ where: { role: ROLES.CUSTOMER } }),
    prisma.user.count({ where: { role: ROLES.ENGINEER } }),
    prisma.engineerProfile.count({ where: { status: ENGINEER_STATUS.PENDING } }),
    prisma.booking.count({ where: { status: BOOKING_STATUS.PENDING } }),
    prisma.booking.count({ where: { status: BOOKING_STATUS.CONFIRMED } }),
    prisma.booking.count({ where: { status: BOOKING_STATUS.COMPLETED } }),
    prisma.booking.count({ where: { status: BOOKING_STATUS.CANCELLED } }),
    prisma.payment.findMany({
      where: { status: PAYMENT_STATUS.PAID },
      select: { amount: true, refundedAmount: true },
    }),
    prisma.booking.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true } },
        items: { select: { serviceName: true } },
      },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        actor: { select: { name: true, email: true, role: true } },
      },
    }),
    prisma.premiumWaitlist.count(),
    prisma.account.count(),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount - p.refundedAmount), 0);

  return {
    totalCustomers,
    totalEngineers,
    pendingEngineers,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    totalRevenue,
    recentBookings,
    recentAuditLogs,
    premiumWaitlistCount,
    googleLinkedAccounts,
  };
}

export async function getAdminUsers(params?: {
  role?: string;
  search?: string;
  status?: string;
}) {
  const where: Record<string, unknown> = {};

  if (params?.role) where.role = params.role;
  if (params?.status) where.status = params.status;
  if (params?.search) {
    where.OR = [
      { name: { contains: params.search } },
      { email: { contains: params.search } },
      { phone: { contains: params.search } },
    ];
  }

  return prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      engineer: {
        include: {
          qualifications: true,
        },
      },
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });
}

export async function getAdminUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      customer: true,
      engineer: {
        include: {
          qualifications: { orderBy: { createdAt: "desc" } },
          availability: { orderBy: { weekday: "asc" } },
          assignments: {
            take: 10,
            orderBy: { scheduledAt: "desc" },
            include: { items: true },
          },
        },
      },
      properties: true,
      bookings: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { items: true, invoice: true },
      },
      auditLogs: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getAdminServices() {
  return prisma.service.findMany({
    orderBy: [{ category: { order: "asc" } }, { name: "asc" }],
    include: {
      category: true,
      faqs: { orderBy: { order: "asc" } },
      _count: {
        select: { bookingItems: true },
      },
    },
  });
}

export async function getAdminService(serviceId: string) {
  return prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      category: true,
      faqs: { orderBy: { order: "asc" } },
    },
  });
}

export async function getAdminCategories() {
  return prisma.serviceCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { services: true },
      },
    },
  });
}

export async function getAdminBookings(params?: {
  status?: string;
  search?: string;
  serviceId?: string;
  assignedEngineerId?: string;
}) {
  const where: Record<string, unknown> = {};

  if (params?.status) where.status = params.status;
  if (params?.assignedEngineerId) where.assignedEngineerId = params.assignedEngineerId;
  if (params?.serviceId) {
    where.items = { some: { serviceId: params.serviceId } };
  }
  if (params?.search) {
    where.OR = [
      { reference: { contains: params.search } },
      { contactName: { contains: params.search } },
      { contactEmail: { contains: params.search } },
      { postcode: { contains: params.search } },
    ];
  }

  return prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      assignedEngineer: {
        include: {
          user: { select: { name: true, phone: true } },
        },
      },
      items: { include: { service: true } },
      payments: true,
      invoice: true,
    },
  });
}

export async function getAdminBooking(bookingId: string) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      property: true,
      assignedEngineer: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          qualifications: true,
        },
      },
      items: { include: { service: true } },
      payments: { orderBy: { createdAt: "desc" } },
      invoice: true,
      documents: { orderBy: { createdAt: "desc" } },
      timeline: { orderBy: { createdAt: "asc" } },
      tickets: true,
    },
  });
}

export async function getAdminAvailableEngineers() {
  return prisma.engineerProfile.findMany({
    where: { status: ENGINEER_STATUS.APPROVED },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
    orderBy: { user: { name: "asc" } },
  });
}

export async function getAdminFinance() {
  const [payments, invoices] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          select: {
            id: true,
            reference: true,
            contactName: true,
            contactEmail: true,
          },
        },
      },
    }),
    prisma.invoice.findMany({
      orderBy: { issuedAt: "desc" },
      include: {
        booking: {
          select: {
            id: true,
            reference: true,
            contactName: true,
          },
        },
      },
    }),
  ]);

  const totalReceived = payments
    .filter((p) => p.status === PAYMENT_STATUS.PAID)
    .reduce((sum, p) => sum + (p.amount - p.refundedAmount), 0);

  const pendingPayments = payments
    .filter((p) => p.status === PAYMENT_STATUS.PENDING)
    .reduce((sum, p) => sum + p.amount, 0);

  const refundedTotal = payments.reduce((sum, p) => sum + p.refundedAmount, 0);

  return {
    payments,
    invoices,
    totalReceived,
    pendingPayments,
    refundedTotal,
  };
}

export async function getAdminContent() {
  const [faqs, testimonials, banners, serviceAreas, contentItems] = await Promise.all([
    prisma.faq.findMany({ orderBy: { order: "asc" } }),
    prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.banner.findMany({ orderBy: { order: "asc" } }),
    prisma.serviceArea.findMany({ orderBy: { postcodePrefix: "asc" } }),
    prisma.siteContent.findMany({ orderBy: { key: "asc" } }),
  ]);

  return {
    faqs,
    testimonials,
    banners,
    serviceAreas,
    contentItems,
  };
}

export async function getAdminSettings() {
  const [settings, auditLogs] = await Promise.all([
    prisma.systemSetting.findMany({ orderBy: { key: "asc" } }),
    prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        actor: { select: { name: true, email: true, role: true } },
      },
    }),
  ]);

  return {
    settings,
    auditLogs,
  };
}
