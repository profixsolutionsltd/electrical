import Link from "next/link";
import { getAdminOverviewStats } from "@/server/admin";
import { getPremiumState } from "@/server/premium";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { BookingStatusBadge, Badge } from "@/components/ui/Badge";
import { formatMoney, formatDateTime } from "@/lib/format";
import { PREMIUM_PLAN, STANDARD_PLAN, formatPlanPrice } from "@/lib/premium";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [stats, premium] = await Promise.all([
    getAdminOverviewStats(),
    getPremiumState(),
  ]);
  const premiumLive = premium.status === "LIVE";

  return (
    <>
      <PageHeader
        title="Admin Control Center"
        description="Live operational telemetry, booking queue, revenue metrics, and system audit trail."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/admin/bookings" variant="outline" size="sm">
              <Icons.calendar className="h-4 w-4" />
              Manage Bookings
            </Button>
            <Button href="/admin/users" size="sm">
              <Icons.user className="h-4 w-4" />
              Review Users
            </Button>
          </div>
        }
      />

      {stats.pendingEngineers > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icons.alert className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  {stats.pendingEngineers} Engineer Application{stats.pendingEngineers > 1 ? "s" : ""} Pending Review
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  New engineer candidates are waiting for credential verification before receiving jobs.
                </p>
              </div>
            </div>
            <Button href="/admin/users?role=ENGINEER&status=PENDING" size="sm" variant="outline">
              Review Now
            </Button>
          </div>
        </Card>
      )}

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatMoney(stats.totalRevenue)}
          icon={Icons.creditCard}
          tone="success"
          hint="Net settled payments"
        />
        <StatCard
          label="Pending Bookings"
          value={stats.pendingBookings}
          icon={Icons.clock}
          tone="warning"
          hint="Awaiting engineer assignment"
        />
        <StatCard
          label="Confirmed / In Progress"
          value={stats.confirmedBookings}
          icon={Icons.calendar}
          tone="brand"
        />
        <StatCard
          label="Completed Jobs"
          value={stats.completedBookings}
          icon={Icons.checkCircle}
          tone="success"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Registered Customers"
          value={stats.totalCustomers}
          icon={Icons.user}
        />
        <StatCard
          label="Total Engineers"
          value={stats.totalEngineers}
          icon={Icons.briefcase}
          hint={`${stats.pendingEngineers} pending review`}
        />
        <StatCard
          label="Cancelled Bookings"
          value={stats.cancelledBookings}
          icon={Icons.close}
          tone="neutral"
        />
        <StatCard
          label="System Status"
          value="Healthy"
          icon={Icons.shieldCheck}
          tone="success"
          hint="All services active"
        />
      </div>

      {/* Plans & Premium */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Icons.crown className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
                  Subscription tiers
                </h2>
                <p className="text-xs text-[rgb(var(--ayan-muted))]">
                  {premiumLive
                    ? "Premium is live and available to all customers."
                    : "Premium is not purchasable yet — interest is being collected through the waitlist."}
                </p>
              </div>
            </div>
            <Badge tone={premiumLive ? "success" : "warning"}>
              {premiumLive ? "Live" : "Coming soon"}
            </Badge>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              {
                name: STANDARD_PLAN.name,
                price: formatPlanPrice(STANDARD_PLAN.priceMonthly, STANDARD_PLAN.currency),
                status: "Available to everyone",
                live: true,
                points: STANDARD_PLAN.features.slice(0, 3),
              },
              {
                name: PREMIUM_PLAN.name,
                price: formatPlanPrice(PREMIUM_PLAN.priceMonthly, PREMIUM_PLAN.currency),
                status: premiumLive ? "Live now" : `Launching ${premium.launchWindow.toLowerCase()}`,
                live: premiumLive,
                points: PREMIUM_PLAN.features.slice(0, 3),
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className="rounded-xl border border-[rgb(var(--ayan-border))] p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-base font-semibold text-[rgb(var(--ayan-text))]">
                    {plan.name}
                  </p>
                  <Badge tone={plan.live ? "success" : "warning"}>
                    {plan.live ? "Live" : "Soon"}
                  </Badge>
                </div>
                <p className="mt-2 font-display text-xl font-bold text-[rgb(var(--ayan-text))]">
                  {plan.price}
                </p>
                <p className="text-xs text-[rgb(var(--ayan-muted))]">{plan.status}</p>
                <ul className="mt-3 space-y-1.5">
                  {plan.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-xs text-[rgb(var(--ayan-muted))]"
                    >
                      <Icons.check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[rgb(var(--ayan-border))] pt-5">
            <p className="text-sm text-[rgb(var(--ayan-muted))]">
              <span className="font-display text-lg font-bold text-[rgb(var(--ayan-text))]">
                {stats.premiumWaitlistCount}
              </span>{" "}
              {stats.premiumWaitlistCount === 1 ? "person" : "people"} waiting for
              launch
            </p>
            <Button href="/admin/premium" size="sm" variant="outline">
              Manage waitlist
              <Icons.arrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
            Sign-in methods
          </h2>
          <p className="mt-1 text-xs text-[rgb(var(--ayan-muted))]">
            Authentication activity across the platform.
          </p>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-[rgb(var(--ayan-muted))]">
                <Icons.user className="h-4 w-4" />
                Password accounts
              </dt>
              <dd className="font-semibold text-[rgb(var(--ayan-text))]">
                {stats.totalCustomers + stats.totalEngineers}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-[rgb(var(--ayan-muted))]">
                <Icons.google className="h-4 w-4" />
                Google linked
              </dt>
              <dd className="font-semibold text-[rgb(var(--ayan-text))]">
                {stats.googleLinkedAccounts}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-[rgb(var(--ayan-muted))]">
                <Icons.shieldCheck className="h-4 w-4" />
                Sessions
              </dt>
              <dd className="font-semibold text-[rgb(var(--ayan-text))]">
                HMAC-SHA256 JWT
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Two Column Layout: Recent Bookings & Audit Trail */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[rgb(var(--ayan-border))] p-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
                Recent Bookings
              </h2>
              <p className="text-xs text-[rgb(var(--ayan-muted))]">Incoming service reservations</p>
            </div>
            <Link
              href="/admin/bookings"
              className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              View all
            </Link>
          </div>

          {stats.recentBookings.length === 0 ? (
            <div className="p-8 text-center text-sm text-[rgb(var(--ayan-muted))]">
              No bookings recorded in the system.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[rgb(var(--ayan-surface))] text-xs font-semibold uppercase text-[rgb(var(--ayan-muted))]">
                  <tr>
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Service</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--ayan-border))]">
                  {stats.recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[rgb(var(--ayan-surface))]/50 transition-colors">
                      <td className="px-5 py-3 font-mono font-semibold text-[rgb(var(--ayan-text))]">
                        {b.reference}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-[rgb(var(--ayan-text))]">{b.customer.name}</p>
                        <p className="text-xs text-[rgb(var(--ayan-muted))]">{b.customer.email}</p>
                      </td>
                      <td className="px-5 py-3 text-[rgb(var(--ayan-text))]">
                        {b.items.map((i) => i.serviceName).join(", ") || "General Inspection"}
                      </td>
                      <td className="px-5 py-3 text-xs text-[rgb(var(--ayan-muted))]">
                        {formatDateTime(b.scheduledAt)}
                      </td>
                      <td className="px-5 py-3">
                        <BookingStatusBadge status={b.status as never} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="font-medium text-brand-600 hover:underline text-xs"
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Audit Log Feed */}
        <Card>
          <div className="flex items-center justify-between border-b border-[rgb(var(--ayan-border))] p-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
                Audit Trail
              </h2>
              <p className="text-xs text-[rgb(var(--ayan-muted))]">Privileged operations record</p>
            </div>
            <Link
              href="/admin/settings"
              className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              Full log
            </Link>
          </div>

          {stats.recentAuditLogs.length === 0 ? (
            <div className="p-8 text-center text-sm text-[rgb(var(--ayan-muted))]">
              No audit logs recorded.
            </div>
          ) : (
            <div className="divide-y divide-[rgb(var(--ayan-border))]">
              {stats.recentAuditLogs.map((log) => (
                <div key={log.id} className="p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[rgb(var(--ayan-text))]">
                      {log.action}
                    </span>
                    <span className="text-[rgb(var(--ayan-muted))]">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-[rgb(var(--ayan-muted))]">
                    Target: <span className="font-mono">{log.entity}</span> ({log.entityId?.slice(0, 8) ?? "system"})
                  </p>
                  {log.actor && (
                    <p className="mt-0.5 text-xs text-brand-600 dark:text-brand-400 font-medium">
                      By: {log.actor.name} ({log.actor.role})
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
