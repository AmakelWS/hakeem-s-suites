"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import { CONTACT_ERROR, trackEvent } from "@/lib";

type FormState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

export function ContactForm() {
  const [state, setState] = useState<FormState>({ status: "idle", message: "" });
  const formRef = useRef<HTMLFormElement>(null);
  const hcaptchaSiteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  const submitForm = async (formData: FormData) => {
    setState({ status: "loading", message: "Sending your request..." });

    const response = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData)),
      headers: { "Content-Type": "application/json" }
    });

    const result = (await response.json()) as { message?: string };

    if (!response.ok) {
      setState({ status: "error", message: result.message || CONTACT_ERROR });
      return;
    }

    trackEvent("contact_form_submitted", { form: "contact" });
    formRef.current?.reset();
    setState({
      status: "success",
      message: result.message || "Thank you. Our reservations team will respond shortly."
    });
  };

  return (
    <form
      ref={formRef}
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submitForm(new FormData(event.currentTarget));
      }}
      aria-describedby="contact-form-status"
    >
      <Script src="https://js.hcaptcha.com/1/api.js" async defer />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-charcoal">
          Full name
          <input className="min-h-12 border border-stoneBorder bg-parchment px-4 text-charcoal" name="name" required autoComplete="name" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-charcoal">
          Email
          <input className="min-h-12 border border-stoneBorder bg-parchment px-4 text-charcoal" name="email" type="email" required autoComplete="email" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-charcoal">
          Phone
          <input className="min-h-12 border border-stoneBorder bg-parchment px-4 text-charcoal" name="phone" type="tel" autoComplete="tel" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-charcoal">
          Preferred dates
          <input className="min-h-12 border border-stoneBorder bg-parchment px-4 text-charcoal placeholder:text-charcoal/45" name="dates" placeholder="Check-in to check-out" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-charcoal">
        Message
        <textarea className="min-h-32 border border-stoneBorder bg-parchment px-4 py-3 text-charcoal" name="message" required />
      </label>
      <div
        className="h-captcha"
        data-sitekey={hcaptchaSiteKey || "10000000-ffff-ffff-ffff-000000000001"}
      />
      <button
        type="submit"
        disabled={state.status === "loading"}
        className="min-h-12 bg-transparent px-6 text-xs font-medium tracking-editorial text-charcoal transition hover:text-terracotta disabled:cursor-not-allowed disabled:opacity-70"
      >
        submit booking request
      </button>
      <p
        id="contact-form-status"
        aria-live="polite"
        className={`text-sm ${state.status === "error" ? "text-red-700" : "text-charcoal/75"}`}
      >
        {state.message}
      </p>
    </form>
  );
}
