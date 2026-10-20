import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/Icons";

/** Metric card used across dashboards. */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  hint,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "brand" | "success" | "warning" | "danger" | "neutral";
  hint?: string;
}) {
  const tones: Record<string, string> = {
    brand: "bg-[rgb(var(--ayan-brand-soft))] text-brand-600",
    success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50",
    warning: "bg-amber-100 text-amber-600 dark:bg-amber-950/50",
    danger: "bg-red-100 text-red-600 dark:bg-red-950/50",
    neutral: "bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]",
  };
  return (
    <div className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[rgb(var(--ayan-muted))]">{label}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-[rgb(var(--ayan-text))]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[rgb(var(--ayan-muted))]">{hint}</p>}
    </div>
  );
}
