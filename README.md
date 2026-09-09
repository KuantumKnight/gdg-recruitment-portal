# GDG on Campus · VIT Chennai

## Recruitment Portal

> A focused, secure application platform for discovering departments, collecting candidate responses, and running the review process from one calm admin workspace.

<img width="1280" height="704" alt="GDG recruitment portal preview" src="https://github.com/user-attachments/assets/8759fba5-f224-4b88-991a-e527fae9b2fc" />

[![Live deployment](https://img.shields.io/badge/Live%20deployment-Visit%20site-1a73e8?style=for-the-badge)](https://gdg-recruitment-portal-omega.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-ffca28?style=flat-square&logo=firebase&logoColor=111)](https://firebase.google.com/docs/firestore)
[![Tests](https://img.shields.io/badge/verification-Vitest%20%2B%20Playwright-16a34a?style=flat-square)](#verification)

The GDG on Campus VIT Chennai recruitment portal gives applicants a clear path from **“I want to join”** to a complete, department-specific application. The core team gets the other half: protected applicant data, bounded review tools, shortlisting, CSV export, and an admin-only email workflow.

This is not just a form with a database behind it. The project is built around the uncomfortable parts of recruitment software: identity, authorization, duplicate submissions, race conditions, data integrity, privacy, and safe operational tooling.

## The experience

### For applicants

- Browse the full department directory with search and category grouping.
- Sign in with a verified Google account from `@vitstudent.ac.in`.
- Select up to two departments.
- Answer questions tailored to each selected department.
- Recover an in-progress draft locally and retry safely after a failed request.
- See clear recruitment-open, recruitment-closed, loading, error, and not-found states.

### For the core team

- Open a protected admin workspace with paginated applicant data.
- Filter by department, shortlist status, and search terms.
- Inspect structured applicant responses.
- Shortlist or unshortlist candidates through guarded server routes.
- Export normalized CSV data with spreadsheet-formula injection protection.
- Compose email to selected applicants without trusting browser-supplied recipients or HTML.

## Why this project is interesting

The strongest parts of the portal are the invisible ones:

| Problem | Engineering response |
| --- | --- |
| A user can fake frontend state | Authorization and institutional identity are checked on the server. |
| Two concurrent submissions can bypass a limit | Firestore transactionally checks and persists application state. |
| A request can contain fields the UI never renders | Input is parsed through an allowlisted Zod contract. |
| Applicant PII should not be shipped to unauthorized browsers | Admin access is enforced before private data is loaded. |
| CSV cells can become spreadsheet formulas | Dangerous control-leading values are neutralized before export. |
| Mail content can become an injection vector | Plain text is escaped before HTML rendering and SMTP calls are bounded. |
| A retry should not create a second application | Existing application identity and successful-submission state are preserved. |

## Product flow

```text
Landing page
    ↓
Department directory ──→ choose 1–2 departments
    ↓
Google / VIT identity check
    ↓
Department-specific application forms
    ↓
Validated, server-owned Firestore write
    ↓
Admin review → filter → inspect → shortlist → email
```

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 · App Router · React 18 |
| Authentication | Better Auth · Google OAuth · verified institutional domain policy |
| Data | Firestore through `firebase-admin` on the server |
| Validation | Zod · React Hook Form |
| UI | Tailwind CSS · Radix UI primitives · Material / Google-inspired visual system |
| Email | Nodemailer with protected admin delivery |
| Testing | Vitest · Playwright |
| Tooling | Bun · TypeScript checks · ESLint |

## Routes at a glance

```text
/                         Landing page
/departments              Department directory and selection
/join/[...joinIds]        Department-specific application flow
/auth/signin              Google-only sign-in
/auth/signout             Sign-out flow
/admin                    Protected applicant review workspace
```

The main API surface is similarly scoped:

```text
/api/auth/[...all]        Better Auth handlers
/api/check-applications   Current user's submission status
/api/submit-form          Validated application submission
/api/admin/applicants     Paginated admin applicant listing
/api/shortlist/[id]       Protected shortlist mutation
/api/send-email           Protected admin email delivery
```

## Quick start

### Prerequisites

- Node.js 22+
- [Bun](https://bun.sh/)
- Java 21+ for the Firebase emulator
- Google OAuth credentials for a real sign-in flow

### 1. Install dependencies

```bash
bun install
```

### 2. Configure the environment

```bash
cp .env.example .env.local
```

At minimum, set a strong auth secret and the Firebase / Google values required by the flow you want to exercise:

```env
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000

FIREBASE_PROJECT_ID=demo-gdg-recruitment
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

For local Firestore, use the emulator instead of production credentials:

```env
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
```

For Gmail-backed admin email, also configure `EMAIL_USERNAME` and `EMAIL_PASSWORD` using an app password. Never commit `.env.local` or service-account credentials.

### 3. Start Firestore

In terminal 1:

```bash
bunx firebase emulators:start --only firestore --project demo-gdg-recruitment
```

The Firestore emulator runs on `127.0.0.1:8080`. Its UI is available at `http://127.0.0.1:4000`.

### 4. Start the app

In terminal 2:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

Google OAuth must include this callback URL:

```text
http://localhost:3000/api/auth/callback/google
```

The production deployment uses:

```text
https://gdg-recruitment-portal-omega.vercel.app/api/auth/callback/google
```

## Verification

Run the same checks used by CI:

```bash
bun run lint
bun run typecheck
bun run test
bun run build
bunx playwright install --with-deps chromium
bun run test:e2e
```

The test suite covers authentication policy, application validation, ownership, duplicate and concurrent submissions, admin authorization, shortlist behavior, email handling, CSV safety, legacy response shapes, public navigation, recruitment state, and mobile browser behavior.

## Security model

The portal uses a server-trust model:

- The authenticated user is the source of applicant identity; request-body identity is ignored.
- Google is the only supported sign-in provider.
- Only verified `@vitstudent.ac.in` accounts are accepted.
- Admin pages and admin APIs independently enforce authorization.
- Sensitive Firestore work happens through Firebase Admin on the server.
- Browser clients do not receive direct database privileges for application or admin workflows.
- Application writes are validated, bounded, and allowlisted.
- Department limits are enforced inside a Firestore transaction.
- Email recipients are resolved server-side from applicant IDs.
- Plain-text mail is escaped before HTML rendering.
- Production secrets belong in deployment secret management, never in Git.

## Deployment notes

The project is prepared for a Vercel deployment, but production readiness still depends on external configuration:

1. Add the production `BETTER_AUTH_SECRET`.
2. Configure the Google OAuth client and production callback URL.
3. Configure Firebase Admin credentials and deploy the intended Firestore rules.
4. Confirm the recruitment deadline through `NEXT_PUBLIC_RECRUITMENT_DEADLINE`.
5. Configure SMTP / Gmail app-password credentials if admin email is needed.
6. Run a real applicant flow and a real admin flow against the deployed environment.

`NEXT_PUBLIC_*` values are embedded during the build, so rebuild after changing them.

## Known gaps

Keeping the gaps visible is part of the project:

- Production OAuth, Firebase, and SMTP still require organizer-side configuration and live verification.
- Email provider acceptance is not the same as inbox delivery; there is no exactly-once delivery guarantee.
- Applicant draft data is stored in browser-local storage, so retention and privacy expectations should be documented for each recruitment round.
- Questionnaire wording should receive an organizer review before a new round opens.
- Accessibility and Lighthouse / Web Vitals checks should be run against the final production deployment.
- Dependency advisories should be reviewed before long-term operation.

## Project notes

The repository contains deeper engineering context when you want to go below the surface:

- [`WORK.md`](./WORK.md) — issue-by-issue engineering audit and rationale
- [`ROUND2_IMPROVEMENTS.md`](./ROUND2_IMPROVEMENTS.md) — detailed implementation checklist
- [`BACKEND_NOTES.md`](./BACKEND_NOTES.md) — backend architecture and trust boundaries
- [`FRONTEND_NOTES.md`](./FRONTEND_NOTES.md) — frontend implementation notes
- [`ADMIN_NOTES.md`](./ADMIN_NOTES.md) — admin workflow notes
- [`INTERVIEW_NOTES.md`](./INTERVIEW_NOTES.md) — decisions explained in interview-ready language
- [`design-qa.md`](./design-qa.md) — visual QA notes

## Contributing

Keep changes small, tested, and easy to review. Before opening a PR, run the full verification block above and update the relevant project notes when behavior or security assumptions change.

---

Built for **GDG on Campus · VIT Chennai** with a bias toward clarity, safe defaults, and fewer surprises in production.
