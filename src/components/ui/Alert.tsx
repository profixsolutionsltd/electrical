import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/Icons";

type AlertTone = "info" | "success" | "warning" | "error";

const tones: Record<AlertTone, { wrap: string; icon: string; Icon: React.ComponentType<{ className?: string }> }> = {
  info: {
    wrap: "border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-900 dark:bg-brand-950/40 dark:text-brand-200",
    icon: "text-brand-600",
    Icon: Icons.info,
  },
  success: {
    wrap: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
    icon: "text-emerald-600",
    Icon: Icons.checkCircle,
  },
  warning: {
    wrap: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
    icon: "text-amber-600",
    Icon: Icons.alert,
  },
  error: {
    wrap: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
    icon: "text-red-600",
    Icon: Icons.alert,
  },
};

/** Inline alert / callout. */
export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const config = tones[tone];
  return (
    <div
      className={cn("flex items-start gap-3 rounded-xl border p-4 text-sm", config.wrap, className)}
      role={tone === "error" ? "alert" : "status"}
    >
      <config.Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.icon)} />
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && "mt-0.5")}>{children}</div>
      </div>
    </div>
  );
}
