"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction, type AuthState } from "@/server/auth-actions";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Icons } from "@/components/ui/Icons";

const initial: AuthState = { ok: false };

/**
 * Sets the password for a newly created account. The one-time token comes from
 * the link in the booking confirmation.
 */
export function SetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initial);

  return (
    <div>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
        <Icons.shieldCheck className="h-5 w-5" />
      </span>
      <h1 className="ayan-h2 mt-4 text-[rgb(var(--ayan-text))]">Set your password</h1>
      <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">
        One last step — choose a password so you can manage your bookings,
        invoices and certificates.
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
            {pending ? "Saving…" : "Save password"}
          </Button>
        </form>
      )}

      {state.ok && (
        <div className="mt-6">
          <Button href="/dashboard" size="lg" fullWidth>
            Go to my dashboard
          </Button>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-[rgb(var(--ayan-muted))]">
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
