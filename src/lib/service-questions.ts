/**
 * Property / job questions attached to a service.
 *
 * A service can ask extra questions before it can be priced (the reference
 * flow asks "How many appliances do you have in total?" and similar). Each
 * question may adjust the price, so the answers are:
 *
 *   - collected during the booking journey,
 *   - stored on the booking item (so the engineer knows what to expect), and
 *   - re-priced on the server — the browser never decides the price.
 *
 * Questions are configured by an administrator and stored as JSON on the
 * service row, so no code change is needed to add a new question.
 */

export type ServiceQuestionType = "number" | "select" | "boolean";

export interface ServiceQuestionOption {
  label: string;
  description?: string;
  /** Price adjustment in pence (may be negative) when this option is chosen. */
  priceDelta?: number;
}

export interface ServiceQuestion {
  id: string;
  label: string;
  help?: string;
  type: ServiceQuestionType;
  required?: boolean;
  /** number questions: inclusive bounds */
  min?: number;
  max?: number;
  /** number questions: pence charged per unit answered */
  unitPrice?: number;
  /** number questions: pence added once when the count is greater than zero */
  basePrice?: number;
  /** boolean questions: pence added when answered "yes" */
  priceDelta?: number;
  options?: ServiceQuestionOption[];
}

export type ServiceAnswers = Record<string, string | number | boolean>;

export interface PriceAdjustment {
  questionId: string;
  label: string;
  amount: number;
}

export interface QuestionPriceResult {
  /** Base price plus every adjustment, never below zero. */
  total: number;
  adjustments: PriceAdjustment[];
}

/** Parse the JSON stored on a service, ignoring anything malformed. */
export function parseServiceQuestions(raw: string | null | undefined): ServiceQuestion[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (q): q is ServiceQuestion =>
        !!q && typeof q === "object" && typeof q.id === "string" && typeof q.label === "string",
    );
  } catch {
    return [];
  }
}

/** Serialise questions for storage. */
export function serialiseServiceQuestions(questions: ServiceQuestion[]): string {
  return JSON.stringify(questions);
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === "yes" || value === "true" || value === "on") return true;
  if (value === "no" || value === "false" || value === "") return false;
  return null;
}

/**
 * Price a service using the customer's answers.
 *
 * The base price is the service's "from" price. Every answered question can
 * add to (or subtract from) it:
 *   - number:  basePrice (once) + unitPrice × count
 *   - select:  the price delta of the chosen option
 *   - boolean: priceDelta when answered yes
 */
export function priceWithAnswers(
  basePrice: number,
  questions: ServiceQuestion[],
  answers: ServiceAnswers,
): QuestionPriceResult {
  let total = basePrice;
  const adjustments: PriceAdjustment[] = [];

  for (const question of questions) {
    const raw = answers?.[question.id];
    if (raw === undefined || raw === null || raw === "") continue;

    if (question.type === "number") {
      const count = toNumber(raw);
      if (count === null) continue;
      const amount =
        (count > 0 ? (question.basePrice ?? 0) : 0) +
        (question.unitPrice ?? 0) * count;
      if (amount !== 0) {
        total += amount;
        adjustments.push({
          questionId: question.id,
          label: `${question.label} (${count})`,
          amount,
        });
      }
      continue;
    }

    if (question.type === "boolean") {
      const answer = toBoolean(raw);
      if (answer === null) continue;
      const amount = answer ? (question.priceDelta ?? 0) : 0;
      if (amount !== 0) {
        total += amount;
        adjustments.push({
          questionId: question.id,
          label: question.label,
          amount,
        });
      }
      continue;
    }

    // select
    const chosen = String(raw);
    const option = (question.options ?? []).find((o) => o.label === chosen);
    if (!option) continue;
    const amount = option.priceDelta ?? 0;
    if (amount !== 0) {
      total += amount;
      adjustments.push({
        questionId: question.id,
        label: `${question.label}: ${option.label}`,
        amount,
      });
    }
  }

  return { total: Math.max(0, Math.round(total)), adjustments };
}

/**
 * Validate the answers against the question definitions.
 * Returns a map of question id -> error message (empty when valid).
 */
export function validateServiceAnswers(
  questions: ServiceQuestion[],
  answers: ServiceAnswers,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const question of questions) {
    const raw = answers?.[question.id];
    const isBlank =
      raw === undefined ||
      raw === null ||
      raw === "" ||
      (question.type === "boolean" && raw === undefined);

    if (isBlank) {
      if (question.required) errors[question.id] = "This answer is required";
      continue;
    }

    if (question.type === "number") {
      const count = toNumber(raw);
      if (count === null) {
        errors[question.id] = "Enter a number";
        continue;
      }
      if (count < 0) {
        errors[question.id] = "Enter a positive number";
        continue;
      }
      if (question.min !== undefined && count < question.min) {
        errors[question.id] = `Enter ${question.min} or more`;
        continue;
      }
      if (question.max !== undefined && count > question.max) {
        errors[question.id] = `Enter ${question.max} or less`;
      }
    }

    if (question.type === "select") {
      const valid = (question.options ?? []).some((o) => o.label === String(raw));
      if (!valid) errors[question.id] = "Choose one of the options";
    }
  }

  return errors;
}

/** Human readable answer summary, stored alongside the booking item. */
export function summariseAnswers(
  questions: ServiceQuestion[],
  answers: ServiceAnswers,
): string[] {
  const lines: string[] = [];
  for (const question of questions) {
    const raw = answers?.[question.id];
    if (raw === undefined || raw === null || raw === "") continue;
    if (question.type === "boolean") {
      lines.push(`${question.label}: ${toBoolean(raw) ? "Yes" : "No"}`);
    } else {
      lines.push(`${question.label}: ${String(raw)}`);
    }
  }
  return lines;
}

/** Parse an answers payload (JSON string) back into a record. */
export function parseServiceAnswers(raw: string | null | undefined): ServiceAnswers {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as ServiceAnswers) : {};
  } catch {
    return {};
  }
}
