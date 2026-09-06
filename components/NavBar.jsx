"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import UserButton from "./UserButton";
import { authClient } from "@/lib/auth-client";
import { ORGANIZATION_NAME } from "@/lib/recruitment";

const recruitmentDeadline = new Date("2026-09-30T23:59:59+05:30").getTime();

function Countdown() {
  const [remaining, setRemaining] = useState(recruitmentDeadline - Date.now());

  useEffect(() => {
    const update = () => setRemaining(Math.max(0, recruitmentDeadline - Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const totalSeconds = Math.floor(remaining / 1000);
  const values = [
    [Math.floor(totalSeconds / 86400), "Days"],
    [Math.floor((totalSeconds % 86400) / 3600), "Hours"],
    [Math.floor((totalSeconds % 3600) / 60), "Minutes"],
    [totalSeconds % 60, "Seconds"],
  ];

  return (
    <div className="hidden flex-col items-center justify-center lg:flex" aria-label="Application deadline countdown">
      <div className="flex items-center gap-3">
        {values.map(([value, label], index) => (
          <div className="flex items-center" key={label}>
            <div className="flex flex-col items-center">
              <div className="gdg-countdown-value font-bold text-white">{String(value).padStart(2, "0")}</div>
              <div className="text-[10px] uppercase tracking-wide text-gray-400">{label}</div>
            </div>
            {index < values.length - 1 && <span className="px-3 text-2xl font-bold text-gray-500">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const links = [{ label: "Departments", href: "/departments" }, ...(session?.user?.role === "admin" ? [{ label: "Workspace", href: "/admin" }] : [])];
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 px-5 py-3">
      <nav className="flex min-h-[64px] items-center justify-between rounded-lg bg-[rgba(80,80,80,0.2)] px-5 py-4 backdrop-blur" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-2 text-white" onClick={close}>
          <Image src="/assets/gdg.svg" alt="GDG" width={40} height={40} className="rounded-full" priority />
          <span className="hidden tracking-tight sm:block">{ORGANIZATION_NAME} | Recruitment Portal</span>
          <span className="tracking-wide sm:hidden">Recruitment Portal</span>
        </Link>
        <div className="flex items-center justify-center gap-3">
          <Countdown />
          <div className="hidden items-center gap-5 lg:flex">
            {links.map((link) => <Link key={link.href} href={link.href} className={`text-sm transition-colors hover:text-white ${pathname === link.href ? "text-white" : "text-gray-300"}`}>{link.label}</Link>)}
            {isPending ? <span className="text-sm text-gray-400">Checking session…</span> : session?.user ? <UserButton user={session.user} /> : <Link href="/auth/signin" className="button-primary py-2.5">Sign in <ArrowUpRight size={15} /></Link>}
          </div>
          <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className="rounded-full border border-input bg-background p-2 text-white lg:hidden" onClick={() => setOpen((value) => !value)}>{open ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
      </nav>
      {open && <div className="mx-auto mt-2 max-w-[1180px] rounded-lg border border-[#333] bg-[#1a1a1a] p-4 lg:hidden"><div className="grid gap-2">{links.map((link) => <Link key={link.href} href={link.href} onClick={close} className="rounded-xl px-3 py-3 text-sm text-white hover:bg-[#252525]">{link.label}</Link>)}{session?.user ? <UserButton user={session.user} /> : <Link href="/auth/signin" onClick={close} className="button-primary mt-2">Sign in <ArrowUpRight size={15} /></Link>}</div></div>}
    </header>
  );
}