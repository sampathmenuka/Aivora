import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container-page">
      <h1 className="mb-3 text-3xl font-bold">Digital Store</h1>
      <p className="mb-6 text-muted-foreground">Buy and sell ebooks, courses, and digital files.</p>
      <div className="flex gap-3">
        <Link href="/products" className="rounded bg-foreground px-4 py-2 text-background">
          Browse Products
        </Link>
        <Link href="/seller" className="rounded border border-border px-4 py-2">
          Seller Dashboard
        </Link>
      </div>
    </main>
  );
}
