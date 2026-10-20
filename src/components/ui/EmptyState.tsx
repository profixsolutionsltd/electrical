import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/Icons";

/** Reusable empty state. */
export function EmptyState({
  icon: Icon = Icons.info,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--ayan-border))] py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]">
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="ayan-h3 mt-4 text-[rgb(var(--ayan-text))]">{title}</h2>
      {description && <p className="mt-2 max-w-sm text-sm text-[rgb(var(--ayan-muted))]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
