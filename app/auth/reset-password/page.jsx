"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const linkError = searchParams.get("error");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const invalidLink = !token || Boolean(linkError);

  async function handleSubmit(event) {
    event.preventDefault();
    if (invalidLink || saving) return;
    if (password.length < 8) return toast.error("Use at least 8 characters.");
    if (password !== confirmPassword) return toast.error("Passwords do not match.");

    setSaving(true);
    try {
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result?.error) throw new Error(result.error.message || "Could not reset your password.");
      toast.success("Password updated. Sign in with your new password.");
      router.replace("/auth/signin");
    } catch (error) {
      toast.error(error.message || "Could not reset your password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#101110] px-5 py-12 text-[#f3f1e9]">
      <section className="w-full max-w-md rounded-[28px] border border-[#30332c] bg-[#171914] p-7 shadow-2xl sm:p-9">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d7fa70]/30 bg-[#d7fa70]/10 text-[#d7fa70]">
          <KeyRound size={23} aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-[#d7fa70]">Candidate portal</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-.05em]">Choose a new password.</h1>

        {invalidLink ? (
          <>
            <p role="alert" className="mt-4 text-sm leading-6 text-[#a7aa9e]">This reset link is missing, invalid, or expired. Request a new one instead of retrying this URL.</p>
            <Link href="/auth/forgot-password" className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#d7fa70] px-5 text-sm font-bold text-[#101110]">Request a new link</Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">New password</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 rounded-xl border border-[#30332c] bg-[#101110] px-4 outline-none focus:border-[#d7fa70]"
                placeholder="At least 8 characters"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">Confirm password</label>
              <input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-12 rounded-xl border border-[#30332c] bg-[#101110] px-4 outline-none focus:border-[#d7fa70]"
                placeholder="Repeat your new password"
              />
            </div>
            <button type="submit" disabled={saving} className="h-12 rounded-full bg-[#d7fa70] px-5 text-sm font-bold text-[#101110] disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? "Updating…" : "Update password"}
            </button>
          </form>
        )}

        <Link href="/auth/signin" className="mt-6 inline-flex items-center gap-2 text-sm text-[#a7aa9e] hover:text-white">
          <ArrowLeft size={15} aria-hidden="true" /> Back to sign in
        </Link>
      </section>
    </main>
  );
}
