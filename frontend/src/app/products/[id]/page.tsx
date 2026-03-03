"use client";

import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { authStore } from "@/lib/auth";
import { useCart } from "@/hooks/useCart";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const { addToCart } = useCart();

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await apiClient.getPublicProducts()).data,
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => (await apiClient.getReviews(productId)).data,
    enabled: Number.isFinite(productId),
  });

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const reviewMutation = useMutation({
    mutationFn: (payload: { rating: number; comment: string }) => apiClient.addReview(productId, payload),
    onSuccess: () => reviewsQuery.refetch(),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: () => apiClient.deleteReview(productId),
    onSuccess: () => reviewsQuery.refetch(),
  });

  const currentUser = authStore.getUser();

  const product = useMemo(
    () => productsQuery.data?.find((item) => item.id === productId),
    [productsQuery.data, productId],
  );

  if (productsQuery.isLoading) return <main className="container-page">Loading product...</main>;
  if (!product) return <main className="container-page">Product not found.</main>;

  const isEbook = product.productType === "EBOOK";
  const isCourse = product.productType === "COURSE";

  const onSubmitReview = (event: FormEvent) => {
    event.preventDefault();
    reviewMutation.mutate({ rating, comment });
  };

  return (
    <main className="container-page">
      <h1 className="mb-2 text-3xl font-bold">{product.title}</h1>
      <p className="mb-4 text-muted-foreground">{product.description}</p>
      <p className="mb-4 font-semibold">${product.price.toFixed(2)}</p>

      <button
        onClick={() => addToCart({ productId: product.id, quantity: 1 })}
        className="mb-6 rounded bg-foreground px-4 py-2 text-background"
      >
        Add to cart
      </button>

      {isEbook && product.previewUrl && (
        <section className="mb-8 rounded border border-border p-4">
          <h2 className="mb-3 text-xl font-semibold">Ebook Preview</h2>
          <Document file={product.previewUrl}>
            <Page pageNumber={1} width={600} />
          </Document>
        </section>
      )}

      {isCourse && product.previewUrl && (
        <section className="mb-8 rounded border border-border p-4">
          <h2 className="mb-3 text-xl font-semibold">Course Preview</h2>
          <video controls className="w-full rounded" src={product.previewUrl} />
        </section>
      )}

      <section className="rounded border border-border p-4">
        <h2 className="mb-3 text-xl font-semibold">Reviews</h2>

        <form onSubmit={onSubmitReview} className="mb-4 space-y-2">
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-24 rounded border border-border px-2 py-1"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review"
            className="w-full rounded border border-border px-3 py-2"
            required
          />
          <button className="rounded border border-border px-3 py-1" disabled={reviewMutation.isPending}>
            Submit Review
          </button>
        </form>

        <div className="space-y-3">
          {reviewsQuery.data?.map((review) => (
            <div key={review.id} className="rounded border border-border p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="font-medium">{review.userEmail}</p>
                {currentUser?.email === review.userEmail && (
                  <button
                    className="rounded border border-border px-2 py-1 text-xs"
                    onClick={() => deleteReviewMutation.mutate()}
                    disabled={deleteReviewMutation.isPending}
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-sm">Rating: {review.rating}/5</p>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
