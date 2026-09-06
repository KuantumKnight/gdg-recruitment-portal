import Link from "next/link";
import { ArrowRight, BookOpen, Code2, Layers3, Users } from "lucide-react";
import { isRecruitmentOpen } from "@/lib/recruitment";

const principles = [
  { title: "Build real things", text: "Work on practical projects with people who care about the outcome.", Icon: Code2, color: "#4285F4" },
  { title: "Learn together", text: "Ask better questions, share progress, and grow through collaboration.", Icon: BookOpen, color: "#34A853" },
  { title: "Find your team", text: "Choose the domain where your curiosity and skills have momentum.", Icon: Users, color: "#EA4335" },
  { title: "Ship responsibly", text: "Own the details, iterate on feedback, and build work you can explain.", Icon: Layers3, color: "#FBBC04" },
];

export default function Hero() {
  const open = isRecruitmentOpen();

  return (
    <section className="bg-white">
      <div className="page-shell py-16 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex w-fit items-center gap-1.5" aria-hidden="true">
            <span className="h-1.5 w-8 rounded-full bg-[#4285f4]" />
            <span className="h-1.5 w-8 rounded-full bg-[#ea4335]" />
            <span className="h-1.5 w-8 rounded-full bg-[#fbbc04]" />
            <span className="h-1.5 w-8 rounded-full bg-[#34a853]" />
          </div>

          <p className="mt-8 text-sm font-medium text-[#0b57d0]">
            Google Developer Groups on Campus · VIT Chennai
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl text-[clamp(3rem,8vw,6.2rem)] font-normal leading-[.96] tracking-[-.05em] text-[#202124]">
            Build what matters.
            <span className="block text-[#5f6368]">Learn with people who do.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-[#5f6368] sm:text-lg sm:leading-8">
            Explore the teams behind GDG on Campus VIT Chennai, understand what each one works on, and choose where you want to contribute.
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
              Recruitment FAQs
            </a>
          </div>

          <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#f1f3f4] px-4 py-2 text-sm text-[#5f6368]">
            <span className={`h-2 w-2 rounded-full ${open ? "bg-[#34a853]" : "bg-[#80868b]"}`} aria-hidden="true" />
            {open ? "Applications are open" : "Recruitment is currently closed"}
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map(({ title, text, Icon, color }) => (
            <article key={title} className="rounded-[18px] border border-[#dadce0] bg-white p-6 transition-shadow hover:shadow-[0_1px_2px_rgba(60,64,67,.08),0_2px_8px_rgba(60,64,67,.08)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${color}14`, color }}>
                <Icon size={19} aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-[15px] font-semibold text-[#202124]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#5f6368]">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
