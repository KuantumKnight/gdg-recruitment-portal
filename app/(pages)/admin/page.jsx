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
      <main className="min-h-screen bg-white">
        <NavBar />
        <section className="utility-page">
          <div className="utility-poster">
            <p className="auth-poster-meta">Access desk · 403</p>
            <h2>Private workspace.</h2>
            <p className="auth-poster-meta">GDG on Campus · VIT Chennai</p>
          </div>
          <div className="utility-panel">
            <p className="eyebrow">Recruitment workspace</p>
            <h1>
              Admin access required.
            </h1>
            <p>
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
    <main className="min-h-screen bg-white">
      <NavBar />
      <AdminContent />
    </main>
  );
}
