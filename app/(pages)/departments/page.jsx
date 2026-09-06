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
const cardColors = ["#4285F4", "#34A853", "#EA4335", "#FBBC04"];
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
  const {
    submittedDepartments,
    isLoadingSubmissions,
    submissionsError,
    refreshSubmissions,
  } = useSubmissions();
  const remaining = Math.max(0, MAX_APPLICATIONS - submittedDepartments.length);
  const open = isRecruitmentOpen();
  const selected = selection
    .filter(
      (id) =>
        !submittedDepartments.includes(
          departments.find((department) => department.id === id)?.name,
        ),
    )
    .slice(0, remaining);
  const term = query.trim().toLowerCase();
  const matches = (department) =>
    `${department.displayName} ${department.description}`.toLowerCase().includes(term);
  const technical = orderDepartments(
    departments.filter((department) => department.category === "Technical" && matches(department)),
    technicalOrder,
  );
  const community = orderDepartments(
    departments.filter((department) => department.category !== "Technical" && matches(department)),
    communityOrder,
  );

  function toggle(id) {
    setSelection((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : selected.length < remaining
          ? [...selected, id]
          : current,
    );
  }

  function renderCard(department, index) {
    const checked = selected.includes(department.id);
    const saved = submittedDepartments.includes(department.name);
    const disabled =
      saved ||
      (!checked && selected.length >= remaining) ||
      isLoadingSubmissions ||
      Boolean(submissionsError) ||
      !open;
    const title = titleFor[department.displayName] || department.displayName;
    const iconPath = `/assets/images/icons/${iconFor[department.displayName] || "web-dev"}.svg`;
    const color = cardColors[index % cardColors.length];

    return (
      <label
        key={department.id}
        className={s.departmentsCard}
        data-selected={checked}
        data-disabled={saved || (open && disabled)}
        style={{ "--accent": color }}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={() => toggle(department.id)}
          aria-label={`Select ${title}`}
        />
        <Image
          src={iconPath}
          alt=""
          width={58}
          height={58}
          className={s.departmentArt}
          aria-hidden="true"
        />
        <div className={s.departmentCardBody}>
          <div className={s.departmentCardHeader}>
            <span className={s.departmentIndex}>{String(index + 1).padStart(2, "0")}</span>
            <span className={s.departmentCheck} aria-hidden="true">
              {(checked || saved) && <Check size={14} />}
            </span>
          </div>
          <h3>{title}</h3>
          <p>{department.description}</p>
          <div className={s.departmentMeta}>
            <span>{saved ? "Applied" : department.category === "Technical" ? "Technical" : "Community"}</span>
            <span>{department.questions.length} questions</span>
          </div>
        </div>
      </label>
    );
  }

  return (
    <>
      <NavBar />
      <main id="main-content" className={s.departmentsPage}>
        <div className={s.departmentsContent}>
          <div className={s.departmentsIntro}>
            <p className={s.kicker}>Teams at GDG on Campus</p>
            <h1>Choose the work you want to get better at.</h1>
            <p>
              Browse every department, understand what it focuses on, and choose up to two teams when recruitment is open.
            </p>
          </div>

          <div className={s.departmentsToolbar}>
            <div className={s.departmentCount}>{technical.length + community.length} teams</div>
            <label className={s.departmentsSearch}>
              <Search size={17} aria-hidden="true" />
              <input
                aria-label="Search departments"
                placeholder="Search teams"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>

          {!open && (
            <p className={s.notice}>
              This recruitment round has closed. You can still explore every team and prepare for the next intake.
            </p>
          )}

          {submissionsError && (
            <div className={`${s.notice} ${s.error}`} role="alert">
              <span>{submissionsError}</span>
              <button className={s.secondary} onClick={refreshSubmissions}>Try again</button>
            </div>
          )}

          {submittedDepartments.length > 0 && (
            <p className={s.notice}>
              You have {submittedDepartments.length} saved application{submittedDepartments.length > 1 ? "s" : ""}. {remaining ? `You can apply to ${remaining} more team.` : "You’ve used both application slots."}
            </p>
          )}

          <section aria-labelledby="technical-heading">
            <h2 id="technical-heading" className={s.departmentsHeading}>Technical Departments</h2>
            <div className={s.departmentsGrid}>{technical.map(renderCard)}</div>
          </section>

          <section aria-labelledby="community-heading">
            <h2 id="community-heading" className={s.departmentsHeading}>Non-Technical Departments</h2>
            <div className={s.departmentsGrid}>{community.map(renderCard)}</div>
          </section>

          {!technical.length && !community.length && (
            <div className={s.empty}>
              <Sparkles size={24} style={{ margin: "0 auto 15px", color: "#1a73e8" }} />
              <p>No teams match “{query}”.</p>
              <button className={s.secondary} onClick={() => setQuery("")}>Show all teams</button>
            </div>
          )}

          <div className={s.departmentsSelectionBar}>
            <div aria-live="polite">
              <h2>{open ? `${selected.length} of ${remaining} available teams selected` : "Recruitment is currently closed"}</h2>
              <p>
                {selected.length
                  ? selected.map((id) => departments.find((department) => department.id === id)?.displayName).filter(Boolean).join(" + ")
                  : open
                    ? "Select the teams you want to apply to."
                    : "Explore the teams now and return when the next round opens."}
              </p>
            </div>
            {open ? (
              selected.length && !isLoadingSubmissions && !submissionsError ? (
                <Link className={s.primary} href={`/join/${selected.join("/")}`}>
                  Continue to application <ArrowUpRight size={17} />
                </Link>
              ) : (
                <button className={s.primary} disabled>
                  {isLoadingSubmissions ? "Checking applications…" : "Select a team to continue"}
                </button>
              )
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
