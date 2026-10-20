import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icons, getIcon } from "@/components/ui/Icons";
import { formatMoney, formatDuration } from "@/lib/format";
import type { ExplorerService } from "./types";

/** Service card used within the services explorer grid. */
export function ExplorerCard({ service }: { service: ExplorerService }) {
  const Icon = getIcon(service.categoryIcon);
  return (
    <Card className="group flex h-full flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-start justify-between p-6 pb-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--ayan-brand-soft))] text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
          <Icon className="h-6 w-6" />
        </div>
        {service.featured && <Badge tone="brand">Popular</Badge>}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--ayan-muted))]">
          {service.categoryName}
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
            Available
          </span>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-[rgb(var(--ayan-border))] pt-4">
          <p className="font-display text-xl font-bold text-[rgb(var(--ayan-text))]">
            {formatMoney(service.priceFrom)}
            <span className="ml-1 text-xs font-medium text-[rgb(var(--ayan-muted))]">inc VAT</span>
          </p>
          <Button href={`/services/${service.slug}`} variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
