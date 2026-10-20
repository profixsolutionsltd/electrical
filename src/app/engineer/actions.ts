"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { BOOKING_STATUS, type BookingStatus } from "@/lib/constants";
import { canTransition } from "@/lib/booking";
import { logAudit } from "@/server/audit";
import { createNotification } from "@/lib/email";
import { revalidatePath } from "next/cache";

/**
 * Engineer actions. All operate on the calling engineer s own profile and jobs.
 * Status changes go through the same allowed-transition matrix. Admin approval
 * is enforced: a pending/suspended engineer cannot accept jobs or update them.
 */

async function getApprovedEngineer() {
  const session = await getSession();
  if (!session || session.role !== "ENGINEER") return null;
  const engineer = await prisma.engineerProfile.findUnique({
    where: { userId: session.sub },
    select: { id: true, status: true },
  });
  if (!engineer || engineer.status !== "APPROVED") return null;
  return { session, engineer };
}

/** Accept an assigned job. */
export async function acceptAssignment(bookingId: string) {
  const ctx = await getApprovedEngineer();
  if (!ctx) return { ok: false, message: "Only approved engineers can accept jobs." };

  const booking = await prisma.booking.findFirst({ where: { id: bookingId, assignedEngineerId: ctx.engineer.id } });
  if (!booking) return { ok: false, message: "Job not found." };
  if (booking.status !== BOOKING_STATUS.ASSIGNED) return { ok: false, message: "This job is no longer awaiting acceptance." };

  await prisma.$transaction([
    prisma.booking.update({ where: { id: bookingId }, data: { status: BOOKING_STATUS.CONFIRMED, confirmedAt: new Date() } }),
    prisma.bookingEvent.create({ data: { bookingId, type: "ASSIGNMENT", message: "Engineer accepted the assignment", actorId: ctx.session.sub } }),
  ]);

  await createNotification({
    userId: booking.customerId,
    type: "BOOKING",
    title: "Engineer confirmed",
    body: `Your engineer has accepted booking ${booking.reference}.`,
    link: `/dashboard/bookings/${bookingId}`,
  });

  revalidatePath("/engineer/jobs");
  return { ok: true, message: "Job accepted." };
}

/** Reject an assigned job, unassigning it back to the pool. */
export async function rejectAssignment(bookingId: string, reason?: string) {
  const ctx = await getApprovedEngineer();
  if (!ctx) return { ok: false, message: "Only approved engineers can manage jobs." };

  const booking = await prisma.booking.findFirst({ where: { id: bookingId, assignedEngineerId: ctx.engineer.id } });
  if (!booking) return { ok: false, message: "Job not found." };
  if (booking.status !== BOOKING_STATUS.ASSIGNED) return { ok: false, message: "This job can no longer be rejected." };

  await prisma.$transaction([
    prisma.booking.update({ where: { id: bookingId }, data: { assignedEngineerId: null, status: BOOKING_STATUS.CONFIRMED } }),
    prisma.bookingEvent.create({ data: { bookingId, type: "ASSIGNMENT", message: `Engineer declined the assignment${reason ? `: ${reason}` : ""}`, actorId: ctx.session.sub } }),
  ]);

  await createNotification({ role: "ADMIN", type: "WARNING", title: "Assignment declined", body: `An engineer declined ${booking.reference}. Please reassign.` });

  revalidatePath("/engineer/jobs");
  return { ok: true, message: "Job declined and returned to the pool." };
}

/** Update the status of an assigned job (e.g. start, complete). */
export async function updateJobStatus(bookingId: string, to: BookingStatus, note?: string) {
  const ctx = await getApprovedEngineer();
  if (!ctx) return { ok: false, message: "Only approved engineers can update jobs." };

  const booking = await prisma.booking.findFirst({ where: { id: bookingId, assignedEngineerId: ctx.engineer.id } });
  if (!booking) return { ok: false, message: "Job not found." };

  const from = booking.status as BookingStatus;
  if (from !== to && !canTransition(from, to)) return { ok: false, message: `Cannot change status from ${from} to ${to}.` };

  const data: Record<string, unknown> = { status: to };
  if (to === BOOKING_STATUS.COMPLETED) data.completedAt = new Date();

  await prisma.$transaction([
    prisma.booking.update({ where: { id: bookingId }, data }),
    prisma.bookingEvent.create({ data: { bookingId, type: "STATUS_CHANGE", message: note ? `Status to ${to}: ${note}` : `Status to ${to}`, actorId: ctx.session.sub } }),
  ]);

  if (to === BOOKING_STATUS.COMPLETED) {
    await createNotification({
      userId: booking.customerId,
      type: "SUCCESS",
      title: "Job completed",
      body: `Your booking ${booking.reference} is complete. Documents will follow shortly.`,
      link: `/dashboard/bookings/${bookingId}`,
    });
  }

  revalidatePath(`/engineer/jobs/${bookingId}`);
  revalidatePath("/engineer/jobs");
  return { ok: true, message: `Job marked as ${to.toLowerCase()}.` };
}

