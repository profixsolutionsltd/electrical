import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import {
  GOOGLE_COOKIES,
  buildGoogleAuthUrl,
  pkceChallenge,
  randomToken,
  sanitizeNextPath,
} from "@/lib/google";

/**
 * Step 1 of the Google sign-in flow: generate a state value and a PKCE
 * verifier, stash them in short-lived httpOnly cookies and send the visitor
 * to Google's consent screen.
 */

export const dynamic = "force-dynamic";

const OAUTH_COOKIE_MAX_AGE = 600; // 10 minutes

export async function GET(request: Request) {
  const url = new URL(request.url);

  if (!env.google.isConfigured) {
    return NextResponse.redirect(
      new URL("/login?error=google-unavailable", url.origin),
    );
  }

  const next = sanitizeNextPath(url.searchParams.get("next"));
  const state = randomToken(16);
  const verifier = randomToken(48);

  const store = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: OAUTH_COOKIE_MAX_AGE,
  };

  store.set(GOOGLE_COOKIES.state, state, cookieOptions);
  store.set(GOOGLE_COOKIES.verifier, verifier, cookieOptions);
  store.set(GOOGLE_COOKIES.next, next || "/", cookieOptions);

  return NextResponse.redirect(
    buildGoogleAuthUrl({ state, codeChallenge: pkceChallenge(verifier) }),
  );
}
