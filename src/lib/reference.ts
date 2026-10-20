import { BOOKING_REFERENCE_PREFIX } from "./constants";

/**
 * Generate a human-friendly, unique-enough booking reference, e.g. "AYN-8F3K2Q".
 * Uses a cryptographically random alphabet excluding easily-confused chars.
 */
export function generateBookingReference(
  prefix: string = BOOKING_REFERENCE_PREFIX,
): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1
  let body = "";
  const bytes = new Uint8Array(6);
  // crypto is available in Node 20+ and modern browsers.
  crypto.getRandomValues(bytes);
  for (let i = 0; i < bytes.length; i += 1) {
    body += alphabet[bytes[i] % alphabet.length];
  }
  return `${prefix}-${body}`;
}

/** Generate a ticket reference, e.g. "TCK-4H7Z9P". */
export function generateTicketReference(): string {
  return generateBookingReference("TCK");
}

/** Generate a short URL-safe token for email/reset flows. */
export function generateToken(bytes = 32): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}
