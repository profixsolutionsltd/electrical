import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, sessionCookieOptions, hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { logAudit } from "@/server/audit";
import { ROLES, type Role } from "@/lib/constants";
import {
  GOOGLE_COOKIES,
  GOOGLE_PROVIDER,
  exchangeGoogleCode,
  fetchGoogleProfile,
  randomToken,
  sanitizeNextPath,
  type GoogleProfile,
} from "@/lib/google";

/**
 * Step 2 of the Google sign-in flow: validate the state, exchange the code
 * for a verified profile, then link or create the AYAN user and start a
 * normal session.
 */

export const dynamic = "force-dynamic";

type Outcome =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const store = await cookies();

  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");

  const savedState = store.get(GOOGLE_COOKIES.state)?.value;
  const verifier = store.get(GOOGLE_COOKIES.verifier)?.value;
  const next = sanitizeNextPath(store.get(GOOGLE_COOKIES.next)?.value);

  if (oauthError) {
    return redirectTo(url.origin, "google-denied");
  }

  if (!code || !state || !savedState || !verifier || state !== savedState) {
    return redirectTo(url.origin, "google-invalid");
  }

  let outcome: Outcome;
  let session: { token: string; maxAge: number } | null = null;

  try {
    const tokens = await exchangeGoogleCode(code, verifier);
    const profile = await fetchGoogleProfile(tokens);
    const { user, isNew } = await linkOrCreateGoogleUser(profile);

    if (user.status === "SUSPENDED") {
      return redirectTo(url.origin, "suspended");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    session = await createSession(
      {
        id: user.id,
        email: user.email,
        role: user.role as Role,
        name: user.name,
      },
      false,
    );

    await logAudit({
      actorId: user.id,
      action: isNew ? "GOOGLE_SIGNUP" : "GOOGLE_LOGIN",
      entity: "User",
      entityId: user.id,
      metadata: { provider: GOOGLE_PROVIDER },
    });

    outcome = {
      ok: true,
      redirectTo: next || roleHome(user.role as Role),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[AYAN:google] sign-in failed:", error);
    outcome = { ok: false, error: "google-failed" };
  }

  if (!outcome.ok) {
    return redirectTo(url.origin, outcome.error);
  }

  const response = NextResponse.redirect(new URL(outcome.redirectTo, url.origin));
  clearOAuthCookies(response);
  if (session) {
    response.cookies.set(
      SESSION_COOKIE,
      session.token,
      sessionCookieOptions(session.maxAge),
    );
  }
  return response;
}

/** Redirect back to the login page with a machine-readable error code. */
function redirectTo(origin: string, error: string) {
  const response = NextResponse.redirect(
    new URL(`/login?error=${error}`, origin),
  );
  clearOAuthCookies(response);
  return response;
}

/** The OAuth round-trip cookies are single use. */
function clearOAuthCookies(response: NextResponse) {
  for (const name of Object.values(GOOGLE_COOKIES)) {
    response.cookies.delete(name);
  }
}

function roleHome(role: Role): string {
  if (role === ROLES.ADMIN) return "/admin";
  if (role === ROLES.ENGINEER) return "/engineer";
  return "/dashboard";
}

/**
 * Resolve the AYAN user for a Google profile.
 *
 * 1. An already-linked Google account wins.
 * 2. Otherwise a verified Google email that matches an existing account is
 *    linked to that account.
 * 3. Otherwise a brand new customer account is created. The generated
 *    password is random and never disclosed, so the account can only be used
 *    through Google until the user sets a password.
 */
async function linkOrCreateGoogleUser(profile: GoogleProfile) {
  const linked = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: GOOGLE_PROVIDER,
        providerAccountId: profile.id,
      },
    },
    include: { user: true },
  });

  if (linked) {
    return { user: linked.user, isNew: false };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: profile.email },
  });

  if (existingUser) {
    if (!profile.emailVerified) {
      throw new Error(
        "Google has not verified this email address, so it cannot be linked automatically.",
      );
    }

    await prisma.account.create({
      data: {
        userId: existingUser.id,
        provider: GOOGLE_PROVIDER,
        providerAccountId: profile.id,
        email: profile.email,
      },
    });

    return { user: existingUser, isNew: false };
  }

  const passwordHash = await hashPassword(randomToken(32));

  const user = await prisma.user.create({
    data: {
      name: profile.name,
      email: profile.email,
      role: ROLES.CUSTOMER,
      passwordHash,
      avatarUrl: profile.picture,
      emailVerifiedAt: profile.emailVerified ? new Date() : null,
      customer: { create: {} },
    },
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      provider: GOOGLE_PROVIDER,
      providerAccountId: profile.id,
      email: profile.email,
    },
  });

  return { user, isNew: true };
}
