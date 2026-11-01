# Hakeem's Suites Website

Production-ready Next.js, TypeScript, and Tailwind CSS website for Hakeem's Suites in Buea.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and add real values.

3. Run locally:

```bash
npm run dev
```

## Google Analytics

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to the GA4 Measurement ID. The analytics script loads asynchronously in `src/components/analytics/GoogleAnalytics.tsx`.

Tracked events:
- `sticky_call_click`
- `booking_cta_click`
- `contact_form_submitted`

## hCaptcha

Create an hCaptcha site key and secret. Add:
- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`
- `HCAPTCHA_SECRET`

The contact form sends the token to `/api/contact`, and the server verifies it before sending email.

## Resend

Create a Resend API key and set:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_TO_EMAIL`

The real API key is only used in `src/app/api/contact/route.ts`.

## Vercel

Add the same environment variables in Vercel Project Settings. `vercel.json` includes security headers for CSP, HSTS, clickjacking protection, content sniffing protection, and referrer policy.

## Setmore

Replace `company.booking.setmoreUrl` in `src/data/company.ts` with the real Setmore booking URL. If Setmore provides a script snippet, paste it into `src/components/conversion/SetmoreEmbed.tsx` where indicated.

## Staff booking system

The Google Sheets staff booking application is in [vercel-sheets](vercel-sheets/README.md). To deploy it as a separate Vercel project, select **Root Directory: vercel-sheets**, Framework **Other**, Node.js **24**, install `npm ci`, output `public`, and no frontend build command. Configure its private Google connection and complete the setup/acceptance checks before enabling real bookings. The repository root remains the public marketing website.
