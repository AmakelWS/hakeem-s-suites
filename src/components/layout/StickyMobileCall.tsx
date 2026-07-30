"use client";

import Link from "next/link";
import { company } from "@/data";

export function StickyMobileCall() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-stoneBorder bg-parchment/95 backdrop-blur p-3 lg:hidden">
      <a
        href={company.phoneHref}
        className="mr-2 flex min-h-11 flex-1 items-center justify-center bg-transparent text-xs font-medium tracking-editorial text-charcoal transition hover:text-terracotta"
      >
        call {company.phoneDisplay}
      </a>
      <Link
        href="/booking"
        className="flex min-h-11 flex-1 items-center justify-center bg-transparent text-xs font-medium tracking-editorial text-charcoal transition hover:text-terracotta"
      >
        reserve
      </Link>
    </div>
  );
}
