import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { Section, SectionHeading } from "@/components/ui/Section";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { StepVisual } from "@/components/pages/StepVisual";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "How It Works",
  description:
    "Book gas, electrical, EPC and fire safety services in four simple steps with AYAN.",
};

export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: Icons.search,
    title: "Choose your services",
    body: "Select one certificate or combine several. Prices are shown exactly, including VAT, before you commit to anything.",
    detail: ["Transparent, fixed pricing", "Combine multiple services in one booking", "No hidden fees"],
  },
  {
    icon: Icons.mapPin,
    title: "Tell us where & when",
    body: "Enter your property address and pick from the available appointment slots. Next-day appointments are often available.",
    detail: ["Next-day availability", "Morning, afternoon & evening windows", "Save addresses for later"],
  },
  {
    icon: Icons.shieldCheck,
    title: "A vetted engineer attends",
    body: "We assign a verified engineer whose credentials have been reviewed and approved by our administrators before they can receive jobs.",
    detail: ["Admin-verified credentials", "Job status updates in real time", "Direct support if you need it"],
  },
  {
    icon: Icons.fileText,
    title: "Documents delivered",
    body: "Certificates and reports land in your dashboard, alongside invoices and your full booking history — all in one place.",
    detail: ["Digital certificates", "Downloadable invoices", "Secure document access"],
  },
];

export default async function HowItWorksPage() {
  const faqs = await prisma.faq.findMany({
    where: { active: true, category: "booking" },
    orderBy: { order: "asc" },
  });

  return (
    <>
      <section className="border-b border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] py-16">
        <div className="ayan-container text-center">
          <SectionHeading
            eyebrow="How it works"
            title="From booking to certificate in four steps"
            description="A simple, transparent process designed to take the stress out of compliance."
          />
        </div>
      </section>

      <Section>
        <div className="space-y-16">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className={`grid items-center gap-10 lg:grid-cols-2 ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-glow">
                  <step.icon className="h-6 w-6" />
                </span>
                <h2 className="ayan-h3 mt-5 text-[rgb(var(--ayan-text))]">
                  <span className="text-brand-600">Step {index + 1}. </span>
                  {step.title}
                </h2>
                <p className="ayan-lead mt-3">{step.body}</p>
                <ul className="mt-5 space-y-2">
                  {step.detail.map((d) => (
                    <li key={d} className="flex items-center gap-2.5 text-sm text-[rgb(var(--ayan-text))]">
                      <Icons.checkCircle className="h-4 w-4 text-emerald-500" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <StepVisual index={index} />
            </div>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            title="Ready to get started?"
            description="Book your first service in minutes — no account needed, pay when the job is done."
          />
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/book" size="lg">
              Get started free
              <Icons.arrowRight className="h-4 w-4" />
            </Button>
            <Button href="/services" variant="outline" size="lg">
              Browse services
            </Button>
          </div>
        </div>
      </Section>

      {faqs.length > 0 && (
        <Section id="booking-faqs">
          <SectionHeading title="Booking questions" description="Common questions about the booking process." />
          <div className="mx-auto mt-10 max-w-3xl">
            <FaqAccordion faqs={faqs} />
          </div>
        </Section>
      )}
    </>
  );
}
