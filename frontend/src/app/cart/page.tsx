"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Lock, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ProductCover } from "@/components/ProductCard";
import { EmptyState, PageHeader, Skeleton, Spinner } from "@/components/ui";
import { useCart } from "@/hooks/useCart";
import { apiClient, Product } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { productTypeMeta } from "@/lib/product-types";

const MAX_QUANTITY = 99;

export default function CartPage() {
  const {
    cart,
    itemCount,
    isLoadingCart,
    updateQuantity,
    updatingProductId,
    removeFromCart,
    removingProductId,
    clearCart,
    isClearing,
  } = useCart();

  // Cart items only carry id/title/price; join with the catalog for cover art and type
  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await apiClient.getPublicProducts()).data,
  });
  const productById = new Map((productsQuery.data ?? []).map((p) => [p.id, p]));

  const items = cart?.items ?? [];

  return (
    <ProtectedRoute>
      <main className="container-page">
        <PageHeader
          eyebrow="Cart"
          title="Your cart"
          description={itemCount > 0 ? `${itemCount} item${itemCount === 1 ? "" : "s"} ready for checkout.` : undefined}
          actions={
            items.length > 0 && (
              <button
                className="btn-ghost btn-sm hover:text-danger"
                onClick={() => {
                  if (confirm("Remove all items from your cart?")) clearCart();
                }}
                disabled={isClearing}
              >
                {isClearing ? <Spinner className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                Clear cart
              </button>
            )
          }
        />

        {isLoadingCart ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
            </div>
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Find something you love — ebooks, courses and files are waiting."
            action={
              <Link href="/products" className="btn-primary">
                Explore products
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
            <ul className="space-y-4">
              {items.map((item) => {
                const product: Product = productById.get(item.productId) ?? {
                  id: item.productId,
                  title: item.title,
                  description: "",
                  price: item.price,
                  productType: "DIGITAL_FILE",
                };
                const meta = productTypeMeta(product.productType);
                const busy = updatingProductId === item.productId || removingProductId === item.productId;

                return (
                  <li key={item.productId} className={`card flex gap-4 p-4 transition-opacity sm:gap-5 ${busy ? "opacity-60" : ""}`}>
                    <Link href={`/products/${item.productId}`} className="group shrink-0 overflow-hidden rounded-xl">
                      <ProductCover product={product} className="h-20 w-20 sm:h-28 sm:w-36 [&_p]:hidden" />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={`/products/${item.productId}`} className="line-clamp-1 font-display font-bold hover:text-primary">
                            {item.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {meta.label} · {formatPrice(item.price)} each
                          </p>
                        </div>
                        <p className="shrink-0 font-display text-lg font-bold">{formatPrice(item.lineTotal)}</p>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-xl border border-border bg-background">
                          <button
                            className="btn-icon btn-ghost h-9 w-9 rounded-r-none"
                            onClick={() => updateQuantity({ productId: item.productId, quantity: item.quantity - 1 })}
                            disabled={busy || item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                            {updatingProductId === item.productId ? <Spinner className="mx-auto h-3.5 w-3.5" /> : item.quantity}
                          </span>
                          <button
                            className="btn-icon btn-ghost h-9 w-9 rounded-l-none"
                            onClick={() => updateQuantity({ productId: item.productId, quantity: item.quantity + 1 })}
                            disabled={busy || item.quantity >= MAX_QUANTITY}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          className="btn-ghost btn-sm hover:text-danger"
                          onClick={() => removeFromCart(item.productId)}
                          aria-label={`Remove ${item.title}`}
                          disabled={busy}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden min-[400px]:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <aside className="card space-y-5 p-6 lg:sticky lg:top-24">
              <h2 className="section-title">Order summary</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})</dt>
                  <dd className="font-medium">{formatPrice(cart?.total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="font-medium text-success">Instant · Free</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-border pt-4">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-display text-3xl font-extrabold">{formatPrice(cart?.total)}</dd>
                </div>
              </dl>
              <Link href="/checkout" className="btn-primary btn-lg btn-full">
                <Lock className="h-4 w-4" />
                Checkout securely
              </Link>
              <Link href="/products" className="btn-ghost btn-full">
                Continue shopping
              </Link>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Payments are processed securely by Stripe
              </p>
            </aside>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
