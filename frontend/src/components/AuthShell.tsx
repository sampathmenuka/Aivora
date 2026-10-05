"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { ArrowLeft, Download, Infinity as InfinityIcon, ShieldCheck } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Logo } from "./ui";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-white/10 bg-zinc-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="bg-dots absolute inset-0 opacity-20" />

        <div className="relative [&_span]:text-white">
          <Logo />
        </div>

        <div className="relative max-w-md space-y-8">
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight">
            Your next favourite resource is one click away.
          </h2>
          <ul className="space-y-4">
            {[
              { icon: Download, text: "Instant downloads right after checkout" },
              { icon: InfinityIcon, text: "Lifetime access to everything you buy" },
              { icon: ShieldCheck, text: "Secure payments powered by Stripe" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-white/80">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                  <item.icon className="h-4 w-4" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/50">© {new Date().getFullYear()} Digital Store</p>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link href="/" className="btn-ghost btn-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to store
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-16 sm:px-6">
          <div className="w-full max-w-md animate-fade-up">
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
