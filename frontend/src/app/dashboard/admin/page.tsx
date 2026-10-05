"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  DollarSign,
  Eye,
  EyeOff,
  LayoutDashboard,
  Package,
  Receipt,
  Search,
  ServerCrash,
  Store,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ProductCover } from "@/components/ProductCard";
import { EmptyState, OrderCards, SegmentedTabs, Skeleton, Spinner, StatCard, StatusBadge } from "@/components/ui";
import { useHashTab } from "@/hooks/useHashTab";
import { AdminUser, apiClient, Product } from "@/lib/api";
import { cn, formatDate, formatPrice, initials } from "@/lib/format";
import { productTypeMeta } from "@/lib/product-types";

const TABS = ["overview", "users", "products", "orders"] as const;
type Tab = (typeof TABS)[number];

const ROLE_BADGE: Record<string, string> = { ADMIN: "badge-red", SELLER: "badge-yellow", USER: "badge-blue" };

function PublishBadge({ published }: { published?: boolean }) {
  return (
    <span className={published ? "badge-green" : "badge-yellow"}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {published ? "Published" : "Draft"}
    </span>
  );
}

function ActiveBadge({ enabled }: { enabled: boolean }) {
  return (
    <span className={enabled ? "badge-green" : "badge-gray"}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {enabled ? "Active" : "Disabled"}
    </span>
  );
}

