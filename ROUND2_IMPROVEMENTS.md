# Round 2 improvements
Updated September 6, 2026. Working project: Archive.

## Status and verification
The previously blocked complex repairs are now implemented following explicit user approval: email is admin-only and resolves recipients from stored applicant IDs; five unused legacy action/model modules were removed. This remains a local implementation, not a deployment-ready signoff: real credentials, emulator contention tests, authenticated browser checks and a controlled delivery test are still needed.

Latest regression verification (September 6): 54 tests passed across six files; typecheck passed; lint passed with zero warnings; the final production build of the complex repair passed on Next.js 15.5.25 with a random process-only verification secret. No production secret was saved. Homepage wording was subsequently corrected to avoid claiming recruitment is open. No authenticated browser, Firestore emulator, live database, or mail delivery verification has been completed.

The build reports homepage route size 2.73 kB / first load JS 159 kB; departments 3.62 kB / 170 kB; application 18.2 kB / 185 kB; admin 16 kB / 189 kB. These are after-change results, not measured before/after speed claims.

## Architecture
Next.js App Router with React 18, predominantly JavaScript plus TypeScript database/model files. Tailwind styles shared components; react-hook-form and Zod validate applicant inputs. Better Auth authenticates email/password accounts, with optional Google OAuth. Its Firestore adapter and Firebase Admin SDK access the database from the server. Client Firestore access is unnecessary.

Public routes: /, /departments, /join/[...joinIds], /auth/signin, /auth/signout, /development. The admin server page authenticates before rendering its client workspace. The workspace fetches bounded applicant pages and calls a protected shortlist route. Email independently enforces fresh admin authorization, validates a bounded ID-only request, resolves all recipients in Firestore before sending, escapes plain text on the server, and reports partial provider acceptance.

Submission: catalog department UUID and stable question ID -> form values -> shared payload builder -> strict Zod schema -> authenticated route -> transaction -> formData document and applicationIndexes record -> private applicant reads/admin pages -> response dialog/CSV.

External dependencies: Firestore; Google OAuth if enabled; Gmail/Nodemailer if configured. Required deployment secrets include BETTER_AUTH_SECRET and Firestore credentials. The production database guard now accepts explicit service-account fields, GOOGLE_APPLICATION_CREDENTIALS, or emulator configuration. Hosted ambient credential discovery without this explicit configuration has not been verified. No credentials were supplied or invented. There is no Git repository in the supplied extracted project; no commits/history changes were made.

## 1. Preserve complete responses (P0)
Problem: Visible gender and motivation inputs could disappear before persistence; punctuation-bearing question labels were unsuitable form paths.
Evidence: Original FormComp used Zod fields that omitted these inputs and generated field names from question text. Dots can be interpreted as nested react-hook-form paths. An alternative form action also nested Department inside Questions.
Impact: A successful submission could lose useful applicant answers.
Root cause: Schema, UI field paths, payload construction, and storage were separate contracts.
Fix: Stable department/question IDs in the form; explicit buildSubmissionPayload mapping; shared strict createApplicationSchema; Gender, year, motivation and Questions included in the stored allowlist.
Why this approach: Retains historical department/question keys while decoupling display copy from identifiers. No destructive data migration.
Verification: tests/backend.test.js checks all mapped answers and gender/motivation through parsing and a mock storage transaction. No original live database reproduction was performed.
Interview explanation: “The input existed visually, but validation removed it. I traced the value through each layer and made the form and API share the same contract.”
Commit suggestion: fix: preserve complete application responses

