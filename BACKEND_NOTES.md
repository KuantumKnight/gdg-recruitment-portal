# Backend implementation and verification

## Response storage
The form must use stable field IDs, because the original question strings contain punctuation and are not safe React Hook Form paths. `buildSubmissionPayload` maps opaque UI IDs back to original stored question keys. The shared strict Zod schema explicitly includes Gender and the motivation answer; both are preserved through parsing into the stored record. Required answers and unknown fields are rejected.

The API derives Email from the authenticated session, selects only known fields for storage, sets shortlisted=false and schemaVersion=2, and derives Pref from the committed application count. This prevents client payloads from assigning privileged state or misordering preferences.

## Atomic submission limits
Previously the handler queried submissions and then independently called collection.add. Concurrent requests could all observe a count below two and commit more than two applications. New writes read/update an applicationIndexes document keyed by the SHA-256 hash of the normalized email inside the same Firestore transaction that creates the response. Firestore retries conflicting transactions. Same-department requests return the original ID and do not overwrite original answers. Different-department requests are limited to two.

For accounts without an index the transaction queries legacy formData documents by normalized and original session email and seeds its count from those results. It also recognizes Department nested under Questions in records written by the old alternative action. Old records remain untouched. Mixed-case historic email variants other than the current session spelling need a separately reviewed migration; they cannot be enumerated efficiently with Firestore equality queries.

Cost tradeoff: after index initialization, a submission needs one index read and two writes, rather than reading every prior application and writing one record. This intentionally spends one extra write to enforce correctness atomically. Normal applicant reads are capped at 100 documents; the administrative API reads at most pageSize+1 (maximum101), ordered by document ID with cursor continuation. No total collection scan is required for an admin page.

## Privileged route boundaries
Admin listing and shortlist mutation call requireAdmin before database access. requireAdmin requests a fresh uncached session and rejects banned or missing users and non-admin roles. Shortlist validates a boolean-only payload, awaits Next15 route params, and checks document existence inside the update transaction. Applicant routes derive identity from session and reject a different email query. All these responses are private/no-store and unexpected errors reveal no database details. Mutations reject explicit cross-origin Origin headers. JSON bodies have streamed byte limits as well as Content-Length checks.

## Verification
`vitest run tests/backend.test.js`: 10 tests passed locally. These verify complete response mapping/persistence, required answers, mass-assignment rejection, server identity/rank, retry preservation, max-two simultaneous calls, legacy counts, normalized identity, deadline boundaries, malformed JSON and actual streamed body limits.

The persistence test double stages writes and serializes transaction callbacks; it checks application invariants against the transaction contract. It does not prove the Firestore emulator/live contention implementation. No external database or email operations were executed.

ESLint passed for completed submission/read/admin/shortlist routes and server/validation helpers with zero warnings.

## Complex repairs completed after explicit approval
The user explicitly authorized completion. The email route now checks requireAdmin before all DB/SMTP work, rejects explicit cross-origin mutations, validates a strict ID-only request, and resolves/validates every selected record before constructing a transporter. Subject/body/recipient limits are 200/3000/50. Stored recipient addresses are authoritative; text is personalized and escaped server-side. The composer and endpoint now share the same contract.

SMTP failures stop the batch and return acceptedIds, uncertainId and unattemptedIds. No automatic resend is performed. Provider acceptance is explicitly distinguished from inbox delivery. The UI shows accepted/unattempted counts on partial failure. No durable delivery ledger or queue is introduced.

Five unused alternate action/model modules were removed after an import scan confirmed no runtime callers. The supplied Archive.zip preserves originals. documentData normalizes the old Department-inside-Questions layout and nested answer map without changing stored documents. Canonical current records keep their structure; Firestore IDs override any stored ID field.

The documented GOOGLE_APPLICATION_CREDENTIALS option is restored in the database guard, and options use Firebase AppOptions typing. Latest regression run: 54 tests passed, including 17 mail tests with mocked DB/SMTP and 3 legacy reader tests. No mail or live database operations occurred.

## Additional route verification

Vitest backend plus route suites: 17 tests passed. Seven mocked route tests verify401/403 before database access for both admin listing and shortlisting, bounded pagination, boolean shortlist validation, and awaited params with404 before mutation. vitest.config.mjs supplies the project @ import alias. These tests perform no network, database, or email actions.



## Final complex-work verification — September 6, 2026
- npm test: 54 tests passed across six files (including 17 mail and three legacy-reader regressions).
- npm run typecheck: passed; production build also completed type validation.
- npm run build: passed with Next.js 15.5.25. Generated a random process-only auth secret for compilation; no production credentials were saved.
- Lint: passed with zero warnings after cleaning async client components, placeholder images and particle lifecycle annotations.
- Splitting mail validation out of the shared browser renderer reduced admin first-load JavaScript from 202 kB in the intermediate repair build to 189 kB in the final build. This is a bundle-size observation, not a user-facing speed measurement.
- No runtime imports reference the removed storage modules. No real SMTP send, live database mutation or deployment occurred.
- Removed original modules remain recoverable from the supplied Archive.zip. Real-provider delivery, authenticated browser journeys and Firestore emulator contention remain deployment-verification tasks.

