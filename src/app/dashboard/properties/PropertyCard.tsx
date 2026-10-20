"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProperty, setDefaultProperty } from "./actions";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/providers/ToastProvider";

export interface PropertyItem {
  id: string;
  label: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string;
  propertyType: string | null;
  bedrooms: number | null;
  isDefault: boolean;
}

/** Property card with default/delete actions. */
export function PropertyCard({ property }: { property: PropertyItem }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    if (!confirm("Remove this property?")) return;
    setLoading(true);
    const result = await deleteProperty(property.id);
    setLoading(false);
    if (result.ok) {
      toast.success("Property removed");
      router.refresh();
    } else {
      toast.error("Couldn't remove", result.message);
    }
  };

  const onDefault = async () => {
    setLoading(true);
    await setDefaultProperty(property.id);
    setLoading(false);
    toast.success("Default property updated");
    router.refresh();
  };

  return (
    <div className="flex flex-col rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--ayan-brand-soft))] text-brand-600">
          <Icons.building className="h-5 w-5" />
        </div>
        {property.isDefault && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            Default
          </span>
        )}
      </div>
      <h3 className="mt-3 font-semibold text-[rgb(var(--ayan-text))]">{property.label}</h3>
      <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">
        {property.addressLine1}
        {property.addressLine2 ? `, ${property.addressLine2}` : ""}
      </p>
      <p className="text-sm text-[rgb(var(--ayan-muted))]">{property.city} {property.postcode}</p>
      {property.propertyType && (
        <p className="mt-1 text-xs text-[rgb(var(--ayan-muted))]">
          {property.propertyType}
          {property.bedrooms ? ` · ${property.bedrooms} bed` : ""}
        </p>
      )}
      <div className="mt-4 flex gap-2 border-t border-[rgb(var(--ayan-border))] pt-4">
        {!property.isDefault && (
          <Button variant="ghost" size="sm" onClick={onDefault} disabled={loading}>
            Set default
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onDelete} disabled={loading} className="text-red-600">
          <Icons.trash className="h-4 w-4" />
          Remove
        </Button>
      </div>
    </div>
  );
}
