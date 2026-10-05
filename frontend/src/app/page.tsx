import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  BookOpen,
  CreditCard,
  Download,
  FileArchive,
  Infinity as InfinityIcon,
  LucideIcon,
  PlayCircle,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Zap,
} from "lucide-react";
import FeaturedProducts from "@/components/FeaturedProducts";

const CATEGORIES: { type: string; title: string; description: string; icon: LucideIcon; cover: string }[] = [
  {
    type: "EBOOK",
    title: "Ebooks",
    description: "Guides, playbooks and deep dives from people who have done the work.",
    icon: BookOpen,
    cover: "bg-indigo-600",
  },
  {
    type: "COURSE",
    title: "Courses",
    description: "Learn at your own pace with video lessons you keep forever.",
    icon: PlayCircle,
    cover: "bg-rose-500",
  },
  {
    type: "DIGITAL_FILE",
    title: "Digital files",
    description: "Templates, assets and toolkits that save you hours.",
    icon: FileArchive,
    cover: "bg-emerald-600",
  },
];

const STEPS = [
  { icon: Search, title: "Discover", description: "Browse ebooks, courses and files from independent creators." },
  { icon: CreditCard, title: "Checkout securely", description: "Pay in seconds with Stripe. Your card details never touch our servers." },
  { icon: Download, title: "Download instantly", description: "Your purchase lands in your library right after payment." },
];

const BENEFITS = [
  { icon: Zap, title: "Instant delivery", description: "No waiting, no shipping. Files are ready the moment you pay." },
  { icon: InfinityIcon, title: "Lifetime access", description: "Everything you buy stays in your library to re-download anytime." },
  { icon: ShieldCheck, title: "Secure payments", description: "Checkout is handled by Stripe with industry-standard encryption." },
  { icon: Star, title: "Honest reviews", description: "Only verified buyers can review, so ratings mean something." },
];

export default function HomePage() {
  return (
    <main className="-mt-[68px] w-full overflow-x-clip">
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative pt-[68px]">
        <div className="bg-grid pointer-events-none absolute inset-0" />

        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:pb-28 lg:pt-24">
          <div className="min-w-0 animate-fade-up space-y-8 text-center lg:text-left">
            <span className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              Instant downloads after checkout
            </span>

            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              The home of <span className="text-primary">digital products</span> people love
            </h1>

            <p className="mx-auto max-w-xl text-lg leading-8 text-muted-foreground lg:mx-0">
              Discover ebooks, courses and creative files from independent creators — or start selling your own in minutes.
            </p>

            <form action="/products" className="mx-auto flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-lift lg:mx-0">
              <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                name="q"
                type="search"
                placeholder="Search ebooks, courses, templates…"
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground/70 sm:text-base"
                aria-label="Search products"
              />
              <button type="submit" className="btn-primary shrink-0">
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" />Secure Stripe checkout</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-warning" />Instant delivery</span>
              <span className="inline-flex items-center gap-1.5"><InfinityIcon className="h-4 w-4 text-primary" />Lifetime access</span>
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Phones: compact rows. md+: centred cards */}
        <div className="grid gap-3 md:grid-cols-3 md:gap-5">
          {CATEGORIES.map((category) => (
            <Link
              key={category.type}
              href={`/products?type=${category.type}`}
              className="card card-hover group relative flex items-center gap-4 overflow-hidden p-4 md:flex-col md:gap-0 md:p-8 md:text-center"
            >
              <span className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${category.cover} text-white shadow-md md:mb-5`}>
                <category.icon className="h-6 w-6" />
              </span>
              <div className="relative min-w-0 flex-1">
                <h3 className="font-display text-base font-bold md:text-xl">{category.title}</h3>
                <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground md:mt-2 md:line-clamp-none md:leading-6">{category.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 md:hidden" />
              <span className="relative mt-auto hidden items-center gap-1 pt-5 text-sm font-semibold text-primary md:inline-flex">
                Browse {category.title.toLowerCase()}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <FeaturedProducts />

      {/* ── How it works ───────────────────────────────── */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl space-y-3 text-center">
            <p className="text-sm font-semibold text-primary">How it works</p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">From discovery to download in under a minute</h2>
          </div>
          <div className="relative grid gap-8 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-border md:block" />
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-soft">
                  <step.icon className="h-6 w-6 text-primary" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-5 font-display text-lg font-bold">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ───────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-primary">Why Digital Store</p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Built for buyers who value their time</h2>
            <p className="text-muted-foreground">
              A focused marketplace with no clutter: find what you need, pay securely and get straight to the good part.
            </p>
            <Link href="/products" className="btn-primary mt-2">
              Start exploring
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="card card-hover">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <benefit.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display font-bold">{benefit.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Creator CTA ────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 px-6 py-16 text-white shadow-lift sm:px-12 lg:px-16">
          <div className="bg-dots absolute inset-0 opacity-20" />

          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                <Store className="h-3.5 w-3.5" />
                For creators
              </span>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">Turn what you know into income</h2>
              <p className="max-w-lg text-white/70">
                Upload your ebook, course or files, set a price and publish. We handle checkout and delivery so you can keep creating.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/auth/register" className="btn-lg btn bg-white text-zinc-950 hover:bg-white/90">
                  Start selling
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/faq" className="btn-lg btn border border-white/20 text-white hover:bg-white/10">
                  Learn more
                </Link>
              </div>
            </div>

            <ul className="space-y-3">
              {[
                { icon: BadgeDollarSign, text: "Keep 90% of every sale" },
                { icon: Rocket, text: "Publish a product in minutes" },
                { icon: CreditCard, text: "Payments processed by Stripe" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="font-medium">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

// Generated artwork from scripts/generate-covers.mjs
function Cover({ src }: { src: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
      <Image src={src} alt="" fill unoptimized priority sizes="288px" className="object-cover" />
    </div>
  );
}

// Decorative stack of product cards
function HeroVisual() {
  return (
    <div className="relative mx-auto hidden h-[540px] w-full max-w-md lg:block" aria-hidden="true">
      <div className="absolute -left-4 top-0 w-64 -rotate-6 animate-float rounded-2xl border border-border bg-card p-3 shadow-lift [animation-delay:-2s]">
        <Cover src="/covers/uikit.svg" />
        <div className="flex items-center justify-between gap-2 px-1 pt-3">
          <p className="inline-flex items-center gap-1.5 truncate text-sm font-semibold">
            <FileArchive className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            UI Starter Kit
          </p>
          <span className="font-display font-bold">$24</span>
        </div>
      </div>

      <div className="absolute -right-4 top-24 w-64 rotate-6 animate-float rounded-2xl border border-border bg-card p-3 shadow-lift [animation-delay:-4s]">
        <Cover src="/covers/photo.svg" />
        <p className="inline-flex items-center gap-1.5 px-1 pt-3 text-sm font-semibold">
          <PlayCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
          Mastering Photography
        </p>
        <div className="flex items-center justify-between px-1 pt-1.5">
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-display font-bold">$49</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 w-72 -translate-x-1/2 animate-float rounded-2xl border border-border bg-card p-3 shadow-lift">
        <Cover src="/covers/founder.svg" />
        <p className="inline-flex items-center gap-1.5 px-1 pt-3 text-sm font-semibold">
          <BookOpen className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
          The Indie Founder Playbook
        </p>
        <div className="flex items-center justify-between px-1 pt-1.5">
          <span className="badge-green">
            <Download className="h-3 w-3" />
            Ready to download
          </span>
          <span className="font-display font-bold">$19</span>
        </div>
      </div>
    </div>
  );
}
