import { cn } from "@/lib/utils";

/**
 * AYAN logo. A distinctive mark: a rounded "smart platform" tile formed from an
 * interlocking node/shield shape, paired with the AYAN wordmark. Provided as an
 * inline SVG so it scales crisply and can recolour with currentColor.
 */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-9 w-9" />
      {showWordmark && (
        <span className="font-display text-xl font-extrabold tracking-tight text-[rgb(var(--ayan-text))]">
          AYAN
        </span>
      )}
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="AYAN logo"
    >
      <defs>
        <linearGradient id="ayan-logo-grad" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#2b66e6" />
          <stop offset="100%" stopColor="#163da3" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ayan-logo-grad)" />
      {/* Interlocking nodes representing "everything managed in one place" */}
      <path
        d="M14 33V21.5a3.5 3.5 0 0 1 7 0V33"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M24 33V15"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M24 24.5c0-2 1.6-3.5 3.5-3.5H32"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M32 21v7.5a4 4 0 0 0 4 4"
        stroke="#8eb8ff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="14" cy="35.5" r="2" fill="#8eb8ff" />
    </svg>
  );
}
