# Validation — November 1, 2026

**The non-commercial test site supports live booking saves. Shared staff password setup requires the owner to complete the website form. Existing business reservations have not been imported.**

| Boundary | Result |
| --- | --- |
| Booking rules and property | 19 local tests passed: exact 15-unit inventory, rates, overlap/adjacency, lifecycle, pricing, versions, retries and corrupt records. |
| API and authentication | 18 local tests passed: Google signature/claim verification and PKCE; shared login challenge, CSRF, owner-only password management, credential redaction, revocation, role checks, attempt-gate handling, signed requests and Unicode-preserving transport. |
| Apps Script gateway | 16 local tests passed against simulated Google services: signatures, allowlists, locking, RAW writes, readback, retries, unresolved-write pause, initialization, shared credential management, revocation, persistent attempt limits and Unicode. |
| Optional Cloudflare adapter | 4 local tests passed. It is not deployed; only the Node/Vercel runtime was exercised live for this change. |
| Vercel | READY at https://hakeems-bookings.vercel.app, Amakel's existing project, directory vercel-sheets, Node 24. Implementation commit 462e837. Secrets remain server-only. No paid plan, subscription, billing or deployment-protection change. |
| Google gateway | Existing script project and endpoint updated to version 3. Private spreadsheet pin, signed requests and original script lock retained. Explicit UTF-8 signatures plus ASCII-escaped JSON wire payload preserve international guest details. |
| Live owner authentication and reads | Verified through browser → Vercel → signed Apps Script → Google Sheets. Original Sheet1 preserved; Rooms contains all 15 active units and correct 80,000/50,000 FCFA rates. |
| Live browser booking save | Website acknowledged a clearly labeled fictional confirmed stay in studio 2C, March 10–12, 2030: 50,000 FCFA/night, total 100,000 FCFA. Accented guest name and notes survived. The native browser cancellation confirmation stalled in the agent's browser; this particular test record was cancelled through the signed gateway instead. Browser cancellation confirmation is not claimed as verified. |
| Live gateway overlap/retry test | Two concurrent signed gateway requests for the same apartment and dates produced one confirmation and one CONFLICT. Replaying the winning command returned the same booking with replayed=true; no duplicate. Cancellation acknowledged, followed by a fresh ledger read. This was a gateway test, not two independent authenticated staff browsers. |
| Test cleanup | Three labeled fictional records, including one reconciled record from an earlier partially successful diagnostic run, are all CANCELLED. They do not hold units. Cancelled history is retained. No real guest data used. |
| Write switches | Apps Script WRITES_ENABLED=true and Vercel production BOOKING_WRITES_ENABLED=true for the owner-approved non-commercial tests. Preview remains false in a separate variable. Blank templates still default false. |
| Sheet sharing | Changed from Anyone with link/Editor to Restricted. Owner remains the sole named collaborator. Direct manual edits still bypass the script lock; staff must use the website. |
| Public API | Separate requests without browser cookies: /api/status → 200, configured=true, writesEnabled=true; /api/ledger → 401 SIGN_IN_REQUIRED. No temporary share link or protection bypass. |
| Shared staff login | Username staff; owner-only password form deployed and live settings read verified. Latest live check: disabled until the owner sets a 14–128 character password directly on the website. Correct-password login/rotation/disable are locally tested; no real shared-password browser login claimed yet. |
| Runtime error scan | No error/fatal groups returned for the latest implementation deployment during the 15-minute scan. Ongoing monitoring is not configured by this change. |
| Remaining limits | Real interrupted-save recovery and two separate staff-browser competition remain untested live. Existing reservations require reconciliation; guest capacities remain unconfirmed. This is a non-commercial proof of concept, not a reconciled business availability ledger. |

Local suite: **57 tests passed, 0 failed**, Node.js 24. Local simulations and live checks are distinct evidence. Private test journals and connection settings are excluded from GitHub. Passwords are entered only on the website and hashed on the server; hashes and attempt counters reside in private Script Properties, never Sheet cells or public source.
