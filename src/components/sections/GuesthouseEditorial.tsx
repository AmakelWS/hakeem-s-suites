import Image from "next/image";
import Link from "next/link";
import { BookingButton } from "@/components/conversion";
import { accommodations } from "@/data";

const storySections = [
  {
    eyebrow: "guest house",
    title: "A home away from home in Federal Quarters.",
    copy:
      "Hakeem's Suites is built for guests who want the ease of a private stay with the care of a formal guest house. Lodging support is available 24/7, so arrivals, departures, and guest needs can be handled with confidence.",
    image: "/media/home-exterior-night.jpg",
    alt: "Hakeem's Suites exterior at night"
  },
  {
    eyebrow: "restaurant",
    title: "Daily dining without leaving the property.",
    copy:
      "The restaurant is open every day from 8:00 AM to 10:00 PM, giving lodging guests and visitors a convenient place to dine, meet, or enjoy a calm meal in Buea.",
    video: "/media/restaurant.mp4",
    alt: "Restaurant video at Hakeem's Suites"
  },
  {
    eyebrow: "serviced apartments",
    title: "Choose a private studio or a spacious 2 bedroom stay.",
    copy:
      "Whether you are traveling alone, visiting as a couple, coming with family, or staying for work, Hakeem's Suites offers practical comfort with secure premises, parking, and apartment-style privacy.",
    image: "/media/home-bedroom.jpg",
    alt: "Bedroom at Hakeem's Suites"
  }
];

export function GuesthouseEditorial() {
  return (
    <div className="bg-parchment text-charcoal">
      <section className="border-b border-stoneBorder px-4 py-20 text-center sm:px-6 lg:px-8" aria-labelledby="guesthouse-statement">
        <div className="mx-auto max-w-4xl">
          <span className="text-xs font-medium uppercase tracking-editorial text-terracotta">
            Hakeem&apos;s Suites Buea
          </span>
          <h2 id="guesthouse-statement" className="mt-4 font-serif text-4xl font-light leading-tight text-charcoal sm:text-6xl">
            A guest house, restaurant, and serviced stay created for comfort.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-charcoal/78 sm:text-xl">
            Home away from Home. Hakeem&apos;s Suites brings together lodging, dining, and apartment-style privacy in Buea.
          </p>

          <div className="mx-auto mt-12 grid max-w-3xl gap-6 border-y border-stoneBorder py-8 text-left sm:grid-cols-2">
            <figure className="space-y-2">
              <blockquote className="font-serif text-lg leading-snug text-charcoal">
                “24/7 lodging support for guests arriving, resting, and staying in Buea.”
              </blockquote>
              <figcaption className="text-xs uppercase tracking-editorial text-terracotta">
                Guest House
              </figcaption>
            </figure>
            <figure className="space-y-2">
              <blockquote className="font-serif text-lg leading-snug text-charcoal">
                “Daily restaurant service from 8:00 AM to 10:00 PM.”
              </blockquote>
              <figcaption className="text-xs uppercase tracking-editorial text-terracotta">
                Restaurant
              </figcaption>
            </figure>
          </div>

          <div className="mt-10">
            <BookingButton label="book your stay" />
          </div>
        </div>
      </section>

      {storySections.map((section, index) => (
        <section key={section.eyebrow} className="border-b border-stoneBorder bg-parchment-light px-4 py-16 sm:px-6 lg:px-8">
          <div className={`mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-stoneBorder shadow-warm">
              {"video" in section ? (
                <video
                  className="h-full w-full object-cover"
                  controls
                  preload="metadata"
                  aria-label={section.alt}
                >
                  <source src={section.video} type="video/mp4" />
                </video>
              ) : (
                <Image
                  src={section.image}
                  alt={section.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
            </div>
            <div className="max-w-xl">
              <span className="text-xs font-medium uppercase tracking-editorial text-terracotta">
                {section.eyebrow}
              </span>
              <h3 className="mt-3 font-serif text-3xl font-light leading-tight text-charcoal sm:text-5xl">
                {section.title}
              </h3>
              <p className="mt-6 text-base leading-relaxed text-charcoal/75">
                {section.copy}
              </p>
              <div className="mt-8">
                <BookingButton label="reserve now" />
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="border-b border-stoneBorder bg-parchment-dark px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="rooms-heading">
        <div className="mx-auto max-w-7xl">
          <div className="border-b border-stoneBorder pb-10 text-center">
            <span className="text-xs font-medium uppercase tracking-editorial text-terracotta">
              rooms
            </span>
            <h2 id="rooms-heading" className="mt-2 font-serif text-4xl font-light text-charcoal sm:text-6xl">
              Select your stay.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {accommodations.map((item) => (
              <article key={item.slug} className="group border border-stoneBorder bg-parchment-light">
                <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-stoneBorder">
                  <Image
                    src={item.heroImage.src}
                    alt={item.heroImage.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6 sm:p-8">
                  <span className="text-[11px] uppercase tracking-editorial text-terracotta">
                    {item.eyebrow}
                  </span>
                  <h3 className="mt-2 font-serif text-3xl font-normal text-charcoal">
                    {item.name}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
                    {item.shortDescription}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-charcoal/60">
                    <span className="border border-stoneBorder bg-parchment px-2 py-1">{item.guests}</span>
                    <span className="border border-stoneBorder bg-parchment px-2 py-1">{item.bedType}</span>
                  </div>
                  <Link
                    href={`/${item.slug}`}
                    className="mt-6 inline-flex border-b border-stoneBorder pb-1 text-xs font-medium tracking-editorial text-charcoal hover:text-terracotta"
                  >
                    view {item.navLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
