"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { ArrowUpRight, LogOut, LucideIcon, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn, initials } from "@/lib/format";
import ThemeToggle from "./ThemeToggle";
import { Logo } from "./ui";

export type NavItem = {
  label: string;
  icon: LucideIcon;
  section?: string;
  // Either a page link, or a tab on the current dashboard
  href?: string;
  tab?: string;
  count?: number;
};

type Props = {
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  actions?: ReactNode;
  children: ReactNode;
  badgeColor?: "blue" | "yellow" | "red";
};

const BADGES = { blue: "badge-blue", yellow: "badge-yellow", red: "badge-red" };

export default function DashboardLayout({
  title,
  subtitle,
  navItems,
  activeTab,
  onTabChange,
  actions,
  children,
  badgeColor = "blue",
}: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const sections = Array.from(new Set(navItems.map((item) => item.section ?? "")));

  const isActive = (item: NavItem) => (item.tab ? item.tab === activeTab : item.href === pathname);

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item);
    const className = cn(
      "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );
    const content = (
      <>
        {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-x-3 -translate-y-1/2 rounded-r-full bg-primary" />}
        <Icon className="h-[18px] w-[18px] shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {item.count !== undefined && item.count > 0 && (
          <span className={cn("rounded-full px-2 py-px text-[11px] font-semibold", active ? "bg-primary/15" : "bg-muted")}>
            {item.count}
          </span>
        )}
        {item.href && !item.tab && <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />}
      </>
    );

    if (item.tab) {
      return (
        <button
          key={item.label}
          className={className}
          onClick={() => {
            onTabChange?.(item.tab!);
            setSidebarOpen(false);
          }}
        >
          {content}
        </button>
      );
    }
    return (
      <Link key={item.label} href={item.href ?? "/"} className={className} onClick={() => setSidebarOpen(false)}>
        {content}
      </Link>
    );
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo />
        <button className="btn-icon btn-ghost lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {sections.map((section) => (
          <div key={section || "main"} className="space-y-1">
            {section && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{section}</p>
            )}
            {navItems.filter((item) => (item.section ?? "") === section).map(renderItem)}
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {initials(user?.email)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.email}</p>
            <span className={cn(BADGES[badgeColor], "mt-0.5 text-[10px]")}>{user?.role}</span>
          </div>
          <button onClick={logout} className="btn-icon btn-ghost h-8 w-8 hover:text-danger" aria-label="Sign out" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border bg-card lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative h-full w-72 animate-slide-in-left border-r border-border bg-card shadow-lift">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="glass sticky top-0 z-20 border-b">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button className="btn-icon btn-ghost lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate font-display text-base font-bold sm:text-lg">{title}</h1>
                {subtitle && <p className="hidden truncate text-xs text-muted-foreground sm:block">{subtitle}</p>}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {actions}
              <ThemeToggle />
              <Link href="/" className="btn-secondary btn-sm hidden sm:inline-flex">
                View store
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 animate-fade-up p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
