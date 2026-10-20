import { getPremiumState, getPremiumWaitlistEntries } from "@/server/premium";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icons } from "@/components/ui/Icons";
import { formatDateTime } from "@/lib/format";
import { toCsv, csvDataUrl } from "@/lib/utils";
import { PREMIUM_PLAN, formatPlanPrice } from "@/lib/premium";

export const dynamic = "force-dynamic";

export default async function AdminPremiumPage() {
  const [state, entries] = await Promise.all([
    getPremiumState(),
    getPremiumWaitlistEntries(),
  ]);

  const live = state.status === "LIVE";

  const csv = toCsv(
    ["Email", "Name", "Source", "Signed up"],
    entries.map((entry) => [
      entry.email,
      entry.name ?? "",
      entry.source,
      entry.createdAt.toISOString(),
    ]),
  );

  return (
    <>
      <PageHeader
        title="Premium Tier"
        description="Manage the Premium launch: status, pricing visibility and the customer waitlist."
        actions={
          <div className="flex flex-wrap gap-2">
            <Badge tone={live ? "success" : "warning"}>
              {live ? "Live" : "Coming soon"}
            </Badge>
            {entries.length > 0 && (
              <a
                href={csvDataUrl(csv)}
                download="ayan-premium-waitlist.csv"
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] px-3 text-sm font-semibold text-[rgb(var(--ayan-text))] transition-colors hover:border-brand-400 hover:text-brand-700"
              >
                <Icons.download className="h-4 w-4" />
                Export CSV
              </a>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[rgb(var(--ayan-border))] pb-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Icons.crown className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
                  {PREMIUM_PLAN.name}
                </h2>
                <p className="text-xs text-[rgb(var(--ayan-muted))]">
                  {PREMIUM_PLAN.tagline}
                </p>
              </div>
            </div>
            <p className="font-display text-lg font-bold text-[rgb(var(--ayan-text))]">
              {formatPlanPrice(PREMIUM_PLAN.priceMonthly, PREMIUM_PLAN.currency)}
            </p>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-[rgb(var(--ayan-muted))]">
                Status
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[rgb(var(--ayan-text))]">
                {live ? "Live" : "Coming soon"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[rgb(var(--ayan-muted))]">
                Launch window
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[rgb(var(--ayan-text))]">
                {state.launchWindow}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[rgb(var(--ayan-muted))]">
                Waitlist
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[rgb(var(--ayan-text))]">
                {state.waitlistOpen ? "Open" : "Closed"}
              </dd>
            </div>
          </dl>

          <p className="mt-5 text-sm text-[rgb(var(--ayan-muted))]">
            Change the status, launch window and waitlist availability in{" "}
            <a
              href="/admin/settings"
              className="font-semibold text-brand-600 hover:underline"
            >
              System Settings
            </a>
            . Premium cannot be purchased until its status is set to{" "}
            <code className="font-mono text-xs">LIVE</code>.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
            Waitlist size
          </h2>
          <p className="mt-4 font-display text-4xl font-extrabold text-[rgb(var(--ayan-text))]">
            {entries.length}
          </p>
          <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">
            {entries.length === 1 ? "customer" : "customers"} waiting for launch
          </p>
          <div className="mt-5 border-t border-[rgb(var(--ayan-border))] pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--ayan-muted))]">
              Signup sources
            </p>
            <ul className="mt-2 space-y-1 text-sm text-[rgb(var(--ayan-text))]">
              {Object.entries(
                entries.reduce<Record<string, number>>((acc, entry) => {
                  acc[entry.source] = (acc[entry.source] ?? 0) + 1;
                  return acc;
                }, {}),
              )
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => (
                  <li key={source} className="flex justify-between">
                    <span className="capitalize">{source}</span>
                    <span className="font-semibold">{count}</span>
                  </li>
                ))}
              {entries.length === 0 && (
                <li className="text-[rgb(var(--ayan-muted))]">No signups yet.</li>
              )}
            </ul>
          </div>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-[rgb(var(--ayan-border))] p-5">
          <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
            Waitlist signups
          </h2>
          <p className="text-xs text-[rgb(var(--ayan-muted))]">
            Newest first — export to CSV to import into your launch campaign.
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="p-10 text-center text-sm text-[rgb(var(--ayan-muted))]">
            Nobody has joined the Premium waitlist yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[rgb(var(--ayan-surface))] text-xs font-semibold uppercase text-[rgb(var(--ayan-muted))]">
                <tr>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Account</th>
                  <th className="px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--ayan-border))]">
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-[rgb(var(--ayan-surface))]/50 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-[rgb(var(--ayan-text))]">
                      {entry.email}
                    </td>
                    <td className="px-5 py-3 text-[rgb(var(--ayan-muted))]">
                      {entry.name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-[rgb(var(--ayan-muted))] capitalize">
                      {entry.source}
                    </td>
                    <td className="px-5 py-3 text-[rgb(var(--ayan-muted))]">
                      {entry.user ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Icons.checkCircle className="h-4 w-4 text-emerald-600" />
                          {entry.user.role}
                        </span>
                      ) : (
                        <span className="text-xs">Guest</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-[rgb(var(--ayan-muted))]">
                      {formatDateTime(entry.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
