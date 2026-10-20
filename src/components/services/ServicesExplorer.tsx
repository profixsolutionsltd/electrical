"use client";

import { useMemo, useState } from "react";
import { Icons } from "@/components/ui/Icons";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ExplorerCard } from "./ExplorerCard";
import { CategoryChip, EmptyState } from "./ExplorerParts";
import type { ExplorerCategory, ExplorerService } from "./types";

const PAGE_SIZE = 6;

/**
 * Client-side searchable, filterable, sortable service directory with
 * pagination. Operates on the full list passed from the server so results are
 * instant without extra round-trips.
 */
export function ServicesExplorer({
  categories,
  services,
}: {
  categories: ExplorerCategory[];
  services: ExplorerService[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = services;
    if (category !== "all") list = list.filter((s) => s.categoryId === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.categoryName.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.priceFrom - b.priceFrom);
    else if (sort === "price-desc") sorted.sort((a, b) => b.priceFrom - a.priceFrom);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
    return sorted;
  }, [services, category, search, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("featured");
    setPage(1);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search servicesâ€¦"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={<Icons.search className="h-4 w-4" />}
            aria-label="Search services"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="sm:w-52"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.count})
              </option>
            ))}
          </Select>
          <Select
            aria-label="Sort services"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="sm:w-44"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name (Aâ€“Z)</option>
          </Select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <CategoryChip
          active={category === "all"}
          onClick={() => {
            setCategory("all");
            setPage(1);
          }}
          label="All"
          count={services.length}
        />
        {categories.map((c) => (
          <CategoryChip
            key={c.id}
            active={category === c.id}
            onClick={() => {
              setCategory(c.id);
              setPage(1);
            }}
            label={c.name}
            count={c.count}
            icon={c.icon}
          />
        ))}
      </div>

      {paged.length === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : (
        <>
          <p className="mt-8 text-sm text-[rgb(var(--ayan-muted))]">
            Showing {paged.length} of {filtered.length} service
            {filtered.length === 1 ? "" : "s"}
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((service) => (
              <ExplorerCard key={service.id} service={service} />
            ))}
          </div>

          {pageCount > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <Icons.arrowLeft className="h-4 w-4" />
                Prev
              </Button>
              <span className="px-3 text-sm text-[rgb(var(--ayan-muted))]">
                Page {currentPage} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={currentPage === pageCount}
              >
                Next
                <Icons.arrowRight className="h-4 w-4" />
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
