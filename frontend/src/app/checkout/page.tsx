"use client";

import { useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useMutation } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCart } from "@/hooks/useCart";
import { apiClient } from "@/lib/api";
import { stripePromise } from "@/lib/stripe";

function CheckoutForm({
  clientSecret,
  productIds,
}: {
  clientSecret: string;
  productIds: number[];
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");

  const createOrder = useMutation({
    mutationFn: () => apiClient.createOrder({ productIds }),
  });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      setMessage(result.error.message || "Payment failed");
      return;
    }

    await createOrder.mutateAsync();
    setMessage("Payment successful and order created.");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded border border-border p-4">
      <PaymentElement />
      <button className="rounded bg-foreground px-4 py-2 text-background">Pay Now</button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}

export default function CheckoutPage() {
  const { cart } = useCart();
  const [clientSecret, setClientSecret] = useState("");

  const productIds = useMemo(() => cart?.items?.map((item) => item.productId) ?? [], [cart?.items]);

  const paymentIntent = useMutation({
    mutationFn: () => apiClient.createPaymentIntent({ productIds }),
    onSuccess: ({ data }) => setClientSecret(data.clientSecret),
  });

  return (
    <ProtectedRoute>
      <main className="container-page max-w-xl">
        <h1 className="mb-4 text-2xl font-bold">Checkout</h1>

        {!clientSecret && (
          <button
            className="rounded bg-foreground px-4 py-2 text-background"
            onClick={() => paymentIntent.mutate()}
            disabled={productIds.length === 0 || paymentIntent.isPending}
          >
            {paymentIntent.isPending ? "Preparing payment..." : "Start Payment"}
          </button>
        )}

        {clientSecret && stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm clientSecret={clientSecret} productIds={productIds} />
          </Elements>
        )}

        {clientSecret && !stripePromise && (
          <p className="text-sm text-red-500">Stripe key missing. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.</p>
        )}
      </main>
    </ProtectedRoute>
  );
}
