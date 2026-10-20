"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction, type AuthState } from "@/server/auth-actions";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

const initial: AuthState = { ok: false };

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initial);

  // The token is provided as a query parameter from the reset link.
  const token =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("token") ?? ""
      : "";

  return (
    <div>
      <h1 className="ayan-h2 text-[rgb(var(--ayan-text))]">Reset your password</h1>
      <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">
        Choose a new password for your account.
      </p>

      {state.message && (
        <div className="mt-6">
          <Alert tone={state.ok ? "success" : "error"}>{state.message}</Alert>
        </div>
      )}

      {!state.ok && (
        <form action={formAction} className="mt-6 space-y-5">
          <input type="hidden" name="token" value={token} />
          <PasswordInput
            name="password"
            label="New password"
            placeholder="Create a new password"
            autoComplete="new-password"
            required
            error={state.errors?.password}
            hint="At least 8 characters with upper, lower and a number."
          />
          <PasswordInput
            name="confirmPassword"
            label="Confirm new password"
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            required
            error={state.errors?.confirmPassword}
          />
          <Button type="submit" size="lg" fullWidth loading={pending}>
            {pending ? "Resetting…" : "Reset password"}
          </Button>
        </form>
      )}

      {state.ok && (
        <div className="mt-6">
          <Button href="/login" size="lg" fullWidth>
            Back to sign in
          </Button>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-[rgb(var(--ayan-muted))]">
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Return to sign in
        </Link>
      </p>
    </div>
  );
}
