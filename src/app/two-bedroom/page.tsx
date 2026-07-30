import type { Metadata } from "next";
import { AccommodationPage } from "@/components";
import { getAccommodation } from "@/data";

const accommodation = getAccommodation("two-bedroom");

export const metadata: Metadata = {
  title: "2 Bedroom Apartments",
  description:
    "Book 2 bedroom serviced apartments at Hakeem's Suites in Buea with private bedrooms, furnished living areas, kitchen convenience, security, and parking."
};

export default function TwoBedroomPage() {
  if (!accommodation) {
    return null;
  }

  return <AccommodationPage accommodation={accommodation} />;
}
