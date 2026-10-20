import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "./env";
import type { Role } from "./constants";

/**
 * Password hashing. bcryptjs is a pure-JS implementation with a safe default
 * cost factor. We never store or log plaintext passwords.
 */

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Session JWT. The session is a stateless signed token stored in an httpOnly
 * cookie. We also persist a Session row so sessions can be revoked server-side.
 */

export const SESSION_COOKIE = "ayan_session";

export interface SessionPayload {
  sub: string; // user id
  email: string;
  role: Role;
  name: string;
}

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(env.auth.secret);
}

export async function signSession(
  payload: SessionPayload,
  maxAgeSeconds: number,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("ayan-platform")
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(getSecretKey());
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: "ayan-platform",
    });
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      role: payload.role as Role,
      name: String(payload.name),
    };
  } catch {
    return null;
  }
}

const ONE_DAY = 60 * 60 * 24;

export function sessionMaxAge(rememberMe: boolean): number {
  return (rememberMe ? env.auth.rememberDays : env.auth.sessionDays) * ONE_DAY;
}

/** Cookie options shared across set/clear operations. */
export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Read the current session payload from the request cookies (server only). */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
