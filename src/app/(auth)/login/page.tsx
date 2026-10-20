import type { Metadata } from "next";
import { env } from "@/lib/env";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in | AYAN",
  description:
    "Sign in to your AYAN account to manage bookings, certificates and invoices.",
};

/** Query-string errors produced by the server (guards, OAuth callback). */
const ERROR_MESSAGES: Record<string, string> = {
  suspended: "Your account has been suspended. Please contact support.",
  "google-unavailable":
    "Google sign-in is not configured on this environment. Please sign in with your email and password.",
  "google-denied": "Google sign-in was cancelled.",
  "google-invalid":
    "That Google sign-in request expired or could not be verified. Please try again.",
  "google-failed":
    "Google sign-in failed. Please try again or sign in with your email and password.",
};

function safeNext(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <LoginForm
      googleEnabled={env.google.isConfigured}
      emailConfigured={env.email.isConfigured}
      initialError={params.error ? ERROR_MESSAGES[params.error] : undefined}
      next={safeNext(params.next)}
    />
  );
}
