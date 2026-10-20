"use server";

import { prisma } from "@/lib/prisma";
import { assertRole } from "@/server/guards";
import { ROLES, BOOKING_STATUS, ENGINEER_STATUS, PAYMENT_STATUS, type BookingStatus } from "@/lib/constants";
import { logAudit } from "@/server/audit";
import { createNotification } from "@/lib/email";
import { normaliseCode } from "@/lib/discounts";
import { revalidatePath } from "next/cache";

/** Helper to require admin credentials for every admin action. */
async function getAdminActor() {
  const session = await assertRole([ROLES.ADMIN]);
  return session;
}

/**
 * Validate the booking-questions payload coming from the service form.
 * Returns the JSON string to store (or null when there are no questions).
 */
function normaliseQuestionsInput(raw: FormDataEntryValue | null): {
  value: string | null;
  error?: string;
} {
  const text = String(raw ?? "").trim();
  if (!text || text === "[]") return { value: null };

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { value: null, error: "Booking questions must be valid JSON." };
  }

  if (!Array.isArray(parsed)) {
    return { value: null, error: "Booking questions must be a JSON array." };
  }

  for (const entry of parsed) {
    if (
      !entry ||
      typeof entry !== "object" ||
      typeof (entry as Record<string, unknown>).id !== "string" ||
      typeof (entry as Record<string, unknown>).label !== "string"
    ) {
      return { value: null, error: "Every booking question needs an id and a label." };
    }
  }

  return { value: JSON.stringify(parsed) };
}

// ---------------------------------------------------------------------------
// User & Engineer Management
// ---------------------------------------------------------------------------

