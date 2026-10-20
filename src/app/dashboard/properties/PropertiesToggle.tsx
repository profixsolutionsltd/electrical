"use client";

import { useState } from "react";
import { AddPropertyForm } from "./AddPropertyForm";
import { PropertyCard, type PropertyItem } from "./PropertyCard";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";

/** Properties page shell: header, add toggle, list. */
export function PropertiesToggle({ properties }: { properties: PropertyItem[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[rgb(var(--ayan-text))]">My Properties</h1>
          <p className="mt-1 text-sm text-[rgb(var(--ayan-muted))]">Save addresses to speed up future bookings.</p>
        </div>
        <Button onClick={() => setAdding((v) => !v)}>
          <Icons.plus className="h-4 w-4" />
          Add property
        </Button>
      </div>

      {adding && <AddPropertyForm onDone={() => setAdding(false)} />}

      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--ayan-border))] py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(var(--ayan-surface))] text-[rgb(var(--ayan-muted))]">
            <Icons.building className="h-7 w-7" />
          </div>
          <h2 className="ayan-h3 mt-4 text-[rgb(var(--ayan-text))]">No saved properties</h2>
          <p className="mt-2 max-w-sm text-sm text-[rgb(var(--ayan-muted))]">
            Save your addresses to book faster next time.
          </p>
          <Button className="mt-5" onClick={() => setAdding(true)}>Add a property</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
