"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptAssignment, rejectAssignment, updateJobStatus, uploadJobReport } from "../../actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/providers/ToastProvider";
import { BOOKING_STATUS, type BookingStatus } from "@/lib/constants";
import { ALLOWED_TRANSITIONS } from "@/lib/booking";

/** Job actions: accept/reject, status updates, report upload. */
export function JobActions({ bookingId, status }: { bookingId: string; status: BookingStatus }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [reportName, setReportName] = useState("");
  const [reportUrl, setReportUrl] = useState("");

  const run = async (key: string, fn: () => Promise<{ ok: boolean; message: string }>) => {
    setLoading(key);
    const result = await fn();
    setLoading(null);
    if (result.ok) {
      toast.success("Done", result.message);
      router.refresh();
    } else {
      toast.error("Action failed", result.message);
    }
  };

  // Statuses this job can move to (engineer-relevant subset).
  const nextStatuses = (ALLOWED_TRANSITIONS[status] ?? []).filter(
    (s) => s === BOOKING_STATUS.IN_PROGRESS || s === BOOKING_STATUS.COMPLETED,
  );

  return (
    <div className="space-y-5">
      {/* Accept / reject for newly assigned jobs */}
      {status === BOOKING_STATUS.ASSIGNED && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950/40">
          <p className="font-semibold text-brand-800 dark:text-brand-200">New assignment</p>
          <p className="mt-1 text-sm text-brand-700 dark:text-brand-300">Accept to confirm you'll attend, or decline to return it to the pool.</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => run("accept", () => acceptAssignment(bookingId))} loading={loading === "accept"}>
              <Icons.check className="h-4 w-4" />
              Accept job
            </Button>
            <Button size="sm" variant="outline" onClick={() => run("reject", () => rejectAssignment(bookingId))} loading={loading === "reject"}>
              Decline
            </Button>
          </div>
        </div>
      )}

      {/* Status transitions */}
      {nextStatuses.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-[rgb(var(--ayan-text))]">Update status</p>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={s === BOOKING_STATUS.COMPLETED ? "primary" : "outline"}
                onClick={() => run(s, () => updateJobStatus(bookingId, s))}
                loading={loading === s}
              >
                {s === BOOKING_STATUS.IN_PROGRESS ? "Start job" : "Mark complete"}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Report upload */}
      {status === BOOKING_STATUS.COMPLETED && (
        <div className="rounded-xl border border-[rgb(var(--ayan-border))] p-4">
          <p className="mb-3 text-sm font-medium text-[rgb(var(--ayan-text))]">Upload report / certificate</p>
          <div className="space-y-3">
            <Input placeholder="File name (e.g. CP12-certificate.pdf)" value={reportName} onChange={(e) => setReportName(e.target.value)} />
            <Input placeholder="Document URL" value={reportUrl} onChange={(e) => setReportUrl(e.target.value)} hint="Provide a link to the stored document." />
            <Button
              size="sm"
              onClick={() => run("upload", () => uploadJobReport(bookingId, reportName, reportUrl))}
              loading={loading === "upload"}
              disabled={!reportName.trim() || !reportUrl.trim()}
            >
              <Icons.upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
      )}

      {status === BOOKING_STATUS.COMPLETED && (
        <p className="text-sm text-[rgb(var(--ayan-muted))]">This job is complete.</p>
      )}
    </div>
  );
}
