"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const { cart, isLoadingCart, removeFromCart, clearCart } = useCart();

  return (
    <ProtectedRoute>
      <main className="container-page">
        <h1 className="mb-4 text-2xl font-bold">Cart</h1>

        {isLoadingCart && <p>Loading cart...</p>}

        {!isLoadingCart && (!cart?.items || cart.items.length === 0) && (
          <p className="text-muted-foreground">Your cart is empty.</p>
        )}

        <div className="space-y-3">
          {cart?.items?.map((item) => (
            <div key={item.productId} className="flex items-center justify-between rounded border border-border p-3">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p>${item.lineTotal.toFixed(2)}</p>
                <button className="text-sm text-red-500" onClick={() => removeFromCart(item.productId)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {cart?.items && cart.items.length > 0 && (
          <div className="mt-6 rounded border border-border p-4">
            <p className="mb-3 font-semibold">Total: ${cart.total.toFixed(2)}</p>
            <div className="flex gap-3">
              <button className="rounded border border-border px-4 py-2" onClick={() => clearCart()}>
                Clear Cart
              </button>
              <Link href="/checkout" className="rounded bg-foreground px-4 py-2 text-background">
                Checkout
              </Link>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
