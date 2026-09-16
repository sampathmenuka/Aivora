"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, CheckCircle2, Library, Lock, ShieldCheck, ShoppingBag } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { EmptyState, Skeleton, Spinner } from "@/components/ui";
import { useCart } from "@/hooks/useCart";
import { apiClient } from "@/lib/api";
import { cn, formatPrice, getApiErrorMessage } from "@/lib/format";
import { stripePromise } from "@/lib/stripe";

type Step = "review" | "payment" | "done";

const STEPS: { id: Step; label: string }[] = [
  { id: "review", label: "Review" },
  { id: "payment", label: "Payment" },
  { id: "done", label: "Done" },
];

export default function CheckoutPage() {
  const { cart, isLoadingCart, itemCount } = useCart();
  const { resolvedTheme } = useTheme();
  const [step, setStep] = useState<Step>("review");
  const [clientSecret, setClientSecret] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  const paymentIntent = useMutation({
    mutationFn: () => apiClient.createPaymentIntent(),
    onSuccess: ({ data }) => {
      setClientSecret(data.clientSecret);
      setOrderNumber(data.orderNumber);
      setStep("payment");
    },
  });

  const items = cart?.items ?? [];
  const isDark = resolvedTheme === "dark";

  return (
    <ProtectedRoute>
      <main className="container-page max-w-6xl">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/cart" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to cart
            </Link>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Checkout</h1>
          </div>
          <Stepper current={step} />
        </div>

        {step === "done" ? (
          <SuccessPanel orderNumber={orderNumber} />
        ) : isLoadingCart ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
            <Skeleton className="h-80 w-full rounded-2xl" />
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        ) : items.length === 0 && step === "review" ? (
          <EmptyState
            icon={ShoppingBag}
            title="Nothing to check out"
            description="Your cart is empty. Add a product to continue."
            action={<Link href="/products" className="btn-primary btn-sm">Explore products</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
            <section className="card p-6 sm:p-8">
              {step === "review" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="section-title">Ready to pay?</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We&apos;ll reserve your order and open a secure Stripe payment form.
                    </p>
                  </div>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    <li className="flex items-center gap-3 rounded-2xl border border-border p-4 text-sm">
                      <Lock className="h-5 w-5 text-primary" />
                      Encrypted card payment
                    </li>
                    <li className="flex items-center gap-3 rounded-2xl border border-border p-4 text-sm">
                      <Library className="h-5 w-5 text-primary" />
                      Files added to your library
                    </li>
                  </ul>
                  {paymentIntent.isError && (
                    <div className="alert-error">
                      {getApiErrorMessage(paymentIntent.error, "Could not start payment. Please try again.")}
                    </div>
                  )}
                  <button
                    className="btn-primary btn-lg btn-full"
                    onClick={() => paymentIntent.mutate()}
                    disabled={itemCount === 0 || paymentIntent.isPending}
                  >
                    {paymentIntent.isPending ? <Spinner /> : <Lock className="h-4 w-4" />}
                    {paymentIntent.isPending ? "Preparing secure payment…" : `Continue to payment · ${formatPrice(cart?.total)}`}
                  </button>
                </div>
              )}

              {step === "payment" && clientSecret && stripePromise && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: isDark ? "night" : "stripe",
                      variables: {
                        colorPrimary: isDark ? "#8b72ff" : "#5b3df5",
                        borderRadius: "12px",
                        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                      },
                    },
                  }}
                >
                  <PaymentForm amount={cart?.total} onPaid={() => setStep("done")} />
                </Elements>
              )}

              {step === "payment" && !stripePromise && (
                <div className="alert-warning">
                  Stripe is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to the frontend environment.
                </div>
              )}
            </section>

            <OrderSummary items={items} total={cart?.total} orderNumber={orderNumber} />
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}

function PaymentForm({ amount, onPaid }: { amount?: number; onPaid: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setMessage("");
    const result = await stripe.confirmPayment({ elements, redirect: "if_required" });
    setSubmitting(false);

    if (result.error) {
      setMessage(result.error.message || "Payment failed. Please try another card.");
      return;
    }

    // The order already exists; the Stripe webhook marks it PAID and clears purchased cart items
    queryClient.invalidateQueries({ queryKey: ["cart"] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    onPaid();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <h2 className="section-title">Payment details</h2>
        <p className="mt-1 text-sm text-muted-foreground">All transactions are secure and encrypted.</p>
      </div>
      <PaymentElement />
      {message && <div className="alert-error">{message}</div>}
      <button className="btn-primary btn-lg btn-full" disabled={!stripe || submitting}>
        {submitting ? <Spinner /> : <Lock className="h-4 w-4" />}
        {submitting ? "Processing…" : `Pay ${formatPrice(amount)}`}
      </button>
    </form>
  );
}

function OrderSummary({
  items,
  total,
  orderNumber,
}: {
  items: { productId: number; title: string; quantity: number; lineTotal: number }[];
  total?: number;
  orderNumber: string;
}) {
  return (
    <aside className="card space-y-5 p-6 lg:sticky lg:top-24">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Order summary</h2>
        {orderNumber && <span className="badge-gray font-mono">#{orderNumber.slice(0, 8)}</span>}
      </div>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.productId} className="flex items-start justify-between gap-3 py-3 text-sm first:pt-0">
            <div className="min-w-0">
              <p className="line-clamp-1 font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
            </div>
            <p className="shrink-0 font-semibold">{formatPrice(item.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <div className="flex items-baseline justify-between border-t border-border pt-4">
        <p className="font-semibold">Total</p>
        <p className="font-display text-2xl font-extrabold">{formatPrice(total)}</p>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-success" />
        Secured by Stripe. We never store your card details.
      </p>
    </aside>
  );
}

function SuccessPanel({ orderNumber }: { orderNumber: string }) {
  return (
    <div className="card mx-auto max-w-lg animate-fade-up p-8 text-center sm:p-10">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="h-9 w-9" />
      </span>
      <h2 className="mt-6 font-display text-2xl font-bold">Payment successful</h2>
      <p className="mt-2 text-muted-foreground">
        Thanks for your purchase! Order <span className="font-mono font-semibold text-foreground">#{orderNumber.slice(0, 8)}</span> is
        being confirmed and will appear in your library in a moment.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/purchases" className="btn-primary">
          <Library className="h-4 w-4" />
          Go to my library
        </Link>
        <Link href="/products" className="btn-secondary">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}

function Stepper({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((step, i) => {
        const done = i < currentIndex || current === "done";
        const active = i === currentIndex && current !== "done";
        return (
          <li key={step.id} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                done && "bg-success text-white",
                active && "bg-primary text-primary-foreground ring-4 ring-primary/15",
                !done && !active && "bg-muted text-muted-foreground",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={cn("text-sm font-medium", active ? "text-foreground" : "hidden text-muted-foreground sm:inline")}>{step.label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-5 bg-border sm:w-10" />}
          </li>
        );
      })}
    </ol>
  );
}
