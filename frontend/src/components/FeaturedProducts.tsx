"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, PackageSearch } from "lucide-react";
import { apiClient } from "@/lib/api";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import { EmptyState } from "./ui";

export default function FeaturedProducts() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await apiClient.getPublicProducts()).data,
  });

  // Newest first (ids are sequential)
  const featured = [...(data ?? [])].sort((a, b) => b.id - a.id).slice(0, 8);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-primary">Fresh drops</p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Newest in the store</h2>
          <p className="text-muted-foreground">Hand-picked digital products, ready to download the moment you buy.</p>
        </div>
        <Link href="/products" className="btn-secondary group shrink-0">
          View all products
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : isError || featured.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={isError ? "Products are unavailable right now" : "No products yet"}
          description={isError ? "We couldn't reach the store. Please try again in a moment." : "Be the first creator to publish something great."}
          action={!isError && <Link href="/auth/register" className="btn-primary btn-sm">Start selling</Link>}
        />
      ) : (
        // Phones: swipeable carousel that peeks the next card. sm+: grid
        <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {featured.map((product, i) => (
            <div key={product.id} className="w-[78%] shrink-0 animate-fade-up snap-start sm:w-auto" style={{ animationDelay: `${i * 60}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
