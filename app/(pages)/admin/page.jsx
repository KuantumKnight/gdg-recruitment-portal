import Link from "next/link";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import AdminContent from "@/components/AdminContent";
import { requireAdmin } from "@/lib/server/authorization";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Recruitment workspace | GDG",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error.status === 401) redirect("/auth/signin");
    if (error.status !== 403) throw error;
    return (
      <main className="min-h-screen bg-[#f8f9fa]">
        <NavBar />
        <section className="page-shell py-24">
          <div className="max-w-xl rounded-[24px] border border-[#dadce0] bg-white p-8 shadow-[0_1px_2px_rgba(60,64,67,.08)]">
            <p className="eyebrow">Recruitment workspace</p>
            <h1 className="mt-4 text-4xl font-medium tracking-[-.04em] text-[#202124]">
              Admin access required.
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#5f6368]">
              Your Google account is valid for the candidate portal but does not have permission to view applicant responses.
            </p>
            <Link href="/" className="button-secondary mt-7 inline-flex">
              Back to home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <NavBar />
      <AdminContent />
    </main>
  );
}
