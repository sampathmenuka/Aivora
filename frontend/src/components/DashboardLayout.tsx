"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "./ThemeToggle";

export type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  section?: string;
};

type Props = {
  title: string;
  navItems: NavItem[];
  children: ReactNode;
  badgeColor?: "blue" | "yellow" | "red";
};

export default function DashboardLayout({ title, navItems, children, badgeColor = "blue" }: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sections = Array.from(new Set(navItems.map((i) => i.section ?? ""))).filter(Boolean);
  const hasSection = sections.length > 0;

  const badgeClass = badgeColor === "red" ? "badge-red" : badgeColor === "yellow" ? "badge-yellow" : "badge-blue";

  const renderNavItems = (items: NavItem[]) =>
    items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`sidebar-nav-item${pathname === item.href ? " active" : ""}`}
      >
        <span className="h-4 w-4 shrink-0">{item.icon}</span>
        {item.label}
      </Link>
    ));

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-active))] text-white text-xs font-bold shrink-0">
          DS
        </div>
        <div>
          <p className="text-sm font-semibold text-[hsl(var(--sidebar-foreground))]">Digital Store</p>
          <span className={badgeClass + " mt-0.5 text-[10px]"}>{user?.role}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {hasSection
          ? sections.map((section) => (
              <div key={section} className="mb-2">
                <p className="sidebar-section-title">{section}</p>
                {renderNavItems(navItems.filter((i) => i.section === section))}
              </div>
            ))
          : renderNavItems(navItems)}
        {/* Ungrouped */}
        {hasSection && renderNavItems(navItems.filter((i) => !i.section))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-2 rounded-lg p-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--sidebar-muted))] text-[hsl(var(--sidebar-foreground))] text-xs font-semibold shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[hsl(var(--sidebar-foreground))] truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-1 w-full sidebar-nav-item text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="dashboard-root">
      {/* Desktop sidebar */}
      <aside className="sidebar hidden md:flex flex-col">{sidebarContent}</aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex w-64 flex-col h-full bg-[hsl(var(--sidebar))]">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        {/* Topbar */}
        <header className="dashboard-topbar">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden btn-ghost btn p-1"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-base font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="hidden sm:block text-sm text-muted-foreground">{user?.email}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="dashboard-body">{children}</main>
      </div>
    </div>
  );
}
