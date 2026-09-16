"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, Download, Library, RefreshCw, Search } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ProductCover } from "@/components/ProductCard";
import { EmptyState, PageHeader, Skeleton, Spinner } from "@/components/ui";
import { apiClient } from "@/lib/api";
import { downloadPurchase } from "@/lib/download";
import { getApiErrorMessage } from "@/lib/format";
import { productTypeMeta } from "@/lib/product-types";

export default function PurchasesPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => (await apiClient.getPurchases()).data,
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await apiClient.getPublicProducts()).data,
  });
  const productById = new Map((productsQuery.data ?? []).map((p) => [p.id, p]));

  const downloadMutation = useMutation({
    mutationFn: ({ productId, title }: { productId: number; title: string }) => downloadPurchase(productId, title),
  });

  const purchases = (data ?? []).filter((item) => item.title.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <ProtectedRoute>
      <main className="container-page">
        <PageHeader
          eyebrow="Library"
          title="My library"
          description="Everything you've bought, ready to download any time."
          actions={
            <button onClick={() => refetch()} className="btn-secondary btn-sm" disabled={isRefetching}>
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
          }
        />

        {downloadMutation.isError && (
          <div className="alert-error mb-6">{getApiErrorMessage(downloadMutation.error, "Download failed. Please try again.")}</div>
        )}

        {(data?.length ?? 0) > 3 && (
          <div className="relative mb-6 max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="input pl-10"
              type="search"
              placeholder="Search your library…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)}
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={Library}
            title="Your library is empty"
            description="Products you buy will show up here, ready to download. Recent payments can take a moment to appear."
            action={
              <Link href="/products" className="btn-primary">
                Explore products
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {purchases.map((item) => {
              const product = productById.get(item.productId) ?? {
                id: item.productId,
                title: item.title,
                description: "",
                price: 0,
                productType: item.productType,
              };
              const meta = productTypeMeta(item.productType);
              const downloading = downloadMutation.isPending && downloadMutation.variables?.productId === item.productId;

              return (
                <article key={item.productId} className="card card-hover group flex flex-col overflow-hidden p-0">
                  <ProductCover product={product} className="aspect-[16/9] w-full" />
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <div className="space-y-1.5">
                      <span className={meta.badge}>
                        <meta.icon className="h-3 w-3" />
                        {meta.label}
                      </span>
                      <h3 className="line-clamp-2 font-display font-bold">{item.title}</h3>
                    </div>
                    <div className="mt-auto flex gap-2">
                      <button
                        className="btn-primary flex-1"
                        onClick={() => downloadMutation.mutate({ productId: item.productId, title: item.title })}
                        disabled={downloading}
                      >
                        {downloading ? <Spinner /> : <Download className="h-4 w-4" />}
                        {downloading ? "Preparing…" : "Download"}
                      </button>
                      <Link href={`/products/${item.productId}`} className="btn-secondary" aria-label={`View ${item.title}`}>
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
