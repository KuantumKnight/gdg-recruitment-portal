import { describe, expect, it } from "vitest";
import {
  INSTITUTIONAL_DOMAIN,
  isInstitutionalEmail,
  isVerifiedInstitutionalUser,
} from "../lib/auth-policy";
import { safeCallbackURL } from "../lib/auth-redirect";
import { getAuthBaseURL } from "../lib/auth-config";

describe("auth policy", () => {
  it("accepts only the VIT student Google domain", () => {
    expect(INSTITUTIONAL_DOMAIN).toBe("vitstudent.ac.in");
    expect(isInstitutionalEmail("student@vitstudent.ac.in")).toBe(true);
    expect(isInstitutionalEmail("student@vit.ac.in")).toBe(false);
    expect(isInstitutionalEmail("student@gmail.com")).toBe(false);
    expect(isInstitutionalEmail("student@vitstudent.ac.in.attacker.test")).toBe(false);
  });

  it("requires the institutional email to be verified", () => {
    expect(
      isVerifiedInstitutionalUser({
        email: "student@vitstudent.ac.in",
        emailVerified: true,
      }),
    ).toBe(true);
    expect(
      isVerifiedInstitutionalUser({
        email: "student@vitstudent.ac.in",
        emailVerified: false,
      }),
    ).toBe(false);
    expect(
      isVerifiedInstitutionalUser({
        email: "student@gmail.com",
        emailVerified: true,
      }),
    ).toBe(false);
  });

  it("keeps callback navigation on the same origin", () => {
    expect(safeCallbackURL("/join/web-dev")).toBe("/join/web-dev");
    expect(safeCallbackURL("https://attacker.test")).toBe("/");
    expect(safeCallbackURL("//attacker.test")).toBe("/");
  });

  it("never falls back to localhost for a production deployment", () => {
    expect(getAuthBaseURL({ NODE_ENV: "production" })).toBe(
      "https://gdg-recruitment-portal-omega.vercel.app",
    );
    expect(getAuthBaseURL({ BETTER_AUTH_URL: "https://example.test/" })).toBe(
      "https://example.test",
    );
    expect(getAuthBaseURL({ NODE_ENV: "development" })).toBe("http://localhost:3000");
  });
});
