# GDG Recruitment Portal — Work Record

## Purpose

This document records the work completed after the original archived project baseline. It is intended to make the repository handoff-ready: a new contributor should be able to understand what changed, why the changes were made, how the trust boundaries work, and how to verify or deploy the application.

## Comparison baseline

- Original archive baseline: `07b90de` — `chore: define project and environment metadata`
- Current development head: `4af2d99` — `design: carry broadsheet system through secure surfaces`
- Current production/main code before the latest development design commits: `d658040` — `fix: harden production OAuth configuration`
- Repository: `https://github.com/KuantumKnight/gdg-recruitment-portal`
- Application: Google Developer Groups on Campus · VIT Chennai recruitment portal

The original archive was a partially complete recruitment site with incomplete route behavior, weakly separated trust boundaries, unfinished UI paths, and limited verification. The current repository is a production-oriented Next.js application with protected server workflows, resilient applicant handling, an admin review workspace, CI checks, and a coherent responsive visual system.

## Executive summary of the completed work

The project was improved in six connected areas:

1. Authentication was reduced to Google-only VIT student sign-in with strict server-side institutional identity checks.
2. Applicant submissions and private admin operations were moved behind explicit server authorization, validation, and bounded data access.
3. Submission limits, retries, drafts, and legacy records were made resilient to races, refreshes, and partial failures.
4. The public recruitment journey and admin workspace were rebuilt for responsive, accessible, and understandable operation.
5. The visual language evolved from the archive’s unfinished UI into a Google/GDG-inspired campus broadsheet system, including licensed local typography and mobile checks.
6. Testing, CI, documentation, GitHub branch synchronization, Vercel deployment, and production Google OAuth configuration were completed.

## Detailed change record

### 1. Project foundations and delivery tooling

- Established the shared Next.js App Router structure and project metadata.
- Locked dependencies with the Bun lockfile and aligned hosted build behavior with Bun.
- Added ESLint, TypeScript, Vitest, Playwright, and a reproducible build script.
- Added GitHub Actions checks for installation, linting, type checking, unit/integration tests, production build, and browser tests.
- Added project hosting metadata and deployment configuration for the Sites/Vercel workflow.
- Added explicit `.env.example` documentation for Better Auth, Firebase, Google OAuth, and optional SMTP settings.
- Kept generated build output and local secrets out of version control through the repository ignore rules.

### 2. Authentication and identity enforcement

- Replaced the user-facing email/password path with a single Google OAuth action.
- Enforced the exact institutional suffix `@vitstudent.ac.in` on the server.
- Rejected personal Gmail, faculty/other domains, and lookalike suffixes such as `@vitstudent.ac.in.attacker.test`.
- Required the authenticated Google identity to be verified before allowing applicant access.
- Added the Google hosted-domain hint `hd=vitstudent.ac.in` for the account chooser while retaining the authoritative server-side check.
- Centralized callback and redirect validation so only safe same-origin application paths are accepted.
- Added `lib/auth-config.js` so production uses `BETTER_AUTH_URL`, Vercel’s production URL, or the known production site before falling back to localhost only during development.
- Added a clear sign-in error when the Google provider is missing from a deployment instead of leaving users with an opaque provider failure.
- Added a reliable sign-out transition and consistent auth loading/error states.

### 3. Backend trust boundaries and data integrity

- Made authenticated session identity authoritative; request bodies can no longer choose another applicant’s account.
- Added explicit server credential initialization for Firebase Admin and Better Auth.
- Moved sensitive Firestore operations behind server-side Firebase Admin access.
- Denied direct browser access to private application/admin records through Firestore rules.
- Added bounded request sizes and strict schema validation for application and email requests.
- Rejected unknown or malformed application fields rather than silently accepting arbitrary payloads.
- Preserved department, question, gender, academic year, motivation, and response values through stable canonical identities.
- Bound registration-number indexes to the authenticated applicant account and protected ownership transitions.
- Added defensive handling for legacy response shapes and incomplete historical records.
- Added route-level error normalization so expected failures return useful, safe responses without leaking implementation details.

### 4. Atomic submissions, limits, retries, and drafts

- Made application-limit checks and writes transactional to prevent concurrent requests bypassing the maximum-department rule.
- Made duplicate retries idempotent: an existing application is returned rather than duplicated.
- Preserved already-saved answers during retry and partial completion.
- Added user- and department-scoped local draft recovery.
- Tracked successful submissions independently so a retry only targets pending departments.
- Aborted stale status requests to prevent old responses overwriting current UI state.
- Added stable question IDs so display-label changes do not corrupt saved answers.

### 5. Applicant-facing experience

- Rebuilt the landing page, department catalog, application route, sign-in, sign-out, loading, error, and not-found surfaces.
- Added department discovery, search/filtering, technical/community grouping, selection summaries, and closed/open recruitment states.
- Made the application flow responsive across desktop and mobile layouts.
- Added clear validation, pending, success, and failure states for the multi-department journey.
- Added navigation behavior for Explore teams, FAQs, sign-in, account state, and recruitment deadline messaging.
- Added branded loading and error boundaries so navigation and server failures remain understandable.
- Removed unfinished development routes and unreachable compatibility wrappers from the active route graph.

### 6. Admin review and shortlisting workspace

