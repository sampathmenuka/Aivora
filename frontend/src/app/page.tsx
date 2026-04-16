import Link from "next/link";

export default function HomePage() {
  return (
    <main className="w-full">
      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-65px)] w-full items-center overflow-hidden bg-gradient-to-br from-slate-900 via-primary/20 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        <div className="relative flex w-full justify-center px-4 py-20 text-center sm:px-6 lg:px-10 lg:py-28">
          <div className="max-w-4xl">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/80 mb-6 backdrop-blur">
              The #1 Platform for Digital Products
            </span>
            <h1 className="text-4xl lg:text-7xl font-extrabold leading-tight mb-6">
              Sell &amp; Buy{" "}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Digital Products
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/70 mb-8 leading-relaxed">
              Ebooks, courses, templates and more — instantly delivered. Start buying or selling today with zero hassle.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
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

      {/* What we offer */}
      <section className="w-full bg-muted/35 px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 sm:text-4xl">What We Offer</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Explore a growing collection of premium digital products designed to help you learn, create, and succeed.
          </p>
        </div>
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
              title: "Ebooks & Courses",
              desc: "Discover thousands of digital learning resources from expert creators worldwide.",
              color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
            },
            {
              icon: "M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4",
              title: "Digital Downloads",
              desc: "Access templates, guides, planners, worksheets, and other downloadable resources instantly.",
              color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
            },
            {
              icon: "M12 14l9-5-9-5-9 5 9 5Zm0 0v6m-5-3 5 3 5-3",
              title: "Professional Learning Resources",
              desc: "Gain valuable knowledge through practical content created by industry experts.",
              color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
            },
            {
              icon: "M15.232 5.232 18 8m-2.768-2.768a2.5 2.5 0 1 0-3.536 3.536L5 15.464V19h3.536l6.696-6.696a2.5 2.5 0 0 0 0-3.536Zm0 0L18 8",
              title: "Creative Assets",
              desc: "Browse premium digital resources for designers, creators, and businesses.",
              color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300",
            },
            {
              icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
              title: "Lifetime Access Products",
              desc: "Enjoy unlimited access to purchased digital products anytime you need them.",
              color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
            },
            {
              icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016Z",
              title: "Secure Digital Marketplace",
              desc: "Shop with confidence through secure payments and instant product delivery.",
              color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-lg border border-border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg dark:bg-slate-900"
            >
              <div className="mb-5 flex items-start gap-4">
                <div className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105 ${feature.color}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="pt-2 text-lg font-bold leading-snug text-foreground">{feature.title}</h3>
              </div>
              <p className="text-base leading-7 text-slate-700 dark:text-slate-200">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-primary/5 border-y border-border">
        <div className="w-full px-4 py-14 text-center sm:px-6 lg:px-10">
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