/** Update the engineer s own profile details. */
export async function updateEngineerProfile(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ENGINEER") return { ok: false, message: "Not authorized" };

  const headline = String(formData.get("headline") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const basePostcode = String(formData.get("basePostcode") ?? "").trim();
  const coverageCities = String(formData.get("coverageCities") ?? "").trim();
  const yearsExperience = formData.get("yearsExperience");

  await prisma.engineerProfile.update({
    where: { userId: session.sub },
    data: {
      headline: headline || null,
      bio: bio || null,
      companyName: companyName || null,
      basePostcode: basePostcode || null,
      coverageCities: coverageCities || null,
      yearsExperience: yearsExperience ? Number(yearsExperience) : null,
    },
  });

  revalidatePath("/engineer/profile");
  return { ok: true, message: "Profile updated." };
}

/** Update weekly availability (replaces existing rows). */
export async function updateAvailability(entries: { weekday: number; startTime: string; endTime: string; active: boolean }[]) {
  const session = await getSession();
  if (!session || session.role !== "ENGINEER") return { ok: false, message: "Not authorized" };

  const engineer = await prisma.engineerProfile.findUnique({ where: { userId: session.sub }, select: { id: true } });
  if (!engineer) return { ok: false, message: "Profile not found." };

  await prisma.$transaction([
    prisma.engineerAvailability.deleteMany({ where: { engineerId: engineer.id } }),
    prisma.engineerAvailability.createMany({
      data: entries.filter((e) => e.active).map((e) => ({ engineerId: engineer.id, weekday: e.weekday, startTime: e.startTime, endTime: e.endTime, active: true })),
    }),
  ]);

  revalidatePath("/engineer/availability");
  return { ok: true, message: "Availability updated." };
}

/** Upload a job report / certificate document for a completed job. */
export async function uploadJobReport(bookingId: string, filename: string, url: string) {
  const ctx = await getApprovedEngineer();
  if (!ctx) return { ok: false, message: "Only approved engineers can upload reports." };

  const booking = await prisma.booking.findFirst({ where: { id: bookingId, assignedEngineerId: ctx.engineer.id }, select: { id: true, customerId: true, reference: true } });
  if (!booking) return { ok: false, message: "Job not found." };

  await prisma.document.create({ data: { bookingId: booking.id, ownerUserId: booking.customerId, uploadedById: ctx.session.sub, type: "REPORT", filename, url, accessRole: "CUSTOMER" } });

  await prisma.bookingEvent.create({ data: { bookingId: booking.id, type: "NOTE", message: `Report uploaded: ${filename}`, actorId: ctx.session.sub } });

  await createNotification({ userId: booking.customerId, type: "SUCCESS", title: "New document available", body: `A report for booking ${booking.reference} is now available.`, link: `/dashboard/bookings/${booking.id}` });

  revalidatePath(`/engineer/jobs/${bookingId}`);
  return { ok: true, message: "Report uploaded." };
}

/** Add a new professional qualification or certification for admin review. */
export async function addQualification(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ENGINEER") return { ok: false, message: "Not authorized" };

  const engineer = await prisma.engineerProfile.findUnique({ where: { userId: session.sub }, select: { id: true } });
  if (!engineer) return { ok: false, message: "Profile not found." };

  const title = String(formData.get("title") ?? "").trim();
  const issuer = String(formData.get("issuer") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const documentUrl = String(formData.get("documentUrl") ?? "").trim();
  const expiresAtRaw = formData.get("expiresAt") ? String(formData.get("expiresAt")) : null;

  if (!title) return { ok: false, message: "Qualification title is required." };

  await prisma.qualification.create({
    data: {
      engineerId: engineer.id,
      title,
      issuer: issuer || null,
      reference: reference || null,
      documentUrl: documentUrl || null,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
      verified: false,
    },
  });

  await createNotification({
    role: "ADMIN",
    type: "INFO",
    title: "New qualification submitted",
    body: `${session.name} submitted a new credential: ${title}.`,
    link: `/admin/users/${session.sub}`,
  });

  revalidatePath("/engineer/qualifications");
  return { ok: true, message: "Qualification added and submitted for verification." };
}

/** Delete an unverified or obsolete qualification. */
export async function deleteQualification(qualificationId: string) {
  const session = await getSession();
  if (!session || session.role !== "ENGINEER") return { ok: false, message: "Not authorized" };

  const engineer = await prisma.engineerProfile.findUnique({ where: { userId: session.sub }, select: { id: true } });
  if (!engineer) return { ok: false, message: "Profile not found." };

  const qualification = await prisma.qualification.findFirst({
    where: { id: qualificationId, engineerId: engineer.id },
  });
  if (!qualification) return { ok: false, message: "Qualification not found." };

  await prisma.qualification.delete({ where: { id: qualificationId } });

  revalidatePath("/engineer/qualifications");
  return { ok: true, message: "Qualification removed." };
}

