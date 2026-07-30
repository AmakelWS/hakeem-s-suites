export type Accommodation = {
  slug: "studios" | "two-bedroom";
  name: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  shortDescription: string;
  guests: string;
  bedType: string;
  idealFor: string[];
  amenities: string[];
  heroImage: {
    src: string;
    alt: string;
  };
  video?: {
    src: string;
    title: string;
  };
  gallery: {
    src: string;
    alt: string;
    caption: string;
  }[];
};

export const accommodations: Accommodation[] = [
  {
    slug: "studios",
    name: "Studio",
    navLabel: "studio",
    eyebrow: "private studio lodging",
    title: "A quiet studio suite for refined stays in Buea",
    subtitle: "Private, efficient, and comfortable for short stays, solo travelers, couples, and business guests.",
    description:
      "The Studio at Hakeem's Suites is designed for guests who want privacy, comfort, and hotel-style care in a calm guest house setting.",
    shortDescription:
      "A private studio stay with a comfortable sleeping area, secure premises, 24/7 lodging support, and easy access to the daily restaurant.",
    guests: "Ideal for 1-2 guests",
    bedType: "Studio suite layout",
    idealFor: ["Solo travelers", "Couples", "Business guests", "Short stays"],
    amenities: [
      "Private studio layout",
      "Comfortable sleeping area",
      "Wi-Fi-ready stay",
      "Secure premises",
      "24/7 lodging support",
      "Restaurant open daily from 8:00 AM to 10:00 PM"
    ],
    heroImage: {
      src: "/media/studios/studio-living-blue.jpg",
      alt: "Studio living area at Hakeem's Suites in Buea"
    },
    video: {
      src: "/media/studios/studio-tour-new.mp4",
      title: "Studio suite video tour"
    },
    gallery: [
      {
        src: "/media/studios/studio-living-blue.jpg",
        alt: "Studio living room with blue ceiling lighting at Hakeem's Suites",
        caption: "Living room"
      },
      {
        src: "/media/studios/studio-living-kitchen.jpg",
        alt: "Studio living area and kitchenette at Hakeem's Suites",
        caption: "Living and kitchenette"
      },
      {
        src: "/media/studios/studio-bedroom-close.jpg",
        alt: "Studio bedroom with wardrobe at Hakeem's Suites",
        caption: "Bedroom detail"
      },
      {
        src: "/media/studios/studio-bedroom-wide.jpg",
        alt: "Studio bedroom with ensuite access at Hakeem's Suites",
        caption: "Bedroom suite"
      }
    ]
  },
  {
    slug: "two-bedroom",
    name: "2 Bedroom",
    navLabel: "2 bedroom",
    eyebrow: "serviced apartment lodging",
    title: "A spacious 2 bedroom apartment for families and longer stays",
    subtitle: "Apartment-style comfort with private bedrooms, living space, kitchen convenience, and hotel-style care.",
    description:
      "The 2 Bedroom at Hakeem's Suites gives guests more room to settle in while keeping the service, security, and ease of a formal guest house.",
    shortDescription:
      "A spacious 2 bedroom serviced apartment with private sleeping areas, furnished living space, kitchen convenience, secure parking, and daily support.",
    guests: "Ideal for up to 4 guests",
    bedType: "2 bedroom apartment layout",
    idealFor: ["Families", "Longer stays", "Business travelers", "Small groups"],
    amenities: [
      "Two private bedrooms",
      "Furnished living area",
      "Kitchen convenience",
      "Daily room turnover",
      "Free private parking",
      "24/7 lodging support",
      "Restaurant open daily from 8:00 AM to 10:00 PM"
    ],
    heroImage: {
      src: "/media/two-bedroom/two-bedroom-living-close.jpg",
      alt: "Living room in the 2 Bedroom apartment at Hakeem's Suites"
    },
    video: {
      src: "/media/two-bedroom/two-bedroom-tour-new.mp4",
      title: "2 bedroom apartment video tour"
    },
    gallery: [
      {
        src: "/media/two-bedroom/two-bedroom-living-close.jpg",
        alt: "Close living room view in the 2 Bedroom apartment",
        caption: "Living room lounge"
      },
      {
        src: "/media/two-bedroom/two-bedroom-primary.jpg",
        alt: "Primary bedroom in the 2 Bedroom apartment",
        caption: "Primary bedroom"
      },
      {
        src: "/media/two-bedroom/two-bedroom-living-wide.jpg",
        alt: "Wide living and dining area in the 2 Bedroom apartment",
        caption: "Living and dining"
      },
      {
        src: "/media/two-bedroom/two-bedroom-second.jpg",
        alt: "Second bedroom in the 2 Bedroom apartment",
        caption: "Second bedroom"
      },
      {
        src: "/media/two-bedroom/two-bedroom-kitchen-new.jpg",
        alt: "Kitchen in the 2 Bedroom apartment",
        caption: "Kitchen convenience"
      }
    ]
  }
];

export const getAccommodation = (slug: string) =>
  accommodations.find((accommodation) => accommodation.slug === slug);
