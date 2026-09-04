# Interview notes
Ranked by interview value. Read ROUND2_IMPROVEMENTS.md for evidence and current limitations.
Email authorization and legacy-storage repairs are now complete locally. Do not claim the site is production-ready: authenticated browser, emulator contention and real mail delivery verification remain outstanding.

## 1. Hidden response-storage malfunction
20 seconds: “Some visible answers disappeared before the database write because the validation schema did not include them. Question text was also used as a field path. I introduced stable field IDs and a shared schema that explicitly preserves all intended fields.”
Technical: react-hook-form treats dotted paths structurally. The browser uses department UUID + question ID; buildSubmissionPayload maps those IDs to legacy stored keys. Strict Zod validation checks required responses and the server writes an explicit allowlist.
Follow-up: “Why not just allow all unknown fields?” Answer: passthrough can conceal mistakes or permit privileged fields. Explicit fields catch contract drift.
Alternative: Store an array of question IDs and answers with a versioned questionnaire collection.
Trade-off: Current mapping preserves old keys without migration, but readable prompt replacements need organizer review.
Verification: Backend tests exercise mapping, validation and mock persistence. This is not a live database reproduction.

## 2. Server-side admin authorization
20 seconds: “The old server page fetched private responses and only checked the role in a client component. I moved the permission check before data access and repeated it at each privileged API.”
Technical: Server components can serialize props into the browser response. Hiding a component does not erase those props. requireAdmin obtains a fresh session, rejects missing/banned users and checks the admin role.
Follow-up: “Why repeat it in the API?” Answer: APIs are independent entry points and cannot rely on a page having been visited.
Alternative: Shared middleware plus handler guards.
Trade-off: Fresh-session checks add reads but avoid relying on a stale role snapshot.
Verification: Mocked 401/403 tests assert the database was never called. The email route now also checks fresh admin authorization before any database/provider access.

## 3. Atomic application limits
20 seconds: “Two requests could both see one application and each add another. I made every request for an applicant read and update the same index document inside a transaction.”
Technical: The transaction reads the applicant index, checks department/count, creates the response and updates the index. Firestore detects concurrent changes and retries the callback. Never send emails inside that callback.
Follow-up: “Why not disable the submit button?” Answer: UI controls cannot coordinate multiple tabs, retries or simultaneous requests.
Alternative: Store both responses inside one applicant document.
Trade-off: One extra index write versus simpler independent documents and atomic enforcement.
Verification: The fake serializes transactions to test invariants. Actual Firestore retry/contended behavior still needs emulator testing.

## 4. Idempotent retries
20 seconds: “A network timeout does not tell the browser whether the write succeeded. A retry for an already-submitted department returns the existing ID and preserves the first answers.”
Technical: Department identity is checked inside the same applicant transaction. Duplicate responses return success without overwriting.
Follow-up: “What if the user edited answers before retrying?” Answer: First submission wins under this policy; editing would need a separate explicit update feature.
Alternative: A client-generated idempotency key persisted with each request.
Trade-off: Department-level idempotency suits one application per department, but is unsuitable for a product allowing multiple attempts.

## 5. Firestore rules and server trust
20 seconds: “The database rules allowed every client to read and write. Since this app uses a server API, I denied direct client access and kept server operations behind role checks.”
Technical: Firebase Admin SDK bypasses client security rules. Better Auth sessions are not automatically Firebase client auth identities.
Follow-up: “Do deny-all rules protect a bad API?” Answer: No. Server authorization and input validation still determine what Admin SDK can do.
Alternative: Firebase client authentication with carefully scoped per-user rules.
Trade-off: Server-only access keeps this app simpler but uses server compute.
Verification: Rules changed locally only. Deployment and emulator validation are outstanding.

## 6. One validation and identity contract
20 seconds: “Client validation helps the user; server validation protects data. Both now share field definitions, while email, rank and shortlist state come from the server.”
Technical: Registration is normalized, text lengths bounded, required questions enforced, unknown fields rejected. JSON streaming enforces actual byte size instead of trusting Content-Length.
Follow-up: “Why accept an Email field at all?” Answer: Compatibility/display input is never trusted for identity; the authenticated session email is persisted.
Alternative: A separate DTO/schema for each API version.
Trade-off: A shared schema reduces drift; a major change to that schema still needs compatibility planning.
Verification: Required field, mass-assignment, identity/rank, JSON and size tests.

## 7. Removing artificial React work
20 seconds: “The app performed large loops for telemetry with no product value, then cascaded state updates on mouse movement. I removed the work and rendered static content on the server.”
Technical: A parent render reruns function bodies. Extra derived-state effects can cause additional renders. Random keys remount rows and lose DOM state.
Follow-up: “Why not useMemo everywhere?” Answer: Memoization still performs unnecessary work once and has dependency overhead. Remove irrelevant work first.
Alternative: For real heavy computation, cache on the server or move it to a worker.
Trade-off: Static content becomes simpler; interactive pieces retain client boundaries.
Verification: Code inspection and build results, not a measured Lighthouse percentage.

## 8. Database cost and bounded review
20 seconds: “The admin page previously loaded the entire collection. It now loads 50 records with a cursor, so initial reads are bounded.”
Technical: Query orders by document ID and fetches limit+1 to discover another page. Filtering and export cover loaded records and say so in the UI.
Follow-up: “How much money did you save?” Answer: Initial reads go from N records to at most 51 for the default page; actual currency depends on usage and Firestore pricing. Loading everything still costs roughly everything plus lookahead.
Alternative: Indexed server-side filters or a dedicated search service.
Trade-off: Simple bounded startup, but no global full-text search.
Verification: Pagination validation tests; no live bill measurements.

