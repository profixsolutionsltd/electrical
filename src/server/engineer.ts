import { prisma } from "@/lib/prisma";
import {
  BOOKING_STATUS,
  ACTIVE_BOOKING_STATUSES,
  ENGINEER_STATUS,
} from "@/lib/constants";

/**
 * Data access for the engineer portal. Everything is scoped to the engineer's
 * own profile so one engineer can never see another's jobs. Private customer
 * details are only exposed for jobs actually assigned to this engineer.
 */

export async function getEngineerProfile(userId: string) {
  return prisma.engineerProfile.findUnique({
    where: { userId },
    include: {
      qualifications: { orderBy: { createdAt: "desc" } },
      availability: { orderBy: { weekday: "asc" } },
    },
  });
}

export async function getEngineerJobs(userId: string) {
  const engineer = await prisma.engineerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!engineer) return [];

  return prisma.booking.findMany({
    where: { assignedEngineerId: engineer.id },
    orderBy: { scheduledAt: "asc" },
    include: {
      items: { include: { service: true } },
      customer: { select: { name: true, email: true, phone: true } },
      documents: true,
    },
  });
}

export async function getEngineerJob(userId: string, bookingId: string) {
  const engineer = await prisma.engineerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!engineer) return null;

  // Scoped: only jobs assigned to this engineer.
  return prisma.booking.findFirst({
    where: { id: bookingId, assignedEngineerId: engineer.id },
    include: {
      items: { include: { service: true } },
      customer: { select: { name: true, email: true, phone: true } },
      documents: true,
      timeline: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function getEngineerStats(userId: string) {
  const engineer = await prisma.engineerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!engineer) {
    return { assigned: 0, inProgress: 0, completed: 0, earnings: 0 };
  }

  const [assigned, inProgress, completedJobs] = await Promise.all([
    prisma.booking.count({
      where: { assignedEngineerId: engineer.id, status: BOOKING_STATUS.ASSIGNED },
    }),
    prisma.booking.count({
      where: { assignedEngineerId: engineer.id, status: BOOKING_STATUS.IN_PROGRESS },
    }),
    prisma.booking.findMany({
      where: { assignedEngineerId: engineer.id, status: BOOKING_STATUS.COMPLETED },
      select: { total: true },
    }),
  ]);

  return {
    assigned,
    inProgress,
    completed: completedJobs.length,
    earnings: completedJobs.reduce((sum, b) => sum + b.total, 0),
  };
}
