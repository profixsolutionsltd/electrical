"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/providers/ToastProvider";
import { toggleServicePublished, deleteService, saveCategory, deleteCategory } from "../actions";
import { formatMoney } from "@/lib/format";

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  priceFrom: number;
  durationMinutes: number;
  published: boolean;
  featured: boolean;
  bookingCount: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  serviceCount: number;
}

export function ServicesClient({
  services,
  categories,
}: {
  services: ServiceItem[];
  categories: CategoryItem[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"services" | "categories">("services");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const filteredServices = services.filter((s) => {
    const matchesCategory = selectedCategory === "ALL" || s.categoryId === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTogglePublish = async (service: ServiceItem) => {
    setLoadingId(service.id);
    const result = await toggleServicePublished(service.id);
    setLoadingId(null);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  const handleDeleteService = async (service: ServiceItem) => {
    if (!confirm(`Are you sure you want to delete "${service.name}"?`)) return;
    setLoadingId(service.id);
    const result = await deleteService(service.id);
    setLoadingId(null);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCategoryLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await saveCategory(formData);
    setCategoryLoading(false);
    if (result.ok) {
      toast.success(result.message);
      setShowCategoryModal(false);
      router.refresh();
    } else {
      toast.error("Failed", result.message);
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    setLoadingId(cat.id);
    const result = await deleteCategory(cat.id);
    setLoadingId(null);
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
        <div className="flex rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] p-1">
          <button
            onClick={() => setActiveTab("services")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "services"
                ? "bg-[rgb(var(--ayan-card))] text-[rgb(var(--ayan-text))] shadow-sm"
                : "text-[rgb(var(--ayan-muted))] hover:text-[rgb(var(--ayan-text))]"
            }`}
          >
            Services Catalogue ({services.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "categories"
                ? "bg-[rgb(var(--ayan-card))] text-[rgb(var(--ayan-text))] shadow-sm"
                : "text-[rgb(var(--ayan-muted))] hover:text-[rgb(var(--ayan-text))]"
            }`}
          >
            Service Categories ({categories.length})
          </button>
        </div>

        {activeTab === "services" ? (
          <Button href="/admin/services/new">
            <Icons.plus className="h-4 w-4" />
            Add New Service
          </Button>
        ) : (
          <Button onClick={() => setShowCategoryModal(true)}>
            <Icons.plus className="h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>

      {/* Services Tab */}
      {activeTab === "services" && (
        <Card className="overflow-hidden">
          {/* Filter Bar */}
          <div className="flex flex-col gap-4 border-b border-[rgb(var(--ayan-border))] p-5 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              className="w-full sm:max-w-xs rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-4 py-2 text-sm text-[rgb(var(--ayan-text))] placeholder-[rgb(var(--ayan-muted))] focus:border-brand-500 focus:outline-none"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {filteredServices.length === 0 ? (
            <div className="p-10 text-center text-sm text-[rgb(var(--ayan-muted))]">
              No services match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[rgb(var(--ayan-surface))] text-xs font-semibold uppercase text-[rgb(var(--ayan-muted))]">
                  <tr>
                    <th className="px-5 py-3">Service</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Starting Price</th>
                    <th className="px-5 py-3">Duration</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Orders</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--ayan-border))]">
                  {filteredServices.map((s) => (
                    <tr key={s.id} className="hover:bg-[rgb(var(--ayan-surface))]/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-[rgb(var(--ayan-text))]">{s.name}</p>
                        <p className="font-mono text-xs text-[rgb(var(--ayan-muted))]">/{s.slug}</p>
                      </td>
                      <td className="px-5 py-3 text-xs text-[rgb(var(--ayan-muted))]">
                        {s.categoryName}
                      </td>
                      <td className="px-5 py-3 font-semibold text-[rgb(var(--ayan-text))]">
                        {formatMoney(s.priceFrom)}
                      </td>
                      <td className="px-5 py-3 text-xs text-[rgb(var(--ayan-muted))]">
                        {s.durationMinutes} mins
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            s.published
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {s.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs font-medium text-[rgb(var(--ayan-text))]">
                        {s.bookingCount}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTogglePublish(s)}
                            loading={loadingId === s.id}
                            className="text-xs"
                          >
                            {s.published ? "Unpublish" : "Publish"}
                          </Button>
                          <Link
                            href={`/admin/services/${s.id}`}
                            className="rounded-lg p-1.5 text-brand-600 hover:bg-[rgb(var(--ayan-surface))] hover:underline text-xs font-medium"
                          >
                            Edit
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteService(s)}
                            loading={loadingId === s.id}
                            className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[rgb(var(--ayan-surface))] text-xs font-semibold uppercase text-[rgb(var(--ayan-muted))]">
                <tr>
                  <th className="px-5 py-3">Category Name</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Display Order</th>
                  <th className="px-5 py-3">Services Count</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--ayan-border))]">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-[rgb(var(--ayan-surface))]/50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-[rgb(var(--ayan-text))]">
                      {c.name}
                      {c.description && (
                        <p className="text-xs font-normal text-[rgb(var(--ayan-muted))]">
                          {c.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-[rgb(var(--ayan-muted))]">
                      {c.slug}
                    </td>
                    <td className="px-5 py-3 text-xs text-[rgb(var(--ayan-muted))]">
                      {c.order}
                    </td>
                    <td className="px-5 py-3 text-xs font-medium text-[rgb(var(--ayan-text))]">
                      {c.serviceCount} services
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCategory(c)}
                        loading={loadingId === c.id}
                        disabled={c.serviceCount > 0}
                        className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Category Creation Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md p-6 bg-[rgb(var(--ayan-card))] shadow-xl">
            <div className="flex items-center justify-between border-b border-[rgb(var(--ayan-border))] pb-4 mb-4">
              <h3 className="font-display text-lg font-semibold text-[rgb(var(--ayan-text))]">
                Add Service Category
              </h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-[rgb(var(--ayan-muted))] hover:text-[rgb(var(--ayan-text))]"
              >
                <Icons.close className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--ayan-text))] mb-1">
                  Category Name
                </label>
                <input
                  name="name"
                  placeholder="e.g. Gas & Heating Services"
                  required
                  className="w-full rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--ayan-text))] mb-1">
                  Slug (URL key)
                </label>
                <input
                  name="slug"
                  placeholder="e.g. gas-heating"
                  required
                  className="w-full rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--ayan-text))] mb-1">
                  Description
                </label>
                <input
                  name="description"
                  placeholder="Short category summary"
                  className="w-full rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--ayan-text))] mb-1">
                  Sort Order
                </label>
                <input
                  name="order"
                  type="number"
                  defaultValue="0"
                  className="w-full rounded-xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-surface))] px-3 py-2 text-sm text-[rgb(var(--ayan-text))] focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[rgb(var(--ayan-border))]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCategoryModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={categoryLoading}>
                  Create Category
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

