import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";

/** Custom 404 page. */
export default function NotFound() {
  return (
    <div className="ayan-container flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-7xl font-extrabold text-brand-600">404</p>
      <h1 className="ayan-h2 mt-4 text-[rgb(var(--ayan-text))]">Page not found</h1>
      <p className="ayan-lead mt-3 max-w-md">
        Sorry, we couldn&apos;t find the page you were looking for. It may have
        moved or no longer exists.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/" size="lg">
          <Icons.home className="h-4 w-4" />
          Back to home
        </Button>
        <Button href="/services" variant="outline" size="lg">
          Browse services
        </Button>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-[rgb(var(--ayan-muted))]">
        <Link href="/faqs" className="hover:text-brand-600">FAQs</Link>
        <Link href="/contact" className="hover:text-brand-600">Contact</Link>
        <Link href="/dashboard" className="hover:text-brand-600">Dashboard</Link>
      </div>
    </div>
  );
}
