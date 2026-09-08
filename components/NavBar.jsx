"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "@material-symbols-svg/react/icons/menu";
import { Close } from "@material-symbols-svg/react/icons/close";
import UserButton from "./UserButton";
import { authClient } from "@/lib/auth-client";
import { isRecruitmentOpen, ORGANIZATION_NAME, RECRUITMENT_DEADLINE } from "@/lib/recruitment";

const recruitmentDeadline = new Date(RECRUITMENT_DEADLINE).getTime();

function RecruitmentStatus() {
  const [state, setState] = useState(() => ({ open: isRecruitmentOpen(), label: "Applications status" }));

  useEffect(() => {
    const update = () => {
      const remaining = Math.max(0, recruitmentDeadline - Date.now());
      if (!Number.isFinite(recruitmentDeadline) || remaining <= 0) {
        setState({ open: false, label: "Recruitment closed" });
        return;
      }
      const totalMinutes = Math.ceil(remaining / 60000);
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const time = days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
      setState({ open: true, label: `Applications open · ${time}` });
    };
    update();
    const timer = window.setInterval(update, 60000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="editorial-status" data-open={state.open} aria-label={state.label}>
      <span className="editorial-status-dot" aria-hidden="true" />
      {state.open ? "Applications are open" : "Recruitment closed"}
    </span>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Explore teams", mobileLabel: "Departments", href: "/departments" },
    { label: "Recruitment FAQs", href: "https://docs.google.com/document/d/1nkCCHtfCWqLvFjlYgb5EmNG9xmhrsuUEDxEluKtO_Ug/edit?usp=sharing", external: true },
    ...(session?.user?.role === "admin" ? [{ label: "Workspace", href: "/admin" }] : []),
  ];
  const close = () => setOpen(false);

  return (
    <header className="editorial-header">
      <nav className="editorial-nav" aria-label="Main navigation">
        <Link href="/" className="editorial-brand" onClick={close}>
          <Image src="/assets/gdg.svg" alt="GDG on Campus" width={52} height={38} priority />
          <span className="min-w-0">
            <span className="editorial-brand-title">{ORGANIZATION_NAME}</span>
            <span className="editorial-brand-subtitle">VIT Chennai · Recruitment</span>
          </span>
        </Link>
        <div className="editorial-links">
          {links.map((link) => link.external ? (
            <a key={link.href} className="editorial-link" href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
          ) : (
            <Link key={link.href} className="editorial-link" aria-label={link.href === "/departments" ? "Department directory" : undefined} aria-current={pathname === link.href ? "page" : undefined} href={link.href}>{link.label}</Link>
          ))}
        </div>
        <RecruitmentStatus />
        <div className="editorial-account">
          {isPending ? null : session?.user ? <UserButton user={session.user} /> : <Link href="/auth/signin" className="button-secondary">Sign in</Link>}
        </div>
        <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className="editorial-mobile-toggle" onClick={() => setOpen((value) => !value)}>
          {open ? <Close size={26} /> : <Menu size={26} />}
        </button>
        <div className="editorial-issue" aria-label="Recruitment issue 2026"><span>Issue</span><strong>&apos;26</strong></div>
      </nav>
      {open && (
        <div className="editorial-mobile-menu">
          {links.map((link) => link.external ? (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" onClick={close}>{link.label}<span aria-hidden="true">↗</span></a>
          ) : (
            <Link key={link.href} href={link.href} onClick={close}>{link.mobileLabel || link.label}<span aria-hidden="true">→</span></Link>
          ))}
          {session?.user ? <div><UserButton user={session.user} /></div> : <Link href="/auth/signin" onClick={close}>Sign in with Google <span aria-hidden="true">→</span></Link>}
        </div>
      )}
    </header>
  );
}
