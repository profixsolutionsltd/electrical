"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Icons } from "@/components/ui/Icons";
import type { ServiceQuestion, ServiceQuestionType } from "@/lib/service-questions";

interface EditorQuestion {
  id: string;
  label: string;
  help: string;
  type: ServiceQuestionType;
  required: boolean;
  min: string;
  max: string;
  unitPrice: string;
  basePrice: string;
  priceDelta: string;
  options: { label: string; priceDelta: string }[];
}

function toEditorQuestion(question: ServiceQuestion): EditorQuestion {
  return {
    id: question.id,
    label: question.label,
    help: question.help ?? "",
    type: question.type,
    required: question.required ?? false,
    min: question.min !== undefined ? String(question.min) : "",
    max: question.max !== undefined ? String(question.max) : "",
    unitPrice: question.unitPrice !== undefined ? (question.unitPrice / 100).toFixed(2) : "",
    basePrice: question.basePrice !== undefined ? (question.basePrice / 100).toFixed(2) : "",
    priceDelta: question.priceDelta !== undefined ? (question.priceDelta / 100).toFixed(2) : "",
    options: (question.options ?? []).map((option) => ({
      label: option.label,
      priceDelta:
        option.priceDelta !== undefined ? (option.priceDelta / 100).toFixed(2) : "",
    })),
  };
}

function toPence(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.round(parsed * 100);
}

function toServiceQuestion(question: EditorQuestion): ServiceQuestion | null {
  if (!question.id.trim() || !question.label.trim()) return null;

  const base: ServiceQuestion = {
    id: question.id.trim(),
    label: question.label.trim(),
    type: question.type,
    required: question.required,
  };
  if (question.help.trim()) base.help = question.help.trim();

  if (question.type === "number") {
    const min = Number(question.min);
    const max = Number(question.max);
    if (question.min.trim() !== "" && Number.isFinite(min)) base.min = min;
    if (question.max.trim() !== "" && Number.isFinite(max)) base.max = max;
    const unitPrice = toPence(question.unitPrice);
    if (unitPrice !== undefined) base.unitPrice = unitPrice;
    const basePrice = toPence(question.basePrice);
    if (basePrice !== undefined) base.basePrice = basePrice;
  }

  if (question.type === "boolean") {
    const priceDelta = toPence(question.priceDelta);
    if (priceDelta !== undefined) base.priceDelta = priceDelta;
  }

  if (question.type === "select") {
    const options = question.options
      .filter((option) => option.label.trim())
      .map((option) => {
        const priceDelta = toPence(option.priceDelta);
        return priceDelta !== undefined
          ? { label: option.label.trim(), priceDelta }
          : { label: option.label.trim() };
      });
    if (options.length > 0) base.options = options;
  }

  return base;
}

function slugifyId(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug || "question";
}

function emptyQuestion(index: number): EditorQuestion {
  return {
    id: `question_${index + 1}`,
    label: "",
    help: "",
    type: "number",
    required: false,
    min: "",
    max: "",
    unitPrice: "",
    basePrice: "",
    priceDelta: "",
    options: [],
  };
}

/**
 * Editor for the per-service booking questions. The result is serialised into a
 * hidden `questions` field so the server stores it on the service row and the
 * booking journey can price the answers.
 */
