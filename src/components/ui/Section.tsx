import { cn } from "@/lib/utils";

/** Consistent vertical section spacing + container. */
export function Section({
  className,
  children,
  id,
  tone = "default",
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
  tone?: "default" | "surface" | "brand";
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 sm:py-20 lg:py-24",
        tone === "surface" && "bg-[rgb(var(--ayan-surface))]",
        tone === "brand" && "bg-gradient-dark text-white",
        className,
      )}
    >
      <div className="ayan-container">{children}</div>
    </section>
  );
}

/** Centred section heading block. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  invert = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  invert?: boolean;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
            invert
              ? "bg-white/10 text-brand-200"
              : "bg-[rgb(var(--ayan-brand-soft))] text-brand-700 dark:text-brand-300",
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "ayan-h2 mt-4",
          invert ? "text-white" : "text-[rgb(var(--ayan-text))]",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "ayan-lead mt-4",
            invert ? "text-navy-200" : "text-[rgb(var(--ayan-muted))]",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