- Added a protected server-rendered admin route.
- Enforced fresh admin authorization before loading private applicant information.
- Added bounded/paginated applicant loading instead of eagerly reading the full collection.
- Added canonical filter and sorting state for department and shortlist review.
- Added applicant response inspection and shortlist mutation flows.
- Added safer CSV export with an explicit column allowlist.
- Normalized legacy values for CSV output while preserving meaningful `false` and `0` values.
- Neutralized spreadsheet formula/control-leading cells before download.
- Added admin-only email composition and recipient resolution on the server.

### 7. Protected email workflow

- Restricted the email route to freshly authorized admins.
- Changed the browser request to carry applicant IDs rather than arbitrary destination addresses.
- Resolved recipient emails from server-side records.
- Bounded recipient count, request size, subject length, and message length.
- Escaped plain text before HTML rendering.
- Added SMTP timeout handling and surfaced provider rejection/partial acceptance.
- Avoided claiming exactly-once delivery; provider acceptance is not the same as inbox delivery.

### 8. Visual and interaction redesign

The visual work progressed in stages from the original archive’s unfinished layout to the current campus broadsheet system.

- Established a restrained GDG/Google visual language with neutral surfaces, strong hierarchy, blue primary actions, and limited brand-color accents.
- Simplified navigation into a clear Google-style hierarchy.
- Reworked the homepage hero, recruitment deadline treatment, footer, account dropdown, loading state, error states, and sign-in surface.
- Rebuilt the department catalog as an editorial index rather than a generic card grid.
- Carried the broadsheet treatment through the secure admin, auth, error, loading, and utility surfaces.
- Rebalanced desktop headline sizing to avoid clipping and preserved the intended `BUILD WHAT` composition.
- Removed decorative CSS stripes that read as invented brand assets.
- Added local Roboto Condensed font files with the OFL license notice and retained GDG/Google marks as the functional brand assets.
- Reduced rounded SaaS-panel styling where it conflicted with the square editorial grid.
- Added `design-qa.md` with viewport targets, interaction checks, known fixes, and final visual QA status.
- Checked desktop and mobile layouts for horizontal overflow, clipped text, navigation behavior, filtering, closed recruitment state, and sign-in clarity.

### 9. Codebase cleanup

The following unfinished or unreachable pieces were removed or retired during reconciliation:

- unfinished `/development` route
- obsolete Pages Router `_error` artifact
- unused duplicate full-submission/status endpoints
- old department wrappers and compatibility components
- unused animation, carousel, magic-card, theme, and sign-in wrappers
- placeholder mail template
- obsolete countdown component
- stale legacy route/build artifacts

This reduced the active route graph and made the application easier to explain, test, and maintain.

### 10. Verification and quality gates

The repository now supports the following verification commands:

```bash
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun run test
bun run build
bun run test:e2e
```

Coverage includes:

- authentication policy and institutional-domain enforcement
- callback and redirect safety
- backend validation and route behavior
- Firestore/application storage behavior
- transactional application limits and retries
- draft recovery
- admin authorization and utilities
- CSV safety
- protected mail rendering and bounded delivery
- public navigation, closed recruitment state, Google-only sign-in UI, callback preservation, and mobile overflow/navigation

The last verified pre-documentation run on the hardened production branch passed lint, TypeScript, unit/integration tests, and the production build. The latest development branch additionally contains the broadsheet redesign and its `design-qa.md` record; run the full commands above after pulling if the environment has changed.

## Runtime configuration and production OAuth

### Required Vercel Production variables

The production project is `gdg-recruitment-portal` under the `sarvesh-m-projects` team. Production requires:

- `BETTER_AUTH_URL=https://gdg-recruitment-portal-omega.vercel.app`
- `BETTER_AUTH_SECRET` — strong secret, at least 32 characters
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Firebase web variables are also configured for the client bundle where required. SMTP variables remain optional unless outbound admin email is enabled.

### Google OAuth client

The web OAuth client belongs to Google Cloud project `gdg-web-dev` and is configured with:

```text
Production origin: https://gdg-recruitment-portal-omega.vercel.app
Local origin:      http://localhost:3000

Production callback: https://gdg-recruitment-portal-omega.vercel.app/api/auth/callback/google
Local callback:      http://localhost:3000/api/auth/callback/google
```

The production flow was verified to reach Google’s account chooser with the VIT hosted-domain hint and the production callback URL. Full account selection/consent must be completed by the user with an eligible VIT account.

## Git and deployment state

- `dev` was fast-forwarded from GitHub before this work record was added.
- The latest remote development commits are the three broadsheet redesign commits after `d658040`.
- `WORK.md` is intended to be committed on `dev`, pushed to GitHub, and then merged into `main`.
- After the merge, the connected Vercel project should build the updated `main` source automatically; verify the deployment is Ready before treating the live design update as complete.
- Never commit `.env.local`, OAuth secrets, Firebase private keys, or other credentials.

## Handoff checklist

- [ ] `WORK.md` committed and pushed on `dev`.
- [ ] `dev` merged into `main` and `main` pushed.
- [ ] `bun run lint` passes.
- [ ] `bun run typecheck` passes.
- [ ] `bun run test` passes.
- [ ] `bun run build` passes.
- [ ] `bun run test:e2e` passes where the browser environment is available.
- [ ] Vercel `main` deployment reaches Ready.
- [ ] Production sign-in reaches Google account selection.
- [ ] An eligible `@vitstudent.ac.in` account completes the real sign-in flow.
- [ ] Admin and email workflows are smoke-tested with non-production test data.

