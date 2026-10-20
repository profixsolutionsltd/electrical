"use server";

import { z } from "zod";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { generateTicketReference } from "@/lib/reference";

/**
 * Public contact form handler. Rate-limited and validated server-side. Records
 * a support ticket so the message is stored rather than silently discarded.
 * Does not require authentication.
 */

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(4, "Please add a subject"),
  message: z.string().trim().min(10, "Please describe your enquiry"),
});

export interface ContactState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  reference?: string;
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Basic IP-less rate limit keyed on email to deter abuse of the public form.
  const emailGuess = String(formData.get("email") ?? "anon");
  const limit = rateLimit(`contact:${emailGuess}`, RATE_LIMITS.contact.limit, RATE_LIMITS.contact.windowMs);
  if (!limit.success) {
    return {
      ok: false,
      message: "Too many submissions. Please try again later.",
    };
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    subject: formData.get("subject"),
    message: formData.get("message"),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path.join(".")] = issue.message;
    }
    return { ok: false, message: "Please check the form.", errors };
  }

  try {
    // Attach the enquiry to the matching account when one exists, otherwise
    // create an anonymous-owner ticket against the support mailbox owner if set.
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (user) {
      await prisma.supportTicket.create({
        data: {
          reference: generateTicketReference(),
          userId: user.id,
          subject: parsed.data.subject,
          messages: {
            create: [
              {
                authorId: user.id,
                authorRole: "CUSTOMER",
                body: `${parsed.data.message}\n\n(Name: ${parsed.data.name}${
                  parsed.data.phone ? `, Phone: ${parsed.data.phone}` : ""
                })`,
              },
            ],
          },
        },
      });
    } else {
      // Store as a notification so admins can still see the enquiry even when
      // the sender has no account yet.
      await prisma.notification.create({
        data: {
          role: "ADMIN",
          type: "INFO",
          title: `New contact enquiry: ${parsed.data.subject}`,
          body: `${parsed.data.message}\n\nFrom: ${parsed.data.name} <${parsed.data.email}>${
            parsed.data.phone ? ` (${parsed.data.phone})` : ""
          }`,
        },
      });
    }

    return {
      ok: true,
      message: "Thanks for getting in touch — we'll be in contact shortly.",
    };
  } catch {
    return {
      ok: false,
      message: "Something went wrong sending your message. Please try again.",
    };
  }
}
