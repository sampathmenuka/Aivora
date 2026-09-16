"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Compass,
  Download,
  LayoutDashboard,
  Library,
  Receipt,
  ShoppingBag,
  Sparkles,
  Wallet,
} from "lucide-react";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { EmptyState, OrderCards, SegmentedTabs, Skeleton, Spinner, StatCard, StatusBadge } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useHashTab } from "@/hooks/useHashTab";
import { apiClient, Order, PurchaseProduct } from "@/lib/api";
import { downloadPurchase } from "@/lib/download";
import { formatDate, formatPrice } from "@/lib/format";
import { productTypeMeta } from "@/lib/product-types";

const TABS = ["overview", "orders", "library"] as const;
type Tab = (typeof TABS)[number];

export default function UserDashboardPage() {
  const [tab, setTab] = useHashTab(TABS, "overview");
  const { user } = useAuth();
  const { itemCount } = useCart();

  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await apiClient.getOrders()).data,
  });

  const purchasesQuery = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => (await apiClient.getPurchases()).data,
  });

  const downloadMutation = useMutation({
    mutationFn: ({ productId, title }: { productId: number; title: string }) => downloadPurchase(productId, title),
  });

  const orders = ordersQuery.data ?? [];
  const purchases = purchasesQuery.data ?? [];
  const paidOrders = orders.filter((o) => o.status === "PAID");
  const totalSpent = paidOrders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  const navItems: NavItem[] = [
    { label: "Overview", icon: LayoutDashboard, tab: "overview", section: "Dashboard" },
    { label: "Orders", icon: Receipt, tab: "orders", section: "Dashboard", count: orders.length },
    { label: "Library", icon: Library, tab: "library", section: "Dashboard", count: purchases.length },
    { label: "Explore products", icon: Compass, href: "/products", section: "Store" },
    { label: "Cart", icon: ShoppingBag, href: "/cart", section: "Store", count: itemCount },
  ];

  const download = (item: PurchaseProduct) => downloadMutation.mutate({ productId: item.productId, title: item.title });
  const downloadingId = downloadMutation.isPending ? downloadMutation.variables?.productId : undefined;

  return (
    <ProtectedRoute role="USER">
      <DashboardLayout
        title="My dashboard"
        subtitle="Orders, downloads and everything you own"
        navItems={navItems}
        activeTab={tab}
        onTabChange={(t) => setTab(t as Tab)}
        badgeColor="blue"
      >
        <div className="mb-6">
          <SegmentedTabs
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "orders", label: "Orders", count: orders.length },
              { id: "library", label: "Library", count: purchases.length },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>

        {tab === "overview" && (
          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-3xl bg-primary p-6 text-white sm:p-8">
              <div className="bg-dots absolute inset-0 opacity-20" />
              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80">
                    <Sparkles className="h-4 w-4" />
                    Welcome back
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{user?.email?.split("@")[0]}</h2>
                  <p className="mt-1 text-sm text-white/80">Pick up where you left off or discover something new.</p>
                </div>
                <Link href="/products" className="btn shrink-0 bg-white text-zinc-950 hover:bg-white/90">
                  Explore products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <StatCard label="Library" value={purchases.length} icon={Library} loading={purchasesQuery.isLoading} hint="Products you own" />
              <StatCard label="Orders" value={orders.length} icon={Receipt} tone="accent" loading={ordersQuery.isLoading} hint={`${paidOrders.length} paid`} />
              <StatCard label="In cart" value={itemCount} icon={ShoppingBag} tone="warning" hint="Ready for checkout" />
              <StatCard label="Total spent" value={formatPrice(totalSpent)} icon={Wallet} tone="success" loading={ordersQuery.isLoading} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="section-title">Recent orders</h2>
                  {orders.length > 0 && (
                    <button onClick={() => setTab("orders")} className="btn-ghost btn-sm">
                      View all <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <OrdersTable orders={orders.slice(0, 5)} loading={ordersQuery.isLoading} compact />
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="section-title">Jump back in</h2>
                  {purchases.length > 0 && (
                    <button onClick={() => setTab("library")} className="btn-ghost btn-sm">
                      Library <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {purchasesQuery.isLoading ? (
                  <Skeleton className="h-56 w-full rounded-2xl" />
                ) : purchases.length === 0 ? (
                  <EmptyState icon={Library} title="No products yet" description="Your purchases will appear here." />
                ) : (
                  <ul className="card divide-y divide-border p-2">
                    {purchases.slice(0, 5).map((item) => (
                      <LibraryRow key={item.productId} item={item} onDownload={download} downloading={downloadingId === item.productId} />
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}

        {tab === "orders" && <OrdersTable orders={orders} loading={ordersQuery.isLoading} />}

        {tab === "library" &&
          (purchasesQuery.isLoading ? (
            <Skeleton className="h-64 w-full rounded-2xl" />
          ) : purchases.length === 0 ? (
            <EmptyState
              icon={Library}
              title="Your library is empty"
              description="Buy a product and it will be ready to download here."
              action={<Link href="/products" className="btn-primary btn-sm">Explore products</Link>}
            />
          ) : (
            <ul className="card divide-y divide-border p-2">
              {purchases.map((item) => (
                <LibraryRow key={item.productId} item={item} onDownload={download} downloading={downloadingId === item.productId} />
              ))}
            </ul>
          ))}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function LibraryRow({
  item,
  onDownload,
  downloading,
}: {
  item: PurchaseProduct;
  onDownload: (item: PurchaseProduct) => void;
  downloading: boolean;
}) {
  const meta = productTypeMeta(item.productType);
  return (
    <li className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.cover} text-white`}>
        <meta.icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <Link href={`/products/${item.productId}`} className="line-clamp-1 text-sm font-semibold hover:text-primary">
          {item.title}
        </Link>
        <p className="text-xs text-muted-foreground">{meta.label}</p>
      </div>
      <button className="btn-secondary btn-sm" onClick={() => onDownload(item)} disabled={downloading}>
        {downloading ? <Spinner className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">Download</span>
      </button>
    </li>
  );
}

function OrdersTable({ orders, loading, compact = false }: { orders: Order[]; loading: boolean; compact?: boolean }) {
  if (loading) return <Skeleton className="h-56 w-full rounded-2xl" />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No orders yet"
        description="When you check out, your orders show up here."
        action={!compact && <Link href="/products" className="btn-primary btn-sm">Start shopping</Link>}
      />
    );
  }

  return (
    <>
    <OrderCards orders={orders} />
    <div className="table-wrap hidden sm:block">
      <table className="data-table">
        <thead>
          <tr>
            <th>Order</th>
            {!compact && <th>Items</th>}
            <th>Date</th>
            <th>Status</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderNumber}>
              <td className="font-mono text-xs font-semibold">#{order.orderNumber.slice(0, 8)}</td>
              {!compact && (
                <td className="max-w-xs">
                  <p className="line-clamp-1 text-sm">{order.products?.join(", ") || "—"}</p>
                </td>
              )}
              <td className="whitespace-nowrap text-muted-foreground">{formatDate(order.createdAt)}</td>
              <td><StatusBadge status={order.status} /></td>
              <td className="text-right font-semibold">{formatPrice(order.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}
