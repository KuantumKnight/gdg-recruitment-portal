import { notFound } from "next/navigation";
import { getDepartment } from "@/lib/catalog";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import FormComp from "@/components/FormComp";
export const metadata = { title: "Apply · GDG on Campus" };
export default async function JoinPage({ params }) {
  const { joinIds } = await params;
  if (
    !joinIds ||
    joinIds.length < 1 ||
    joinIds.length > 2 ||
    new Set(joinIds).size !== joinIds.length
  )
    notFound();
  const chosen = joinIds.map((id) => getDepartment(id));
  if (chosen.some((d, i) => !d || d.id !== joinIds[i])) notFound();
  return (
    <>
      <NavBar />
      <main id="main-content">
        <FormComp dept1={chosen[0]} dept2={chosen[1]} />
      </main>
      <Footer />
    </>
  );
}
