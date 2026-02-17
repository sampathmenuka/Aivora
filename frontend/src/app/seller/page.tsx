"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";

export default function SellerPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [productType, setProductType] = useState("EBOOK");
  const [fileUrl, setFileUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [latestProductId, setLatestProductId] = useState<number | null>(null);

  const createProduct = useMutation({
    mutationFn: apiClient.createProduct,
    onSuccess: ({ data }) => setLatestProductId(data.id),
  });

  const publishProduct = useMutation({ mutationFn: apiClient.publishProduct });
  const unpublishProduct = useMutation({ mutationFn: apiClient.unpublishProduct });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    createProduct.mutate({
      title,
      description,
      price: Number(price),
      productType,
      fileUrl,
      previewUrl,
    });
  };

  return (
    <ProtectedRoute role="SELLER">
      <main className="container-page max-w-2xl">
        <h1 className="mb-4 text-2xl font-bold">Seller Dashboard</h1>

        <form onSubmit={onSubmit} className="space-y-3 rounded border border-border p-4">
          <input className="w-full rounded border border-border px-3 py-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea className="w-full rounded border border-border px-3 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <input className="w-full rounded border border-border px-3 py-2" type="number" step="0.01" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
          <select className="w-full rounded border border-border px-3 py-2" value={productType} onChange={(e) => setProductType(e.target.value)}>
            <option value="EBOOK">EBOOK</option>
            <option value="COURSE">COURSE</option>
            <option value="DIGITAL_FILE">DIGITAL_FILE</option>
          </select>
          <input className="w-full rounded border border-border px-3 py-2" placeholder="Private File URL/Path" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} required />
          <input className="w-full rounded border border-border px-3 py-2" placeholder="Preview URL (PDF/Video)" value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)} />
          <button className="rounded bg-foreground px-4 py-2 text-background" disabled={createProduct.isPending}>
            {createProduct.isPending ? "Creating..." : "Create Product"}
          </button>
        </form>

        {latestProductId && (
          <div className="mt-4 rounded border border-border p-4">
            <p className="mb-2 text-sm">Latest product ID: {latestProductId}</p>
            <div className="flex gap-3">
              <button className="rounded border border-border px-3 py-1" onClick={() => publishProduct.mutate(latestProductId)}>
                Publish
              </button>
              <button className="rounded border border-border px-3 py-1" onClick={() => unpublishProduct.mutate(latestProductId)}>
                Unpublish
              </button>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
