import Link from "next/link";
import { company, navigation } from "@/data";

export function Footer() {
  return (
    <footer className="border-t border-stoneBorder bg-parchment-dark px-4 py-14 text-charcoal sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-stoneBorder pb-10 lg:grid-cols-[1.1fr_0.9fr_0.8fr]">
          <div>
            <span className="text-xs font-medium uppercase tracking-editorial text-terracotta">
              Hakeem&apos;s Suites
            </span>
            <h2 className="mt-3 max-w-xl font-serif text-3xl font-light leading-tight text-charcoal sm:text-4xl">
              Home away from Home.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-charcoal/70">
              Guest House, Restaurant, and serviced apartments in Federal Quarters, beside Red Cross, Buea.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="grid gap-3 text-sm">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-terracotta">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="space-y-3 text-sm text-charcoal/75">
            <p>
              <a href={company.phoneHref} className="hover:text-terracotta">
                {company.phoneDisplay}
              </a>
            </p>
            <p>
              <a href={`mailto:${company.email}`} className="hover:text-terracotta">
                {company.email}
              </a>
            </p>
            <p>{company.hoursDetailed.lodging}</p>
            <p>Restaurant: {company.hoursDetailed.restaurant}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-8 text-xs text-charcoal/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {company.legalName}. All rights reserved.</p>
          <p>{company.opening.label}: {company.opening.value}</p>
        </div>
      </div>
    </footer>
  );
}
