import { prisma } from "@/lib/prisma";

/**
 * Server-side data access for the service catalogue. Public pages read through
 * these functions so business data always comes from the database rather than
 * being hard-coded in components.
 */

export interface ServiceListFilters {
  categorySlug?: string;
  search?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "name";
  featuredOnly?: boolean;
}

export async function listCategories(activeOnly = true) {
  return prisma.serviceCategory.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { services: { where: { published: true } } } },
    },
  });
}

export async function listServices(filters: ServiceListFilters = {}) {
  const where: Record<string, unknown> = { published: true };
  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }
  if (filters.featuredOnly) {
    where.featured = true;
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { summary: { contains: filters.search } },
      { description: { contains: filters.search } },
    ];
  }

  const orderBy =
    filters.sort === "price-asc"
      ? [{ priceFrom: "asc" as const }]
      : filters.sort === "price-desc"
        ? [{ priceFrom: "desc" as const }]
        : filters.sort === "name"
          ? [{ name: "asc" as const }]
          : [{ featured: "desc" as const }, { createdAt: "desc" as const }];

  return prisma.service.findMany({
    where,
    orderBy,
    include: { category: true },
  });
}

export async function getServiceBySlug(slug: string) {
  return prisma.service.findUnique({
    where: { slug },
    include: {
      category: true,
      faqs: { orderBy: { order: "asc" } },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.serviceCategory.findUnique({ where: { slug } });
}

export async function getFeaturedServices(limit = 6) {
  return prisma.service.findMany({
    where: { published: true, featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { category: true },
  });
}

/** Related services: same category, excluding the current service. */
export async function getRelatedServices(serviceId: string, categoryId: string, limit = 3) {
  return prisma.service.findMany({
    where: {
      published: true,
      categoryId,
      id: { not: serviceId },
    },
    take: limit,
    include: { category: true },
  });
}

export async function getServiceIdsAndNames() {
  return prisma.service.findMany({
    where: { published: true },
    select: { id: true, name: true, priceFrom: true, vatApplicable: true, durationMinutes: true },
    orderBy: { name: "asc" },
  });
}
