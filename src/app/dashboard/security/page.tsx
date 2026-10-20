import { requireCustomer } from "@/server/guards";
import { prisma } from "@/lib/prisma";
import { getSession, SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SecurityClient } from "./SecurityClient";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const session = await requireCustomer();
  const store = await cookies();
  const currentToken = store.get(SESSION_COOKIE)?.value;

  const sessions = await prisma.session.findMany({
    where: { userId: session.sub, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true, token: true, createdAt: true, expiresAt: true, rememberMe: true },
  });

  return (
    <>
      <PageHeader title="Security" description="Manage your password and active sessions." />
      <SecurityClient
        sessions={sessions.map((s) => ({
          id: s.id,
          createdAt: s.createdAt.toISOString(),
          expiresAt: s.expiresAt.toISOString(),
          rememberMe: s.rememberMe,
          current: s.token === currentToken,
        }))}
      />
    </>
  );
}
