# GDG Recruitment Portal

A production-oriented recruitment portal for **Google Developer Groups on Campus · VIT Chennai**.

The project started as a partially complete recruitment site and has since been hardened across authentication, data integrity, admin access, UX, testing, and deployment readiness.
<img width="1280" height="704" alt="image" src="https://github.com/user-attachments/assets/8759fba5-f224-4b88-991a-e527fae9b2fc" />

## Live deployment

**https://gdg-recruitment-portal-omega.vercel.app**

> The repository code is deployment-ready from a CI perspective. Production behavior still depends on correctly configured Google OAuth, Firebase, Better Auth, and optional SMTP environment variables.

## Current status

| Area | Status |
| --- | --- |
| Public recruitment UI | Complete |
| Google-only authentication | Complete |
| `@vitstudent.ac.in` enforcement | Complete |
| Server-side authorization | Complete |
| Application submission flow | Complete |
| Atomic application limits | Complete |
| Draft recovery | Complete |
| Admin applicant workspace | Complete |
| Shortlisting workflow | Complete |
| Admin email workflow | Complete in code |
| CSV export hardening | Complete |
| Responsive / Material-style redesign | Complete |
| Unit / integration tests | Passing |
| Production build | Passing |
| Playwright browser tests | Passing |
| Production OAuth / Firebase / SMTP verification | External configuration / final validation required |

## What has been completed

### 1. Google-only VIT student authentication

Authentication is intentionally restricted to Google OAuth.

- Removed email/password sign-in from the user-facing flow.
- Google is the only supported login provider.
- Only accounts ending exactly in `@vitstudent.ac.in` are accepted.
- Personal Gmail accounts are rejected.
- `@vit.ac.in` and other domains are rejected.
- Lookalike domains such as `@vitstudent.ac.in.attacker.test` are rejected.
- The institutional email must be reported as verified.
- Google receives an `hd=vitstudent.ac.in` hosted-domain hint for the account chooser.
- Protected server routes re-check the authenticated institutional identity instead of trusting the frontend.

The domain rule is covered by automated tests.

### 2. Application integrity and ownership

The application path was rebuilt around a strict server-side contract.

- Applicant identity comes from the authenticated session rather than request data.
- Unknown and malformed fields are rejected.
- Request sizes are bounded.
- Department/question IDs are stable and decoupled from display labels.
- Gender, year, motivation, and question responses are preserved correctly.
- Registration-number application indexes are bound to the applicant account.
- Existing registration ownership cannot be silently mixed across different users.
- Legacy records are handled defensively.

### 3. Atomic application limits

Application-limit checks and writes now happen transactionally.

This prevents race conditions where concurrent requests could previously bypass the maximum-department rule.

- Limit check and persistence happen in one Firestore transaction.
- Duplicate retries return the existing application instead of creating another record.
- Previously saved answers are preserved on retry.

### 4. Server-side admin authorization

Admin protection is enforced before private applicant data is loaded.

- Admin pages require a valid authenticated session on the server.
- Admin APIs independently enforce authorization.
- Banned or invalid users are rejected.
- Applicant listing is paginated and bounded rather than loading the full collection immediately.
- Shortlist mutations are protected server operations.

### 5. Firestore security model

The browser does not need direct database privileges for application or admin workflows.

- Sensitive database operations use Firebase Admin on the server.
- Direct client Firestore access is denied by repository rules.
- Application policy is enforced in server handlers rather than trusting browser code.

### 6. Reliable applicant UX

The application experience was rebuilt for clarity and recovery.

- Responsive department discovery and filtering.
- Clear closed/open recruitment state.
- Department-selection summary.
- Improved form states and validation feedback.
- Local draft recovery scoped to user and department selection.
- Successful submissions are tracked independently so retries only target pending work.
- Stale status requests are aborted.
- Error, loading, not-found, and sign-out states are now consistent.

### 7. Professional frontend redesign

The active product surfaces now use a restrained Google / Material-inspired visual language.

- Cleaner typography and spacing.
- Neutral surfaces and borders.
- Google blue primary actions.
- Restrained use of Google brand colors.
- Simplified navigation hierarchy.
- Updated sign-in experience with the Google mark and a single OAuth action.
- Responsive public, auth, and admin layouts.
- Reduced visual clutter and removed unreachable legacy UI wrappers.

### 8. Admin review workflow

The admin workspace now supports a bounded review workflow rather than an unstructured full-data dump.

- Paginated applicant loading.
- Filtering and sorting from a canonical client state.
- Shortlist status updates.
- Applicant response inspection.
- Safer CSV export.
- Admin-only email composition.

### 9. Safer CSV export

CSV output is normalized before download.

- Historical response shapes are converted into readable values.
- `false` and `0` are preserved.
- Columns use an explicit allowlist.
- Spreadsheet formula/control-leading cells are neutralized.
- Quoting and UTF-8 output are handled explicitly.

### 10. Protected admin email workflow

The email route was redesigned as a privileged server operation.

- Requires fresh admin authorization.
- Browser sends applicant IDs, not arbitrary destination email addresses.
- Recipient addresses are resolved from Firestore on the server.
- Request body and recipient counts are bounded.
- Subject/message inputs are validated.
- Plain text is escaped before HTML rendering.
- SMTP timeouts are bounded.
- Provider rejection / partial acceptance is surfaced rather than silently treated as success.

