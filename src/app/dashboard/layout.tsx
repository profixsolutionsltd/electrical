import { requireCustomer } from "@/server/guards";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

/** Customer dashboard layout. Protected by server-side role check. */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireCustomer();

  return (
    <div className="flex min-h-screen bg-[rgb(var(--ayan-surface))]">
      <DashboardNav userName={session.name} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
