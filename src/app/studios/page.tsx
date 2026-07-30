import type { Metadata } from "next";
import { AccommodationPage } from "@/components";
import { getAccommodation } from "@/data";

const accommodation = getAccommodation("studios");

export const metadata: Metadata = {
  title: "Studio Suites",
  description:
    "Book private studio suites at Hakeem's Suites in Buea with formal guest care, secure premises, and comfortable short-stay accommodation."
};

export default function StudiosPage() {
  if (!accommodation) {
    return null;
  }

  return <AccommodationPage accommodation={accommodation} />;
}
