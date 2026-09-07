"use client";

import Link from "next/link";
import { useState } from "react";
import { AccountTree } from "@material-symbols-svg/react/icons/account-tree";
import { AdsClick } from "@material-symbols-svg/react/icons/ads-click";
import { ArrowOutward } from "@material-symbols-svg/react/icons/arrow-outward";
import { Campaign } from "@material-symbols-svg/react/icons/campaign";
import { Check } from "@material-symbols-svg/react/icons/check";
import { Cloud } from "@material-symbols-svg/react/icons/cloud";
import { Code } from "@material-symbols-svg/react/icons/code";
import { Devices } from "@material-symbols-svg/react/icons/devices";
import { Diversity3 } from "@material-symbols-svg/react/icons/diversity-3";
import { Draw } from "@material-symbols-svg/react/icons/draw";
import { ManageAccounts } from "@material-symbols-svg/react/icons/manage-accounts";
import { Monitoring } from "@material-symbols-svg/react/icons/monitoring";
import { Palette } from "@material-symbols-svg/react/icons/palette";
import { Search } from "@material-symbols-svg/react/icons/search";
import { SportsEsports } from "@material-symbols-svg/react/icons/sports-esports";
import { Terminal } from "@material-symbols-svg/react/icons/terminal";
import { Token } from "@material-symbols-svg/react/icons/token";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { departments } from "@/lib/catalog";
import { MAX_APPLICATIONS, isRecruitmentOpen } from "@/lib/recruitment";
import { useSubmissions } from "@/components/SubmissionsProvider";
import s from "@/components/Recruitment.module.css";

const technicalOrder = [
  "Blockchain",
  "Game Development",
  "App Development",
  "UI/UX",
  "Data Science",
  "Competitive Programming",
  "Web Development",
  "Open Source",
  "Cloud & DevOps",
];
const communityOrder = ["Design", "Outreach", "Publicity", "Management"];
const rowColors = ["#1a73e8", "#ea4335", "#fbbc04", "#34a853"];
const iconFor = {
  Blockchain: Token,
  "Game Development": SportsEsports,
  "App Development": Devices,
  "UI/UX": Draw,
  "Data Science": Monitoring,
  "Competitive Programming": Terminal,
  "Web Development": Code,
  "Open Source": AccountTree,
  "Cloud & DevOps": Cloud,
  Design: Palette,
  Outreach: Diversity3,
  Publicity: Campaign,
  Management: ManageAccounts,
};
const titleFor = {
  "Game Development": "Game Dev",
  "App Development": "App Dev",
  "Web Development": "Web Dev",
  Publicity: "Social Media & Marketing",
};

function orderDepartments(items, order) {
  return [...items].sort((a, b) => order.indexOf(a.displayName) - order.indexOf(b.displayName));
}

