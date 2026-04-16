import type { Metadata } from "next";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Digital Store",
  description: "Find quick answers about accounts, orders, payments, delivery, refunds, and technical support.",
};

export default function FAQPage() {
  return <FAQClient />;
}
