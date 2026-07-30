import { company } from "@/data";
import { ContactForm } from "@/components/conversion";

export function ContactCTA() {
  return (
    <section className="bg-parchment-dark border-t border-stoneBorder px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="contact-cta-heading">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="text-xs font-medium tracking-editorial text-terracotta uppercase">
            contact & reservations
          </span>
          <h2 id="contact-cta-heading" className="mt-3 font-serif text-4xl sm:text-5xl font-light text-charcoal leading-tight">
            Reserve your stay or inquire about dining
          </h2>
          <p className="mt-6 text-sm sm:text-base leading-relaxed text-charcoal/75">
            Submit your reservation dates directly. Our team will verify Studio or 2 Bedroom availability, answer restaurant questions, and confirm the next steps.
          </p>
          <div className="mt-8 space-y-3">
            <a
              className="inline-flex min-h-12 items-center justify-center bg-transparent px-6 text-xs font-medium tracking-editorial text-charcoal transition hover:text-terracotta"
              href={company.phoneHref}
            >
              call {company.phoneDisplay}
            </a>
            <a
              className="block text-xs tracking-editorial text-terracotta font-medium hover:underline pt-2"
              href={`mailto:${company.email}`}
            >
              {company.email}
            </a>
          </div>
        </div>

        <div className="border border-stoneBorder bg-parchment-light p-6 sm:p-8 shadow-warm">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
