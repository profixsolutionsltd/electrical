import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/server/settings";
import { getFeaturedServices } from "@/server/services";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { ServiceCard } from "@/components/services/ServiceCard";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Benefits } from "@/components/home/Benefits";
import { Testimonials } from "@/components/home/Testimonials";
import { CoverageChecker } from "@/components/home/CoverageChecker";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata = {
  title: "AYAN — Everything Managed. One Smart Platform.",
  description:
    "Book gas, electrical, EPC and fire safety services through one simple platform. Exact prices, vetted engineers, next-day appointments.",
};

/** Force dynamic so settings/content edits show immediately. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, services, faqs, testimonials, content] = await Promise.all([
    getSettings(),
    getFeaturedServices(8),
    prisma.faq.findMany({
      where: { active: true, category: "general" },
      orderBy: { order: "asc" },
      take: 6,
    }),
    prisma.testimonial.findMany({
      where: { active: true, featured: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.siteContent.findMany(),
  ]);

  const contentMap = Object.fromEntries(content.map((c) => [c.key, c.value]));
  const widgetServices = await prisma.service.findMany({
    where: { published: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Hero settings={settings} content={contentMap}>
        <BookingWidget services={widgetServices} />
      </Hero>

      <TrustStats settings={settings} content={contentMap} />

      <Section id="services">
        <SectionHeading
          eyebrow="Our services"
          title="One booking. Every certificate you need."
          description="Pick a single service or combine them — we handle it all together with exact prices shown before you book."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} featured={service.featured} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button href="/services" variant="outline" size="lg">
            View all services
            <Icons.arrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Section>

      <HowItWorks />
      <Benefits />

      <Section tone="surface">
        <Testimonials testimonials={testimonials} />
      </Section>

      <Section>
        <CoverageChecker areas={settings.serviceAreas} />
      </Section>

      <Section tone="surface" id="faqs">
        <SectionHeading
          eyebrow="FAQs"
          title="Frequently asked questions"
          description="Everything you need to know about booking with AYAN."
        />
        <div className="mx-auto mt-10 max-w-3xl">
          <FaqAccordion faqs={faqs} />
        </div>
      </Section>

      <FinalCta />
    </>
  );
}

/** Trust indicators & statistics, populated from configured data. */
function TrustStats({
  settings,
  content,
}: {
  settings: Awaited<ReturnType<typeof getSettings>>;
  content: Record<string, string>;
}) {
  const stats = [
    {
      value: content["home.stats.services"] ?? "—",
      label: "Services completed",
      icon: Icons.checkCircle,
    },
    {
      value: content["home.stats.rating"] ?? "—",
      label: "Average rating",
      icon: Icons.star,
    },
    {
      value: content["home.stats.cities"] ?? "London & surrounding",
      label: "Coverage",
      icon: Icons.mapPin,
    },
  ];

  return (
    <div className="border-b border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))]">
      <div className="ayan-container grid gap-6 py-8 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgb(var(--ayan-brand-soft))] text-brand-600">
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-[rgb(var(--ayan-text))]">
                {stat.value}
              </p>
              <p className="text-sm text-[rgb(var(--ayan-muted))]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
