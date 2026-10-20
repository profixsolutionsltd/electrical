"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Icons } from "@/components/ui/Icons";

export interface BookingWidgetService {
  id: string;
  name: string;
}

/**
 * Homepage booking/search widget. Lets a visitor pick a service and enter a
 * postcode, then jumps into the guided booking flow pre-filled with their
 * choices. Validation is minimal here (full validation happens in the flow).
 */
export function BookingWidget({ services }: { services: BookingWidgetService[] }) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState("");
  const [postcode, setPostcode] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId) {
      setError("Please choose a service to get started.");
      return;
    }
    if (!postcode.trim()) {
      setError("Please enter a postcode or location.");
      return;
    }
    setError("");
    const params = new URLSearchParams({
      services: serviceId,
      postcode: postcode.trim().toUpperCase(),
    });
    router.push(`/book?${params.toString()}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))] p-2 shadow-lift sm:p-3"
      aria-label="Quick booking"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
        <div className="flex-1">
          <Select
            aria-label="Choose a service"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="border-0 bg-transparent shadow-none focus:ring-0"
          >
            <option value="">Choose a service…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="hidden w-px self-stretch bg-[rgb(var(--ayan-border))] md:block" />
        <div className="flex-1">
          <Input
            aria-label="Postcode or location"
            placeholder="Enter your postcode"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className="border-0 bg-transparent shadow-none focus:ring-0"
            wrapperClassName="[&>div]:border-0 [&>div]:shadow-none"
          />
        </div>
        <Button type="submit" size="lg" className="md:w-auto">
          <Icons.search className="h-4 w-4" />
          Check availability
        </Button>
      </div>
      {error && (
        <p className="px-3 pb-1 pt-2 text-sm font-medium text-red-600">{error}</p>
      )}
    </form>
  );
}