export function QuestionsEditor({ initial }: { initial?: string | null }) {
  const [questions, setQuestions] = useState<EditorQuestion[]>(() => {
    if (!initial) return [];
    try {
      const parsed = JSON.parse(initial);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(
          (q): q is ServiceQuestion =>
            !!q && typeof q === "object" && typeof q.id === "string" && typeof q.label === "string",
        )
        .map(toEditorQuestion);
    } catch {
      return [];
    }
  });

  const serialised = JSON.stringify(
    questions
      .map(toServiceQuestion)
      .filter((q): q is ServiceQuestion => q !== null),
  );

  const update = (index: number, patch: Partial<EditorQuestion>) => {
    setQuestions((current) =>
      current.map((question, i) => (i === index ? { ...question, ...patch } : question)),
    );
  };

  const add = () => {
    setQuestions((current) => [...current, emptyQuestion(current.length)]);
  };

  const remove = (index: number) => {
    setQuestions((current) => current.filter((_, i) => i !== index));
  };

  const move = (index: number, direction: -1 | 1) => {
    setQuestions((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="questions" value={serialised} />

      {questions.length === 0 && (
        <p className="rounded-xl border border-dashed border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-4 py-6 text-center text-sm text-[rgb(var(--ayan-muted))]">
          No booking questions yet. Add one to collect details (and adjust the
          price) while the customer books.
        </p>
      )}

      {questions.map((question, index) => (
        <div
          key={index}
          className="space-y-3 rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] p-4"
        >
          <div className="flex items-start gap-3">
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <Input
                label="Question id"
                value={question.id}
                onChange={(e) => update(index, { id: e.target.value })}
                placeholder="appliance_count"
              />
              <Input
                label="Question"
                value={question.label}
                onChange={(e) => {
                  const label = e.target.value;
                  const patch: Partial<EditorQuestion> = { label };
                  if (!label.trim() || question.id.startsWith("question_")) {
                    patch.id = slugifyId(label);
                  }
                  update(index, patch);
                }}
                placeholder="How many appliances do you have?"
              />
            </div>
            <div className="flex shrink-0 items-center gap-1 pt-6">
              <button
                type="button"
                onClick={() => move(index, -1)}
                className="rounded-lg p-1.5 text-[rgb(var(--ayan-muted))] hover:bg-[rgb(var(--ayan-card))]"
                aria-label="Move question up"
              >
                <Icons.chevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                className="rounded-lg p-1.5 text-[rgb(var(--ayan-muted))] hover:bg-[rgb(var(--ayan-card))]"
                aria-label="Move question down"
              >
                <Icons.chevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                aria-label="Remove question"
              >
                <Icons.trash className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[rgb(var(--ayan-text))]">
                Answer type
              </label>
              <select
                value={question.type}
                onChange={(e) => update(index, { type: e.target.value as ServiceQuestionType })}
                className="w-full rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
              >
                <option value="number">Number</option>
                <option value="select">Choose one</option>
                <option value="boolean">Yes / No</option>
              </select>
            </div>

            <Input
              label="Helper text"
              value={question.help}
              onChange={(e) => update(index, { help: e.target.value })}
              placeholder="Optional guidance for the customer"
            />

            <label className="flex items-end gap-2 pb-2 text-sm font-medium text-[rgb(var(--ayan-text))]">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => update(index, { required: e.target.checked })}
                className="h-4 w-4 rounded border-[rgb(var(--ayan-border))] text-brand-600 focus:ring-brand-500"
              />
              Required
            </label>
          </div>

          {question.type === "number" && (
            <div className="grid gap-3 sm:grid-cols-4">
              <Input
                label="Price per unit (£)"
                type="number"
                step="0.01"
                value={question.unitPrice}
                onChange={(e) => update(index, { unitPrice: e.target.value })}
                placeholder="5.00"
              />
              <Input
                label="Base price (£)"
                type="number"
                step="0.01"
                value={question.basePrice}
                onChange={(e) => update(index, { basePrice: e.target.value })}
                placeholder="0.00"
              />
              <Input
                label="Min"
                type="number"
                value={question.min}
                onChange={(e) => update(index, { min: e.target.value })}
                placeholder="1"
              />
              <Input
                label="Max"
                type="number"
                value={question.max}
                onChange={(e) => update(index, { max: e.target.value })}
                placeholder="50"
              />
            </div>
          )}

          {question.type === "boolean" && (
            <Input
              label="Add £ when answered yes"
              type="number"
              step="0.01"
              value={question.priceDelta}
              onChange={(e) => update(index, { priceDelta: e.target.value })}
              placeholder="25.00"
            />
          )}

          {question.type === "select" && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[rgb(var(--ayan-text))]">Options</p>
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-end gap-2">
                  <Input
                    label="Option"
                    value={option.label}
                    onChange={(e) => {
                      const options = [...question.options];
                      options[optionIndex] = { ...option, label: e.target.value };
                      update(index, { options });
                    }}
                    placeholder="Small commercial unit"
                  />
                  <Input
                    label="Add £"
                    type="number"
                    step="0.01"
                    value={option.priceDelta}
                    onChange={(e) => {
                      const options = [...question.options];
                      options[optionIndex] = { ...option, priceDelta: e.target.value };
                      update(index, { options });
                    }}
                    placeholder="0.00"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      update(index, {
                        options: question.options.filter((_, i) => i !== optionIndex),
                      })
                    }
                    className="mb-1 rounded-lg p-2 text-red-600 hover:bg-red-50"
                    aria-label="Remove option"
                  >
                    <Icons.trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  update(index, { options: [...question.options, { label: "", priceDelta: "" }] })
                }
              >
                <Icons.plus className="h-4 w-4" />
                Add option
              </Button>
            </div>
          )}
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Icons.plus className="h-4 w-4" />
        Add booking question
      </Button>
    </div>
  );
}
