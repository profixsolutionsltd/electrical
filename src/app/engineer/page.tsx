import { requireRole } from "@/server/guards";
import { getEngineerStats, getEngineerJobs, getEngineerProfile } from "@/server/engineer";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { BookingStatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { formatMoney, formatDateTime } from "@/lib/format";
import { ENGINEER_STATUS, ROLES } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EngineerOverviewPage() {
  const session = await requireRole([ROLES.ENGINEER]);
  const [stats, jobs, profile] = await Promise.all([
    getEngineerStats(session.sub),
    getEngineerJobs(session.sub),
    getEngineerProfile(session.sub),
  ]);

  const upcoming = jobs
    .filter((j) => ["ASSIGNED", "CONFIRMED", "IN_PROGRESS"].includes(j.status))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Hi, ${session.name.split(" ")[0]}`}
        description="Here's a summary of your assigned jobs."
        actions={
          <Button href="/engineer/jobs">
            <Icons.briefcase className="h-4 w-4" />
            View all jobs
          </Button>
        }
      />

      {profile?.status === ENGINEER_STATUS.PENDING && (
        <Card className="mb-6 border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/40">
          <div className="flex items-start gap-3">
            <Icons.alert className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-200">Awaiting approval</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                Complete your profile and qualifications. An admin will review
                your application before you can receive jobs.
              </p>
              <Button href="/engineer/profile" size="sm" className="mt-3">Complete profile</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Awaiting acceptance" value={stats.assigned} icon={Icons.clock} tone="warning" />
        <StatCard label="In progress" value={stats.inProgress} icon={Icons.briefcase} tone="brand" />
        <StatCard label="Completed jobs" value={stats.completed} icon={Icons.checkCircle} tone="success" />
        <StatCard label="Total earned" value={formatMoney(stats.earnings)} icon={Icons.trendingUp} tone="success" hint="From completed jobs" />
      </div>

      <Card className="mt-8">
        <div className="flex items-center justify-between border-b border-[rgb(var(--ayan-border))] p-5">
          <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Upcoming jobs</h2>
          <Link href="/engineer/jobs" className="text-sm font-medium text-brand-600 hover:underline">View all</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]">
              <Icons.briefcase className="h-6 w-6" />
            </div>
            <p className="mt-3 font-medium text-[rgb(var(--ayan-text))]">No upcoming jobs</p>
            <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">New assignments will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[rgb(var(--ayan-border))]">
            {upcoming.map((job) => (
              <li key={job.id}>
                <Link href={`/engineer/jobs/${job.id}`} className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-[rgb(var(--ayan-surface))]">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-[rgb(var(--ayan-text))]">{job.reference}</p>
                    <p className="truncate text-sm text-[rgb(var(--ayan-muted))]">{job.items.map((i) => i.serviceName).join(", ")}</p>
                    <p className="mt-0.5 text-xs text-[rgb(var(--ayan-muted))]">{formatDateTime(job.scheduledAt)} · {job.postcode}</p>
                  </div>
                  <BookingStatusBadge status={job.status as never} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
