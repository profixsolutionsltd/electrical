"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthState } from "@/server/auth-actions";
import { Button } from "@/components/ui/Button";
import { Input, PasswordInput } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import { AuthDivider, GoogleButton } from "@/components/auth/GoogleButton";

const initial: AuthState = { ok: false };

export function LoginForm({
  googleEnabled,
  emailConfigured,
  initialError,
  next,
}: {
  googleEnabled: boolean;
  emailConfigured: boolean;
  initialError?: string;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  const errorMessage = state.message && !state.ok ? state.message : initialError;

  return (
    <div>
      <h1 className="ayan-h2 text-[rgb(var(--ayan-text))]">Welcome back</h1>
      <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">
        Sign in to manage your bookings, certificates and account.
      </p>

      {errorMessage && (
        <div className="mt-6">
          <Alert tone="error">{errorMessage}</Alert>
        </div>
      )}

      {googleEnabled && (
        <>
          <div className="mt-6">
            <GoogleButton next={next} />
          </div>
          <AuthDivider />
        </>
      )}

      <form action={formAction} className="space-y-5">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <Input
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          required
          error={state.errors?.email}
        />
        <PasswordInput
          name="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          error={state.errors?.password}
        />

        <div className="flex items-center justify-between">
          <Checkbox name="rememberMe" label="Remember me" />
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[rgb(var(--ayan-muted))]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Create one
        </Link>
      </p>

      <DevCredentials emailConfigured={emailConfigured} />
    </div>
  );
}

/** Shows the seeded dev credentials only when not in production. */
function DevCredentials({ emailConfigured }: { emailConfigured: boolean }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div className="mt-8 rounded-xl border border-dashed border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] p-4 text-xs text-[rgb(var(--ayan-muted))]">
      <p className="font-semibold text-[rgb(var(--ayan-text))]">Development accounts</p>
      <p className="mt-1">Password for all: <code className="font-mono">Password123</code></p>
      <ul className="mt-1 space-y-0.5">
        <li>Customer: <code className="font-mono">customer@ayan.test</code></li>
        <li>Engineer: <code className="font-mono">engineer@ayan.test</code></li>
        <li>Admin: <code className="font-mono">admin@ayan.test</code></li>
      </ul>
      {emailConfigured && (
        <p className="mt-2 text-emerald-600">Email delivery is configured.</p>
      )}
    </div>
  );
}
