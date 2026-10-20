"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ayan-cookie-consent";

/** Cookie preferences page with a working consent toggle. */
export function CookiePreferences() {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    const consent = { essential: true, analytics, marketing, at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div>
      <p>
        We use cookies to keep the platform secure and working. You can choose
        which optional cookies to allow. Your choice is stored on this device.
      </p>

      <div className="mt-8 space-y-4">
        <ConsentRow
          title="Essential cookies"
          description="Required for the site to function, including secure sign-in. These cannot be disabled."
          locked
        />
        <ConsentRow
          title="Analytics cookies"
          description="Help us understand how the platform is used so we can improve it."
          checked={analytics}
          onChange={setAnalytics}
        />
        <ConsentRow
          title="Marketing cookies"
          description="Used to measure the effectiveness of our communications."
          checked={marketing}
          onChange={setMarketing}
        />
      </div>

      <div className="mt-8 flex items-center gap-4">
        <Button onClick={save}>Save preferences</Button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <Icons.checkCircle className="h-4 w-4" /> Preferences saved
          </span>
        )}
      </div>
    </div>
  );
}

function ConsentRow({
  title,
  description,
  checked,
  onChange,
  locked,
}: {
  title: string;
  description: string;
  checked?: boolean;
  onChange?: (value: boolean) => void;
  locked?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-4">
      <div>
        <p className="font-semibold text-[rgb(var(--ayan-text))]">{title}</p>
        <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">{description}</p>
      </div>
      {locked ? (
        <span className="shrink-0 rounded-full bg-[rgb(var(--ayan-surface))] px-3 py-1 text-xs font-semibold text-[rgb(var(--ayan-muted))]">
          Always on
        </span>
      ) : (
        <button
          role="switch"
          aria-checked={checked}
          aria-label={title}
          onClick={() => onChange?.(!checked)}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors",
            checked ? "bg-brand-600" : "bg-[rgb(var(--ayan-border))]",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
              checked ? "translate-x-5" : "translate-x-0.5",
            )}
          />
        </button>
      )}
    </div>
  );
}
