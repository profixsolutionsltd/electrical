/**
 * Centralised, typed access to environment configuration.
 *
 * Every optional third-party integration (email, storage, payments, OAuth) is
 * detected here so the rest of the app can branch on `isConfigured` flags and
 * degrade gracefully instead of crashing when credentials are absent.
 */

function bool(value: string | undefined, fallback = false): boolean {
  if (value == null) return fallback;
  return value.toLowerCase() === "true" || value === "1";
}

export const env = {
  app: {
    name: process.env.APP_NAME || "AYAN",
    url: process.env.APP_URL || "http://localhost:3000",
    supportEmail: process.env.SUPPORT_EMAIL || "support@ayan.example.com",
  },
  database: {
    url: process.env.DATABASE_URL || "",
  },
  auth: {
    /** Used to sign session JWTs. Falls back to a dev-only value. */
    secret:
      process.env.NEXTAUTH_SECRET ||
      process.env.AUTH_SECRET ||
      "ayan-dev-insecure-secret-change-me",
    sessionDays: Number(process.env.SESSION_DAYS || 7),
    rememberDays: Number(process.env.REMEMBER_DAYS || 30),
  },
  email: {
    host: process.env.EMAIL_SERVER_HOST || "",
    port: Number(process.env.EMAIL_SERVER_PORT || 587),
    user: process.env.EMAIL_SERVER_USER || "",
    password: process.env.EMAIL_SERVER_PASSWORD || "",
    from: process.env.EMAIL_FROM || "noreply@ayan.example.com",
    get isConfigured() {
      return Boolean(this.host && this.user && this.password);
    },
  },
  storage: {
    cloudinaryCloud: process.env.CLOUDINARY_CLOUD_NAME || "",
    cloudinaryKey: process.env.CLOUDINARY_API_KEY || "",
    cloudinarySecret: process.env.CLOUDINARY_API_SECRET || "",
    get isConfigured() {
      return Boolean(
        this.cloudinaryCloud && this.cloudinaryKey && this.cloudinarySecret,
      );
    },
  },
  payments: {
    stripePublic: process.env.STRIPE_PUBLIC_KEY || "",
    stripeSecret: process.env.STRIPE_SECRET_KEY || "",
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    get isConfigured() {
      return Boolean(this.stripeSecret);
    },
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    /** Override when the app is served from a different origin than APP_URL. */
    get redirectUri() {
      return (
        process.env.GOOGLE_REDIRECT_URI ||
        `${env.app.url.replace(/\/+$/, "")}/api/auth/google/callback`
      );
    },
    get isConfigured() {
      return Boolean(this.clientId && this.clientSecret);
    },
  },
  rateLimit: {
    disabled: bool(process.env.RATE_LIMIT_DISABLED, false),
  },
} as const;

/** True when running in a production build. */
export const isProduction = process.env.NODE_ENV === "production";

/** Warn (server-side) when using the insecure fallback auth secret. */
export function assertAuthSecretInProduction() {
  if (isProduction && env.auth.secret.startsWith("ayan-dev-insecure")) {
    // Do not throw during build; log a loud warning instead.
    // eslint-disable-next-line no-console
    console.warn(
      "[AYAN] WARNING: NEXTAUTH_SECRET is not set. Sessions will be signed " +
        "with an insecure development secret. Set NEXTAUTH_SECRET in production.",
    );
  }
}
