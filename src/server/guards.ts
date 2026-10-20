import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES, type Role } from "@/lib/constants";

/**
 * Server-side authorization guards. These run only on the server and are the
 * real security boundary — client-side checks are for UX only. A role supplied
 * by the browser is never trusted; it is always read from the signed session.
 */

export class AuthorizationError extends Error {
  constructor(message = "Not authorized") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/** Require any authenticated user, else redirect to login. */
export async function requireUser(returnTo?: string): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    const to = returnTo ? `?next=${encodeURIComponent(returnTo)}` : "";
    redirect(`/login${to}`);
  }
  // Verify the user still exists and is not suspended.
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, status: true, role: true },
  });
  if (!user || user.status === "SUSPENDED") {
    redirect("/login?error=suspended");
  }
  return session;
}

/** Require one of the given roles, else redirect to the user's home. */
export async function requireRole(
  roles: Role[],
  returnTo?: string,
): Promise<SessionPayload> {
  const session = await requireUser(returnTo);
  if (!roles.includes(session.role)) {
    redirect(roleHome(session.role));
  }
  return session;
}

/** Require an admin. */
export async function requireAdmin(): Promise<SessionPayload> {
  return requireRole([ROLES.ADMIN]);
}

/** Require a customer. */
export async function requireCustomer(): Promise<SessionPayload> {
  return requireRole([ROLES.CUSTOMER]);
}

/** Require an engineer. */
export async function requireEngineer(): Promise<SessionPayload> {
  return requireRole([ROLES.ENGINEER]);
}

/** The home route for a given role. */
export function roleHome(role: Role): string {
  switch (role) {
    case ROLES.ADMIN:
      return "/admin";
    case ROLES.ENGINEER:
      return "/engineer";
    default:
      return "/dashboard";
  }
}

/**
 * Non-redirecting check for use inside server actions / route handlers where
 * throwing is preferable to a redirect.
 */
export async function assertRole(roles: Role[]): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new AuthorizationError("Authentication required");
  if (!roles.includes(session.role)) {
    throw new AuthorizationError("Insufficient permissions");
  }
  return session;
}
