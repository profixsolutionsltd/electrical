"use client";

import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";

/** Step 7 — booking confirmed. */
export function StepConfirmation({
  reference,
  bookingId,
  accountCreated,
  setPasswordToken,
  signedIn,
  email,
  onAnotherBooking,
}: {
  reference: string;
  bookingId: string;
  accountCreated: boolean;
  setPasswordToken: string | null;
  signedIn: boolean;
  email: string;
  onAnotherBooking: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] shadow-soft">
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-10 text-center text-white sm:px-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-8 ring-white/10">
          <Icons.check className="h-8 w-8" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
          Booking confirmed
        </h1>
        <p className="mt-2 text-sm text-white/85">
          A confirmation email is on its way to you now.
        </p>
        <div className="mt-6 inline-flex flex-col items-center rounded-xl bg-white/10 px-6 py-4">
          <span className="text-xs font-medium uppercase tracking-widest text-white/70">
            Booking Ref
          </span>
          <span className="mt-1 font-mono text-2xl font-bold tracking-tight">
            {reference}
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
          What happens next
        </h2>
        <ol className="mt-4 space-y-4">
          <NextStep
            index={1}
            title="We confirm the appointment"
            body="Our team checks the visit and emails you a confirmation with the engineer's details."
          />
          <NextStep
            index={2}
            title="An engineer is assigned"
            body="You'll be notified as soon as an engineer is allocated to your booking."
          />
          <NextStep
            index={3}
            title="We visit and issue your certificate"
            body="Pay on completion, then your documents are released to your dashboard."
          />
        </ol>

        {accountCreated && (
          <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-900 dark:bg-brand-950/30">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[rgb(var(--ayan-text))]">
              <Icons.user className="h-4 w-4 text-brand-600" />
              Your AYAN account is ready
            </h3>
            <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">
              We created an account for{" "}
              <span className="font-medium text-[rgb(var(--ayan-text))]">{email}</span> so
              you can track this booking. Set a password to manage it and rebook in
              seconds next time.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {setPasswordToken && (
                <Button href={`/set-password?token=${setPasswordToken}`}>
                  Set your password
                </Button>
              )}
              <Button href="/login" variant="outline">
                Sign in
              </Button>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 border-t border-[rgb(var(--ayan-border))] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[rgb(var(--ayan-muted))]">
            Need to change something? Call us on 020 8000 1234 quoting{" "}
            <span className="font-mono font-semibold">{reference}</span>.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href={signedIn ? `/dashboard/bookings/${bookingId}` : "/login"} variant="outline">
              {signedIn ? "View my bookings" : "Sign in to view"}
            </Button>
            <Button variant="ghost" onClick={onAnotherBooking}>
              Make another booking
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function NextStep({
  index,
  title,
  body,
}: {
  index: number;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
        {index}
      </span>
      <span>
        <span className="block text-sm font-semibold text-[rgb(var(--ayan-text))]">
          {title}
        </span>
        <span className="mt-0.5 block text-sm text-[rgb(var(--ayan-muted))]">
          {body}
        </span>
      </span>
    </li>
  );
}
