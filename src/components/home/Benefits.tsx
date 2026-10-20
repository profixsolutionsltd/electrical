import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";

const BENEFITS = [
  {
    icon: Icons.receipt,
    title: "No payment until the job's done",
    description:
      "You don't pay a penny until the work is complete. Settle the invoice and your documents are released automatically.",
  },
  {
    icon: Icons.clock,
    title: "Same-day documents",
    description:
      "Book today and we'll be at your door tomorrow, with your certificate delivered digitally the day the job's done.",
  },
  {
    icon: Icons.tag,
    title: "Exact prices, shown before you book",
    description:
      "Transparent fixed pricing with tax calculated clearly. Combine services and we handle it all together.",
  },
  {
    icon: Icons.dashboard,
    title: "Everything in one dashboard",
    description:
      "Bookings, certificates, invoices and property records — all organised in one secure place.",
  },
];

/** "Why choose AYAN" benefits section. */
export function Benefits() {
  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Why AYAN"
            title="Built for landlords, agents and homeowners"
            description="We take the friction out of compliance so you can focus on what matters."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/book" size="lg">
              Start a booking
              <Icons.arrowRight className="h-4 w-4" />
            </Button>
            <Button href="/how-it-works" variant="outline" size="lg">
              Learn more
            </Button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-6 transition-shadow hover:shadow-card"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgb(var(--ayan-brand-soft))] text-brand-600">
                <benefit.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-[rgb(var(--ayan-text))]">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
