import Image from "next/image";
import Link from "next/link";
import { BookingButton, ContactCTA } from "@/components";
import { ScrollImageTransition } from "@/components/accommodations";
import { company, type Accommodation } from "@/data";

type AccommodationPageProps = {
  accommodation: Accommodation;
};

export function AccommodationPage({ accommodation }: AccommodationPageProps) {
  return (
    <div className="bg-parchment text-charcoal">
      <section className="border-b border-stoneBorder px-4 py-12 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <span className="text-xs font-medium uppercase tracking-editorial text-terracotta">
                {accommodation.eyebrow}
              </span>
              <h1 className="mt-3 font-serif text-5xl font-light leading-[0.95] text-charcoal sm:text-7xl">
                {accommodation.name}
              </h1>
              <p className="mt-6 text-base leading-relaxed text-charcoal/80 sm:text-xl">
                {accommodation.subtitle}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
                {accommodation.description}
              </p>

              <div className="mt-8 grid gap-4 border-y border-stoneBorder py-6 text-center sm:grid-cols-2">
                <div>
                  <span className="block text-[10px] uppercase tracking-editorial text-charcoal/60">best for</span>
                  <span className="mt-1 block text-xs font-semibold text-charcoal">{accommodation.guests}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-editorial text-charcoal/60">layout</span>
                  <span className="mt-1 block text-xs font-semibold text-charcoal">{accommodation.bedType}</span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <BookingButton label="reserve this stay" apartmentName={accommodation.name} />
                <Link
                  href="/"
                  className="inline-flex min-h-12 items-center justify-center bg-transparent px-6 text-xs font-medium tracking-editorial text-charcoal transition hover:text-terracotta"
                >
                  back home
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden border border-stoneBorder shadow-warm">
              <Image
                src={accommodation.heroImage.src}
                alt={accommodation.heroImage.alt}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-stoneBorder bg-parchment-dark px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div className="border border-stoneBorder bg-parchment-light p-8 shadow-warm">
            <span className="text-xs font-medium uppercase tracking-editorial text-terracotta">
              included
            </span>
            <h2 className="mt-2 font-serif text-3xl font-light text-charcoal">
              Comforts for your stay
            </h2>
            <ul className="mt-6 grid gap-3 text-xs text-charcoal/80 sm:grid-cols-2">
              {accommodation.amenities.map((item) => (
                <li key={item} className="border-b border-stoneBorder/40 pb-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-stoneBorder bg-parchment-light p-8 shadow-warm">
            <span className="text-xs font-medium uppercase tracking-editorial text-terracotta">
              ideal for
            </span>
            <h2 className="mt-2 font-serif text-3xl font-light text-charcoal">
              Guest fit
            </h2>
            <ul className="mt-6 grid gap-3 text-xs text-charcoal/80 sm:grid-cols-2">
              {accommodation.idealFor.map((item) => (
                <li key={item} className="border-b border-stoneBorder/40 pb-2">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-charcoal/70">
              Lodging is available {company.hoursDetailed.lodging}. Restaurant service is available {company.hoursDetailed.restaurant}.
            </p>
          </div>
        </div>
      </section>

      {accommodation.video ? (
        <section className="border-b border-stoneBorder bg-parchment px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <span className="text-xs font-medium uppercase tracking-editorial text-terracotta">
              video walkthrough
            </span>
            <h2 className="mb-8 mt-2 font-serif text-4xl font-light text-charcoal">
              Tour the {accommodation.name}
            </h2>
            <div className="relative aspect-video w-full overflow-hidden border border-stoneBorder bg-charcoal shadow-warm">
              <video controls preload="metadata" className="h-full w-full object-cover" aria-label={accommodation.video.title}>
                <source src={accommodation.video.src} type="video/mp4" />
              </video>
            </div>
          </div>
        </section>
      ) : null}

      <ScrollImageTransition
        images={accommodation.gallery}
        title={`Move through the ${accommodation.name}.`}
        description={
          accommodation.slug === "studios"
            ? "Scroll to transition through the studio living area, kitchenette, and bedroom suite."
            : "Scroll to transition through the living room, bedrooms, dining area, and kitchen."
        }
      />

      <ContactCTA />
    </div>
  );
}
