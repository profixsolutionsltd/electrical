import { cn } from "@/lib/utils";
import {
  BOOKING_STATUS,
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  ENGINEER_STATUS,
  ENGINEER_STATUS_LABELS,
  TICKET_STATUS,
  TICKET_STATUS_LABELS,
  type BookingStatus,
  type PaymentStatus,
  type EngineerStatus,
  type TicketStatus,
} from "@/lib/constants";

type BadgeTone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info";

const tones: Record<BadgeTone, string> = {
  neutral:
    "bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))] border-[rgb(var(--ayan-border))]",
  brand:
    "bg-[rgb(var(--ayan-brand-soft))] text-brand-700 border-brand-200 dark:text-brand-200 dark:border-brand-800",
  success:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  warning:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  danger:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  info: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

const bookingTone: Record<BookingStatus, BadgeTone> = {
  PENDING: "warning",
  CONFIRMED: "info",
  ASSIGNED: "brand",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge tone={bookingTone[status] ?? "neutral"}>
      <StatusDot tone={bookingTone[status]} />
      {BOOKING_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

const paymentTone: Record<PaymentStatus, BadgeTone> = {
  UNPAID: "warning",
  PENDING: "warning",
  PAID: "success",
  REFUNDED: "neutral",
  FAILED: "danger",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge tone={paymentTone[status] ?? "neutral"}>
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

const engineerTone: Record<EngineerStatus, BadgeTone> = {
  PENDING: "warning",
  APPROVED: "success",
  SUSPENDED: "danger",
};

export function EngineerStatusBadge({ status }: { status: EngineerStatus }) {
  return (
    <Badge tone={engineerTone[status] ?? "neutral"}>
      {ENGINEER_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

const ticketTone: Record<TicketStatus, BadgeTone> = {
  OPEN: "info",
  PENDING: "warning",
  RESOLVED: "success",
  CLOSED: "neutral",
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge tone={ticketTone[status] ?? "neutral"}>
      {TICKET_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

function StatusDot({ tone }: { tone: BadgeTone }) {
  const color =
    tone === "success"
      ? "bg-emerald-500"
      : tone === "danger"
        ? "bg-red-500"
        : tone === "warning"
          ? "bg-amber-500"
          : tone === "brand" || tone === "info"
            ? "bg-brand-500"
            : "bg-slate-400";
  return <span className={cn("h-1.5 w-1.5 rounded-full", color)} />;
}

export { BOOKING_STATUS, PAYMENT_STATUS };