function AdminApiMissing({ what }: { what: string }) {
  return (
    <EmptyState
      icon={ServerCrash}
      title={`${what} are unavailable`}
      description="The backend does not expose the /api/admin endpoints yet. Add an admin controller to enable this view."
    />
  );
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useHashTab(TABS, "overview");
  const [userSearch, setUserSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const queryClient = useQueryClient();

  // Admin-only endpoints: may not exist on the backend, so failures are shown, not retried
  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await apiClient.adminGetStats()).data,
    retry: false,
  });
  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await apiClient.adminGetUsers()).data,
    retry: false,
  });
  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await apiClient.adminGetOrders()).data,
    retry: false,
    enabled: tab === "orders",
  });

  // Products use the regular endpoints, which already return everything for admins
  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await apiClient.getProducts()).data,
  });

  const refreshProducts = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const toggleUserMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) => apiClient.adminToggleUser(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
  const deleteUserMutation = useMutation({
    mutationFn: apiClient.adminDeleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
  const publishMutation = useMutation({ mutationFn: apiClient.publishProduct, onSuccess: refreshProducts });
  const unpublishMutation = useMutation({ mutationFn: apiClient.unpublishProduct, onSuccess: refreshProducts });
  const deleteProductMutation = useMutation({ mutationFn: apiClient.deleteSellerProduct, onSuccess: refreshProducts });

  const users = usersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const stats = statsQuery.data;

  const filteredUsers = users.filter((u) =>
    `${u.email} ${u.role}`.toLowerCase().includes(userSearch.trim().toLowerCase()),
  );
  const filteredProducts = products.filter((p) =>
    `${p.title} ${p.sellerEmail ?? ""}`.toLowerCase().includes(productSearch.trim().toLowerCase()),
  );

  const publishedCount = products.filter((p) => p.published).length;
  const sellerCount = new Set(products.map((p) => p.sellerEmail).filter(Boolean)).size;
  const togglingId =
    (publishMutation.isPending && publishMutation.variables) || (unpublishMutation.isPending && unpublishMutation.variables) || undefined;

  // Shared by the phone cards and the desktop tables
  const userActions = (user: AdminUser) => (
    <>
      <button
        className={cn("btn-sm", user.enabled ? "btn-warning" : "btn-success")}
        onClick={() => toggleUserMutation.mutate({ id: user.id, enabled: !user.enabled })}
        disabled={toggleUserMutation.isPending}
      >
        {user.enabled ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
        {user.enabled ? "Disable" : "Enable"}
      </button>
      <button
        className="btn-icon btn-ghost h-9 w-9 hover:text-danger"
        onClick={() => {
          if (confirm(`Delete user "${user.email}"?`)) deleteUserMutation.mutate(user.id);
        }}
        disabled={deleteUserMutation.isPending}
        aria-label={`Delete ${user.email}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </>
  );

  const productActions = (product: Product) => (
    <>
      <button
        className={cn("btn-sm", product.published ? "btn-warning" : "btn-success")}
        onClick={() => (product.published ? unpublishMutation : publishMutation).mutate(product.id)}
        disabled={togglingId === product.id}
      >
        {togglingId === product.id ? <Spinner className="h-3.5 w-3.5" /> : product.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {product.published ? "Unpublish" : "Publish"}
      </button>
      <button
        className="btn-icon btn-ghost h-9 w-9 hover:text-danger"
        onClick={() => {
          if (confirm(`Delete "${product.title}"? This cannot be undone.`)) deleteProductMutation.mutate(product.id);
        }}
        disabled={deleteProductMutation.isPending}
        aria-label={`Delete ${product.title}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </>
  );

  const navItems: NavItem[] = [
    { label: "Overview", icon: LayoutDashboard, tab: "overview", section: "Admin" },
    { label: "Users", icon: Users, tab: "users", section: "Manage", count: users.length || undefined },
    { label: "Products", icon: Package, tab: "products", section: "Manage", count: products.length },
    { label: "Orders", icon: Receipt, tab: "orders", section: "Manage" },
    { label: "View storefront", icon: Store, href: "/products", section: "Store" },
  ];

  return (
    <ProtectedRoute role="ADMIN">
      <DashboardLayout
        title="Admin console"
        subtitle="Platform health, users and catalog"
        navItems={navItems}
        activeTab={tab}
        onTabChange={(t) => setTab(t as Tab)}
        badgeColor="red"
      >
        <div className="mb-6">
          <SegmentedTabs
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "users", label: "Users" },
              { id: "products", label: "Products", count: products.length },
              { id: "orders", label: "Orders" },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>

        {/* ── Overview ── */}
        {tab === "overview" && (
          <div className="space-y-8">
            {statsQuery.isError && (
              <div className="alert-warning">
                <ServerCrash className="h-4 w-4 shrink-0" />
                Platform stats need the /api/admin endpoints, which the backend doesn&apos;t provide yet. Catalog numbers below are live.
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <StatCard label="Products" value={products.length} icon={Package} loading={productsQuery.isLoading} hint={`${publishedCount} published`} />
              <StatCard label="Active sellers" value={stats?.totalSellers ?? sellerCount} icon={Store} tone="warning" loading={productsQuery.isLoading} />
              <StatCard label="Users" value={stats?.totalUsers ?? "—"} icon={Users} tone="accent" loading={statsQuery.isLoading} />
              <StatCard label="Revenue" value={stats ? formatPrice(stats.totalRevenue) : "—"} icon={DollarSign} tone="success" loading={statsQuery.isLoading} hint={stats ? `${stats.totalOrders} orders` : undefined} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { id: "users" as Tab, label: "Manage users", desc: "Roles and account status", icon: Users, tone: "bg-accent/10 text-accent" },
                { id: "products" as Tab, label: "Moderate catalog", desc: `${products.length - publishedCount} drafts, ${publishedCount} live`, icon: Package, tone: "bg-primary/10 text-primary" },
                { id: "orders" as Tab, label: "Review orders", desc: "All platform transactions", icon: Receipt, tone: "bg-success/10 text-success" },
              ].map((card) => (
                <button key={card.id} onClick={() => setTab(card.id)} className="card card-hover group flex items-center gap-4 text-left">
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", card.tone)}>
                    <card.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold">{card.label}</p>
                    <p className="truncate text-sm text-muted-foreground">{card.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Users ── */}
        {tab === "users" &&
          (usersQuery.isLoading ? (
            <Skeleton className="h-72 w-full rounded-2xl" />
          ) : usersQuery.isError ? (
            <AdminApiMissing what="Users" />
          ) : (
            <div className="space-y-5">
              <div className="relative max-w-xs">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input className="input pl-10" type="search" placeholder="Search email or role…" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
              </div>
              {filteredUsers.length === 0 ? (
                <EmptyState icon={Users} title="No users found" />
              ) : (
                <>
                  <ul className="space-y-3 sm:hidden">
                    {filteredUsers.map((user) => (
                      <li key={user.id} className="card space-y-3 p-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">{initials(user.email)}</span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{user.email}</p>
                            <p className="text-xs text-muted-foreground">Joined {formatDate(user.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={ROLE_BADGE[user.role] ?? "badge-gray"}>{user.role}</span>
                          <ActiveBadge enabled={user.enabled} />
                        </div>
                        {user.role !== "ADMIN" && (
                          <div className="flex items-center justify-between gap-2 border-t border-border pt-3">{userActions(user)}</div>
                        )}
                      </li>
                    ))}
                  </ul>

                  <div className="table-wrap hidden sm:block">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Joined</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold">{initials(user.email)}</span>
                                <span className="font-medium">{user.email}</span>
                              </div>
                            </td>
                            <td><span className={ROLE_BADGE[user.role] ?? "badge-gray"}>{user.role}</span></td>
                            <td><ActiveBadge enabled={user.enabled} /></td>
                            <td className="text-muted-foreground">{formatDate(user.createdAt)}</td>
                            <td>
                              {user.role !== "ADMIN" && <div className="flex justify-end gap-1.5">{userActions(user)}</div>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          ))}

        {/* ── Products ── */}
        {tab === "products" && (
          <div className="space-y-5">
            <div className="relative max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input className="input pl-10" type="search" placeholder="Search title or seller…" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
            </div>

            {productsQuery.isLoading ? (
              <Skeleton className="h-72 w-full rounded-2xl" />
            ) : filteredProducts.length === 0 ? (
              <EmptyState icon={Package} title="No products found" />
            ) : (
              <>
                <ul className="space-y-3 sm:hidden">
                  {filteredProducts.map((product) => (
                    <li key={product.id} className="card space-y-3 p-3">
                      <div className="flex gap-3">
                        <ProductCover product={product} className="h-16 w-20 shrink-0 rounded-lg [&_p]:hidden [&_svg]:h-5 [&_svg]:w-5 [&>div:last-child]:p-2" />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold">{product.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{product.sellerEmail ?? "—"}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                            <PublishBadge published={product.published} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">{productActions(product)}</div>
                    </li>
                  ))}
                </ul>

                <div className="table-wrap hidden sm:block">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Seller</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const meta = productTypeMeta(product.productType);
                        return (
                          <tr key={product.id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <ProductCover product={product} className="h-11 w-14 shrink-0 rounded-lg [&_p]:hidden [&_svg]:h-5 [&_svg]:w-5 [&>div:last-child]:p-2" />
                                <div className="min-w-0">
                                  <p className="max-w-[16rem] truncate font-semibold">{product.title}</p>
                                  <p className="text-xs text-muted-foreground">{meta.label}</p>
                                </div>
                              </div>
                            </td>
                            <td className="text-muted-foreground">{product.sellerEmail ?? "—"}</td>
                            <td className="font-semibold">{formatPrice(product.price)}</td>
                            <td><PublishBadge published={product.published} /></td>
                            <td>
                              <div className="flex justify-end gap-1.5">{productActions(product)}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Orders ── */}
        {tab === "orders" &&
          (ordersQuery.isLoading ? (
            <Skeleton className="h-72 w-full rounded-2xl" />
          ) : ordersQuery.isError ? (
            <AdminApiMissing what="Orders" />
          ) : orders.length === 0 ? (
            <EmptyState icon={Receipt} title="No orders yet" />
          ) : (
            <>
            <OrderCards orders={orders} showCustomer />
            <div className="table-wrap hidden sm:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderNumber}>
                      <td className="font-mono text-xs font-semibold">#{order.orderNumber.slice(0, 8)}</td>
                      <td className="text-muted-foreground">{order.userEmail ?? "—"}</td>
                      <td className="whitespace-nowrap text-muted-foreground">{formatDate(order.createdAt)}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td className="text-right font-semibold">{formatPrice(order.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          ))}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