export async function toggleUserStatus(userId: string, status: "ACTIVE" | "SUSPENDED") {
  const actor = await getAdminActor();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, message: "User not found" };

  if (user.id === actor.sub) {
    return { ok: false, message: "Cannot suspend your own admin account" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  await logAudit({
    actorId: actor.sub,
    action: "USER_STATUS_CHANGE",
    entity: "User",
    entityId: userId,
    metadata: { previousStatus: user.status, newStatus: status },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { ok: true, message: `User marked as ${status.toLowerCase()}` };
}

export async function updateUserRole(userId: string, role: string) {
  const actor = await getAdminActor();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, message: "User not found" };

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  await logAudit({
    actorId: actor.sub,
    action: "USER_ROLE_CHANGE",
    entity: "User",
    entityId: userId,
    metadata: { previousRole: user.role, newRole: role },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { ok: true, message: `User role updated to ${role}` };
}

export async function reviewEngineer(
  engineerProfileId: string,
  status: "APPROVED" | "PENDING" | "SUSPENDED",
  reviewNotes?: string,
) {
  const actor = await getAdminActor();

  const profile = await prisma.engineerProfile.findUnique({
    where: { id: engineerProfileId },
    include: { user: true },
  });
  if (!profile) return { ok: false, message: "Engineer profile not found" };

  await prisma.engineerProfile.update({
    where: { id: engineerProfileId },
    data: {
      status,
      reviewedById: actor.sub,
      reviewedAt: new Date(),
      reviewNotes: reviewNotes || null,
    },
  });

  await logAudit({
    actorId: actor.sub,
    action: "ENGINEER_REVIEW",
    entity: "EngineerProfile",
    entityId: engineerProfileId,
    metadata: { previousStatus: profile.status, newStatus: status, notes: reviewNotes },
  });

  await createNotification({
    userId: profile.userId,
    type: status === "APPROVED" ? "SUCCESS" : "WARNING",
    title: status === "APPROVED" ? "Application Approved" : `Application ${status.toLowerCase()}`,
    body:
      status === "APPROVED"
        ? "Your engineer account has been approved. You are now eligible to receive job assignments."
        : `Your engineer status has been updated to ${status}. Notes: ${reviewNotes || "None"}`,
    link: "/engineer",
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${profile.userId}`);
  return { ok: true, message: `Engineer application marked as ${status.toLowerCase()}` };
}

export async function verifyQualification(qualificationId: string, verified: boolean) {
  const actor = await getAdminActor();

  const qual = await prisma.qualification.findUnique({
    where: { id: qualificationId },
    include: { engineer: true },
  });
  if (!qual) return { ok: false, message: "Qualification not found" };

  await prisma.qualification.update({
    where: { id: qualificationId },
    data: {
      verified,
      verifiedById: verified ? actor.sub : null,
      verifiedAt: verified ? new Date() : null,
    },
  });

  await logAudit({
    actorId: actor.sub,
    action: "QUALIFICATION_VERIFY",
    entity: "Qualification",
    entityId: qualificationId,
    metadata: { title: qual.title, verified },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${qual.engineer.userId}`);
  return { ok: true, message: verified ? "Qualification verified" : "Qualification unverified" };
}

// ---------------------------------------------------------------------------
// Service Catalogue Management
// ---------------------------------------------------------------------------

export async function saveService(formData: FormData) {
  const actor = await getAdminActor();

  const id = formData.get("id") ? String(formData.get("id")) : undefined;
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const categoryId = String(formData.get("categoryId") ?? "");
  const summary = String(formData.get("summary") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceFromPence = Math.round(Number(formData.get("priceFrom") ?? 0) * 100);
  const durationMinutes = Number(formData.get("durationMinutes") ?? 60);
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const published = formData.get("published") === "true";
  const featured = formData.get("featured") === "true";
  const vatApplicable = formData.get("vatApplicable") !== "false";
  const metaTitle = String(formData.get("metaTitle") ?? "").trim() || null;
  const metaDescription = String(formData.get("metaDescription") ?? "").trim() || null;
  const featuresRaw = String(formData.get("features") ?? "").trim();
  const features = featuresRaw ? JSON.stringify(featuresRaw.split("\n").map((f) => f.trim()).filter(Boolean)) : null;
  const questions = normaliseQuestionsInput(formData.get("questions"));

  if (!name || !slug || !categoryId || !summary || !description) {
    return { ok: false, message: "Please fill in all required fields." };
  }

  if (questions.error) {
    return { ok: false, message: questions.error };
  }

  if (id) {
    await prisma.service.update({
      where: { id },
      data: {
        name,
        slug,
        categoryId,
        summary,
        description,
        features,
        questions: questions.value,
        priceFrom: priceFromPence,
        durationMinutes,
        imageUrl,
        published,
        featured,
        vatApplicable,
        metaTitle,
        metaDescription,
      },
    });
    await logAudit({
      actorId: actor.sub,
      action: "SERVICE_UPDATE",
      entity: "Service",
      entityId: id,
      metadata: { name, slug },
    });
  } else {
    const created = await prisma.service.create({
      data: {
        name,
        slug,
        categoryId,
        summary,
        description,
        features,
        questions: questions.value,
        priceFrom: priceFromPence,
        durationMinutes,
        imageUrl,
        published,
        featured,
        vatApplicable,
        metaTitle,
        metaDescription,
      },
    });
    await logAudit({
      actorId: actor.sub,
      action: "SERVICE_CREATE",
      entity: "Service",
      entityId: created.id,
      metadata: { name, slug },
    });
  }

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { ok: true, message: id ? "Service updated successfully" : "Service created successfully" };
}

export async function deleteService(serviceId: string) {
  const actor = await getAdminActor();

  const count = await prisma.bookingItem.count({ where: { serviceId } });
  if (count > 0) {
    return { ok: false, message: "Cannot delete service that has historical bookings. Unpublish it instead." };
  }

  await prisma.service.delete({ where: { id: serviceId } });

  await logAudit({
    actorId: actor.sub,
    action: "SERVICE_DELETE",
    entity: "Service",
    entityId: serviceId,
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { ok: true, message: "Service deleted" };
}

export async function toggleServicePublished(serviceId: string) {
  const actor = await getAdminActor();

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return { ok: false, message: "Service not found" };

  const updated = await prisma.service.update({
    where: { id: serviceId },
    data: { published: !service.published },
  });

  await logAudit({
    actorId: actor.sub,
    action: "SERVICE_TOGGLE_PUBLISHED",
    entity: "Service",
    entityId: serviceId,
    metadata: { published: updated.published },
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { ok: true, message: `Service ${updated.published ? "published" : "unpublished"}` };
}

export async function saveCategory(formData: FormData) {
  const actor = await getAdminActor();

  const id = formData.get("id") ? String(formData.get("id")) : undefined;
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const description = String(formData.get("description") ?? "").trim() || null;
  const order = Number(formData.get("order") ?? 0);

  if (!name || !slug) return { ok: false, message: "Category name and slug are required" };

  if (id) {
    await prisma.serviceCategory.update({
      where: { id },
      data: { name, slug, description, order },
    });
  } else {
    await prisma.serviceCategory.create({
      data: { name, slug, description, order },
    });
  }

  await logAudit({
    actorId: actor.sub,
    action: id ? "CATEGORY_UPDATE" : "CATEGORY_CREATE",
    entity: "ServiceCategory",
    entityId: id,
    metadata: { name, slug },
  });

  revalidatePath("/admin/services");
  return { ok: true, message: "Category saved" };
}

export async function deleteCategory(categoryId: string) {
  const actor = await getAdminActor();

  const count = await prisma.service.count({ where: { categoryId } });
  if (count > 0) return { ok: false, message: "Cannot delete category containing services." };

  await prisma.serviceCategory.delete({ where: { id: categoryId } });

  await logAudit({
    actorId: actor.sub,
    action: "CATEGORY_DELETE",
    entity: "ServiceCategory",
    entityId: categoryId,
  });

  revalidatePath("/admin/services");
  return { ok: true, message: "Category deleted" };
}

export async function saveServiceFaq(formData: FormData) {
  const actor = await getAdminActor();
  const id = formData.get("id") ? String(formData.get("id")) : undefined;
  const serviceId = String(formData.get("serviceId") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);

  if (!serviceId || !question || !answer) {
    return { ok: false, message: "Service, question and answer are required" };
  }

  if (id) {
    await prisma.serviceFaq.update({
      where: { id },
      data: { question, answer, order },
    });
  } else {
    await prisma.serviceFaq.create({
      data: { serviceId, question, answer, order },
    });
  }

  revalidatePath(`/admin/services/${serviceId}`);
  revalidatePath("/admin/services");
  return { ok: true, message: "Service FAQ saved" };
}

export async function deleteServiceFaq(faqId: string) {
  await getAdminActor();
  const faq = await prisma.serviceFaq.findUnique({ where: { id: faqId } });
  if (!faq) return { ok: false, message: "FAQ not found" };

  await prisma.serviceFaq.delete({ where: { id: faqId } });
  revalidatePath(`/admin/services/${faq.serviceId}`);
  revalidatePath("/admin/services");
  return { ok: true, message: "FAQ deleted" };
}

// ---------------------------------------------------------------------------
// Booking Operations
// ---------------------------------------------------------------------------

export async function assignBookingEngineer(bookingId: string, engineerId: string | null) {
  const actor = await getAdminActor();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { assignedEngineer: { include: { user: true } } },
  });
  if (!booking) return { ok: false, message: "Booking not found" };

  let engineerName = "Unassigned";
  if (engineerId) {
    const engineer = await prisma.engineerProfile.findUnique({
      where: { id: engineerId },
      include: { user: true },
    });
    if (!engineer) return { ok: false, message: "Selected engineer does not exist" };
    if (engineer.status !== ENGINEER_STATUS.APPROVED) {
      return { ok: false, message: "Cannot assign a pending or suspended engineer." };
    }
    engineerName = engineer.user.name;
  }

  const newStatus = engineerId ? BOOKING_STATUS.ASSIGNED : BOOKING_STATUS.CONFIRMED;

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: {
        assignedEngineerId: engineerId,
        status: booking.status === BOOKING_STATUS.PENDING ? newStatus : booking.status,
      },
    }),
    prisma.bookingEvent.create({
      data: {
        bookingId,
        type: "ASSIGNMENT",
        message: engineerId ? `Admin assigned job to ${engineerName}` : "Admin unassigned engineer",
        actorId: actor.sub,
      },
    }),
  ]);

  if (engineerId) {
    const eng = await prisma.engineerProfile.findUnique({ where: { id: engineerId }, select: { userId: true } });
    if (eng) {
      await createNotification({
        userId: eng.userId,
        type: "BOOKING",
        title: "New Job Assignment",
        body: `You have been assigned to booking ${booking.reference}.`,
        link: `/engineer/jobs/${bookingId}`,
      });
    }
  }

  await logAudit({
    actorId: actor.sub,
    action: "BOOKING_ASSIGN_ENGINEER",
    entity: "Booking",
    entityId: bookingId,
    metadata: { engineerId, engineerName },
  });

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
  return { ok: true, message: `Job ${engineerId ? "assigned to " + engineerName : "unassigned"}` };
}

export async function updateBookingStatusAdmin(bookingId: string, status: BookingStatus, note?: string) {
  const actor = await getAdminActor();

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { ok: false, message: "Booking not found" };

  const data: Record<string, unknown> = { status };
  if (status === BOOKING_STATUS.CONFIRMED && !booking.confirmedAt) data.confirmedAt = new Date();
  if (status === BOOKING_STATUS.COMPLETED && !booking.completedAt) data.completedAt = new Date();
  if (status === BOOKING_STATUS.CANCELLED && !booking.cancelledAt) {
    data.cancelledAt = new Date();
    data.cancellationReason = note || "Cancelled by administrator";
  }

  await prisma.$transaction([
    prisma.booking.update({ where: { id: bookingId }, data }),
    prisma.bookingEvent.create({
      data: {
        bookingId,
        type: "STATUS_CHANGE",
        message: note ? `Admin set status to ${status}: ${note}` : `Admin set status to ${status}`,
        actorId: actor.sub,
      },
    }),
  ]);

  await createNotification({
    userId: booking.customerId,
    type: "BOOKING",
    title: `Booking update: ${status}`,
    body: `Your booking ${booking.reference} status is now ${status}. ${note || ""}`,
    link: `/dashboard/bookings/${bookingId}`,
  });

  await logAudit({
    actorId: actor.sub,
    action: "BOOKING_STATUS_CHANGE",
    entity: "Booking",
    entityId: bookingId,
    metadata: { from: booking.status, to: status, note },
  });

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
  return { ok: true, message: `Booking status updated to ${status}` };
}

export async function rescheduleBookingAdmin(bookingId: string, scheduledAt: string, timeWindow: string) {
  const actor = await getAdminActor();

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { ok: false, message: "Booking not found" };

  const newDate = new Date(scheduledAt);

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: {
        scheduledAt: newDate,
        timeWindow,
        rescheduleCount: { increment: 1 },
      },
    }),
    prisma.bookingEvent.create({
      data: {
        bookingId,
        type: "RESCHEDULE",
        message: `Admin rescheduled appointment to ${newDate.toLocaleDateString()} (${timeWindow})`,
        actorId: actor.sub,
      },
    }),
  ]);

  await createNotification({
    userId: booking.customerId,
    type: "BOOKING",
    title: "Appointment Rescheduled",
    body: `Your appointment for booking ${booking.reference} has been moved to ${newDate.toLocaleDateString()} (${timeWindow}).`,
    link: `/dashboard/bookings/${bookingId}`,
  });

  await logAudit({
    actorId: actor.sub,
    action: "BOOKING_RESCHEDULE",
    entity: "Booking",
    entityId: bookingId,
    metadata: { scheduledAt, timeWindow },
  });

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
  return { ok: true, message: "Appointment rescheduled successfully" };
}

