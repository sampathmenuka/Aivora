"use client";

import { useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCart } from "@/hooks/useCart";
import { apiClient } from "@/lib/api";
import { stripePromise } from "@/lib/stripe";

function CheckoutForm({ orderNumber }: { orderNumber: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setSubmitting(true);
    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    setSubmitting(false);

    if (result.error) {
      setMessage(result.error.message || "Payment failed");
      return;
    }

    // The order already exists; the Stripe webhook marks it PAID and clears the purchased cart items.
    setMessage(`Payment successful. Order #${orderNumber} will be confirmed shortly.`);
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded border border-border p-4">
      <PaymentElement />
      <button
        className="rounded bg-foreground px-4 py-2 text-background"
        disabled={!stripe || submitting}
      >
        {submitting ? "Processing..." : "Pay Now"}
      </button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}

export default function CheckoutPage() {
  const { cart } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  const cartIsEmpty = (cart?.items?.length ?? 0) === 0;

  const paymentIntent = useMutation({
    mutationFn: () => apiClient.createPaymentIntent(),
    onSuccess: ({ data }) => {
      setClientSecret(data.clientSecret);
      setOrderNumber(data.orderNumber);
    },
  });

  return (
    <ProtectedRoute>
      <main className="container-page max-w-xl">
        <h1 className="mb-4 text-2xl font-bold">Checkout</h1>

        {!clientSecret && (
          <button
            className="rounded bg-foreground px-4 py-2 text-background"
            onClick={() => paymentIntent.mutate()}
            disabled={cartIsEmpty || paymentIntent.isPending}
          >
            {paymentIntent.isPending ? "Preparing payment..." : "Start Payment"}
          </button>
        )}

        {paymentIntent.isError && (
          <p className="mt-2 text-sm text-red-500">Could not start payment. Please try again.</p>
        )}

        {clientSecret && stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm orderNumber={orderNumber} />
          </Elements>
        )}

        {clientSecret && !stripePromise && (
          <p className="text-sm text-red-500">Stripe key missing. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.</p>
        )}
      </main>
    </ProtectedRoute>
  );
}
