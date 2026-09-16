"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Product } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/format";
import { productTypeMeta } from "@/lib/product-types";
import { Skeleton, Spinner } from "./ui";

export function ProductCover({ product, className = "" }: { product: Product; className?: string }) {
  const meta = productTypeMeta(product.productType);
  const Icon = meta.icon;

  if (product.thumbnailUrl) {
    return (
      <div className={`relative overflow-hidden bg-muted ${className}`}>
        <Image
          src={product.thumbnailUrl}
          alt={product.title}
          fill
          // SVG artwork is already resolution-independent; Next's optimizer rejects SVG by default
          unoptimized={product.thumbnailUrl.endsWith(".svg")}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }

  // Generated cover art so every product looks intentional, even without an image
  return (
    <div className={`relative overflow-hidden ${meta.cover} ${className}`}>
      <div className="bg-dots absolute inset-0 opacity-30 mix-blend-overlay" />
      <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
        <Icon className="h-8 w-8 self-end opacity-90 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.75} />
        <p className="line-clamp-2 font-display text-lg font-bold leading-snug drop-shadow-sm">{product.title}</p>
      </div>
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, addingProductId } = useCart();
  const [added, setAdded] = useState(false);
  const meta = productTypeMeta(product.productType);
  const isAdding = addingProductId === product.id;

  const onAdd = () =>
    addToCart(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => {
          setAdded(true);
          setTimeout(() => setAdded(false), 1800);
        },
      },
    );

  return (
    <article className="card-hover group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="relative">
        <ProductCover product={product} className="aspect-[4/3] w-full" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
          <meta.icon className="h-3 w-3" />
          {meta.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="line-clamp-1 font-display text-base font-bold">
          {/* Stretched link: the whole card opens the product */}
          <Link href={`/products/${product.id}`} className="after:absolute after:inset-0 after:content-['']">
            {product.title}
          </Link>
        </h3>
        <p className="line-clamp-2 flex-1 text-sm leading-6 text-muted-foreground">{product.description}</p>
        {product.sellerEmail && (
          <p className="truncate text-xs text-muted-foreground">by {product.sellerEmail.split("@")[0]}</p>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="font-display text-xl font-bold">{formatPrice(product.price)}</p>
          <button
            onClick={onAdd}
            disabled={isAdding}
            className={`relative z-10 btn-sm ${added ? "btn-success" : "btn-primary"}`}
            aria-label={`Add ${product.title} to cart`}
          >
            {isAdding ? <Spinner className="h-3.5 w-3.5" /> : added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {added ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}
