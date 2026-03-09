"use client";

import { FormEvent, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient, Product } from "@/lib/api";

const navItems: NavItem[] = [
  {
    href: "/dashboard/seller",
    label: "Dashboard",
    section: "Overview",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/dashboard/seller#add",
    label: "Add Product",
    section: "Products",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/seller#manage",
    label: "Manage Products",
    section: "Products",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: "/dashboard/seller#orders",
    label: "View Orders",
    section: "Sales",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

type Tab = "overview" | "add" | "manage" | "orders";

const EMPTY_FORM = {
  title: "",
  description: "",
  price: "",
  productType: "EBOOK",
  fileUrl: "",
  previewUrl: "",
};

function StatCard({ label, value, color = "text-primary" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="card-stat">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

export default function SellerDashboardPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["seller-products"],
    queryFn: async () => (await apiClient.getSellerProducts()).data,
  });

  const ordersQuery = useQuery({
    queryKey: ["seller-orders"],
    queryFn: async () => {
      try {
        return (await apiClient.getSellerOrders()).data;
      } catch {
        return [];
      }
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["seller-products"] });

  const createMutation = useMutation({
    mutationFn: apiClient.createProduct,
    onSuccess: () => {
      invalidate();
      setForm(EMPTY_FORM);
      setSuccessMsg("Product created successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      setTab("manage");
    },
    onError: () => setFormError("Failed to create product. Please try again."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof apiClient.updateProduct>[1] }) =>
      apiClient.updateProduct(id, data),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      setSuccessMsg("Product updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: apiClient.deleteSellerProduct,
    onSuccess: invalidate,
  });

  const publishMutation = useMutation({
    mutationFn: apiClient.publishProduct,
    onSuccess: invalidate,
  });

  const unpublishMutation = useMutation({
    mutationFn: apiClient.unpublishProduct,
    onSuccess: invalidate,
  });

  const handleForm = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    if (!form.title || !form.description || !form.price || !form.fileUrl) {
      setFormError("All required fields must be filled.");
      return;
    }
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: { ...form, price: Number(form.price) },
      });
    } else {
      createMutation.mutate({ ...form, price: Number(form.price) });
    }
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
    setTab("add");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const products = productsQuery.data ?? [];
  const orders = (ordersQuery.data as { id: number; orderNumber: string; status: string; totalAmount: number; createdAt: string }[]) ?? [];
  const publishedCount = products.filter((p) => p.published).length;
  const revenue = orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "add", label: editingId ? "Edit Product" : "Add Product" },
    { id: "manage", label: "Manage Products" },
    { id: "orders", label: "Orders" },
  ];

  return (
    <ProtectedRoute role="SELLER">
      <DashboardLayout title="Seller Dashboard" navItems={navItems} badgeColor="yellow">
        {successMsg && (
          <div className="alert-success mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-xl p-1 w-fit flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); if (t.id !== "add") cancelEdit(); }}
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Products" value={products.length} color="text-primary" />
              <StatCard label="Published" value={publishedCount} color="text-green-500" />
              <StatCard label="Draft" value={products.length - publishedCount} color="text-yellow-500" />
              <StatCard label="Total Revenue" value={`$${revenue.toFixed(2)}`} color="text-emerald-500" />
            </div>

            <div>
              <h2 className="section-title mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Add New Product", onClick: () => setTab("add"), desc: "List a new digital product", color: "bg-primary/10 text-primary" },
                  { label: "Manage Products", onClick: () => setTab("manage"), desc: `${products.length} products in your store`, color: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300" },
                  { label: "View Orders", onClick: () => setTab("orders"), desc: `${orders.length} total orders`, color: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" },
                ].map((a) => (
                  <button key={a.label} onClick={a.onClick} className="card text-left hover:border-primary/50 group">
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

            {products.length > 0 && (
              <div>
                <div className="section-header">
                  <h2 className="section-title">Recent Products</h2>
                  <button onClick={() => setTab("manage")} className="btn-secondary btn btn-sm">View all</button>
                </div>
                <div className="card p-0 overflow-hidden">
                  <table className="data-table">
                    <thead><tr><th>Title</th><th>Type</th><th>Price</th><th>Status</th></tr></thead>
                    <tbody>
                      {products.slice(0, 5).map((p) => (
                        <tr key={p.id}>
                          <td className="font-medium">{p.title}</td>
                          <td><span className="badge-blue">{p.productType}</span></td>
                          <td>${p.price?.toFixed(2)}</td>
                          <td><span className={p.published ? "badge-green" : "badge-yellow"}>{p.published ? "Published" : "Draft"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add / Edit Product */}
        {tab === "add" && (
          <div className="max-w-2xl">
            <div className="section-header">
              <h2 className="section-title">{editingId ? "Edit Product" : "Add New Product"}</h2>
              {editingId && (
                <button onClick={cancelEdit} className="btn-secondary btn btn-sm">Cancel edit</button>
              )}
            </div>

            <div className="card">
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="form-group sm:col-span-2">
                    <label className="form-label">Title *</label>
                    <input className="input" placeholder="e.g. Advanced React Course" value={form.title} onChange={(e) => handleForm("title", e.target.value)} required />
                  </div>
                  <div className="form-group sm:col-span-2">
                    <label className="form-label">Description *</label>
                    <textarea className="input min-h-[100px] resize-y" placeholder="Describe your product…" value={form.description} onChange={(e) => handleForm("description", e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (USD) *</label>
                    <input className="input" type="number" step="0.01" min="0" placeholder="9.99" value={form.price} onChange={(e) => handleForm("price", e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Product Type *</label>
                    <select className="input" value={form.productType} onChange={(e) => handleForm("productType", e.target.value)}>
                      <option value="EBOOK">Ebook</option>
                      <option value="COURSE">Course</option>
                      <option value="DIGITAL_FILE">Digital File</option>
                    </select>
                  </div>
                  <div className="form-group sm:col-span-2">
                    <label className="form-label">Private File URL / Path *</label>
                    <input className="input" placeholder="s3://bucket/my-product.pdf" value={form.fileUrl} onChange={(e) => handleForm("fileUrl", e.target.value)} required={!editingId} />
                    {editingId && <p className="text-xs text-muted-foreground mt-1">Leave blank to keep the existing file.</p>}
                  </div>
                  <div className="form-group sm:col-span-2">
                    <label className="form-label">Preview URL <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <input className="input" placeholder="https://preview.example.com/sample.pdf" value={form.previewUrl} onChange={(e) => handleForm("previewUrl", e.target.value)} />
                  </div>
                </div>

                {formError && (
                  <div className="alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {formError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="submit" className="btn-primary btn" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
                    ) : editingId ? "Update Product" : "Create Product"}
                  </button>
                  {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary btn">Cancel</button>}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manage Products */}
        {tab === "manage" && (
          <div>
            <div className="section-header">
              <h2 className="section-title">My Products ({products.length})</h2>
              <button onClick={() => { setTab("add"); cancelEdit(); }} className="btn-primary btn btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Product
              </button>
            </div>

            {productsQuery.isLoading && <p className="text-muted-foreground">Loading products…</p>}

            {!productsQuery.isLoading && products.length === 0 && (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                <p>No products yet.</p>
                <button onClick={() => setTab("add")} className="btn-primary btn btn-sm">Add your first product</button>
              </div>
            )}

            {products.length > 0 && (
              <div className="card p-0 overflow-hidden overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div>
                            <p className="font-medium">{product.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                          </div>
                        </td>
                        <td><span className="badge-blue">{product.productType}</span></td>
                        <td className="font-medium">${product.price?.toFixed(2)}</td>
                        <td>
                          <span className={product.published ? "badge-green" : "badge-yellow"}>
                            {product.published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button className="btn-secondary btn btn-sm" onClick={() => startEdit(product)}>Edit</button>
                            {product.published ? (
                              <button
                                className="btn btn-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300"
                                onClick={() => unpublishMutation.mutate(product.id)}
                                disabled={unpublishMutation.isPending}
                              >
                                Unpublish
                              </button>
                            ) : (
                              <button
                                className="btn-success btn btn-sm"
                                onClick={() => publishMutation.mutate(product.id)}
                                disabled={publishMutation.isPending}
                              >
                                Publish
                              </button>
                            )}
                            <button
                              className="btn-danger btn btn-sm"
                              onClick={() => { if (confirm(`Delete "${product.title}"?`)) deleteMutation.mutate(product.id); }}
                              disabled={deleteMutation.isPending}
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

        {/* Orders */}
        {tab === "orders" && (
          <div>
            <div className="section-header">
              <h2 className="section-title">Sales Orders ({orders.length})</h2>
            </div>

            {ordersQuery.isLoading && <p className="text-muted-foreground">Loading orders…</p>}

            {!ordersQuery.isLoading && orders.length === 0 && (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <p>No orders yet.</p>
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
                        <td className="text-muted-foreground">{(order as { userEmail?: string }).userEmail ?? "—"}</td>
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
