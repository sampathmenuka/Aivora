"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, LucideIcon, Search, ShoppingBag, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { cn, initials } from "@/lib/format";
import { dashboardHref, hidesGlobalChrome, OPEN_SEARCH_EVENT } from "./Navbar";

type Tab = {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: number;
  avatar?: string;
};

// App-style bottom navigation for phones; hidden from md up and on dashboard/auth pages
export default function MobileTabBar() {
  const pathname = usePathname() ?? "";
  const { user, isAuthenticated, hydrated } = useAuth();
  const { itemCount } = useCart();

  if (hidesGlobalChrome(pathname)) return null;

  const signedIn = hydrated && isAuthenticated;

  const tabs: Tab[] = [
    { label: "Home", icon: Home, href: "/", active: pathname === "/" },
    { label: "Explore", icon: Compass, href: "/products", active: pathname.startsWith("/products") },
    { label: "Search", icon: Search, onClick: () => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT)) },
    {
      label: "Cart",
      icon: ShoppingBag,
      href: signedIn ? "/cart" : "/auth/login",
      active: pathname.startsWith("/cart") || pathname.startsWith("/checkout"),
      badge: signedIn ? itemCount : 0,
    },
    signedIn
      ? {
          label: "Account",
          icon: UserRound,
          href: dashboardHref(user?.role),
          active: pathname.startsWith("/purchases"),
          avatar: initials(user?.email),
        }
      : { label: "Sign in", icon: UserRound, href: "/auth/login" },
  ];

  return (
    <>
      {/* Reserves space so the fixed bar never covers the end of the page */}
      <div className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden="true" />

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 md:hidden"
        aria-label="Primary"
      >
        <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
          {tabs.map((tab) => {
            const content = (
              <>
                <span
                  className={cn(
                    "relative flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                    tab.active ? "bg-primary/15 text-primary" : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {tab.avatar ? (
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                        tab.active ? "bg-primary text-white" : "bg-muted text-foreground",
                      )}
                    >
                      {tab.avatar}
                    </span>
                  ) : (
                    <tab.icon className="h-5 w-5" strokeWidth={tab.active ? 2.4 : 2} />
                  )}
                  {Boolean(tab.badge) && (
                    <span className="absolute right-1 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white ring-2 ring-background">
                      {tab.badge! > 99 ? "99+" : tab.badge}
                    </span>
                  )}
                </span>
                <span className={cn("text-[11px] font-medium", tab.active ? "text-foreground" : "text-muted-foreground")}>
                  {tab.label}
                </span>
              </>
            );

            const className = "group flex h-full w-full flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform";

            return (
              <li key={tab.label}>
                {tab.href ? (
                  <Link href={tab.href} className={className} aria-current={tab.active ? "page" : undefined}>
                    {content}
                  </Link>
                ) : (
                  <button type="button" onClick={tab.onClick} className={className}>
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
