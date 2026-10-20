"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/brand/Logo";
import { Icons } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/auth-actions";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string;
}

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: Icons.dashboard, exact: true },
  { href: "/admin/users", label: "Users & Engineers", icon: Icons.user },
  { href: "/admin/services", label: "Services", icon: Icons.briefcase },
  { href: "/admin/bookings", label: "Bookings", icon: Icons.calendar },
  { href: "/admin/discounts", label: "Discounts", icon: Icons.tag },
  { href: "/admin/finance", label: "Finance & Invoices", icon: Icons.creditCard },
  { href: "/admin/premium", label: "Premium", icon: Icons.crown, badge: "Soon" },
  { href: "/admin/content", label: "Content & CMS", icon: Icons.document },
  { href: "/admin/settings", label: "System Settings", icon: Icons.settings },
];

export function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-bg))] px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark className="h-8 w-8" />
          <span className="font-display text-lg font-extrabold text-[rgb(var(--ayan-text))]">AYAN Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 hover:bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-text))]"
          aria-label="Open menu"
        >
          <Icons.menu />
        </button>
      </div>

      <aside className="hidden w-64 shrink-0 border-r border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="flex h-16 items-center gap-2.5 border-b border-[rgb(var(--ayan-border))] px-6">
            <LogoMark className="h-8 w-8" />
            <div className="flex flex-col">
              <span className="font-display text-lg font-extrabold text-[rgb(var(--ayan-text))] leading-none">AYAN</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mt-1">
                Admin Control Panel
              </span>
            </div>
          </div>
          <NavList items={ADMIN_NAV} isActive={isActive} />
          <SidebarFooter userName={userName} />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-[rgb(var(--ayan-card))] shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-[rgb(var(--ayan-border))] px-6">
              <div className="flex items-center gap-2.5">
                <LogoMark className="h-8 w-8" />
                <span className="font-display text-lg font-extrabold text-[rgb(var(--ayan-text))]">AYAN Admin</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 hover:bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-text))]"
                aria-label="Close menu"
              >
                <Icons.close />
              </button>
            </div>
            <NavList items={ADMIN_NAV} isActive={isActive} onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter userName={userName} />
          </aside>
        </div>
      )}
    </>
  );
}

function NavList({
  items,
  isActive,
  onNavigate,
}: {
  items: NavItem[];
  isActive: (i: NavItem) => boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Admin Navigation">
      {items.map((item) => (
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
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white dark:bg-brand-700">
          {userName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[rgb(var(--ayan-text))]">{userName}</p>
          <p className="text-xs text-[rgb(var(--ayan-muted))]">Super Administrator</p>
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

