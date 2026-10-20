import { requireRole } from "@/server/guards";
import { EngineerNav } from "@/components/engineer/EngineerNav";
import { Alert } from "@/components/ui/Alert";
import { prisma } from "@/lib/prisma";
import { ENGINEER_STATUS, ROLES } from "@/lib/constants";

/** Engineer portal layout. Requires the ENGINEER role. */
export default async function EngineerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole([ROLES.ENGINEER]);

  const engineer = await prisma.engineerProfile.findUnique({
    where: { userId: session.sub },
    select: { status: true },
  });

  const pending = engineer?.status === ENGINEER_STATUS.PENDING;

  return (
    <div className="flex min-h-screen bg-[rgb(var(--ayan-surface))]">
      <EngineerNav userName={session.name} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          {pending && (
            <div className="mb-6">
              <Alert tone="warning" title="Account pending approval">
                Your engineer application is being reviewed. You&apos;ll be able
                to receive jobs once an administrator approves your account and
                verifies your credentials.
              </Alert>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
