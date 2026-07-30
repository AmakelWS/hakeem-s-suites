import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { GoogleAnalytics, Header, Footer, StickyMobileCall, CookieConsent } from "@/components";
import { company } from "@/data";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(company.websiteUrl),
  title: {
    default: "Hakeem's Guesthouse & Suites | A hotel that feels like home",
    template: "%s | Hakeem's Guesthouse"
  },
  description:
    "Hakeem's Guesthouse & Suites in Buea offers four unique apartment styles, 24/7 lodging care, daily restaurant dining, and curated artisanal comfort.",
  openGraph: {
    title: "Hakeem's Guesthouse & Suites | A hotel that feels like home",
    description:
      "Four unique serviced apartment suites, daily restaurant service, and hotel-style care in Buea.",
    url: company.websiteUrl,
    siteName: company.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/media/exterior-arrival.jpg",
        width: 1080,
        height: 810,
        alt: "Hakeem's Guesthouse & Suites in Buea"
      }
    ]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <body className="font-sans antialiased bg-parchment text-charcoal selection:bg-terracotta selection:text-parchment">
        <GoogleAnalytics />
        <Header />
        <main>{children}</main>
        <Footer />
        <CookieConsent />
        <StickyMobileCall />
      </body>
    </html>
  );
}