// ---------------------------------------------------------------------------
// Finance Management
// ---------------------------------------------------------------------------

export async function recordManualPayment(formData: FormData) {
  const actor = await getAdminActor();

  const bookingId = String(formData.get("bookingId") ?? "");
  const amountPence = Math.round(Number(formData.get("amount") ?? 0) * 100);
  const method = String(formData.get("method") ?? "BANK_TRANSFER");
  const providerRef = String(formData.get("providerRef") ?? "").trim() || null;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { ok: false, message: "Booking not found" };
  if (amountPence <= 0) return { ok: false, message: "Amount must be greater than zero" };

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        bookingId,
        amount: amountPence,
        currency: booking.currency,
        status: PAYMENT_STATUS.PAID,
        method,
        providerRef,
        paidAt: new Date(),
      },
    }),
    prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: PAYMENT_STATUS.PAID },
    }),
    prisma.bookingEvent.create({
      data: {
        bookingId,
        type: "PAYMENT",
        message: `Manual payment of £${(amountPence / 100).toFixed(2)} recorded (${method})`,
        actorId: actor.sub,
      },
    }),
  ]);

  await logAudit({
    actorId: actor.sub,
    action: "PAYMENT_RECORD_MANUAL",
    entity: "Payment",
    metadata: { bookingId, amount: amountPence, method },
  });

  revalidatePath("/admin/finance");
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
  return { ok: true, message: "Payment recorded successfully" };
}

