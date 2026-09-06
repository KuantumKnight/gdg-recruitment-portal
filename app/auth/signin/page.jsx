"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
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

  if (isPending) return <GDGLoader label="Checking your Google session…" />;
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
    <main className="grid min-h-screen place-items-center bg-[#f8fafd] px-5 py-10 text-[#1f1f1f]">
      <section className="w-full max-w-[448px] rounded-[28px] border border-[#dadce0] bg-white px-6 py-8 shadow-[0_1px_2px_rgba(60,64,67,.08),0_2px_8px_rgba(60,64,67,.06)] sm:px-10 sm:py-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e0e3e7] bg-white shadow-sm">
          <Image src="/assets/google-g.svg" alt="Google" width={24} height={24} priority />
        </div>

        <h1 className="mt-8 text-[32px] font-normal leading-tight tracking-[-.025em] text-[#202124]">
          Sign in
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-[#5f6368]">
          Use your VIT student Google account to continue to the GDG recruitment portal.
        </p>

        <div className="mt-6 inline-flex rounded-full bg-[#e8f0fe] px-3 py-1.5 text-xs font-medium text-[#174ea6]">
          Only @{INSTITUTIONAL_DOMAIN}
        </div>

        {(clientError || oauthError) && (
          <div className="mt-6 rounded-xl border border-[#f6aea9] bg-[#fce8e6] px-4 py-3 text-sm leading-5 text-[#a50e0e]" role="alert">
            {clientError || oauthError}
          </div>
        )}

        <button
          type="button"
          onClick={continueWithGoogle}
          disabled={submitting}
          className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#747775] bg-white px-5 text-sm font-medium text-[#1f1f1f] transition-[background-color,box-shadow] hover:bg-[#f8fafd] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b57d0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Image src="/assets/google-g.svg" alt="" width={18} height={18} aria-hidden="true" />
          {submitting ? "Opening Google…" : "Continue with Google"}
        </button>

        <p className="mt-6 text-xs leading-5 text-[#80868b]">
          Personal Gmail accounts, faculty accounts, and other domains are rejected by the server even if the browser request is modified.
        </p>

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-[#e8eaed] pt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#0b57d0] hover:underline">
            <ArrowLeft size={15} aria-hidden="true" /> Back
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#80868b]">
            <LockKeyhole size={13} aria-hidden="true" /> Google OAuth
          </span>
        </div>
      </section>
    </main>
  );
}
