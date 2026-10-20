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
}

const ENGINEER_NAV: NavItem[] = [
  { href: "/engineer", label: "Overview", icon: Icons.dashboard, exact: true },
  { href: "/engineer/jobs", label: "Assigned Jobs", icon: Icons.briefcase },
  { href: "/engineer/availability", label: "Availability", icon: Icons.calendar },
  { href: "/engineer/profile", label: "Profile", icon: Icons.user },
  { href: "/engineer/qualifications", label: "Qualifications", icon: Icons.shieldCheck },
];

/** Engineer portal shell: sidebar + mobile drawer. */
export function EngineerNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-bg))] px-4 lg:hidden">
        <Link href="/engineer" className="flex items-center gap-2">
          <LogoMark className="h-8 w-8" />
          <span className="font-display text-lg font-extrabold">AYAN</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-[rgb(var(--ayan-surface))]" aria-label="Open menu">
          <Icons.menu />
        </button>
      </div>

      <aside className="hidden w-64 shrink-0 border-r border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="flex h-16 items-center gap-2.5 border-b border-[rgb(var(--ayan-border))] px-6">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-lg font-extrabold">AYAN</span>
          </div>
          <p className="px-6 pt-4 text-xs font-semibold uppercase tracking-wider text-[rgb(var(--ayan-muted))]">Engineer portal</p>
          <NavList items={ENGINEER_NAV} isActive={isActive} />
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
                <span className="font-display text-lg font-extrabold">AYAN</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 hover:bg-[rgb(var(--ayan-surface))]" aria-label="Close menu">
                <Icons.close />
              </button>
            </div>
            <NavList items={ENGINEER_NAV} isActive={isActive} onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter userName={userName} />
          </aside>
        </div>
      )}
    </>
  );
}

function NavList({ items, isActive, onNavigate }: { items: NavItem[]; isActive: (i: NavItem) => boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Engineer">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(item) ? "bg-brand-600 text-white" : "text-[rgb(var(--ayan-muted))] hover:bg-[rgb(var(--ayan-surface))] hover:text-[rgb(var(--ayan-text))]",
          )}
          aria-current={isActive(item) ? "page" : undefined}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
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
          <p className="text-xs text-[rgb(var(--ayan-muted))]">Engineer</p>
        </div>
      </div>
      <form action={logoutAction}>
        <button type="submit" className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[rgb(var(--ayan-muted))] hover:bg-[rgb(var(--ayan-surface))] hover:text-red-600">
          <Icons.logout className="h-5 w-5" />
          Log out
        </button>
      </form>
    </div>
  );
}
