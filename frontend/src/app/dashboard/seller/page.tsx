"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FilePen,
  LayoutDashboard,
  Package,
  PackagePlus,
  Pencil,
  Receipt,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ProductCover } from "@/components/ProductCard";
import { EmptyState, OrderCards, SegmentedTabs, Skeleton, Spinner, StatCard, StatusBadge } from "@/components/ui";
import { useHashTab } from "@/hooks/useHashTab";
import { apiClient, Order, Product } from "@/lib/api";
import { cn, formatDate, formatPrice, getApiErrorMessage } from "@/lib/format";
import { PRODUCT_TYPES, productTypeMeta } from "@/lib/product-types";

const TABS = ["overview", "products", "editor", "orders"] as const;
type Tab = (typeof TABS)[number];

const EMPTY_FORM = {
  title: "",
  description: "",
  price: "",
  productType: "EBOOK",
  fileUrl: "",
  previewUrl: "",
};

type StatusFilter = "all" | "published" | "draft";

function PublishBadge({ published }: { published?: boolean }) {
  return (
    <span className={published ? "badge-green" : "badge-yellow"}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {published ? "Published" : "Draft"}
    </span>
  );
}

export default function SellerDashboardPage() {
  const [tab, setTab] = useHashTab(TABS, "overview");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["seller-products"],
    queryFn: async () => (await apiClient.getSellerProducts()).data,
  });

  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await apiClient.getOrders()).data,
  });

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 3500);
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const resetEditor = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const createMutation = useMutation({
    mutationFn: apiClient.createProduct,
    onSuccess: () => {
      refresh();
      resetEditor();
      flash("Product saved as a draft. Publish it to make it visible in the store.");
      setTab("products");
    },
    onError: (error) => setFormError(getApiErrorMessage(error, "Failed to create product. Please try again.")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof apiClient.updateProduct>[1] }) =>
      apiClient.updateProduct(id, data),
    onSuccess: () => {
      refresh();
      resetEditor();
      flash("Product updated.");
      setTab("products");
    },
    onError: (error) => setFormError(getApiErrorMessage(error, "Failed to update product. Please try again.")),
  });

  const deleteMutation = useMutation({
    mutationFn: apiClient.deleteSellerProduct,
    onSuccess: () => {
      refresh();
      flash("Product deleted.");
    },
  });

  const publishMutation = useMutation({ mutationFn: apiClient.publishProduct, onSuccess: refresh });
  const unpublishMutation = useMutation({ mutationFn: apiClient.unpublishProduct, onSuccess: refresh });

  const setField = (field: keyof typeof EMPTY_FORM, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    if (!form.title.trim() || !form.description.trim() || !form.price) {
      return setFormError("Title, description and price are required.");
    }
    if (Number(form.price) <= 0) return setFormError("Price must be greater than zero.");
    if (!editingId && !form.fileUrl.trim()) return setFormError("A file path is required for new products.");

    const payload = { ...form, price: Number(form.price) };
    if (editingId) updateMutation.mutate({ id: editingId, data: payload });
    else createMutation.mutate(payload);
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      title: product.title,
      description: product.description ?? "",
      price: String(product.price),
      productType: product.productType,
      fileUrl: "",
      previewUrl: product.previewUrl ?? "",
    });
    setFormError("");
    setTab("editor");
  };

  const products = productsQuery.data ?? [];
  const orders: Order[] = ordersQuery.data ?? [];
  const publishedCount = products.filter((p) => p.published).length;
  const averagePrice = products.length ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0;

  const visibleProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.trim().toLowerCase());
    const matchesStatus = statusFilter === "all" || (statusFilter === "published" ? p.published : !p.published);
    return matchesSearch && matchesStatus;
  });

  const togglingId =
    (publishMutation.isPending && publishMutation.variables) || (unpublishMutation.isPending && unpublishMutation.variables) || undefined;

  const navItems: NavItem[] = [
    { label: "Overview", icon: LayoutDashboard, tab: "overview", section: "Studio" },
    { label: "Products", icon: Package, tab: "products", section: "Studio", count: products.length },
    { label: editingId ? "Edit product" : "New product", icon: PackagePlus, tab: "editor", section: "Studio" },
    { label: "My orders", icon: Receipt, tab: "orders", section: "Account", count: orders.length },
  ];

  const previewProduct: Product = {
    id: editingId ?? 0,
    title: form.title || "Your product title",
    description: form.description || "A short, compelling description of what buyers get.",
    price: Number(form.price) || 0,
    productType: form.productType,
  };

  // Shared by the phone cards and the desktop table
  const renderActions = (product: Product) => (
    <>
      <button
        className={cn("btn-sm", product.published ? "btn-warning" : "btn-success")}
        onClick={() => (product.published ? unpublishMutation : publishMutation).mutate(product.id)}
        disabled={togglingId === product.id}
      >
        {togglingId === product.id ? <Spinner className="h-3.5 w-3.5" /> : product.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {product.published ? "Unpublish" : "Publish"}
      </button>
      <span className="flex items-center gap-1">
        <button className="btn-icon btn-ghost h-9 w-9" onClick={() => startEdit(product)} aria-label={`Edit ${product.title}`}>
          <Pencil className="h-4 w-4" />
        </button>
        <button
          className="btn-icon btn-ghost h-9 w-9 hover:text-danger"
          onClick={() => {
            if (confirm(`Delete "${product.title}"? This cannot be undone.`)) deleteMutation.mutate(product.id);
          }}
          disabled={deleteMutation.isPending}
          aria-label={`Delete ${product.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </span>
    </>
  );

  const goToTab = (next: Tab) => {
    if (next !== "editor" && editingId) resetEditor();
    setTab(next);
  };

  return (
    <ProtectedRoute role="SELLER">
      <DashboardLayout
        title="Creator studio"
        subtitle="Manage your products and storefront"
        navItems={navItems}
        activeTab={tab}
        onTabChange={(t) => goToTab(t as Tab)}
        badgeColor="yellow"
        actions={
          <button onClick={() => { resetEditor(); setTab("editor"); }} className="btn-primary btn-sm hidden sm:inline-flex">
            <PackagePlus className="h-3.5 w-3.5" />
            New product
          </button>
        }
      >
        {notice && (
          <div className="alert-success mb-6 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {notice}
          </div>
        )}

        <div className="mb-6">
          <SegmentedTabs
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "products", label: "Products", count: products.length },
              { id: "editor", label: editingId ? "Edit product" : "New product" },
              { id: "orders", label: "My orders", count: orders.length },
            ]}
            value={tab}
            onChange={goToTab}
          />
        </div>

        {/* ── Overview ── */}
        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <StatCard label="Products" value={products.length} icon={Package} loading={productsQuery.isLoading} />
              <StatCard label="Published" value={publishedCount} icon={Eye} tone="success" loading={productsQuery.isLoading} hint="Visible in the store" />
              <StatCard label="Drafts" value={products.length - publishedCount} icon={FilePen} tone="warning" loading={productsQuery.isLoading} hint="Only visible to you" />
              <StatCard label="Average price" value={formatPrice(averagePrice)} icon={Tag} tone="accent" loading={productsQuery.isLoading} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button onClick={() => { resetEditor(); setTab("editor"); }} className="card card-hover group flex items-center gap-4 text-left">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
                  <PackagePlus className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <p className="font-display font-bold">Create a product</p>
                  <p className="text-sm text-muted-foreground">Upload an ebook, course or file</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </button>
              <button onClick={() => setTab("products")} className="card card-hover group flex items-center gap-4 text-left">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                  <Package className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <p className="font-display font-bold">Manage catalog</p>
                  <p className="text-sm text-muted-foreground">{products.length} products in your store</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="section-title">Recent products</h2>
                {products.length > 0 && (
                  <button onClick={() => setTab("products")} className="btn-ghost btn-sm">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {productsQuery.isLoading ? (
                <Skeleton className="h-48 w-full rounded-2xl" />
              ) : products.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No products yet"
                  description="Create your first product to start selling."
                  action={<button onClick={() => setTab("editor")} className="btn-primary btn-sm">Create product</button>}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {[...products].sort((a, b) => b.id - a.id).slice(0, 3).map((product) => (
                    <div key={product.id} className="card group overflow-hidden p-0">
                      <ProductCover product={product} className="aspect-[16/9] w-full" />
                      <div className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{product.title}</p>
                          <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                        </div>
                        <span className={product.published ? "badge-green" : "badge-yellow"}>{product.published ? "Live" : "Draft"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── Products ── */}
        {tab === "products" && (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input className="input pl-10" type="search" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <SegmentedTabs
                tabs={[
                  { id: "all" as StatusFilter, label: "All" },
                  { id: "published" as StatusFilter, label: "Published" },
                  { id: "draft" as StatusFilter, label: "Drafts" },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>

            {productsQuery.isLoading ? (
              <Skeleton className="h-72 w-full rounded-2xl" />
            ) : visibleProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title={products.length === 0 ? "No products yet" : "No matching products"}
                description={products.length === 0 ? "Create your first product to start selling." : "Try a different search or filter."}
                action={products.length === 0 && <button onClick={() => setTab("editor")} className="btn-primary btn-sm">Create product</button>}
              />
            ) : (
              <>
                {/* Phones: one card per product */}
                <ul className="space-y-3 sm:hidden">
                  {visibleProducts.map((product) => (
                    <li key={product.id} className="card space-y-3 p-3">
                      <div className="flex gap-3">
                        <ProductCover product={product} className="h-16 w-20 shrink-0 rounded-lg [&_p]:hidden [&_svg]:h-5 [&_svg]:w-5 [&>div:last-child]:p-2" />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold">{product.title}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                            <PublishBadge published={product.published} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">{renderActions(product)}</div>
                    </li>
                  ))}
                </ul>

                <div className="table-wrap hidden sm:block">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleProducts.map((product) => {
                        const meta = productTypeMeta(product.productType);
                        return (
                          <tr key={product.id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <ProductCover product={product} className="h-11 w-14 shrink-0 rounded-lg [&_p]:hidden [&_svg]:h-5 [&_svg]:w-5 [&>div:last-child]:p-2" />
                                <div className="min-w-0">
                                  <p className="max-w-[16rem] truncate font-semibold">{product.title}</p>
                                  <p className="max-w-[16rem] truncate text-xs text-muted-foreground">{product.description}</p>
                                </div>
                              </div>
                            </td>
                            <td><span className={meta.badge}>{meta.label}</span></td>
                            <td className="font-semibold">{formatPrice(product.price)}</td>
                            <td><PublishBadge published={product.published} /></td>
                            <td>
                              <div className="flex items-center justify-end gap-1.5">{renderActions(product)}</div>
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

        {/* ── Editor ── */}
        {tab === "editor" && (
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_340px]">
            <form onSubmit={onSubmit} className="card space-y-6 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="section-title">{editingId ? "Edit product" : "New product"}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {editingId ? "Update the details buyers see." : "New products are saved as drafts until you publish them."}
                  </p>
                </div>
                {editingId && (
                  <button type="button" onClick={resetEditor} className="btn-ghost btn-sm">
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                )}
              </div>

              <div className="form-group">
                <span className="form-label">Product type</span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PRODUCT_TYPES).map(([value, meta]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setField("productType", value)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all",
                        form.productType === value ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-foreground/20",
                      )}
                    >
                      <meta.icon className="h-5 w-5" />
                      {meta.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="title">Title</label>
                <input id="title" className="input" placeholder="e.g. The Complete React Handbook" value={form.title} onChange={(e) => setField("title", e.target.value)} maxLength={255} required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="input min-h-[140px] resize-y"
                  placeholder="What will buyers get? Who is it for?"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  maxLength={3000}
                  required
                />
                <p className="form-hint text-right">{form.description.length}/3000</p>
              </div>

              <div className="form-group sm:max-w-[200px]">
                <label className="form-label" htmlFor="price">Price</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <input id="price" className="input pl-7" type="number" step="0.01" min="0.5" placeholder="19.00" value={form.price} onChange={(e) => setField("price", e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="fileUrl">Private file path</label>
                <input id="fileUrl" className="input font-mono text-xs" placeholder="/opt/store/files/my-product.pdf" value={form.fileUrl} onChange={(e) => setField("fileUrl", e.target.value)} required={!editingId} />
                <p className="form-hint">
                  {editingId ? "Leave blank to keep the current file." : "Server path of the file buyers download. Never shown publicly."}
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="previewUrl">
                  Preview URL <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input id="previewUrl" className="input" placeholder="https://example.com/sample.pdf" value={form.previewUrl} onChange={(e) => setField("previewUrl", e.target.value)} />
                <p className="form-hint">A PDF sample for ebooks or a video for courses.</p>
              </div>

              {formError && <div className="alert-error">{formError}</div>}

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => { resetEditor(); setTab("products"); }} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && <Spinner />}
                  {editingId ? "Save changes" : "Create draft"}
                </button>
              </div>
            </form>

            <aside className="space-y-3 xl:sticky xl:top-24 xl:self-start">
              <p className="text-sm font-semibold text-muted-foreground">Live preview</p>
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <ProductCover product={previewProduct} className="aspect-[4/3] w-full" />
                <div className="space-y-2 p-5">
                  <p className="line-clamp-1 font-display font-bold">{previewProduct.title}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{previewProduct.description}</p>
                  <p className="pt-2 font-display text-xl font-bold">{formatPrice(previewProduct.price)}</p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ── Orders ── */}
        {tab === "orders" &&
          (ordersQuery.isLoading ? (
            <Skeleton className="h-56 w-full rounded-2xl" />
          ) : orders.length === 0 ? (
            <EmptyState icon={Receipt} title="No orders yet" description="Orders you place from this account will appear here." />
          ) : (
            <>
            <OrderCards orders={orders} />
            <div className="table-wrap hidden sm:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Items</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderNumber}>
                      <td className="font-mono text-xs font-semibold">#{order.orderNumber.slice(0, 8)}</td>
                      <td className="max-w-xs"><p className="line-clamp-1">{order.products?.join(", ") || "—"}</p></td>
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
