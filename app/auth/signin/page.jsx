"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowBack } from "@material-symbols-svg/react/icons/arrow-back";
import { ArrowForward } from "@material-symbols-svg/react/icons/arrow-forward";
import { Lock } from "@material-symbols-svg/react/icons/lock";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { INSTITUTIONAL_DOMAIN } from "@/lib/auth-policy";
import { safeCallbackURL } from "@/lib/auth-redirect";
import GDGLoader from "@/components/GDGLoader";

function authErrorMessage(value) {
  const code = String(value || "").toLowerCase();
  if (!code) return "";
  if (code.includes("email_not_allowed") || code.includes("google_only")) {
    return `Use your @${INSTITUTIONAL_DOMAIN} Google account.`;
  }
  if (code.includes("email_not_verified")) {
    return "Google could not verify the email address on this account.";
  }
  if (code.includes("provider_not_found") || code.includes("social_provider_not_found") || code.includes("not_configured")) {
    return "Google sign-in is not configured for this deployment yet. Please contact the portal administrator.";
  }
  if (code.includes("access_denied")) {
    return "Google sign-in was cancelled.";
  }
  return "Google sign-in could not be completed. Please try again.";
}

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = useMemo(
    () => safeCallbackURL(searchParams.get("callbackURL")),
    [searchParams],
  );
  const { data: session, isPending } = authClient.useSession();
  const [submitting, setSubmitting] = useState(false);
  const [clientError, setClientError] = useState("");
  const oauthError = authErrorMessage(searchParams.get("error"));

  useEffect(() => {
    if (session?.user && !isPending) router.replace(callbackURL);
  }, [callbackURL, isPending, router, session]);

  if (session?.user) return <GDGLoader label="Redirecting…" />;

  async function continueWithGoogle() {
    if (submitting) return;
    setSubmitting(true);
    setClientError("");
    try {
      const errorCallbackURL = `/auth/signin?callbackURL=${encodeURIComponent(callbackURL)}`;
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL,
        additionalParams: { hd: INSTITUTIONAL_DOMAIN },
      });
      if (result?.error) {
        setClientError(authErrorMessage(result.error.code || result.error.message));
        setSubmitting(false);
      }
    } catch {
      setClientError("Google sign-in could not be started. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-poster" aria-label="GDG on Campus recruitment">
        <div className="auth-poster-brand">
          <Image src="/assets/gdg.svg" alt="" width={56} height={42} priority />
          <span>GDG on Campus · VIT Chennai</span>
        </div>
        <h2>Ideas need people.</h2>
        <p className="auth-poster-meta">Recruitment issue &apos;26 · Student access</p>
      </section>

      <section className="auth-panel">
        <div className="auth-mark">
          <Image src="/assets/google-g.svg" alt="Google" width={28} height={28} priority />
        </div>
        <h1>Sign in</h1>
        <p>Use your VIT student Google account to continue to the GDG recruitment portal.</p>
        <div className="auth-domain">Only @{INSTITUTIONAL_DOMAIN}</div>

        {(clientError || oauthError) && (
          <div className="auth-error" role="alert">{clientError || oauthError}</div>
        )}

        <button type="button" onClick={continueWithGoogle} disabled={submitting} className="auth-google-button">
          <span className="auth-google-label">
            <Image src="/assets/google-g.svg" alt="" width={20} height={20} aria-hidden="true" />
            {submitting ? "Opening Google…" : "Continue with Google"}
          </span>
          <ArrowForward size={22} />
        </button>

        <p className="auth-security-note">Personal Gmail accounts, faculty accounts, and other domains are rejected by the server even if the browser request is modified.</p>
        <div className="auth-footer-row">
          <Link href="/"><ArrowBack size={17} /> Back to issue</Link>
          <span><Lock size={16} /> Google OAuth</span>
        </div>
      </section>
    </main>
  );
}
