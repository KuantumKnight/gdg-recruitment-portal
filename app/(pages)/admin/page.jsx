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
      <main>
        <NavBar />
        <section className="page-shell py-24">
          <p className="eyebrow">Recruitment workspace</p>
          <h1 className="mt-5 text-4xl font-semibold">
            Admin access required.
          </h1>
          <p className="mt-4 text-[#a7aa9e]">
            Your account does not have permission to view applicant responses.
          </p>
          <Link href="/" className="button-secondary mt-8 inline-flex">
            Back to the community
          </Link>
        </section>
      </main>
    );
  }
  return (
    <main>
      <NavBar />
      <AdminContent />
    </main>
  );
}
