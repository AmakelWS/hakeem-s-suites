export const company = {
  name: "Hakeem's Suites",
  legalName: "Hakeem's Suites Buea",
  motto: "Home away from Home",
  service: "Guest House, Restaurant, and modern serviced apartments in Buea with hotel-style care",
  businessTypes: ["Guest House", "Restaurant", "Serviced Apartments"],
  phoneDisplay: "+237 672 690 533",
  phoneHref: "tel:+237672690533",
  email: "hakeemssuites@gmail.com",
  opening: {
    label: "Opening",
    value: "January 2026"
  },
  address: {
    street: "Federal Quarters, beside Red Cross",
    city: "Buea",
    region: "Southwest Region",
    postalCode: "00237",
    country: "CM"
  },
  coordinates: {
    latitude: "4.1534",
    longitude: "9.2423"
  },
  websiteUrl: "https://mydomain.com",
  booking: {
    setmoreUrl: "/booking",
    label: "book your stay"
  },
  socialLinks: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    tripadvisor: "https://www.tripadvisor.com/"
  },
  hours: "Lodging open 24/7. Restaurant open daily from 8:00 AM to 10:00 PM.",
  hoursDetailed: {
    lodging: "24/7 for lodging",
    restaurant: "8:00 AM - 10:00 PM daily"
  },
  priceRange: "$$"
} as const;

export type Company = typeof company;