export async function refundPayment(paymentId: string, refundPence: number) {
  const actor = await getAdminActor();

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: true },
  });
  if (!payment) return { ok: false, message: "Payment not found" };
  if (refundPence <= 0 || payment.refundedAmount + refundPence > payment.amount) {
    return { ok: false, message: "Invalid refund amount" };
  }

  const updatedRefund = payment.refundedAmount + refundPence;
  const newStatus = PAYMENT_STATUS.REFUNDED;

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: {
        refundedAmount: updatedRefund,
        status: newStatus,
      },
    }),
    prisma.bookingEvent.create({
      data: {
        bookingId: payment.bookingId,
        type: "PAYMENT",
        message: `Refund of £${(refundPence / 100).toFixed(2)} issued by admin`,
        actorId: actor.sub,
      },
    }),
  ]);

  await logAudit({
    actorId: actor.sub,
    action: "PAYMENT_REFUND",
    entity: "Payment",
    entityId: paymentId,
    metadata: { refundPence, newStatus },
  });

  revalidatePath("/admin/finance");
  revalidatePath(`/admin/bookings/${payment.bookingId}`);
  return { ok: true, message: "Refund processed" };
}

// ---------------------------------------------------------------------------
// Content Management
// ---------------------------------------------------------------------------

export async function saveFaq(formData: FormData) {
  const actor = await getAdminActor();

  const id = formData.get("id") ? String(formData.get("id")) : undefined;
  const category = String(formData.get("category") ?? "general");
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);
  const active = formData.get("active") !== "false";

  if (!question || !answer) return { ok: false, message: "Question and answer are required" };

  if (id) {
    await prisma.faq.update({
      where: { id },
      data: { category, question, answer, order, active },
    });
  } else {
    await prisma.faq.create({
      data: { category, question, answer, order, active },
    });
  }

  await logAudit({
    actorId: actor.sub,
    action: id ? "FAQ_UPDATE" : "FAQ_CREATE",
    entity: "Faq",
    entityId: id,
    metadata: { question },
  });

  revalidatePath("/admin/content");
  revalidatePath("/faqs");
  return { ok: true, message: "FAQ saved" };
}

