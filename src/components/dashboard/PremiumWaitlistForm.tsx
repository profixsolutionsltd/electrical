"use client";

import { useActionState } from "react";
import { joinPremiumWaitlistAction, type PremiumWaitlistState } from "@/server/premium-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Icons } from "@/components/ui/Icons";

const initial: PremiumWaitlistState = { ok: false };

/** Launch waitlist sign-up for the coming-soon Premium tier. */
export function PremiumWaitlistForm({
  defaultEmail,
  alreadyJoined,
  waitlistOpen,
}: {
  defaultEmail: string;
  alreadyJoined: boolean;
  waitlistOpen: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    joinPremiumWaitlistAction,
    initial,
  );

  if (alreadyJoined) {
    return (
      <Alert tone="success" title="You're on the Premium waitlist">
        We&apos;ll email you as soon as Premium goes live. Keep an eye on your
        inbox — early members get first access and a launch discount.
      </Alert>
    );
  }

  if (!waitlistOpen) {
    return (
      <Alert tone="info" title="Waitlist closed">
        The Premium waitlist is closed at the moment. Please check back soon.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <Alert tone={state.ok ? "success" : "error"}>{state.message}</Alert>
      )}

      <Input
        name="email"
        type="email"
        label="Email address"
        defaultValue={defaultEmail}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />

      <Button type="submit" fullWidth loading={pending}>
        {pending ? "Adding you…" : "Join the waitlist"}
        {!pending && <Icons.arrowRight className="h-4 w-4" />}
      </Button>

      <p className="text-xs text-[rgb(var(--ayan-muted))]">
        No spam, no card details. One email when we launch.
      </p>
    </form>
  );
}
