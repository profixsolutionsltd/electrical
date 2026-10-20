import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/Icons";
import { formatDateTime } from "@/lib/format";
import { STATUS_ORDER } from "@/lib/booking";
import { BOOKING_STATUS_LABELS, type BookingStatus } from "@/lib/constants";

/** Visual status timeline for a booking's happy path. */
export function StatusTimeline({ status }: { status: BookingStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
        <Icons.alert className="h-5 w-5 text-red-600" />
        <p className="text-sm font-medium text-red-800 dark:text-red-200">This booking was cancelled</p>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <ol className="flex items-center">
      {STATUS_ORDER.map((s, i) => {
        const done = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <li key={s} className={cn("flex items-center", i < STATUS_ORDER.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                  done ? "bg-brand-600 text-white" : "bg-[rgb(var(--ayan-border))] text-[rgb(var(--ayan-muted))]",
                  isCurrent && "ring-4 ring-brand-500/20",
                )}
              >
                {done ? <Icons.check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn("whitespace-nowrap text-xs font-medium", done ? "text-[rgb(var(--ayan-text))]" : "text-[rgb(var(--ayan-muted))]")}>
                {BOOKING_STATUS_LABELS[s]}
              </span>
            </div>
            {i < STATUS_ORDER.length - 1 && (
              <span className={cn("mx-2 mb-5 h-0.5 flex-1 rounded", i < currentIndex ? "bg-brand-600" : "bg-[rgb(var(--ayan-border))]")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Chronological event log from the booking timeline. */
export function EventLog({
  events,
}: {
  events: { id: string; type: string; message: string; createdAt: Date }[];
}) {
  return (
    <ol className="space-y-4">
      {events.map((e) => (
        <li key={e.id} className="flex gap-3">
          <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-brand-500" />
          <div>
            <p className="text-sm text-[rgb(var(--ayan-text))]">{e.message}</p>
            <p className="text-xs text-[rgb(var(--ayan-muted))]">{formatDateTime(e.createdAt)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
