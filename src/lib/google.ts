import { createHash, randomBytes } from "node:crypto";
import { env } from "./env";

/**
 * Google OAuth 2.0 (OpenID Connect) helpers.
 *
 * The platform keeps its own signed-JWT session, so Google is used purely as
 * an identity provider: we run the authorization-code flow with PKCE, read
 * the verified profile, then mint a normal AYAN session for the (possibly
 * newly created) user. No Google access token is ever stored.
 *
 * Server-side only — never import this from a client component.
 */

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const TOKENINFO_ENDPOINT = "https://oauth2.googleapis.com/tokeninfo";
const USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";

export const GOOGLE_PROVIDER = "google";

/** Short-lived cookies used to carry state through the OAuth round-trip. */
export const GOOGLE_COOKIES = {
  state: "ayan_google_state",
  verifier: "ayan_google_verifier",
  next: "ayan_google_next",
} as const;

/**
 * Only allow internal, absolute paths to be used as a post-login redirect.
 * Anything else (protocol-relative URLs, absolute URLs) is discarded so the
 * OAuth flow can never be used as an open redirect.
 */
export function sanitizeNextPath(value: string | null | undefined): string {
  if (!value) return "";
  if (!value.startsWith("/")) return "";
  if (value.startsWith("//")) return "";
  if (value.includes("\\")) return "";
  return value;
}

export interface GoogleProfile {
  /** Google's stable subject id for the account. */
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture: string | null;
}

export interface GoogleTokens {
  accessToken: string;
  idToken: string | null;
}

/** Cryptographically random, URL-safe token (used for state + PKCE). */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** S256 PKCE challenge derived from the verifier. */
export function pkceChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

/** The redirect URI registered in the Google Cloud console. */
export function googleRedirectUri(): string {
  return env.google.redirectUri;
}

/** Build the Google consent-screen URL. */
export function buildGoogleAuthUrl(params: {
  state: string;
  codeChallenge: string;
}): string {
  const url = new URL(AUTH_ENDPOINT);
  url.searchParams.set("client_id", env.google.clientId);
  url.searchParams.set("redirect_uri", googleRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("access_type", "online");
  return url.toString();
}

/** Exchange the authorization code for tokens. */
export async function exchangeGoogleCode(
  code: string,
  codeVerifier: string,
): Promise<GoogleTokens> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.google.clientId,
      client_secret: env.google.clientSecret,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google token exchange failed (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as {
    access_token?: string;
    id_token?: string;
  };

  if (!data.access_token) {
    throw new Error("Google token exchange returned no access token.");
  }

  return { accessToken: data.access_token, idToken: data.id_token ?? null };
}

/**
 * Read the signed-in user's Google profile. The id_token is validated by
 * Google through the tokeninfo endpoint; the userinfo endpoint is used as a
 * fallback when no id_token was returned.
 */
export async function fetchGoogleProfile(
  tokens: GoogleTokens,
): Promise<GoogleProfile> {
  if (tokens.idToken) {
    const response = await fetch(
      `${TOKENINFO_ENDPOINT}?id_token=${encodeURIComponent(tokens.idToken)}`,
      { cache: "no-store" },
    );
    if (response.ok) {
      const info = (await response.json()) as {
        sub?: string;
        email?: string;
        email_verified?: string | boolean;
        name?: string;
        picture?: string;
      };
      if (info.sub && info.email) {
        return {
          id: info.sub,
          email: info.email.toLowerCase(),
          emailVerified:
            info.email_verified === true || info.email_verified === "true",
          name: info.name || info.email.split("@")[0],
          picture: info.picture ?? null,
        };
      }
    }
  }

  const response = await fetch(USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Google userinfo request failed (${response.status}).`);
  }

  const info = (await response.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };
  if (!info.sub || !info.email) {
    throw new Error("Google profile is missing a subject or email address.");
  }

  return {
    id: info.sub,
    email: info.email.toLowerCase(),
    emailVerified: info.email_verified === true,
    name: info.name || info.email.split("@")[0],
    picture: info.picture ?? null,
  };
}
