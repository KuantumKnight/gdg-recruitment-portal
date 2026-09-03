import Link from "next/link";
import { ArrowUpRight, Github, Instagram, Linkedin } from "lucide-react";
import { ORGANIZATION_NAME } from "@/lib/recruitment";

export default function Footer() {
  return <footer className="border-t border-[#30332c]">
    <div className="page-shell grid gap-12 py-14 sm:grid-cols-[1fr_auto] sm:items-end">
      <div><Link href="/" className="text-xl font-semibold tracking-[-.04em]">{ORGANIZATION_NAME}<span className="text-[#d7fa70]">.</span></Link><p className="mt-3 max-w-sm text-sm leading-6 text-[#a7aa9e]">A student-led community for building, learning, and sharing what comes next.</p></div>
      <div className="flex flex-wrap items-center gap-5 text-sm text-[#a7aa9e]"><Link href="/departments" className="hover:text-[#d7fa70]">Departments</Link><Link href="/auth/signin" className="hover:text-[#d7fa70]">Candidate sign in</Link><a href="https://gdg.community.dev/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-[#d7fa70]">GDG community <ArrowUpRight size={14} /></a></div>
    </div>
    <div className="page-shell flex flex-wrap justify-between gap-4 border-t border-[#30332c] py-5 text-xs text-[#70766b]"><span>© {new Date().getFullYear()} {ORGANIZATION_NAME} on campus</span><span>Built with curiosity.</span></div>
  </footer>;
}
