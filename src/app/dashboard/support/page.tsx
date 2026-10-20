import { requireCustomer } from "@/server/guards";
import { prisma } from "@/lib/prisma";
import { SupportClient } from "./SupportClient";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const session = await requireCustomer();
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.sub },
    orderBy: { updatedAt: "desc" },
    include: {
      booking: { select: { reference: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  return (
    <SupportClient
      tickets={tickets.map((t) => ({
        id: t.id,
        reference: t.reference,
        subject: t.subject,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
        booking: t.booking,
        messages: t.messages.map((m) => ({
          id: m.id,
          body: m.body,
          authorRole: m.authorRole,
          createdAt: m.createdAt.toISOString(),
        })),
      }))}
    />
  );
}
