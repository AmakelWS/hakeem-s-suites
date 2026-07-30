import { company } from "@/data";

export function SetmoreEmbed() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 lg:px-8" aria-labelledby="online-booking">
      <div className="mx-auto max-w-5xl border border-black/10 bg-pearl p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">Online booking</p>
        <h2 id="online-booking" className="mt-3 text-3xl font-semibold text-ink">
          Reserve directly through our booking system
        </h2>
        <p className="mt-4 max-w-2xl text-charcoal/75">
          The booking button is prepared for Setmore. Replace the placeholder URL or paste the official Setmore script here when provided.
        </p>
        <a
          href={company.booking.setmoreUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex min-h-12 items-center justify-center bg-transparent px-6 font-bold text-ink transition hover:text-gold-dark"
        >
          Open Booking
        </a>
      </div>
    </section>
  );
}