## 2. Atomic limits and retry preservation (P1)
Problem: Separate query and add operations could both succeed after concurrent requests observed space below the two-application limit.
Evidence: Original submit-form route read a collection query and later called add outside a transaction.
Impact: Duplicate applications or more than two departments.
Root cause: Check-then-write race.
Fix: A transaction reads a per-email applicationIndexes document and atomically creates the formData response and updates the index. Same-department retries return the existing ID without changing answers.
Why this approach: Simple contention point; Firebase retries conflicting transactions. A second write purchases a correctness guarantee.
Verification: Mock transaction tests cover simultaneous calls, duplicate retry, legacy counts and original-answer preservation. Real Firestore contention still needs emulator verification.
Interview explanation: “I moved the limit check and response write into one transaction so another request cannot slip between them.”
Commit suggestion: fix: enforce application limits atomically

## 3. Authenticate before exposing admin data (P0)
Problem: The original admin server page loaded all applicants before a client role check.
Evidence: Original app/(pages)/admin/page.jsx queried formData and serialized results into AdminContent props.
Impact: UI visibility did not protect applicant information.
Root cause: Authorization happened after data crossed the server/client boundary.
Fix: requireAdmin runs on the server page and independently in listing and shortlist routes. Fresh sessions bypass the cookie cache; banned/missing users are rejected.
Why this approach: One reusable guard with checks at each privileged entry point.
Verification: Seven mocked route tests include 401/403 before any database call, page bounds and shortlist validation.
Interview explanation: “Authentication identifies you; authorization decides what you can do. Both must be checked by the server before reading private data.”
Commit suggestion: fix: authorize applicant access on the server

## 4. Close public Firestore access (P0)
Problem: The supplied rules allowed all reads and writes.
Evidence: firestore.rules contained allow read, write: if true.
Impact: Database clients could bypass application rules.
Root cause: Unrestricted development configuration.
Fix: Deny all client access; approved server operations continue through Firebase Admin SDK.
Why this approach: The project uses server-side database access. Browser users do not need Firestore credentials or direct permissions.
Verification: Rules inspected locally; **not deployed or emulator-tested**. Admin SDK bypasses Firestore rules, making server guards essential.
Interview explanation: “I closed direct database access and kept writes behind authenticated server handlers.”
Commit suggestion: fix: deny direct client database access

## 5. Server-owned identity and bounded validation (P0/P1)
Problem: Loose payload spread allowed undeclared input and missing required fields.
Evidence: Original route spread formFields and only optionally checked registration syntax.
Impact: Inconsistent records and user-controlled state.
Root cause: No complete server input contract.
Fix: Strict schema; session-derived email; server-assigned rank, shortlist default and schemaVersion; streamed JSON byte limits; controlled private/no-store responses; explicit cross-origin mutation rejection.
Why this approach: Small allowlists and shared validation are easier to explain and maintain than framework-wide abstractions.
Verification: Required answers, unknown fields, malformed JSON, body size, identity and rank tests.
Interview explanation: “The browser can suggest data, but the server decides identity and privileged fields.”
Commit suggestion: fix: validate application requests at the trust boundary

## 6. Remove artificial render work (P1)
Problem: Unused calculations and effect chains reran during ordinary interaction.
Evidence: Home ran a 300,000-iteration loop; Hero had 50,000 outer iterations with 20 inner steps; Footer 40,000; form 200,000; department page 100,000; admin 80,000 plus 500 iterations per row. Original mouse/scroll listeners lacked cleanup in Home.
Impact: Unnecessary main-thread work and extra renders.
Root cause: Synthetic telemetry and derived values stored in state.
Fix: Home/Hero/Footer now use server rendering; rewritten components derive values directly or with useMemo. Removed unnecessary listeners, deep-copy session snapshots and random keys.
Why this approach: Removing irrelevant computation is better than memoizing it.
Verification: Source inspection and successful build. No profiler or Lighthouse before/after score was measured.
Interview explanation: “The expensive code did not produce any user-visible value, so I removed it.”
Commit suggestion: perf: remove synthetic rendering workloads