export async function deleteFaq(faqId: string) {
  const actor = await getAdminActor();
  await prisma.faq.delete({ where: { id: faqId } });
  await logAudit({ actorId: actor.sub, action: "FAQ_DELETE", entity: "Faq", entityId: faqId });
  revalidatePath("/admin/content");
  revalidatePath("/faqs");
  return { ok: true, message: "FAQ removed" };
}

export async function saveTestimonial(formData: FormData) {
  const actor = await getAdminActor();

  const id = formData.get("id") ? String(formData.get("id")) : undefined;
  const authorName = String(formData.get("authorName") ?? "").trim();
  const authorRole = String(formData.get("authorRole") ?? "").trim() || null;
  const company = String(formData.get("company") ?? "").trim() || null;
  const content = String(formData.get("content") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 5);
  const featured = formData.get("featured") === "true";
  const active = formData.get("active") !== "false";

  if (!authorName || !content) return { ok: false, message: "Author and review content are required" };

  if (id) {
    await prisma.testimonial.update({
      where: { id },
      data: { authorName, authorRole, company, content, rating, featured, active },
    });
  } else {
    await prisma.testimonial.create({
      data: { authorName, authorRole, company, content, rating, featured, active },
    });
  }

  await logAudit({
    actorId: actor.sub,
    action: id ? "TESTIMONIAL_UPDATE" : "TESTIMONIAL_CREATE",
    entity: "Testimonial",
    entityId: id,
    metadata: { authorName },
  });

  revalidatePath("/admin/content");
  revalidatePath("/");
  return { ok: true, message: "Testimonial saved" };
}

