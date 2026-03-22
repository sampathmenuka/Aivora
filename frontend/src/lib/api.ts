import axios from "axios";
import { authStore } from "./auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = authStore.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      authStore.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  },
);

export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  productType: string;
  thumbnailUrl?: string;
  isPublished?: boolean;
  published?: boolean;
  previewUrl?: string;
  sellerEmail?: string;
  createdAt?: string;
};

export type CartItem = {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type Cart = {
  items: CartItem[];
  total: number;
};

export type AuthResponse = {
  token: string;
  email: string;
  role: string;
};

export type PaymentIntentResponse = {
  orderNumber: string;
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
};

export type PurchaseProduct = {
  productId: number;
  title: string;
  productType: string;
  previewUrl?: string;
};

export type Review = {
  id: number;
  rating: number;
  comment: string;
  userEmail: string;
  createdAt: string;
};

export type Order = {
  id?: number;
  orderNumber: string;
  userEmail?: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items?: OrderItem[];
  products?: string[];
};

export type OrderItem = {
  productId: number;
  title: string;
  price: number;
};

export type AdminUser = {
  id: number;
  email: string;
  role: string;
  enabled: boolean;
  createdAt: string;
};

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    published: typeof product.published === "boolean" ? product.published : product.isPublished,
  };
}

function normalizeOrder(order: Order): Order {
  return {
    ...order,
    id: order.id ?? 0,
  };
}

export const apiClient = {
  // ── Auth ────────────────────────────────────────────────
  register(payload: { name: string; email: string; password: string; role?: string }) {
    return api.post<AuthResponse>("/api/auth/register", payload);
  },
  login(payload: { email: string; password: string }) {
    return api.post<AuthResponse>("/api/auth/login", payload);
  },

  // ── Products (public) ────────────────────────────────────
  async getPublicProducts() {
    const response = await api.get<Product[]>("/api/products/public");
    return {
      ...response,
      data: response.data.map(normalizeProduct),
    };
  },
  async getProducts() {
    const response = await api.get<Product[]>("/api/products");
    return {
      ...response,
      data: response.data.map(normalizeProduct),
    };
  },
  getReviews(productId: number) {
    return api.get<Review[]>(`/api/products/${productId}/reviews`);
  },
  addReview(productId: number, payload: { rating: number; comment: string }) {
    return api.post<Review>(`/api/products/${productId}/reviews`, payload);
  },
  deleteReview(productId: number) {
    return api.delete<string>(`/api/products/${productId}/reviews`);
  },

  // ── Cart ─────────────────────────────────────────────────
  getCart() {
    return api.get<Cart>("/api/cart");
  },
  addToCart(payload: { productId: number; quantity?: number }) {
    return api.post<Cart>("/api/cart/items", payload);
  },
  removeFromCart(productId: number) {
    return api.delete<Cart>(`/api/cart/items/${productId}`);
  },
  clearCart() {
    return api.delete<string>("/api/cart");
  },

  // ── Payments ─────────────────────────────────────────────
  createPaymentIntent(payload: { productIds: number[] }) {
    return api.post<PaymentIntentResponse>("/api/payments/create-intent", payload);
  },

  // ── Orders ───────────────────────────────────────────────
  createOrder(payload: { productIds: number[] }) {
    return api.post<Order>("/api/orders", payload);
  },
  async getOrders() {
    const response = await api.get<Order[]>("/api/orders");
    return {
      ...response,
      data: response.data.map(normalizeOrder),
    };
  },
  getSellerOrders() {
    return apiClient.getOrders();
  },

  // ── Purchases ────────────────────────────────────────────
  getPurchases() {
    return api.get<PurchaseProduct[]>("/api/products/my-purchases");
  },
  getDownloadLink(productId: number) {
    return api.get<string>(`/api/products/${productId}/download-link`);
  },
  download(productId: number) {
    return api.get(`/api/downloads/products/${productId}`, {
      responseType: "blob",
    });
  },
  downloadFromLink(downloadLink: string) {
    return api.get(downloadLink, {
      responseType: "blob",
    });
  },

  // ── Seller products ──────────────────────────────────────
  async createProduct(payload: {
    title: string;
    description: string;
    price: number;
    productType: string;
    fileUrl: string;
    previewUrl?: string;
  }) {
    const response = await api.post<Product>("/api/products", payload);
    return {
      ...response,
      data: normalizeProduct(response.data),
    };
  },
  getSellerProducts() {
    return apiClient.getProducts();
  },
  updateProduct(id: number, payload: Partial<{
    title: string;
    description: string;
    price: number;
    productType: string;
    fileUrl: string;
    previewUrl: string;
  }>) {
    return api.put<Product>(`/api/products/${id}`, payload);
  },
  deleteSellerProduct(id: number) {
    return api.delete(`/api/products/${id}`);
  },
  async publishProduct(id: number) {
    const response = await api.put<Product>(`/api/products/${id}/publish`);
    return {
      ...response,
      data: normalizeProduct(response.data),
    };
  },
  async unpublishProduct(id: number) {
    const response = await api.put<Product>(`/api/products/${id}/unpublish`);
    return {
      ...response,
      data: normalizeProduct(response.data),
    };
  },

  // ── Admin ─────────────────────────────────────────────────
  adminGetUsers() {
    return api.get<AdminUser[]>("/api/admin/users");
  },
  adminDeleteUser(id: number) {
    return api.delete(`/api/admin/users/${id}`);
  },
  adminToggleUser(id: number, enabled: boolean) {
    return api.put(`/api/admin/users/${id}/status`, { enabled });
  },
  adminGetProducts() {
    return api.get<Product[]>("/api/admin/products");
  },
  adminDeleteProduct(id: number) {
    return api.delete(`/api/admin/products/${id}`);
  },
  adminPublishProduct(id: number) {
    return api.put(`/api/admin/products/${id}/publish`);
  },
  adminUnpublishProduct(id: number) {
    return api.put(`/api/admin/products/${id}/unpublish`);
  },
  adminGetOrders() {
    return api.get<Order[]>("/api/admin/orders");
  },
  adminGetStats() {
    return api.get<{
      totalUsers: number;
      totalSellers: number;
      totalProducts: number;
      totalOrders: number;
      totalRevenue: number;
    }>("/api/admin/stats");
  },
};

