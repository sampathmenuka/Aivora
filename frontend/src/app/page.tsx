import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary/20 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        <div className="container-page relative py-20 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/80 mb-6 backdrop-blur">
              The #1 Platform for Digital Products
            </span>
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
              Sell &amp; Buy{" "}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Digital Products
              </span>
            </h1>
            <p className="text-lg text-white/70 mb-8 leading-relaxed">
              Ebooks, courses, templates and more — instantly delivered. Start buying or selling today with zero hassle.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary btn btn-lg">
                Browse Products
              </Link>
              <Link href="/auth/register" className="btn btn-lg border border-white/30 text-white hover:bg-white/10">
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-page py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Everything you need</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A complete platform for creators and buyers of digital products.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
              title: "Ebooks & Courses",
              desc: "Discover thousands of digital learning resources from expert creators worldwide.",
              color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300",
            },
            {
              icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
              title: "Instant Downloads",
              desc: "Get immediate access to your purchases. No waiting, no shipping — just download and enjoy.",
              color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300",
            },
            {
              icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
              title: "Secure Payments",
              desc: "Industry-leading security powered by Stripe. Your financial data is always protected.",
              color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300",
            },
          ].map((feature) => (
            <div key={feature.title} className="card">
              <div className={`inline-flex rounded-xl p-3 mb-4 ${feature.color}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 border-y border-border">
        <div className="container-page py-14 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Join thousands of creators and buyers on Digital Store.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/auth/register" className="btn-primary btn btn-lg">Create free account</Link>
            <Link href="/products" className="btn-secondary btn btn-lg">Browse catalog</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
