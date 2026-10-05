"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { Loader2, LucideIcon, Sparkles, Star } from "lucide-react";
import { cn, formatDate, formatPrice } from "@/lib/format";

/* ---------- Brand ---------- */

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/30 transition-transform duration-300 group-hover:rotate-6">
        <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="font-display text-lg font-extrabold tracking-tight">
          Digital<span className="text-primary">Store</span>
        </span>
      )}
    </Link>
  );
}

/* ---------- Feedback ---------- */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Spinner className="h-6 w-6 text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <p className="font-display text-base font-semibold">{title}</p>
        {description && <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ---------- Data display ---------- */

const STAT_TONES = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  accent: "bg-accent/10 text-accent",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
  loading,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: keyof typeof STAT_TONES;
  hint?: string;
  loading?: boolean;
}) {
  return (
    <div className="card relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", STAT_TONES[tone])}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <p className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</p>
      )}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const ORDER_STATUS: Record<string, string> = {
  PAID: "badge-green",
  COMPLETED: "badge-green",
  PENDING: "badge-yellow",
  FAILED: "badge-red",
  CANCELLED: "badge-gray",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={ORDER_STATUS[status] ?? "badge-gray"}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

type OrderLike = {
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  products?: string[];
  userEmail?: string;
};

// Phone-sized replacement for order tables: one card per order, no sideways scrolling
export function OrderCards({ orders, showCustomer = false }: { orders: OrderLike[]; showCustomer?: boolean }) {
  return (
    <ul className="space-y-3 sm:hidden">
      {orders.map((order) => (
        <li key={order.orderNumber} className="card space-y-2.5 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs font-semibold">#{order.orderNumber.slice(0, 8)}</span>
            <StatusBadge status={order.status} />
          </div>
          {order.products && order.products.length > 0 && (
            <p className="line-clamp-2 text-sm">{order.products.join(", ")}</p>
          )}
          <div className="flex items-end justify-between gap-3 border-t border-border pt-2.5">
            <div className="min-w-0 text-xs text-muted-foreground">
              <p>{formatDate(order.createdAt)}</p>
              {showCustomer && <p className="truncate">{order.userEmail ?? "—"}</p>}
            </div>
            <p className="font-display text-lg font-bold">{formatPrice(order.totalAmount)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {eyebrow && <p className="text-sm font-semibold text-primary">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- Inputs ---------- */

export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="scrollbar-none -mx-1 flex overflow-x-auto px-1">
      <div className="inline-flex gap-1 rounded-xl border border-border bg-muted/60 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all",
              value === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-px text-[11px] font-semibold",
                  value === tab.id ? "bg-primary/10 text-primary" : "bg-border/70",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StarRating({
  value,
  onChange,
  size = "sm",
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "lg";
}) {
  const iconSize = size === "lg" ? "h-7 w-7" : "h-4 w-4";

  return (
    <div className="flex items-center gap-0.5" role={onChange ? "radiogroup" : undefined} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value);
        const icon = (
          <Star
            className={cn(
              iconSize,
              "transition-colors",
              filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/40",
            )}
          />
        );
        return onChange ? (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onChange(star)}
            className="rounded transition-transform hover:scale-110"
          >
            {icon}
          </button>
        ) : (
          <span key={star}>{icon}</span>
        );
      })}
    </div>
  );
}
