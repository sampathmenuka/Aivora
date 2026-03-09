"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const { cart, isLoadingCart, removeFromCart, clearCart } = useCart();

  const itemCount = cart?.items?.length ?? 0;

  return (
    <ProtectedRoute>
      <main className="container-page max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Shopping Cart</h1>
          <p className="text-muted-foreground">{itemCount} item{itemCount !== 1 ? "s" : ""} in your cart</p>
        </div>

        {isLoadingCart && (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        )}

        {!isLoadingCart && itemCount === 0 && (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>Your cart is empty.</p>
            <Link href="/products" className="btn-primary btn btn-sm">Browse products</Link>
          </div>
        )}

        {itemCount > 0 && (
          <div className="space-y-3 mb-6">
            {cart?.items?.map((item) => (
              <div key={item.productId} className="card flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.title}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <p className="font-bold text-primary">${item.lineTotal.toFixed(2)}</p>
                  <button
                    className="text-danger hover:opacity-70 transition-opacity"
                    onClick={() => removeFromCart(item.productId)}
                    title="Remove item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {itemCount > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">Subtotal</p>
              <p className="font-semibold">${cart!.total.toFixed(2)}</p>
            </div>
            <div className="border-t border-border pt-4 flex items-center justify-between">
              <p className="text-lg font-bold">Total</p>
              <p className="text-2xl font-bold text-primary">${cart!.total.toFixed(2)}</p>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                className="btn-secondary btn"
                onClick={() => clearCart()}
              >
                Clear cart
              </button>
              <Link href="/checkout" className="btn-primary btn flex-1 justify-center">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}

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
