import Link from "next/link";
import { ArrowRight, CalendarDays, FolderOpen, Users, Waypoints } from "lucide-react";

const highlights = [
  { label: "A Google Initiative", tone: "yellow", icon: FolderOpen },
  { label: "12 Teams, Real Projects, Endless Chaos", tone: "green", icon: CalendarDays },
  { label: "200+ Passionate Developers", tone: "blue", icon: Users },
  { label: "Opportunities to Lead and Innovate", tone: "red", icon: Waypoints },
];

function Highlight({ item, desktop = false }) {
  const Icon = item.icon;
  return (
    <div className={`gdg-pill gdg-pill-${item.tone} ${desktop ? "hidden lg:block" : "px-4 py-3"}`}>
      <div className="flex items-center gap-2">
        {!desktop && <Icon className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />}
        <span className={desktop ? "px-6 py-4" : "text-sm"}>{item.label}</span>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#121212]">
      <div className="gdg-hero-grid absolute inset-0 h-1/2 opacity-30" aria-hidden="true" />
      <div className="gdg-hero-ellipse absolute inset-x-0 top-1/2 -translate-y-1/2" aria-hidden="true" />

      <div className="relative z-10 flex min-h-[calc(100vh-120px)] flex-col items-center justify-center px-4 py-12">
        <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
          <div className="absolute left-20 top-20 rotate-[-12deg]"><Highlight item={highlights[0]} desktop /></div>
          <div className="absolute right-20 top-32 rotate-[12deg]"><Highlight item={highlights[1]} desktop /></div>
          <div className="absolute bottom-32 left-32 rotate-[6deg]"><Highlight item={highlights[2]} desktop /></div>
          <div className="absolute bottom-20 right-32 rotate-[-6deg]"><Highlight item={highlights[3]} desktop /></div>
        </div>

        <div className="mt-4 flex max-w-3xl flex-wrap justify-center gap-4 lg:hidden">
          {highlights.map((item) => <Highlight item={item} key={item.label} />)}
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-6 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.24em] text-blue-300">Google Developer Groups on Campus VIT Chennai</p>
          <h1 className="leading-none text-white" style={{ fontWeight: 800, fontSize: "clamp(32px, 8vw, 55px)" }}>Ready to Make Your Mark?</h1>
          <p className="mx-auto max-w-2xl text-gray-300" style={{ fontWeight: 300, fontSize: "clamp(18px, 4vw, 30px)", lineHeight: 1 }}>Innovate with us — your journey starts here.</p>
          <div className="flex justify-center gap-x-5">
            <Link href="/departments" className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-blue-700 sm:px-12 sm:py-4 sm:text-xl">Join us <ArrowRight size={19} /></Link>
            <a href="https://docs.google.com/document/d/1nkCCHtfCWqLvFjlYgb5EmNG9xmhrsuUEDxEluKtO_Ug/edit?usp=sharing" target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-red-500 px-8 py-3 text-lg font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-red-700 sm:px-12 sm:py-4 sm:text-xl">FAQs <ArrowRight size={19} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}