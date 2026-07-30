import { company, reviews, services } from "@/data";

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LodgingBusiness", "Restaurant"],
  name: company.name,
  legalName: company.legalName,
  url: company.websiteUrl,
  telephone: company.phoneDisplay,
  email: company.email,
  priceRange: company.priceRange,
  slogan: company.motto,
  description: company.service,
  foundingDate: "2026-01",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
      description: "Lodging open 24/7"
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "08:00",
      closes: "22:00",
      description: "Restaurant open daily"
    }
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: company.address.street,
    addressLocality: company.address.city,
    addressRegion: company.address.region,
    postalCode: company.address.postalCode,
    addressCountry: company.address.country
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: company.coordinates.latitude,
    longitude: company.coordinates.longitude
  },
  areaServed: ["Buea", "Southwest Region", "Cameroon"],
  sameAs: Object.values(company.socialLinks),
  makesOffer: services.map((service) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: service.title,
      description: service.summary
    }
  })),
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: reviews.length.toString()
  }
};

export const faqSchema = (
  faqs: readonly { question: string; answer: string }[]
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer
    }
  }))
});
