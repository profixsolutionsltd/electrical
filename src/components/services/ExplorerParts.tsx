import { cn } from "@/lib/utils";
import { Icons, getIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

/** Filter chip for a service category. */
export function CategoryChip({
  active,
  onClick,
  label,
  count,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon?: string | null;
}) {
  const Icon = icon ? getIcon(icon) : null;
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] text-[rgb(var(--ayan-muted))] hover:border-brand-300 hover:text-brand-600",
      )}
      aria-pressed={active}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
      <span className={cn("text-xs", active ? "text-white/70" : "text-[rgb(var(--ayan-muted))]")}>
        {count}
      </span>
    </button>
  );
}

/** Empty state shown when filters return no results. */
export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--ayan-border))] py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]">
        <Icons.search className="h-6 w-6" />
      </div>
      <h3 className="ayan-h3 mt-4 text-[rgb(var(--ayan-text))]">No services found</h3>
      <p className="mt-2 max-w-sm text-sm text-[rgb(var(--ayan-muted))]">
        Try adjusting your search or filters to find what you&apos;re looking for.
      </p>
      <Button variant="outline" size="sm" className="mt-5" onClick={onReset}>
        Clear filters
      </Button>
    </div>
  );
}
