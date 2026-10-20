import Link from "next/link";
import { requireCustomer } from "@/server/guards";
import { getCustomerOverview } from "@/server/customer";
import { getPremiumState } from "@/server/premium";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { BookingStatusBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { formatDateTime, formatMoney } from "@/lib/format";
import { PREMIUM_PLAN, formatPlanPrice } from "@/lib/premium";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const session = await requireCustomer();
  const [data, premium] = await Promise.all([
    getCustomerOverview(session.sub),
    getPremiumState(),
  ]);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${session.name.split(" ")[0]}`}
        description="Here is an overview of your bookings and account."
        actions={
          <Button href="/dashboard/bookings/new">
            <Icons.plus className="h-4 w-4" />
            New booking
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming appointments" value={data.upcoming} icon={Icons.calendar} tone="brand" />
        <StatCard label="Active bookings" value={data.active} icon={Icons.briefcase} tone="warning" />
        <StatCard label="Completed jobs" value={data.completed} icon={Icons.checkCircle} tone="success" />
        <StatCard label="Pending actions" value={data.pendingPayments} icon={Icons.receipt} tone="danger" hint="Awaiting payment" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))]">
            <div className="flex items-center justify-between border-b border-[rgb(var(--ayan-border))] p-5">
              <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Recent bookings</h2>
              <Link href="/dashboard/bookings" className="text-sm font-medium text-brand-600 hover:underline">View all</Link>
            </div>
            {data.recent.length === 0 ? (
              <EmptyRecent />
            ) : (
              <ul className="divide-y divide-[rgb(var(--ayan-border))]">
                {data.recent.map((b) => (
                  <li key={b.id}>
                    <Link href={`/dashboard/bookings/${b.id}`} className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-[rgb(var(--ayan-surface))]">
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-semibold text-[rgb(var(--ayan-text))]">{b.reference}</p>
                        <p className="truncate text-sm text-[rgb(var(--ayan-muted))]">{b.items.map((i) => i.serviceName).join(", ")}</p>
                        <p className="mt-0.5 text-xs text-[rgb(var(--ayan-muted))]">{formatDateTime(b.scheduledAt)}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <BookingStatusBadge status={b.status as never} />
                        <span className="text-sm font-semibold text-[rgb(var(--ayan-text))]">{formatMoney(b.total, b.currency)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <NextAppointment booking={data.nextBooking} />
          <PremiumTeaser
            live={premium.status === "LIVE"}
            launchWindow={premium.launchWindow}
          />
          <QuickActions />
          <SummaryCard completed={data.completed} cancelled={data.cancelled} />
        </div>
      </div>
    </>
  );
}

/** The customer's next scheduled appointment, if there is one. */
function NextAppointment({
  booking,
}: {
  booking: {
    id: string;
    reference: string;
    status: string;
    scheduledAt: Date;
    city: string;
    postcode: string;
    items: { serviceName: string }[];
    assignedEngineer: { user: { name: string } } | null;
  } | null;
}) {
  if (!booking) {
    return (
      <div className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-5">
        <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
          Next appointment
        </h2>
        <p className="mt-2 text-sm text-[rgb(var(--ayan-muted))]">
          Nothing scheduled. Book an inspection and it will show up here.
        </p>
        <Button href="/dashboard/bookings/new" size="sm" className="mt-4">
          Book now
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
          Next appointment
        </h2>
        <BookingStatusBadge status={booking.status as never} />
      </div>
      <p className="mt-3 text-sm font-semibold text-[rgb(var(--ayan-text))]">
        {booking.items.map((i) => i.serviceName).join(", ") || "Service visit"}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-[rgb(var(--ayan-muted))]">
        <Icons.calendar className="h-4 w-4" />
        {formatDateTime(booking.scheduledAt)}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-[rgb(var(--ayan-muted))]">
        <Icons.mapPin className="h-4 w-4" />
        {booking.city} {booking.postcode}
      </p>
      {booking.assignedEngineer && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-[rgb(var(--ayan-muted))]">
          <Icons.user className="h-4 w-4" />
          {booking.assignedEngineer.user.name}
        </p>
      )}
      <Link
        href={`/dashboard/bookings/${booking.id}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
      >
        View booking
        <Icons.chevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/** Coming-soon teaser for the Premium tier. */
function PremiumTeaser({
  live,
  launchWindow,
}: {
  live: boolean;
  launchWindow: string;
}) {
  return (
    <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5 dark:border-brand-900 dark:from-brand-950/40">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Icons.crown className="h-4 w-4" />
        </span>
        <Badge tone={live ? "success" : "warning"}>
          {live ? "Available now" : "Coming soon"}
        </Badge>
      </div>
      <h2 className="mt-3 font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
        AYAN Premium
      </h2>
      <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">
        {live
          ? "Priority slots, portfolio reporting and a named account manager."
          : `Priority slots, portfolio reporting and a named account manager — ${launchWindow.toLowerCase()}.`}
      </p>
      <p className="mt-3 font-display text-xl font-bold text-[rgb(var(--ayan-text))]">
        {formatPlanPrice(PREMIUM_PLAN.priceMonthly, PREMIUM_PLAN.currency)}
      </p>
      <Link
        href="/dashboard/premium"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
      >
        {live ? "Manage your plan" : "See what's coming"}
        <Icons.arrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function EmptyRecent() {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]">
        <Icons.calendar className="h-6 w-6" />
      </div>
      <p className="mt-3 font-medium text-[rgb(var(--ayan-text))]">No bookings yet</p>
      <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">Book your first service to get started.</p>
      <Button href="/dashboard/bookings/new" size="sm" className="mt-4">Create a booking</Button>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { href: "/dashboard/bookings/new", label: "Book a service", icon: Icons.plus },
    { href: "/dashboard/properties", label: "Add a property", icon: Icons.building },
    { href: "/dashboard/documents", label: "View documents", icon: Icons.fileText },
    { href: "/dashboard/support", label: "Get support", icon: Icons.message },
  ];
  return (
    <div className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-5">
      <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Quick actions</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <Link key={a.href} href={a.href} className="flex flex-col items-center gap-2 rounded-xl border border-[rgb(var(--ayan-border))] p-4 text-center transition-colors hover:border-brand-300 hover:bg-[rgb(var(--ayan-surface))]">
            <a.icon className="h-5 w-5 text-brand-600" />
            <span className="text-xs font-medium text-[rgb(var(--ayan-text))]">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ completed, cancelled }: { completed: number; cancelled: number }) {
  return (
    <div className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-5">
      <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Summary</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-[rgb(var(--ayan-muted))]">Completed jobs</dt>
          <dd className="font-semibold text-[rgb(var(--ayan-text))]">{completed}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[rgb(var(--ayan-muted))]">Cancelled</dt>
          <dd className="font-semibold text-[rgb(var(--ayan-text))]">{cancelled}</dd>
        </div>
      </dl>
    </div>
  );
}
