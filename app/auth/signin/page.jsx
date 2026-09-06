"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MailCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { safeCallbackURL } from "@/lib/auth-redirect";
import { toast } from "sonner";
import GDGLoader from "@/components/GDGLoader";

function needsEmailVerification(error) {
  const code = String(error?.code || "").toUpperCase();
  const message = String(error?.message || "");
  return code === "EMAIL_NOT_VERIFIED" || (Number(error?.status) === 403 && /verif/i.test(message));
}

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = useMemo(() => safeCallbackURL(searchParams.get("callbackURL")), [searchParams]);
  const { data: session, isPending } = authClient.useSession();
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (session?.user && !isPending) router.replace(callbackURL);
  }, [callbackURL, isPending, router, session]);

  if (isPending) return <GDGLoader label="Checking your account…" />;
  if (session?.user) return <GDGLoader label="Redirecting…" />;

  async function handleSubmit(event) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    if (!normalizedEmail || !password) return toast.error("Please fill in all required fields.");
    if (mode === "signup" && !normalizedName) return toast.error("Please enter your name.");

    setSubmitting(true);
    try {
      const result = mode === "signup"
        ? await authClient.signUp.email({ email: normalizedEmail, password, name: normalizedName, callbackURL })
        : await authClient.signIn.email({ email: normalizedEmail, password, callbackURL });

      if (result?.error) {
        if (needsEmailVerification(result.error)) {
          setVerificationEmail(normalizedEmail);
          toast.info("Verify your institutional email to continue.");
          return;
        }
        toast.error(result.error.message || "Authentication failed.");
        return;
      }

      if (mode === "signup") {
        setVerificationEmail(normalizedEmail);
        toast.success("Verification link sent to your institutional email.");
        return;
      }

      toast.success("Signed in successfully.");
      router.replace(callbackURL);
      router.refresh();
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("Authentication failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function resendVerification() {
    if (!verificationEmail || resending) return;
    setResending(true);
    try {
      const result = await authClient.sendVerificationEmail({
        email: verificationEmail,
        callbackURL,
      });
      if (result?.error) throw new Error(result.error.message || "Could not resend verification email.");
      toast.success("A new verification link was sent.");
    } catch (error) {
      toast.error(error.message || "Could not resend verification email.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#101110] px-5 py-10 text-[#f3f1e9] sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] border border-[#30332c] bg-[#171914] shadow-2xl lg:grid-cols-[.9fr_1.1fr]">
        <section className="hidden bg-[#d7fa70] p-10 text-[#101110] lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em]">GDG on Campus · Recruitment 2026</p>
            <h1 className="mt-20 text-6xl font-semibold leading-[.92] tracking-[-.07em]">Good things start with curious minds.</h1>
          </div>
          <p className="max-w-xs text-sm leading-6">Your verified institutional account keeps applications tied to the person who submitted them.</p>
        </section>

        <section className="p-6 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d7fa70]">Candidate portal</p>

          {verificationEmail ? (
            <div className="pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d7fa70]/30 bg-[#d7fa70]/10 text-[#d7fa70]">
                <MailCheck size={24} aria-hidden="true" />
              </div>
              <h2 className="mt-6 text-4xl font-semibold tracking-[-.06em]">Check your inbox.</h2>
              <p className="mt-3 text-sm leading-6 text-[#a7aa9e]">
                Open the verification link sent to <strong className="font-medium text-[#f3f1e9]">{verificationEmail}</strong>. You must verify that institutional address before a session can be created.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={resendVerification} disabled={resending} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#d7fa70] px-5 text-sm font-bold text-[#101110] disabled:cursor-not-allowed disabled:opacity-60">
                  <RefreshCw size={15} aria-hidden="true" />
                  {resending ? "Sending…" : "Resend link"}
                </button>
                <button type="button" onClick={() => { setVerificationEmail(""); setPassword(""); }} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#30332c] px-5 text-sm font-semibold text-[#f3f1e9] hover:bg-white/5">
                  <ArrowLeft size={15} aria-hidden="true" />
                  Use another email
                </button>
              </div>
              <p className="mt-8 flex items-start gap-2 text-xs leading-5 text-[#70766b]">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#d7fa70]" aria-hidden="true" />
                If you did not request this account, no session is created until the mailbox owner verifies it.
              </p>
            </div>
          ) : (
            <>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-.06em]">{mode === "signin" ? "Welcome back." : "Start your story."}</h2>
              <p className="mt-3 text-sm leading-6 text-[#a7aa9e]">{mode === "signin" ? "Sign in to continue your application." : "Create an account with your VIT institutional email. We’ll verify it before you can apply."}</p>

              <div className="my-8 grid grid-cols-2 rounded-full border border-[#30332c] p-1" role="tablist" aria-label="Account access">
                {[["signin", "Sign in"], ["signup", "Create account"]].map(([value, label]) => (
                  <button key={value} type="button" role="tab" aria-selected={mode === value} onClick={() => setMode(value)} className={`rounded-full px-3 py-2.5 text-sm ${mode === value ? "bg-[#d7fa70] font-bold text-[#101110]" : "text-[#a7aa9e] hover:text-[#f3f1e9]"}`}>
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="grid gap-5">
                {mode === "signup" && (
                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium">Full name</label>
                    <input id="name" type="text" className="h-12 rounded-xl border border-[#30332c] bg-[#101110] px-4 outline-none focus:border-[#d7fa70]" placeholder="Your full name" value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
                  </div>
                )}
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">Institutional email</label>
                  <input id="email" type="email" className="h-12 rounded-xl border border-[#30332c] bg-[#101110] px-4 outline-none focus:border-[#d7fa70]" placeholder="you@vitstudent.ac.in" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                    {mode === "signin" && <a href="/auth/forgot-password" className="text-xs font-medium text-[#d7fa70] hover:underline">Forgot password?</a>}
                  </div>
                  <input id="password" type="password" className="h-12 rounded-xl border border-[#30332c] bg-[#101110] px-4 outline-none focus:border-[#d7fa70]" placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                </div>
                <button type="submit" disabled={submitting} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#d7fa70] px-5 text-sm font-bold text-[#101110] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? "Processing…" : mode === "signin" ? "Sign in" : "Create account"}
                  {!submitting && <ArrowUpRight size={16} aria-hidden="true" />}
                </button>
              </form>
              <p className="mt-8 flex items-center gap-2 text-xs leading-5 text-[#70766b]">
                <ShieldCheck size={14} className="shrink-0 text-[#d7fa70]" aria-hidden="true" />
                Only verified VIT institutional email accounts can access applications.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
