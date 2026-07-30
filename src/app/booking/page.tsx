import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components";
import { company } from "@/data";

export const metadata: Metadata = {
  title: "Booking / Reservation",
  description:
    "Reserve a studio or 2 bedroom stay at Hakeem's Suites in Buea. Call +237 672 690 533 or submit a secure reservation request."
};

export default function BookingPage() {
  return (
    <div className="bg-parchment text-charcoal">
      <section className="border-b border-stoneBorder px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <span className="text-xs font-medium uppercase tracking-editorial text-terracotta">
              booking / reservation
            </span>
            <h1 className="mt-4 font-serif text-5xl font-light leading-[0.95] text-charcoal sm:text-7xl">
              Reserve your stay at Hakeem&apos;s Suites.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-charcoal/75 sm:text-lg">
              Request availability for a Studio or 2 Bedroom stay. For faster assistance, call reservations directly.
            </p>

            <div className="mt-8 space-y-3 border-y border-stoneBorder py-6 text-sm text-charcoal/75">
              <p>Phone: <a className="underline hover:text-terracotta" href={company.phoneHref}>{company.phoneDisplay}</a></p>
              <p>Email: <a className="underline hover:text-terracotta" href={`mailto:${company.email}`}>{company.email}</a></p>
              <p>Lodging: {company.hoursDetailed.lodging}</p>
              <p>Restaurant: {company.hoursDetailed.restaurant}</p>
            </div>

            <div className="mt-8 flex gap-4">
              <Link href="/studios" className="border-b border-stoneBorder pb-1 text-xs font-medium tracking-editorial hover:text-terracotta">
                view studio
              </Link>
              <Link href="/two-bedroom" className="border-b border-stoneBorder pb-1 text-xs font-medium tracking-editorial hover:text-terracotta">
                view 2 bedroom
              </Link>
            </div>
          </div>

          <div className="border border-stoneBorder bg-parchment-light p-5 shadow-warm sm:p-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
