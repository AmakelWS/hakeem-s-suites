import { homePage } from "@/data";

export function FAQ() {
  return (
    <section className="bg-parchment px-4 py-20 sm:px-6 lg:px-8 border-t border-stoneBorder" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-4xl">
        <span className="text-xs font-medium tracking-editorial text-terracotta uppercase">
          frequently asked questions
        </span>
        <h2 id="faq-heading" className="mt-3 font-serif text-4xl sm:text-5xl font-light text-charcoal">
          Guesthouse & Stay FAQs
        </h2>
        <div className="mt-10 divide-y divide-stoneBorder border-y border-stoneBorder">
          {homePage.faqs.map((faq) => (
            <details key={faq.question} className="group py-6">
              <summary className="cursor-pointer list-none font-serif text-xl sm:text-2xl font-normal text-charcoal flex items-center justify-between">
                <span>{faq.question}</span>
                <span className="text-terracotta transition group-open:rotate-45 font-sans text-xl">+</span>
              </summary>
              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-charcoal/75 pr-6">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
