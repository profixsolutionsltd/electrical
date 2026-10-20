"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Field";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/providers/ToastProvider";
import {
  saveFaq,
  deleteFaq,
  saveTestimonial,
  deleteTestimonial,
  saveBanner,
  deleteBanner,
  saveServiceArea,
  deleteServiceArea,
  updateSystemSetting,
} from "../actions";

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

export interface TestimonialItem {
  id: string;
  authorName: string;
  authorRole: string | null;
  company: string | null;
  content: string;
  rating: number;
  featured: boolean;
  active: boolean;
}

export interface BannerItem {
  id: string;
  message: string;
  link: string | null;
  linkText: string | null;
  active: boolean;
  order: number;
}

export interface ServiceAreaItem {
  id: string;
  postcodePrefix: string;
  label: string;
  active: boolean;
}

export function ContentClient({
  faqs,
  testimonials,
  banners,
  serviceAreas,
}: {
  faqs: FaqItem[];
  testimonials: TestimonialItem[];
  banners: BannerItem[];
  serviceAreas: ServiceAreaItem[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"faqs" | "testimonials" | "banners" | "coverage">("faqs");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal states
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);

  // FAQ Handlers
  const handleSaveFaq = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const result = await saveFaq(new FormData(e.currentTarget));
    setLoading(false);
    if (result.ok) {
      toast.success(result.message);
      setShowFaqModal(false);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    setDeletingId(id);
    const result = await deleteFaq(id);
    setDeletingId(null);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  // Testimonial Handlers
  const handleSaveTestimonial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const result = await saveTestimonial(new FormData(e.currentTarget));
    setLoading(false);
    if (result.ok) {
      toast.success(result.message);
      setShowTestimonialModal(false);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    setDeletingId(id);
    const result = await deleteTestimonial(id);
    setDeletingId(null);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  // Banner Handlers
  const handleSaveBanner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const result = await saveBanner(new FormData(e.currentTarget));
    setLoading(false);
    if (result.ok) {
      toast.success(result.message);
      setShowBannerModal(false);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    setDeletingId(id);
    const result = await deleteBanner(id);
    setDeletingId(null);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  // Coverage Area Handlers
  const handleSaveArea = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const result = await saveServiceArea(new FormData(e.currentTarget));
    setLoading(false);
    if (result.ok) {
      toast.success(result.message);
      setShowAreaModal(false);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  const handleDeleteArea = async (id: string) => {
    if (!confirm("Remove this postcode prefix?")) return;
    setDeletingId(id);
    const result = await deleteServiceArea(id);
    setDeletingId(null);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] p-1">
          <button
            onClick={() => setActiveTab("faqs")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "faqs"
                ? "bg-[rgb(var(--ayan-card))] text-[rgb(var(--ayan-text))] shadow-sm"
                : "text-[rgb(var(--ayan-muted))] hover:text-[rgb(var(--ayan-text))]"
            }`}
          >
            FAQs ({faqs.length})
          </button>
          <button
            onClick={() => setActiveTab("testimonials")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "testimonials"
                ? "bg-[rgb(var(--ayan-card))] text-[rgb(var(--ayan-text))] shadow-sm"
                : "text-[rgb(var(--ayan-muted))] hover:text-[rgb(var(--ayan-text))]"
            }`}
          >
            Testimonials ({testimonials.length})
          </button>
          <button
            onClick={() => setActiveTab("banners")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "banners"
                ? "bg-[rgb(var(--ayan-card))] text-[rgb(var(--ayan-text))] shadow-sm"
                : "text-[rgb(var(--ayan-muted))] hover:text-[rgb(var(--ayan-text))]"
            }`}
          >
            Banners ({banners.length})
          </button>
          <button
            onClick={() => setActiveTab("coverage")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "coverage"
                ? "bg-[rgb(var(--ayan-card))] text-[rgb(var(--ayan-text))] shadow-sm"
                : "text-[rgb(var(--ayan-muted))] hover:text-[rgb(var(--ayan-text))]"
            }`}
          >
            Service Areas ({serviceAreas.length})
          </button>
        </div>

        <div>
          {activeTab === "faqs" && (
            <Button onClick={() => setShowFaqModal(true)}>
              <Icons.plus className="h-4 w-4" />
              Add FAQ
            </Button>
          )}
          {activeTab === "testimonials" && (
            <Button onClick={() => setShowTestimonialModal(true)}>
              <Icons.plus className="h-4 w-4" />
              Add Testimonial
            </Button>
          )}
          {activeTab === "banners" && (
            <Button onClick={() => setShowBannerModal(true)}>
              <Icons.plus className="h-4 w-4" />
              Add Banner
            </Button>
          )}
          {activeTab === "coverage" && (
            <Button onClick={() => setShowAreaModal(true)}>
              <Icons.plus className="h-4 w-4" />
              Add Coverage Prefix
            </Button>
          )}
        </div>
      </div>

      {/* Tab: FAQs */}
      {activeTab === "faqs" && (
        <Card className="divide-y divide-[rgb(var(--ayan-border))]">
          {faqs.length === 0 ? (
            <div className="p-8 text-center text-sm text-[rgb(var(--ayan-muted))]">
              No FAQs created.
            </div>
          ) : (
            faqs.map((f) => (
              <div key={f.id} className="p-5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {f.category}
                    </span>
                    <span className="text-xs text-[rgb(var(--ayan-muted))]">Order: {f.order}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-[rgb(var(--ayan-text))]">{f.question}</h4>
                  <p className="text-xs text-[rgb(var(--ayan-muted))] whitespace-pre-line">{f.answer}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteFaq(f.id)}
                  loading={deletingId === f.id}
                  className="text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            ))
          )}
        </Card>
      )}

      {/* Tab: Testimonials */}
      {activeTab === "testimonials" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {testimonials.map((t) => (
            <Card key={t.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-[rgb(var(--ayan-text))]">
                      {t.authorName}
                    </h4>
                    <p className="text-xs text-[rgb(var(--ayan-muted))]">
                      {t.authorRole || t.company || "Verified Landlord"}
                    </p>
                  </div>
                  <div className="flex text-amber-400 text-xs">
                    {"★".repeat(t.rating)}
                  </div>
                </div>
                <p className="mt-3 text-xs italic text-[rgb(var(--ayan-text))]">&ldquo;{t.content}&rdquo;</p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[rgb(var(--ayan-border))] pt-3 text-xs">
                {t.featured && (
                  <span className="text-brand-600 font-semibold text-[11px]">Featured on Home</span>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteTestimonial(t.id)}
                  loading={deletingId === t.id}
                  className="text-red-600 hover:bg-red-50 ml-auto"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Banners */}
      {activeTab === "banners" && (
        <Card className="divide-y divide-[rgb(var(--ayan-border))]">
          {banners.length === 0 ? (
            <div className="p-8 text-center text-sm text-[rgb(var(--ayan-muted))]">
              No announcement banners configured.
            </div>
          ) : (
            banners.map((b) => (
              <div key={b.id} className="p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        b.active ? "bg-emerald-500" : "bg-gray-400"
                      }`}
                    />
                    <span className="text-xs font-semibold text-[rgb(var(--ayan-muted))]">
                      {b.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="font-medium text-sm text-[rgb(var(--ayan-text))] mt-1">
                    {b.message}
                  </p>
                  {b.link && (
                    <a
                      href={b.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-600 hover:underline"
                    >
                      {b.linkText || b.link} →
                    </a>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteBanner(b.id)}
                  loading={deletingId === b.id}
                  className="text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            ))
          )}
        </Card>
      )}

      {/* Tab: Coverage */}
      {activeTab === "coverage" && (
        <Card className="p-5">
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
            {serviceAreas.map((area) => (
              <div
                key={area.id}
                className="flex items-center justify-between rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] p-3 text-xs"
              >
                <div>
                  <p className="font-mono font-bold text-sm text-[rgb(var(--ayan-text))]">
                    {area.postcodePrefix}
                  </p>
                  <p className="text-[rgb(var(--ayan-muted))]">{area.label}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteArea(area.id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Remove area"
                >
                  <Icons.close className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modals for Add FAQ, Add Testimonial, Add Banner, Add Area */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-lg p-6 bg-[rgb(var(--ayan-card))] shadow-xl">
            <h3 className="font-display text-base font-semibold mb-4 text-[rgb(var(--ayan-text))]">
              Add Frequently Asked Question
            </h3>
            <form onSubmit={handleSaveFaq} className="space-y-4">
              <Input name="category" label="Category" placeholder="e.g. general, gas, booking" defaultValue="general" required />
              <Input name="question" label="Question" placeholder="e.g. How fast are certificates issued?" required />
              <Textarea name="answer" label="Answer" rows={4} placeholder="Full explanation..." required />
              <Input name="order" type="number" label="Sort Order" defaultValue="0" />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowFaqModal(false)}>Cancel</Button>
                <Button type="submit" loading={loading}>Save FAQ</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showTestimonialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-lg p-6 bg-[rgb(var(--ayan-card))] shadow-xl">
            <h3 className="font-display text-base font-semibold mb-4 text-[rgb(var(--ayan-text))]">
              Add Customer Testimonial
            </h3>
            <form onSubmit={handleSaveTestimonial} className="space-y-4">
              <Input name="authorName" label="Customer Name" placeholder="e.g. Sarah Jenkins" required />
              <Input name="authorRole" label="Title / Role" placeholder="e.g. Private Landlord" />
              <Input name="company" label="Company Name" placeholder="e.g. London Properties Ltd" />
              <Textarea name="content" label="Review Content" rows={3} placeholder="Outstanding service..." required />
              <Input name="rating" type="number" min="1" max="5" label="Star Rating (1-5)" defaultValue="5" required />
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" name="featured" value="true" className="rounded" />
                Featured on Homepage
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowTestimonialModal(false)}>Cancel</Button>
                <Button type="submit" loading={loading}>Save Testimonial</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-lg p-6 bg-[rgb(var(--ayan-card))] shadow-xl">
            <h3 className="font-display text-base font-semibold mb-4 text-[rgb(var(--ayan-text))]">
              Add Announcement Banner
            </h3>
            <form onSubmit={handleSaveBanner} className="space-y-4">
              <Input name="message" label="Banner Message" placeholder="e.g. Winter boiler maintenance slots now available." required />
              <Input name="link" label="Target Link URL" placeholder="e.g. /services/boiler-servicing" />
              <Input name="linkText" label="Link CTA Label" placeholder="e.g. Book now" />
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" name="active" value="true" defaultChecked className="rounded" />
                Publish Immediately
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowBannerModal(false)}>Cancel</Button>
                <Button type="submit" loading={loading}>Save Banner</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showAreaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md p-6 bg-[rgb(var(--ayan-card))] shadow-xl">
            <h3 className="font-display text-base font-semibold mb-4 text-[rgb(var(--ayan-text))]">
              Add Service Coverage Area
            </h3>
            <form onSubmit={handleSaveArea} className="space-y-4">
              <Input name="postcodePrefix" label="Postcode Outcode Prefix" placeholder="e.g. SW1, E14, CR0, M1" required />
              <Input name="label" label="Area Description" placeholder="e.g. Central London, Canary Wharf, Croydon" required />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAreaModal(false)}>Cancel</Button>
                <Button type="submit" loading={loading}>Save Area</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

