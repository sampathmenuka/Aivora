"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, LifeBuoy, Mail, Search, SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { cn } from "@/lib/format";

const faqCategories = [
  {
    name: "General",
    questions: [
      {
        question: "What is Digital Store?",
        answer:
          "Digital Store is a marketplace for buying and selling digital products such as ebooks, courses, templates, guides, and downloadable files.",
      },
      {
        question: "How do I contact customer support?",
        answer:
          "You can contact our support team with the Contact us button on this page. Include your order number if your question is about a purchase.",
      },
    ],
  },
  {
    name: "Account",
    questions: [
      {
        question: "How do I create an account?",
        answer:
          "Select Get started, choose whether you want to buy or sell, enter your details and submit. You can then browse products, check out and access your downloads.",
      },
      {
        question: "Can I both buy and sell?",
        answer:
          "Seller accounts can publish products from the creator studio. Any signed-in account can add products to a cart and check out.",
      },
    ],
  },
  {
    name: "Orders & payments",
    questions: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept secure card payments through Stripe. Available payment options may vary depending on your country and the checkout configuration.",
      },
      {
        question: "Where can I view my orders?",
        answer:
          "After signing in, open your dashboard to see every order and its status. Paid products appear in your library, ready to download.",
      },
    ],
  },
  {
    name: "Delivery",
    questions: [
      {
        question: "How quickly do I get my files?",
        answer:
          "Products are delivered digitally, so there is no shipping. Downloads are available in your library as soon as the payment is confirmed — usually within seconds.",
      },
      {
        question: "My order says Pending. What does that mean?",
        answer:
          "Pending means the order was created but the payment hasn't been confirmed yet. Once Stripe confirms it, the status changes to Paid and the files unlock.",
      },
    ],
  },
  {
    name: "Refunds",
    questions: [
      {
        question: "What is your refund policy?",
        answer:
          "Refund eligibility depends on the product type, seller policy, and whether the digital file has already been accessed. Contact support with your order details for help.",
      },
      {
        question: "How long do refunds take?",
        answer:
          "Approved refunds are processed as soon as possible, but the time for funds to appear depends on your bank or payment provider.",
      },
    ],
  },
  {
    name: "Technical",
    questions: [
      {
        question: "I cannot download my purchase. What should I do?",
        answer:
          "Refresh your library, check your internet connection, and confirm the order shows as Paid. If the file is still unavailable, contact support with your order number.",
      },
      {
        question: "Which browsers are supported?",
        answer:
          "Digital Store works best on current versions of Chrome, Edge, Firefox, and Safari across desktop, tablet, and mobile devices.",
      },
    ],
  },
];

const ALL = "All";

export default function FAQClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [openItem, setOpenItem] = useState(`${faqCategories[0].name}-0`);

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return faqCategories
      .filter((category) => activeCategory === ALL || category.name === activeCategory)
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (item) => !term || `${item.question} ${item.answer} ${category.name}`.toLowerCase().includes(term),
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [activeCategory, searchTerm]);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
          <span className="eyebrow">
            <LifeBuoy className="h-3.5 w-3.5" />
            Help center
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">How can we help?</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Answers about accounts, payments, delivery, refunds and technical support.
          </p>
          <div className="relative mx-auto mt-8 max-w-xl">
            <label htmlFor="faq-search" className="sr-only">Search frequently asked questions</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="faq-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search questions…"
              className="input h-14 rounded-2xl pl-12 text-base shadow-lift"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="scrollbar-none -mx-4 mb-10 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0" aria-label="FAQ categories">
          {[ALL, ...faqCategories.map((category) => category.name)].map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={isActive}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="space-y-10">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <section key={category.name}>
                <h2 className="mb-4 font-display text-lg font-bold">{category.name}</h2>
                <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                  {category.questions.map((item, index) => {
                    const itemId = `${category.name}-${index}`;
                    const isOpen = openItem === itemId;
                    return (
                      <div key={item.question}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
                          onClick={() => setOpenItem(isOpen ? "" : itemId)}
                          aria-expanded={isOpen}
                        >
                          <span className="font-medium">{item.question}</span>
                          <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180 text-primary")} />
                        </button>
                        <div className={cn("grid transition-all duration-300 ease-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                          <div className="overflow-hidden">
                            <p className="px-5 pb-5 text-sm leading-7 text-muted-foreground">{item.answer}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
            <EmptyState icon={SearchX} title="No matching questions" description="Try a different search term, or contact us directly." />
          )}
        </div>

        <div className="relative mt-16 overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-soft sm:p-10">
          <h2 className="relative font-display text-2xl font-bold">Still need help?</h2>
          <p className="relative mx-auto mt-2 max-w-md text-muted-foreground">
            Send us a message. Include your order number if it&apos;s about a purchase.
          </p>
          <Link href="mailto:support@digitalstore.com" className="btn-primary relative mt-6">
            <Mail className="h-4 w-4" />
            Contact us
          </Link>
        </div>
      </section>
    </main>
  );
}