## 9. Canonical admin state and safe CSV
20 seconds: “Shortlisting changed a displayed copy of data, so a filter could restore an old status. I keep one applicant store and derive filtered views from it.”
Technical: Stable document IDs identify updates and selections. State changes follow API success; one handler updates both table and details. CSV has a fixed column list and escapes quotes and formula-like values.
Follow-up: “Why avoid optimistic updates?” Answer: Waiting for success is simpler here and prevents rollback complexity for sensitive status changes.
Alternative: Optimistic mutation with rollback and cache invalidation.
Trade-off: A small wait for clearer persisted state.
Verification: Utility tests cover current/legacy response formats, false/zero values, friendly labels and export encoding.

## 10. Draft recovery and partial success
20 seconds: “Drafts are isolated by account and selected departments. If the first department succeeds and the second fails, retry sends only the unfinished application.”
Technical: localStorage content is untrusted; allowed fields and answer IDs are filtered and text bounded. Exceptions handle disabled storage or malformed JSON. An abort controller prevents stale status fetches from updating a newer account.
Follow-up: “Is localStorage secure?” Answer: It is unencrypted device storage accessible to same-origin scripts. It saves database writes, but shared-device privacy and retention need attention.
Alternative: Server drafts keyed by authenticated user with retention expiry.
Trade-off: Free local draft writes and offline recovery versus cross-device access and privacy concerns.
Verification: Account/selection isolation, malformed content and bounds tests; browser success/failure flows remain to verify.

## 11. Shared deadline and configuration
20 seconds: “The evaluation deadline and recruitment deadline are different. I retained the supplied recruitment date and centralized it so the UI and server enforce the same instant.”
Technical: Invalid date configuration fails closed. NEXT_PUBLIC values are embedded in the client build, so deadline changes require rebuilding and deploying consistently.
Follow-up: “Why not change it to September 8?” Answer: September 8 is the engineering submission deadline; reopening intake changes product policy without evidence.
Alternative: Server-fetched recruitment configuration with a controlled admin editor.
Trade-off: Environment configuration is simpler, but updates require deployment.

## 12. Verification and honest limits
20 seconds: “I added regression checks around data loss, limits, authorization and recovery, then built the production app. I distinguish mocked guarantees from behavior that still needs real integration tests.”
Technical: 54 tests across backend, routes, drafts, admin utilities, email and legacy reads; typecheck and build passed. Lint passed with zero warnings. No mail, live DB writes or deployment was performed.
Follow-up: “What would you test next?” Answer: An isolated Firestore emulator with concurrent submissions, authenticated browser journeys, real keyboard/mobile checks, and controlled mail delivery only after authorization repair.
Alternative: End-to-end-only testing.
Trade-off: Fast unit/contract tests isolate logic, while integration tests are required for provider behavior.
Do not claim: all security issues fixed, zero dependencies at risk, production deployment complete, measured performance gains, or original garbled questions recovered.

## Core concepts to study first
1. Trace Gender and motivation through FormComp, buildSubmissionPayload, Zod, submit-form and saveApplication.
2. Explain the two-request race and the shared transaction document.
3. Explain why server props and direct APIs need authorization before data access.
4. Explain Firebase client rules versus Admin SDK and Better Auth sessions.
5. Run the tests and explain what a fake database proves and what it cannot prove.

## Quick likely questions
- Client vs server components: server components render without browser hooks; interactive form/nav/admin components use client code. Never pass private data to an unauthorized client.
- useEffect cleanup: remove listeners, clear timers and abort fetches; cleanup also runs before changed effects and during development checks.
- Derived state: calculate filtered counts from canonical data; avoid effects merely copying props/session values into new state.
- Zod unknown keys: object schemas strip unknown keys by default; strict rejects them. Explicitly model every intended persisted field.
- Firestore indexes: simple ordered listing uses document IDs; combined query patterns may need configured indexes. Query plans must match actual product filters.
- Transactions: read relevant state and write consistently; callbacks can retry, so keep external side effects out.
- LocalStorage: synchronous, size-limited, untrusted, non-secret storage; isolate accounts and handle read/write exceptions.
- Cost: count reads/writes and document size before estimating currency. Transactions may retry and cost more than the successful happy path.
- Auth session caching: cached sessions reduce reads but stale roles require fresh checks for privileged operations.
- Missing credentials: provide them through deployment configuration. A temporary process-only secret verified the build; never deploy that verification value.

## 13. Email repair and retiring duplicate persistence
20 seconds: “The email endpoint trusted browser-supplied recipients and lacked an admin check. It now validates fresh admin access, accepts only stored applicant IDs and prepares the complete batch before sending. I also removed unused alternate database writers.”
Technical: At most 50 unique IDs, subject/body limits, streamed request bounds and explicit origin checks. Firestore provides addresses. Plain-text content is personalized once and HTML-escaped on the server. The UI uses the same renderer for preview.
Follow-up: “Can SMTP guarantee exactly-once delivery?” Answer: No. A message may be accepted before a connection failure. The API reports accepted IDs, the uncertain ID and unattempted IDs, stops further sends, and does not retry automatically.
Alternative: A durable job queue and per-recipient delivery ledger with provider idempotency where supported.
Trade-off: Simple bounded synchronous batches fit small admin campaigns; larger batches or short server timeouts need a queue. Admin users can still intentionally send repeated campaigns.
Legacy storage: Import scans found no active callers for the five alternate action/model modules. Removing them leaves the canonical validated transaction route. Read-time normalization supports old nested records without rewriting historical data.
Verification: 17 mocked mail tests plus three legacy reader tests. No real email or database operation was executed.
Commit suggestions: fix: authorize and validate applicant email; refactor: retire unused persistence paths.



