"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/brand/Logo";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Public site header. Sticky, responsive, with a mobile drawer and auth-aware
 * actions. A client component for interactive behaviour.
 */

export interface HeaderUser {
  name: string;
  role: string;
}

const NAV = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];

export function Header({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "ENGINEER"
        ? "/engineer"
        : "/dashboard";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors",
        scrolled
          ? "border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-bg))]/85 backdrop-blur-lg"
          : "border-transparent bg-[rgb(var(--ayan-bg))]",
      )}
    >
      <div className="ayan-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center" aria-label="AYAN home">
          <span className="inline-flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-xl font-extrabold tracking-tight text-[rgb(var(--ayan-text))]">
              AYAN
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "text-brand-700 dark:text-brand-300"
                  : "text-[rgb(var(--ayan-muted))] hover:text-[rgb(var(--ayan-text))]",
              )}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button href={dashboardHref} size="sm">
              Dashboard
            </Button>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
                Log in
              </Button>
              <Button href="/book" size="sm">
                Get Started
              </Button>
            </>
          )}
          <button
            className="rounded-lg p-2 text-[rgb(var(--ayan-text))] hover:bg-[rgb(var(--ayan-surface))] lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <Icons.close /> : <Icons.menu />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-bg))] lg:hidden">
          <nav className="ayan-container flex flex-col gap-1 py-4" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  isActive(item.href) && item.href !== "/"
                    ? "bg-[rgb(var(--ayan-brand-soft))] text-brand-700 dark:text-brand-200"
                    : "text-[rgb(var(--ayan-text))] hover:bg-[rgb(var(--ayan-surface))]",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-[rgb(var(--ayan-border))] pt-3">
              {user ? (
                <Button href={dashboardHref} fullWidth>
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button href="/login" variant="outline" fullWidth>
                    Log in
                  </Button>
                  <Button href="/book" fullWidth>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
