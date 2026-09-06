import Link from "next/link";
import { ArrowRight, BookOpen, Code2, Layers3, Users } from "lucide-react";
import { isRecruitmentOpen } from "@/lib/recruitment";

const principles = [
  { title: "Build real things", text: "Work on practical projects, not filler assignments.", Icon: Code2, color: "#4285F4" },
  { title: "Learn in public", text: "Share progress, ask better questions, and grow with peers.", Icon: BookOpen, color: "#34A853" },
  { title: "Find your team", text: "Choose the domain where your curiosity has momentum.", Icon: Users, color: "#EA4335" },
  { title: "Own the outcome", text: "Take responsibility, iterate, and ship work you can explain.", Icon: Layers3, color: "#FBBC04" },
];

export default function Hero() {
  const open = isRecruitmentOpen();

  return (
    <section className="bg-white">
      <div className="page-shell py-16 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dadce0] bg-white px-4 py-2 text-sm text-[#5f6368] shadow-[0_1px_2px_rgba(60,64,67,.08)]">
            <span className={`h-2 w-2 rounded-full ${open ? "bg-[#34a853]" : "bg-[#80868b]"}`} aria-hidden="true" />
            Recruitment 2026 · {open ? "Applications open" : "Applications closed"}
          </div>

          <p className="mt-8 text-sm font-semibold text-[#1a73e8]">
            Google Developer Groups on Campus · VIT Chennai
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl text-[clamp(3rem,8vw,6.4rem)] font-medium leading-[.96] tracking-[-.055em] text-[#202124]">
            Build what matters.
            <span className="block text-[#5f6368]">Grow with people who do.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-[#5f6368] sm:text-lg sm:leading-8">
            Explore the teams behind GDG on Campus VIT Chennai, understand what each one works on, and choose where you want to contribute next.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/departments" className="button-primary px-6">
              Explore teams <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a
              href="https://docs.google.com/document/d/1nkCCHtfCWqLvFjlYgb5EmNG9xmhrsuUEDxEluKtO_Ug/edit?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="button-secondary px-6"
            >
              Read recruitment FAQs
            </a>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map(({ title, text, Icon, color }) => (
            <article key={title} className="rounded-[20px] border border-[#dadce0] bg-white p-5 shadow-[0_1px_2px_rgba(60,64,67,.06)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}14`, color }}>
                <Icon size={20} aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-base font-semibold text-[#202124]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#5f6368]">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
