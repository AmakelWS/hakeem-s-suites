import {
  ContactCTA,
  FAQ,
  GuesthouseEditorial,
  Hero,
} from "@/components";
import { homePage } from "@/data";
import { faqSchema, localBusinessSchema } from "@/lib";

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(homePage.faqs)) }}
      />
      <Hero />
      <GuesthouseEditorial />
      <FAQ />
      <ContactCTA />
    </>
  );
}
