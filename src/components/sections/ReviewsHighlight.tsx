import { reviews } from "@/data";

export function ReviewsHighlight() {
  return (
    <section className="bg-pearl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="reviews-heading">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">Guest reviews</p>
        <h2 id="reviews-heading" className="mt-3 text-3xl font-semibold text-ink sm:text-5xl">
          Built for trust before the first call
        </h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.name} className="border border-black/10 bg-white p-6">
              <p className="text-gold-dark" aria-label={`${review.rating} star rating`}>
                {"★".repeat(review.rating)}
              </p>
              <blockquote className="mt-4 text-charcoal/80">“{review.quote}”</blockquote>
              <p className="mt-5 font-semibold text-ink">{review.name}</p>
              <p className="text-sm text-charcoal/62">{review.location}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
