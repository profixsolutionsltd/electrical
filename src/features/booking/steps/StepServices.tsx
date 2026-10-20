"use client";

import { useMemo, useState } from "react";
import { useBookingStore, type BookingDraftService } from "../booking-store";
import { StepShell } from "./StepShell";
import { Icons } from "@/components/ui/Icons";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface CatalogueService extends BookingDraftService {
  categoryId: string;
  featured?: boolean;
}

export interface CatalogueCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  services: CatalogueService[];
}

/** Step 1 — choose one or many services. */
export function StepServices({
  categories,
  onNext,
  onBack,
}: {
  categories: CatalogueCategory[];
  onNext: () => void;
  onBack?: () => void;
}) {
  const { draft, toggleService, setServices } = useBookingStore();
  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.id ?? "all",
  );

  const visible = useMemo(() => {
    if (activeCategory === "all") {
      return categories.flatMap((c) => c.services);
    }
    return categories.find((c) => c.id === activeCategory)?.services ?? [];
  }, [categories, activeCategory]);

  const selectedIds = draft.services.map((s) => s.id);

  return (
    <StepShell
      eyebrow="Step 1 of 6"
      title="Choose your service"
      description="Book one or many in a single booking — we'll visit once and handle everything in one go."
      onBack={onBack}
      onNext={onNext}
      nextDisabled={selectedIds.length === 0}
      nextLabel={selectedIds.length > 1 ? `Continue with ${selectedIds.length} services` : "Continue"}
    >
      {/* Category filter */}
      <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
        <CategoryPill
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
          label="All services"
        />
        {categories.map((category) => (
          <CategoryPill
            key={category.id}
            active={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
            label={category.name}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[rgb(var(--ayan-border))] p-8 text-center text-sm text-[rgb(var(--ayan-muted))]">
          No services in this category yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((service) => {
            const selected = selectedIds.includes(service.id);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => toggleService(service)}
                aria-pressed={selected}
                className={cn(
                  "group relative flex h-full flex-col rounded-2xl border p-5 text-left transition-all",
                  selected
                    ? "border-brand-600 bg-brand-50/60 shadow-soft ring-1 ring-brand-600 dark:bg-brand-950/30"
                    : "border-[rgb(var(--ayan-border))] hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft",
                )}
              >
                <span
                  className={cn(
                    "absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-md border transition-colors",
                    selected
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] text-transparent",
                  )}
                >
                  <Icons.check className="h-3.5 w-3.5" />
                </span>

                {service.featured && (
                  <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                    <Icons.star className="h-3 w-3" />
                    Most booked
                  </span>
                )}

                <h3 className="font-display text-base font-semibold text-[rgb(var(--ayan-text))]">
                  {service.name}
                </h3>
                {service.summary && (
                  <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-[rgb(var(--ayan-muted))]">
                    {service.summary}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[rgb(var(--ayan-border))] pt-4 text-sm">
                  <span className="font-display text-lg font-bold text-[rgb(var(--ayan-text))]">
                    from {formatMoney(service.priceFrom)}
                  </span>
                  <span className="flex items-center gap-1.5 text-[rgb(var(--ayan-muted))]">
                    <Icons.clock className="h-4 w-4" />
                    {service.durationMinutes} min
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {draft.services.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-4 py-3">
          <p className="text-sm text-[rgb(var(--ayan-muted))]">
            <span className="font-semibold text-[rgb(var(--ayan-text))]">
              {draft.services.length}
            </span>{" "}
            {draft.services.length === 1 ? "service" : "services"} selected
          </p>
          <button
            type="button"
            onClick={() => setServices([])}
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Clear selection
          </button>
        </div>
      )}
    </StepShell>
  );
}

function CategoryPill({
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
      className={cn(
        "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-[rgb(var(--ayan-border))] text-[rgb(var(--ayan-muted))] hover:border-brand-300 hover:text-[rgb(var(--ayan-text))]",
      )}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
