import { prisma } from "@/lib/prisma";
import { Section, SectionHeading } from "@/components/ui/Section";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "FAQs",
  description: "Answers to common questions about booking with AYAN.",
};

export const dynamic = "force-dynamic";

export default async function FaqsPage() {
  const faqs = await prisma.faq.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  const groups = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
    (acc[faq.category] ??= []).push(faq);
    return acc;
  }, {});

  const categoryTitles: Record<string, string> = {
    general: "General",
    booking: "Booking & appointments",
    payment: "Payment & invoicing",
    certificates: "Certificates & documents",
  };

  return (
    <>
      <section className="border-b border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] py-16">
        <div className="ayan-container text-center">
          <SectionHeading
            eyebrow="FAQs"
            title="Frequently asked questions"
            description="Everything you need to know about booking with AYAN."
          />
        </div>
      </section>

      <Section>
        {Object.keys(groups).length === 0 ? (
          <p className="text-center text-[rgb(var(--ayan-muted))]">
            No FAQs have been published yet.
          </p>
        ) : (
          <div className="mx-auto max-w-3xl space-y-12">
            {Object.entries(groups).map(([category, items]) => (
              <div key={category}>
                <h2 className="ayan-h3 text-[rgb(var(--ayan-text))]">
                  {categoryTitles[category] ?? category}
                </h2>
                <div className="mt-5">
                  <FaqAccordion faqs={items} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] p-8 text-center">
          <h2 className="ayan-h3 text-[rgb(var(--ayan-text))]">Still have questions?</h2>
          <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">
            Our support team is happy to help with anything else.
          </p>
          <Button href="/contact" className="mt-5">
            Contact support
          </Button>
        </div>
      </Section>
    </>
  );
}
