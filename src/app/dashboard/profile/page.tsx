import { requireCustomer } from "@/server/guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProfileClient } from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireCustomer();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.sub },
    select: {
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      emailVerifiedAt: true,
    },
  });

  return (
    <>
      <PageHeader title="Profile" description="Manage your personal details." />
      <ProfileClient
        profile={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          emailVerified: Boolean(user.emailVerifiedAt),
        }}
      />
    </>
  );
}
