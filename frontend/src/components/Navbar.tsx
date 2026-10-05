"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  LayoutDashboard,
  LayoutGrid,
  Library,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { cn, initials } from "@/lib/format";
import { PRODUCT_TYPES } from "@/lib/product-types";
import SearchDialog, { Kbd } from "./SearchDialog";
import ThemeToggle from "./ThemeToggle";
import { Logo } from "./ui";

const CATEGORY_COPY: Record<string, string> = {
  EBOOK: "Guides, playbooks and deep dives",
  COURSE: "Video lessons you keep forever",
  DIGITAL_FILE: "Templates, assets and toolkits",
};

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "badge-red",
  SELLER: "badge-yellow",
  USER: "badge-blue",
};

export function dashboardHref(role?: string) {
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "SELLER") return "/dashboard/seller";
  return "/dashboard/user";
}

// Dispatched by MobileTabBar's Search tab
export const OPEN_SEARCH_EVENT = "digitalstore:open-search";

// Dashboard and auth pages render their own chrome
export function hidesGlobalChrome(pathname: string | null) {
  return Boolean(pathname?.startsWith("/dashboard") || pathname?.startsWith("/auth"));
}

export default function Navbar() {
  const { user, isAuthenticated, logout, hydrated } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const exploreRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ctrl/⌘ + K, or the mobile tab bar, opens search from anywhere
  useEffect(() => {
    const openSearch = () => setSearchOpen(true);
    window.addEventListener(OPEN_SEARCH_EVENT, openSearch);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, openSearch);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
      if (event.key === "Escape") {
        setExploreOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (exploreRef.current && !exploreRef.current.contains(target)) setExploreOpen(false);
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setExploreOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  if (hidesGlobalChrome(pathname)) return null;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  const openExplore = () => {
    clearTimeout(hoverTimer.current);
    setExploreOpen(true);
  };
  const closeExploreSoon = () => {
    hoverTimer.current = setTimeout(() => setExploreOpen(false), 150);
  };

  const linkClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
      active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
    );

  return (
    <>
      <header className="pointer-events-none sticky top-0 z-40 w-full px-3 pt-3">
        <nav
          className={cn(
            "pointer-events-auto relative mx-auto flex h-14 w-full max-w-6xl items-center gap-2 rounded-2xl border px-2.5 pl-4 transition-all duration-300",
            scrolled || mobileOpen
              ? "border-border/70 bg-background/80 shadow-lift backdrop-blur-xl backdrop-saturate-150"
              : "border-border/40 bg-background/50 backdrop-blur-md",
          )}
        >
          <Logo className="mr-2 shrink-0" />

          {/* Desktop links */}
          <div className="hidden items-center gap-0.5 md:flex">
            <Link href="/" className={linkClass(pathname === "/")}>
              Home
            </Link>

            <div ref={exploreRef} className="relative" onMouseEnter={openExplore} onMouseLeave={closeExploreSoon}>
              <button
                className={linkClass(Boolean(isActive("/products")) || exploreOpen)}
                onClick={() => setExploreOpen((open) => !open)}
                aria-expanded={exploreOpen}
                aria-haspopup="true"
              >
                Explore
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", exploreOpen && "rotate-180")} />
              </button>

              {exploreOpen && (
                <div className="absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-3">
                  <div className="grid animate-fade-in grid-cols-[1fr_200px] gap-2 rounded-2xl border border-border bg-card p-2 shadow-lift">
                    <ul className="space-y-0.5">
                      {Object.entries(PRODUCT_TYPES).map(([type, meta]) => (
                        <li key={type}>
                          <Link
                            href={`/products?type=${type}`}
                            className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
                          >
                            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white", meta.cover)}>
                              <meta.icon className="h-5 w-5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold">{meta.label}s</span>
                              <span className="block truncate text-xs text-muted-foreground">{CATEGORY_COPY[type]}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col justify-between gap-3 rounded-xl bg-muted/70 p-4">
                      <div>
                        <LayoutGrid className="mb-2 h-5 w-5 text-primary" />
                        <p className="text-sm font-semibold">Whole catalog</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">Search, filter and sort every product.</p>
                      </div>
                      <Link href="/products" className="btn-primary btn-sm">
                        Browse all
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href={user?.role === "SELLER" ? "/dashboard/seller" : "/auth/register"} className={linkClass(false)}>
              Sell
            </Link>
            <Link href="/faq" className={linkClass(Boolean(isActive("/faq")))}>
              Help
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-1">
            {/* Search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden h-9 w-60 items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground lg:flex"
              aria-label="Search products"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search products…</span>
              <span className="flex gap-0.5">
                <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
                <Kbd>K</Kbd>
              </span>
            </button>
            <button onClick={() => setSearchOpen(true)} className="btn-icon btn-ghost hidden md:inline-flex lg:hidden" aria-label="Search products">
              <Search className="h-[18px] w-[18px]" />
            </button>

            <ThemeToggle />

            {hydrated && isAuthenticated && (
              <Link href="/cart" className="btn-icon btn-ghost relative hidden md:inline-flex" aria-label={`Cart, ${itemCount} items`}>
                <ShoppingBag className="h-[18px] w-[18px]" />
                {itemCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white ring-2 ring-background">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>
            )}

            <div className="mx-1 hidden h-6 w-px bg-border md:block" />

            {/* Account */}
            <div className="hidden items-center gap-1.5 md:flex">
              {!hydrated ? (
                <span className="h-9 w-36" />
              ) : !isAuthenticated ? (
                <>
                  <Link href="/auth/login" className="btn-ghost btn-sm">
                    Sign in
                  </Link>
                  <Link href="/auth/register" className="btn-primary btn-sm rounded-xl px-4">
                    Get started
                  </Link>
                </>
              ) : (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((open) => !open)}
                    className="flex items-center gap-1.5 rounded-xl p-1 pr-2 transition-colors hover:bg-muted"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                      {initials(user?.email)}
                    </span>
                    <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", menuOpen && "rotate-180")} />
                  </button>

                  {menuOpen && (
                    <div role="menu" className="absolute right-0 mt-3 w-64 animate-fade-in rounded-2xl border border-border bg-card p-1.5 shadow-lift">
                      <div className="flex items-center gap-3 px-3 py-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                          {initials(user?.email)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{user?.email}</p>
                          <span className={cn("mt-0.5", ROLE_BADGE[user?.role ?? "USER"] ?? "badge-gray")}>{user?.role}</span>
                        </div>
                      </div>
                      <div className="my-1 h-px bg-border" />
                      <MenuLink href={dashboardHref(user?.role)} icon={LayoutDashboard} label="Dashboard" />
                      <MenuLink href="/purchases" icon={Library} label="My library" />
                      <MenuLink href="/cart" icon={ShoppingBag} label="Cart" badge={itemCount} />
                      <div className="my-1 h-px bg-border" />
                      <button
                        onClick={logout}
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              className="btn-icon btn-ghost md:hidden"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile panel */}
        {mobileOpen && (
          <div className="pointer-events-auto mx-auto mt-2 max-h-[calc(100dvh-10rem)] max-w-6xl animate-fade-up overflow-y-auto rounded-2xl border border-border bg-card p-3 shadow-lift md:hidden">
            <div className="space-y-0.5">
              <MobileLink href="/" label="Home" active={pathname === "/"} />
              <MobileLink href="/products" label="All products" icon={LayoutGrid} active={pathname === "/products"} />
            </div>

            <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Categories</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PRODUCT_TYPES).map(([type, meta]) => (
                <Link key={type} href={`/products?type=${type}`} className="flex flex-col items-center gap-2 rounded-xl border border-border p-3 text-xs font-medium">
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-white", meta.cover)}>
                    <meta.icon className="h-4 w-4" />
                  </span>
                  {meta.label}s
                </Link>
              ))}
            </div>

            <div className="mt-3 space-y-0.5">
              <MobileLink href={user?.role === "SELLER" ? "/dashboard/seller" : "/auth/register"} label="Sell on Digital Store" icon={Store} />
              <MobileLink href="/faq" label="Help center" icon={HelpCircle} active={pathname === "/faq"} />
              {hydrated && isAuthenticated && (
                <>
                  <MobileLink href={dashboardHref(user?.role)} label="Dashboard" icon={LayoutDashboard} />
                  <MobileLink href="/purchases" label="My library" icon={Library} />
                </>
              )}
            </div>

            <div className="mt-3 border-t border-border pt-3">
              {!hydrated ? null : !isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/auth/login" className="btn-secondary">
                    Sign in
                  </Link>
                  <Link href="/auth/register" className="btn-primary">
                    Get started
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-1">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                    {initials(user?.email)}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">{user?.email}</p>
                  <button onClick={logout} className="btn-ghost btn-sm text-danger">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function MenuLink({ href, icon: Icon, label, badge }: { href: string; icon: typeof LayoutDashboard; label: string; badge?: number }) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      {badge ? <span className="rounded-full bg-primary/10 px-2 py-px text-[11px] font-semibold text-primary">{badge}</span> : null}
    </Link>
  );
}

function MobileLink({ href, label, icon: Icon, active }: { href: string; label: string; icon?: typeof LayoutDashboard; active?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </Link>
  );
}
