"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Code2,
  Search,
  Sparkles,
  UsersRound,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { departments } from "@/lib/catalog";
import { MAX_APPLICATIONS, isRecruitmentOpen } from "@/lib/recruitment";
import { useSubmissions } from "@/components/SubmissionsProvider";
import s from "@/components/Recruitment.module.css";
export default function DepartmentsPage() {
  const [selection, setSelection] = useState([]);
  const [category, setCategory] = useState("All teams");
  const [query, setQuery] = useState("");
  const {
    submittedDepartments,
    isLoadingSubmissions,
    submissionsError,
    refreshSubmissions,
  } = useSubmissions();
  const remaining = Math.max(0, MAX_APPLICATIONS - submittedDepartments.length);
  const selected = selection
    .filter(
      (id) =>
        !submittedDepartments.includes(
          departments.find((d) => d.id === id)?.name,
        ),
    )
    .slice(0, remaining);
  const filtered = departments.filter(
    (d) =>
      (category === "All teams" || d.category === category) &&
      `${d.displayName} ${d.description}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const open = isRecruitmentOpen();
  function toggle(id) {
    setSelection((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : selected.length < remaining
          ? [...selected, id]
          : current,
    );
  }
  return (
    <>
      <NavBar />
      <main id="main-content" className={s.shell}>
        <nav className={s.steps} aria-label="Application progress">
          <span aria-current="step">
            <b>1</b>Choose your team
          </span>
          <span>
            <b>2</b>Tell your story
          </span>
          <span>
            <b>3</b>Make it happen
          </span>
        </nav>
        <p className={s.kicker}>Different skills. Shared curiosity.</p>
        <h1 className={s.title}>
          Find your people.
          <br />
          <em>Build your thing.</em>
        </h1>
        <p className={s.description}>
          From your first line of code to your next big idea, there’s a team for
          you here. Explore our departments and choose up to two that feel like
          you.
        </p>
        {!open && (
          <p className={s.notice}>
            This recruitment round has closed. You can still explore every team
            and discover where you belong.
          </p>
        )}
        {submissionsError && (
          <div className={`${s.notice} ${s.error}`} role="alert">
            {submissionsError}
            <button className={s.secondary} onClick={refreshSubmissions}>
              Try again
            </button>
          </div>
        )}
        {submittedDepartments.length > 0 && (
          <p className={s.notice}>
            You have {submittedDepartments.length} saved application
            {submittedDepartments.length > 1 ? "s" : ""}.{" "}
            {remaining
              ? `You can apply to ${remaining} more team.`
              : "You’ve used both application slots."}
          </p>
        )}
        <div className={s.toolbar}>
          <div className={s.tabs} aria-label="Filter teams">
            {["All teams", "Technical", "Creative & community"].map((tab) => (
              <button
                key={tab}
                className={s.tab}
                aria-pressed={category === tab}
                onClick={() => setCategory(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <label className={s.search}>
            <Search size={17} aria-hidden="true" />
            <input
              aria-label="Search teams"
              placeholder="Find your team…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <p className={s.hint} aria-live="polite">
          {filtered.length} teams to explore
        </p>
        <div className={s.grid}>
          {filtered.map((d) => {
            const checked = selected.includes(d.id);
            const saved = submittedDepartments.includes(d.name);
            const disabled =
              saved ||
              (!checked && selected.length >= remaining) ||
              isLoadingSubmissions ||
              !!submissionsError ||
              !open;
            const Icon = d.category === "Technical" ? Code2 : UsersRound;
            return (
              <label
                key={d.id}
                className={s.card}
                data-selected={checked}
                data-disabled={saved || (open && disabled)}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(d.id)}
                  aria-label={`Select ${d.displayName}`}
                />
                <div className={s.cardTop}>
                  <span className={s.icon} style={{ color: d.color }}>
                    <Icon size={22} />
                  </span>
                  <span className={s.check} aria-hidden="true">
                    {(checked || saved) && <Check size={14} />}
                  </span>
                </div>
                <h2 style={{ fontSize: 21, marginBottom: 12 }}>
                  {d.displayName}
                </h2>
                <p>{d.description}</p>
                <div className={s.cardMeta}>
                  <span>{d.category}</span>
                  <span>
                    {saved ? "Applied" : `${d.questions.length} questions`}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
        {!filtered.length && (
          <div className={s.empty}>
            <Sparkles size={24} style={{ margin: "0 auto 15px" }} />
            <p>No teams match “{query}”. Try another search.</p>
            <button
              className={s.secondary}
              onClick={() => {
                setQuery("");
                setCategory("All teams");
              }}
            >
              Show all teams
            </button>
          </div>
        )}
        <div className={s.selectionBar}>
          <div aria-live="polite">
            <h2>
              {open
                ? `${selected.length} of ${remaining} available teams selected`
                : "Curiosity doesn’t have a deadline."}
            </h2>
            <p>
              {selected.length
                ? selected
                    .map(
                      (id) => departments.find((d) => d.id === id).displayName,
                    )
                    .join(" + ")
                : open
                  ? "Choose the teams you’re excited to grow with."
                  : "Explore today. Build with us in the next chapter."}
            </p>
          </div>
          {open ? (
            selected.length && !isLoadingSubmissions && !submissionsError ? (
              <Link className={s.primary} href={`/join/${selected.join("/")}`}>
                Continue to application <ArrowUpRight size={17} />
              </Link>
            ) : (
              <button className={s.primary} disabled>
                {isLoadingSubmissions
                  ? "Checking applications…"
                  : "Select a team to continue"}
              </button>
            )
          ) : (
            <Link href="/" className={s.primary}>
              Back to the community <ArrowUpRight size={17} />
            </Link>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
