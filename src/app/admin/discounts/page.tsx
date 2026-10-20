import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DiscountsClient } from "./DiscountsClient";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  const codes = await prisma.discountCode.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <PageHeader
        title="Discount Codes"
        description="Create and manage the discount codes customers can enter during booking."
      />
      <DiscountsClient
        codes={codes.map((code) => ({
          id: code.id,
          code: code.code,
          description: code.description,
          type: code.type,
          value: code.value,
          minSubtotal: code.minSubtotal,
          maxUses: code.maxUses,
          usedCount: code.usedCount,
          active: code.active,
          startsAt: code.startsAt ? code.startsAt.toISOString() : null,
          endsAt: code.endsAt ? code.endsAt.toISOString() : null,
        }))}
      />
    </>
  );
}
