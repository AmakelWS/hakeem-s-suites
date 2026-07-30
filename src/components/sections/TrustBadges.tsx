import { homePage } from "@/data";

export function TrustBadges() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 lg:px-8" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-gold-dark">Guest house details</p>
        <h2 id="trust-heading" className="mx-auto mt-3 max-w-3xl text-center text-3xl font-semibold text-ink sm:text-5xl">
          A calm stay with the comforts guests look for first.
        </h2>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {homePage.trustBadges.map((badge) => (
            <div key={badge} className="border border-black/10 bg-white p-5 text-center text-sm font-semibold text-ink">
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
