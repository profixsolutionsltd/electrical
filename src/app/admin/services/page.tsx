import { getAdminServices, getAdminCategories } from "@/server/admin";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ServicesClient } from "./ServicesClient";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const [services, categories] = await Promise.all([
    getAdminServices(),
    getAdminCategories(),
  ]);

  const formattedServices = services.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    categoryId: s.categoryId,
    categoryName: s.category.name,
    priceFrom: s.priceFrom,
    durationMinutes: s.durationMinutes,
    published: s.published,
    featured: s.featured,
    bookingCount: s._count.bookingItems,
  }));

  const formattedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    order: c.order,
    serviceCount: c._count.services,
  }));

  return (
    <>
      <PageHeader
        title="Services & Catalogue"
        description="Configure safety inspection offerings, pricing tiers, duration estimates, and category taxonomy."
      />
      <ServicesClient
        services={formattedServices}
        categories={formattedCategories}
      />
    </>
  );
}

