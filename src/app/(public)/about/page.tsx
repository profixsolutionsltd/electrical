import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { Section, SectionHeading } from "@/components/ui/Section";
import { getSettings } from "@/server/settings";

export const metadata = {
  title: "About",
  description:
    "Learn about AYAN — the smart platform for managing property compliance certificates and services.",
};

export const dynamic = "force-dynamic";

const VALUES = [
  {
    icon: Icons.shield,
    title: "Trust & transparency",
    body: "Exact prices, verified engineers and clear policies. We never claim accreditation we haven't verified.",
  },
  {
    icon: Icons.zap,
    title: "Built for speed",
    body: "Next-day appointments and same-day digital documents, so compliance never slows you down.",
  },
  {
    icon: Icons.dashboard,
    title: "One smart platform",
    body: "Bookings, certificates, invoices and properties organised together in a single secure dashboard.",
  },
];

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <section className="border-b border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] py-16">
        <div className="ayan-container">
          <SectionHeading
            align="left"
            eyebrow="About AYAN"
            title="Everything managed. One smart platform."
            description="AYAN brings gas, electrical, EPC and fire safety services together in a single, transparent booking experience for landlords, agents and homeowners."
          />
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="ayan-h3 text-[rgb(var(--ayan-text))]">Our mission</h2>
            <p className="mt-4 leading-relaxed text-[rgb(var(--ayan-muted))]">
              Property compliance is fragmented and stressful. AYAN replaces
              scattered paperwork and phone calls with one clear platform where
              you can book services, track appointments, download certificates
              and manage invoices — all with exact, up-front pricing.
            </p>
            <p className="mt-4 leading-relaxed text-[rgb(var(--ayan-muted))]">
              We keep the platform configurable so the same technology can serve
              different industries. Business details, services and policies are
              managed by our team, not hard-coded.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Stat value="Next-day" label="Appointments often available" />
            <Stat value="Same-day" label="Digital documents" />
            <Stat value="Up-front" label="Exact pricing" />
            <Stat value="Verified" label="Engineer credentials" />
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="Our values"
          title="What we stand for"
          description="The principles that shape how AYAN is built and run."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgb(var(--ayan-brand-soft))] text-brand-600">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">{v.title}</h3>
              <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">{v.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            title="Let's get you compliant"
            description="Book your first service in minutes — no account needed, pay when the job is done."
          />
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/book" size="lg">
              Get started free
              <Icons.arrowRight className="h-4 w-4" />
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Contact us
            </Button>
          </div>
          <p className="mt-6 text-sm text-[rgb(var(--ayan-muted))]">
            Head office: {settings.companyAddress}
          </p>
        </div>
      </Section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-6">
      <p className="font-display text-2xl font-bold text-brand-600">{value}</p>
      <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">{label}</p>
    </div>
  );
}
