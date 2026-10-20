"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Field";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/providers/ToastProvider";
import { saveService, saveServiceFaq, deleteServiceFaq } from "../actions";
import { QuestionsEditor } from "./QuestionsEditor";

export interface ServiceFormData {
  id?: string;
  name?: string;
  slug?: string;
  categoryId?: string;
  summary?: string;
  description?: string;
  features?: string | null;
  questions?: string | null;
  priceFrom?: number;
  durationMinutes?: number;
  imageUrl?: string | null;
  published?: boolean;
  featured?: boolean;
  vatApplicable?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  faqs?: { id: string; question: string; answer: string; order: number }[];
}

export function ServiceFormClient({
  initialData,
  categories,
}: {
  initialData?: ServiceFormData;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData?.id);

  // Parse existing features
  let defaultFeaturesText = "";
  if (initialData?.features) {
    try {
      const parsed = JSON.parse(initialData.features);
      if (Array.isArray(parsed)) defaultFeaturesText = parsed.join("\n");
    } catch {
      defaultFeaturesText = initialData.features;
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    if (initialData?.id) {
      formData.append("id", initialData.id);
    }

    const result = await saveService(formData);
    setLoading(false);

    if (result.ok) {
      toast.success("Saved", result.message);
      router.push("/admin/services");
      router.refresh();
    } else {
      toast.error("Failed to save", result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[rgb(var(--ayan-border))] pb-4">
          <h3 className="font-display text-base font-semibold text-[rgb(var(--ayan-text))]">
            {isEditing ? "Edit Service" : "Create New Service"}
          </h3>
          <Link
            href="/admin/services"
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            ← Back to Catalogue
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Input
            name="name"
            label="Service Title"
            defaultValue={initialData?.name ?? ""}
            placeholder="e.g. Landlord Gas Safety Certificate (CP12)"
            required
          />

          <Input
            name="slug"
            label="URL Slug"
            defaultValue={initialData?.slug ?? ""}
            placeholder="e.g. gas-safety-certificate"
            required
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-[rgb(var(--ayan-text))] mb-1.5">
              Category
            </label>
            <select
              name="categoryId"
              defaultValue={initialData?.categoryId ?? categories[0]?.id}
              required
              className="w-full rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            name="priceFrom"
            type="number"
            step="0.01"
            label="Starting Price (£)"
            defaultValue={initialData?.priceFrom ? (initialData.priceFrom / 100).toFixed(2) : "69.00"}
            required
          />

          <Input
            name="durationMinutes"
            type="number"
            label="Est. Duration (Minutes)"
            defaultValue={initialData?.durationMinutes ?? 60}
            required
          />
        </div>

        <Textarea
          name="summary"
          label="Short Summary"
          rows={2}
          defaultValue={initialData?.summary ?? ""}
          placeholder="Brief 1-2 sentence description shown on overview cards"
          required
        />

        <Textarea
          name="description"
          label="Full Detailed Description"
          rows={5}
          defaultValue={initialData?.description ?? ""}
          placeholder="Detailed explanation of what the inspection covers, legal obligations, and deliverables."
          required
        />

        <Textarea
          name="features"
          label="Key Features & Inclusions (one per line)"
          rows={4}
          defaultValue={defaultFeaturesText}
          placeholder="Official digital certificate issued within 24h&#10;Fully Gas Safe registered engineer&#10;Visual check of all gas pipework and appliances"
        />

        <Input
          name="imageUrl"
          label="Service Hero Image URL"
          defaultValue={initialData?.imageUrl ?? ""}
          placeholder="https://images.unsplash.com/..."
        />

        <div className="space-y-3 pt-4 border-t border-[rgb(var(--ayan-border))]">
          <div>
            <h4 className="font-display text-sm font-semibold text-[rgb(var(--ayan-text))]">
              Booking questions
            </h4>
            <p className="mt-1 text-xs text-[rgb(var(--ayan-muted))]">
              Asked during the booking journey. Answers are stored on the booking
              and re-priced on the server — the browser never sets the price.
            </p>
          </div>
          <QuestionsEditor initial={initialData?.questions ?? null} />
        </div>

        <div className="grid gap-6 sm:grid-cols-3 pt-4 border-t border-[rgb(var(--ayan-border))]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="published"
              value="true"
              defaultChecked={initialData?.published ?? true}
              className="h-4 w-4 rounded border-[rgb(var(--ayan-border))] text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-[rgb(var(--ayan-text))]">
              Published on Website
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              value="true"
              defaultChecked={initialData?.featured ?? false}
              className="h-4 w-4 rounded border-[rgb(var(--ayan-border))] text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-[rgb(var(--ayan-text))]">
              Feature on Homepage
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="vatApplicable"
              value="true"
              defaultChecked={initialData?.vatApplicable ?? true}
              className="h-4 w-4 rounded border-[rgb(var(--ayan-border))] text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-[rgb(var(--ayan-text))]">
              Standard VAT (20%) Applies
            </span>
          </label>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 pt-4 border-t border-[rgb(var(--ayan-border))]">
          <Input
            name="metaTitle"
            label="SEO Meta Title"
            defaultValue={initialData?.metaTitle ?? ""}
            placeholder="e.g. Landlord Gas Safety Certificates London | AYAN"
          />

          <Input
            name="metaDescription"
            label="SEO Meta Description"
            defaultValue={initialData?.metaDescription ?? ""}
            placeholder="Book certified Gas Safe inspections from £69 with instant digital certificate delivery."
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-[rgb(var(--ayan-border))]">
          <Button href="/admin/services" variant="outline">
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? "Save Changes" : "Create Service"}
          </Button>
        </div>
      </Card>
    </form>
  );
}

