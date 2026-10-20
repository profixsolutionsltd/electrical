"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  SESSION_COOKIE,
} from "@/lib/auth";
import { establishSession } from "@/lib/session";
import { loginSchema, registerSchema, resetPasswordSchema } from "@/lib/validation";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { createEmailVerificationToken, createPasswordResetToken } from "@/lib/email";
import { logAudit } from "@/server/audit";
import { ROLES, type Role } from "@/lib/constants";

/**
 * Authentication server actions. All input is validated server-side with Zod,
 * passwords are hashed with bcrypt, and sessions are signed JWTs stored in an
 * httpOnly cookie (with a DB Session row so they can be revoked).
 */

export interface AuthState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  redirectTo?: string;
}

function clientKey(prefix: string, value: string) {
  return `${prefix}:${value.toLowerCase()}`;
}

function roleHome(role: Role): string {
  if (role === ROLES.ADMIN) return "/admin";
  if (role === ROLES.ENGINEER) return "/engineer";
  return "/dashboard";
}

/** Register a new user (customer or engineer; admin is provisioned separately). */
export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    role: (formData.get("role") as string) || ROLES.CUSTOMER,
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptTerms:
      formData.get("acceptTerms") === "on" || formData.get("acceptTerms") === "true",
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] = issue.message;
    return { ok: false, message: "Please check the form.", errors };
  }

  const limit = rateLimit(
    clientKey("register", parsed.data.email),
    RATE_LIMITS.register.limit,
    RATE_LIMITS.register.windowMs,
  );
  if (!limit.success) {
    return { ok: false, message: "Too many attempts. Please try again later." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, errors: { email: "An account with this email already exists." } };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const role: Role = parsed.data.role === ROLES.ENGINEER ? ROLES.ENGINEER : ROLES.CUSTOMER;

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      role,
      passwordHash,
      ...(role === ROLES.CUSTOMER
        ? { customer: { create: {} } }
        : { engineer: { create: { status: "PENDING" } } }),
    },
    select: { id: true, name: true, email: true, role: true },
  });

  await createEmailVerificationToken(user.id);
  await logAudit({ actorId: user.id, action: "REGISTER", entity: "User", entityId: user.id });
  await establishSession(
    { id: user.id, email: user.email, role, name: user.name },
    false,
  );

  redirect(role === ROLES.ENGINEER ? "/engineer?welcome=1" : "/dashboard?welcome=1");
}

/** Sign a user in. */
export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    rememberMe:
      formData.get("rememberMe") === "on" || formData.get("rememberMe") === "true",
  };
  const next = (formData.get("next") as string) || undefined;

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] = issue.message;
    return { ok: false, message: "Please check your details.", errors };
  }

  const limit = rateLimit(
    clientKey("login", parsed.data.email),
    RATE_LIMITS.login.limit,
    RATE_LIMITS.login.windowMs,
  );
  if (!limit.success) {
    return { ok: false, message: "Too many login attempts. Please try again soon." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) {
    return { ok: false, message: "Invalid email or password." };
  }
  if (user.status === "SUSPENDED") {
    return { ok: false, message: "Your account has been suspended. Please contact support." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await logAudit({ actorId: user.id, action: "LOGIN", entity: "User", entityId: user.id });

  await establishSession(
    {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
    },
    parsed.data.rememberMe ?? false,
  );

  redirect(next ?? roleHome(user.role as Role));
}

/** Sign the current user out and clear the session cookie. */
export async function logoutAction(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
  }
  store.delete(SESSION_COOKIE);
  redirect("/login");
}

/** Start the password reset flow. Always returns a generic success message. */
export async function forgotPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const limit = rateLimit(
    clientKey("forgot", email),
    RATE_LIMITS.forgotPassword.limit,
    RATE_LIMITS.forgotPassword.windowMs,
  );
  if (!limit.success) {
    return { ok: false, message: "Too many requests. Please try again later." };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  if (user) {
    const token = await createPasswordResetToken(user.id);
    await logAudit({ actorId: user.id, action: "PASSWORD_RESET_REQUEST", entity: "User", entityId: user.id });
    // Without email configured we log the link for local development.
    // eslint-disable-next-line no-console
    console.info(`[AYAN:reset] Reset link: /reset-password?token=${token}`);
  }

  return { ok: true, message: "If an account exists for that email, we've sent reset instructions." };
}

/** Complete the password reset using a valid token. */
export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] = issue.message;
    return { ok: false, message: "Please check the form.", errors };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, message: "This reset link is invalid or has expired." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({ where: { id: record.userId }, data: { passwordHash } });
  await prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  await prisma.session.deleteMany({ where: { userId: record.userId } });
  await logAudit({ actorId: record.userId, action: "PASSWORD_RESET", entity: "User", entityId: record.userId });

  return { ok: true, message: "Your password has been reset. You can now sign in.", redirectTo: "/login" };
}

