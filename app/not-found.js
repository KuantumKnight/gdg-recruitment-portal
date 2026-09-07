import Link from "next/link";
import { ArrowBack } from "@material-symbols-svg/react/icons/arrow-back";

export default function NotFound() {
  return (
    <main className="utility-page">
      <div className="utility-poster">
        <p className="auth-poster-meta">Wayfinding · 404</p>
        <h2>Wrong turn.</h2>
        <p className="auth-poster-meta">GDG on Campus · VIT Chennai</p>
      </div>
      <div className="utility-panel">
        <p className="eyebrow">Page not found</p>
        <h1>This page isn’t part of the portal.</h1>
        <p>
          The link may be old or incomplete. Return to the team browser to continue exploring recruitment.
        </p>
        <Link href="/departments" className="button-primary mt-7 px-6">
          <ArrowBack className="h-4 w-4" aria-hidden="true" />
          Back to departments
        </Link>
      </div>
    </main>
  );
}
