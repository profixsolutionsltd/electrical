"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProperty } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, Checkbox } from "@/components/ui/Field";
import { useToast } from "@/components/providers/ToastProvider";

/** Form to add a new property. */
export function AddPropertyForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createProperty(formData);
    setLoading(false);
    if (result.ok) {
      toast.success("Property saved");
      router.refresh();
      onDone();
    } else {
      toast.error("Couldn't save", result.message);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mb-6 space-y-4 rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-6">
      <h2 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">Add a property</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="label" label="Label" placeholder="Home, Flat 2…" required />
        <Input name="addressLine1" label="Address line 1" required />
        <Input name="addressLine2" label="Address line 2 (optional)" />
        <Input name="city" label="Town or city" required />
        <Input name="postcode" label="Postcode" required />
        <Select name="propertyType" label="Property type">
          <option value="">Select…</option>
          <option value="Flat">Flat</option>
          <option value="House">House</option>
          <option value="HMO">HMO</option>
          <option value="Commercial">Commercial</option>
        </Select>
        <Input name="bedrooms" type="number" label="Bedrooms" min={0} max={50} />
      </div>
      <Checkbox name="isDefault" label="Set as my default property" />
      <div className="flex gap-2">
        <Button type="submit" loading={loading}>Save property</Button>
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}
