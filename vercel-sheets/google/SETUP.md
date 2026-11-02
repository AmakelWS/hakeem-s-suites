# Connect Google Sheets and Vercel

Target: the owner-selected Google spreadsheet. Copy its ID from the spreadsheet URL into GOOGLE_SPREADSHEET_ID and the matching script SPREADSHEET_ID. Keep the actual link and credentials in private configuration.

Complete initial setup with the account that owns the sheet. A public viewing link is insufficient for script execution. Keep guest records private and restrict staff to viewing the sheet once the website is in use.

## 1. Authorize and initialize one script project

1. Sign in with the Google account that owns the sheet. Confirm it permits Apps Script web apps. For setup assistance inside Codex, install/connect Google Drive using that account.
2. Create a **standalone** Apps Script project at [Apps Script](https://script.google.com/). Do not bind a credential-bearing script to a spreadsheet that other people can edit. Only trusted administrators should have script-project access.
3. Paste the complete `google/BookingGateway.gs` into one script file. This generated file contains both rules and entry points; do not also paste Rules.ts or Gateway.js as duplicate files. Rebuild it with Node.js 24 and `npm run build:gateway` after source changes.
4. Enable the advanced Google Sheets service, version v4. Configure the manifest using `google/appsscript.json`; enable Google Sheets API in the associated Cloud project if required by the chosen project type. The script requests spreadsheet access from its owner. The owner must review and authorize Google’s access prompt.
5. In Project Settings → Script Properties, add these values. Generate the secret locally; never place it in the sheet, frontend or chat.

| Script property | Value |
| --- | --- |
| SPREADSHEET_ID | The configured target sheet ID; use a separate ID for acceptance tests |
| GATEWAY_SECRET | Random secret of at least 32 characters, shared only with Vercel |
| OWNER_EMAILS | Comma-separated Google account emails for approved owners |
| STAFF_EMAILS | Comma-separated Google account emails for approved staff |
| WRITES_ENABLED | `false` initially |

6. On a separate disposable test spreadsheet first, select and run `initializeBookings`. It creates Rooms and Bookings in one batch, preserves original tabs, and refuses to overwrite either existing integration tab. It seeds the exact 15 units and rates; capacities stay blank. Verify the result in Google Sheets. Do not run it repeatedly or against an existing ledger.
7. Later, initialize the supplied live sheet through the same reviewed process with writes disabled. Back up existing content first. Existing reservations are not imported automatically.
8. Deploy this project as a web app that executes as its owner and accepts server requests without an interactive Google login (“Anyone,” where permitted). **The owner must approve this access change at deployment time.** The endpoint is reachable publicly, but every booking operation rejects requests without a valid signature, matching sheet ID and allowlisted actor. The sheet itself must remain private. Unsigned GET requests expose no records.
9. Copy the deployed `/macros/s/DEPLOYMENT_ID/exec` URL to Vercel’s `GOOGLE_SCRIPT_URL`. `/dev` is not the production endpoint. Changing script source requires updating the deployed version. Keep every active deployment for one sheet in this same script project so all operations share the script lock.

Never remove signature checks to work around a deployment or authorization error. If the Google account prohibits this deployment model, use an approved account or an explicitly agreed different architecture.

## 2. Set up Google staff sign-in

1. In a Google Cloud project controlled by the owner, configure Google Auth Platform branding/audience and create an OAuth 2.0 **Web application** client. This is separate from the Apps Script owner’s spreadsheet authorization.
2. Register the exact redirect URI `https://YOUR-STABLE-DOMAIN/auth/callback`. Add a separate local development callback only if needed. The app requests only `openid profile email`; staff do not grant it general Drive/Sheets access.
3. Configure consent-screen status and permitted test users appropriately. Confirm all intended staff can use sign-in before launch. Do not assume every Google Workspace domain permits the app.
4. Store the client ID and client secret server-side in Vercel. The official Google library verifies ID-token signatures, issuer, audience and expiry; the app additionally checks nonce, verified email and its allowlists. Google identifies a staff member by its stable account subject and verified email.
5. Set OWNER_EMAILS and STAFF_EMAILS consistently in both Vercel and Script Properties. A role mismatch is rejected. Removing access in either layer denies subsequent requests; wait for in-flight operations to finish when changing permissions.

## 3. Configure Vercel

Use `vercel-sheets` as the project root. The old local website on port 8080 is the earlier Java/MySQL version; it does not automatically become this Google application.

Import AmakelWS/hakeem-s-suites and set Root Directory to vercel-sheets. Use a business-appropriate Vercel plan; Hobby is restricted to personal non-commercial use. A GitHub import does not transfer any private local credentials. No paid subscription is authorized by these instructions alone.

Framework Other, output `public`, Node.js 24, install `npm ci`, no frontend build command. The supplied vercel.json routes `/api/*` and `/auth/*` to the server function. `.vercelignore` excludes environment files, setup sources, tests and the development server from upload.

Set variables from `.env.example`:

| Variable | Purpose |
| --- | --- |
| APP_URL | Exact stable HTTPS origin, without a path |
| GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET | Google OAuth web client credentials |
| SESSION_SECRET | Separate random session-signing secret, at least 32 characters |
| OWNER_EMAILS / STAFF_EMAILS | Approved Google account emails; match script allowlists |
| GOOGLE_SCRIPT_URL | Exact deployed script `/exec` URL, without credentials or query parameters |
| GOOGLE_SCRIPT_SECRET | Same secret as script GATEWAY_SECRET |
| GOOGLE_SPREADSHEET_ID | Exact same sheet ID as script SPREADSHEET_ID |
| BOOKING_WRITES_ENABLED | `false` until acceptance checks pass |
| APP_CURRENCY | `XAF` |
| PROPERTY_TIMEZONE | `Africa/Douala` |

Keep production and test script projects, secrets and spreadsheets separate. Do not point a test deployment at the live sheet for writes. Pull the intended development environment and verify keys before starting a connected local server. Redeploy after changing Vercel variables.

Both Vercel’s BOOKING_WRITES_ENABLED and the script’s WRITES_ENABLED must be true for saves. Public `/api/status` only reports configuration and the Vercel write switch; it is not a live Google connection check. Authenticated ledger read is required to establish actual connection health.

## 4. Live acceptance tests

Use a disposable test sheet with actual unit IDs and fictional guest records. Enable both write switches only on that test setup.

1. Verify owner and staff sign-in, denied unlisted accounts, signed-out API denial and no secrets in browser assets or responses.
2. Save a confirmed fictional stay. Verify exact row contents, date text, nightly rate, total, actor, version and request ID in the actual Google Sheet. Refresh from a second independent staff session and verify the record appears.
3. Submit overlapping confirmed stays simultaneously from two independent staff sessions. Exactly one may confirm; the other must conflict. Check that all requests run through the same script project. Repeat around response delays and immediate retries.
4. Check adjacent stays and different units succeed. Pending requests may overlap, but confirmation must reject a conflict. Cancelling releases the unit. Test check-in/out and stale edits.
5. Check studio/apartment totals, changing dates, moving units, retained agreed rates, invalid dates and invalid payments.
6. Submit literal text beginning with `=`, `+`, `-`, `@` and apostrophes. Verify the cells contain text, not formulas, and the same text is returned after refresh.
7. Interrupt a response after a save. Check or retry the exact same request reference and verify one row only. Reload and confirm pending-request recovery for the same staff account. A BUSY or authentication error must not discard an unresolved reference.
8. Exercise a real script/API failure on the disposable setup. If a write cannot be read back, verify UNRESOLVED_WRITE pauses the gateway. Verify the management recovery process below. Never erase the flag merely to resume taking bookings.
9. Verify staff cannot edit the sheet or script directly, backups/version history are available, and no other writer targets the live ledger. Monitor Apps Script and Sheets quotas; do not use continuous polling.
10. Load and reconcile every existing reservation and blocked stay before trusting live availability. Review the 15 units and prices with management. Confirm capacities separately before guest-count enforcement.

Record the live test results before enabling the production switches. A mocked lock test cannot prove actual Google consistency or deployment behavior.

## 5. Recover an ambiguous save

The script writes a small UNRESOLVED_WRITE marker to Script Properties before each row replacement. It removes it only after a matching readback. An execution killed between those steps leaves the marker and pauses new booking decisions, including request lookup. A lost HTTP response after successful readback is handled by the normal idempotent retry.

For a persistent marker, management must:

1. Disable both write switches and stop new submissions. Wait until all script executions that could write have finished; inspect Executions, including failures and timeouts. Revoking/pausing the deployment may be needed during investigation.
2. Inspect the marker’s request ID, booking ID, range and start time, then inspect the row and spreadsheet version history. Reconcile with the submitting staff member and their exact retained command. Do not start a second booking to replace an uncertain one.
3. Repair or reconcile the actual ledger during maintenance, keeping IDs, versions and request metadata consistent. If the result cannot be established, leave the gateway paused.
4. Only after the outcome is established and no prior execution can still write, remove UNRESOLVED_WRITE through Script Properties, verify the ledger and the original request, then re-enable the reviewed setup.

Never automatically clear the marker on a timer. Locks coordinate only this script project; they do not block manual spreadsheet editing or other applications.

References: [Google web apps](https://developers.google.com/apps-script/guides/web), [script locks](https://developers.google.com/apps-script/reference/lock/lock-service), [advanced Sheets service](https://developers.google.com/apps-script/advanced/sheets), [RAW writes](https://developers.google.com/workspace/sheets/api/reference/rest/v4/ValueInputOption), [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas), [Vercel Hobby restrictions](https://vercel.com/docs/plans/hobby).

## Optional shared staff password

Deploy the current generated BookingGateway.gs to the same existing Apps Script deployment, retaining its spreadsheet pin, private HMAC key and owner allowlist. Do not create another script writer. The Google owner can then use the website's Shared staff login panel to set or disable the password for username `staff`. This does not enable booking writes. The gateway stores `SHARED_STAFF_CREDENTIAL` (scrypt hash and revocation version) and `SHARED_STAFF_ATTEMPTS` (persistent attempt counter) in private Script Properties automatically. Do not copy them into Sheet cells, public source or browser storage. Rotating or disabling staff access revokes existing sessions; keep the separate Google owner recovery login.

## Simplified booking schema

Deploy the current gateway and frontend together. Bookings uses 17 columns, without business reference or fingerprint fields. Do not delete columns manually while an older gateway is in use. For an owner-authorized clearing, use the guarded editor utilities described in the README: pause, back up, clear/migrate, verify and resume. Cleared IDs are retired privately to reject stale retries. A creation retry after a later amendment must be reconciled by request lookup rather than reapplied.
