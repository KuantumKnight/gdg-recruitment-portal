"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowUpRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getDepartment } from "@/lib/catalog";
import {
  applicationDraftKey,
  readApplicationDraft,
} from "@/lib/application-draft";
import { isRecruitmentOpen, MAX_APPLICATIONS } from "@/lib/recruitment";
import {
  buildSubmissionPayload,
  createApplicationSchema,
  MAX_ANSWER_LENGTH,
} from "@/lib/validation/application";
import { useSubmissions } from "./SubmissionsProvider";
import s from "./Recruitment.module.css";

export default function FormComp({ dept1, dept2 }) {
  const { data: session, isPending } = authClient.useSession();
  const chosen = [dept1, dept2]
    .filter(Boolean)
    .map((d) => getDepartment(typeof d === "string" ? d : d.id))
    .filter(Boolean);
  if (!isRecruitmentOpen()) return <ClosedApplications />;
  if (isPending)
    return (
      <div className={s.shell} role="status">
        Getting your application ready…
      </div>
    );
  if (!session?.user)
    return (
      <div className={s.shell}>
        <p className={s.kicker}>Your next chapter</p>
        <h1 className={s.title}>
          First, say <em>hello.</em>
        </h1>
        <p className={s.description}>
          Sign in to save your application and join a team of curious builders.
        </p>
        <Link
          className={s.primary}
          href={`/auth/signin?callbackURL=${encodeURIComponent(`/join/${chosen.map((d) => d.id).join("/")}`)}`}
        >
          Sign in to continue <ArrowUpRight size={16} />
        </Link>
      </div>
    );
  return (
    <Application
      key={`${session.user.id}:${chosen.map((d) => d.id).join(":")}`}
      user={session.user}
      chosen={chosen}
    />
  );
}
function ClosedApplications() {
  return (
    <div className={s.shell}>
      <p className={s.kicker}>Recruitment update</p>
      <h1 className={s.title}>
        This chapter is <em>closed.</em>
      </h1>
      <p className={s.description}>
        Applications for this recruitment round have ended. Explore our
        departments and find where your curiosity could take you next.
      </p>
      <Link className={s.primary} href="/departments">
        Explore departments <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}
function Application({ user, chosen }) {
  const {
    submittedDepartments,
    isLoadingSubmissions,
    submissionsError,
    refreshSubmissions,
    markDepartmentsSubmitted,
  } = useSubmissions();
  const [values, setValues] = useState({
    Name: user.name || "",
    RegistrationNumber: "",
    Phone: "",
    Gender: "",
    "Year of Study": "",
    motivation: "",
    answers: {},
  });
  const [ready, setReady] = useState(false);
  const [draftStatus, setDraftStatus] = useState("Loading saved answers…");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const draftSuppressed = useRef(false);
  const initialAnswerIds = useRef(
    chosen.flatMap((d) => d.questions.map((q) => `${d.id}:${q.id}`)),
  );
  const draftKey = applicationDraftKey(
    user.id || user.email,
    chosen.map((d) => d.id),
  );
  useEffect(() => {
    try {
      const saved = readApplicationDraft(
        localStorage.getItem(draftKey),
        initialAnswerIds.current,
      );
      if (saved) setValues((v) => ({ ...v, ...saved }));
      setDraftStatus("Draft saved on this device");
    } catch {
      setDraftStatus("Device storage unavailable. Keep this tab open.");
    }
    setReady(true);
  }, [draftKey]);
  useEffect(() => {
    if (!ready || draftSuppressed.current) return;
    const timer = setTimeout(() => {
      if (draftSuppressed.current) return;
      try {
        localStorage.setItem(draftKey, JSON.stringify({ values }));
        setDraftStatus("Draft saved on this device");
      } catch {
        setDraftStatus("Device storage unavailable. Keep this tab open.");
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [values, ready, draftKey]);
  const pending = chosen.filter((d) => !submittedDepartments.includes(d.name));
  const required = [
    "Name",
    "RegistrationNumber",
    "Phone",
    "motivation",
    ...pending.flatMap((d) =>
      d.questions
        .filter((q) => q.required !== false)
        .map((q) => `${d.id}:${q.id}`),
    ),
  ];
  const read = (key) =>
    key.includes(":") ? values.answers[key] || "" : values[key] || "";
  const completed = required.filter((key) => read(key).trim()).length;
  const update = (key, value) => {
    draftSuppressed.current = false;
    setValues((v) =>
      key.includes(":")
        ? { ...v, answers: { ...v.answers, [key]: value } }
        : { ...v, [key]: value },
    );
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const field = (key, label, options = {}) => (
    <div className={s.field} key={key}>
      <label className={s.label} htmlFor={key}>
        {label}
        {options.optional ? (
          <small>Optional</small>
        ) : (
          <span aria-hidden="true"> *</span>
        )}
      </label>
      {options.options ? (
        <select
          id={key}
          className={s.input}
          value={read(key)}
          onChange={(e) => update(key, e.target.value)}
        >
          <option value="">Choose an option</option>
          {options.options.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      ) : options.long ? (
        <textarea
          id={key}
          className={s.input}
          rows={4}
          maxLength={MAX_ANSWER_LENGTH}
          value={read(key)}
          onChange={(e) => update(key, e.target.value)}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `${key}-error` : undefined}
          required={!options.optional}
          placeholder={
            options.placeholder ||
            "Your perspective matters. A few thoughtful sentences are enough."
          }
        />
      ) : (
        <input
          id={key}
          className={s.input}
          value={read(key)}
          onChange={(e) => update(key, e.target.value)}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `${key}-error` : undefined}
          required={!options.optional}
          maxLength={options.maxLength || 120}
          {...options.input}
          placeholder={options.placeholder}
        />
      )}{" "}
      {errors[key] && (
        <p id={`${key}-error`} className={s.fieldError}>
          {errors[key]}
        </p>
      )}
    </div>
  );
  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    const nextErrors = {};
    const payloads = pending.map((d) => {
      const payload = buildSubmissionPayload(
        d,
        { ...values, Email: user.email },
        String(chosen.indexOf(d) + 1),
      );
      const parsed = createApplicationSchema(d).safeParse(payload);
      if (!parsed.success)
        for (const issue of parsed.error.issues) {
          const key =
            issue.path[0] === "Questions"
              ? d.questions.find((q) => q.name === issue.path[1])
                ? `${d.id}:${d.questions.find((q) => q.name === issue.path[1]).id}`
                : "motivation"
              : issue.path[0];
          nextErrors[key] = issue.message;
        }
      return payload;
    });
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setMessage("Please check the highlighted answers.");
      requestAnimationFrame(() =>
        document.getElementById(Object.keys(nextErrors)[0])?.focus(),
      );
      return;
    }
    lock.current = true;
    setBusy(true);
    setMessage("");
    const successful = [];
    const failures = [];
    // Serialize requests so preference order is deterministic and partial success can be retried.
    for (let i = 0; i < pending.length; i++) {
      try {
        const response = await fetch("/api/submit-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloads[i]),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(result.message || "Please try again.");
        successful.push(pending[i].name);
        markDepartmentsSubmitted([pending[i].name]);
      } catch (error) {
        failures.push(`${pending[i].displayName}: ${error.message}`);
      }
    }
    if (failures.length)
      setMessage(
        `${successful.length ? "Your successful application is saved. " : ""}${failures.join(" ")} Your answers are kept; retry sends only remaining applications.`,
      );
    else {
      draftSuppressed.current = true;
      try {
        localStorage.removeItem(draftKey);
      } catch {}
    }
    setBusy(false);
    lock.current = false;
  }
  if (!isRecruitmentOpen()) return <ClosedApplications />;
  if (!ready || isLoadingSubmissions)
    return (
      <div className={s.shell} role="status">
        Checking your application status…
      </div>
    );
  if (!pending.length)
    return (
      <div className={s.shell}>
        <div className={s.success}>
          <CheckCircle2 size={56} />
          <h1>You’re on the list.</h1>
          <p>
            Your application{chosen.length > 1 ? "s are" : " is"} saved for{" "}
            {chosen.map((d) => d.displayName).join(" and ")}. Thank you for
            sharing what makes you, you.
          </p>
          <Link href="/departments" className={s.primary}>
            Back to departments
          </Link>
        </div>
      </div>
    );
  return (
    <div className={s.shell}>
      <nav className={s.steps} aria-label="Application progress">
        <Link href="/departments">01 · Choose your team</Link>
        <span aria-current="step">02 · Tell your story</span>
        <span>03 · Make it happen</span>
      </nav>
      <p className={s.kicker}>A little about you</p>
      <h1 className={s.title}>
        Big ideas start
        <br />
        with <em>your story.</em>
      </h1>
      <p className={s.description}>
        You don’t need to know everything. Show us your curiosity, your
        perspective, and what you’re excited to build.
      </p>
      {submissionsError && (
        <div className={`${s.notice} ${s.error}`} role="alert">
          {submissionsError}
          <button className={s.secondary} onClick={refreshSubmissions}>
            Retry status
          </button>
        </div>
      )}
      {message && (
        <div className={`${s.notice} ${s.error}`} role="alert">
          {message}
        </div>
      )}
      <div className={s.formLayout}>
        <form onSubmit={submit} noValidate>
          <fieldset
            disabled={busy || !!submissionsError}
            style={{ border: 0, padding: 0, minWidth: 0 }}
          >
            <section className={s.formSection}>
              <h2 className={s.sectionTitle}>
                <span>01</span>The essentials
              </h2>
              <p className={s.sectionNote}>
                Fields marked * are required. Your email comes from your
                signed-in account.
              </p>
              <div className={s.fieldGrid}>
                {field("Name", "Full name", {
                  input: { autoComplete: "name" },
                })}
                {field("RegistrationNumber", "Registration number", {
                  placeholder: "25BCE5612",
                  maxLength: 9,
                })}
                {field("Phone", "WhatsApp phone number", {
                  placeholder: "9876543210",
                  maxLength: 15,
                  input: { type: "tel", autoComplete: "tel", inputMode: "tel" },
                })}
                <div className={s.field}>
                  <label htmlFor="account-email" className={s.label}>
                    Email address
                  </label>
                  <input
                    id="account-email"
                    className={s.input}
                    value={user.email}
                    readOnly
                    type="email"
                  />
                </div>
                {field("Gender", "Gender", {
                  optional: true,
                  options: ["Male", "Female", "Other", "Prefer not to say"],
                })}
                {field("Year of Study", "Year of study", {
                  optional: true,
                  options: ["1", "2", "3", "4", "5"],
                })}
              </div>
              {field(
                "motivation",
                "What makes you want to join GDG on Campus?",
                { long: true },
              )}
            </section>
            {pending.map((d, index) => (
              <section className={s.formSection} key={d.id}>
                <h2 className={s.sectionTitle}>
                  <span>0{index + 2}</span>
                  {d.displayName}
                </h2>
                <p className={s.sectionNote}>
                  Tell us how you think. Honest answers beat perfect ones.
                </p>
                {d.questions.map((q) =>
                  field(`${d.id}:${q.id}`, q.label, {
                    long: q.type !== "short-text",
                    optional: q.required === false,
                    placeholder: q.placeholder,
                    maxLength: MAX_ANSWER_LENGTH,
                  }),
                )}
              </section>
            ))}
            <div className={s.submit}>
              <p>
                Your answers are shared with the recruitment team. You can apply
                to up to two departments.
              </p>
              <button
                className={s.primary}
                type="submit"
                disabled={
                  busy ||
                  !!submissionsError ||
                  submittedDepartments.length + pending.length >
                    MAX_APPLICATIONS
                }
              >
                {busy
                  ? "Saving your story…"
                  : `Submit ${pending.length > 1 ? "applications" : "application"}`}
                <ArrowUpRight size={17} />
              </button>
            </div>
          </fieldset>
        </form>
        <aside className={s.aside}>
          <h2>Your next chapter</h2>
          {chosen.map((d) => (
            <div className={s.chip} key={d.id}>
              <i />
              {d.displayName}
              {submittedDepartments.includes(d.name) && " · Saved"}
            </div>
          ))}
          <div className={s.progressLabel}>
            <span>Required answers</span>
            <span>
              {completed}/{required.length}
            </span>
          </div>
          <progress
            className={s.progress}
            value={completed}
            max={required.length}
            aria-label="Required answers completed"
          />
          <p className={s.draft}>
            <ShieldCheck size={15} />
            {draftStatus}
          </p>
          <button
            type="button"
            className={s.secondary}
            onClick={() => {
              draftSuppressed.current = true;
              try {
                localStorage.removeItem(draftKey);
              } catch {}
              setDraftStatus(
                "Saved copy removed. Further edits save a new draft.",
              );
            }}
          >
            Remove saved copy
          </button>
          <div className={s.tips}>
            <h3>Be yourself. Seriously.</h3>
            <p>
              Side projects, experiments, lessons from failure — we’d love to
              hear about them. Beginners belong here too.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
