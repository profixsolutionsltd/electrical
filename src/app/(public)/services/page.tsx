import { listCategories, listServices } from "@/server/services";
import { ServicesExplorer } from "@/components/services/ServicesExplorer";
import { SectionHeading } from "@/components/ui/Section";

export const metadata = {
  title: "Services",
  description:
    "Browse gas safety, electrical, EPC, boiler, PAT and fire safety services. Exact prices and next-day availability.",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [categories, allServices] = await Promise.all([
    listCategories(),
    listServices(),
  ]);

  return (
    <>
      <section className="border-b border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] py-14">
        <div className="ayan-container">
          <SectionHeading
            align="left"
            eyebrow="Services"
            title="Certificates & services, all in one place"
            description="Exact prices shown before you book. Pick a single service or combine them — we handle it all together."
          />
        </div>
      </section>

      <section className="py-14">
        <div className="ayan-container">
          <ServicesExplorer
            categories={categories.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              icon: c.icon,
              count: c._count.services,
            }))}
            services={allServices.map((s) => ({
              id: s.id,
              name: s.name,
              slug: s.slug,
              summary: s.summary,
              priceFrom: s.priceFrom,
              durationMinutes: s.durationMinutes,
              featured: s.featured,
              categoryId: s.categoryId,
              categoryName: s.category.name,
              categoryIcon: s.category.icon,
            }))}
          />
        </div>
      </section>
    </>
  );
}

