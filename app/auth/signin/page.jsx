"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
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
    return "Google did not return a verified email address for this account.";
  }
  if (code.includes("access_denied")) {
    return "Google sign-in was cancelled. You can try again when ready.";
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
    <main className="min-h-screen bg-[#f8f9fa] px-5 py-10 text-[#202124] sm:py-16">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl items-center justify-center">
        <section className="w-full max-w-[480px] rounded-[28px] border border-[#dadce0] bg-white px-6 py-8 shadow-[0_1px_2px_rgba(60,64,67,.08),0_2px_8px_rgba(60,64,67,.08)] sm:px-10 sm:py-10">
          <div className="flex items-center gap-3">
            <Image src="/assets/gdg.svg" alt="GDG on Campus VIT Chennai" width={42} height={42} priority />
            <div>
              <p className="text-[15px] font-medium text-[#202124]">GDG on Campus VIT Chennai</p>
              <p className="text-xs text-[#5f6368]">Recruitment Portal</p>
            </div>
          </div>

          <div className="mt-10">
            <p className="text-sm font-medium text-[#1a73e8]">Candidate access</p>
            <h1 className="mt-2 text-[32px] font-normal leading-tight tracking-[-.03em] text-[#202124] sm:text-[36px]">
              Sign in with your VIT Google account
            </h1>
            <p className="mt-4 text-[15px] leading-6 text-[#5f6368]">
              Recruitment access is restricted to verified student accounts ending in
              <span className="font-medium text-[#202124]"> @{INSTITUTIONAL_DOMAIN}</span>.
            </p>
          </div>

          {(clientError || oauthError) && (
            <div className="mt-6 rounded-2xl border border-[#f6aea9] bg-[#fce8e6] px-4 py-3 text-sm leading-5 text-[#a50e0e]" role="alert">
              {clientError || oauthError}
            </div>
          )}

          <button
            type="button"
            onClick={continueWithGoogle}
            disabled={submitting}
            className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#747775] bg-white px-5 text-sm font-medium text-[#1f1f1f] transition-colors hover:bg-[#f8fafd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Image src="/assets/google-g.svg" alt="" width={18} height={18} aria-hidden="true" />
            {submitting ? "Opening Google…" : "Continue with Google"}
          </button>

          <div className="mt-6 rounded-2xl bg-[#f8fafd] px-4 py-4">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#1a73e8]" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-[#202124]">Student-domain enforcement</p>
                <p className="mt-1 text-xs leading-5 text-[#5f6368]">
                  Personal Gmail accounts and other VIT domains are rejected by the server, even if the client request is modified.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-[#e8eaed] pt-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#1a73e8] hover:underline">
              <ArrowLeft size={15} aria-hidden="true" /> Back to portal
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#80868b]">
              <LockKeyhole size={13} aria-hidden="true" /> Google OAuth only
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
