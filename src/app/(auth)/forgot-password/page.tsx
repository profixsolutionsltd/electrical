"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, type AuthState } from "@/server/auth-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Icons } from "@/components/ui/Icons";

const initial: AuthState = { ok: false };

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initial);

  return (
    <div>
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[rgb(var(--ayan-brand-soft))] text-brand-600">
        <Icons.shield className="h-5 w-5" />
      </span>
      <h1 className="ayan-h2 mt-5 text-[rgb(var(--ayan-text))]">Forgot password?</h1>
      <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">
        Enter your email and we&apos;ll send you instructions to reset your
        password.
      </p>

      {state.message && (
        <div className="mt-6">
          <Alert tone={state.ok ? "success" : "error"}>{state.message}</Alert>
        </div>
      )}

      <form action={formAction} className="mt-6 space-y-5">
        <Input
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          required
          error={state.errors?.email}
        />
        <Button type="submit" size="lg" fullWidth loading={pending}>
          {pending ? "Sending…" : "Send reset instructions"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[rgb(var(--ayan-muted))]">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