export default function DepartmentsPage() {
  const [selection, setSelection] = useState([]);
  const [query, setQuery] = useState("");
  const { submittedDepartments, isLoadingSubmissions, submissionsError, refreshSubmissions } = useSubmissions();
  const remaining = Math.max(0, MAX_APPLICATIONS - submittedDepartments.length);
  const open = isRecruitmentOpen();
  const selected = selection
    .filter((id) => !submittedDepartments.includes(departments.find((department) => department.id === id)?.name))
    .slice(0, remaining);
  const term = query.trim().toLowerCase();
  const matches = (department) => `${department.displayName} ${department.description}`.toLowerCase().includes(term);
  const technical = orderDepartments(departments.filter((department) => department.category === "Technical" && matches(department)), technicalOrder);
  const community = orderDepartments(departments.filter((department) => department.category !== "Technical" && matches(department)), communityOrder);
  const selectedNames = selected.map((id) => departments.find((department) => department.id === id)?.displayName).filter(Boolean);

  function toggle(id) {
    setSelection((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : selected.length < remaining
        ? [...selected, id]
        : current);
  }

  function renderRow(department, index) {
    const checked = selected.includes(department.id);
    const saved = submittedDepartments.includes(department.name);
    const disabled = saved || (!checked && selected.length >= remaining) || isLoadingSubmissions || Boolean(submissionsError) || !open;
    const title = titleFor[department.displayName] || department.displayName;
    const Icon = iconFor[department.displayName] || Code;
    const color = rowColors[index % rowColors.length];

    return (
      <label key={department.id} className={s.departmentsCard} data-selected={checked} data-disabled={saved || (open && disabled)} style={{ "--accent": color }}>
        <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(department.id)} aria-label={`Select ${title}`} />
        <span className={s.departmentIndex}>{String(index + 1).padStart(2, "0")}</span>
        <span className={s.departmentArt} aria-hidden="true"><Icon size={27} /></span>
        <div className={s.departmentCardBody}>
          <h3>{title}</h3>
          <p>{department.description}</p>
        </div>
        <div className={s.departmentMeta}>
          <span>{saved ? "Applied" : department.category}</span>
          <span>{department.questions.length} questions</span>
        </div>
        <span className={s.departmentCheck} aria-hidden="true">{(checked || saved) && <Check size={20} />}</span>
      </label>
    );
  }

  return (
    <>
      <NavBar />
      <main id="main-content" className={s.departmentsPage}>
        <div className={s.departmentsContent}>
          <header className={s.departmentsIntro}>
            <span className={s.introNumber}>02</span>
            <p className={s.kicker}>Team directory · 13 disciplines</p>
            <h1>Choose the work you want to get better at.</h1>
            <p>Browse every department, understand what it focuses on, and choose up to two teams when recruitment is open.</p>
            <div className={s.introMarks} aria-hidden="true"><span /><span /><span /><span /></div>
          </header>

          <div className={s.departmentsDirectory}>
            <div className={s.departmentsToolbar}>
              <div className={s.departmentCount}>{technical.length + community.length} teams in this issue</div>
              <label className={s.departmentsSearch}>
                <Search size={20} aria-hidden="true" />
                <input aria-label="Search departments" placeholder="Search teams" value={query} onChange={(event) => setQuery(event.target.value)} />
              </label>
            </div>

            {!open && <p className={s.notice}>This recruitment round has closed. Explore every team now and prepare for the next intake.</p>}
            {submissionsError && (
              <div className={`${s.notice} ${s.error}`} role="alert">
                <span>{submissionsError}</span>
                <button className={s.secondary} onClick={refreshSubmissions}>Try again</button>
              </div>
            )}
            {submittedDepartments.length > 0 && (
              <p className={s.notice}>You have {submittedDepartments.length} saved application{submittedDepartments.length > 1 ? "s" : ""}. {remaining ? `You can apply to ${remaining} more team.` : "You’ve used both application slots."}</p>
            )}

            <section aria-labelledby="technical-heading">
              <div className={s.departmentsHeading}>
                <span>Technical index</span>
                <h2 id="technical-heading">Technical Departments</h2>
                <span>{technical.length.toString().padStart(2, "0")}</span>
              </div>
              <div className={s.departmentsGrid}>{technical.map(renderRow)}</div>
            </section>

            <section aria-labelledby="community-heading">
              <div className={s.departmentsHeading}>
                <span>Community index</span>
                <h2 id="community-heading">Non-Technical Departments</h2>
                <span>{community.length.toString().padStart(2, "0")}</span>
              </div>
              <div className={s.departmentsGrid}>{community.map(renderRow)}</div>
            </section>

            {!technical.length && !community.length && (
              <div className={s.empty}>
                <AdsClick size={34} />
                <p>No teams match “{query}”.</p>
                <button className={s.secondary} onClick={() => setQuery("")}>Show all teams</button>
              </div>
            )}
          </div>

          <div className={s.departmentsSelectionBar}>
            <div className={s.selectionCount} aria-live="polite">
              <strong>{open ? selected.length : "—"}</strong>
              <span><b>{open ? `of ${remaining} teams selected` : "Recruitment closed"}</b><small>{open ? "Choose the teams you want to apply to." : "The directory remains open for exploration."}</small></span>
            </div>
            <div className={s.selectionSlots} aria-label="Selected teams">
              {Array.from({ length: remaining }, (_, index) => (
                <span key={index} data-filled={Boolean(selectedNames[index])}>{selectedNames[index] || `Team ${index + 1}`}</span>
              ))}
            </div>
            {open ? selected.length && !isLoadingSubmissions && !submissionsError ? (
              <Link className={s.primary} href={`/join/${selected.join("/")}`}>Continue <ArrowOutward size={19} /></Link>
            ) : (
              <button className={s.primary} disabled>{isLoadingSubmissions ? "Checking applications…" : "Select a team to continue"}</button>
            ) : (
              <Link href="/" className={s.secondary}>Back to home</Link>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
