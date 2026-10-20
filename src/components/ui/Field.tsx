import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

/** Textarea field with label, error and hint. */
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    error?: string;
    hint?: string;
  }
>(function Textarea({ label, error, hint, className, id, ...props }, ref) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(
          "w-full rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] px-3.5 py-2.5 text-sm shadow-sm transition-colors placeholder:text-[rgb(var(--ayan-muted))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30",
          error && "border-red-400",
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-[rgb(var(--ayan-muted))]">{hint}</p>
      )}
    </div>
  );
});

/** Select field with label, error and hint. */
export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    error?: string;
    hint?: string;
  }
>(function Select({ label, error, hint, className, id, children, ...props }, ref) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-11 w-full rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] px-3 text-sm shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30",
          error && "border-red-400",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-[rgb(var(--ayan-muted))]">{hint}</p>
      )}
    </div>
  );
});

/** Checkbox with label. */
export function Checkbox({
  label,
  className,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={fieldId}
        type="checkbox"
        className={cn(
          "mt-0.5 h-4 w-4 rounded border-[rgb(var(--ayan-border))] text-brand-600 focus:ring-brand-500",
          className,
        )}
        {...props}
      />
      <label htmlFor={fieldId} className="text-sm text-[rgb(var(--ayan-text))]">
        {label}
      </label>
    </div>
  );
}
