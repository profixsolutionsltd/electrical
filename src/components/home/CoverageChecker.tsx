"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Icons } from "@/components/ui/Icons";
import { normalisePostcode, postcodeOutward } from "@/lib/utils";

/**
 * Coverage-area checker. Compares the entered postcode's outward code against
 * the configured service areas. Honest messaging — never claims coverage that
 * isn't configured.
 */
export function CoverageChecker({ areas }: { areas: string[] }) {
  const [postcode, setPostcode] = useState("");
  const [result, setResult] = useState<
    | { status: "idle" }
    | { status: "covered"; area: string }
    | { status: "not-covered" }
    | { status: "error"; message: string }
  >({ status: "idle" });

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    const value = normalisePostcode(postcode);
    if (!value) {
      setResult({ status: "error", message: "Please enter a postcode." });
      return;
    }
    const outward = postcodeOutward(value);
    const matched = areas.find((a) => {
      const prefix = a.toUpperCase();
      return outward.startsWith(prefix) || prefix.startsWith(outward);
    });
    if (matched) {
      setResult({ status: "covered", area: matched });
    } else {
      setResult({ status: "not-covered" });
    }
  };

  return (
    <div className="mx-auto max-w-3xl text-center">
      <SectionHeading
        eyebrow="Coverage"
        title="Do we cover your area?"
        description="Enter your postcode to check whether AYAN currently operates in your location."
      />

      <form onSubmit={check} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
        <Input
          placeholder="e.g. SW1A 1AA"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          icon={<Icons.mapPin className="h-4 w-4" />}
          aria-label="Postcode"
        />
        <Button type="submit" size="md" className="sm:w-auto">
          Check coverage
        </Button>
      </form>

      {result.status !== "idle" && (
        <div className="mx-auto mt-6 max-w-md animate-fade-in" role="status">
          {result.status === "covered" && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left dark:border-emerald-900 dark:bg-emerald-950/40">
              <Icons.checkCircle className="h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                  Great news — we cover your area
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Area {result.area}. Book your service today.
                </p>
              </div>
            </div>
          )}
          {result.status === "not-covered" && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-900 dark:bg-amber-950/40">
              <Icons.alert className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">
                  Not in our coverage area yet
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  We&apos;re expanding. Leave your details on the contact page
                  and we&apos;ll let you know when we reach you.
                </p>
              </div>
            </div>
          )}
          {result.status === "error" && (
            <p className="text-sm font-medium text-red-600">{result.message}</p>
          )}
        </div>
      )}

      {areas.length > 0 && (
        <div className="mt-8">
          <p className="text-sm text-[rgb(var(--ayan-muted))]">
            Currently serving:{" "}
            {areas.map((a, i) => (
              <span key={a}>
                <span className="font-semibold text-[rgb(var(--ayan-text))]">{a}</span>
                {i < areas.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
