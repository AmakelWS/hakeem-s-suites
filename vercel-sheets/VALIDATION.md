# Validation — November 1, 2026

**Owner-requested cleanup is complete. The live booking ledger is empty; shared staff login and booking saves remain enabled for this non-commercial test project.**

| Boundary | Result |
| --- | --- |
| Booking rules and property | 22 local tests passed: inventory/rates, overlaps, adjacency, lifecycle, balances, pricing, versions, safe retries without fingerprints, corrupt rows and request lookup after later amendments. |
| API and authentication | 18 local tests passed: Google identity/PKCE, shared staff login, challenge and CSRF, credential redaction, owner-only password settings, revocation, signed transport and Unicode preservation. |
| Apps Script gateway | 18 local tests passed: signatures, identities, locks, RAW writes, readback, uncertain-write pause, shared credentials, retry retirement, guarded legacy migration and failure handling. |
| Optional Worker adapter | 4 local tests passed; not deployed. |
| Deployment | Implementation commit c292505, Vercel deployment dpl_HVUuWi1dMvT6nz5mhytgAQsZ9NYN READY at https://hakeems-bookings.vercel.app. Google gateway version 4 uses the same existing endpoint and writer lock. |
| Staff walkthrough | Owner saved the staff password directly on the website; user signed in as Staff. A fictional 3C stay, April 10–12, 2030, saved 100,000 FCFA total / 50,000 paid / 50,000 balance. Website, schedule and Sheet agreed. User cancelled it through the website; the Sheet showed CANCELLED and version 2. No password value retained in source or documentation. |
| Data cleanup | Saves paused under the script lock. A private local backup captured all four records; all were clearly fictional and CANCELLED. Cleanup cleared only Bookings, replaced its header with the 17-column schema and removed the surplus columns in one Sheets batch. Original Sheet1, Rooms, sharing and credentials preserved. |
| Removed fields | Business reference, initialFingerprint and lastFingerprint are absent from the live Bookings schema. Reference input, display and search removed from the website. Booking IDs, version and last request ID support recovery; no payload fingerprints are stored. |
| Live schema verification | Before restoring saves, a controlled editor-run check created a temporary booking through the same 17-column rules/Google adapter, verified exact replay, overlapping-request rejection and cancellation, then erased the temporary row and confirmed the empty ledger. This was an editor/gateway-adapter check, not a new full staff-browser save. |
| Delayed retries | Cleared booking IDs retired in private Script Properties. A signed HTTP retry using a deleted booking ID returned REQUEST_RETIRED; a subsequent ledger read still contained zero bookings. |
| Final live read | Signed gateway read returned zero bookings and all 15 units. Staff access remained enabled. The deployed website, signed in as Staff, displayed zero counters and no bookings; its New reservation form had no business reference field. Google Sheet inspection showed the new headers and empty rows. |
| Live protection | Sheet remains Restricted to owner. Script writes restored to true after verification. Vercel production saves remain enabled for this test; preview remains false. No secret, billing, paid-plan or deployment-protection changes. |
| Runtime scan | No error/fatal groups returned for the implementation deployment in the 15-minute scan. Continuous monitoring is not configured. |
| Limits | Initial-creation replay after later amendments fails closed; use request lookup to recover the current booking. Actual business stays remain unimported/unreconciled and guest capacities unconfirmed. Real interrupted-save recovery and two independent staff browsers were not newly tested. |

Local suite: **62 tests passed, 0 failed**, Node.js 24. Public source excludes private backups, test journals, connection/session keys, OAuth credentials and local environment files. Do not restore a backup or an old script deployment over subsequent bookings without reviewing the current ledger.
