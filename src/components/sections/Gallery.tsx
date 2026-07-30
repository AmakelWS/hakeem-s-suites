import Image from "next/image";
import { media } from "@/data";

export function Gallery() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="gallery-heading">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">Property media</p>
            <h2 id="gallery-heading" className="mt-3 text-3xl font-semibold text-ink sm:text-5xl">
              A polished apartment setting for Buea guests
            </h2>
          </div>
          <video
            className="aspect-video w-full bg-ink object-cover"
            controls
            preload="metadata"
            aria-label={media.video.title}
          >
            <source src={media.video.src} type="video/mp4" />
          </video>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {media.gallery.map((item) => (
            <figure key={item.src} className="border border-black/10 bg-white">
              <Image
                src={item.src}
                alt={item.alt}
                width={720}
                height={540}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <figcaption className="p-4 text-sm font-semibold text-charcoal">{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
