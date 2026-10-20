import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/server/guards";
import { getEngineerJob } from "@/server/engineer";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { BookingStatusBadge } from "@/components/ui/Badge";
import { Icons } from "@/components/ui/Icons";
import { EventLog } from "@/components/booking/StatusTimeline";
import { JobActions } from "./JobActions";
import { formatDateTime, formatMoney } from "@/lib/format";
import { ROLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function EngineerJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole([ROLES.ENGINEER]);
  const { id } = await params;
  const job = await getEngineerJob(session.sub, id);
  if (!job) notFound();

  return (
    <>
      <div className="mb-6">
        <Breadcrumbs items={[{ label: "Jobs", href: "/engineer/jobs" }, { label: job.reference }]} />
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-2xl font-bold text-[rgb(var(--ayan-text))]">{job.reference}</h1>
          <BookingStatusBadge status={job.status as never} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Job details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Info icon={Icons.calendar} label="Appointment" value={formatDateTime(job.scheduledAt)} />
              <Info icon={Icons.clock} label="Time window" value={job.timeWindow} />
              <Info icon={Icons.mapPin} label="Address" value={`${job.addressLine1}, ${job.city} ${job.postcode}`} />
              <Info icon={Icons.building} label="Services" value={job.items.map((i) => i.serviceName).join(", ")} />
            </div>
            {job.notes && (
              <div className="mt-4 rounded-lg bg-[rgb(var(--ayan-surface))] p-3 text-sm text-[rgb(var(--ayan-muted))]">
                <strong className="text-[rgb(var(--ayan-text))]">Customer instructions:</strong> {job.notes}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Customer contact</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Info icon={Icons.user} label="Name" value={job.customer.name} />
              <Info icon={Icons.phone} label="Phone" value={job.customer.phone ?? "—"} />
              <Info icon={Icons.mail} label="Email" value={job.customer.email} />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Activity</h2>
            <div className="mt-4"><EventLog events={job.timeline} /></div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Actions</h2>
            <JobActions bookingId={job.id} status={job.status as never} />
          </Card>

          {job.documents.length > 0 && (
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Uploaded reports</h2>
              <ul className="mt-4 space-y-2">
                {job.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-2 text-sm">
                    <Icons.fileText className="h-4 w-4 text-brand-600" />
                    <span className="flex-1 truncate">{doc.filename}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Job value</h2>
            <p className="mt-2 font-display text-2xl font-bold text-[rgb(var(--ayan-text))]">{formatMoney(job.total, job.currency)}</p>
          </Card>
        </div>
      </div>
    </>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-[rgb(var(--ayan-muted))]">{label}</p>
        <p className="text-sm font-medium text-[rgb(var(--ayan-text))]">{value}</p>
      </div>
    </div>
  );
}
