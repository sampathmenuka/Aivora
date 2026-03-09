"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";

const navItems: NavItem[] = [
  {
    href: "/dashboard/admin",
    label: "Dashboard",
    section: "Overview",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/dashboard/admin#users",
    label: "Manage Users",
    section: "Management",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/admin#products",
    label: "Manage Products",
    section: "Management",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/admin#orders",
    label: "View Orders",
    section: "Management",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

type Tab = "overview" | "users" | "products" | "orders";

function StatCard({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="card-stat">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [userSearch, setUserSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      try { return (await apiClient.adminGetStats()).data; }
      catch { return { totalUsers: 0, totalSellers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 }; }
    },
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await apiClient.adminGetUsers()).data,
    enabled: tab === "users" || tab === "overview",
  });

  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await apiClient.adminGetProducts()).data,
    enabled: tab === "products" || tab === "overview",
  });

  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      try { return (await apiClient.adminGetOrders()).data; }
      catch { return []; }
    },
    enabled: tab === "orders",
  });

  // Mutations
  const deleteUserMutation = useMutation({
    mutationFn: apiClient.adminDeleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const toggleUserMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) => apiClient.adminToggleUser(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteProductMutation = useMutation({
    mutationFn: apiClient.adminDeleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const publishProductMutation = useMutation({
    mutationFn: apiClient.adminPublishProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const unpublishProductMutation = useMutation({
    mutationFn: apiClient.adminUnpublishProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const stats = statsQuery.data;
  const users = usersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const orders = (ordersQuery.data as { id: number; orderNumber: string; userEmail: string; status: string; totalAmount: number; createdAt: string }[] | undefined) ?? [];

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sellerEmail ?? "").toLowerCase().includes(productSearch.toLowerCase()),
  );

  const sellers = users.filter((u) => u.role === "SELLER");
  const regularUsers = users.filter((u) => u.role === "USER");

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "products", label: "Products" },
    { id: "orders", label: "Orders" },
  ];

  return (
    <ProtectedRoute role="ADMIN">
      <DashboardLayout title="Admin Panel" navItems={navItems} badgeColor="red">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-xl p-1 w-fit flex-wrap">
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

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard label="Total Users" value={stats?.totalUsers ?? regularUsers.length} color="text-primary" />
              <StatCard label="Sellers" value={stats?.totalSellers ?? sellers.length} color="text-yellow-500" />
              <StatCard label="Products" value={stats?.totalProducts ?? products.length} color="text-blue-500" />
              <StatCard label="Orders" value={stats?.totalOrders ?? 0} color="text-purple-500" />
              <StatCard label="Revenue" value={`$${(stats?.totalRevenue ?? 0).toFixed(2)}`} color="text-emerald-500" />
            </div>

            {/* Quick nav cards */}
            <div>
              <h2 className="section-title mb-4">Administration</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Manage Users", id: "users" as Tab, desc: `${regularUsers.length} customers, ${sellers.length} sellers`, color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300" },
                  { label: "Manage Products", id: "products" as Tab, desc: `${products.length} total products`, color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300" },
                  { label: "View Orders", id: "orders" as Tab, desc: "Review all platform orders", color: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300" },
                ].map((a) => (
                  <button key={a.id} onClick={() => setTab(a.id)} className="card text-left hover:border-primary/50 group">
                    <div className={`inline-flex rounded-lg p-2.5 mb-3 ${a.color}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">{a.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent users */}
            {users.length > 0 && (
              <div>
                <div className="section-header">
                  <h2 className="section-title">Recent Users</h2>
                  <button onClick={() => setTab("users")} className="btn-secondary btn btn-sm">View all</button>
                </div>
                <div className="card p-0 overflow-hidden">
                  <table className="data-table">
                    <thead><tr><th>Email</th><th>Role</th><th>Status</th></tr></thead>
                    <tbody>
                      {users.slice(0, 5).map((u) => (
                        <tr key={u.id}>
                          <td className="font-medium">{u.email}</td>
                          <td>
                            <span className={u.role === "ADMIN" ? "badge-red" : u.role === "SELLER" ? "badge-yellow" : "badge-blue"}>
                              {u.role}
                            </span>
                          </td>
                          <td><span className={u.enabled ? "badge-green" : "badge-gray"}>{u.enabled ? "Active" : "Disabled"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div>
            <div className="section-header">
              <h2 className="section-title">All Users ({filteredUsers.length})</h2>
            </div>

            <div className="mb-4">
              <input
                className="input max-w-sm"
                type="search"
                placeholder="Search by email or role…"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            {usersQuery.isLoading && <p className="text-muted-foreground">Loading users…</p>}

            {!usersQuery.isLoading && filteredUsers.length === 0 && (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <p>No users found.</p>
              </div>
            )}

            {filteredUsers.length > 0 && (
              <div className="card p-0 overflow-hidden overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="font-medium">{user.email}</td>
                        <td>
                          <span className={user.role === "ADMIN" ? "badge-red" : user.role === "SELLER" ? "badge-yellow" : "badge-blue"}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={user.enabled ? "badge-green" : "badge-gray"}>
                            {user.enabled ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="text-muted-foreground text-sm">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td>
                          <div className="flex items-center gap-2 flex-wrap">
                            {user.role !== "ADMIN" && (
                              <button
                                className={`btn btn-sm ${user.enabled ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300" : "btn-success"}`}
                                onClick={() => toggleUserMutation.mutate({ id: user.id, enabled: !user.enabled })}
                                disabled={toggleUserMutation.isPending}
                              >
                                {user.enabled ? "Disable" : "Enable"}
                              </button>
                            )}
                            {user.role !== "ADMIN" && (
                              <button
                                className="btn-danger btn btn-sm"
                                onClick={() => { if (confirm(`Delete user "${user.email}"?`)) deleteUserMutation.mutate(user.id); }}
                                disabled={deleteUserMutation.isPending}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {tab === "products" && (
          <div>
            <div className="section-header">
              <h2 className="section-title">All Products ({filteredProducts.length})</h2>
            </div>

            <div className="mb-4">
              <input
                className="input max-w-sm"
                type="search"
                placeholder="Search by title or seller…"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

            {productsQuery.isLoading && <p className="text-muted-foreground">Loading products…</p>}

            {!productsQuery.isLoading && filteredProducts.length === 0 && (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                <p>No products found.</p>
              </div>
            )}

            {filteredProducts.length > 0 && (
              <div className="card p-0 overflow-hidden overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>Title</th><th>Seller</th><th>Type</th><th>Price</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                        </td>
                        <td className="text-muted-foreground text-sm">{product.sellerEmail ?? "—"}</td>
                        <td><span className="badge-blue">{product.productType}</span></td>
                        <td className="font-medium">${product.price?.toFixed(2)}</td>
                        <td>
                          <span className={product.published ? "badge-green" : "badge-yellow"}>
                            {product.published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2 flex-wrap">
                            {product.published ? (
                              <button
                                className="btn btn-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300"
                                onClick={() => unpublishProductMutation.mutate(product.id)}
                                disabled={unpublishProductMutation.isPending}
                              >
                                Unpublish
                              </button>
                            ) : (
                              <button
                                className="btn-success btn btn-sm"
                                onClick={() => publishProductMutation.mutate(product.id)}
                                disabled={publishProductMutation.isPending}
                              >
                                Publish
                              </button>
                            )}
                            <button
                              className="btn-danger btn btn-sm"
                              onClick={() => { if (confirm(`Delete "${product.title}"?`)) deleteProductMutation.mutate(product.id); }}
                              disabled={deleteProductMutation.isPending}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div>
            <div className="section-header">
              <h2 className="section-title">All Orders ({orders.length})</h2>
            </div>

            {ordersQuery.isLoading && <p className="text-muted-foreground">Loading orders…</p>}

            {!ordersQuery.isLoading && orders.length === 0 && (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <p>No orders found.</p>
              </div>
            )}

            {orders.length > 0 && (
              <div className="card p-0 overflow-hidden overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>Order #</th><th>Customer</th><th>Status</th><th>Amount</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="font-medium font-mono text-sm">#{order.orderNumber}</td>
                        <td className="text-muted-foreground">{order.userEmail ?? "—"}</td>
                        <td>
                          <span className={`badge ${order.status === "COMPLETED" ? "badge-green" : order.status === "PENDING" ? "badge-yellow" : "badge-gray"}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="font-semibold">${order.totalAmount?.toFixed(2)}</td>
                        <td className="text-muted-foreground text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
