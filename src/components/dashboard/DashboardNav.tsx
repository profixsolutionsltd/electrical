"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/brand/Logo";
import { Icons } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/auth-actions";

/** Customer dashboard navigation items. */
const NAV = [
  { href: "/dashboard", label: "Overview", icon: Icons.dashboard, exact: true },
  { href: "/dashboard/bookings", label: "My Bookings", icon: Icons.calendar },
  { href: "/dashboard/bookings/new", label: "Create a Booking", icon: Icons.plus },
  { href: "/dashboard/properties", label: "My Properties", icon: Icons.building },
  { href: "/dashboard/documents", label: "Documents", icon: Icons.fileText },
  { href: "/dashboard/invoices", label: "Invoices", icon: Icons.receipt },
  { href: "/dashboard/premium", label: "Premium", icon: Icons.crown, badge: "Soon" },
  { href: "/dashboard/notifications", label: "Notifications", icon: Icons.bell },
  { href: "/dashboard/support", label: "Support", icon: Icons.message },
  { href: "/dashboard/profile", label: "Profile", icon: Icons.user },
  { href: "/dashboard/security", label: "Security", icon: Icons.shield },
];

/** Responsive dashboard shell: fixed sidebar on desktop, drawer on mobile. */
export function DashboardNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-bg))] px-4 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <LogoMark className="h-8 w-8" />
          <span className="font-display text-lg font-extrabold">AYAN</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 hover:bg-[rgb(var(--ayan-surface))]"
          aria-label="Open menu"
        >
          <Icons.menu />
        </button>
      </div>

      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 border-r border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="flex h-16 items-center gap-2.5 border-b border-[rgb(var(--ayan-border))] px-6">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-lg font-extrabold">AYAN</span>
          </div>
          <NavList pathname={pathname} isActive={isActive} />
          <SidebarFooter userName={userName} />
        </div>
      </aside>

      {/* Drawer (mobile) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-[rgb(var(--ayan-card))] shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-[rgb(var(--ayan-border))] px-6">
              <div className="flex items-center gap-2.5">
                <LogoMark className="h-8 w-8" />
                <span className="font-display text-lg font-extrabold">AYAN</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 hover:bg-[rgb(var(--ayan-surface))]" aria-label="Close menu">
                <Icons.close />
              </button>
            </div>
            <NavList pathname={pathname} isActive={isActive} onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter userName={userName} />
          </aside>
        </div>
      )}
    </>
  );
}

function NavList({
  pathname,
  isActive,
  onNavigate,
}: {
  pathname: string;
  isActive: (item: (typeof NAV)[number]) => boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Dashboard">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(item)
              ? "bg-brand-600 text-white"
              : "text-[rgb(var(--ayan-muted))] hover:bg-[rgb(var(--ayan-surface))] hover:text-[rgb(var(--ayan-text))]",
          )}
          aria-current={isActive(item) ? "page" : undefined}
        >
          <item.icon className="h-5 w-5" />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

function SidebarFooter({ userName }: { userName: string }) {
  return (
    <div className="border-t border-[rgb(var(--ayan-border))] p-4">
      <div className="flex items-center gap-3 px-2 py-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/50">
          {userName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[rgb(var(--ayan-text))]">{userName}</p>
          <p className="text-xs text-[rgb(var(--ayan-muted))]">Customer</p>
        </div>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[rgb(var(--ayan-muted))] hover:bg-[rgb(var(--ayan-surface))] hover:text-red-600"
        >
          <Icons.logout className="h-5 w-5" />
          Log out
        </button>
      </form>
    </div>
  );
}
