"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient, Product } from "@/lib/api";

const navItems: NavItem[] = [
  {
    href: "/dashboard/user",
    label: "Dashboard",
    section: "Overview",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/products",
    label: "Browse Products",
    section: "Store",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 9H4L5 9z" />
      </svg>
    ),
  },
  {
    href: "/cart",
    label: "My Cart",
    section: "Store",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: "/purchases",
    label: "My Purchases",
    section: "Store",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

type Tab = "overview" | "products" | "orders";

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="card-stat">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

export default function UserDashboardPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await apiClient.getPublicProducts()).data,
  });

  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await apiClient.getOrders()).data,
  });

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await apiClient.getCart()).data,
  });

  const purchasesQuery = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => (await apiClient.getPurchases()).data,
  });

  const addToCart = useMutation({
    mutationFn: apiClient.addToCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const downloadMutation = useMutation({
    mutationFn: async ({ productId, title }: { productId: number; title: string }) => {
      const res = await apiClient.download(productId);
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.bin`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "products", label: "Browse Products" },
    { id: "orders", label: "My Orders" },
  ];

  const cartCount = cartQuery.data?.items?.length ?? 0;
  const orderCount = (ordersQuery.data as unknown[])?.length ?? 0;
  const purchaseCount = purchasesQuery.data?.length ?? 0;
  const productCount = productsQuery.data?.length ?? 0;

  return (
    <ProtectedRoute role="USER">
      <DashboardLayout title="User Dashboard" navItems={navItems} badgeColor="blue">
        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-muted rounded-xl p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === t.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Available Products" value={productCount} color="text-primary" />
              <StatCard label="Cart Items" value={cartCount} color="text-yellow-500" />
              <StatCard label="Orders" value={orderCount} color="text-blue-500" />
              <StatCard label="Purchased Items" value={purchaseCount} color="text-green-500" />
            </div>

            {/* Quick actions */}
            <div>
              <h2 className="section-title mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Browse Products", href: "/products", desc: "Explore our digital catalog", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" },
                  { label: "View Cart", href: "/cart", desc: `${cartCount} item(s) ready for checkout`, color: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300" },
                  { label: "My Purchases", href: "/purchases", desc: "Download your files", color: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" },
                ].map((action) => (
                  <Link key={action.href} href={action.href} className="card hover:border-primary/50 transition-all group">
                    <div className={`inline-flex rounded-lg p-2.5 mb-3 ${action.color}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent purchases */}
            {purchasesQuery.data && purchasesQuery.data.length > 0 && (
              <div>
                <h2 className="section-title mb-4">Recent Downloads</h2>
                <div className="card p-0 overflow-hidden">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Type</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchasesQuery.data.slice(0, 5).map((item) => (
                        <tr key={item.productId}>
                          <td className="font-medium">{item.title}</td>
                          <td><span className="badge-blue">{item.productType}</span></td>
                          <td>
                            <button
                              className="btn-secondary btn btn-sm"
                              onClick={() => downloadMutation.mutate({ productId: item.productId, title: item.title })}
                              disabled={downloadMutation.isPending}
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {tab === "products" && (
          <div>
            <div className="section-header">
              <h2 className="section-title">Available Products</h2>
              <Link href="/products" className="btn-secondary btn btn-sm">View all</Link>
            </div>
            {productsQuery.isLoading && <p className="text-muted-foreground">Loading products…</p>}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {productsQuery.data?.map((product: Product) => (
                <div key={product.id} className="card flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{product.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{product.description}</p>
                    </div>
                    <span className="badge-blue ml-2 shrink-0">{product.productType}</span>
                  </div>
                  <p className="text-lg font-bold text-primary">${product.price?.toFixed(2)}</p>
                  <div className="flex gap-2 mt-auto">
                    <Link href={`/products/${product.id}`} className="btn-secondary btn btn-sm flex-1 justify-center">
                      View
                    </Link>
                    <button
                      className="btn-primary btn btn-sm flex-1"
                      onClick={() => addToCart.mutate({ productId: product.id, quantity: 1 })}
                      disabled={addToCart.isPending}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div>
            <div className="section-header">
              <h2 className="section-title">My Orders</h2>
            </div>
            {ordersQuery.isLoading && <p className="text-muted-foreground">Loading orders…</p>}
            {!ordersQuery.isLoading && (!ordersQuery.data || (ordersQuery.data as unknown[]).length === 0) && (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No orders yet.</p>
                <button onClick={() => setTab("products")} className="btn-primary btn btn-sm">Browse Products</button>
              </div>
            )}
            {(ordersQuery.data as { id: number; orderNumber: string; status: string; totalAmount: number; createdAt: string }[] | undefined)?.map((order) => (
              <div key={order.id} className="card mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Order #{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${order.status === "COMPLETED" ? "badge-green" : order.status === "PENDING" ? "badge-yellow" : "badge-gray"}`}>
                    {order.status}
                  </span>
                  <p className="font-semibold">${order.totalAmount?.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
