"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

const USER_NAV = [
  { href: "/dashboard/user", label: "Dashboard" },
  { href: "/cart", label: "Cart" },
  { href: "/purchases", label: "Purchases" },
];

const SELLER_NAV = [
  { href: "/dashboard/seller", label: "Dashboard" },
];

const ADMIN_NAV = [
  { href: "/dashboard/admin", label: "Admin Panel" },
];

export default function Navbar() {
  const { user, isAuthenticated, logout, hydrated } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Dashboard pages have their own topbar — hide the global navbar there
  if (pathname?.startsWith("/dashboard")) return null;

  const roleLinks =
    user?.role === "ADMIN"
      ? ADMIN_NAV
      : user?.role === "SELLER"
      ? SELLER_NAV
      : USER_NAV;

  const allLinks = [...NAV_LINKS, ...(isAuthenticated ? roleLinks : [])];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
            DS
          </span>
          <span className="hidden sm:block">Digital Store</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Role badge */}
          {hydrated && isAuthenticated && user && (
            <span
              className={`hidden md:inline-flex badge ${
                user.role === "ADMIN"
                  ? "badge-red"
                  : user.role === "SELLER"
                  ? "badge-yellow"
                  : "badge-blue"
              }`}
            >
              {user.role}
            </span>
          )}

          <div className="hidden md:flex items-center gap-2 min-w-[140px] justify-end">
            {!hydrated ? null : !isAuthenticated ? (
              <>
                <Link href="/auth/login" className="btn-secondary btn btn-sm">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary btn btn-sm">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <span className="text-xs text-muted-foreground truncate max-w-[100px]">{user?.email}</span>
                <button onClick={logout} className="btn-secondary btn btn-sm">
                  Sign Out
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden btn-ghost btn p-1.5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4 pt-2 space-y-1">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            {!hydrated ? null : !isAuthenticated ? (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="btn-secondary btn">
                  Sign In
                </Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="btn-primary btn">
                  Sign Up
                </Link>
              </>
            ) : (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="btn-secondary btn">
                Sign Out ({user?.email})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