## 7. Bounded admin reads and consistent state (P1)
Problem: Initial full collection scans and multiple filtered copies; shortlist changes could revert after filtering.
Evidence: Original DataTable updated the displayed copy while filters rebuilt from original props; nested array intersection and random keys caused extra work.
Impact: Growing database reads and misleading status.
Root cause: Unbounded fetching and competing state sources.
Fix: Cursor pages of 50 (server max 100 plus one lookahead), explicit load more, one canonical applicant store, derived filtering/sorting, stable IDs and mutation locks.
Why this approach: Bounded startup cost with simple client UX. Search/export explicitly cover loaded records.
Verification: Route limit tests and successful admin build. Authenticated browser interaction remains pending.
Interview explanation: “I store applicants once, derive views, and load only a bounded batch.”
Commit suggestion: perf: bound applicant reads and unify review state

## 8. Draft recovery and reliable submission UX (P2)
Problem: Lost typing, duplicate status fetches and ambiguous partial success.
Evidence: Original form/status flow lacked isolated validated draft recovery.
Impact: Applicants could redo work or resend already-successful applications.
Root cause: No explicit ownership of pending/succeeded state.
Fix: Bounded local drafts keyed by user and sorted department IDs; storage failures handled; saved-copy removal; serial submission; immediately mark successful departments and retry only pending ones; abort stale status requests.
Why this approach: Local storage avoids database draft writes. It is unencrypted device storage and needs a retention/privacy policy before deployment.
Verification: Draft tests cover isolation, malformed values, allowed answer keys, sizes and JSON recovery.
Interview explanation: “I save draft work locally, but only a server response can establish submission success.”
Commit suggestion: feat: recover scoped application drafts

## 9. Readable responsive recruitment experience (P2)
Problem: Bare pages, corrupted labels, inconsistent layouts and poor feedback.
Evidence: Supplied constants contained garbled department/question text; department card IDs linked intact titles to old identifiers.
Impact: Applicants could not understand what they were applying for.
Root cause: Corrupted content plus minimal UI implementation.
Fix: Charcoal/lime visual system, semantic navigation, responsive cards, search/category filters, selection summary, focus styles, reduced-motion support and themed form/error/success states.
Why this approach: Preserves GDG context and stored identifiers. New readable prompts are **authored replacements**, not recovered original wording, and require organizer review.
Verification: Rewritten components pass targeted lint; overall build passes. Visual browser and keyboard audits remain pending.
Interview explanation: “I made choosing a department and completing an application clear without changing stored identities.”
Commit suggestion: feat: improve recruitment navigation and application UX

## 10. Safe response export and compatibility (P1/P2)
Problem: Historical answer formats and spreadsheet interpretation could damage exports.
Evidence: Responses may be maps, tuples, strings or question/answer objects; arbitrary text can be interpreted by spreadsheet software.
Impact: Missing readable answers or unintended formula evaluation.
Root cause: Exporting arbitrary records without normalization.
Fix: Friendly display labels over legacy keys; preserve false/zero; fixed column allowlist; quote escaping, UTF-8 BOM and neutralized formula/control-leading cells.
Why this approach: Simple pure utilities are easy to test. CSV contains applicant personal data intentionally and requires admin access.
Verification: 14 admin utility tests.
Interview explanation: “CSV is an output format with its own rules, so I normalize and escape it instead of dumping objects.”
Commit suggestion: fix: normalize response display and CSV export

## 11. Shared configuration and build maintenance (P1/P2)
Problem: Hardcoded dates and an outdated Next 14.2.5 baseline; no reliable local lint/typecheck/test workflow.
Evidence: Date literals, package.json and missing compiler/lint configs.
Impact: Frontend/server disagreement and difficult verification.
Root cause: Scattered configuration and incomplete tooling.
Fix: lib/recruitment.js centralizes deadline and limit; env example documents deadline; Next 15.5.25 and matching ESLint config; Node >=22; npm lockfile; cross-platform clean script; TypeScript and Vitest configuration; basic security headers.
Why this approach: Targeted framework maintenance. Keep original August 23 recruitment deadline; September 8 is the engineering evaluation deadline and does not authorize reopening recruitment. NEXT_PUBLIC changes require rebuild.
Verification: Build/typecheck/tests pass. The final production-only audit reports 33 advisories (32 moderate, 1 high), primarily transitive Firebase/Google Cloud, PostCSS/Next and Tiptap findings. Nodemailer was upgraded to 10.0.0, removing its direct high-severity findings. Remaining fixes require major-version upgrades or have no upstream fix; no blanket force-upgrade was applied. npm and Bun lockfiles are synchronized.
Interview explanation: “I separated the recruitment policy from presentation and made verification reproducible.”
Commit suggestion: chore: standardize configuration and verification

