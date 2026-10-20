import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icons, getIcon } from "@/components/ui/Icons";
import { formatMoney, formatDuration } from "@/lib/format";
import type { Service } from "@prisma/client";
import type { ServiceCategory } from "@prisma/client";

export type ServiceWithCategory = Service & { category: ServiceCategory };

/** Service card used across the homepage, directory and related sections. */
export function ServiceCard({
  service,
  featured = false,
}: {
  service: ServiceWithCategory;
  featured?: boolean;
}) {
  const Icon = getIcon(service.category?.icon);
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3 p-6 pb-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--ayan-brand-soft))] text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
          <Icon className="h-6 w-6" />
        </div>
        {featured && <Badge tone="brand">Popular</Badge>}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--ayan-muted))]">
          {service.category?.name}
        </span>
        <h3 className="ayan-h3 mt-1 text-[rgb(var(--ayan-text))]">{service.name}</h3>
        <p className="mt-2 flex-1 text-sm text-[rgb(var(--ayan-muted))]">
          {service.summary}
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-[rgb(var(--ayan-muted))]">
          <span className="inline-flex items-center gap-1.5">
            <Icons.clock className="h-4 w-4" />
            {formatDuration(service.durationMinutes)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icons.calendar className="h-4 w-4" />
            Next-day
          </span>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-[rgb(var(--ayan-border))] pt-4">
          <div>
            <span className="text-xs text-[rgb(var(--ayan-muted))]">From</span>
            <p className="font-display text-xl font-bold text-[rgb(var(--ayan-text))]">
              {formatMoney(service.priceFrom)}
              <span className="ml-1 text-xs font-medium text-[rgb(var(--ayan-muted))]">
                inc VAT
              </span>
            </p>
          </div>
          <Button href={`/services/${service.slug}`} variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}

/** Compact row variant for lists. */
export function ServiceRow({ service }: { service: ServiceWithCategory }) {
  const Icon = getIcon(service.category?.icon);
  return (
    <Link
      href={`/services/${service.slug}`}
      className="flex items-center gap-4 rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-4 transition-colors hover:border-brand-300 hover:shadow-soft"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--ayan-brand-soft))] text-brand-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[rgb(var(--ayan-text))]">
          {service.name}
        </p>
        <p className="truncate text-sm text-[rgb(var(--ayan-muted))]">
          {service.summary}
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-[rgb(var(--ayan-text))]">
          {formatMoney(service.priceFrom)}
        </p>
        <p className="text-xs text-[rgb(var(--ayan-muted))]">inc VAT</p>
      </div>
      <Icons.chevronRight className="h-5 w-5 text-[rgb(var(--ayan-muted))]" />
    </Link>
  );
}
