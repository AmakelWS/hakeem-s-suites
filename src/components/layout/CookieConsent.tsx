"use client";

import { useEffect, useState } from "react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem("hakeems_cookie_consent") !== "accepted");
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-24 z-40 border border-stoneBorder bg-parchment-light p-4 shadow-warm sm:left-auto sm:max-w-sm">
      <p className="text-sm text-charcoal">
        We use essential and analytics cookies to improve booking performance and site quality.
      </p>
      <button
        type="button"
        className="mt-3 min-h-11 w-full bg-transparent px-4 text-sm font-semibold text-charcoal transition hover:text-terracotta"
        onClick={() => {
          localStorage.setItem("hakeems_cookie_consent", "accepted");
          setVisible(false);
        }}
      >
        Accept
      </button>
    </div>
  );
}
