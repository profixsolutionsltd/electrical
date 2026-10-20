"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

/** Global error boundary for uncaught runtime errors. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console; in production wire this to your error tracker.
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="ayan-container flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-6xl font-extrabold text-red-500">Oops</p>
      <h1 className="ayan-h2 mt-4 text-[rgb(var(--ayan-text))]">Something went wrong</h1>
      <p className="ayan-lead mt-3 max-w-md">
        An unexpected error occurred. You can try again, or head back to the
        homepage. If the problem persists, please contact support.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset} size="lg">
          Try again
        </Button>
        <Button href="/" variant="outline" size="lg">
          Back to home
        </Button>
      </div>
    </div>
  );
}
