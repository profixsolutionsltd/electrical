import { requireCustomer } from "@/server/guards";
import { getPremiumState, isOnPremiumWaitlist } from "@/server/premium";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PremiumWaitlistForm } from "@/components/dashboard/PremiumWaitlistForm";
import { Badge } from "@/components/ui/Badge";
import { Icons } from "@/components/ui/Icons";
import {
  PLANS,
  PREMIUM_PLAN,
  formatPlanPrice,
  premiumStatusLabel,
} from "@/lib/premium";

export const dynamic = "force-dynamic";

export default async function DashboardPremiumPage() {
  const session = await requireCustomer();
  const state = await getPremiumState();
  const joined = await isOnPremiumWaitlist(session.email);
  const isLive = state.status === "LIVE";

  return (
    <>
      <PageHeader
        title="Premium"
        description="A faster, smarter way to manage every property you look after."
        actions={
          <Badge tone={isLive ? "success" : "warning"}>
            {isLive ? <Icons.checkCircle className="h-3.5 w-3.5" /> : <Icons.clock className="h-3.5 w-3.5" />}
            {premiumStatusLabel(state.status)}
          </Badge>
        }
      />

      {!isLive && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="flex items-center gap-2 font-semibold">
            <Icons.sparkles className="h-4 w-4" />
            Premium is coming soon
          </p>
          <p className="mt-1 text-amber-800 dark:text-amber-200">
            Everything below is finalised. We&apos;re polishing the last details
            and expect to open Premium to waitlist members
            {state.launchWindow ? `, ${state.launchWindow.toLowerCase()}` : ""}.
            Join the waitlist to get first access.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plan card */}
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 dark:border-brand-900 dark:from-brand-950/50 dark:to-[rgb(var(--ayan-card))] sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <Icons.crown className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold text-[rgb(var(--ayan-text))]">
                    {PREMIUM_PLAN.name}
                  </h2>
                  <p className="text-sm text-[rgb(var(--ayan-muted))]">
                    {PREMIUM_PLAN.tagline}
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[rgb(var(--ayan-muted))]">
                {PREMIUM_PLAN.description}
              </p>

              <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-3">
                <div>
                  <p className="font-display text-3xl font-extrabold text-[rgb(var(--ayan-text))]">
                    {formatPlanPrice(PREMIUM_PLAN.priceMonthly, PREMIUM_PLAN.currency)}
                  </p>
                  <p className="text-xs text-[rgb(var(--ayan-muted))]">
                    or {formatPlanPrice(PREMIUM_PLAN.priceAnnual, PREMIUM_PLAN.currency, "year")}
                  </p>
                </div>
                <Badge tone="warning">
                  <Icons.lock className="h-3.5 w-3.5" />
                  Not yet available
                </Badge>
              </div>

              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {PREMIUM_PLAN.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-[rgb(var(--ayan-text))]"
                  >
                    <Icons.check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Comparison */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))]">
            <div className="border-b border-[rgb(var(--ayan-border))] p-5">
              <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
                Compare plans
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[rgb(var(--ayan-surface))] text-xs font-semibold uppercase text-[rgb(var(--ayan-muted))]">
                  <tr>
                    <th className="px-5 py-3">Feature</th>
                    {PLANS.map((plan) => (
                      <th key={plan.id} className="px-5 py-3">
                        {plan.name}
                        {plan.id === "premium" && (
                          <Badge tone="warning" className="ml-2">
                            Soon
                          </Badge>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--ayan-border))]">
                  {PREMIUM_PLAN.features.map((feature) => {
                    const standard = PREMIUM_PLAN.standardFeatures.includes(feature);
                    return (
                      <tr key={feature}>
                        <td className="px-5 py-3 text-[rgb(var(--ayan-text))]">
                          {feature}
                        </td>
                        <td className="px-5 py-3 text-[rgb(var(--ayan-muted))]">
                          {standard ? (
                            <Icons.check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <span className="text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <Icons.check className="h-4 w-4 text-brand-600" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Waitlist */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-6">
            <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
              Get launch access
            </h2>
            <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">
              Waitlist members get first access and a launch discount.
            </p>
            <div className="mt-5">
              <PremiumWaitlistForm
                defaultEmail={session.email}
                alreadyJoined={joined}
                waitlistOpen={state.waitlistOpen}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-6">
            <h3 className="text-sm font-semibold text-[rgb(var(--ayan-text))]">
              Need it sooner?
            </h3>
            <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">
              We&apos;re onboarding a limited number of portfolios early. Talk to
              the team and we&apos;ll find you a slot.
            </p>
            <a
              href="/dashboard/support"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
            >
              Contact support
              <Icons.arrowRight className="h-4 w-4" />
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
