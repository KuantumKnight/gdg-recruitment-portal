import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import s from "@/components/Recruitment.module.css";
export default function NotFound() {
  return (
    <>
      <NavBar />
      <main id="main-content" className={s.shell}>
        <p className={s.kicker}>Let’s find your team</p>
        <h1 className={s.title}>
          A little <em>off track.</em>
        </h1>
        <p className={s.description}>
          This application link does not match an available team. Choose one or
          two departments to start your application.
        </p>
        <Link className={s.primary} href="/departments">
          Browse departments
        </Link>
      </main>
      <Footer />
    </>
  );
}
