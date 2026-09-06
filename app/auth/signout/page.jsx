"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import GDGLoader from "@/components/GDGLoader";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function performSignOut() {
      try {
        const result = await authClient.signOut();
        if (result?.error) throw new Error(result.error.message || "Sign out failed");
        if (!active) return;
        toast.success("Signed out successfully.");
      } catch (error) {
        console.error("Sign out error:", error);
        if (!active) return;
        toast.error("We could not confirm sign out. Please try again if your session remains active.");
      } finally {
        if (active) {
          router.replace("/");
          router.refresh();
        }
      }
    }

    performSignOut();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <GDGLoader label="Signing you out…" />
    </main>
  );
}
