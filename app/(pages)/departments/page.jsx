"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, Search, Sparkles } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { departments } from "@/lib/catalog";
import { MAX_APPLICATIONS, isRecruitmentOpen } from "@/lib/recruitment";
import { useSubmissions } from "@/components/SubmissionsProvider";
import s from "@/components/Recruitment.module.css";

const technicalOrder = ["Blockchain", "Game Development", "App Development", "UI/UX", "Data Science", "Competitive Programming", "Web Development", "Open Source", "Cloud & DevOps"];
const communityOrder = ["Design", "Outreach", "Publicity", "Management"];
const cardColors = ["#FBBC04", "#4285F4", "#EA4335", "#0F9D58"];
const iconFor = {
  Blockchain: "blockchain",
  "Game Development": "game-dev",
  "App Development": "app-dev",
  "UI/UX": "ui-ux",
  "Data Science": "data-science",
  "Competitive Programming": "cp",
  "Web Development": "web-dev",
  "Open Source": "open-source",
  "Cloud & DevOps": "web-dev",
  Design: "design",
  Outreach: "outreach",
  Publicity: "social-media",
  Management: "management",
};
const titleFor = { "Game Development": "Game Dev", "App Development": "App Dev", "Web Development": "Web Dev", Publicity: "Social Media & Marketing" };

function orderDepartments(items, order) {
  return [...items].sort((a, b) => order.indexOf(a.displayName) - order.indexOf(b.displayName));
}

export default function DepartmentsPage() {
  const [selection, setSelection] = useState([]);
  const [query, setQuery] = useState("");
  const { submittedDepartments, isLoadingSubmissions, submissionsError, refreshSubmissions } = useSubmissions();
  const remaining = Math.max(0, MAX_APPLICATIONS - submittedDepartments.length);
  const open = isRecruitmentOpen();
  const selected = selection.filter((id) => !submittedDepartments.includes(departments.find((d) => d.id === id)?.name)).slice(0, remaining);
  const matches = (d) => `${d.displayName} ${d.description}`.toLowerCase().includes(query.trim().toLowerCase());
  const technical = orderDepartments(departments.filter((d) => d.category === "Technical" && matches(d)), technicalOrder);
  const community = orderDepartments(departments.filter((d) => d.category !== "Technical" && matches(d)), communityOrder);

  function toggle(id) {
    setSelection((current) => current.includes(id) ? current.filter((x) => x !== id) : selected.length < remaining ? [...selected, id] : current);
  }

  function renderCard(d, index) {
    const checked = selected.includes(d.id);
    const saved = submittedDepartments.includes(d.name);
    const disabled = saved || (!checked && selected.length >= remaining) || isLoadingSubmissions || !!submissionsError || !open;
    const title = titleFor[d.displayName] || d.displayName;
    const iconPath = `/assets/images/icons/${iconFor[d.displayName] || "web-dev"}.svg`;
    const color = cardColors[index % cardColors.length];
    return (
      <label key={d.id} className={s.departmentsCard} data-selected={checked} data-disabled={saved || (open && disabled)} style={{ backgroundColor: color }}>
        <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(d.id)} aria-label={`Select ${title}`} />
        <Image src={iconPath} alt="" width={220} height={220} className={s.departmentArt} aria-hidden="true" />
        <div className={s.departmentCardBody}>
          <div className={s.departmentCardHeader}><span className={s.departmentIndex}>{String(index + 1).padStart(2, "0")}</span><span className={s.departmentCheck} aria-hidden="true">{(checked || saved) && <Check size={14} />}</span></div>
          <h3>{title}</h3>
          <p>{d.description}</p>
          <div className={s.departmentMeta}><span>{saved ? "Applied" : d.category === "Technical" ? "Technical" : "Community"}</span><span>{d.questions.length} questions</span></div>
        </div>
      </label>
    );
  }

  return (
    <>
      <NavBar />
      <main id="main-content" className={s.departmentsPage}>
        <Image src="/assets/images/bg_grids.svg" alt="" width={1000} height={500} className={s.departmentBackdrop} aria-hidden="true" />
        <div className={s.departmentsContent}>
          <div className={s.departmentsIntro}>
            <p className={s.kicker}>Find your people · Build your thing</p>
            <h1>Choose where you want to make an impact.</h1>
            <p>Explore every GDG team and choose up to two departments that feel like you. Each card leads to a real application with room for your story.</p>
          </div>
          <div className={s.departmentsToolbar}>
            <div className={s.departmentCount}>{technical.length + community.length} teams to explore</div>
            <label className={s.departmentsSearch}><Search size={17} aria-hidden="true" /><input aria-label="Search departments" placeholder="Find a department…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
          </div>
          {!open && <p className={s.notice}>This recruitment round has closed. You can still explore every team and discover where you belong.</p>}
          {submissionsError && <div className={`${s.notice} ${s.error}`} role="alert">{submissionsError}<button className={s.secondary} onClick={refreshSubmissions}>Try again</button></div>}
          {submittedDepartments.length > 0 && <p className={s.notice}>You have {submittedDepartments.length} saved application{submittedDepartments.length > 1 ? "s" : ""}. {remaining ? `You can apply to ${remaining} more team.` : "You’ve used both application slots."}</p>}
          <section aria-labelledby="technical-heading"><h2 id="technical-heading" className={s.departmentsHeading}>Technical Departments</h2><div className={s.departmentsGrid}>{technical.map(renderCard)}</div></section>
          <section aria-labelledby="community-heading"><h2 id="community-heading" className={s.departmentsHeading}>Non-Technical Departments</h2><div className={s.departmentsGrid}>{community.map(renderCard)}</div></section>
          {!technical.length && !community.length && <div className={s.empty}><Sparkles size={24} style={{ margin: "0 auto 15px" }} /><p>No departments match “{query}”.</p><button className={s.secondary} onClick={() => setQuery("")}>Show all departments</button></div>}
          <div className={s.departmentsSelectionBar}>
            <div aria-live="polite"><h2>{open ? `${selected.length} of ${remaining} available teams selected` : "Curiosity doesn’t have a deadline."}</h2><p>{selected.length ? selected.map((id) => departments.find((d) => d.id === id).displayName).join(" + ") : open ? "Choose the teams you’re excited to grow with." : "Explore today. Build with us in the next chapter."}</p></div>
            {open ? selected.length && !isLoadingSubmissions && !submissionsError ? <Link className={s.primary} href={`/join/${selected.join("/")}`}>Continue to application <ArrowUpRight size={17} /></Link> : <button className={s.primary} disabled>{isLoadingSubmissions ? "Checking applications…" : "Select a team to continue"}</button> : <Link href="/" className={s.primary}>Back to the community <ArrowUpRight size={17} /></Link>}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}