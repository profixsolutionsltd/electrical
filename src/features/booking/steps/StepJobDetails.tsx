"use client";

import { useState } from "react";
import { useBookingStore } from "../booking-store";
import { StepShell } from "./StepShell";
import { Icons } from "@/components/ui/Icons";
import { formatMoney } from "@/lib/format";
import { validateServiceAnswers, type ServiceQuestion } from "@/lib/service-questions";
import { cn } from "@/lib/utils";

/**
 * Step 3 — job specific questions. These are configured per service by an
 * administrator and can change the price, so the answers are re-priced on the
 * server before the booking is created.
 */
export function StepJobDetails({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { draft, setAnswers } = useBookingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const withQuestions = draft.services.filter((s) => (s.questions ?? []).length > 0);

  const validate = () => {
    const next: Record<string, string> = {};
    for (const service of withQuestions) {
      const errors = validateServiceAnswers(
        service.questions ?? [],
        draft.answers[service.id] ?? {},
      );
      for (const [questionId, message] of Object.entries(errors)) {
        next[`${service.id}.${questionId}`] = message;
      }
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      document
        .getElementById(Object.keys(next)[0].replace(".", "-"))
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onNext();
  };

  if (withQuestions.length === 0) {
    return (
      <StepShell
        eyebrow="Step 3 of 6"
        title="A couple of quick questions"
        description="We need a little more detail so the engineer arrives prepared."
        onBack={onBack}
        onNext={onNext}
      >
        <div className="rounded-2xl border border-dashed border-[rgb(var(--ayan-border))] p-8 text-center">
          <Icons.checkCircle className="mx-auto h-10 w-10 text-emerald-500" />
          <p className="mt-3 text-sm text-[rgb(var(--ayan-muted))]">
            Nothing else to ask for your selected services — the details we have
            are enough.
          </p>
        </div>
      </StepShell>
    );
  }

  return (
    <StepShell
      eyebrow="Step 3 of 6"
      title="Tell us about the property"
      description="A few quick answers so the engineer knows what to expect on the day."
      onBack={onBack}
      onNext={validate}
    >
      <div className="space-y-6">
        {withQuestions.map((service) => (
          <div
            key={service.id}
            className="rounded-2xl border border-[rgb(var(--ayan-border))] p-5 sm:p-6"
          >
            <h3 className="font-display text-base font-semibold text-[rgb(var(--ayan-text))]">
              {service.name}
            </h3>

            <div className="mt-5 space-y-6">
              {(service.questions ?? []).map((question) => (
                <QuestionField
                  key={question.id}
                  serviceId={service.id}
                  question={question}
                  value={draft.answers[service.id]?.[question.id]}
                  error={errors[`${service.id}.${question.id}`]}
                  onChange={(value) =>
                    setAnswers(service.id, {
                      ...(draft.answers[service.id] ?? {}),
                      [question.id]: value,
                    })
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </StepShell>
  );
}

function QuestionField({
  serviceId,
  question,
  value,
  error,
  onChange,
}: {
  serviceId: string;
  question: ServiceQuestion;
  value: string | number | boolean | undefined;
  error?: string;
  onChange: (value: string | number | boolean) => void;
}) {
  const fieldId = `${serviceId}-${question.id}`.replace(/\./g, "-");

  return (
    <div id={fieldId}>
      <p className="text-sm font-semibold text-[rgb(var(--ayan-text))]">
        {question.label}
        {question.required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </p>
      {question.help && (
        <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">{question.help}</p>
      )}

      <div className="mt-3">
        {question.type === "number" && (
          <input
            type="number"
            inputMode="numeric"
            min={question.min ?? 0}
            max={question.max}
            value={value === undefined ? "" : String(value)}
            onChange={(e) =>
              onChange(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="0"
            aria-invalid={error ? true : undefined}
            className={cn(
              "h-11 w-40 rounded-xl border bg-[rgb(var(--ayan-card))] px-3.5 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30",
              error
                ? "border-red-400"
                : "border-[rgb(var(--ayan-border))] focus:border-brand-500",
            )}
          />
        )}

        {question.type === "boolean" && (
          <div className="flex flex-wrap gap-2">
            <AnswerChip
              active={value === true}
              onClick={() => onChange(true)}
              label="Yes"
            />
            <AnswerChip
              active={value === false}
              onClick={() => onChange(false)}
              label="No"
            />
          </div>
        )}

        {question.type === "select" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {(question.options ?? []).map((option) => {
              const active = value === option.label;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => onChange(option.label)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors",
                    active
                      ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-600 dark:bg-brand-950/30"
                      : "border-[rgb(var(--ayan-border))] hover:border-brand-300",
                  )}
                >
                  <span>
                    <span className="block text-sm font-medium text-[rgb(var(--ayan-text))]">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="mt-0.5 block text-xs text-[rgb(var(--ayan-muted))]">
                        {option.description}
                      </span>
                    )}
                  </span>
                  {option.priceDelta ? (
                    <span className="shrink-0 rounded-full bg-[rgb(var(--ayan-surface))] px-2 py-0.5 text-xs font-semibold text-[rgb(var(--ayan-text))]">
                      {option.priceDelta > 0 ? "+" : "−"}
                      {formatMoney(Math.abs(option.priceDelta))}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function AnswerChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-[rgb(var(--ayan-border))] text-[rgb(var(--ayan-text))] hover:border-brand-300",
      )}
    >
      {label}
    </button>
  );
}
