import { describe, expect, it } from "vitest";
import { isInstitutionalEmail } from "../lib/auth-policy";
import { safeCallbackURL } from "../lib/auth-redirect";

describe("auth policy", () => {
  it("accepts configured institutional domains only", () => {
    expect(isInstitutionalEmail("student@vitstudent.ac.in")).toBe(true);
    expect(isInstitutionalEmail("student@example.com")).toBe(false);
    expect(isInstitutionalEmail("student@vitstudent.ac.in.attacker.test")).toBe(false);
  });

  it("keeps callback navigation on the same origin", () => {
    expect(safeCallbackURL("/join/web-dev")).toBe("/join/web-dev");
    expect(safeCallbackURL("https://attacker.test")).toBe("/");
    expect(safeCallbackURL("//attacker.test")).toBe("/");
  });
});
