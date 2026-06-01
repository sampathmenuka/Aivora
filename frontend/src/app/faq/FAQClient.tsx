"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const faqCategories = [
  {
    name: "General Questions",
    questions: [
      {
        question: "What is Digital Store?",
        answer:
          "Digital Store is a marketplace for buying and selling digital products such as ebooks, courses, templates, guides, and downloadable files.",
      },
      {
        question: "How do I contact customer support?",
        answer:
          "You can contact our support team from the Contact Us button on this page or through your account dashboard if you are signed in.",
      },
    ],
  },
  {
    name: "Account & Registration",
    questions: [
      {
        question: "How do I create an account?",
        answer:
          "Select Sign Up, enter your details, and submit the registration form. After your account is created, you can browse products, save purchases, and access downloads.",
      },
      {
        question: "How can I reset my password?",
        answer:
          "Go to the sign-in page and use the password reset option. Enter the email linked to your account and follow the instructions sent to your inbox.",
      },
    ],
  },
  {
    name: "Orders & Payments",
    questions: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept secure card payments through Stripe. Available payment options may vary depending on your country and the checkout configuration.",
      },
      {
        question: "Where can I view my orders?",
        answer:
          "After signing in, open your purchases page to view completed orders, download available files, and review your purchase history.",
      },
    ],
  },
  {
    name: "Shipping & Delivery",
    questions: [
      {
        question: "How long does shipping take?",
        answer:
          "Most products on Digital Store are delivered digitally, so there is no physical shipping time. Downloads are usually available immediately after successful payment.",
      },
      {
        question: "Can I track my order?",
        answer:
          "For digital purchases, you can track order status from your purchases page. If a seller offers a physical add-on, tracking details will be shared when available.",
      },
    ],
  },
  {
    name: "Returns & Refunds",
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
    name: "Technical Support",
    questions: [
      {
        question: "I cannot download my purchase. What should I do?",
        answer:
          "Refresh the purchases page, check your internet connection, and confirm your payment was completed. If the file is still unavailable, contact support with your order information.",
      },
      {
        question: "Which browsers are supported?",
        answer:
          "Digital Store works best on current versions of Chrome, Edge, Firefox, and Safari across desktop, tablet, and mobile devices.",
      },
    ],
  },
];

const allCategory = "All";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function FAQClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(allCategory);
  const [openItem, setOpenItem] = useState("General Questions-0");

  const filteredCategories = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return faqCategories
      .filter((category) => activeCategory === allCategory || category.name === activeCategory)
      .map((category) => ({
        ...category,
        questions: category.questions.filter((item) => {
          if (!normalizedSearch) return true;

          return `${item.question} ${item.answer} ${category.name}`.toLowerCase().includes(normalizedSearch);
        }),
      }))
      .filter((category) => category.questions.length > 0);
  }, [activeCategory, searchTerm]);

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Support Center</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Find quick answers to common questions about accounts, payments, delivery, refunds, and technical support.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <label htmlFor="faq-search" className="sr-only">
            Search frequently asked questions
          </label>
          <div className="relative">
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
              />
            </svg>
            <input
              id="faq-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search questions..."
              className="input h-12 rounded-xl pl-12 text-base shadow-sm"
            />
          </div>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2" aria-label="FAQ categories">
          {[allCategory, ...faqCategories.map((category) => category.name)].map((category) => {
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                aria-pressed={isActive}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="space-y-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <section key={category.name} aria-labelledby={slugify(category.name)}>
                <h2 id={slugify(category.name)} className="mb-4 text-xl font-bold text-foreground">
                  {category.name}
                </h2>
                <div className="space-y-3">
                  {category.questions.map((item, index) => {
                    const itemId = `${category.name}-${item.question}-${index}`;
                    const panelId = `${slugify(itemId)}-panel`;
                    const buttonId = `${slugify(itemId)}-button`;
                    const isOpen = openItem === itemId;

                    return (
                      <article
                        key={item.question}
                        className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                      >
                        <button
                          id={buttonId}
                          type="button"
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                          onClick={() => setOpenItem(isOpen ? "" : itemId)}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                        >
                          <span className="text-base font-semibold text-foreground">{item.question}</span>
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xl leading-none text-foreground transition-transform duration-200 ${
                              isOpen ? "rotate-45" : ""
                            }`}
                            aria-hidden="true"
                          >
                            +
                          </span>
                        </button>
                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          className={`grid transition-all duration-300 ease-in-out ${
                            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <p className="border-t border-border px-5 py-4 text-sm leading-7 text-muted-foreground">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
            <div className="empty-state bg-card">
              <h2 className="text-lg font-semibold text-foreground">No matching questions found</h2>
              <p>Try a different search term or contact support for personal assistance.</p>
            </div>
          )}
        </div>

        <section className="mt-12 rounded-lg border border-border bg-card px-5 py-8 text-center shadow-sm sm:px-8">
          <h2 className="text-2xl font-bold text-foreground">Can&apos;t find the answer you&apos;re looking for?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Contact our support team for assistance and we will help you find the right solution.
          </p>
          <Link href="mailto:support@digitalstore.com" className="btn-primary btn btn-lg mt-6">
            Contact Us
          </Link>
        </section>
      </section>
    </main>
  );
}
