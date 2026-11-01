# Validation — November 1, 2026

**Non-commercial test deployment is connected for owner sign-in and reading. Booking saves remain disabled.**

| Boundary | Result |
| --- | --- |
| Booking rules and property | 19 local tests passed: exact 15-unit inventory, rates, overlap/adjacency, lifecycle, retained pricing, versions, retries and corrupt records. |
| API and Google identity | 17 local tests passed: shared login challenge, owner-only password management, revocation, credential redaction and official library signature verification, claims, PKCE, cookies, CSRF, actor injection, sheet pinning, signed requests and constrained redirects. |
| Apps Script gateway | 15 local tests passed against simulated Google services: signatures, allowlists, lock contention, RAW writes, readback, retries, unresolved-write pause and non-overwriting initialization. |
| Cloudflare adapter | 4 local tests passed: request forwarding, authentication failures, callback cookies and asset security headers. Wrangler dry-run bundled successfully; no deployment performed. |
| Vercel deployment | READY at https://hakeems-bookings.vercel.app, under the intended Amakel project. Staff source directory vercel-sheets, Node.js 24, output public. Google connection settings are server-only; no paid plan or subscription was enabled. |
| Live Google sign-in | Verified through the deployed website: the approved initial Google owner account signed in and reached the shared ledger. The Google app remains in Testing with one approved test user. |
| Live Google Sheet read | Verified through browser → Vercel API → signed Apps Script request → Google Sheets. The initializer completed, preserving Sheet1 and adding Rooms and Bookings. Authenticated /api/ledger returned 15 active non-sample units: 12 apartments at 80,000 FCFA/night and 3 studios at 50,000 FCFA/night; the test ledger contained no bookings. |
| Public API checks | GET /api/status returned HTTP 200, configured=true and writesEnabled=false. A separate request without credentials to /api/ledger returned HTTP 401 and SIGN_IN_REQUIRED. No temporary share link was needed. |
| Live booking writes and concurrency | Fictional test writes are approved but not yet executed. No real Google save, overlap race, retry or cancellation test has passed yet. Both write switches remain disabled. |
| Writer isolation | Sharing review is pending before enabling test writes. The Sheet must be private, with staff using the website for changes; Google script locks do not coordinate direct spreadsheet edits. |
| Live inventory | Existing reservations must be loaded and reconciled; an empty sheet is not proof of availability. Guest capacities remain unconfirmed. |

Local suite: **55 tests passed, 0 failed**, using Node.js 24. The generated Apps Script source was saved, parsed and deployed by Google. The live sign-in/read checks above are separate evidence; the local simulations do not prove actual Google write or concurrency behavior.

The repository contains source and blank environment templates only. Private connection keys, session secrets, OAuth credentials, local Vercel linkage and local data are excluded. Production and test spreadsheets, projects and secrets must remain separate.

Approval was received to restrict Sheet sharing, enable test writes and run fictional checks. These actions remain pending; enable writes on the non-commercial test setup and run the live acceptance checks in [google/SETUP.md](google/SETUP.md), including overlapping submissions, interrupted-save recovery and permissions. Existing-reservation reconciliation is required before any business use. Both write switches remain off by default.
