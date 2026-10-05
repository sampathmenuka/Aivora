"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, LayoutGrid, PackageSearch, Search, X } from "lucide-react";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";
import { EmptyState } from "@/components/ui";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/format";
import { PRODUCT_TYPES } from "@/lib/product-types";

const SORTS = {
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  title: "Name: A to Z",
} as const;

type Sort = keyof typeof SORTS;

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsCatalog />
    </Suspense>
  );
}

function ProductsCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "ALL");
  const [sort, setSort] = useState<Sort>("newest");

  // Keep the URL shareable without adding history entries on every keystroke
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (type !== "ALL") params.set("type", type);
    const query = params.toString();
    router.replace(query ? `/products?${query}` : "/products", { scroll: false });
  }, [search, type, router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await apiClient.getPublicProducts()).data,
  });

  const counts = useMemo(() => {
    const result: Record<string, number> = { ALL: data?.length ?? 0 };
    data?.forEach((p) => (result[p.productType] = (result[p.productType] ?? 0) + 1));
    return result;
  }, [data]);

  const products = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = (data ?? []).filter((p) => {
      const matchesSearch =
        !term || p.title.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term);
      return matchesSearch && (type === "ALL" || p.productType === type);
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return b.id - a.id;
      }
    });
  }, [data, search, type, sort]);

  const filtersActive = search.trim() !== "" || type !== "ALL";
  const resetFilters = () => {
    setSearch("");
    setType("ALL");
  };

  const typeOptions = [{ id: "ALL", label: "All", icon: LayoutGrid }, ...Object.entries(PRODUCT_TYPES).map(([id, meta]) => ({ id, label: meta.label + "s", icon: meta.icon }))];

  return (
    <main>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-primary">Marketplace</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">Explore products</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Ebooks, courses and digital files from independent creators.</p>

          <div className="relative mt-8 max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              className="input h-14 rounded-2xl pl-12 pr-12 text-base shadow-soft"
              type="search"
              placeholder="Search by title or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="btn-icon btn-ghost absolute right-2.5 top-1/2 h-8 w-8 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            {typeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setType(option.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  type === option.id
                    ? "border-foreground bg-foreground text-background shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
                <span className={cn("text-xs", type === option.id ? "text-background/70" : "text-muted-foreground/70")}>
                  {counts[option.id] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading…" : `${products.length} result${products.length === 1 ? "" : "s"}`}
            </p>
            <label className="relative">
              <span className="sr-only">Sort products</span>
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="input w-auto cursor-pointer appearance-none py-2 pl-9 pr-8"
              >
                {Object.entries(SORTS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="alert-error">We couldn&apos;t load products. Please check your connection and try again.</div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No products found"
            description={filtersActive ? "Try a different search term or category." : "Nothing has been published yet. Check back soon."}
            action={filtersActive && <button onClick={resetFilters} className="btn-secondary btn-sm">Clear filters</button>}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, i) => (
              <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
