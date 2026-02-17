"use client";

import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { apiClient } from "@/lib/api";

export default function ProductsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await apiClient.getPublicProducts()).data,
  });

  if (isLoading) return <main className="container-page">Loading products...</main>;
  if (error) return <main className="container-page">Failed to load products.</main>;

  return (
    <main className="container-page">
      <h1 className="mb-4 text-2xl font-bold">Products</h1>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((product) => <ProductCard key={product.id} product={product} />)}
      </section>
    </main>
  );
}
