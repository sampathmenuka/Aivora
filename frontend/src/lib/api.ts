import axios from "axios";
import { authStore } from "./auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
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

export const apiClient = {
  register(payload: { name: string; email: string; password: string }) {
    return api.post<AuthResponse>("/api/auth/register", payload);
  },
  login(payload: { email: string; password: string }) {
    return api.post<AuthResponse>("/api/auth/login", payload);
  },
  getPublicProducts() {
    return api.get<Product[]>("/api/products/public");
  },
  getReviews(productId: number) {
    return api.get<Review[]>(`/api/products/${productId}/reviews`);
  },
  addReview(productId: number, payload: { rating: number; comment: string }) {
    return api.post<Review>(`/api/products/${productId}/reviews`, payload);
  },
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
  createPaymentIntent(payload: { productIds: number[] }) {
    return api.post<PaymentIntentResponse>("/api/payments/create-intent", payload);
  },
  createOrder(payload: { productIds: number[] }) {
    return api.post("/api/orders", payload);
  },
  getOrders() {
    return api.get("/api/orders");
  },
  getPurchases() {
    return api.get<PurchaseProduct[]>("/api/products/my-purchases");
  },
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
  publishProduct(id: number) {
    return api.put<Product>(`/api/products/${id}/publish`);
  },
  unpublishProduct(id: number) {
    return api.put<Product>(`/api/products/${id}/unpublish`);
  },
  download(productId: number) {
    return api.get(`/api/downloads/products/${productId}`, {
      responseType: "blob",
    });
  },
};
