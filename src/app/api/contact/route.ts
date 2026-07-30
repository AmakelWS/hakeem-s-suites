import { NextResponse } from "next/server";
import { checkRateLimit, CONTACT_ERROR, isEmail, sanitize } from "@/lib";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = sanitize(body.name);
    const email = sanitize(body.email).toLowerCase();
    const phone = sanitize(body.phone);
    const dates = sanitize(body.dates);
    const message = sanitize(body.message);
    const hcaptchaToken = sanitize(body["h-captcha-response"]);
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!name || !isEmail(email) || !message) {
      return NextResponse.json({ message: CONTACT_ERROR }, { status: 400 });
    }

    const ipLimit = checkRateLimit(`ip:${ip}`);
    const emailLimit = checkRateLimit(`email:${email}`);

    if (!ipLimit.allowed || !emailLimit.allowed) {
      return NextResponse.json(
        { message: "Too many requests. Please wait a few minutes or call us directly." },
        { status: 429 }
      );
    }

    if (!process.env.HCAPTCHA_SECRET) {
      return NextResponse.json(
        { message: "Captcha is not configured yet. Please call us directly." },
        { status: 503 }
      );
    }

    const captchaResponse = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET,
        response: hcaptchaToken
      })
    });
    const captcha = (await captchaResponse.json()) as { success?: boolean };

    if (!captcha.success) {
      return NextResponse.json({ message: CONTACT_ERROR }, { status: 400 });
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: process.env.RESEND_TO_EMAIL,
        subject: `New booking request from ${name}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone || "Not provided"}`,
          `Preferred dates: ${dates || "Not provided"}`,
          "",
          message
        ].join("\n")
      })
    });

    if (!resendResponse.ok) {
      return NextResponse.json({ message: CONTACT_ERROR }, { status: 502 });
    }

    return NextResponse.json({
      message: "Thank you. Your request has been received, and our reservations team will respond shortly."
    });
  } catch {
    return NextResponse.json({ message: CONTACT_ERROR }, { status: 500 });
  }
}
