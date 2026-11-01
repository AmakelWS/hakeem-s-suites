# Hakeem’s Suites staff bookings

Staff booking website with a shared staff password and Google owner sign-in and Google Sheets as the live booking store. This is separate from the public Next.js marketing website in the repository root.

**Non-commercial test deployment: [hakeems-bookings.vercel.app](https://hakeems-bookings.vercel.app).** Google owner sign-in and authenticated reads from the selected Google Sheet are verified. The initializer created Rooms and Bookings while preserving Sheet1, and the website read all 15 units with their confirmed rates. Booking saves remain disabled pending execution of the approved fictional save/overlap tests and backing Sheet sharing restriction. This is not a business availability ledger; existing reservations have not been imported.

## Connect this folder to Vercel

1. Import `AmakelWS/hakeem-s-suites` into a separate Vercel project for staff bookings.
2. Set **Root Directory** to `vercel-sheets` and **Framework Preset** to **Other**.
3. Use **Node.js 24**, **Install Command** `npm ci`, no frontend build command, and **Output Directory** `public`. The included `vercel.json` routes the API and Google sign-in callbacks to the server function.
4. Add the server variables listed in [.env.example](.env.example) through Vercel Project Settings. Use the actual private spreadsheet ID and deployed Apps Script `/exec` endpoint. Keep `BOOKING_WRITES_ENABLED=false` during setup. Never commit environment files or upload credentials to the frontend.
5. Complete [Google connection setup](google/SETUP.md), registering `https://YOUR-STABLE-DOMAIN/auth/callback` for the Google OAuth web client. `APP_URL` must match that exact HTTPS origin.
6. Deploy, test sign-in and an authenticated ledger read, then complete the disposable-sheet acceptance tests in the setup guide. Reconcile existing reservations before enabling live saves.

The owner confirmed this deployment is a non-commercial proof of concept using Vercel Hobby. Business use requires an appropriate hosting plan. A Cloudflare Workers adapter (`worker.js` and `wrangler.jsonc`) is also included as an alternative; it is not deployed or configured automatically by connecting Vercel.

## Shared staff login

Sign in with the configured Google **owner** account, then use **Shared staff login → Set staff password** on the website. Username is `staff`; choose a 14–128 character password and share it privately. No staff Google account is needed. The password is hashed by the server using salted scrypt; only the hash is saved in private Apps Script Properties, never the Sheet, frontend or repository. Deploy the updated gateway to the existing endpoint before using this feature. Access starts disabled until the owner sets a password.

Staff sessions last eight hours. Owner password changes or disabling access revoke existing sessions on their next data request. Only the Google owner can manage this setting. There is no public registration or password-reset email. The persistent gateway counter permits 30 attempts per 10 minutes across all server instances, including successful attempts; if exhausted, staff must wait for that window to expire. The ledger records `shared-staff` as the editor, so it does not identify individual employees. Sign out on shared devices and have staff add their name in the reservation notes when individual attribution is needed.

## Booking behavior

- Shared ledger, search, month/7/14-day occupancy schedule, reservation form, edits, status changes and payment balances.
- Fifteen actual units: twelve apartments at 80,000 FCFA/night and three C studios at 50,000 FCFA/night. Currency XAF; property time zone Africa/Douala. See [PROPERTY.md](PROPERTY.md).
- Shared `staff` username/password for booking staff; separate Google owner login and optional individual Google allowlists. Signed HttpOnly sessions, exact-origin CSRF checks and persistent login attempt limits.
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

All 55 local tests passed. These use simulated Google services and do not establish live connection health or actual Google concurrency behavior. See [VALIDATION.md](VALIDATION.md).

Once the real development environment is configured, `node --env-file=.env.local dev-server.js` serves on port 8091. Register the local callback separately. Localhost-only `?preview=1` uses fictional in-memory records; deployed hosts cannot enable this mode.

The browser keeps an HttpOnly session cookie. An uncertain submission, including its booking details and reference, is retained in that tab’s sessionStorage for recovery by the same staff account. Use individual browser profiles on shared devices. The ledger is refreshed manually and shows a snapshot; saving rechecks the authoritative sheet. This version supports at most 10,000 booking rows and records the last editor/version rather than a full append-only audit history.
