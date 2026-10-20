import { prisma } from "@/lib/prisma";
import { getSettings } from "@/server/settings";
import { SectionHeading } from "@/components/ui/Section";
import { CoverageChecker } from "@/components/home/CoverageChecker";
import { Icons } from "@/components/ui/Icons";

export const metadata = {
  title: "Coverage",
  description: "Check whether AYAN currently operates in your area.",
};

export const dynamic = "force-dynamic";

export default async function CoveragePage() {
  const [settings, areas] = await Promise.all([
    getSettings(),
    prisma.serviceArea.findMany({
      where: { active: true },
      orderBy: { postcodePrefix: "asc" },
    }),
  ]);

  const prefixes = areas.length > 0 ? areas.map((a) => a.postcodePrefix) : settings.serviceAreas;

  return (
    <>
      <section className="border-b border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] py-16">
        <div className="ayan-container text-center">
          <SectionHeading
            eyebrow="Coverage"
            title="Where we operate"
            description="Enter your postcode below to check whether AYAN currently serves your area."
          />
        </div>
      </section>

      <section className="py-16">
        <div className="ayan-container">
          <CoverageChecker areas={prefixes} />

          {areas.length > 0 && (
            <div className="mx-auto mt-16 max-w-4xl">
              <h2 className="text-center font-display text-xl font-semibold text-[rgb(var(--ayan-text))]">
                Areas we cover
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {areas.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-4"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--ayan-brand-soft))] text-brand-600">
                      <Icons.mapPin className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-[rgb(var(--ayan-text))]">{a.label}</p>
                      <p className="text-xs text-[rgb(var(--ayan-muted))]">{a.postcodePrefix}…</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
