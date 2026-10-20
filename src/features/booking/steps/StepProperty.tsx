"use client";

import { useState } from "react";
import { useBookingStore } from "../booking-store";
import { StepShell } from "./StepShell";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { checkCoverageAction } from "../actions";

const PROPERTY_TYPES = [
  "House",
  "Flat / apartment",
  "Terraced house",
  "Semi-detached house",
  "Detached house",
  "Bungalow",
  "Maisonette",
  "Commercial unit",
  "Other",
];

/** Step 2 — the property the work is carried out at. */
export function StepProperty({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { draft, updateDetails } = useBookingStore();
  const [postcodeInput, setPostcodeInput] = useState(draft.postcode);
  const [checking, setChecking] = useState(false);
  const [coverage, setCoverage] = useState<{
    covered: boolean;
    message: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const checkCoverage = async () => {
    setChecking(true);
    setCoverage(null);
    const result = await checkCoverageAction(postcodeInput);
    setCoverage({ covered: result.covered, message: result.message });
    setChecking(false);
    if (result.covered) {
      updateDetails({ postcode: postcodeInput.toUpperCase(), coverageConfirmed: true });
    }
  };

  /** Changing the postcode invalidates the previous coverage check. */
  const onPostcodeChange = (value: string) => {
    setPostcodeInput(value);
    setCoverage(null);
    if (value.trim().toUpperCase() !== draft.postcode) {
      updateDetails({ coverageConfirmed: false });
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!draft.coverageConfirmed) {
      next.postcode = "Check that we cover your postcode first";
    }
    if (draft.addressLine1.trim().length < 3) {
      next.addressLine1 = "Enter the first line of the address";
    }
    if (draft.city.trim().length < 2) {
      next.city = "Enter a town or city";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onNext();
  };

  return (
    <StepShell
      eyebrow="Step 2 of 6"
      title="Where should we come?"
      description="We'll send an engineer to this address for the inspection or service visit."
      onBack={onBack}
      onNext={validate}
    >
      <div className="space-y-6">
        {/* Postcode coverage check */}
        <div className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] p-5">
          <h3 className="text-sm font-semibold text-[rgb(var(--ayan-text))]">
            Check we cover your postcode
          </h3>
          <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">
            We currently work across London and the surrounding counties.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                name="postcode"
                label="Postcode"
                value={postcodeInput}
                onChange={(e) => onPostcodeChange(e.target.value)}
                placeholder="SW1A 1AA"
                autoComplete="postal-code"
                error={errors.postcode}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={checkCoverage}
              loading={checking}
              className="sm:mb-0"
            >
              Check coverage
            </Button>
          </div>

          {coverage && (
            <p
              role="status"
              className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm ${
                coverage.covered
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
              }`}
            >
              {coverage.covered ? (
                <Icons.checkCircle className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <Icons.info className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              {coverage.message}
            </p>
          )}
        </div>

        {/* Address fields — revealed once coverage is confirmed */}
        {draft.coverageConfirmed && (
          <div className="space-y-5">
            <Input
              name="addressLine1"
              label="Address line 1"
              value={draft.addressLine1}
              onChange={(e) => updateDetails({ addressLine1: e.target.value })}
              placeholder="42 Example Street"
              autoComplete="address-line1"
              error={errors.addressLine1}
            />
            <Input
              name="addressLine2"
              label="Address line 2 (optional)"
              value={draft.addressLine2}
              onChange={(e) => updateDetails({ addressLine2: e.target.value })}
              placeholder="Flat 2, West Wing"
              autoComplete="address-line2"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                name="city"
                label="Town or city"
                value={draft.city}
                onChange={(e) => updateDetails({ city: e.target.value })}
                placeholder="London"
                autoComplete="address-level2"
                error={errors.city}
              />
              <Input
                name="postcodeConfirmed"
                label="Postcode"
                value={draft.postcode}
                onChange={(e) => updateDetails({ postcode: e.target.value.toUpperCase() })}
                autoComplete="postal-code"
                readOnly
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                name="propertyType"
                label="Property type"
                value={draft.propertyType}
                onChange={(e) => updateDetails({ propertyType: e.target.value })}
              >
                <option value="">Select a property type</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              <Select
                name="bedrooms"
                label="Bedrooms (optional)"
                value={draft.bedrooms}
                onChange={(e) => updateDetails({ bedrooms: e.target.value })}
              >
                <option value="">Select</option>
                {["Studio", "1", "2", "3", "4", "5", "6+"].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
            </div>

            <Input
              name="accessNotes"
              label="Access notes (optional)"
              value={draft.accessNotes}
              onChange={(e) => updateDetails({ accessNotes: e.target.value })}
              placeholder="Key with the concierge, please call on arrival"
            />
          </div>
        )}
      </div>
    </StepShell>
  );
}
