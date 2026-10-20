import { requireRole } from "@/server/guards";
import { getEngineerJobs } from "@/server/engineer";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { BookingStatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Icons } from "@/components/ui/Icons";
import { formatMoney, formatDateTime } from "@/lib/format";
import { ROLES } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EngineerJobsPage() {
  const session = await requireRole([ROLES.ENGINEER]);
  const jobs = await getEngineerJobs(session.sub);

  return (
    <>
      <PageHeader title="Assigned Jobs" description="Jobs assigned to you, newest appointments first." />

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--ayan-border))] py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]">
            <Icons.briefcase className="h-7 w-7" />
          </div>
          <h2 className="ayan-h3 mt-4 text-[rgb(var(--ayan-text))]">No jobs assigned yet</h2>
          <p className="mt-2 max-w-sm text-sm text-[rgb(var(--ayan-muted))]">
            Once an admin approves your account and assigns you jobs, they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/engineer/jobs/${job.id}`}
              className="block rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-5 transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-sm font-bold text-[rgb(var(--ayan-text))]">{job.reference}</p>
                    <BookingStatusBadge status={job.status as never} />
                  </div>
                  <p className="mt-1.5 text-sm text-[rgb(var(--ayan-muted))]">{job.items.map((i) => i.serviceName).join(", ")}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[rgb(var(--ayan-muted))]">
                    <span className="inline-flex items-center gap-1.5"><Icons.calendar className="h-3.5 w-3.5" />{formatDateTime(job.scheduledAt)}</span>
                    <span className="inline-flex items-center gap-1.5"><Icons.mapPin className="h-3.5 w-3.5" />{job.postcode}</span>
                    <span className="inline-flex items-center gap-1.5"><Icons.user className="h-3.5 w-3.5" />{job.customer.name}</span>
                  </div>
                </div>
                <p className="font-display text-lg font-bold text-[rgb(var(--ayan-text))]">{formatMoney(job.total, job.currency)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
