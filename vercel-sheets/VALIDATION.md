# Validation — November 1, 2026

**Not approved for live staff bookings.**

| Boundary | Result |
| --- | --- |
| Booking rules and property | 19 local tests passed: exact 15-unit inventory, rates, overlap/adjacency, lifecycle, retained pricing, versions, retries and corrupt records. |
| API and Google identity | 12 local tests passed: official library signature verification, claims, PKCE, cookies, CSRF, actor injection, sheet pinning, signed requests and constrained redirects. |
| Apps Script gateway | 11 local tests passed against simulated Google services: signatures, allowlists, lock contention, RAW writes, readback, retries, unresolved-write pause and non-overwriting initialization. |
| Cloudflare adapter | 4 local tests passed: request forwarding, authentication failures, callback cookies and asset security headers. Wrangler dry-run bundled successfully; no deployment performed. |
| Live Google connection | Pending: deployed script endpoint, OAuth web client and private environment configuration must be verified. No successful live booking read/write or real concurrency test is established by the local suite. |
| Live inventory | Existing reservations must be loaded and reconciled; an empty sheet is not proof of availability. Guest capacities remain unconfirmed. |

Total: **46 tests passed, 0 failed**, using Node.js 24. The generated Apps Script source was previously saved and parsed by Google; local simulations do not establish deployment readiness.

The repository contains source and blank environment templates only. Private connection keys, session secrets, OAuth credentials, local Vercel linkage and local data are excluded. Production and test spreadsheets, projects and secrets must remain separate.

Before enabling writes, run the live acceptance checks in [google/SETUP.md](google/SETUP.md), including two independent staff sessions attempting the same unit/dates, interrupted-save recovery, permissions and existing-reservation reconciliation. Both write switches remain off by default.
