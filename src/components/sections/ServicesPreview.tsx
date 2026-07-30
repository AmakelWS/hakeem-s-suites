import Link from "next/link";
import { accommodations, services } from "@/data";

export function ServicesPreview() {
  return (
    <section className="bg-pearl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="services-heading">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">Services</p>
          <h2 id="services-heading" className="mt-3 text-3xl font-semibold text-ink sm:text-5xl">
            Hospitality designed for formal, comfortable stays
          </h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {accommodations.map((accommodation) => (
            <article key={accommodation.slug} className="border border-black/10 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">Accommodation</p>
              <h3 className="mt-3 text-2xl font-semibold text-ink">{accommodation.name}</h3>
              <p className="mt-3 text-charcoal/72">{accommodation.shortDescription}</p>
              <Link
                href={`/${accommodation.slug}`}
                className="mt-5 inline-flex min-h-11 items-center font-bold text-gold-dark hover:text-ink"
              >
                View {accommodation.navLabel}
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {services.map((service) => (
            <article key={service.slug} className="border border-black/10 bg-white/70 p-5">
              <h3 className="text-lg font-semibold text-ink">{service.title}</h3>
              <p className="mt-2 text-sm text-charcoal/70">{service.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
