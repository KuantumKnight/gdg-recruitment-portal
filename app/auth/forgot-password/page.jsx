"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || sending) return;

    setSending(true);
    try {
      const result = await authClient.requestPasswordReset({
        email: normalizedEmail,
        redirectTo: "/auth/reset-password",
      });
      if (result?.error) throw new Error(result.error.message || "Could not request a reset link.");
      setSent(true);
    } catch (error) {
      toast.error(error.message || "Could not request a reset link.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#101110] px-5 py-12 text-[#f3f1e9]">
      <section className="w-full max-w-md rounded-[28px] border border-[#30332c] bg-[#171914] p-7 shadow-2xl sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d7fa70]">Candidate portal</p>
        {sent ? (
          <div className="pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d7fa70]/30 bg-[#d7fa70]/10 text-[#d7fa70]">
              <MailCheck size={24} aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-[-.05em]">Check your inbox.</h1>
            <p className="mt-3 text-sm leading-6 text-[#a7aa9e]">
              If an account exists for <strong className="font-medium text-[#f3f1e9]">{email.trim().toLowerCase()}</strong>, a password-reset link has been sent.
            </p>
            <Link href="/auth/signin" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#d7fa70] hover:underline">
              <ArrowLeft size={15} aria-hidden="true" /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.05em]">Reset your password.</h1>
            <p className="mt-3 text-sm leading-6 text-[#a7aa9e]">Enter your institutional email. We’ll send a time-limited reset link if an account exists.</p>
            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">Institutional email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@vitstudent.ac.in"
                  className="h-12 rounded-xl border border-[#30332c] bg-[#101110] px-4 outline-none focus:border-[#d7fa70]"
                />
              </div>
              <button type="submit" disabled={sending} className="h-12 rounded-full bg-[#d7fa70] px-5 text-sm font-bold text-[#101110] disabled:cursor-not-allowed disabled:opacity-60">
                {sending ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <Link href="/auth/signin" className="mt-6 inline-flex items-center gap-2 text-sm text-[#a7aa9e] hover:text-white">
              <ArrowLeft size={15} aria-hidden="true" /> Back to sign in
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
