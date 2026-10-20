import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";

/** Shared wrapper for each journey step: title, description, body, navigation. */
export function StepShell({
  title,
  description,
  eyebrow,
  children,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  loading = false,
  error,
  backLabel = "Back",
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  error?: string;
  backLabel?: string;
}) {
  return (
    <section className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] shadow-soft">
      <div className="p-6 sm:p-8">
        {eyebrow && (
          <p className="ayan-eyebrow mb-3">
            <Icons.check className="h-3.5 w-3.5" />
            {eyebrow}
          </p>
        )}
        <h1 className="ayan-h3 text-[rgb(var(--ayan-text))]">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[rgb(var(--ayan-muted))]">
            {description}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            <Icons.info className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="mt-6">{children}</div>
      </div>

      <div className="flex flex-col-reverse items-stretch gap-3 border-t border-[rgb(var(--ayan-border))] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        {onBack ? (
          <Button variant="ghost" onClick={onBack} disabled={loading}>
            <Icons.arrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        ) : (
          <p className="hidden text-xs text-[rgb(var(--ayan-muted))] sm:block">
            Your progress is saved automatically.
          </p>
        )}
        {onNext && (
          <Button onClick={onNext} loading={loading} disabled={nextDisabled} size="lg">
            {nextLabel}
            {!loading && <Icons.arrowRight className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </section>
  );
}
