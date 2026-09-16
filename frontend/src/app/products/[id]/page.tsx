"use client";

import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Download,
  Infinity as InfinityIcon,
  MessageSquare,
  PackageX,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  UserRound,
  Zap,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { ProductCover } from "@/components/ProductCard";
import { EmptyState, PageLoader, SegmentedTabs, Skeleton, Spinner, StarRating } from "@/components/ui";
import { cn, formatDate, formatPrice, getApiErrorMessage, initials } from "@/lib/format";
import { productTypeMeta } from "@/lib/product-types";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Tab = "overview" | "preview" | "reviews";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { cart, addToCart, addingProductId } = useCart();
  const [tab, setTab] = useState<Tab>("overview");
  const [justAdded, setJustAdded] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await apiClient.getPublicProducts()).data,
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => (await apiClient.getReviews(productId)).data,
    enabled: Number.isFinite(productId),
  });

  const product = useMemo(
    () => productsQuery.data?.find((item) => item.id === productId),
    [productsQuery.data, productId],
  );

  const productLoaded = Boolean(product);
  useEffect(() => {
    const buy = buyRef.current;
    const footer = document.querySelector("footer");
    if (!buy) return;

    let buyAboveViewport = false;
    let footerVisible = false;
    const update = () => setShowBar(buyAboveViewport && !footerVisible);

    const buyObserver = new IntersectionObserver(([entry]) => {
      buyAboveViewport = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      update();
    });
    const footerObserver = new IntersectionObserver(([entry]) => {
      footerVisible = entry.isIntersecting;
      update();
    });
    buyObserver.observe(buy);
    if (footer) footerObserver.observe(footer);
    return () => {
      buyObserver.disconnect();
      footerObserver.disconnect();
    };
  }, [productLoaded]);

  if (productsQuery.isLoading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <main className="container-page">
        <EmptyState
          icon={PackageX}
          title="Product not found"
          description="It may have been unpublished or removed by the creator."
          action={<Link href="/products" className="btn-primary btn-sm">Back to products</Link>}
        />
      </main>
    );
  }

  const meta = productTypeMeta(product.productType);
  const reviews = reviewsQuery.data ?? [];
  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const hasPreview = Boolean(product.previewUrl) && (product.productType === "EBOOK" || product.productType === "COURSE");
  const inCart = cart?.items?.some((item) => item.productId === product.id) ?? false;
  const isAdding = addingProductId === product.id;

  const onAdd = () =>
    addToCart(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => {
          setJustAdded(true);
          setTimeout(() => setJustAdded(false), 2000);
        },
      },
    );

  const onBuyNow = () => {
    if (inCart) router.push("/checkout");
    else addToCart({ productId: product.id, quantity: 1 }, { onSuccess: () => router.push("/checkout") });
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    ...(hasPreview ? [{ id: "preview" as Tab, label: "Preview" }] : []),
    { id: "reviews", label: "Reviews", count: reviews.length },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/products" className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Explore
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/products?type=${product.productType}`} className="hover:text-foreground">
          {meta.label}s
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">{product.title}</span>
      </nav>

      {/* Phones: cover, purchase panel, details. Desktop: cover + details left, sticky panel right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr] lg:gap-x-10 lg:gap-y-8">
        <div className="group order-1 min-w-0 overflow-hidden rounded-3xl border border-border shadow-soft lg:col-start-1 lg:row-start-1">
          <ProductCover product={product} className="aspect-[16/10] w-full" />
        </div>

        <div className="order-3 min-w-0 space-y-8 lg:col-start-1 lg:row-start-2">
          <SegmentedTabs tabs={tabs} value={tab} onChange={setTab} />

          {tab === "overview" && (
            <section className="animate-fade-in space-y-6">
              <div>
                <h2 className="section-title mb-3">About this {meta.label.toLowerCase()}</h2>
                <p className="whitespace-pre-line leading-8 text-muted-foreground">{product.description}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Zap, title: "Instant access", text: "Download right after payment" },
                  { icon: InfinityIcon, title: "Yours forever", text: "Re-download any time" },
                  { icon: ShieldCheck, title: "Secure checkout", text: "Processed by Stripe" },
                ].map((perk) => (
                  <div key={perk.title} className="rounded-2xl border border-border bg-card p-4">
                    <perk.icon className="mb-2 h-5 w-5 text-primary" />
                    <p className="text-sm font-semibold">{perk.title}</p>
                    <p className="text-xs text-muted-foreground">{perk.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === "preview" && product.previewUrl && (
            <section className="animate-fade-in card overflow-hidden p-4">
              {product.productType === "COURSE" ? (
                <video controls className="w-full rounded-xl bg-black" src={product.previewUrl} />
              ) : (
                <PdfPreview url={product.previewUrl} />
              )}
            </section>
          )}

          {tab === "reviews" && (
            <ReviewsSection
              productId={productId}
              reviews={reviews}
              average={average}
              isLoading={reviewsQuery.isLoading}
              onChanged={() => reviewsQuery.refetch()}
              currentEmail={user?.email}
              isAuthenticated={isAuthenticated}
            />
          )}
        </div>

        {/* Right: purchase panel */}
        <aside className="order-2 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div className="card space-y-6 p-6">
            <div className="space-y-3">
              <span className={meta.badge}>
                <meta.icon className="h-3 w-3" />
                {meta.label}
              </span>
              <h1 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{product.title}</h1>
              <button onClick={() => setTab("reviews")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <StarRating value={average} />
                {reviews.length > 0 ? `${average.toFixed(1)} · ${reviews.length} review${reviews.length === 1 ? "" : "s"}` : "No reviews yet"}
              </button>
            </div>

            <p className="font-display text-4xl font-extrabold tracking-tight">{formatPrice(product.price)}</p>

            <div ref={buyRef} className="space-y-2.5">
              <button onClick={onBuyNow} disabled={isAdding} className="btn-primary btn-lg btn-full">
                {isAdding ? <Spinner /> : <Zap className="h-4 w-4" />}
                Buy now
              </button>
              <button onClick={onAdd} disabled={isAdding} className={cn("btn-lg btn-full", justAdded ? "btn-success" : "btn-secondary")}>
                {justAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                {justAdded ? "Added to cart" : inCart ? "Add another" : "Add to cart"}
              </button>
              {inCart && !justAdded && (
                <Link href="/cart" className="block text-center text-sm font-medium text-primary hover:underline">
                  In your cart — view cart
                </Link>
              )}
            </div>

            <ul className="space-y-2.5 border-t border-border pt-5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2.5"><Download className="h-4 w-4 text-success" />Instant digital download</li>
              <li className="flex items-center gap-2.5"><InfinityIcon className="h-4 w-4 text-success" />Lifetime access in your library</li>
              <li className="flex items-center gap-2.5"><ShieldCheck className="h-4 w-4 text-success" />Secure payment with Stripe</li>
            </ul>

            {product.sellerEmail && (
              <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {initials(product.sellerEmail)}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Created by</p>
                  <p className="truncate text-sm font-semibold">{product.sellerEmail.split("@")[0]}</p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Phones: sticky purchase bar once the main buttons have scrolled away */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-background/90 px-4 pt-3 backdrop-blur-xl transition-transform duration-300 md:bottom-0 lg:hidden",
          "pb-3 md:pb-[calc(env(safe-area-inset-bottom)+0.75rem)]",
          showBar ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!showBar}
      >
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{product.title}</p>
            <p className="font-display text-xl font-bold">{formatPrice(product.price)}</p>
          </div>
          <button
            onClick={onAdd}
            disabled={isAdding}
            className={cn("btn-icon h-11 w-11", justAdded ? "btn-success" : "btn-secondary")}
            aria-label="Add to cart"
            tabIndex={showBar ? 0 : -1}
          >
            {justAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          </button>
          <button onClick={onBuyNow} disabled={isAdding} className="btn-primary h-11 px-6" tabIndex={showBar ? 0 : -1}>
            {isAdding ? <Spinner /> : <Zap className="h-4 w-4" />}
            Buy now
          </button>
        </div>
      </div>
    </main>
  );
}

function PdfPreview({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.min(entry.contentRect.width, 820)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="flex justify-center overflow-hidden rounded-xl bg-muted/50">
      <Document file={url} loading={<PageLoader label="Loading preview…" />} error={<p className="p-8 text-sm text-muted-foreground">Preview unavailable.</p>}>
        <Page pageNumber={1} width={width} />
      </Document>
    </div>
  );
}

function ReviewsSection({
  productId,
  reviews,
  average,
  isLoading,
  onChanged,
  currentEmail,
  isAuthenticated,
}: {
  productId: number;
  reviews: { id: number; rating: number; comment: string; userEmail: string; createdAt: string }[];
  average: number;
  isLoading: boolean;
  onChanged: () => void;
  currentEmail?: string;
  isAuthenticated: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const reviewMutation = useMutation({
    mutationFn: (payload: { rating: number; comment: string }) => apiClient.addReview(productId, payload),
    onSuccess: () => {
      setComment("");
      onChanged();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.deleteReview(productId),
    onSuccess: onChanged,
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    reviewMutation.mutate({ rating, comment });
  };

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <section className="animate-fade-in space-y-6">
      <div className="grid grid-cols-1 gap-6 rounded-3xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="text-center sm:pr-6">
          <p className="font-display text-5xl font-extrabold">{reviews.length ? average.toFixed(1) : "—"}</p>
          <div className="mt-2 flex justify-center"><StarRating value={average} /></div>
          <p className="mt-1 text-xs text-muted-foreground">{reviews.length} review{reviews.length === 1 ? "" : "s"}</p>
        </div>
        <div className="space-y-1.5">
          {distribution.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="w-3 text-muted-foreground">{star}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-6 text-right text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {isAuthenticated ? (
        <form onSubmit={onSubmit} className="card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display font-semibold">Write a review</p>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you think? Reviews are open to verified buyers."
            className="input min-h-[110px] resize-y"
            required
          />
          {reviewMutation.isError && (
            <div className="alert-error">{getApiErrorMessage(reviewMutation.error, "Could not submit your review.")}</div>
          )}
          <div className="flex justify-end">
            <button className="btn-primary" disabled={reviewMutation.isPending}>
              {reviewMutation.isPending && <Spinner />}
              Post review
            </button>
          </div>
        </form>
      ) : (
        <div className="alert-info">
          <MessageSquare className="h-4 w-4 shrink-0" />
          <span>
            <Link href="/auth/login" className="font-semibold underline">Sign in</Link> to review a product you&apos;ve purchased.
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No reviews yet" description="Buyers will share their thoughts here." />
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {review.userEmail ? initials(review.userEmail) : <UserRound className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{review.userEmail?.split("@")[0]}</p>
                    <div className="flex items-center gap-2">
                      <StarRating value={review.rating} />
                      <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {currentEmail === review.userEmail && (
                  <button
                    className="btn-icon btn-ghost h-8 w-8 hover:text-danger"
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    aria-label="Delete your review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ProductDetailSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-4 w-60" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.45fr_1fr]">
        <Skeleton className="aspect-[16/10] w-full rounded-3xl" />
        <div className="card space-y-4 p-6">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </main>
  );
}
