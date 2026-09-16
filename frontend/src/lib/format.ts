import { AxiosError } from "axios";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatPrice(value: number | null | undefined): string {
  return currency.format(Number(value ?? 0));
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function initials(email: string | null | undefined): string {
  return (email?.trim()?.[0] ?? "U").toUpperCase();
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  return axiosError?.response?.data?.message ?? axiosError?.response?.data?.error ?? fallback;
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
