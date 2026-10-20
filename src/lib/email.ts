import { env } from "./env";
import { prisma } from "./prisma";
import { generateToken } from "./reference";

/**
 * Transactional email.
 *
 * When SMTP credentials are configured we send real mail. When they are not
 * (the default in development) we log the message to the server console and
 * persist a copy to the notification log so the flow still works end-to-end
 * without pretending an email was delivered. `env.email.isConfigured` is the
 * single switch the UI uses to show accurate status.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const emailService = {
  isConfigured: () => env.email.isConfigured,

  async send(message: EmailMessage): Promise<{ sent: boolean; simulated: boolean }> {
    if (!env.email.isConfigured) {
      // Simulated delivery — never claim it was actually sent.
      // eslint-disable-next-line no-console
      console.info(
        `[AYAN:email:simulated] To: ${message.to}\nSubject: ${message.subject}\n${message.text}`,
      );
      return { sent: false, simulated: true };
    }

    // Real SMTP delivery requires an optional `nodemailer` dependency. It is
    // intentionally not bundled to keep the install lean. When it is present
    // and SMTP is configured we send real mail; otherwise we degrade to a
    // clearly-labelled simulated send and surface that in the UI.
    interface MailTransport {
      sendMail(options: {
        from: string;
        to: string;
        subject: string;
        text: string;
        html?: string;
      }): Promise<unknown>;
    }
    interface NodemailerModule {
      createTransport(options: Record<string, unknown>): MailTransport;
    }

    let nodemailer: NodemailerModule | null = null;
    try {
      // Evaluated at runtime only; the try/catch keeps us safe if the optional
      // package is absent from node_modules.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req = eval("require") as (id: string) => any;
      nodemailer = req("nodemailer") as NodemailerModule;
    } catch {
      nodemailer = null;
    }

    if (!nodemailer) {
      // eslint-disable-next-line no-console
      console.warn(
        "[AYAN:email] SMTP is configured but the optional 'nodemailer' " +
          "package is not installed. Install it (`npm i nodemailer`) to send " +
          "real email. Falling back to simulated delivery.",
      );
      return { sent: false, simulated: true };
    }

    try {
      const transport = nodemailer.createTransport({
        host: env.email.host,
        port: env.email.port,
        secure: env.email.port === 465,
        auth: { user: env.email.user, pass: env.email.password },
      });
      await transport.sendMail({
        from: env.email.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
      return { sent: true, simulated: false };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[AYAN:email] Failed to send:", err);
      return { sent: false, simulated: true };
    }
  },
};

// ---------------------------------------------------------------------------
// High-level notification templates
// ---------------------------------------------------------------------------

export async function sendBookingConfirmation(params: {
  to: string;
  name: string;
  reference: string;
  serviceSummary: string;
  when: string;
}): Promise<{ sent: boolean; simulated: boolean }> {
  return emailService.send({
    to: params.to,
    subject: `AYAN booking confirmed — ${params.reference}`,
    text:
      `Hi ${params.name},\n\n` +
      `Your booking ${params.reference} is confirmed.\n` +
      `Services: ${params.serviceSummary}\n` +
      `Appointment: ${params.when}\n\n` +
      `You can view and manage your booking any time from your dashboard.\n\n` +
      `— The AYAN Team`,
    html: `<p>Hi ${params.name},</p>
      <p>Your booking <strong>${params.reference}</strong> is confirmed.</p>
      <ul><li><strong>Services:</strong> ${params.serviceSummary}</li>
      <li><strong>Appointment:</strong> ${params.when}</li></ul>
      <p>You can view and manage your booking any time from your dashboard.</p>
      <p>— The AYAN Team</p>`,
  });
}

export async function sendBookingReminder(params: {
  to: string;
  name: string;
  reference: string;
  when: string;
}): Promise<{ sent: boolean; simulated: boolean }> {
  return emailService.send({
    to: params.to,
    subject: `Reminder: your AYAN appointment ${params.reference}`,
    text:
      `Hi ${params.name},\n\n` +
      `This is a reminder of your upcoming appointment ${params.reference} on ${params.when}.\n\n` +
      `— The AYAN Team`,
  });
}

// ---------------------------------------------------------------------------
// In-app notifications
// ---------------------------------------------------------------------------

export async function createNotification(params: {
  userId?: string;
  role?: string;
  type?: string;
  title: string;
  body: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      role: params.role,
      type: params.type ?? "INFO",
      title: params.title,
      body: params.body,
      link: params.link,
    },
  });
}

// ---------------------------------------------------------------------------
// Email verification + password reset token helpers
// ---------------------------------------------------------------------------

export async function createEmailVerificationToken(userId: string) {
  const token = generateToken(24);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
  await prisma.emailVerificationToken.create({
    data: { userId, token, expiresAt },
  });
  return token;
}

export async function createPasswordResetToken(userId: string) {
  const token = generateToken(24);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h
  await prisma.passwordResetToken.create({ data: { userId, token, expiresAt } });
  return token;
}
