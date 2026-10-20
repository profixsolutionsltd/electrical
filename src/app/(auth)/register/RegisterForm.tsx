"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthState } from "@/server/auth-actions";
import { Button } from "@/components/ui/Button";
import { Input, PasswordInput } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import { Icons } from "@/components/ui/Icons";
import { AuthDivider, GoogleButton } from "@/components/auth/GoogleButton";
import { cn } from "@/lib/utils";

const initial: AuthState = { ok: false };

export function RegisterForm({
  googleEnabled,
  initialError,
}: {
  googleEnabled: boolean;
  initialError?: string;
}) {
  const [state, formAction, pending] = useActionState(registerAction, initial);
  const [role, setRole] = useState<"CUSTOMER" | "ENGINEER">("CUSTOMER");

  const errorMessage = state.message && !state.ok ? state.message : initialError;

  return (
    <div>
      <h1 className="ayan-h2 text-[rgb(var(--ayan-text))]">Create your account</h1>
      <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">
        Join AYAN to book services and manage everything in one place.
      </p>

      {errorMessage && (
        <div className="mt-6">
          <Alert tone="error">{errorMessage}</Alert>
        </div>
      )}

      {googleEnabled && (
        <>
          <div className="mt-6">
            <GoogleButton label="Sign up with Google" />
          </div>
          <AuthDivider />
        </>
      )}

      {/* Account type selector */}
      <fieldset className="mt-6">
        <legend className="mb-2 text-sm font-medium text-[rgb(var(--ayan-text))]">
          I am a…
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <RoleOption
            active={role === "CUSTOMER"}
            onClick={() => setRole("CUSTOMER")}
            icon={Icons.home}
            title="Customer"
            description="Landlord, agent or homeowner"
          />
          <RoleOption
            active={role === "ENGINEER"}
            onClick={() => setRole("ENGINEER")}
            icon={Icons.briefcase}
            title="Engineer"
            description="Complete jobs on the platform"
          />
        </div>
        <input type="hidden" name="role" value={role} />
      </fieldset>

      <form action={formAction} className="mt-5 space-y-4">
        <Input name="name" label="Full name" placeholder="Jane Doe" autoComplete="name" required error={state.errors?.name} />
        <Input name="email" type="email" label="Email address" placeholder="you@example.com" autoComplete="email" required error={state.errors?.email} />
        <Input name="phone" label="Phone (optional)" placeholder="+44 7700 900000" autoComplete="tel" error={state.errors?.phone} />
        <PasswordInput name="password" label="Password" placeholder="Create a password" autoComplete="new-password" required error={state.errors?.password} hint="At least 8 characters with upper, lower and a number." />
        <PasswordInput name="confirmPassword" label="Confirm password" placeholder="Re-enter your password" autoComplete="new-password" required error={state.errors?.confirmPassword} />

        <div>
          <Checkbox
            name="acceptTerms"
            label={
              <>
                I agree to the{" "}
                <Link href="/legal/terms" className="text-brand-600 hover:underline">Terms of Service</Link> and{" "}
                <Link href="/legal/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>.
              </>
            }
          />
          {state.errors?.acceptTerms && (
            <p className="mt-1.5 text-xs font-medium text-red-600">{state.errors.acceptTerms}</p>
          )}
        </div>

        <Button type="submit" size="lg" fullWidth loading={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[rgb(var(--ayan-muted))]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function RoleOption({
  active,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border p-4 text-left transition-colors",
        active
          ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600 dark:bg-brand-950/40"
          : "border-[rgb(var(--ayan-border))] hover:border-brand-300",
      )}
      aria-pressed={active}
    >
      <Icon className={cn("h-5 w-5", active ? "text-brand-600" : "text-[rgb(var(--ayan-muted))]")} />
      <p className="mt-2 text-sm font-semibold text-[rgb(var(--ayan-text))]">{title}</p>
      <p className="text-xs text-[rgb(var(--ayan-muted))]">{description}</p>
    </button>
  );
}
