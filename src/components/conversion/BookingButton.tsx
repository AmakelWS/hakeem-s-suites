"use client";

import Link from "next/link";
import { company } from "@/data";
import { trackEvent } from "@/lib";

type BookingButtonProps = {
  className?: string;
  label?: string;
  apartmentName?: string;
};

export function BookingButton({
  className = "",
  label = "book your stay",
  apartmentName
}: BookingButtonProps) {
  return (
    <Link
      href="/booking"
      onClick={() => trackEvent("booking_cta_click", { apartment: apartmentName || "general" })}
      className={`inline-flex min-h-12 items-center justify-center bg-transparent px-6 text-xs font-medium tracking-editorial text-charcoal transition hover:text-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2 ${className}`}
      aria-label={`Open booking and reservation page for ${company.name}`}
    >
      {label}
    </Link>
  );
}
