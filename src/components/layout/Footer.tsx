import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { Icons } from "@/components/ui/Icons";
import type { PlatformSettings } from "@/server/settings";

const SERVICE_LINKS = [
  { href: "/services/gas-safety-certificate", label: "Gas Safety Certificates" },
  { href: "/services/electrical-safety-certificate", label: "Electrical Safety (EICR)" },
  { href: "/services/energy-performance-certificate", label: "Energy Performance (EPC)" },
  { href: "/services/boiler-service", label: "Boiler Servicing" },
  { href: "/services/portable-appliance-testing", label: "PAT Testing" },
  { href: "/services/fire-risk-assessment", label: "Fire Risk Assessments" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
  { href: "/coverage", label: "Coverage" },
];

const LEGAL_LINKS = [
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/cancellation", label: "Cancellation Policy" },
  { href: "/legal/cookies", label: "Cookie Preferences" },
];

const SOCIAL_LINKS = [
  { href: "https://twitter.com", label: "X / Twitter" },
  { href: "https://linkedin.com", label: "LinkedIn" },
  { href: "https://facebook.com", label: "Facebook" },
];

/** Comprehensive public site footer. */
export function Footer({ settings }: { settings: PlatformSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))]">
      <div className="ayan-container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-8 w-8" />
              <span className="font-display text-xl font-extrabold tracking-tight">
                AYAN
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-[rgb(var(--ayan-muted))]">
              {settings.companyTagline} Book gas, electrical, EPC and fire
              safety services through one simple platform.
            </p>
            <div className="mt-5 space-y-2 text-sm text-[rgb(var(--ayan-muted))]">
              <p className="flex items-center gap-2">
                <Icons.phone className="h-4 w-4 text-brand-500" />
                <a href={`tel:${settings.supportPhone}`} className="hover:text-brand-600">
                  {settings.supportPhone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Icons.mail className="h-4 w-4 text-brand-500" />
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-brand-600">
                  {settings.supportEmail}
                </a>
              </p>
              <p className="flex items-start gap-2">
                <Icons.mapPin className="mt-0.5 h-4 w-4 text-brand-500" />
                <span>{settings.companyAddress}</span>
              </p>
            </div>
          </div>

          <FooterColumn title="Services" links={SERVICE_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[rgb(var(--ayan-border))] pt-6 sm:flex-row">
          <p className="text-sm text-[rgb(var(--ayan-muted))]">
            © {year} {settings.companyName}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-[rgb(var(--ayan-muted))] hover:bg-[rgb(var(--ayan-card))] hover:text-brand-600"
                aria-label={s.label}
              >
                <SocialGlyph label={s.label} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[rgb(var(--ayan-text))]">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-[rgb(var(--ayan-muted))] transition-colors hover:text-brand-600"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialGlyph({ label }: { label: string }) {
  const common = "h-4 w-4";
  if (label.includes("LinkedIn")) {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.4 8.65 23 10.6 23 14.1V21h-4v-6.2c0-1.6-.57-2.7-2-2.7-1.2 0-1.9.8-2.2 1.6-.1.3-.13.7-.13 1.1V21h-4V9Z" />
      </svg>
    );
  }
  if (label.includes("Facebook")) {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.3l-4.9-6.4L6 22H2.9l7.3-8.3L1.5 2H8l4.4 5.8L18.9 2Zm-1.1 18h1.7L7.3 3.8H5.5L17.8 20Z" />
    </svg>
  );
}
