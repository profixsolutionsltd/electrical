import { getAdminCategories } from "@/server/admin";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ServiceFormClient } from "../ServiceFormClient";

export const dynamic = "force-dynamic";

export default async function AdminNewServicePage() {
  const categories = await getAdminCategories();

  return (
    <>
      <PageHeader
        title="Add New Inspection Service"
        description="Define a new property compliance service, pricing formula, duration, and marketing copy."
      />
      <ServiceFormClient categories={categories} />
    </>
  );
}

