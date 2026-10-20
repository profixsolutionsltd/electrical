import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  sessionMaxAge,
  signSession,
} from "@/lib/auth";
import type { Role } from "@/lib/constants";

/**
 * Creates an AYAN session for a user. Shared by the password sign-in action
 * and the Google OAuth callback so both produce identical cookies and
 * persisted session rows.
 */

export interface SessionSubject {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface CreatedSession {
  token: string;
  maxAge: number;
}

/**
 * Persist a session row and return the signed token. Callers that manage the
 * cookie themselves (route handlers) can set the cookie on their own
 * response; server actions use `establishSession` instead.
 */
export async function createSession(
  subject: SessionSubject,
  rememberMe = false,
): Promise<CreatedSession> {
  const maxAge = sessionMaxAge(rememberMe);
  const token = await signSession(
    {
      sub: subject.id,
      email: subject.email,
      role: subject.role,
      name: subject.name,
    },
    maxAge,
  );

  const expiresAt = new Date(Date.now() + maxAge * 1000);

  await prisma.session.create({
    data: {
      userId: subject.id,
      token,
      rememberMe,
      expiresAt,
    },
  });

  return { token, maxAge };
}

/** Create a session and write the session cookie. */
export async function establishSession(
  subject: SessionSubject,
  rememberMe = false,
): Promise<void> {
  const { token, maxAge } = await createSession(subject, rememberMe);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions(maxAge));
}
