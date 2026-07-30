import { homePage } from "@/data";

export function Certifications() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="certifications-heading">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">Trust and standards</p>
        <h2 id="certifications-heading" className="mt-3 text-3xl font-semibold text-ink sm:text-5xl">
          Guest confidence is built into the stay.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {homePage.certifications.map((item) => (
            <div key={item} className="border border-black/10 p-5">
              <p className="text-sm font-semibold text-charcoal">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