No exactly-once delivery guarantee is claimed; provider acceptance is not the same as inbox delivery.

### 11. Codebase cleanup

A large amount of unfinished or unreachable code has been removed.

Examples include:

- unfinished `/development` route
- obsolete Pages Router `_error` artifact
- unused duplicate application-read endpoints
- old department wrappers
- old animation / carousel / magic-card wrappers
- unused theme/sign-in wrappers
- placeholder mail template
- obsolete countdown component

The active route graph is now much easier to explain and maintain.

### 12. Tooling and verification

The repository now has a repeatable verification pipeline.

Current CI runs:

```bash
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun run test
bun run build
bun run test:e2e
```

Latest verified `dev` state before this README update passed:

- ESLint
- TypeScript typecheck
- **59 Vitest tests**
- Next.js production build
- Playwright browser tests on desktop/mobile coverage

The browser suite covers public navigation, recruitment state, Google-only sign-in UI, callback preservation, and mobile overflow/navigation checks.

## Tech stack

- **Next.js 15.5.25** — App Router
- **React 18**
- **Tailwind CSS**
- **Better Auth 1.6.25**
- **better-auth-firestore**
- **Firebase / Firebase Admin / Firestore**
- **Zod**
- **React Hook Form**
- **Nodemailer**
- **Vitest**
- **Playwright**
- **Bun**

## Main routes

```text
/                         Landing page
/departments              Department discovery
/join/[...joinIds]        Application flow
/auth/signin              Google-only sign in
/auth/signout             Sign out
/admin                    Protected admin workspace
```

Important API routes include application submission/status, protected applicant listing, shortlisting, authentication, and admin email delivery.

## Local development

### Requirements

- Node.js 22+
- Bun
- Firebase / Firestore configuration
- Google OAuth credentials for authentication

### Install

```bash
bun install
```

### Environment

Copy the example file:

```bash
cp .env.example .env.local
```

At minimum, configure the services you intend to use.

Important variables include:

```env
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Optional admin mail delivery
EMAIL_USERNAME=
EMAIL_PASSWORD=
```

Google Cloud should include the local callback:

```text
http://localhost:3000/api/auth/callback/google
```

For production, also add:

```text
https://<production-domain>/api/auth/callback/google
```

For the current Vercel deployment, the matching callback is:

```text
https://gdg-recruitment-portal-omega.vercel.app/api/auth/callback/google
```

### Run

```bash
bun run dev
```

Then open:

```text
http://localhost:3000
```

## Verification commands

```bash
bun run lint
bun run typecheck
bun run test
bun run build
bun run test:e2e
```

For backend tests that exercise Firestore behavior, use the repository's Firestore emulator setup / CI workflow rather than a production database.

## What is still remaining

The major application code is implemented and CI-green, but the following items still require explicit production or organizer-side work.

### Production configuration and validation

- Configure a strong real `BETTER_AUTH_SECRET` in the deployment environment.
- Configure the real Google OAuth client ID/secret.
- Add the production OAuth callback URL in Google Cloud Console.
- Verify an actual `@vitstudent.ac.in` Google login end-to-end on the deployed site.
- Verify that personal Gmail and non-student VIT accounts are rejected in the live environment.
- Configure production Firebase Admin credentials.
- Deploy and verify the intended Firestore rules in the actual Firebase project.
- Run controlled production/emulator contention checks for transactional application limits.

### Email delivery

- Configure the real SMTP/Gmail app-password credentials if admin email is required.
- Run a controlled delivery test to test accounts.
- Inspect provider results before manually retrying uncertain/partial deliveries.
- A durable queue / exactly-once email system would be a future enhancement if mail becomes operationally important.

### Product / content review

- Organizer review of replacement questionnaire wording is still required where original source text was corrupted.
- Confirm the recruitment deadline/configuration before reopening future recruitment rounds.
- Define retention/privacy expectations for browser-local application drafts.

### Final production quality checks

- Run a real authenticated applicant flow against the deployed environment.
- Run a real authenticated admin flow against the deployed environment.
- Perform a keyboard/accessibility audit and Lighthouse/Web Vitals measurement on production.
- Review remaining dependency advisories before long-term production use; avoid blind major-version upgrades without regression testing.

### Repository hygiene

After the active `dev` work is merged:

- keep `main` protected
- require CI checks before future merges
- delete stale temporary branches that are no longer needed
- continue feature work through short-lived branches / pull requests

## Security notes

This project deliberately follows a server-trust model:

- frontend authorization is never treated as sufficient security
- authenticated identity is derived server-side
- institutional email policy is rechecked for protected operations
- database writes are validated and allowlisted
- privileged admin/email actions have independent server guards
- application limits are enforced transactionally
- direct browser database access is not required

Do not commit production secrets to the repository. Use Vercel/Firebase/Google Cloud environment and secret-management facilities.

## Project documentation

Additional engineering notes remain in the repository:

- `ROUND2_IMPROVEMENTS.md` — detailed issue-by-issue engineering audit
- `BACKEND_NOTES.md` — backend architecture and trust-boundary notes
- `FRONTEND_NOTES.md` — frontend implementation notes
- `ADMIN_NOTES.md` — admin workflow notes
- `INTERVIEW_NOTES.md` — reasoning and interview explanations

Some older notes describe the codebase at earlier checkpoints. **This README reflects the current intended architecture and should be treated as the high-level source of truth.**
