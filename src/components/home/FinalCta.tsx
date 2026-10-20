import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";

/** Final conversion CTA band near the bottom of the homepage. */
export function FinalCta() {
  return (
    <section className="bg-gradient-dark">
      <div className="ayan-container flex flex-col items-center gap-8 py-16 text-center lg:flex-row lg:justify-between lg:text-left">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Ready to get everything managed?
          </h2>
          <p className="mt-3 text-lg text-navy-200">
            Pick a service, choose a time and pay nothing until the job is done.
            We&apos;ll set up your account so every certificate, invoice and
            appointment lives in one smart platform.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/book" size="lg" className="bg-white text-navy-900 hover:bg-navy-100">
            Get started free
            <Icons.arrowRight className="h-4 w-4" />
          </Button>
          <Button
            href="/services"
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:border-white/60 hover:text-white"
          >
            Browse services
          </Button>
        </div>
      </div>
    </section>
  );
}
