import { describe, expect, it } from "vitest";
import {
  applicantId,
  applicantQuestions,
  departmentLabel,
  applicantsToCsv,
  csvCell,
  questionEntries,
} from "../lib/admin-utils";

import { getDepartment } from "../lib/catalog";

describe("admin response compatibility", () => {
  it("shows readable labels without changing preserved storage identifiers", () => {
    const department = getDepartment("Management");
    const applicant = {
      Department: department.name,
      Questions: { [department.questions[0].name]: "My original answer" },
    };
    expect(departmentLabel(applicant.Department)).toBe("Management");
    expect(applicantQuestions(applicant)).toEqual([
      [department.questions[0].label, "My original answer"],
    ]);
    expect(applicant.Department).toBe(department.name);
    expect(applicantsToCsv([applicant])).toContain("Management");
    expect(applicantsToCsv([applicant])).not.toContain(department.name);
  });
  it("uses the canonical database ID, with a legacy fallback", () => {
    expect(applicantId({ id: "canonical", _id: "legacy" })).toBe("canonical");
    expect(applicantId({ _id: "legacy" })).toBe("legacy");
  });
  it("renders the current map format and historical response formats", () => {
    expect(questionEntries({ "Why GDG?": "To build" })).toEqual([
      ["Why GDG?", "To build"],
    ]);
    expect(questionEntries([["Why GDG?", "To learn"]])).toEqual([
      ["Why GDG?", "To learn"],
    ]);
    expect(
      questionEntries([{ question: "Why GDG?", answer: "To collaborate" }]),
    ).toEqual([["Why GDG?", "To collaborate"]]);
    expect(questionEntries(["A legacy answer"])).toEqual([
      ["Response 1", "A legacy answer"],
    ]);
    expect(questionEntries(null)).toEqual([]);
  });
  it("keeps valid false and zero responses", () => {
    expect(questionEntries({ Experience: 0, Available: false })).toEqual([
      ["Experience", "0"],
      ["Available", "false"],
    ]);
  });
});

describe("spreadsheet-safe CSV export", () => {
  it.each([
    "=SUM(A1:A2)",
    "+123",
    "-1+2",
    "@SUM(1)",
    " \t=1",
    "\nhello",
    "\rhello",
    "\thello",
  ])("neutralises spreadsheet interpretation for %j", (value) => {
    expect(csvCell(value)).toBe(`"'${value}"`);
  });
  it("quotes delimiters, literal quotes and multiline responses", () => {
    expect(csvCell('Hello, "builder"\nWelcome')).toBe(
      '"Hello, ""builder""\nWelcome"',
    );
  });
  it("exports only public applicant columns and readable response content", () => {
    const csv = applicantsToCsv([
      {
        Name: "Zoë",
        Email: "zoe@example.test",
        shortlisted: true,
        Questions: { "Why GDG?": "To build" },
        userId: "private-internal-id",
      },
    ]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Zoë"');
    expect(csv).toContain('"Why GDG?: To build"');
    expect(csv).toContain('"true"');
    expect(csv).not.toContain("private-internal-id");
  });
});
