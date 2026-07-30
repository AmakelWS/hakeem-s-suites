export type Service = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  features: string[];
};

export const services: Service[] = [
  {
    slug: "restaurant",
    title: "Restaurant",
    summary: "Daily restaurant service for guests and visitors.",
    description:
      "A convenient on-property restaurant experience serving guests and visitors daily from 8:00 AM to 10:00 PM.",
    features: [
      "Daily restaurant service",
      "Open 8:00 AM - 10:00 PM",
      "Guest-friendly dining",
      "Convenient on-property access"
    ]
  },
  {
    slug: "serviced-apartments",
    title: "Serviced Apartments",
    summary: "Modern furnished apartments with hotel-style guest care.",
    description:
      "A refined serviced apartment option for guests who want privacy, space, and a professional hospitality experience in Buea.",
    features: [
      "Furnished living areas",
      "Private bedrooms",
      "Kitchen convenience",
      "Daily room turnover",
      "Wi-Fi and workspace"
    ]
  },
  {
    slug: "short-stay-accommodation",
    title: "Short-Stay Accommodation",
    summary: "Comfortable stays for visits, events, and weekend travel.",
    description:
      "A clean and convenient stay option for guests visiting Buea for personal travel, events, family visits, or regional business.",
    features: [
      "Flexible reservation request",
      "Secure premises",
      "Private parking",
      "Restaurant and lounge access"
    ]
  },
  {
    slug: "business-travel-stays",
    title: "Business Travel Stays",
    summary: "Professional accommodation for work trips and extended projects.",
    description:
      "A quiet base for travelers who need reliable internet, workspace, parking, and a polished environment close to Buea activity.",
    features: [
      "Dedicated workspace",
      "Wi-Fi",
      "Calm apartment layout",
      "Location near business routes"
    ]
  }
];
