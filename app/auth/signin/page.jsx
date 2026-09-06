"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { safeCallbackURL } from "@/lib/auth-redirect";
import { toast } from "sonner";
import GDGLoader from "@/components/GDGLoader";

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

  useEffect(() => {
    if (session?.user && !isPending) router.replace(callbackURL);
  }, [callbackURL, isPending, router, session]);

  if (isPending) return <GDGLoader />;
  if (session?.user) return <div className="flex min-h-screen items-center justify-center bg-[#101110] text-[#a7aa9e]"><p className="text-sm">Redirecting...</p></div>;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) return toast.error("Please fill in all required fields.");
    if (mode === "signup" && !name) return toast.error("Please enter your name.");
    setSubmitting(true);
    try {
      const result = mode === "signup"
        ? await authClient.signUp.email({ email, password, name, callbackURL })
        : await authClient.signIn.email({ email, password, callbackURL });
      if (result?.error) toast.error(result.error.message || "Authentication failed.");
      else { toast.success(mode === "signup" ? "Account created successfully!" : "Signed in successfully!"); router.replace(callbackURL); }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("Authentication failed. Please check your credentials.");
    } finally { setSubmitting(false); }
  };

  return (
    <main className="min-h-screen bg-[#101110] px-5 py-10 text-[#f3f1e9] sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] border border-[#30332c] bg-[#171914] shadow-2xl lg:grid-cols-[.9fr_1.1fr]">
        <section className="hidden bg-[#d7fa70] p-10 text-[#101110] lg:flex lg:flex-col lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em]">GDG on Campus · Recruitment 2026</p><h1 className="mt-20 text-6xl font-semibold leading-[.92] tracking-[-.07em]">Good things start with curious minds.</h1></div><p className="max-w-xs text-sm leading-6">Your account keeps your application safe, saves your progress, and lets you return to the teams you chose.</p></section>
        <section className="p-6 sm:p-10"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#d7fa70]">Candidate portal</p><h2 className="mt-3 text-4xl font-semibold tracking-[-.06em]">{mode === "signin" ? "Welcome back." : "Start your story."}</h2><p className="mt-3 text-sm leading-6 text-[#a7aa9e]">{mode === "signin" ? "Sign in to continue your application." : "Create an account to apply to up to two departments."}</p>
          <div className="my-8 grid grid-cols-2 rounded-full border border-[#30332c] p-1" role="tablist" aria-label="Account access">{[["signin", "Sign in"], ["signup", "Create account"]].map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={mode === value} onClick={() => setMode(value)} className={`rounded-full px-3 py-2.5 text-sm ${mode === value ? "bg-[#d7fa70] font-bold text-[#101110]" : "text-[#a7aa9e] hover:text-[#f3f1e9]"}`}>{label}</button>)}</div>
          <form onSubmit={handleSubmit} className="grid gap-5">
            {mode === "signup" && <div className="grid gap-2"><label htmlFor="name" className="text-sm font-medium">Full name</label><input id="name" type="text" className="h-12 rounded-xl border border-[#30332c] bg-[#101110] px-4 outline-none focus:border-[#d7fa70]" placeholder="Your full name" value={name} onChange={(event) => setName(event.target.value)} required /></div>}
            <div className="grid gap-2"><label htmlFor="email" className="text-sm font-medium">Email address</label><input id="email" type="email" className="h-12 rounded-xl border border-[#30332c] bg-[#101110] px-4 outline-none focus:border-[#d7fa70]" placeholder="you@vitstudent.ac.in" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></div>
            <div className="grid gap-2"><label htmlFor="password" className="text-sm font-medium">Password</label><input id="password" type="password" className="h-12 rounded-xl border border-[#30332c] bg-[#101110] px-4 outline-none focus:border-[#d7fa70]" placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></div>
            <button type="submit" disabled={submitting} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#d7fa70] px-5 text-sm font-bold text-[#101110] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Processing..." : mode === "signin" ? "Sign in" : "Create account"}{!submitting && <ArrowUpRight size={16} />}</button>
          </form><p className="mt-8 flex items-center gap-2 text-xs leading-5 text-[#70766b]"><ShieldCheck size={14} className="shrink-0 text-[#d7fa70]" /> Your account email is used as the identity for your applications.</p>
        </section>
      </div>
    </main>
  );
}
