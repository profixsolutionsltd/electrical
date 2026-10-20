"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "./booking-store";
import { StepIndicator, WizardHeader, WizardSkeleton } from "./WizardChrome";
import { StepServices, type CatalogueCategory, type CatalogueService } from "./steps/StepServices";
import { StepProperty } from "./steps/StepProperty";
import { StepJobDetails } from "./steps/StepJobDetails";
import { StepDateTime } from "./steps/StepDateTime";
import { StepContact } from "./steps/StepContact";
import { StepReview } from "./steps/StepReview";
import { StepConfirmation } from "./steps/StepConfirmation";
import { BookingSummary } from "./BookingSummary";
import { quoteBooking, type BookingQuote } from "./actions";
import { TIME_WINDOWS } from "@/lib/slots";

const STEPS = [
  { label: "Services", short: "Services" },
  { label: "Property", short: "Property" },
  { label: "Job details", short: "Details" },
  { label: "Date & time", short: "Date & time" },
  { label: "Your details", short: "Contact" },
  { label: "Review & pay", short: "Review" },
];

export interface WizardUser {
  name: string;
  email: string;
  phone?: string | null;
}

export function BookingWizard({
  catalogue,
  user,
  preselectIds,
  defaultPostcode,
  startStep = 0,
  cardPaymentEnabled,
}: {
  catalogue: CatalogueCategory[];
  user: WizardUser | null;
  preselectIds: string[];
  defaultPostcode?: string;
  startStep?: number;
  cardPaymentEnabled: boolean;
}) {
  const router = useRouter();
  const { draft, setServices, updateDetails, setStep, reset, hydrated } =
    useBookingStore();

  const [step, setLocalStep] = useState(startStep);
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [discountInput, setDiscountInput] = useState("");
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{
    bookingId: string;
    reference: string;
    accountCreated: boolean;
    setPasswordToken: string | null;
  } | null>(null);

  const allServices = useMemo(
    () => catalogue.flatMap((category) => category.services),
    [catalogue],
  );

  /* Hydration: restore the saved draft and apply the preselected services. */
  useEffect(() => {
    if (!hydrated) return;

    if (draft.services.length === 0 && preselectIds.length > 0) {
      const preselected = preselectIds
        .map((id) => allServices.find((s) => s.id === id))
        .filter((s): s is CatalogueService => Boolean(s))
        .map((s) => ({
          id: s.id,
          name: s.name,
          summary: s.summary,
          priceFrom: s.priceFrom,
          vatApplicable: s.vatApplicable,
          durationMinutes: s.durationMinutes,
          questions: s.questions,
        }));
      if (preselected.length > 0) setServices(preselected);
    }

    if (user) {
      const patch: Partial<typeof draft> = {};
      if (!draft.contactName) patch.contactName = user.name;
      if (!draft.contactEmail) patch.contactEmail = user.email;
      if (!draft.contactPhone && user.phone) patch.contactPhone = user.phone;
      if (Object.keys(patch).length > 0) updateDetails(patch);
    }

    if (defaultPostcode && !draft.postcode) {
      updateDetails({ postcode: defaultPostcode });
    }

    if (draft.discountCode) {
      setDiscountInput((current) => current || draft.discountCode);
    }

    if (draft.step > 0 && draft.step <= STEPS.length) {
      setLocalStep(Math.min(draft.step, STEPS.length - 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  /* Server-side quote — the browser never calculates money. */
  const quoteKey = useMemo(
    () =>
      JSON.stringify({
        services: draft.services.map((s) => s.id),
        answers: draft.answers,
        discount: draft.discountCode,
      }),
    [draft.services, draft.answers, draft.discountCode],
  );

  const refreshQuote = useCallback(async () => {
    if (draft.services.length === 0) {
      setQuote(null);
      return;
    }
    setQuoteLoading(true);
    try {
      const result = await quoteBooking(
        draft.services.map((service) => ({
          serviceId: service.id,
          answers: draft.answers[service.id] ?? {},
        })),
        draft.discountCode,
      );
      setQuote(result);
      setDiscountError(result.discountError ?? null);
      setDiscountMessage(
        result.discountError ? null : result.discount > 0
          ? `${result.discountCode} applied — you saved ${(result.discount / 100).toFixed(2)}.`
          : null,
      );
      // An invalid code is dropped from the draft so the summary never shows a
      // discount that the server will not honour.
      if (result.discountError && draft.discountCode) {
        updateDetails({ discountCode: "" });
      }
    } catch {
      setDiscountError("We couldn't update the total. Please try again.");
    } finally {
      setQuoteLoading(false);
    }
  }, [draft.services, draft.answers, draft.discountCode, updateDetails]);

  useEffect(() => {
    void refreshQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteKey]);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(STEPS.length - 1, next));
      setLocalStep(clamped);
      setStep(clamped);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setStep],
  );

  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);

  const applyDiscount = () => {
    const code = discountInput.trim().toUpperCase();
    if (!code) {
      setDiscountError("Enter a discount code");
      return;
    }
    updateDetails({ discountCode: code });
  };

  const clearDiscount = () => {
    setDiscountInput("");
    updateDetails({ discountCode: "" });
  };

  if (!hydrated) return <WizardSkeleton />;

  if (confirmed) {
    return (
      <div className="min-h-screen bg-[rgb(var(--ayan-surface))]">
        <WizardHeader signedIn={Boolean(user)} />
        <div className="ayan-container py-10">
          <div className="mx-auto max-w-3xl">
            <StepConfirmation
              reference={confirmed.reference}
              bookingId={confirmed.bookingId}
              accountCreated={confirmed.accountCreated}
              setPasswordToken={confirmed.setPasswordToken}
              signedIn={Boolean(user)}
              email={draft.contactEmail || user?.email || ""}
              onAnotherBooking={() => {
                reset();
                setConfirmed(null);
                setLocalStep(0);
                router.refresh();
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  const windowLabel =
    TIME_WINDOWS.find((w) => w.value === draft.timeWindow)?.label ?? "";

  return (
    <div className="min-h-screen bg-[rgb(var(--ayan-surface))]">
      <WizardHeader signedIn={Boolean(user)} />

      <div className="ayan-container py-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <h1 className="ayan-h2 text-[rgb(var(--ayan-text))]">Book a service</h1>
            <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">
              Choose your services, tell us about the property and pick a time —
              it takes about two minutes.
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] px-4 py-4 sm:px-6">
            <StepIndicator current={step} steps={STEPS} onGoTo={goTo} />
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              {step === 0 && (
                <StepServices categories={catalogue} onNext={next} />
              )}
              {step === 1 && <StepProperty onNext={next} onBack={back} />}
              {step === 2 && <StepJobDetails onNext={next} onBack={back} />}
              {step === 3 && <StepDateTime onNext={next} onBack={back} />}
              {step === 4 && (
                <StepContact
                  onNext={next}
                  onBack={back}
                  signedInName={user?.name}
                  signedInEmail={user?.email}
                />
              )}
              {step === 5 && (
                <StepReview
                  quote={quote}
                  onBack={back}
                  cardPaymentEnabled={cardPaymentEnabled}
                  signedIn={Boolean(user)}
                  onConfirmed={setConfirmed}
                />
              )}
            </div>

            <div className="lg:col-span-2">
              <BookingSummary
                quote={quote}
                property={{
                  addressLine1: draft.addressLine1,
                  city: draft.city,
                  postcode: draft.postcode,
                }}
                appointment={{
                  date: draft.scheduledDate
                    ? new Date(`${draft.scheduledDate}T12:00:00`).toLocaleDateString(
                        "en-GB",
                        { weekday: "short", day: "numeric", month: "short" },
                      )
                    : "",
                  window: windowLabel,
                }}
                discountCode={discountInput}
                onDiscountCodeChange={setDiscountInput}
                onApplyDiscount={applyDiscount}
                discountError={discountError}
                discountMessage={discountMessage}
                paymentMethod={draft.paymentMethod}
              />

              {quoteLoading && (
                <p className="mt-3 text-center text-xs text-[rgb(var(--ayan-muted))]">
                  Updating your total…
                </p>
              )}

              {draft.discountCode && (
                <button
                  type="button"
                  onClick={clearDiscount}
                  className="mt-3 w-full text-center text-xs font-medium text-[rgb(var(--ayan-muted))] hover:text-brand-600"
                >
                  Remove discount code
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
