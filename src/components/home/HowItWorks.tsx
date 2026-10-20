import { Section, SectionHeading } from "@/components/ui/Section";
import { Icons } from "@/components/ui/Icons";

const STEPS = [
  {
    icon: Icons.search,
    title: "Choose your services",
    description:
      "Select one or combine several certificates and services. Exact prices are shown up front — no surprises.",
  },
  {
    icon: Icons.calendar,
    title: "Pick a time that suits you",
    description:
      "Enter your address and choose from available next-day appointments across our coverage area.",
  },
  {
    icon: Icons.shieldCheck,
    title: "A vetted engineer attends",
    description:
      "We assign a verified engineer whose credentials have been reviewed and approved by our team.",
  },
  {
    icon: Icons.fileText,
    title: "Get your documents",
    description:
      "Certificates and reports are delivered to your dashboard, with invoices and history in one place.",
  },
];

/** "How it works" — four clear steps. */
export function HowItWorks() {
  return (
    <Section tone="surface">
      <SectionHeading
        eyebrow="How it works"
        title="Simple, smooth and stress-free"
        description="From booking to certificate in four straightforward steps."
      />
      <ol className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="relative">
            <div className="flex flex-col items-start">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-glow">
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(var(--ayan-card))] text-xs font-bold text-brand-600 ring-2 ring-brand-600">
                  {index + 1}
                </span>
              </div>
              <h3 className="ayan-h3 mt-5 text-[rgb(var(--ayan-text))]">{step.title}</h3>
              <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
