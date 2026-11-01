# Hakeem’s Suites staff bookings

Staff booking website with Google sign-in and Google Sheets as the live booking store. This is separate from the public Next.js marketing website in the repository root.

**Source ready for deployment setup; live bookings remain disabled.** A GitHub push or Vercel deployment does not configure Google access. The Apps Script endpoint, staff OAuth client, private server variables and live acceptance checks must be completed before staff rely on availability.

## Connect this folder to Vercel

1. Import `AmakelWS/hakeem-s-suites` into a separate Vercel project for staff bookings.
2. Set **Root Directory** to `vercel-sheets` and **Framework Preset** to **Other**.
3. Use **Node.js 24**, **Install Command** `npm ci`, no frontend build command, and **Output Directory** `public`. The included `vercel.json` routes the API and Google sign-in callbacks to the server function.
4. Add the server variables listed in [.env.example](.env.example) through Vercel Project Settings. Use the actual private spreadsheet ID and deployed Apps Script `/exec` endpoint. Keep `BOOKING_WRITES_ENABLED=false` during setup. Never commit environment files or upload credentials to the frontend.
5. Complete [Google connection setup](google/SETUP.md), registering `https://YOUR-STABLE-DOMAIN/auth/callback` for the Google OAuth web client. `APP_URL` must match that exact HTTPS origin.
6. Deploy, test sign-in and an authenticated ledger read, then complete the disposable-sheet acceptance tests in the setup guide. Reconcile existing reservations before enabling live saves.

Vercel’s Hobby plan is restricted to personal, non-commercial use. Choose an appropriate plan for business hosting. A Cloudflare Workers adapter (`worker.js` and `wrangler.jsonc`) is also included as an alternative; it is not deployed or configured automatically by connecting Vercel.

## Booking behavior

- Shared ledger, search, month/7/14-day occupancy schedule, reservation form, edits, status changes and payment balances.
- Fifteen actual units: twelve apartments at 80,000 FCFA/night and three C studios at 50,000 FCFA/night. Currency XAF; property time zone Africa/Douala. See [PROPERTY.md](PROPERTY.md).
- Individual Google sign-in, verified identity tokens, explicit staff and owner allowlists, signed sessions and CSRF checks.
- The server signs requests to one Apps Script project. Its script lock surrounds the availability check and write. Both layers pin the spreadsheet ID and validate the staff identity.
- Stable request IDs prevent duplicate creations on retries; versions reject stale edits. Ambiguous writes pause further decisions until management reconciles them.
- Confirmed, checked-in and checked-out stays reserve `[check-in, check-out)`. Pending requests do not hold a unit. Checkout day can be another guest’s arrival day.

All booking changes must go through the website. A script lock cannot prevent manual spreadsheet edits or writes from another script project. Keep the sheet private, staff viewers only, and use one script project as the writer. Existing reservations are not imported automatically. There is no Airbnb/Booking.com synchronization or enforced guest-capacity limit.

## Source layout

| Path | Purpose |
| --- | --- |
| `public/` | Frontend HTML, CSS, JavaScript and confirmed unit inventory |
| `api/index.js` | Booking API and Google sign-in routes |
| `lib/` | Server authentication and signed Google gateway requests |
| `google/` | Apps Script gateway, booking rules, manifest and setup guide |
| `tests/` | Local rule, identity, gateway and hosting-adapter checks |
| `vercel.json` | Vercel routing and response headers |

## Local validation

Use Node.js 24:

```sh
npm ci
npm run build:gateway
npm test
```

All 46 local tests passed. These use simulated Google services and do not establish live connection health or actual Google concurrency behavior. See [VALIDATION.md](VALIDATION.md).

Once the real development environment is configured, `node --env-file=.env.local dev-server.js` serves on port 8091. Register the local callback separately. Localhost-only `?preview=1` uses fictional in-memory records; deployed hosts cannot enable this mode.

The browser keeps an HttpOnly session cookie. An uncertain submission, including its booking details and reference, is retained in that tab’s sessionStorage for recovery by the same staff account. Use individual browser profiles on shared devices. The ledger is refreshed manually and shows a snapshot; saving rechecks the authoritative sheet. This version supports at most 10,000 booking rows and records the last editor/version rather than a full append-only audit history.
