import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { departments } from "@/lib/catalog";

const stats = [
  ["13", "ways to contribute"],
  ["02", "applications per candidate"],
  ["01", "community to grow with"],
];

export default function Hero() {
  return (
    <>
      <section className="page-shell relative overflow-hidden pb-20 pt-14 sm:pb-28 sm:pt-24">
        <div className="absolute -right-20 top-12 h-72 w-72 rounded-full bg-[#d7fa70]/10 blur-3xl" aria-hidden="true" />
        <div className="relative grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <p className="eyebrow">Google Developer Groups · On campus</p>
            <h1 className="mt-6 max-w-4xl text-[clamp(3.5rem,10vw,8.5rem)] font-semibold leading-[.9] tracking-[-.08em]">
              Good things start with <span className="text-[#d7fa70]">curious minds.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-[#a7aa9e] sm:text-xl">
              A community for people who like to learn out loud, ship useful things, and make the room better for everyone in it. Explore departments to check the current recruitment status.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/departments" className="button-primary">Explore departments <ArrowUpRight size={17} /></Link>
              <Link href="/auth/signin" className="button-secondary">Candidate sign in</Link>
            </div>
          </div>
          <div className="panel relative overflow-hidden p-6 sm:p-8">
            <div className="mb-16 flex items-center justify-between text-xs text-[#a7aa9e]"><span className="flex items-center gap-2"><Sparkles size={15} className="text-[#d7fa70]" /> 2026 intake</span><span>01 / 03</span></div>
            <p className="max-w-xs text-3xl font-medium leading-tight tracking-[-.04em]">Your next project could start with a conversation.</p>
            <div className="mt-12 h-px bg-[#30332c]" />
            <p className="mt-4 text-sm leading-6 text-[#a7aa9e]">Pick a department, tell us what you want to try, and leave the rest to your future teammates.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#30332c] bg-[#171914]/65">
        <div className="page-shell grid gap-0 sm:grid-cols-3">
          {stats.map(([value, label]) => <div key={label} className="border-[#30332c] py-7 sm:border-r sm:px-8 sm:first:pl-0 sm:last:border-r-0"><p className="text-3xl font-medium tracking-[-.05em] text-[#d7fa70]">{value}</p><p className="mt-1 text-sm text-[#a7aa9e]">{label}</p></div>)}
        </div>
      </section>

      <section className="page-shell py-20 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Find your people</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.06em] sm:text-6xl">Make something real.</h2></div><Link href="/departments" className="button-secondary">See all departments <ArrowUpRight size={16} /></Link></div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {departments.slice(0, 6).map((department, index) => <Link key={department.id} href={`/join/${department.id}`} className="group panel p-6 transition-transform duration-200 hover:-translate-y-1 hover:border-[#697457]">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[.16em]" style={{ color: department.color }}>{String(index + 1).padStart(2, "0")}</span><ArrowUpRight size={17} className="text-[#a7aa9e] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
            <h3 className="mt-16 text-2xl font-medium tracking-[-.04em]">{department.displayName}</h3><p className="mt-3 text-sm leading-6 text-[#a7aa9e]">{department.description}</p>
          </Link>)}
        </div>
      </section>

      <section className="page-shell pb-24"><div className="rounded-[28px] bg-[#d7fa70] p-8 text-[#101110] sm:p-12"><p className="text-xs font-bold uppercase tracking-[.16em]">A small step, a big network</p><div className="mt-8 flex flex-wrap items-end justify-between gap-8"><h2 className="max-w-2xl text-4xl font-semibold leading-[.95] tracking-[-.06em] sm:text-6xl">Bring the question you keep coming back to.</h2><Link href="/departments" className="inline-flex items-center gap-2 rounded-full bg-[#101110] px-5 py-3 text-sm font-bold text-[#f3f1e9]">Start exploring <ArrowUpRight size={16} /></Link></div></div></section>
    </>
  );
}

