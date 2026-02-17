"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-border bg-card">
      <nav className="container-page flex items-center justify-between py-4">
        <Link href="/" className="text-lg font-semibold">
          Digital Store
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/products">Products</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/purchases">Purchases</Link>
          {user?.role === "SELLER" && <Link href="/seller">Seller</Link>}
          <ThemeToggle />
          {!isAuthenticated ? (
            <>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/register">Register</Link>
            </>
          ) : (
            <button onClick={logout} className="rounded border border-border px-3 py-1">
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
