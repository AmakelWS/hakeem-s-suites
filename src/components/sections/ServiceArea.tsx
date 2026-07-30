import { company, homePage } from "@/data";

export function ServiceArea() {
  return (
    <section className="bg-charcoal text-parchment px-4 py-20 sm:px-6 lg:px-8 border-t border-stoneBorder" aria-labelledby="local-seo-heading">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div>
          <span className="text-xs font-medium tracking-editorial text-terracotta uppercase">
            prime buea location
          </span>
          <h2 id="local-seo-heading" className="mt-3 font-serif text-4xl sm:text-5xl font-light text-parchment">
            Located in Federal Quarters, Buea
          </h2>
          <p className="mt-6 text-sm sm:text-base leading-relaxed text-parchment/78">
            {company.name} is nestled in a quiet, leafy neighborhood right beside Red Cross in Federal Quarters, offering guests quick access to Mount Cameroon hiking trails, local artisan workshops, and Buea city centers.
          </p>
          <address className="mt-6 not-italic font-serif text-lg text-terracotta-light space-y-1">
            <p>{company.address.street}</p>
            <p>{company.address.city}, {company.address.region}, Cameroon</p>
            <p className="text-xs font-sans text-parchment/60 pt-2 font-light">Coordinates: 4.1534° N, 9.2423° E</p>
          </address>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {homePage.serviceAreas.map((area) => (
            <div key={area} className="border border-parchment/15 bg-parchment/5 p-4 text-xs font-medium tracking-editorial text-parchment/90">
              ✓ {area}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
