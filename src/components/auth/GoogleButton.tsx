import Link from "next/link";
import { Icons } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/**
 * "Continue with Google" button. It links to the OAuth start route, which
 * handles state, PKCE and the redirect back to the app.
 */
export function GoogleButton({
  next,
  label = "Continue with Google",
  className,
}: {
  next?: string;
  label?: string;
  className?: string;
}) {
  const href = next
    ? `/api/auth/google?next=${encodeURIComponent(next)}`
    : "/api/auth/google";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] px-5 text-sm font-semibold text-[rgb(var(--ayan-text))] transition-colors hover:border-brand-300 hover:bg-[rgb(var(--ayan-surface))]",
        className,
      )}
    >
      <Icons.google className="h-5 w-5" />
      {label}
    </Link>
  );
}

/** Thin divider used between the password form and social sign-in. */
export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-[rgb(var(--ayan-border))]" />
      <span className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--ayan-muted))]">
        {label}
      </span>
      <span className="h-px flex-1 bg-[rgb(var(--ayan-border))]" />
    </div>
  );
}
