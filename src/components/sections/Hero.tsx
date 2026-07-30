import Image from "next/image";
import Link from "next/link";
import { BookingButton } from "@/components/conversion";
import { company, media } from "@/data";

export function Hero() {
  return (
    <section className="border-b border-stoneBorder bg-parchment py-12 text-charcoal lg:py-20" aria-labelledby="home-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <span className="text-xs font-medium uppercase tracking-editorial text-terracotta">
              Guest House & Restaurant in Buea
            </span>
            <h1 id="home-heading" className="mt-4 font-serif text-5xl font-light leading-[0.95] text-charcoal sm:text-7xl lg:text-8xl">
              Home away from Home.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-charcoal/78 sm:text-lg">
              Hakeem&apos;s Suites offers 24/7 lodging, modern serviced apartments, and a daily restaurant experience in Federal Quarters, beside Red Cross.
            </p>

            <div className="mt-8 space-y-3 border-y border-stoneBorder py-6 text-sm text-charcoal/75">
              <p>Lodging: {company.hoursDetailed.lodging}</p>
              <p>Restaurant: {company.hoursDetailed.restaurant}</p>
              <p>Reservations: {company.phoneDisplay}</p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <BookingButton label="booking / reservation" />
              <Link
                href="/studios"
                className="inline-flex min-h-12 items-center justify-center bg-transparent px-6 text-xs font-medium tracking-editorial text-charcoal transition hover:text-terracotta"
              >
                view studio
              </Link>
              <Link
                href="/two-bedroom"
                className="inline-flex min-h-12 items-center justify-center bg-transparent px-6 text-xs font-medium tracking-editorial text-charcoal transition hover:text-terracotta"
              >
                view 2 bedroom
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative aspect-[3/4] w-full overflow-hidden border border-stoneBorder bg-parchment-dark shadow-warm">
              <Image
                src={media.hero.src}
                alt={media.hero.alt}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="relative aspect-[3/4] w-full overflow-hidden border border-stoneBorder bg-parchment-dark shadow-warm sm:translate-y-8">
              <Image
                src="/media/home-aerial.jpg"
                alt="Aerial view of Hakeem's Suites in Buea"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
