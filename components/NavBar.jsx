"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import UserButton from "./UserButton";
import { authClient } from "@/lib/auth-client";
import { ORGANIZATION_NAME, RECRUITMENT_DEADLINE } from "@/lib/recruitment";

const recruitmentDeadline = new Date(RECRUITMENT_DEADLINE).getTime();

function Countdown() {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!Number.isFinite(recruitmentDeadline)) {
      setRemaining(0);
      return undefined;
    }
    const update = () => setRemaining(Math.max(0, recruitmentDeadline - Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (remaining === null) return null;

  if (remaining <= 0) {
    return (
      <span className="hidden rounded-full bg-[#f1f3f4] px-3.5 py-2 text-xs font-medium text-[#5f6368] lg:inline-flex">
        Recruitment closed
      </span>
    );
  }

  const totalMinutes = Math.ceil(remaining / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const label = days > 0 ? `${days}d ${hours}h left` : hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;

  return (
    <span className="hidden rounded-full bg-[#e6f4ea] px-3.5 py-2 text-xs font-medium text-[#137333] lg:inline-flex" aria-label={`Application deadline ${label}`}>
      {label}
    </span>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Departments", href: "/departments" },
    ...(session?.user?.role === "admin" ? [{ label: "Workspace", href: "/admin" }] : []),
  ];
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8eaed] bg-white/95 backdrop-blur-md">
      <nav className="page-shell flex min-h-[64px] items-center justify-between gap-4" aria-label="Main navigation">
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={close}>
          <Image src="/assets/gdg.svg" alt="GDG" width={32} height={32} priority />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-medium text-[#202124] sm:hidden">GDG VIT Chennai</span>
            <span className="hidden truncate text-[15px] font-medium text-[#202124] sm:block">{ORGANIZATION_NAME}</span>
            <span className="block text-[11px] text-[#80868b]">Recruitment</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Countdown />
          <div className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${pathname === link.href ? "bg-[#e8f0fe] text-[#0b57d0]" : "text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]"}`}
              >
                {link.label}
              </Link>
            ))}
            {isPending ? null : session?.user ? (
              <div className="ml-2"><UserButton user={session.user} /></div>
            ) : (
              <Link href="/auth/signin" className="button-primary ml-2 min-h-0 px-5 py-2.5">Sign in</Link>
            )}
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="rounded-full p-2.5 text-[#5f6368] hover:bg-[#f1f3f4] lg:hidden"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-[#e8eaed] bg-white lg:hidden">
          <div className="page-shell grid gap-1 py-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={close} className="rounded-xl px-3 py-3 text-sm font-medium text-[#3c4043] hover:bg-[#f1f3f4]">
                {link.label}
              </Link>
            ))}
            {session?.user ? (
              <div className="mt-1 px-1 py-2"><UserButton user={session.user} /></div>
            ) : (
              <Link href="/auth/signin" onClick={close} className="button-primary mt-2 w-full">Sign in with Google</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
