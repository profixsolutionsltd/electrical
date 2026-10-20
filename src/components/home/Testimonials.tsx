import { SectionHeading } from "@/components/ui/Section";
import { Icons } from "@/components/ui/Icons";
import { initials, hashHue } from "@/lib/utils";
import type { Testimonial } from "@prisma/client";

/** Customer testimonials. Clearly labelled as sample content until real
 *  reviews exist — never presents fabricated reviews as genuine. */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  const isSample = testimonials.some((t) =>
    (t.source ?? "").toLowerCase().includes("sample"),
  );

  return (
    <div>
      <SectionHeading
        eyebrow="Testimonials"
        title="What our customers say"
        description="Feedback from landlords, agents and homeowners who use AYAN."
      />

      {isSample && (
        <p className="mx-auto mt-4 max-w-2xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Note: The reviews below are clearly-labelled sample content and will
          be replaced with genuine verified reviews as they are collected.
        </p>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.id}
            className="flex h-full flex-col rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-6 shadow-soft"
          >
            <div className="flex gap-0.5 text-amber-400">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Icons.star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-[rgb(var(--ayan-text))]">
              “{t.content}”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-[rgb(var(--ayan-border))] pt-4">
              <Avatar name={t.authorName} />
              <div>
                <p className="text-sm font-semibold text-[rgb(var(--ayan-text))]">
                  {t.authorName}
                </p>
                <p className="text-xs text-[rgb(var(--ayan-muted))]">
                  {[t.authorRole, t.company].filter(Boolean).join(" · ")}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const hue = hashHue(name);
  return (
    <span
      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: `hsl(${hue} 60% 45%)` }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
