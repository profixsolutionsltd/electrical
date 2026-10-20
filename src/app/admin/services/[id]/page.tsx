import { notFound } from "next/navigation";
import { getAdminService, getAdminCategories } from "@/server/admin";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ServiceFormClient } from "../ServiceFormClient";

export const dynamic = "force-dynamic";

export default async function AdminEditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [service, categories] = await Promise.all([
    getAdminService(id),
    getAdminCategories(),
  ]);

  if (!service) notFound();

  return (
    <>
      <PageHeader
        title={`Edit Service: ${service.name}`}
        description="Update pricing, duration, detailed scope of work, and public presentation."
      />
      <ServiceFormClient initialData={service} categories={categories} />
    </>
  );
}

