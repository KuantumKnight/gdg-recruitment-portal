"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import UserButton from "./UserButton";
import { authClient } from "@/lib/auth-client";
import { ORGANIZATION_NAME } from "@/lib/recruitment";

export default function NavBar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const links = [{ label: "Departments", href: "/departments" }, ...(session?.user?.role === "admin" ? [{ label: "Workspace", href: "/admin" }] : [])];
  const close = () => setOpen(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[#30332c]/80 bg-[#101110]/90 backdrop-blur-xl">
      <nav className="page-shell flex h-[74px] items-center justify-between" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-3" onClick={close}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d7fa70] text-sm font-black text-[#101110]">G</span>
          <span><span className="block text-sm font-bold tracking-[-.03em]">{ORGANIZATION_NAME}</span><span className="block text-[10px] uppercase tracking-[.16em] text-[#a7aa9e]">on campus</span></span>
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => <Link key={link.href} href={link.href} className={`text-sm transition-colors hover:text-[#d7fa70] ${pathname === link.href ? "text-[#d7fa70]" : "text-[#a7aa9e]"}`}>{link.label}</Link>)}
          {isPending ? <span className="text-sm text-[#a7aa9e]">Checking session…</span> : session?.user ? <UserButton user={session.user} /> : <Link href="/auth/signin" className="button-primary py-2.5">Sign in <ArrowUpRight size={15} /></Link>}
        </div>
        <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className="rounded-lg p-2 text-[#f3f1e9] md:hidden" onClick={() => setOpen((value) => !value)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
      </nav>
      {open && <div className="page-shell border-t border-[#30332c] py-4 md:hidden"><div className="grid gap-2">{links.map((link) => <Link key={link.href} href={link.href} onClick={close} className="rounded-xl px-3 py-3 text-sm text-[#f3f1e9] hover:bg-[#1c1e1b]">{link.label}</Link>)}{session?.user ? <UserButton user={session.user} /> : <Link href="/auth/signin" onClick={close} className="button-primary mt-2">Sign in <ArrowUpRight size={15} /></Link>}</div></div>}
    </header>
  );
}
