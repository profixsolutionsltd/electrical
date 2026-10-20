"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/providers/ToastProvider";
import { saveDiscountCode, toggleDiscountCode, deleteDiscountCode } from "../actions";

export interface DiscountCodeRow {
  id: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  minSubtotal: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

function toDateInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function formatRule(row: DiscountCodeRow): string {
  if (row.type === "FIXED") return `£${(row.value / 100).toFixed(2)} off`;
  return `${row.value}% off`;
}

export function DiscountsClient({ codes }: { codes: DiscountCodeRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await saveDiscountCode(formData);
    setLoading(false);

    if (result.ok) {
      toast.success("Saved", result.message);
      setEditingId(null);
      router.refresh();
    } else {
      toast.error("Failed to save", result.message);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    const result = await toggleDiscountCode(id, active);
    if (result.ok) {
      toast.success("Updated", result.message);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteDiscountCode(id);
    if (result.ok) {
      toast.success("Deleted", result.message);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-2">
        <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
          Discount codes
        </h2>
        <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">
          Codes entered during the booking journey. Every code is re-validated
          and re-priced on the server when the booking is submitted.
        </p>

        {codes.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-4 py-8 text-center text-sm text-[rgb(var(--ayan-muted))]">
            No discount codes yet. Create one with the form beside this panel.
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {codes.map((code) => (
              <div
                key={code.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold tracking-wide text-[rgb(var(--ayan-text))]">
                      {code.code}
                    </span>
                    <Badge tone={code.active ? "success" : "neutral"}>
                      {code.active ? "Active" : "Inactive"}
                    </Badge>
                    {code.maxUses !== null && (
                      <Badge tone="warning">
                        {code.usedCount}/{code.maxUses} used
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">
                    {formatRule(code)}
                    {code.minSubtotal > 0 &&
                      ` · min spend £${(code.minSubtotal / 100).toFixed(2)}`}
                    {code.description ? ` · ${code.description}` : ""}
                  </p>
                  {(code.startsAt || code.endsAt) && (
                    <p className="mt-0.5 text-xs text-[rgb(var(--ayan-muted))]">
                      {code.startsAt ? `From ${toDateInput(code.startsAt)}` : ""}
                      {code.startsAt && code.endsAt ? " · " : ""}
                      {code.endsAt ? `Until ${toDateInput(code.endsAt)}` : ""}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(editingId === code.id ? null : code.id)}
                  >
                    <Icons.edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(code.id, !code.active)}
                  >
                    {code.active ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(code.id)}
                    className="text-red-600"
                  >
                    <Icons.trash className="h-4 w-4" />
                  </Button>
                </div>

                {editingId === code.id && (
                  <DiscountForm
                    initial={code}
                    loading={loading}
                    onSubmit={handleSubmit}
                    onCancel={() => setEditingId(null)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
          New code
        </h2>
        <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">
          Create a percentage or fixed-amount discount.
        </p>
        <DiscountForm loading={loading} onSubmit={handleSubmit} />
      </Card>
    </div>
  );
}

function DiscountForm({
  initial,
  loading,
  onSubmit,
  onCancel,
}: {
  initial?: DiscountCodeRow;
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <Input
        name="code"
        label="Code"
        defaultValue={initial?.code ?? ""}
        placeholder="WELCOME10"
        required
      />

      <Textarea
        name="description"
        label="Description"
        rows={2}
        defaultValue={initial?.description ?? ""}
        placeholder="Shown to the customer when the discount is applied"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[rgb(var(--ayan-text))]">
            Type
          </label>
          <select
            name="type"
            defaultValue={initial?.type ?? "PERCENT"}
            className="w-full rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
          >
            <option value="PERCENT">Percentage off</option>
            <option value="FIXED">Fixed amount off</option>
          </select>
        </div>

        <Input
          name="value"
          label="Value"
          type="number"
          step="0.01"
          min="0"
          defaultValue={
            initial ? (initial.type === "FIXED" ? (initial.value / 100).toFixed(2) : String(initial.value)) : "10"
          }
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          name="minSubtotal"
          label="Min spend (£)"
          type="number"
          step="0.01"
          min="0"
          defaultValue={initial ? (initial.minSubtotal / 100).toFixed(2) : "0"}
        />
        <Input
          name="maxUses"
          label="Max uses"
          type="number"
          min="1"
          defaultValue={initial?.maxUses ?? ""}
          placeholder="Unlimited"
        />
        <label className="flex items-end gap-2 pb-2 text-sm font-medium text-[rgb(var(--ayan-text))]">
          <input
            type="checkbox"
            name="active"
            value="true"
            defaultChecked={initial?.active ?? true}
            className="h-4 w-4 rounded border-[rgb(var(--ayan-border))] text-brand-600 focus:ring-brand-500"
          />
          Active
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="startsAt"
          label="Starts"
          type="date"
          defaultValue={initial ? toDateInput(initial.startsAt) : ""}
        />
        <Input
          name="endsAt"
          label="Ends"
          type="date"
          defaultValue={initial ? toDateInput(initial.endsAt) : ""}
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {initial ? "Save changes" : "Create code"}
        </Button>
      </div>
    </form>
  );
}
