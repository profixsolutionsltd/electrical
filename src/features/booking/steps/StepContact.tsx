"use client";

import { useState } from "react";
import { useBookingStore } from "../booking-store";
import { StepShell } from "./StepShell";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Field";
import { Icons } from "@/components/ui/Icons";

/** Step 5 — who the visit is for and how we can reach them. */
export function StepContact({
  onNext,
  onBack,
  signedInName,
  signedInEmail,
}: {
  onNext: () => void;
  onBack: () => void;
  signedInName?: string;
  signedInEmail?: string;
}) {
  const { draft, updateDetails } = useBookingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};

    if (draft.contactName.trim().length < 2) {
      next.contactName = "Enter your full name";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(draft.contactEmail.trim())) {
      next.contactEmail = "Enter a valid email address";
    }
    if (draft.contactPhone.replace(/[^0-9]/g, "").length < 7) {
      next.contactPhone = "Enter a valid phone number";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onNext();
  };

  return (
    <StepShell
      eyebrow="Step 5 of 6"
      title="Complete your details to confirm your booking"
      description="We'll use these to confirm the appointment and send your certificates."
      onBack={onBack}
      onNext={validate}
    >
      <div className="space-y-5">
        {signedInEmail ? (
          <div className="flex items-start gap-3 rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] p-4">
            <Icons.user className="mt-0.5 h-5 w-5 text-brand-600" />
            <p className="text-sm text-[rgb(var(--ayan-muted))]">
              Booking as{" "}
              <span className="font-semibold text-[rgb(var(--ayan-text))]">
                {signedInName} ({signedInEmail})
              </span>
              . You can change the contact details below.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] p-4">
            <Icons.info className="mt-0.5 h-5 w-5 text-brand-600" />
            <p className="text-sm text-[rgb(var(--ayan-muted))]">
              No account needed to book. We&apos;ll create one for you after
              confirmation so you can track this job and any future bookings.
            </p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            name="contactName"
            label="Full name"
            value={draft.contactName}
            onChange={(e) => updateDetails({ contactName: e.target.value })}
            placeholder="Jane Doe"
            autoComplete="name"
            error={errors.contactName}
          />
          <Input
            name="contactPhone"
            type="tel"
            label="Phone number"
            value={draft.contactPhone}
            onChange={(e) => updateDetails({ contactPhone: e.target.value })}
            placeholder="07700 900000"
            autoComplete="tel"
            error={errors.contactPhone}
          />
        </div>

        <Input
          name="contactEmail"
          type="email"
          label="Email address"
          value={draft.contactEmail}
          onChange={(e) => updateDetails({ contactEmail: e.target.value })}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.contactEmail}
          hint="Your booking reference and confirmation are sent here."
        />

        <Textarea
          name="notes"
          label="Anything the engineer should know? (optional)"
          value={draft.notes}
          onChange={(e) => updateDetails({ notes: e.target.value })}
          rows={4}
          placeholder="The boiler is in the garage, the electrics are in the cupboard by the front door."
        />
      </div>
    </StepShell>
  );
}