export async function deleteTestimonial(testimonialId: string) {
  const actor = await getAdminActor();
  await prisma.testimonial.delete({ where: { id: testimonialId } });
  await logAudit({ actorId: actor.sub, action: "TESTIMONIAL_DELETE", entity: "Testimonial", entityId: testimonialId });
  revalidatePath("/admin/content");
  revalidatePath("/");
  return { ok: true, message: "Testimonial removed" };
}

export async function saveBanner(formData: FormData) {
  const actor = await getAdminActor();

  const id = formData.get("id") ? String(formData.get("id")) : undefined;
  const message = String(formData.get("message") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim() || null;
  const linkText = String(formData.get("linkText") ?? "").trim() || null;
  const active = formData.get("active") === "true";
  const order = Number(formData.get("order") ?? 0);

  if (!message) return { ok: false, message: "Banner message is required" };

  if (id) {
    await prisma.banner.update({
      where: { id },
      data: { message, link, linkText, active, order },
    });
  } else {
    await prisma.banner.create({
      data: { message, link, linkText, active, order },
    });
  }

  await logAudit({
    actorId: actor.sub,
    action: id ? "BANNER_UPDATE" : "BANNER_CREATE",
    entity: "Banner",
    entityId: id,
    metadata: { message },
  });

  revalidatePath("/admin/content");
  revalidatePath("/");
  return { ok: true, message: "Announcement banner saved" };
}

export async function deleteBanner(bannerId: string) {
  const actor = await getAdminActor();
  await prisma.banner.delete({ where: { id: bannerId } });
  await logAudit({ actorId: actor.sub, action: "BANNER_DELETE", entity: "Banner", entityId: bannerId });
  revalidatePath("/admin/content");
  revalidatePath("/");
  return { ok: true, message: "Banner removed" };
}

export async function saveServiceArea(formData: FormData) {
  const actor = await getAdminActor();

  const id = formData.get("id") ? String(formData.get("id")) : undefined;
  const postcodePrefix = String(formData.get("postcodePrefix") ?? "").trim().toUpperCase();
  const label = String(formData.get("label") ?? "").trim();
  const active = formData.get("active") !== "false";

  if (!postcodePrefix || !label) return { ok: false, message: "Prefix and label are required" };

  if (id) {
    await prisma.serviceArea.update({
      where: { id },
      data: { postcodePrefix, label, active },
    });
  } else {
    await prisma.serviceArea.upsert({
      where: { postcodePrefix },
      update: { label, active },
      create: { postcodePrefix, label, active },
    });
  }

  await logAudit({
    actorId: actor.sub,
    action: "SERVICE_AREA_SAVE",
    entity: "ServiceArea",
    metadata: { postcodePrefix, label },
  });

  revalidatePath("/admin/content");
  revalidatePath("/coverage");
  return { ok: true, message: "Coverage area saved" };
}

export async function deleteServiceArea(areaId: string) {
  const actor = await getAdminActor();
  await prisma.serviceArea.delete({ where: { id: areaId } });
  await logAudit({ actorId: actor.sub, action: "SERVICE_AREA_DELETE", entity: "ServiceArea", entityId: areaId });
  revalidatePath("/admin/content");
  revalidatePath("/coverage");
  return { ok: true, message: "Coverage area removed" };
}

// ---------------------------------------------------------------------------
// Discount Codes
// ---------------------------------------------------------------------------

export async function saveDiscountCode(formData: FormData) {
  const actor = await getAdminActor();

  const id = formData.get("id") ? String(formData.get("id")) : undefined;
  const code = normaliseCode(String(formData.get("code") ?? ""));
  const description = String(formData.get("description") ?? "").trim() || null;
  const type = String(formData.get("type") ?? "PERCENT").toUpperCase() === "FIXED" ? "FIXED" : "PERCENT";
  const rawValue = Number(formData.get("value") ?? 0);
  const value = type === "FIXED" ? Math.round(rawValue * 100) : Math.round(rawValue);
  const minSubtotal = Math.round(Number(formData.get("minSubtotal") ?? 0) * 100);
  const maxUsesRaw = String(formData.get("maxUses") ?? "").trim();
  const maxUses = maxUsesRaw ? Math.max(1, Math.round(Number(maxUsesRaw))) : null;
  const active = formData.get("active") !== "false";
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim();
  const endsAtRaw = String(formData.get("endsAt") ?? "").trim();
  const startsAt = startsAtRaw ? new Date(startsAtRaw) : null;
  const endsAt = endsAtRaw ? new Date(endsAtRaw) : null;

  if (!code) return { ok: false, message: "A discount code is required" };
  if (!Number.isFinite(rawValue) || rawValue < 0) {
    return { ok: false, message: "Enter a valid discount value" };
  }
  if (type === "PERCENT" && rawValue > 100) {
    return { ok: false, message: "A percentage discount cannot be more than 100" };
  }
  if (startsAt && endsAt && startsAt > endsAt) {
    return { ok: false, message: "The end date must be after the start date" };
  }

  const existing = await prisma.discountCode.findUnique({ where: { code } });
  if (existing && existing.id !== id) {
    return { ok: false, message: "That discount code already exists" };
  }

  const data = {
    code,
    description,
    type,
    value,
    minSubtotal: Math.max(0, minSubtotal),
    maxUses,
    active,
    startsAt,
    endsAt,
  };

  if (id) {
    await prisma.discountCode.update({ where: { id }, data });
  } else {
    await prisma.discountCode.create({ data });
  }

  await logAudit({
    actorId: actor.sub,
    action: id ? "DISCOUNT_UPDATE" : "DISCOUNT_CREATE",
    entity: "DiscountCode",
    entityId: id,
    metadata: { code, type, value },
  });

  revalidatePath("/admin/discounts");
  return { ok: true, message: "Discount code saved" };
}

export async function toggleDiscountCode(codeId: string, active: boolean) {
  const actor = await getAdminActor();
  await prisma.discountCode.update({ where: { id: codeId }, data: { active } });
  await logAudit({
    actorId: actor.sub,
    action: "DISCOUNT_TOGGLE",
    entity: "DiscountCode",
    entityId: codeId,
    metadata: { active },
  });
  revalidatePath("/admin/discounts");
  return { ok: true, message: active ? "Discount activated" : "Discount deactivated" };
}

export async function deleteDiscountCode(codeId: string) {
  const actor = await getAdminActor();
  await prisma.discountCode.delete({ where: { id: codeId } });
  await logAudit({
    actorId: actor.sub,
    action: "DISCOUNT_DELETE",
    entity: "DiscountCode",
    entityId: codeId,
  });
  revalidatePath("/admin/discounts");
  return { ok: true, message: "Discount code deleted" };
}

// ---------------------------------------------------------------------------
// System Settings
// ---------------------------------------------------------------------------

export async function updateSystemSetting(key: string, value: string, group = "general") {
  const actor = await getAdminActor();

  await prisma.systemSetting.upsert({
    where: { key },
    update: { value, group },
    create: { key, value, group },
  });

  await logAudit({
    actorId: actor.sub,
    action: "SYSTEM_SETTING_UPDATE",
    entity: "SystemSetting",
    metadata: { key, value },
  });

  revalidatePath("/admin/settings");
  return { ok: true, message: "Setting updated" };
}
