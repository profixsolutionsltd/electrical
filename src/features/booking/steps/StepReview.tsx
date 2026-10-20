"use client";

import { useState } from "react";
import { useBookingStore } from "../booking-store";
import { StepShell } from "./StepShell";
import { Icons } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { submitBooking, type BookingQuote } from "../actions";

/** Step 6 — review everything, choose how to pay and confirm. */
export function StepReview({
  quote,
  onBack,
  onConfirmed,
  cardPaymentEnabled,
  signedIn,
}: {
  quote: BookingQuote | null;
  onBack: () => void;
  onConfirmed: (result: {
    bookingId: string;
    reference: string;
    accountCreated: boolean;
    setPasswordToken: string | null;
  }) => void;
  cardPaymentEnabled: boolean;
  signedIn: boolean;
}) {
  const { draft, updateDetails, reset } = useBookingStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setSubmitting(true);
    setError(null);

    const result = await submitBooking({
      lines: draft.services.map((service) => ({
        serviceId: service.id,
        answers: draft.answers[service.id] ?? {},
      })),
      addressLine1: draft.addressLine1,
      addressLine2: draft.addressLine2,
      city: draft.city,
      postcode: draft.postcode,
      propertyType: draft.propertyType,
      bedrooms: draft.bedrooms,
      contactName: draft.contactName,
      contactPhone: draft.contactPhone,
      contactEmail: draft.contactEmail,
      scheduledDate: draft.scheduledDate,
      timeWindow: draft.timeWindow,
      notes: draft.notes,
      accessNotes: draft.accessNotes,
      paymentMethod: draft.paymentMethod,
      discountCode: draft.discountCode,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    reset();
    onConfirmed(result);
  };

  return (
    <StepShell
      eyebrow="Step 6 of 6"
      title="Review and confirm your booking"
      description="Check the details below. You can go back and change anything before you confirm."
      onBack={onBack}
      onNext={confirm}
      nextLabel="Confirm booking"
      loading={submitting}
      error={error ?? undefined}
    >
      <div className="space-y-6">
        {/* Appointment */}
        <ReviewBlock title="Appointment" icon={Icons.calendar}>
          <ReviewRow label="Date" value={draft.scheduledDate} />
          <ReviewRow
            label="Window"
            value={
              draft.timeWindow === "MORNING"
                ? "Morning (08:00 – 12:00)"
                : draft.timeWindow === "AFTERNOON"
                  ? "Afternoon (12:00 – 17:00)"
                  : "Evening (17:00 – 20:00)"
            }
          />
          <ReviewRow label="Duration" value={`${quote?.durationMinutes ?? 0} minutes on site`} />
        </ReviewBlock>

        {/* Property */}
        <ReviewBlock title="Property" icon={Icons.mapPin}>
          <ReviewRow label="Address" value={draft.addressLine1} />
          {draft.addressLine2 && <ReviewRow label="" value={draft.addressLine2} />}
          <ReviewRow label="Town / city" value={draft.city} />
          <ReviewRow label="Postcode" value={draft.postcode} />
          {draft.propertyType && (
            <ReviewRow label="Property type" value={draft.propertyType} />
          )}
          {draft.bedrooms && <ReviewRow label="Bedrooms" value={draft.bedrooms} />}
        </ReviewBlock>

        {/* Services and answers */}
        <ReviewBlock title="Services" icon={Icons.briefcase}>
          {draft.services.map((service) => {
            const answers = draft.answers[service.id] ?? {};
            const entries = Object.entries(answers).filter(
              ([, value]) => value !== "" && value !== undefined,
            );
            return (
              <div key={service.id} className="border-b border-[rgb(var(--ayan-border))] py-3 last:border-0 last:pb-0 first:pt-0">
                <p className="text-sm font-semibold text-[rgb(var(--ayan-text))]">
                  {service.name}
                </p>
                {entries.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {entries.map(([questionId, value]) => {
                      const question = (service.questions ?? []).find(
                        (q) => q.id === questionId,
                      );
                      return (
                        <li
                          key={questionId}
                          className="text-xs text-[rgb(var(--ayan-muted))]"
                        >
                          {question?.label ?? questionId}:{" "}
                          <span className="font-medium text-[rgb(var(--ayan-text))]">
                            {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </ReviewBlock>

        {/* Contact */}
        <ReviewBlock title="Your details" icon={Icons.user}>
          <ReviewRow label="Name" value={draft.contactName} />
          <ReviewRow label="Email" value={draft.contactEmail} />
          <ReviewRow label="Phone" value={draft.contactPhone} />
          {!signedIn && (
            <p className="mt-3 text-xs text-[rgb(var(--ayan-muted))]">
              We&apos;ll create an AYAN account for you so you can manage this
              booking and rebook in seconds next time.
            </p>
          )}
        </ReviewBlock>

        {/* Payment */}
        <ReviewBlock title="How would you like to pay?" icon={Icons.creditCard}>
          <div className="grid gap-3 sm:grid-cols-2">
            <PaymentOption
              active={draft.paymentMethod === "PAY_LATER"}
              onClick={() => updateDetails({ paymentMethod: "PAY_LATER" })}
              title="Pay on completion"
              description="Settle the invoice after the job is done. Recommended."
              badge="Recommended"
            />
            <PaymentOption
              active={draft.paymentMethod === "CARD"}
              onClick={() =>
                cardPaymentEnabled && updateDetails({ paymentMethod: "CARD" })
              }
              title="Pay by card now"
              description={
                cardPaymentEnabled
                  ? "Secure card payment processed at booking."
                  : "Card payments aren't available right now."
              }
              disabled={!cardPaymentEnabled}
            />
          </div>
        </ReviewBlock>
        {/* Total — always the server price */}
        <ReviewBlock title="Price" icon={Icons.receipt}>
          <ReviewRow label="Subtotal" value={formatMoney(quote?.subtotal ?? 0)} />
          <ReviewRow label={`VAT (${quote?.vatRate ?? 20}%)`} value={formatMoney(quote?.vatAmount ?? 0)} />
          {quote && quote.discount > 0 && (
            <ReviewRow label={`Discount (${quote.discountCode ?? ""})`} value={`−${formatMoney(quote.discount)}`} />
          )}
          <div className="mt-2 flex justify-between gap-4 border-t border-[rgb(var(--ayan-border))] pt-2">
            <span className="text-sm font-semibold text-[rgb(var(--ayan-text))]">Total</span>
            <span className="text-right font-display text-lg font-bold text-[rgb(var(--ayan-text))]">
              {formatMoney(quote?.total ?? 0)}
            </span>
          </div>
          <p className="mt-1 text-right text-xs text-[rgb(var(--ayan-muted))]">
            Priced and confirmed on our servers.
          </p>
        </ReviewBlock>
      </div>
    </StepShell>
  );
}

function ReviewBlock({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[rgb(var(--ayan-border))] p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[rgb(var(--ayan-text))]">
        <Icon className="h-4 w-4 text-brand-600" />
        {title}
      </h3>
      <div className="mt-3 space-y-1.5 text-sm">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <p className="flex justify-between gap-4">
      {label && (
        <span className="text-[rgb(var(--ayan-muted))]">{label}</span>
      )}
      <span className="text-right font-medium text-[rgb(var(--ayan-text))]">
        {value}
      </span>
    </p>
  );
}

function PaymentOption({
  active,
  onClick,
  title,
  description,
  badge,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
  badge?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
        active
          ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-600 dark:bg-brand-950/30"
          : "border-[rgb(var(--ayan-border))] hover:border-brand-300",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          active ? "border-brand-600 bg-brand-600 text-white" : "border-[rgb(var(--ayan-border))]",
        )}
      >
        {active && <Icons.check className="h-3 w-3" />}
      </span>
      <span>
        <span className="flex items-center gap-2 text-sm font-semibold text-[rgb(var(--ayan-text))]">
          {title}
          {badge && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs text-[rgb(var(--ayan-muted))]">
          {description}
        </span>
      </span>
    </button>
  );
}
