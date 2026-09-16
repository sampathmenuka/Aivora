"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CornerDownLeft, HelpCircle, LayoutGrid, Search, X } from "lucide-react";
import { apiClient } from "@/lib/api";
import { cn, formatPrice } from "@/lib/format";
import { PRODUCT_TYPES, productTypeMeta } from "@/lib/product-types";

type Result = {
  key: string;
  label: string;
  hint?: string;
  href: string;
  icon: typeof Search;
  tone: string;
};

const QUICK_LINKS: Result[] = [
  { key: "all", label: "Browse all products", href: "/products", icon: LayoutGrid, tone: "bg-muted text-foreground" },
  ...Object.entries(PRODUCT_TYPES).map(([type, meta]) => ({
    key: type,
    label: `${meta.label}s`,
    href: `/products?type=${type}`,
    icon: meta.icon,
    tone: `${meta.cover} text-white`,
  })),
  { key: "help", label: "Help center", href: "/faq", icon: HelpCircle, tone: "bg-muted text-foreground" },
];

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  // Shares the catalog cache with the products pages, so this is usually instant
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await apiClient.getPublicProducts()).data,
    enabled: open,
  });

  const results = useMemo<Result[]>(() => {
    const term = query.trim().toLowerCase();
    if (!term) return QUICK_LINKS;

    const matches = (data ?? [])
      .filter((p) => p.title.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term))
      .slice(0, 6)
      .map((p) => {
        const meta = productTypeMeta(p.productType);
        return {
          key: `p-${p.id}`,
          label: p.title,
          hint: `${meta.label} · ${formatPrice(p.price)}`,
          href: `/products/${p.id}`,
          icon: meta.icon,
          tone: `${meta.cover} text-white`,
        };
      });

    return [
      ...matches,
      { key: "search-all", label: `Search all products for “${query.trim()}”`, href: `/products?q=${encodeURIComponent(query.trim())}`, icon: Search, tone: "bg-primary/10 text-primary" },
    ];
  }, [query, data]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      go(results[active].href);
    } else if (event.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl animate-fade-up overflow-hidden rounded-2xl border border-border bg-card shadow-lift" onKeyDown={onKeyDown}>
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/70"
            aria-label="Search products"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `search-${results[active].key}` : undefined}
          />
          <button onClick={onClose} className="btn-icon btn-ghost h-8 w-8" aria-label="Close search">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {query.trim() ? (isLoading ? "Searching…" : "Results") : "Quick links"}
          </p>
          <ul id="search-results" role="listbox">
            {results.map((result, i) => (
              <li key={result.key} id={`search-${result.key}`} role="option" aria-selected={i === active}>
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(result.href)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    i === active ? "bg-muted" : "hover:bg-muted/60",
                  )}
                >
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", result.tone)}>
                    <result.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{result.label}</span>
                    {result.hint && <span className="block text-xs text-muted-foreground">{result.hint}</span>}
                  </span>
                  {i === active && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4 border-t border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
          <span className="inline-flex items-center gap-1"><Kbd><CornerDownLeft className="h-3 w-3" /></Kbd> open</span>
          <span className="inline-flex items-center gap-1"><Kbd>Esc</Kbd> close</span>
        </div>
      </div>
    </div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-md border border-border bg-card px-1 font-sans text-[10px] font-semibold text-muted-foreground">
      {children}
    </kbd>
  );
}