## Remaining work requiring explicit attention
- Email repair complete locally. Delivery tests use a mocked provider. SMTP acceptance is not inbox delivery; uncertain outcomes require provider-record inspection before manually retrying. Batches are capped at 50 and there is no durable queue or exactly-once guarantee.
- Legacy repair complete: removed the unused form/data/user actions and form/user models after confirming no runtime callers. The supplied Archive.zip retains original source. Existing legacy records are normalized at read time without database mutation.
- Configure real auth/database secrets; verify Firebase behavior with an isolated emulator and test authenticated browser flows.
- Review new questionnaire wording with the organizer; no original wording can be recovered from the garbled source.
- npm and Bun lockfiles are synchronized, one Vitest config is retained, and dependency advisories remain for deployment review.
- Finish sign-in/profile visual polish and measure browser accessibility/performance.
- Rules changes exist locally only. No deployment, live database write or outbound mail occurred.

## Final priority table
| Priority | Issue | Area | Severity/Impact | Status | Files Changed | Verification |
|---|---|---|---|---|---|---|
| P0 | Lost answers | Data | Applicant data loss | Fixed locally | FormComp; validation/application; server/applications | Persistence tests |
| P0 | Client admin gate | Security | Private data exposure | Fixed selected routes | admin page; authorization; applicant/shortlist routes | Mock route guards |
| P0 | Open Firestore rules | Security | Unrestricted client DB access | Local fix, deploy pending | firestore.rules | Source review |
| P0 | Email endpoint | Security | Unauthenticated mail | Fixed locally | send-email route; lib/mail; composer/table | 17 mocked mail tests |
| P0 | Legacy write paths | Data | Inconsistent alternate persistence | Removed unused modules; read compatibility fixed | Five legacy modules removed; server/applications | Import scan; 3 legacy tests |
| P1 | Concurrent limits | Data | More than two applications | Fixed locally | server/applications | Mock transaction tests |
| P1 | Loose payload | Backend | Inconsistent/privileged data | Fixed locally | validation; API helpers/routes | Schema/body tests |
| P1 | Render loops | Performance | Main-thread work | Removed active-path loops | Home/Hero/Footer; form/departments/admin | Source/build |
| P1 | Unbounded admin reads | Cost | O(N) initial reads | Bounded pages | admin API/Content/Table | Limit tests |
| P2 | Draft loss | UX | Repeated applicant effort | Fixed locally | draft helper; FormComp; provider | Draft tests |
| P2 | Garbled copy | UX | Unusable questions | Replacement copy; review pending | catalog; public/admin UI | Build |
| P2 | Unsafe CSV | Export | Spreadsheet interpretation | Fixed locally | admin-utils | Utility tests |
| P2 | Verification setup | Tooling | Unreliable checks | Added | package; configs; tests | 54 tests/typecheck/build passed |



