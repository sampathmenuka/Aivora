"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/api";
import { useCart } from "@/hooks/useCart";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { addToCart, isAdding } = useCart();

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="relative mb-3 h-44 w-full overflow-hidden rounded bg-muted">
        {product.thumbnailUrl ? (
          <Image src={product.thumbnailUrl} alt={product.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No thumbnail
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold">{product.title}</h3>
      <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
      <p className="mb-3 text-sm">Type: {product.productType}</p>
      <p className="mb-3 font-semibold">${product.price?.toFixed(2)}</p>
      <div className="flex items-center gap-2">
        <Link href={`/products/${product.id}`} className="rounded border border-border px-3 py-1 text-sm">
          View
        </Link>
        <button
          onClick={() => addToCart({ productId: product.id, quantity: 1 })}
          className="rounded bg-foreground px-3 py-1 text-sm text-background"
          disabled={isAdding}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
