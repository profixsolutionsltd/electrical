"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ticketSchema } from "@/lib/validation";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { generateTicketReference } from "@/lib/reference";
import { createNotification } from "@/lib/email";
import { revalidatePath } from "next/cache";

/** Create a new support ticket for the current customer. */
export async function createTicket(formData: FormData) {
  const session = await getSession();
  if (!session) return { ok: false, message: "Not authenticated" };

  const limit = rateLimit(`ticket:${session.sub}`, 10, 60 * 60 * 1000);
  if (!limit.success) return { ok: false, message: "Too many tickets. Please wait." };

  const parsed = ticketSchema.safeParse({
    subject: formData.get("subject"),
    message: formData.get("message"),
    bookingId: formData.get("bookingId") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Please add a subject and a message." };
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      reference: generateTicketReference(),
      userId: session.sub,
      bookingId: parsed.data.bookingId,
      subject: parsed.data.subject,
      messages: {
        create: [{ authorId: session.sub, authorRole: "CUSTOMER", body: parsed.data.message }],
      },
    },
  });

  await createNotification({
    role: "ADMIN",
    type: "INFO",
    title: `New support ticket: ${parsed.data.subject}`,
    body: `Ticket ${ticket.reference} needs attention.`,
  });

  revalidatePath("/dashboard/support");
  return { ok: true, message: "Ticket created. We'll respond shortly." };
}

/** Add a reply to an existing ticket owned by the current customer. */
export async function replyToTicket(ticketId: string, body: string) {
  const session = await getSession();
  if (!session) return { ok: false, message: "Not authenticated" };
  if (body.trim().length < 2) return { ok: false, message: "Enter a message." };

  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, userId: session.sub },
  });
  if (!ticket) return { ok: false, message: "Ticket not found." };

  await prisma.$transaction([
    prisma.supportMessage.create({
      data: { ticketId, authorId: session.sub, authorRole: "CUSTOMER", body: body.trim() },
    }),
    prisma.supportTicket.update({ where: { id: ticketId }, data: { status: "OPEN" } }),
  ]);

  revalidatePath("/dashboard/support");
  return { ok: true, message: "Reply sent." };
}
