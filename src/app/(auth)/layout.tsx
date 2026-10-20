import { LogoMark } from "@/components/brand/Logo";
import { Icons } from "@/components/ui/Icons";

/**
 * Auth layout: a branded visual panel on one side and the form on the other
 * (desktop), collapsing to a single column on mobile. Used by all auth routes.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-dark lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        </div>

        <div className="relative flex items-center gap-3">
          <LogoMark className="h-9 w-9" />
          <span className="font-display text-2xl font-extrabold text-white">AYAN</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="font-display text-3xl font-bold leading-tight text-white">
            Everything Managed. One Smart Platform.
          </h2>
          <p className="mt-4 text-navy-200">
            Book, track and manage all your property compliance certificates
            and services in a single secure place.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "Exact prices, shown before you book",
              "Vetted, admin-verified engineers",
              "Certificates & invoices in one dashboard",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-navy-100">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-brand-200">
                  <Icons.check className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-6 text-sm text-navy-300">
          <span className="inline-flex items-center gap-2">
            <Icons.shield className="h-4 w-4" /> Secure sign-in
          </span>
          <span className="inline-flex items-center gap-2">
            <Icons.users className="h-4 w-4" /> For landlords, agents & engineers
          </span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 lg:justify-end">
          <a href="/" className="flex items-center gap-2 lg:hidden" aria-label="AYAN home">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-lg font-extrabold text-[rgb(var(--ayan-text))]">AYAN</span>
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[rgb(var(--ayan-muted))] hover:text-brand-600"
          >
            <Icons.arrowLeft className="h-4 w-4" />
            Back to site
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 pt-0 sm:p-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
