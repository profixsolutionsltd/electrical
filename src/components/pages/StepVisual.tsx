import { Icons } from "@/components/ui/Icons";

/** Decorative mock visuals for the "How it works" steps. */
export function StepVisual({ index }: { index: number }) {
  const visuals = [
    <ServicePickerMock key="0" />,
    <DateTimeMock key="1" />,
    <EngineerMock key="2" />,
    <DocumentMock key="3" />,
  ];
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-brand opacity-10 blur-2xl" />
      <div className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-6 shadow-card">
        {visuals[index]}
      </div>
    </div>
  );
}

function ServicePickerMock() {
  return (
    <div className="space-y-3">
      {["Gas Safety Certificate", "Electrical Safety (EICR)", "Boiler Service"].map((s, i) => (
        <div key={s} className="flex items-center justify-between rounded-xl border border-[rgb(var(--ayan-border))] p-3">
          <div className="flex items-center gap-3">
            <span className={`flex h-5 w-5 items-center justify-center rounded ${i < 2 ? "bg-brand-600 text-white" : "border border-[rgb(var(--ayan-border))]"}`}>
              {i < 2 && <Icons.check className="h-3 w-3" />}
            </span>
            <span className="text-sm font-medium">{s}</span>
          </div>
          <span className="text-sm font-semibold text-[rgb(var(--ayan-muted))]">
            {["£29", "£65", "£89"][i]}
          </span>
        </div>
      ))}
    </div>
  );
}

function DateTimeMock() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className={`rounded-md py-1.5 ${i === 4 ? "bg-brand-600 text-white" : "bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]"}`}
          >
            {i + 9}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        {["Morning", "Afternoon", "Evening"].map((w, i) => (
          <span key={w} className={`flex-1 rounded-lg border py-2 text-center text-xs font-medium ${i === 0 ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40" : "border-[rgb(var(--ayan-border))]"}`}>
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

function EngineerMock() {
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/50">
        <Icons.user className="h-7 w-7" />
      </span>
      <div className="flex-1">
        <p className="font-semibold">Erin Engineer</p>
        <p className="text-sm text-[rgb(var(--ayan-muted))]">Gas Safe & NICEIC qualified</p>
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Icons.shieldCheck className="h-3 w-3" /> Verified
        </span>
      </div>
    </div>
  );
}

function DocumentMock() {
  return (
    <div className="space-y-3">
      {["CP12 Gas Safety Record.pdf", "Invoice AYN-INV-001.pdf"].map((f) => (
        <div key={f} className="flex items-center gap-3 rounded-xl border border-[rgb(var(--ayan-border))] p-3">
          <Icons.fileText className="h-5 w-5 text-brand-600" />
          <span className="flex-1 truncate text-sm font-medium">{f}</span>
          <Icons.download className="h-4 w-4 text-[rgb(var(--ayan-muted))]" />
        </div>
      ))}
    </div>
  );
}
