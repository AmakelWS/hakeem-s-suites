"use client";

import { useState } from "react";
import Link from "next/link";
import { company, navigation } from "@/data";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-stoneBorder bg-parchment/95 text-charcoal backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="Hakeem's Suites home">
          <div className="flex flex-col">
            <span className="font-serif text-xl font-light tracking-tight text-charcoal transition group-hover:text-terracotta sm:text-2xl">
              Hakeem&apos;s Suites
            </span>
            <span className="-mt-1 text-[10px] uppercase tracking-widest text-charcoal-light">
              Guest House & Restaurant
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-10 items-center bg-transparent px-4 text-xs font-medium tracking-editorial text-charcoal transition hover:text-terracotta"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={company.phoneHref}
            className="hidden pb-0.5 text-xs tracking-editorial text-charcoal/70 hover:text-charcoal sm:inline-flex"
          >
            {company.phoneDisplay}
          </a>
          <Link
            href="/booking"
            className="inline-flex min-h-10 items-center justify-center bg-transparent px-4 text-xs font-medium tracking-editorial text-charcoal transition hover:text-terracotta"
          >
            reserve
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-charcoal lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-stoneBorder bg-parchment px-6 py-6 lg:hidden">
          <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="bg-transparent px-4 py-3 text-center font-serif text-lg text-charcoal transition hover:text-terracotta"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 border-t border-stoneBorder pt-4">
              <a href={company.phoneHref} className="text-sm text-charcoal/70">
                Call: {company.phoneDisplay}
              </a>
              <Link
                href="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-transparent py-3 text-center text-xs font-medium tracking-editorial text-charcoal transition hover:text-terracotta"
              >
                booking / reservation
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
