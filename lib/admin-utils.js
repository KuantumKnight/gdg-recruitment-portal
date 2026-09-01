import { getDepartment } from "./catalog.js";

export function departmentLabel(value) {
  return getDepartment(value)?.displayName || value || "Unknown department";
}

export function applicantQuestions(applicant) {
  const department = getDepartment(applicant?.Department);
  return questionEntries(applicant?.Questions).map(([question, answer]) => [
    department?.questions.find(
      (item) => item.name === question || item.id === question,
    )?.label || question,
    answer,
  ]);
}

export function applicantId(applicant) {
  return applicant.id || applicant._id;
}

export function questionEntries(questions) {
  if (!questions) return [];
  if (Array.isArray(questions))
    return questions.flatMap((entry, index) => {
      if (Array.isArray(entry))
        return [
          [String(entry[0] ?? `Question ${index + 1}`), String(entry[1] ?? "")],
        ];
      if (entry && typeof entry === "object") {
        if ("question" in entry)
          return [[String(entry.question), String(entry.answer ?? "")]];
        return Object.entries(entry).map(([key, value]) => [
          key,
          String(value ?? ""),
        ]);
      }
      return [[`Response ${index + 1}`, String(entry ?? "")]];
    });
  if (typeof questions === "object")
    return Object.entries(questions).map(([key, value]) => [
      key,
      String(value ?? ""),
    ]);
  return [["Response", String(questions)]];
}

// CSV quoting handles separators/newlines; prefix formula-like cells for spreadsheet safety.
export function csvCell(value) {
  let text = String(value ?? "");
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text))
    text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function applicantsToCsv(applicants) {
  const headers = [
    "Name",
    "RegistrationNumber",
    "Email",
    "Phone",
    "Department",
    "Pref",
    "shortlisted",
    "Questions",
  ];
  return (
    "\uFEFF" +
    [
      headers,
      ...applicants.map((item) =>
        headers.map((key) =>
          key === "Questions"
            ? applicantQuestions(item)
                .map(([q, a]) => `${q}: ${a}`)
                .join(" | ")
            : key === "Department"
              ? departmentLabel(item.Department)
              : item[key],
        ),
      ),
    ]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n")
  );
}
