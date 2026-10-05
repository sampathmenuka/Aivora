import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import Providers from "./providers";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Digital Store — Ebooks, courses & digital downloads",
    template: "%s | Digital Store",
  },
  description: "Discover and sell ebooks, courses and digital files. Instant delivery, secure checkout.",
};

// viewportFit "cover" lets fixed bars respect iPhone safe areas; themeColor tints the mobile browser UI
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fa" },
    { media: "(prefers-color-scheme: dark)", color: "#1a2421" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
