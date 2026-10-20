import { cn } from "@/lib/utils";

/** Consistent page header for dashboard pages. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h1 className="font-display text-2xl font-bold text-[rgb(var(--ayan-text))]">{title}</h1>
        {description && <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