## 12. Complete the email trust boundary (P0)
Problem: The original endpoint had no authentication, accepted recipient addresses from the browser, and inserted client HTML into messages. The new composer and old endpoint also disagreed on payload shape.
Evidence: Original app/api/send-email/route.js read recipients and payloadData directly, then called Nodemailer. DataTable had moved to IDs but the handler still expected Email/Name/Department.
Impact: An unauthorized caller could request outbound mail if provider credentials were configured; legitimate admin messages could fail due to the contract mismatch.
Root cause: Email was treated as a UI operation instead of an independently protected backend operation.
Fix: Fresh requireAdmin before any DB/provider setup; origin validation; streamed 32 KiB body bound; strict server schema for 1–50 unique applicant IDs, a 200-character one-line subject and 3,000-character plain-text message. Firestore supplies recipient contact fields. All selected records are validated before any send. A shared renderer expands supported placeholders once and escapes the final HTML; server schema imports stay out of the browser bundle.
Why this approach: Fits the existing small admin workflow without new infrastructure. Plain text avoids requiring a rich-HTML sanitizer. SMTP timeouts and disabled file/URL loading bound provider behavior. No queue or exactly-once promise is implied.
Verification: 17 mocked mail tests cover authentication/authorization rejection before side effects, origin/input bounds, missing configuration/records, stored addresses, rendering, provider rejection and partial acceptance. Neither the database nor SMTP was contacted by tests.
Interview explanation: “I never trust the browser to tell the server where to send email. The browser selects applicant IDs; the server checks the admin and looks up the actual addresses.”
Commit suggestion: fix: authorize and validate applicant email delivery

## 13. Retire alternate writers and support historical records (P0/P1)
Problem: Unused form/data/user actions and generic form/user models retained independent unrestricted reads/writes. The old form action nested Department and sometimes the whole answer map inside Questions.
Evidence: Import scans found no runtime callers for these five modules. The canonical submit route already used the validated transactional service. Legacy index bootstrap recognized nested Department, but normal read formatting did not.
Impact: Future callers could accidentally restore inconsistent persistence; existing records could appear to have no department or unusable answers.
Root cause: Parallel data-access implementations plus a historical record-shape mismatch.
Fix: Remove the five unused modules, leaving the active canonical route/service. Normalize both historical nested formats in documentData when reading; current records retain their shape and Firestore IDs remain authoritative. No stored record was rewritten.
Why this approach: Removing dead alternate writers is simpler than maintaining compatibility wrappers with no callers. Read compatibility preserves history without a production migration. Original source remains recoverable from Archive.zip.
Verification: No unresolved imports; three legacy reader tests cover nested answers, flat historical answers and unchanged current records. Existing transaction/schema tests continue to pass.
Interview explanation: “I kept one validated write path and made reads understand old records, so fixing the code did not require changing applicant data.”
Commit suggestion: refactor: retire duplicate persistence and normalize legacy reads



## Final complex-work verification — September 6, 2026
- npm test: 54 tests passed across six files (including 17 mail and three legacy-reader regressions).
- npm run typecheck: passed; production build also completed type validation.
- npm run build: passed with Next.js 15.5.25. Generated a random process-only auth secret for compilation; no production credentials were saved.
- Lint: passed with zero warnings after cleaning async client components, placeholder images and particle lifecycle annotations.
- Splitting mail validation out of the shared browser renderer reduced admin first-load JavaScript from 202 kB in the intermediate repair build to 189 kB in the final build. This is a bundle-size observation, not a user-facing speed measurement.
- No runtime imports reference the removed storage modules. No real SMTP send, live database mutation or deployment occurred.
- Removed original modules remain recoverable from the supplied Archive.zip. Real-provider delivery, authenticated browser journeys and Firestore emulator contention remain deployment-verification tasks.





## Final environment verification

- Production server smoke test passed locally for /, /departments, /auth/signin, /development, and /join/demo; security headers included nosniff, DENY, and strict-origin-when-cross-origin.
- Firestore emulator startup was attempted with a temporary Java 21 runtime. The emulator still failed inside this Windows environment while Java opened its internal loopback selector (Invalid argument: connect). No production Firestore writes were attempted.
- Credential presence checks found no Firebase, Better Auth, or SMTP credentials in the environment, so authenticated persistence and real mail delivery were not fabricated.


