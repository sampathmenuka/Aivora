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
  id: number;
  orderNumber: string;
  userEmail: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items?: OrderItem[];
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

export const apiClient = {
  // ── Auth ────────────────────────────────────────────────
  register(payload: { name: string; email: string; password: string; role?: string }) {
    return api.post<AuthResponse>("/api/auth/register", payload);
  },
  login(payload: { email: string; password: string }) {
    return api.post<AuthResponse>("/api/auth/login", payload);
  },

  // ── Products (public) ────────────────────────────────────
  getPublicProducts() {
    return api.get<Product[]>("/api/products/public");
  },
  getReviews(productId: number) {
    return api.get<Review[]>(`/api/products/${productId}/reviews`);
  },
  addReview(productId: number, payload: { rating: number; comment: string }) {
    return api.post<Review>(`/api/products/${productId}/reviews`, payload);
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
  getOrders() {
    return api.get<Order[]>("/api/orders");
  },
  getSellerOrders() {
    return api.get<Order[]>("/api/orders/seller");
  },

  // ── Purchases ────────────────────────────────────────────
  getPurchases() {
    return api.get<PurchaseProduct[]>("/api/products/my-purchases");
  },
  download(productId: number) {
    return api.get(`/api/downloads/products/${productId}`, {
      responseType: "blob",
    });
  },

  // ── Seller products ──────────────────────────────────────
  createProduct(payload: {
    title: string;
    description: string;
    price: number;
    productType: string;
    fileUrl: string;
    previewUrl?: string;
  }) {
    return api.post<Product>("/api/products", payload);
  },
  getSellerProducts() {
    return api.get<Product[]>("/api/products/my-products");
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
  publishProduct(id: number) {
    return api.put<Product>(`/api/products/${id}/publish`);
  },
  unpublishProduct(id: number) {
    return api.put<Product>(`/api/products/${id}/unpublish`);
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

