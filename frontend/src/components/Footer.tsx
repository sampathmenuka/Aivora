"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { hidesGlobalChrome } from "./Navbar";
import { Logo } from "./ui";

const COLUMNS = [
  {
    title: "Marketplace",
    links: [
      { href: "/products", label: "Explore products" },
      { href: "/products?type=EBOOK", label: "Ebooks" },
      { href: "/products?type=COURSE", label: "Courses" },
      { href: "/products?type=DIGITAL_FILE", label: "Digital files" },
    ],
  },
  {
    title: "Creators",
    links: [
      { href: "/auth/register", label: "Start selling" },
      { href: "/dashboard/seller", label: "Seller dashboard" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/faq", label: "Help center" },
      { href: "mailto:support@digitalstore.com", label: "Contact us" },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  if (hidesGlobalChrome(pathname)) return null;

  return (
    <footer className="mt-24 border-t border-border bg-muted/30">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 sm:grid-cols-3 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)] md:py-14 lg:px-8">
        <div className="col-span-2 space-y-4 sm:col-span-3 md:col-span-1">
          <Logo />
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            The marketplace for ebooks, courses and digital downloads. Instant delivery, secure checkout.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="mb-4 text-sm font-semibold">{column.title}</p>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Digital Store. All rights reserved.</p>
          <p>Payments secured by Stripe</p>
        </div>
      </div>
    </footer>
  );
}
