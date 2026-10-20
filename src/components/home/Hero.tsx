import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { HeroArt } from "./HeroArt";
import type { PlatformSettings } from "@/server/settings";

/**
 * Homepage hero: strong headline, supporting text, trust chips and the booking
 * widget. Uses an original abstract illustration instead of stock imagery.
 */
export function Hero({
  settings,
  content,
  children,
}: {
  settings: PlatformSettings;
  content: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[rgb(var(--ayan-border))]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl dark:bg-brand-900/20" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-brand-100/40 blur-3xl dark:bg-brand-800/10" />
      </div>

      <div className="ayan-container grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-in-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <Icons.shieldCheck className="h-3.5 w-3.5" />
            {content["home.hero.badge"] ?? "Trusted by landlords & agents"}
          </span>

          <h1 className="ayan-h1 mt-6 text-[rgb(var(--ayan-text))]">
            {content["home.hero.title"] ?? "Everything Managed. One Smart Platform."}
          </h1>

          <p className="ayan-lead mt-5 max-w-xl">
            {content["home.hero.subtitle"] ??
              "Book gas, electrical, EPC and fire safety services through one simple platform. Exact prices, vetted engineers, next-day appointments."}
          </p>

          <div className="mt-8">{children}</div>

          <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[rgb(var(--ayan-muted))]">
            <li className="inline-flex items-center gap-2">
              <Icons.checkCircle className="h-4 w-4 text-emerald-500" />
              Pay only when the job&apos;s done
            </li>
            <li className="inline-flex items-center gap-2">
              <Icons.checkCircle className="h-4 w-4 text-emerald-500" />
              Next-day appointments available
            </li>
            <li className="inline-flex items-center gap-2">
              <Icons.checkCircle className="h-4 w-4 text-emerald-500" />
              Verified, vetted engineers
            </li>
          </ul>
        </div>

        <HeroIllustration settings={settings} />
      </div>
    </section>
  );
}

function HeroIllustration({ settings }: { settings: PlatformSettings }) {
  return (
    <div className="relative hidden lg:block">
      <div className="relative mx-auto aspect-square w-full max-w-lg">
        <HeroArt />
      </div>
      <div className="absolute -left-4 top-8 w-56 rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-4 shadow-lift animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50">
            <Icons.checkCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[rgb(var(--ayan-text))]">Booking confirmed</p>
            <p className="text-xs text-[rgb(var(--ayan-muted))]">AYN-8F3K2Q</p>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 right-0 w-60 rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-4 shadow-lift animate-fade-in">
        <p className="text-xs font-medium text-[rgb(var(--ayan-muted))]">Next appointment</p>
        <p className="mt-1 font-display text-lg font-bold text-[rgb(var(--ayan-text))]">
          Tomorrow, 9:00
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand-600">
          <Icons.mapPin className="h-3.5 w-3.5" />
          {settings.companyAddress.split(",")[0]}
        </p>
      </div>
    </div>
  );
}
