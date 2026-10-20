import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceBySlug, getRelatedServices } from "@/server/services";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icons, getIcon } from "@/components/ui/Icons";
import { ServiceRow } from "@/components/services/ServiceCard";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { formatMoney, formatDuration } from "@/lib/format";
import { safeJsonParse } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.metaTitle ?? service.name,
    description: service.metaDescription ?? service.summary,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const related = await getRelatedServices(service.id, service.categoryId, 3);
  const features = safeJsonParse<string[]>(service.features, []);
  const Icon = getIcon(service.category?.icon);

  return (
    <>
      <div className="border-b border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] py-8">
        <div className="ayan-container">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services" },
              { label: service.name },
            ]}
          />
        </div>
      </div>

      <div className="ayan-container py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(var(--ayan-brand-soft))] text-brand-600">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <Link
                  href={`/services?category=${service.category?.slug}`}
                  className="text-xs font-semibold uppercase tracking-wider text-brand-600 hover:underline"
                >
                  {service.category?.name}
                </Link>
                <h1 className="ayan-h2 text-[rgb(var(--ayan-text))]">{service.name}</h1>
              </div>
            </div>

            <p className="ayan-lead mt-6">{service.summary}</p>
            <p className="mt-6 leading-relaxed text-[rgb(var(--ayan-text))]">
              {service.description}
            </p>

            {features.length > 0 && (
              <div className="mt-8">
                <h2 className="ayan-h3 text-[rgb(var(--ayan-text))]">What&apos;s included</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-[rgb(var(--ayan-text))]">
                      <Icons.checkCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {service.faqs.length > 0 && (
              <div className="mt-12">
                <h2 className="ayan-h3 text-[rgb(var(--ayan-text))]">Frequently asked questions</h2>
                <div className="mt-5">
                  <FaqAccordion faqs={service.faqs} />
                </div>
              </div>
            )}
          </div>

          <ServiceSidebar service={service} />

        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="ayan-h3 text-[rgb(var(--ayan-text))]">Related services</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <ServiceRow key={r.id} service={{ ...r, category: r.category }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ServiceSidebar({
  service,
}: {
  service: NonNullable<Awaited<ReturnType<typeof getServiceBySlug>>>;
}) {
  return (
    <aside className="lg:col-span-1">
      <Card className="sticky top-24 p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-sm text-[rgb(var(--ayan-muted))]">From</span>
            <p className="font-display text-3xl font-bold text-[rgb(var(--ayan-text))]">
              {formatMoney(service.priceFrom)}
            </p>
            <span className="text-xs text-[rgb(var(--ayan-muted))]">inc VAT</span>
          </div>
          {service.featured && <Badge tone="brand">Popular</Badge>}
        </div>

        <dl className="mt-6 space-y-3 border-t border-[rgb(var(--ayan-border))] pt-6 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-[rgb(var(--ayan-muted))]">Duration</dt>
            <dd className="font-medium text-[rgb(var(--ayan-text))]">
              {formatDuration(service.durationMinutes)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[rgb(var(--ayan-muted))]">Availability</dt>
            <dd className="font-medium text-emerald-600">Next-day</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[rgb(var(--ayan-muted))]">Payment</dt>
            <dd className="font-medium text-[rgb(var(--ayan-text))]">Pay on completion</dd>
          </div>
        </dl>

        <Button href={`/book?service=${service.id}`} size="lg" fullWidth className="mt-6">
          Book now
          <Icons.arrowRight className="h-4 w-4" />
        </Button>
        <p className="mt-3 text-center text-xs text-[rgb(var(--ayan-muted))]">
          No payment until the job is done.
        </p>
      </Card>
    </aside>
  );
}
