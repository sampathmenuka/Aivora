"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/api";
import { useCart } from "@/hooks/useCart";

type Props = {
  product: Product;
};

const TYPE_COLORS: Record<string, string> = {
  EBOOK: "badge-blue",
  COURSE: "badge-green",
  DIGITAL_FILE: "badge-gray",
};

export default function ProductCard({ product }: Props) {
  const { addToCart, isAdding } = useCart();

  return (
    <div className="card flex flex-col gap-0 p-0 overflow-hidden group">
      {/* Thumbnail */}
      <div className="relative h-44 w-full overflow-hidden bg-muted">
        {product.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className={TYPE_COLORS[product.productType] ?? "badge-gray"}>{product.productType}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold leading-snug line-clamp-1">{product.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{product.description}</p>
        <p className="text-xl font-bold text-primary">${product.price?.toFixed(2)}</p>

        <div className="flex items-center gap-2 mt-1">
          <Link
            href={`/products/${product.id}`}
            className="btn-secondary btn btn-sm flex-1 justify-center"
          >
            View details
          </Link>
          <button
            onClick={() => addToCart({ productId: product.id, quantity: 1 })}
            className="btn-primary btn btn-sm flex-1"
            disabled={isAdding}
          >
            {isAdding ? (
              <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            ) : null}
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
